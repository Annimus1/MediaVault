import { Language, mediaType } from "./enums.js"

export type User = {
  user: string,
  email: string,
  password: string
}

export type UserLogin = {
  user: string,
  password: string
}

export interface responseMedia {
  results: {
    page: {
      totalPages: number,
      currentPage: number,
      nextPage: number,
      prevPage: number
    },
    data: Media[] | null
  }
}
export type UserDTO = Omit<User, password, email>

export interface Media {
  owner: string;
  name: string;
  completedDate: string;
  score: number;
  poster: string;
  mediaType: string;
  language: string;
  comment?: string;
}

export type MediaSchema = Omit<Media, id>

export interface IAuthToken extends Document {
  owner: Types.ObjectId;  // Referencia al usuario
  token: string;          // Token JWT
  createdAt: Date;        // Fecha de creación (auto)
  expiresAt: Date;        // Fecha de expiración
}

export interface Token {
  "user": {
    "user": string,
    "id": string
  };
  "iat": number;
  "exp": number;
}