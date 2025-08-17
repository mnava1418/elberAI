import { useState } from "react"

const useAccessCode = () => {
    const [accessCode, setAccessCode] = useState('')
    const [error, setError] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)

    return {
        accessCode, setAccessCode, 
        error, setError,
        isProcessing, setIsProcessing
    }
}

export default useAccessCode