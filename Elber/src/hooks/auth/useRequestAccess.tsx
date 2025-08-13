import { useState } from "react";

const useRequestAccess = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const cleanTexts = () => {
        setError('');
        setMessage('');
    }

    return {
        email,
        setEmail,
        error,
        setError,
        message,
        setMessage,
        isProcessing,
        setIsProcessing,
        cleanTexts
    };
}

export default useRequestAccess;