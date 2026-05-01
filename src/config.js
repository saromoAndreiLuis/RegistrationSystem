// Configuration for the Community Outreach Registration System
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvw6kIB0e_YFUGuVeSf9G67GRGUOHzRvVFSjF16SV4d2nxueVwJjMz8P5PfWiPKAJTUw/exec'; // v0.1.3 script
export const APP_VERSION = 'v0.1.3';

// SECURITY CONFIGURATION
export const API_KEY = 'TGLFI-SECURE-KEY-2026';
export const ADMIN_PIN = '2026'; // Change this to your preferred admin password/PIN

// DEV MODE SETTINGS
// Set to 'false' before deploying for Beta Test
export const IS_DEV_MODE = false;

// SERVICE DEFINITIONS
export const SERVICE_PROGRAMS = ['CWOP', 'Blood Letting', 'Blood Extraction', 'General Registration'];

export const getProgramTypes = (service) => {
    switch (service) {
        case 'CWOP': return ['Medical', 'Dental', 'Optical', 'Cervical', 'Breast Cancer Screening', 'Laboratory', 'Hairstyle', 'Physical Therapy', 'OB-GYN', 'PEDIA', 'DERMA'];
        case 'Blood Letting': return ['Donor'];
        default: return [];
    }
};

export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
