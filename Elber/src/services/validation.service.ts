
export const validateMandatoryField = (value: string): boolean => {
    return value.trim().length > 0;
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};