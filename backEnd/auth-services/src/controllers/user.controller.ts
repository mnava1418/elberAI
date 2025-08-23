import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const signUp = async (req: Request, res: Response) => {
    try {
        const { email, password, displayName } = req.body;
        const result = await userService.signUp(email, password, displayName)        
        res.status(200).json(result);
    } catch (error: any) {        
        res.status(500).json({ error: error.message });
    }
};
