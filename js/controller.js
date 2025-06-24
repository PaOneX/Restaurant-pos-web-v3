// ========================================
// CONTROLLER LAYER - Business Logic
// ========================================

const Controller = {

    // ========================================
    // 1. SYSTEM INITIALIZATION
    // ========================================

    //  Initialize System
    initSystem() {
        console.log('ðŸš€ Initializing Restaurant POS System...');
        
        // Load all data from storage
        Model.loadProductsFromStorage();
        Model.loadCartFromStorage();
        Model.loadOrdersFromStorage();
        Model.loadSettings();
        Model.loadCurrentUser();
        // Check for daily reset
        const report = Model.checkDailyReset();
        if (report && report.orderCount > 0) {
            this.sendDailyReportToWhatsApp(report);
        }
        // Update user display and navigation
        View.updateUserDisplay(Model.currentUser);

        // Setup event listeners
        this.setupEventListeners();

        console.log(' System initialized successfully');
    },

    // Setup event listeners
    setupEventListeners() {
        // Product form submit
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const productId = document.getElementById('productId').value;
                if (productId) {
                    this.updateProduct();
                } else {
                    this.addProduct();
                }
            });
        }

        // Search input
        const searchInput = document.getElementById('searchProduct');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }

        // POS search
        const posSearch = document.getElementById('posSearch');
        if (posSearch) {
            posSearch.addEventListener('input', (e) => {
                this.searchProductsInPOS(e.target.value);
            });
        }

        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateSettings();
            });
        }
    },

    // Setup page-specific event listeners
    setupProductsPageListeners() {
        // Search input
        const searchInput = document.getElementById('searchProduct');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProducts(e.target.value);
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filterByCategory(e.target.value);
            });
        }

        // Product form
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const editingId = document.getElementById('productId');
                if (editingId && editingId.value) {
                    this.updateProduct();
                } else {
                    this.addProduct();
                }
            });
        }
    },

    setupPOSPageListeners() {
        // POS search
        const posSearch = document.getElementById('posSearch');
        if (posSearch) {
            posSearch.addEventListener('input', (e) => {
                this.searchProductsInPOS(e.target.value);
            });
        }
    },

    setupSettingsPageListeners() {
        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateSettings();
            });
        }
    },

    // ========================================
    // 2. PRODUCT MANAGEMENT
    // ========================================

    //  Load Products
    loadProducts() {
        const products = Model.getAllProducts();
        View.renderProductsTable(products);
        
        // Update category filter
        const categories = Model.getCategories();
        View.renderCategoryFilter(categories);
    },

    //  Add Product
    addProduct() {
        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: document.getElementById('productPrice').value,
            stock: document.getElementById('productStock').value
        };

        // Security validation
        const validation = Security.validateProductData(productData);
        if (!validation.valid) {
            View.showAlert(validation.errors.join(', '), 'error');
            return;
        }

        const product = Model.addProduct(validation.sanitizedData);
        if (product) {
            View.showAlert('Product added successfully!', 'success');
            this.loadProducts();
            this.loadProductsToPOS();
            View.clearProductForm();
        } else {
            View.showAlert('Failed to add product', 'error');
        }
    },

    //  Edit Product
    editProduct(productId) {
        const product = Model.getProductById(productId);
        if (product) {
            View.fillProductForm(product);
            // Scroll to form
            document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
        }
    },

    //  Update Product
    updateProduct() {
        const productId = document.getElementById('productId').value;
        
        const productData = {
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: document.getElementById('productPrice').value,
            stock: document.getElementById('productStock').value
        };

        // Security validation
        const validation = Security.validateProductData(productData);
        if (!validation.valid) {
            View.showAlert(validation.errors.join(', '), 'error');
            return;
        }

        if (Model.updateProduct(productId, validation.sanitizedData)) {
            View.showAlert('Product updated successfully!', 'success');
            this.loadProducts();
            this.loadProductsToPOS();
            View.clearProductForm();
        } else {
            View.showAlert('Failed to update product', 'error');
        }
    },

    //  Delete Product
    async deleteProduct(productId) {
        const confirmed = await View.showConfirm('Are you sure you want to delete this product?');
        if (confirmed) {
            if (Model.deleteProduct(productId)) {
                View.showAlert('Product deleted successfully!', 'success');
                this.loadProducts();
                this.loadProductsToPOS();
            } else {
                View.showAlert('Failed to delete product', 'error');
            }
        }
    },

    //  Clear Product Form
    clearProductForm() {
        View.clearProductForm();
    },

    //  &  Search Products
    searchProducts(query) {
        const products = Model.searchProducts(query);
        View.renderProductsTable(products);
    },

    //  Filter by Category
    filterByCategory(category) {
        const products = Model.filterByCategory(category);
        View.renderProductsTable(products);
    },

    //  Sort by Price
    sortByPrice(order) {
        const products = Model.sortByPrice(order);
        View.renderProductsTable(products);
    },

    //  Validate Product Form
    validateProductForm() {
        const name = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value.trim();
        const price = document.getElementById('productPrice').value;
        const stock = document.getElementById('productStock').value;

        if (!name) {
            View.showAlert('Please enter product name', 'error');
            return false;
        }

        if (!category) {
            View.showAlert('Please enter category', 'error');
            return false;
        }

        if (!price || parseFloat(price) <= 0) {
            View.showAlert('Please enter valid price', 'error');
            return false;
        }

        if (!stock || parseInt(stock) < 0) {
            View.showAlert('Please enter valid stock', 'error');
            return false;
        }

        return true;
    },

    // ========================================
    // 3. POS / BILLING FUNCTIONS
    // ========================================

    //  Load Products to POS
    loadProductsToPOS() {
        const products = Model.getAllProducts();
        const categories = Model.getCategories();
        View.renderProductsGrid(products);
        View.renderPOSCategoryFilters(categories);
        this.currentPOSCategory = 'All';
    },

    // Filter POS by Category
    filterPOSByCategory(category) {
        this.currentPOSCategory = category;
        const searchQuery = document.getElementById('posSearch')?.value || '';
        
        let products = Model.filterByCategory(category);
        
        // Apply search filter if there's a search query
        if (searchQuery) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        View.renderProductsGrid(products);
        View.renderPOSCategoryFilters(Model.getCategories(), category);
    },

    // Search in POS
    searchProductsInPOS(query) {
        const category = this.currentPOSCategory || 'All';
        let products = Model.filterByCategory(category);
        
        if (query) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        View.renderProductsGrid(products);
    },

    //  Add to Cart
    addToCart(productId) {
        if (Model.addToCart(productId)) {
            this.renderCart();
            View.showAlert('Product added to cart', 'success');
        } else {
            View.showAlert('Failed to add product', 'error');
        }
    },

    //  Render Cart
    renderCart() {
        const cart = Model.getCart();
        View.renderCart(cart);
    },

    //  Update Cart Quantity
    updateCartQuantity(productId, quantity) {
        // Validate and sanitize quantity
        const validQty = Security.validateCartQuantity(quantity);
        Model.updateCartQuantity(productId, validQty);
        this.renderCart();
    },

    //  Remove from Cart
    removeFromCart(productId) {
        if (View.showConfirm('Remove this item from cart?')) {
            Model.removeFromCart(productId);
            this.renderCart();
            View.showAlert('Item removed from cart', 'success');
        }
    },

    //  Clear Cart
    clearCart() {
        if (View.showConfirm('Clear all items from cart?')) {
            Model.clearCart();
            Model.clearPayment();
            this.renderCart();
            View.clearPaymentFields();
            View.showAlert('Cart cleared', 'success');
        }
    },

    // Calculate and display balance
    calculateBalance() {
        const paymentInput = document.getElementById('paymentAmount');
        if (!paymentInput) return;

        const paymentAmount = parseFloat(paymentInput.value) || 0;
        const balanceData = Model.calculateBalance(paymentAmount);
        View.displayBalance(balanceData);
    },

    // ========================================
    // 4. RECEIPT & PRINTING
    // ========================================

    //  Print Bill
    printBill() {
        const cart = Model.getCart();
        
        if (cart.length === 0) {
            View.showAlert('Cart is empty!', 'error');
            return;
        }

        // Check if payment is sufficient
        const totals = Model.calculateTotal();
        const paymentAmount = Model.getPaymentAmount();
        
        if (paymentAmount < totals.total) {
            View.showAlert('Payment amount is less than total bill!', 'error');
            return;
        }

        try {
            //  Save order first
            const order = Model.saveOrder();
            
            // Check for errors
            if (!order) {
                View.showAlert('Failed to complete order', 'error');
                return;
            }
            
            if (order.error) {
                View.showAlert(order.error, 'error');
                return;
            }
            
            // Order already has payment and balance from Model.saveOrder
            // Just ensure they're set
            if (!order.payment) {
                order.payment = paymentAmount;
                order.balance = paymentAmount - order.totals.total;
            }
            
            //  Generate receipt
            View.generateReceipt(order);
            
            // Show modal
            View.showModal('receiptModal');
            
            // Print after short delay
            setTimeout(() => {
                try {
                    window.print();
                } catch (printError) {
                    console.error('Print error:', printError);
                    View.showAlert('Print function not available', 'error');
                }
            }, 500);

            // Clear cart, payment and refresh
            this.renderCart();
            View.clearPaymentFields();
            View.showAlert('Order completed successfully! Stock updated.', 'success');
            
            // Refresh products display to show updated stock
            this.loadProductsToPOS();
        } catch (error) {
            console.error('Error in printBill:', error);
            View.showAlert('Error processing order: ' + error.message, 'error');
        }
    },

    // Close receipt modal
    closeReceipt() {
        View.hideModal('receiptModal');
    },

    // ========================================
    // 5. ORDER MANAGEMENT
    // ========================================

    //  Load Orders
    loadOrders() {
        const orders = Model.getAllOrders();
        View.renderOrdersTable(orders);
    },

    //  View Order
    viewOrder(orderId) {
        const order = Model.getOrderById(orderId);
        if (order) {
            View.generateReceipt(order);
            View.showModal('receiptModal');
        }
    },

    //  Delete Order
    async deleteOrder(orderId) {
        const confirmed = await View.showConfirm('Are you sure you want to delete this order?');
        if (confirmed) {
            if (Model.deleteOrder(orderId)) {
                View.showAlert('Order deleted successfully!', 'success');
                this.loadOrders();
            } else {
                View.showAlert('Failed to delete order', 'error');
            }
        }
    },

    // Send current order history report to WhatsApp
    sendOrderHistoryReport() {
        const settings = Model.getSettings();
        const adminPhone = settings.adminPhone;
        
        if (!adminPhone) {
            View.showAlert('Please set Admin WhatsApp number in Settings first!', 'error');
            return;
        }
        
        const report = Model.calculateDailyTotal();
        
        if (report.orderCount === 0) {
            View.showAlert('No orders to report!', 'info');
            return;
        }
        
        const today = new Date().toLocaleDateString();
        const now = new Date().toLocaleTimeString();
        
        // Get detailed statistics
        const stats = Model.getDetailedOrderStats();
        
        // Build category breakdown
        let categoryBreakdown = '';
        Object.keys(stats.categoryStats).forEach(category => {
            const data = stats.categoryStats[category];
            categoryBreakdown += `• ${category}: *${data.count}* items (${Model.formatCurrency(data.amount)})\n`;
        });
        
        const message = `*${settings.restaurantName}*\n` +
                       ` *ORDER HISTORY REPORT*\n` +
                       `━━━━━━━━━━━━━━━━━━\n` +
                       ` Date: ${today}\n` +
                       ` Time: ${now}\n\n` +
                       ` *SUMMARY*\n` +
                       ` Total Orders: *${stats.totalOrders}*\n` +
                       ` Total Items Sold: *${stats.totalItems}*\n` +
                       ` Total Income: *${Model.formatCurrency(stats.totalAmount)}*\n\n` +
                       ` *CATEGORY BREAKDOWN*\n` +
                       `${categoryBreakdown}\n` +
                       `━━━━━━━━━━━━━━━━━━\n` +
                       ` Generated by: ${Model.currentUser ? Model.currentUser.username : 'Admin'}`;
        
        // Create WhatsApp link
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;
        
        // Open WhatsApp in new window
        window.open(whatsappUrl, '_blank');
        
        View.showAlert('Opening WhatsApp...', 'success');
    },

    // ========================================
    // 6. SETTINGS MANAGEMENT
    // ========================================

    updateSettingsUI() {
        const settings = Model.getSettings();
        View.updateSettingsDisplay(settings);
    },

    updateSettings() {
        const settingsData = {
            name: document.getElementById('restaurantName').value,
            tax: document.getElementById('taxRate').value,
            discount: document.getElementById('discountRate').value,
            phone: document.getElementById('adminPhone').value
        };

        // Security validation
        const validation = Security.validateSettingsData(settingsData);
        if (!validation.valid) {
            View.showAlert(validation.errors.join(', '), 'error');
            return;
        }

        const sanitized = validation.sanitizedData;

        //  Update restaurant info
        Model.updateRestaurantInfo(sanitized.name);
        
        //  Set tax rate
        Model.setTaxRate(sanitized.tax);
        
        //  Apply discount
        Model.applyDiscount(sanitized.discount);
        
        //  Update admin phone
        Model.updateAdminPhone(sanitized.phone);

        View.showAlert('Settings updated successfully!', 'success');
        this.updateSettingsUI();
        this.renderCart(); // Update totals
        this.updateRestaurantNameInHeader(); // Update header name
    },

    // Update restaurant name in the header
    updateRestaurantNameInHeader() {
        const settings = Model.getSettings();
        const headerTitle = document.querySelector('.header h1');
        if (headerTitle) {
            headerTitle.innerHTML = `<i class="fas fa-utensils"></i> ${settings.restaurantName}`;
        }
    },

    // Reset products to default menu
    resetProducts() {
        if (View.showConfirm('This will replace all current products with the default menu (28 items). Continue?')) {
            Model.resetToDefaultProducts();
            View.showAlert('Products reset to default menu successfully!', 'success');
            this.loadProducts();
            this.loadProductsToPOS();
        }
    },

    // Send daily report to WhatsApp
    sendDailyReportToWhatsApp(report) {
        const settings = Model.getSettings();
        const adminPhone = settings.adminPhone;
        
        if (!adminPhone) {
            console.log('Admin phone number not set, skipping WhatsApp report');
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const dateStr = yesterday.toLocaleDateString();
        
        // Get detailed statistics
        const stats = Model.getDetailedOrderStats();
        
        // Build category breakdown
        let categoryBreakdown = '';
        Object.keys(stats.categoryStats).forEach(category => {
            const data = stats.categoryStats[category];
            categoryBreakdown += `• ${category}: *${data.count}* items (${Model.formatCurrency(data.amount)})\n`;
        });
        
        const message = `*${settings.restaurantName}*\n` +
                       ` *Daily Report - ${dateStr}*\n` +
                       `━━━━━━━━━━━━━━━━━━\n\n` +
                       ` *SUMMARY*\n` +
                       ` Total Orders: *${stats.totalOrders}*\n` +
                       ` Total Items Sold: *${stats.totalItems}*\n` +
                       ` Total Income: *${Model.formatCurrency(stats.totalAmount)}*\n\n` +
                       ` *CATEGORY BREAKDOWN*\n` +
                       `${categoryBreakdown}\n` +
                       `━━━━━━━━━━━━━━━━━━\n` +
                       ` Orders have been reset for the new day.`;
        
        // Create WhatsApp link
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;
        
        // Open WhatsApp in new window
        window.open(whatsappUrl, '_blank');
        
        console.log('Daily report sent to WhatsApp:', adminPhone);
    },

    // ========================================
    // 7. USER MANAGEMENT
    // ========================================

    // Show login form
    showLogin() {
        View.showLoginForm();
    },

    //  Login User
    loginUser() {
        const username = Security.sanitizeInput(document.getElementById('loginUsername').value.trim(), 50);
        const password = document.getElementById('loginPassword').value.trim();

        // Check if user is locked out
        const lockout = Security.isLockedOut(username);
        if (lockout && lockout.locked) {
            View.showAlert(`Too many failed attempts. Please try again in ${lockout.remainingMinutes} minutes.`, 'error');
            return;
        }

        console.log('Login attempt with:', { username });

        const user = Model.loginUser(username, password);
        
        if (user) {
            Security.resetLoginAttempts(username);
            const roleMessage = user.role === 'admin' ? 'Full Access' : 'POS Access Only';
            View.showAlert(`Welcome ${user.username}! (${roleMessage})`, 'success');
            View.updateUserDisplay(user);
            View.hideLoginForm();
            
            // Reset form
            document.getElementById('loginForm').reset();
            
            // Redirect to appropriate page
            this.showPage('pos');
        } else {
            Security.recordFailedLogin(username);
            const attempts = Security.loginAttempts[username];
            const remaining = Security.maxLoginAttempts - attempts.count;
            
            if (remaining > 0) {
                View.showAlert(`Invalid username or password. ${remaining} attempts remaining.`, 'error');
            } else {
                View.showAlert('Too many failed attempts. Account locked for 15 minutes.', 'error');
            }
        }
    },

    //  Logout User
    logoutUser() {
        if (View.showConfirm('Are you sure you want to logout?')) {
            Model.logoutUser();
            View.updateUserDisplay(null);
            View.showAlert('Logged out successfully', 'success');
            
            // Redirect to POS page (accessible to all)
            this.showPage('pos');
        }
    },

    // Clear localStorage for testing (useful for debugging)
    clearAllData() {
        if (View.showConfirm('This will delete all data including products, orders, and users. Continue?')) {
            localStorage.clear();
            View.showAlert('All data cleared. Page will reload.', 'success');
            setTimeout(() => location.reload(), 1500);
        }
    },

    //  Check User Role (for access control)
    checkUserRole(requiredRole) {
        return Model.checkUserRole(requiredRole);
    },

    // ========================================
    // 8. PAGE NAVIGATION
    // ========================================

    //  &  Show Page
    async showPage(pageName) {
        // Check permissions
        if (!this.checkPageAccess(pageName)) {
            View.showAlert('Access Denied! You do not have permission to access this page.', 'error');
            return;
        }

        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick')?.includes(pageName)) {
                link.classList.add('active');
            }
        });

        // Load page content dynamically
        const appRoot = document.getElementById('app-root');
        if (!appRoot) return;

        try {
            // Show loading state
            appRoot.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

            // Fetch page content
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) throw new Error('Page not found');
            
            const html = await response.text();
            appRoot.innerHTML = html;

            // Load data for specific pages after content is loaded
            setTimeout(() => {
                switch(pageName) {
                    case 'products':
                        this.loadProducts();
                        this.setupProductsPageListeners();
                        this.updateRestaurantNameInHeader();
                        break;
                    case 'pos':
                        this.loadProductsToPOS();
                        this.renderCart();
                        this.setupPOSPageListeners();
                        this.updateRestaurantNameInHeader();
                        break;
                    case 'orders':
                        this.loadOrders();
                        this.updateRestaurantNameInHeader();
                        break;
                    case 'settings':
                        this.updateSettingsUI();
                        this.setupSettingsPageListeners();
                        this.updateRestaurantNameInHeader();
                        break;
                }
            }, 100);

        } catch (error) {
            console.error('Error loading page:', error);
            appRoot.innerHTML = '<div class="error"><i class="fas fa-exclamation-circle"></i> Error loading page. Please try again.</div>';
        }
    },

    // Check if user has access to page
    checkPageAccess(pageName) {
        const user = Model.currentUser;
        
        // Define page permissions
        const permissions = {
            'pos': ['admin', 'cashier', null], // null means guest can access
            'products': ['admin'],
            'orders': ['admin'],
            'settings': ['admin']
        };
        
        const allowedRoles = permissions[pageName];
        if (!allowedRoles) return true; // Allow if no restriction
        
        const userRole = user ? user.role : null;
        return allowedRoles.includes(userRole);
    }
};

