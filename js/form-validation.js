function validatePRN(prn) {
    return /^PRN\d{7}$/.test(prn);
}

function validateMobile(mobile) {
    return /^[0-9]{10}$/.test(mobile);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
} 