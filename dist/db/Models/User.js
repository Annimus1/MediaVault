import { Schema, model } from "mongoose";
export const userSchema = new Schema({
    user: {
        type: 'String',
        unique: true
    },
    email: {
        type: 'String',
        unique: true
    },
    password: {
        type: 'String',
        unique: false
    }
}, { versionKey: false });
export const UserSchema = model('User', userSchema);
