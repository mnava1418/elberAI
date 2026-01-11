import jwt from 'jsonwebtoken';
import { auth, notification } from '../config/index.config';
import axios, { AxiosRequestConfig } from 'axios';

const sendEmail = async (endPoint: string, data: Record<string, any>) => {
    try {
        const token = jwt.sign({}, auth.internal as string);

        const config: AxiosRequestConfig = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        const res = await axios.post(`${notification.url}${endPoint}`, data, config )

        if(res.status != 200) {
            throw new Error('Unable to send email.')
        }

    } catch (error) {
        console.error(error)
    }
}

export default sendEmail