import { Request } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    payload: string | jwt.JwtPayload;
}
