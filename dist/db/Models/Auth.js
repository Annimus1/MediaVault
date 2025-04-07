import { Schema, model } from 'mongoose';
// Define Mongoose schema
const authTokenSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    versionKey: false
});
//Create index for automatic cleanup of expired tokens
authTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const AuthTokenModel = model('AuthToken', authTokenSchema);
