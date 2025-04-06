// Settings and Utility Functions

/**
 * Configuration object for application-wide settings
 */
const AppConfig = {
    // Application version
    version: '1.0.0',

    // Environment settings
    env: {
        development: true,
        production: false,
        staging: false
    },

    // Feature flags
    features: {
        darkMode: true,
        notifications: true,
        analyticsTracking: false
    },

    // API endpoints
    apiBaseUrl: {
        development: 'http://localhost:3000/api',
        production: 'https://api.yourapp.com',
        staging: 'https://staging-api.yourapp.com'
    },

    // Local storage keys
    storageKeys: {
        userPreferences: 'app_user_preferences',
        authToken: 'app_auth_token',
        darkMode: 'app_dark_mode_preference'
    }
};

/**
 * Utility functions for managing application settings
 */
const SettingsManager = {
    /**
     * Toggle dark mode
     * @returns {boolean} Current dark mode state
     */
    toggleDarkMode() {
        if (!AppConfig.features.darkMode) return false;

        const isDarkMode = !this.isDarkModeEnabled();
        localStorage.setItem(AppConfig.storageKeys.darkMode, JSON.stringify(isDarkMode));
        
        // Apply dark mode class to root element
        document.documentElement.classList.toggle('dark-mode', isDarkMode);

        // Optional: Dispatch custom event for dark mode change
        const event = new CustomEvent('darkModeChanged', { detail: { isDarkMode } });
        document.dispatchEvent(event);

        return isDarkMode;
    },

    /**
     * Check if dark mode is currently enabled
     * @returns {boolean} Dark mode state
     */
    isDarkModeEnabled() {
        // Check local storage first
        const storedPreference = localStorage.getItem(AppConfig.storageKeys.darkMode);
        if (storedPreference !== null) {
            return JSON.parse(storedPreference);
        }

        // Fallback to system preference
        return window.matchMedia && 
               window.matchMedia('(prefers-color-scheme: dark)').matches;
    },

    /**
     * Save user preferences to local storage
     * @param {Object} preferences - User preferences to save
     */
    saveUserPreferences(preferences) {
        try {
            const existingPreferences = this.getUserPreferences();
            const updatedPreferences = { ...existingPreferences, ...preferences };
            localStorage.setItem(
                AppConfig.storageKeys.userPreferences, 
                JSON.stringify(updatedPreferences)
            );
        } catch (error) {
            console.error('Error saving user preferences:', error);
        }
    },

    /**
     * Retrieve user preferences from local storage
     * @returns {Object} Stored user preferences
     */
    getUserPreferences() {
        try {
            const preferences = localStorage.getItem(AppConfig.storageKeys.userPreferences);
            return preferences ? JSON.parse(preferences) : {};
        } catch (error) {
            console.error('Error retrieving user preferences:', error);
            return {};
        }
    },

    /**
     * Initialize application settings
     */
    init() {
        // Apply initial dark mode if enabled
        if (this.isDarkModeEnabled()) {
            document.documentElement.classList.add('dark-mode');
        }

        // Example of listening for system dark mode changes
        if (window.matchMedia) {
            const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            darkModeMediaQuery.addListener((e) => {
                if (AppConfig.features.darkMode) {
                    document.documentElement.classList.toggle('dark-mode', e.matches);
                }
            });
        }
    },

    /**
     * Reset all user settings to default
     */
    resetToDefaults() {
        // Remove stored preferences
        localStorage.removeItem(AppConfig.storageKeys.userPreferences);
        localStorage.removeItem(AppConfig.storageKeys.darkMode);

        // Remove dark mode class
        document.documentElement.classList.remove('dark-mode');

        // Optional: Dispatch reset event
        const event = new CustomEvent('settingsReset');
        document.dispatchEvent(event);
    }
};

/**
 * Logging utility with environment-based logging
 */
const Logger = {
    /**
     * Log messages only in development environment
     * @param {...*} args - Arguments to log
     */
    debug(...args) {
        if (AppConfig.env.development) {
            console.log(...args);
        }
    },

    /**
     * Log warnings
     * @param {...*} args - Arguments to log as warning
     */
    warn(...args) {
        console.warn(...args);
    },

    /**
     * Log errors
     * @param {...*} args - Arguments to log as error
     */
    error(...args) {
        console.error(...args);
    }
};

// Initialize settings when script loads
SettingsManager.init();

// Export modules for potential use in other scripts
export { 
    AppConfig, 
    SettingsManager, 
    Logger 
};
