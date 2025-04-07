import { Schema, model } from "mongoose";
import { Language, MediaType } from "../../utils/enums.js";
const mediaSchema = new Schema({
    owner: { type: Object, required: true },
    name: { type: String, required: true, unique: false },
    completedDate: { type: Date, required: true },
    score: { type: Number, min: 0, max: 10 },
    comment: { type: String, required: false },
    poster: { type: String, required: true },
    mediaType: {
        type: String,
        required: true,
        enum: MediaType
    },
    language: {
        type: String,
        required: true,
        enum: Language
    }
});
export const MediaModel = model('Media', mediaSchema);
