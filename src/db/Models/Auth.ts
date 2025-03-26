import { Schema, model } from 'mongoose';
import { IAuthToken } from '../../utils/types';


// 2. Definir el esquema Mongoose
const authTokenSchema = new Schema<IAuthToken>({
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

export const AuthTokenModel = model<IAuthToken>('AuthToken', authTokenSchema);