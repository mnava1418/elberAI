import { Request } from 'express';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthenticationRequest extends Request {
    user?: DecodedIdToken;
}