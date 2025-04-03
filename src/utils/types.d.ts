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

export type UserDTO = Omit<User, password, email>

export interface Media {
    id: string,
    owner: UserDTO,
    name: string,
    completedDate: Date,
    score: Number,
    comment?: string,
    poster: string,
    mediaType: mediaType,
    language: Language,
}
export type MediaSchema = Omit<Media, id>

export interface IAuthToken extends Document {
  owner: Types.ObjectId;  // Referencia al usuario
  token: string;          // Token JWT
  createdAt: Date;        // Fecha de creación (auto)
  expiresAt: Date;        // Fecha de expiración
}