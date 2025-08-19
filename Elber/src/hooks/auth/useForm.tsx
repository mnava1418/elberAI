import { useState } from "react";

const useForm = () => {    
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const cleanTexts = () => {
        setError('');
        setMessage('');
    }

    return {        
        error, setError,
        message, setMessage,
        isProcessing, setIsProcessing,
        cleanTexts
    };
}

export default useForm;