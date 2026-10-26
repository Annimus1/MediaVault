import { Media } from "../types.js";
import { GeminiProvider } from "./Gemini.js";
import { IProvider } from "./Iprovider.js";

/**
 * Singleton class that manages the AI provider for media recommendations.
 * 
 * The `IaProvider` class ensures only one instance of the provider is used throughout the application.
 * It delegates recommendation logic to the underlying `IProvider` implementation (e.g., `GeminiProvider`).
 *
 * @example
 * import IaProvider from './IaProvider';
 * const recommendations = await IaProvider.getRecommendation(mediaList);
 */
class IaProvider {
    private static instance: IaProvider | null = null;
    private provider: IProvider;

    private constructor(provider: IProvider) {
        this.provider = provider;
    }

    public static getInstance(): IaProvider {
        if (!IaProvider.instance) {
            IaProvider.instance = new IaProvider(new GeminiProvider());
        }
        return IaProvider.instance;
    }

    public async getRecommendation(media: Media[] | null) {
        
        if(!media) return null;

        return this.provider.recommendation(media);
    }
}

export default IaProvider.getInstance();