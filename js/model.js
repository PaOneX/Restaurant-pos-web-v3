// ========================================
// MODEL LAYER - Data Management
// ========================================

const Model = {
    // Default data
    products: [],
    cart: [],
    orders: [],
    settings: {
        restaurantName: "My Restaurant",
        taxRate: 0,
        discount: 0,
        currency: "Rs."
    },
    currentUser: null,
    paymentAmount: 0,

    // ========================================
    // 1. STORAGE FUNCTIONS
    // ========================================

    // 2️⃣ Save to LocalStorage
    saveToLocalStorage(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    // 3️⃣ Get from LocalStorage
    getFromLocalStorage(key) {
        try {
            const jsonData = localStorage.getItem(key);
            return jsonData ? JSON.parse(jsonData) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // ========================================
    // 2. PRODUCT MANAGEMENT
    // ========================================

    // Load products from storage
    loadProductsFromStorage() {
        const products = this.getFromLocalStorage('products');
        this.products = products || this.getDefaultProducts();
        return this.products;
    },

    // Get default products (for first time)
    getDefaultProducts() {
        return [
            { id: '1', name: 'Chicken Burger', category: 'Burgers', price: 450, stock: 50 },
            { id: '2', name: 'Cheese Pizza', category: 'Pizza', price: 1200, stock: 30 },
            { id: '3', name: 'Coke', category: 'Drinks', price: 150, stock: 100 },
            { id: '4', name: 'French Fries', category: 'Sides', price: 250, stock: 60 }
        ];
    },

    // Get all products
    getAllProducts() {
        return this.products;
    },

    // 5️⃣ Add Product
    addProduct(productData) {
        const product = {
            id: this.generateUniqueId(),
            name: productData.name,
            category: productData.category,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock)
        };
        this.products.push(product);
        this.saveToLocalStorage('products', this.products);
        return product;
    },

    // Get product by ID
    getProductById(productId) {
        return this.products.find(p => p.id === productId);
    },

    // 7️⃣ Update Product
    updateProduct(productId, productData) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products[index] = {
                id: productId,
                name: productData.name,
                category: productData.category,
                price: parseFloat(productData.price),
                stock: parseInt(productData.stock)
            };
            this.saveToLocalStorage('products', this.products);
            return true;
        }
        return false;
    },

    // 8️⃣ Delete Product
    deleteProduct(productId) {
        const index = this.products.findIndex(p => p.id === productId);
        if (index !== -1) {
            this.products.splice(index, 1);
            this.saveToLocalStorage('products', this.products);
            return true;
        }
        return false;
    },

    // 🔟 Search Products
    searchProducts(query) {
        if (!query) return this.products;
        const lowerQuery = query.toLowerCase();
        return this.products.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) ||
            p.category.toLowerCase().includes(lowerQuery)
        );
    },

    // 2️⃣7️⃣ Filter by Category
    filterByCategory(category) {
        if (!category || category === 'All') return this.products;
        return this.products.filter(p => p.category === category);
    },

    // 2️⃣8️⃣ Sort by Price
    sortByPrice(order = 'asc') {
        const sorted = [...this.products];
        return sorted.sort((a, b) => 
            order === 'asc' ? a.price - b.price : b.price - a.price
        );
    },

    // Get unique categories
    getCategories() {
        const categories = ['All'];
        this.products.forEach(p => {
            if (!categories.includes(p.category)) {
                categories.push(p.category);
            }
        });
        return categories;
    },

    // ========================================
    // 3. CART MANAGEMENT
    // ========================================

    // Load cart from storage
    loadCartFromStorage() {
        const cart = this.getFromLocalStorage('cart');
        this.cart = cart || [];
        return this.cart;
    },

    // Get cart
    getCart() {
        return this.cart;
    },

    // 1️⃣2️⃣ Add to Cart
    addToCart(productId) {
        const product = this.getProductById(productId);
        if (!product) return false;

        const existingItem = this.cart.find(item => item.productId === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                productId: productId,
                name: product.name,
                price: product.price,
                quantity: 1
            });
        }
        
        this.saveToLocalStorage('cart', this.cart);
        return true;
    },

    // 1️⃣4️⃣ Update Cart Quantity
    updateCartQuantity(productId, quantity) {
        const item = this.cart.find(item => item.productId === productId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.saveToLocalStorage('cart', this.cart);
            }
            return true;
        }
        return false;
    },

    // 1️⃣5️⃣ Remove from Cart
    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.productId === productId);
        if (index !== -1) {
            this.cart.splice(index, 1);
            this.saveToLocalStorage('cart', this.cart);
            return true;
        }
        return false;
    },

    // 1️⃣6️⃣ Clear Cart
    clearCart() {
        this.cart = [];
        this.saveToLocalStorage('cart', this.cart);
    },

    // 1️⃣7️⃣ Calculate Subtotal
    calculateSubtotal(productId) {
        const item = this.cart.find(item => item.productId === productId);
        return item ? item.price * item.quantity : 0;
    },

    // 1️⃣8️⃣ Calculate Total
    calculateTotal() {
        let total = 0;
        this.cart.forEach(item => {
            total += item.price * item.quantity;
        });
        
        // Apply tax
        const taxAmount = total * (this.settings.taxRate / 100);
        total += taxAmount;
        
        // Apply discount
        const discountAmount = total * (this.settings.discount / 100);
        total -= discountAmount;
        
        return {
            subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            tax: taxAmount,
            discount: discountAmount,
            total: total
        };
    },

    // ========================================
    // 4. ORDER MANAGEMENT
    // ========================================

    // Load orders from storage
    loadOrdersFromStorage() {
        const orders = this.getFromLocalStorage('orders');
        this.orders = orders || [];
        return this.orders;
    },

    // 2️⃣1️⃣ Save Order
    saveOrder() {
        if (this.cart.length === 0) return false;

        const totals = this.calculateTotal();
        const order = {
            id: this.generateUniqueId(),
            items: [...this.cart],
            totals: totals,
            date: this.getCurrentDateTime(),
            user: this.currentUser || 'Cashier'
        };

        this.orders.push(order);
        this.saveToLocalStorage('orders', this.orders);
        this.clearCart();
        return order;
    },

    // Get all orders
    getAllOrders() {
        return this.orders;
    },

    // 2️⃣4️⃣ Get Order by ID
    getOrderById(orderId) {
        return this.orders.find(o => o.id === orderId);
    },

    // 2️⃣5️⃣ Delete Order
    deleteOrder(orderId) {
        const index = this.orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            this.orders.splice(index, 1);
            this.saveToLocalStorage('orders', this.orders);
            return true;
        }
        return false;
    },

    // ========================================
    // 5. SETTINGS MANAGEMENT
    // ========================================

    // Load settings
    loadSettings() {
        const settings = this.getFromLocalStorage('settings');
        if (settings) {
            this.settings = settings;
        }
        return this.settings;
    },

    // 3️⃣2️⃣ Update Restaurant Info
    updateRestaurantInfo(name) {
        this.settings.restaurantName = name;
        this.saveToLocalStorage('settings', this.settings);
    },

    // 3️⃣3️⃣ Set Tax Rate
    setTaxRate(rate) {
        this.settings.taxRate = parseFloat(rate);
        this.saveToLocalStorage('settings', this.settings);
    },

    // 3️⃣4️⃣ Apply Discount
    applyDiscount(discount) {
        this.settings.discount = parseFloat(discount);
        this.saveToLocalStorage('settings', this.settings);
    },

    getSettings() {
        return this.settings;
    },

    // ========================================
    // 6. USER MANAGEMENT
    // ========================================

    // 2️⃣9️⃣ Login User
    loginUser(username, password) {
        // Simple authentication (in real app, use server-side)
        const users = this.getFromLocalStorage('users') || [
            { username: 'admin', password: 'admin', role: 'admin' },
            { username: 'cashier', password: 'cashier', role: 'cashier' }
        ];

        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            this.currentUser = { username: user.username, role: user.role };
            this.saveToLocalStorage('currentUser', this.currentUser);
            return this.currentUser;
        }
        return null;
    },

    // 3️⃣0️⃣ Logout User
    logoutUser() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    },

    // Load current user
    loadCurrentUser() {
        this.currentUser = this.getFromLocalStorage('currentUser');
        return this.currentUser;
    },

    // 3️⃣1️⃣ Check User Role
    checkUserRole(requiredRole) {
        if (!this.currentUser) return false;
        return this.currentUser.role === requiredRole || this.currentUser.role === 'admin';
    },

    // ========================================
    // 7. UTILITY FUNCTIONS
    // ========================================

    // 3️⃣8️⃣ Generate Unique ID
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // 2️⃣2️⃣ Get Current Date Time
    getCurrentDateTime() {
        const now = new Date();
        return {
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            full: now.toLocaleString()
        };
    },

    // 3️⃣7️⃣ Format Currency
    formatCurrency(amount) {
        return this.settings.currency + ' ' + parseFloat(amount).toFixed(2);
    },

    // Calculate Balance/Change
    calculateBalance(paymentAmount) {
        this.paymentAmount = parseFloat(paymentAmount) || 0;
        const totals = this.calculateTotal();
        const balance = this.paymentAmount - totals.total;
        
        return {
            payment: this.paymentAmount,
            total: totals.total,
            balance: balance,
            sufficient: balance >= 0
        };
    },

    getPaymentAmount() {
        return this.paymentAmount;
    },

    clearPayment() {
        this.paymentAmount = 0;
    }
};
