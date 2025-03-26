import {Schema, model} from "mongoose";
import { Language, mediaType } from "../../utils/enums.js";
import { MediaSchema } from "../../utils/types.js";


const mediaSchema = new Schema<MediaSchema>({
    owner: { type: Object, required: true },
    name: { type: String, required: true },
    completedDate: { type: Date, required: true },
    score: { type: Number, min: 0, max: 10 },
    comment: String,
    poster: String,
    mediaType: { 
      type: String,
      required: true,
      enum: mediaType
    },
    language: {
      type: String,
      required: true,
      enum: Language
    }
  });

export const Media = model('Media', mediaSchema);

