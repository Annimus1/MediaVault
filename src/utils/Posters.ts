import axios from "axios";
import * as cheerio from 'cheerio';
import { Recommendation } from "./types.js";

const REQUEST_TIMEOUT_MS = 8000;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

export async function getPosters(media: Recommendation[]): Promise<Recommendation[]> {
    const promises = media.map(async (m): Promise<Recommendation> => {
        let posterUrl: string | null = null;

        try {
            if (m.mediaType === "movie") {
                posterUrl = await fetchPosterFromAPI(m.name, 'm');
            } else if (m.mediaType === "serie" || m.mediaType === "anime") {
                posterUrl = await fetchPosterFromAPI(m.name, 'tv');
            } else if (m.mediaType === "book") {
                posterUrl = await bookPoster(m.isbn);
            }
        } catch (error) {
            console.error(`Error resolving poster for ${m.name}:`, error);
        }

        return { ...m, poster: posterUrl };
    });

    return await Promise.all(promises);
}

async function fetchPosterFromAPI(title: string, mediaType: string): Promise<string | null> {
    const base_url = "https://www.rottentomatoes.com";

    // Limpieza: minúsculas, quitar caracteres especiales y cambiar espacios por _
    const name = formatTitleForRT(title);

    const url = `${base_url}/${mediaType}/${name}`;

    try {
        // Añadimos un User-Agent para evitar que Rotten Tomatoes nos bloquee como bot
        const response = await axios.get(url, {
            headers: {
                'User-Agent': USER_AGENT
            },
            timeout: REQUEST_TIMEOUT_MS
        });

        return parsePosterUrl(response.data);
    } catch (error: any) {
        // Si la URL falla (404), Rotten Tomatoes no tiene esa película con ese nombre exacto
        console.error(`Error 404 o red para ${title}:`, url);
        return null;
    }
}

function parsePosterUrl(html: string): string | null {
    try {
        const $ = cheerio.load(html);

        // OPCIÓN 1: Buscar en las meta tags (la más fiable en Rotten Tomatoes)
        const ogImage = $('meta[property="og:image"]').attr('content');
        const twitterImage = $('meta[name="twitter:image"]').attr('content');

        // OPCIÓN 2: Buscar en el JSON de datos estructurados (Schema.org)
        let jsonLdImage = null;
        const jsonLdRaw = $('script[type="application/ld+json"]').html();
        if (jsonLdRaw) {
            try {
                const data = JSON.parse(jsonLdRaw);
                jsonLdImage = data.image;
            } catch (e) { /* error de parseo sutil */ }
        }

        // Retornamos la primera que encontremos
        const finalUrl = ogImage || twitterImage || jsonLdImage || null;

        return finalUrl;

    } catch (error) {
        console.error('Error al parsear:', error);
        return null;
    }
}

function formatTitleForRT(title: string): string {
    return title
        .toLowerCase()
        .normalize("NFD")               // Elimina acentos (ej: á -> a)
        .replace(/[\u0300-\u036f]/g, "") 
        .replace(/[^\w\s]/gi, '')       // Elimina ":" "(" ")" "," etc.
        .replace(/\s+/g, '_');          // Cambia espacios (uno o más) por un solo "_"
}

async function bookPoster(isbn?: string): Promise<string | null> {
    if (!isbn) {
        return null;
    }

    // default=false makes Open Library return 404 instead of a placeholder cover.
    const url = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;

    try {
        const response = await axios.head(url, {
            headers: {
                'User-Agent': USER_AGENT
            },
            timeout: REQUEST_TIMEOUT_MS
        });

        const contentType = String(response.headers['content-type'] ?? '');

        return response.status === 200 && contentType.startsWith('image/') ? url : null;
    } catch (error) {
        console.error(`No cover found for ISBN ${isbn}`);
        return null;
    }
}
