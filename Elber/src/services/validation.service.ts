export const validateMandatoryField = (value: string): boolean => {
    return value.trim().length > 0;
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validateLength = (value: string, length: number): boolean => {
    return value.trim().length === length;
};

export const validateNumeric = (value: string): boolean => {
    const numericRegex = /^[0-9]+$/;
    return numericRegex.test(value);
};