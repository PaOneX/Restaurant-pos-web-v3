// ========================================
// SECURITY LAYER - Input Validation & Protection
// ========================================

const Security = {
    
    // ========================================
    // 1. INPUT SANITIZATION
    // ========================================
    
    // Sanitize HTML to prevent XSS attacks
    sanitizeHTML(input) {
        if (!input) return '';
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },
    
    // Sanitize and escape special characters
    escapeHTML(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;',
        };
        return String(text).replace(/[&<>"'/]/g, (char) => map[char]);
    },
    
    // Validate and sanitize text input
    sanitizeInput(input, maxLength = 100) {
        if (!input) return '';
        let sanitized = this.escapeHTML(input);
        sanitized = sanitized.trim();
        if (maxLength && sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }
        return sanitized;
    },
    
    // Validate numeric input
    validateNumber(input, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const num = parseFloat(input);
        if (isNaN(num)) return null;
        if (num < min || num > max) return null;
        return num;
    },
    
    // Validate integer input
    validateInteger(input, min = 0, max = Number.MAX_SAFE_INTEGER) {
        const num = parseInt(input);
        if (isNaN(num)) return null;
        if (num < min || num > max) return null;
        return num;
    },
    
    // ========================================
    // 2. PASSWORD SECURITY
    // ========================================
    
    // Simple password hashing (SHA-256 simulation using built-in crypto API)
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    },
    
    // Synchronous password hashing for compatibility (basic implementation)
    hashPasswordSync(password) {
        // Simple hash for demo - in production use bcrypt or similar
        let hash = 0;
        const salt = 'RestaurantPOS2026'; // Salt for additional security
        const combined = password + salt;
        
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        
        return hash.toString(16);
    },
    
    // Validate password strength
    validatePasswordStrength(password) {
        if (!password || password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters long' };
        }
        if (password.length > 50) {
            return { valid: false, message: 'Password too long' };
        }
        return { valid: true, message: 'Password is valid' };
    },
    
    // ========================================
    // 3. FORM VALIDATION
    // ========================================
    
    // Validate product form data
    validateProductData(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length === 0) {
            errors.push('Product name is required');
        } else if (data.name.length > 100) {
            errors.push('Product name too long (max 100 characters)');
        }
        
        // Support both old category and new hierarchy system
        const hasOldCategory = data.category && data.category.trim().length > 0;
        const hasNewCategories = (data.mainCategory && data.mainCategory.trim().length > 0) && 
                                  (data.subCategory && data.subCategory.trim().length > 0);
        
        if (!hasOldCategory && !hasNewCategories) {
            errors.push('Category is required');
        }
        
        const price = this.validateNumber(data.price, 0, 1000000);
        if (price === null) {
            errors.push('Invalid price');
        }
        
        const stock = this.validateInteger(data.stock, 0, 100000);
        if (stock === null) {
            errors.push('Invalid stock quantity');
        }
        
        const sanitized = {
            name: this.sanitizeInput(data.name, 100),
            price: price,
            stock: stock
        };
        
        // Add appropriate category fields
        if (hasNewCategories) {
            sanitized.mainCategory = this.sanitizeInput(data.mainCategory, 50);
            sanitized.subCategory = this.sanitizeInput(data.subCategory, 50);
        } else if (hasOldCategory) {
            sanitized.category = this.sanitizeInput(data.category, 50);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            sanitizedData: sanitized
        };
    },
    
    // Validate settings data
    validateSettingsData(data) {
        const errors = [];
        
        // Restaurant name is now controlled by global constant, no validation needed
        
        const serviceCharge = this.validateNumber(data.serviceCharge, 0, 100);
        if (serviceCharge === null) {
            errors.push('Invalid service charge rate');
        }
        
        const discount = this.validateNumber(data.discount, 0, 100);
        if (discount === null) {
            errors.push('Invalid discount rate');
        }
        
        // Validate phone number format
        if (data.phone && !this.validatePhoneNumber(data.phone)) {
            errors.push('Invalid phone number format');
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            sanitizedData: {
                serviceCharge: serviceCharge,
                discount: discount,
                phone: this.sanitizeInput(data.phone, 20)
            }
        };
    },
    
    // Validate phone number
    validatePhoneNumber(phone) {
        if (!phone) return true; // Optional field
        // Basic validation: numbers only, 10-15 digits
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 15;
    },
    
    // ========================================
    // 4. LOGIN SECURITY
    // ========================================
    
    // Track login attempts to prevent brute force
    loginAttempts: {},
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    
    // Check if user is locked out
    isLockedOut(username) {
        const attempts = this.loginAttempts[username];
        if (!attempts) return false;
        
        if (attempts.count >= this.maxLoginAttempts) {
            const timeSinceLock = Date.now() - attempts.lastAttempt;
            if (timeSinceLock < this.lockoutDuration) {
                const remainingMinutes = Math.ceil((this.lockoutDuration - timeSinceLock) / 60000);
                return { locked: true, remainingMinutes };
            } else {
                // Reset after lockout period
                delete this.loginAttempts[username];
                return false;
            }
        }
        return false;
    },
    
    // Record failed login attempt
    recordFailedLogin(username) {
        if (!this.loginAttempts[username]) {
            this.loginAttempts[username] = { count: 0, lastAttempt: 0 };
        }
        this.loginAttempts[username].count++;
        this.loginAttempts[username].lastAttempt = Date.now();
    },
    
    // Reset login attempts on successful login
    resetLoginAttempts(username) {
        delete this.loginAttempts[username];
    },
    
    // ========================================
    // 5. DATA VALIDATION
    // ========================================
    
    // Validate cart item quantity
    validateCartQuantity(quantity) {
        const qty = this.validateInteger(quantity, 1, 1000);
        return qty !== null ? qty : 1;
    },
    
    // Validate payment amount
    validatePaymentAmount(amount, totalDue) {
        const payment = this.validateNumber(amount, 0, 10000000);
        if (payment === null) return null;
        if (payment < totalDue) {
            return { valid: false, message: 'Payment amount less than total' };
        }
        return { valid: true, amount: payment };
    },
    
    // ========================================
    // 6. GENERAL SECURITY UTILITIES
    // ========================================
    
    // Generate random token for session-like security
    generateToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    },
    
    // Validate data types
    isValidType(value, type) {
        switch(type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'integer':
                return Number.isInteger(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return typeof value === 'object' && value !== null && !Array.isArray(value);
            default:
                return false;
        }
    },
    
    // Clean object of potentially dangerous properties
    sanitizeObject(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        
        const clean = {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Skip __proto__, constructor, prototype
                if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                    continue;
                }
                
                const value = obj[key];
                if (typeof value === 'string') {
                    clean[key] = this.sanitizeInput(value);
                } else if (typeof value === 'number') {
                    clean[key] = value;
                } else if (typeof value === 'boolean') {
                    clean[key] = value;
                } else if (Array.isArray(value)) {
                    clean[key] = value.map(item => 
                        typeof item === 'object' ? this.sanitizeObject(item) : 
                        typeof item === 'string' ? this.sanitizeInput(item) : item
                    );
                } else if (typeof value === 'object') {
                    clean[key] = this.sanitizeObject(value);
                }
            }
        }
        return clean;
    }
};
