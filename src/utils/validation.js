// Email validation with a regex
export const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
};

// Password validation using regex
export const validatePassword = (password) => {
    // Password must be at least 6 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{6,}$/;
    return passwordRegex.test(password);
};
