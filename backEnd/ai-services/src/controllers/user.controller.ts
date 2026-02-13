import { Request, Response } from "express";
import * as userService from '../services/user.service'

export const deleteProfile = async (req: Request, res: Response) => {
    try {
        const uid = req.headers['x-user-uid'] as string
        await userService.deleteProfile(uid)    
        res.status(200)
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        res.status(500).json({error: errorMessage})
    }
}