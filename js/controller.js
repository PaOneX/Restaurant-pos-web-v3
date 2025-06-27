// ========================================
// CONTROLLER LAYER - Business Logic
// ========================================

const Controller = {

    // Store interval ID for cleanup
    midnightCheckInterval: null,

    // ========================================
    // 1. SYSTEM INITIALIZATION
    // ========================================

    //  Initialize System
    initSystem() {
        
        // Load all data from storage
        Model.loadProductsFromStorage();
        Model.loadCartFromStorage();
        Model.loadOrdersFromStorage();
        Model.loadSettings();
        Model.loadCurrentUser();
        Model.loadCategoryHierarchy();
        Model.loadSalesHistory(); // Load sales history
        Model.loadTables(); // Load tables
        Model.loadActiveOrders(); // Load active orders
        
        // Check for daily reset
        const report = Model.checkDailyReset();
        if (report && report.orderCount > 0) {
            this.sendDailyReportToWhatsApp(report);
        }
        // Update user display and navigation
        View.updateUserDisplay(Model.currentUser);

        // Setup event listeners
        this.setupEventListeners();
        
        // Setup midnight auto-reset checker (checks every minute)
        this.setupMidnightChecker();

        console.log('✅ System initialized successfully');
    },
    
    // Setup automatic midnight reset checker
    setupMidnightChecker() {
        // Clear any existing interval
        if (this.midnightCheckInterval) {
            clearInterval(this.midnightCheckInterval);
        }
        
        // Check every minute for midnight reset
        this.midnightCheckInterval = setInterval(() => {
            const report = Model.checkDailyReset();
            if (report && report.orderCount > 0) {
                
                // Show notification
                Swal.fire({
                    title: 'New Day Started!',
                    text: `Previous day's orders (${report.orderCount} orders, ${Model.formatCurrency(report.totalRevenue)}) have been saved to Sales History.`,
                    icon: 'info',
                    confirmButtonText: 'OK'
                });
                
                // Refresh orders page if currently viewing it
                const currentPage = document.querySelector('.nav-link.active');
                if (currentPage && currentPage.textContent.includes('Orders')) {
                    this.loadOrders();
                }
                
                // Send WhatsApp report
                this.sendDailyReportToWhatsApp(report);
            }
        }, 60000); // Check every 60 seconds
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (this.midnightCheckInterval) {
                clearInterval(this.midnightCheckInterval);
            }
        });
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
        
        // Populate category dropdowns
        View.populateMainCategoryDropdowns();
        View.populateAllSubCategoriesFilter();
    },

    //  Add Product
    addProduct() {
        const productData = {
            name: document.getElementById('productName').value,
            mainCategory: document.getElementById('productMainCategory').value,
            subCategory: document.getElementById('productSubCategory').value,
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
            mainCategory: document.getElementById('productMainCategory').value,
            subCategory: document.getElementById('productSubCategory').value,
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
        this.filterProducts();
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
        View.renderProductsGrid(products);
        View.renderPOSMainCategoryFilters('All');
        View.renderPOSSubCategoryFilters(null);
        this.currentPOSMainCategory = 'All';
        this.currentPOSSubCategory = 'All';
    },

    // Filter POS by Main Category
    filterPOSByMainCategory(mainCategory) {
        this.currentPOSMainCategory = mainCategory;
        this.currentPOSSubCategory = 'All';
        
        const searchQuery = document.getElementById('posSearch')?.value || '';
        let products = Model.filterByHierarchy(mainCategory, 'All');
        
        // Apply search filter if there's a search query
        if (searchQuery) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        View.renderProductsGrid(products);
        View.renderPOSMainCategoryFilters(mainCategory);
        View.renderPOSSubCategoryFilters(mainCategory, 'All');
    },

    // Filter POS by Sub Category
    filterPOSBySubCategory(subCategory) {
        this.currentPOSSubCategory = subCategory;
        const mainCategory = this.currentPOSMainCategory || 'All';
        
        const searchQuery = document.getElementById('posSearch')?.value || '';
        let products = Model.filterByHierarchy(mainCategory, subCategory);
        
        // Apply search filter if there's a search query
        if (searchQuery) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        View.renderProductsGrid(products);
        View.renderPOSSubCategoryFilters(mainCategory, subCategory);
    },

    // Filter POS by Category (legacy support)
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
        const mainCategory = this.currentPOSMainCategory || 'All';
        const subCategory = this.currentPOSSubCategory || 'All';
        let products = Model.filterByHierarchy(mainCategory, subCategory);
        
        if (query) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        View.renderProductsGrid(products);
    },

    // Update subcategory dropdown when main category changes
    updateSubCategoryDropdown() {
        const mainCategory = document.getElementById('productMainCategory')?.value;
        if (mainCategory) {
            View.populateSubCategoryDropdown(mainCategory);
        }
    },

    // Filter products by main category
    filterByMainCategory() {
        const mainCategory = document.getElementById('mainCategoryFilter')?.value || 'All';
        
        // Update subcategory filter options and reset to "All"
        if (mainCategory === 'All') {
            View.populateAllSubCategoriesFilter();
        } else {
            const subCategories = Model.getSubCategories(mainCategory);
            const filterSelect = document.getElementById('subCategoryFilter');
            if (filterSelect) {
                filterSelect.innerHTML = subCategories.map(cat => 
                    `<option value="${cat}">${cat}</option>`
                ).join('');
            }
        }
        
        this.filterProducts();
    },

    // Filter products by subcategory
    filterBySubCategory() {
        this.filterProducts();
    },

    // Apply all filters
    filterProducts() {
        const searchQuery = document.getElementById('searchProduct')?.value || '';
        const mainCategory = document.getElementById('mainCategoryFilter')?.value || 'All';
        const subCategory = document.getElementById('subCategoryFilter')?.value || 'All';
        
        let products = Model.filterByHierarchy(mainCategory, subCategory);
        
        if (searchQuery) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        View.renderProductsTable(products);
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
        // Validate and sanitize quantity with upper limit
        let validQty = Security.validateCartQuantity(quantity);
        if (validQty > 999) {
            View.showAlert('Maximum quantity is 999 items', 'warning');
            validQty = 999;
        }
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
            // Check if this is a call order being completed
            const callOrderId = sessionStorage.getItem('activeCallOrderId');
            let order;

            if (callOrderId) {
                // This is a call order - update and close the existing order
                const existingOrder = Model.activeOrders.find(o => (o.orderId || o.id) === callOrderId);
                
                if (existingOrder) {
                    // Update order with payment details and proper date structure
                    existingOrder.paymentAmount = paymentAmount;
                    existingOrder.payment = paymentAmount;
                    existingOrder.balance = paymentAmount - totals.total;
                    existingOrder.status = 'PAID';
                    existingOrder.finalBillPrintedAt = new Date().toISOString();
                    
                    // Add proper date structure if missing
                    if (!existingOrder.date) {
                        existingOrder.date = Model.getCurrentDateTime();
                    }
                    
                    // Add totals structure if missing
                    if (!existingOrder.totals) {
                        existingOrder.totals = {
                            subtotal: existingOrder.subtotal || 0,
                            serviceCharge: existingOrder.serviceCharge || 0,
                            discount: existingOrder.discount || 0,
                            total: existingOrder.total || totals.total
                        };
                    }
                    
                    // Add user/cashier info
                    if (!existingOrder.user) {
                        existingOrder.user = existingOrder.cashier || (Model.currentUser ? Model.currentUser.username : "Cashier");
                    }
                    
                    // Move to completed orders
                    Model.orders.push(existingOrder);
                    Model.saveToLocalStorage('orders', Model.orders);
                    
                    // Remove from active orders
                    Model.activeOrders = Model.activeOrders.filter(o => (o.orderId || o.id) !== callOrderId);
                    Model.saveActiveOrders();
                    
                    // Clear session storage
                    sessionStorage.removeItem('activeCallOrderId');
                    
                    order = existingOrder;
                } else {
                    // Fallback if order not found
                    order = Model.saveOrder();
                }
            } else {
                // Regular new order
                order = Model.saveOrder();
            }
            
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
                // Handle both totals.total and total properties
                const orderTotal = order.totals?.total || order.total || totals.total;
                order.balance = paymentAmount - orderTotal;
            }
            
            // Ask if user wants to print kitchen ticket (only for new orders, not call orders)
            if (!callOrderId) {
                Swal.fire({
                    title: 'Print Kitchen Ticket?',
                    text: 'Would you like to send this order to the kitchen?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Print KOT',
                    cancelButtonText: 'No, Skip',
                    confirmButtonColor: '#3b82f6',
                    cancelButtonColor: '#6b7280'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Print kitchen ticket
                        this.printKitchenTicketForTakeaway(order);
                    }
                });
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
                    View.showAlert('Could not open print dialog. Please try again.', 'warning');
                }
            }, 500);

            // Clear cart, payment and refresh
            Model.clearCart();
            Model.clearPayment();
            Model.currentOrder = null;
            this.renderCart();
            View.clearPaymentFields();
            View.showAlert('Order completed successfully! Stock updated.', 'success');
            
            // Refresh products display to show updated stock
            this.loadProductsToPOS();
            
            // Refresh orders page if it's currently active
            const currentPage = document.querySelector('.nav-link.active');
            if (currentPage && currentPage.textContent.includes('Orders')) {
                this.loadOrders();
            }
        } catch (error) {
            console.error('Error in printBill:', error);
            View.showAlert('Error processing order: ' + error.message, 'error');
        }
    },

    // Print Kitchen Ticket for Takeaway Order
    printKitchenTicketForTakeaway(order) {
        // Convert takeaway order to format expected by kitchen ticket
        const kotOrder = {
            orderId: order.id || 'TAK-' + order.id,
            orderType: 'TAKEAWAY',
            tableNumber: null,
            items: order.items,
            cashier: order.user
        };
        
        const kitchenTicketHTML = View.generateKitchenTicketHTML(kotOrder);
        
        // Open print window
        const printWindow = window.open('', '', 'height=600,width=400');
        printWindow.document.write(`
            <html>
            <head>
                <title>Kitchen Order Ticket - ${kotOrder.orderId}</title>
                <style>
                    body { 
                        font-family: 'Courier New', monospace; 
                        padding: 10px;
                        margin: 0;
                    }
                    .receipt { margin: 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; text-align: left; }
                    @media print {
                        body { margin: 0; padding: 10px; }
                    }
                </style>
            </head>
            <body>
                ${kitchenTicketHTML}
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    // Print Kitchen Ticket from Current Cart (Takeaway)
    printKitchenTicketFromCart() {
        const cart = Model.getCart();
        
        if (cart.length === 0) {
            Swal.fire('Error', 'Cart is empty!', 'error');
            return;
        }

        // Create a takeaway order and save it to activeOrders
        const result = Model.createTakeawayOrder();
        if (!result.success) {
            Swal.fire('Error', 'Failed to create order', 'error');
            return;
        }

        // Add cart items to the order
        cart.forEach((item) => {
            // Cart stores 'productId', not 'id'
            const productId = item.productId || item.id;
            const addResult = Model.addItemToOrder(productId, item.quantity);
            
            if (!addResult.success) {
                console.error(`Failed to add item ${item.name}:`, addResult.error);
            }
        });

        // Update order totals
        Model.updateOrderTotals();
        
        // Get the updated order
        const kotOrder = Model.getCurrentOrder();
        
        if (!kotOrder.items || kotOrder.items.length === 0) {
            Swal.fire('Error', 'Failed to add items to order. Please try again.', 'error');
            return;
        }
        
        const kitchenTicketHTML = View.generateKitchenTicketHTML(kotOrder);
        
        // Open print window
        const printWindow = window.open('', '', 'height=600,width=400');
        printWindow.document.write(`
            <html>
            <head>
                <title>Kitchen Order Ticket - ${kotOrder.orderId}</title>
                <style>
                    body { 
                        font-family: 'Courier New', monospace; 
                        padding: 10px;
                        margin: 0;
                    }
                    .receipt { margin: 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; text-align: left; }
                    @media print {
                        body { margin: 0; padding: 10px; }
                    }
                </style>
            </head>
            <body>
                ${kitchenTicketHTML}
                <script>
                    window.onload = function() {
                        window.print();
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        // Clear the cart after sending to kitchen
        Model.clearCart();
        this.renderCart();
        
        Swal.fire('Success', 'Kitchen ticket sent to printer! Order saved for later payment.', 'success');
    },

    // Show pending call orders (KOT orders sent to kitchen but not yet paid)
    showPendingCallOrders() {
        const activeOrders = Model.activeOrders || [];
        const callOrders = activeOrders.filter(order => 
            order.orderType === 'TAKEAWAY' && 
            (order.status === 'OPEN' || order.status === 'TEMP_BILL')
        );

        if (callOrders.length === 0) {
            Swal.fire('Info', 'No pending call orders', 'info');
            return;
        }

        // Create HTML for call orders list
        let ordersHTML = `
            <div style="max-height: 400px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f3f4f6; text-align: left;">
                            <th style="padding: 10px; border-bottom: 2px solid #ddd;">Order ID</th>
                            <th style="padding: 10px; border-bottom: 2px solid #ddd;">Items</th>
                            <th style="padding: 10px; border-bottom: 2px solid #ddd;">Total</th>
                            <th style="padding: 10px; border-bottom: 2px solid #ddd;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        callOrders.forEach(order => {
            const itemCount = order.items ? order.items.length : 0;
            const total = order.total || order.totals?.total || 0;
            ordersHTML += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 10px;">${order.orderId || order.id}</td>
                    <td style="padding: 10px;">${itemCount} items</td>
                    <td style="padding: 10px;">${Model.formatCurrency(total)}</td>
                    <td style="padding: 10px; display: flex; gap: 5px;">
                        <button class="load-order-btn" data-order-id="${order.orderId || order.id}" 
                                style="padding: 5px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Load
                        </button>
                        <button class="delete-order-btn" data-order-id="${order.orderId || order.id}" 
                                style="padding: 5px 10px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        ordersHTML += `
                    </tbody>
                </table>
            </div>
        `;

        Swal.fire({
            title: 'Pending Call Orders',
            html: ordersHTML,
            width: '600px',
            showCloseButton: true,
            showConfirmButton: false,
            didOpen: () => {
                // Add event listeners to all load buttons
                const loadButtons = document.querySelectorAll('.load-order-btn');
                loadButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const orderId = btn.getAttribute('data-order-id');
                        Controller.loadCallOrderToCart(orderId);
                    });
                });
                
                // Add event listeners to all delete buttons
                const deleteButtons = document.querySelectorAll('.delete-order-btn');
                deleteButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const orderId = btn.getAttribute('data-order-id');
                        Controller.deleteCallOrder(orderId);
                    });
                });
            }
        });
    },

    // Load a call order into the cart for payment
    loadCallOrderToCart(orderId) {
        const order = Model.activeOrders.find(o => (o.orderId || o.id) === orderId);
        
        if (!order) {
            Swal.fire('Error', 'Order not found', 'error');
            return;
        }

        // Clear current cart first
        Model.clearCart();
        
        // Load order items into cart
        if (order.items && order.items.length > 0) {
            order.items.forEach((item) => {
                // addToCart expects just the productId
                const productId = item.productId;
                
                // Add the item once
                const added = Model.addToCart(productId);
                
                if (added) {
                    // Then update the quantity to match the order
                    if (item.quantity > 1) {
                        Model.updateCartQuantity(productId, item.quantity);
                    }
                } else {
                    console.error(`Failed to add product ${productId} to cart`);
                }
            });
        }

        // Store the order ID for later reference when completing payment
        sessionStorage.setItem('activeCallOrderId', orderId);

        // Update display
        this.renderCart();
        
        // Close the modal
        Swal.close();
        
        Swal.fire({
            title: 'Order Loaded',
            text: `Order ${orderId} loaded to cart. Customer can now make payment.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    },

    // Delete a call order
    deleteCallOrder(orderId) {
        Swal.fire({
            title: 'Delete Order?',
            text: `Are you sure you want to delete order ${orderId}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Remove from active orders
                const orderIndex = Model.activeOrders.findIndex(o => (o.orderId || o.id) === orderId);
                
                if (orderIndex !== -1) {
                    Model.activeOrders.splice(orderIndex, 1);
                    Model.saveActiveOrders();
                    
                    Swal.fire('Deleted!', 'Order has been deleted.', 'success');
                    
                    // Refresh the call orders list
                    this.showPendingCallOrders();
                } else {
                    Swal.fire('Error', 'Order not found', 'error');
                }
            }
        });
    },

    // Close receipt modal
    closeReceipt() {
        View.hideModal('receiptModal');
    },

    // ========================================
    // 5. ORDER MANAGEMENT
    // ========================================

    //  Load Orders (Today's orders only)
    loadOrders() {
        // Check for daily reset before loading orders
        const report = Model.checkDailyReset();
        if (report && report.orderCount > 0) {
            Swal.fire({
                title: 'New Day Started!',
                text: `Yesterday's orders (${report.orderCount} orders, ${Model.formatCurrency(report.totalRevenue)}) have been moved to Sales History.`,
                icon: 'info',
                timer: 3000,
                showConfirmButton: false
            });
        }
        
        const orders = Model.getTodayOrders();
        View.renderOrdersTable(orders);
    },

    //  View Order
    viewOrder(orderId) {
        const order = Model.getOrderById(orderId);
        if (order) {
            // Ensure order has proper structure for receipt generation
            // The order should already have all needed properties from storage
            View.generateReceipt(order);
            View.showModal('receiptModal');
        } else {
            Swal.fire('Error', 'Order not found', 'error');
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
        
        // Build detailed breakdown by category and product
        let detailedBreakdown = '';
        Object.keys(stats.categoryStats).sort().forEach(category => {
            const catData = stats.categoryStats[category];
            detailedBreakdown += `\n *${category}* (${Model.formatCurrency(catData.amount)})\n`;
            
            // Sort products by quantity (highest first)
            const products = Object.entries(catData.products)
                .sort((a, b) => b[1].count - a[1].count);
            
            products.forEach(([productName, productData]) => {
                detailedBreakdown += `  \u2022 ${productData.count}x ${productName} - ${Model.formatCurrency(productData.amount)}\n`;
            });
        });
        
        const message = `*${Model.getRestaurantName()}*\n` +
                       `\u{1F4CA} *ORDER HISTORY REPORT*\n` +
                       `━━━━━━━━━━━━━━━━━━\n` +
                       `\u{1F4C5} Date: ${today}\n` +
                       `\u23F0 Time: ${now}\n\n` +
                       `\u{1F4CA} *SUMMARY*\n` +
                       `\u{1F4CB} Total Orders: *${stats.totalOrders}*\n` +
                       `\u{1F371} Total Items Sold: *${stats.totalItems}*\n` +
                       `\u{1F4B0} Total Income: *${Model.formatCurrency(stats.totalAmount)}*\n` +
                       `━━━━━━━━━━━━━━━━━━\n` +
                       `\u{1F4CA} *DETAILED BREAKDOWN*` +
                       `${detailedBreakdown}\n` +
                       `━━━━━━━━━━━━━━━━━━\n` +
                       `\u{1F464} Generated by: ${Model.currentUser ? Model.currentUser.username : 'Admin'}`;
        
        // Create WhatsApp link
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;
        
        // Open WhatsApp in new window
        window.open(whatsappUrl, '_blank');
        
        View.showAlert('Opening WhatsApp...', 'success');
    },
    
    // Load 3-month sales history
    loadSalesHistory() {
        try {
            const summary = Model.getThreeMonthSummary();
            View.renderSalesHistory(summary);
        } catch (error) {
            console.error('Error loading sales history:', error);
            View.showAlert('Error loading sales history', 'error');
        }
    },
    
    // Manually save current day to history
    saveCurrentDayToHistory() {
        const result = Model.saveCurrentDayToHistory();
        if (result.success) {
            View.showAlert('Current day orders saved to history!', 'success');
            this.loadSalesHistory(); // Refresh the view
        } else {
            View.showAlert(result.message || 'No orders to save', 'info');
        }
    },
    
    // View specific month details
    viewMonthDetails(monthKey) {
        try {
            const monthData = Model.getMonthHistory(monthKey);
            if (monthData) {
                View.showMonthDetailsModal(monthData);
            } else {
                View.showAlert('Month data not found', 'error');
            }
        } catch (error) {
            console.error('Error viewing month details:', error);
            View.showAlert('Error loading month details', 'error');
        }
    },
    
    // Export sales history to WhatsApp
    exportSalesHistory() {
        const settings = Model.getSettings();
        const adminPhone = settings.adminPhone;
        
        if (!adminPhone) {
            View.showAlert('Please set Admin WhatsApp number in Settings first!', 'error');
            return;
        }
        
        try {
            const summary = Model.getThreeMonthSummary();
            
            if (summary.months.length === 0) {
                View.showAlert('No sales history available', 'info');
                return;
            }
            
            // Build comprehensive report
            let monthlyBreakdown = '';
            summary.months.forEach(month => {
                monthlyBreakdown += `\n\u{1F4C5} *${month.month}*\n`;
                monthlyBreakdown += `  Orders: ${month.totalOrders}\n`;
                monthlyBreakdown += `  Items: ${month.totalItems}\n`;
                monthlyBreakdown += `  Revenue: ${Model.formatCurrency(month.totalRevenue)}\n`;
            });
            
            // Top 5 products
            const topProducts = Object.entries(summary.productTotals)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map((([name, data], i) => `${i + 1}. ${name} (${data.count}x)`));
            
            const message = `*${Model.getRestaurantName()}*\n` +
                           `\u{1F4CA} *3-MONTH SALES HISTORY*\n` +
                           `━━━━━━━━━━━━━━━━━━\n\n` +
                           `\u{1F4CA} *OVERALL SUMMARY*\n` +
                           `\u{1F4CB} Total Orders: *${summary.totalOrders}*\n` +
                           `\u{1F371} Total Items: *${summary.totalItems}*\n` +
                           `\u{1F4B0} Total Revenue: *${Model.formatCurrency(summary.totalRevenue)}*\n` +
                           `\u{1F4B5} Avg Order: *${Model.formatCurrency(summary.averageOrderValue)}*\n` +
                           `━━━━━━━━━━━━━━━━━━\n` +
                           `\u{1F4C5} *MONTHLY BREAKDOWN*` +
                           `${monthlyBreakdown}\n` +
                           `━━━━━━━━━━━━━━━━━━\n` +
                           `\u{1F31F} *TOP 5 PRODUCTS*\n` +
                           `${topProducts.join('\n')}\n` +
                           `━━━━━━━━━━━━━━━━━━\n` +
                           `\u{1F4C6} Generated: ${new Date().toLocaleString()}\n` +
                           `\u{1F464} By: ${Model.currentUser ? Model.currentUser.username : 'Admin'}`;
            
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodedMessage}`;
            
            window.open(whatsappUrl, '_blank');
            View.showAlert('Opening WhatsApp with 3-month summary...', 'success');
        } catch (error) {
            console.error('Error exporting sales history:', error);
            View.showAlert('Error exporting sales history', 'error');
        }
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
            serviceCharge: document.getElementById('serviceChargeRate').value,
            diningServiceCharge: document.getElementById('diningServiceChargeRate').value,
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
        
        //  Set service charge rate (takeaway)
        Model.setServiceChargeRate(sanitized.serviceCharge);
        
        //  Set dining service charge rate
        if (sanitized.diningServiceCharge !== undefined) {
            Model.settings.diningServiceChargeRate = parseFloat(sanitized.diningServiceCharge) || 0;
            Model.saveToLocalStorage('settings', Model.settings);
        }
        
        //  Apply discount
        Model.applyDiscount(sanitized.discount);
        
        //  Update admin phone
        Model.updateAdminPhone(sanitized.phone);

        View.showAlert('Settings updated successfully!', 'success');
        this.updateSettingsUI();
        this.renderCart(); // Update totals
        
        // Update dining order totals if there's an active order
        if (Model.getCurrentOrder()) {
            Model.updateOrderTotals();
            const currentOrder = Model.getCurrentOrder();
            View.renderCurrentOrderInfo(currentOrder);
            View.renderDiningOrderItems(currentOrder);
            View.updateDiningOrderSummary(currentOrder);
        }
        
        this.updateRestaurantNameInHeader(); // Update header name
    },

    // Category Management Functions
    loadCategoryManagement() {
        Model.loadCategoryHierarchy();
        View.renderCategoryManagement();
        this.populateCategoryDropdowns();
    },

    populateCategoryDropdowns() {
        const mainCategories = Model.getMainCategories().filter(c => c !== 'All');
        const select = document.getElementById('mainCategoryForSub');
        if (select) {
            select.innerHTML = '<option value="">Select Main Category</option>' +
                mainCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    },

    addMainCategory() {
        const input = document.getElementById('newMainCategory');
        const categoryName = input?.value.trim();
        
        if (!categoryName) {
            View.showAlert('Please enter a category name', 'error');
            return;
        }

        const result = Model.addMainCategory(categoryName);
        if (result.success) {
            View.showAlert('Main category added successfully!', 'success');
            input.value = '';
            this.loadCategoryManagement();
            View.populateMainCategoryDropdowns();
        } else {
            View.showAlert(result.error, 'error');
        }
    },

    addSubCategory() {
        const mainCatSelect = document.getElementById('mainCategoryForSub');
        const subCatInput = document.getElementById('newSubCategory');
        
        const mainCategory = mainCatSelect?.value;
        const subCategory = subCatInput?.value.trim();

        if (!mainCategory) {
            View.showAlert('Please select a main category', 'error');
            return;
        }

        if (!subCategory) {
            View.showAlert('Please enter a sub category name', 'error');
            return;
        }

        const result = Model.addSubCategory(mainCategory, subCategory);
        if (result.success) {
            View.showAlert('Sub category added successfully!', 'success');
            subCatInput.value = '';
            this.loadCategoryManagement();
            View.populateMainCategoryDropdowns();
            View.populateAllSubCategoriesFilter();
        } else {
            View.showAlert(result.error, 'error');
        }
    },

    async deleteMainCategory(mainCategory) {
        const confirmed = await View.showConfirm(
            `Are you sure you want to delete the main category "${mainCategory}"?`
        );
        
        if (confirmed) {
            const result = Model.deleteMainCategory(mainCategory);
            if (result.success) {
                View.showAlert('Main category deleted successfully!', 'success');
                this.loadCategoryManagement();
                View.populateMainCategoryDropdowns();
            } else {
                View.showAlert(result.error, 'error');
            }
        }
    },

    async deleteSubCategory(mainCategory, subCategory) {
        const confirmed = await View.showConfirm(
            `Are you sure you want to delete "${subCategory}" from "${mainCategory}"?`
        );
        
        if (confirmed) {
            const result = Model.deleteSubCategory(mainCategory, subCategory);
            if (result.success) {
                View.showAlert('Sub category deleted successfully!', 'success');
                this.loadCategoryManagement();
                View.populateAllSubCategoriesFilter();
            } else {
                View.showAlert(result.error, 'error');
            }
        }
    },

    async renameMainCategory(oldName) {
        const newName = prompt(`Enter new name for "${oldName}":`, oldName);
        
        if (newName && newName.trim() !== oldName) {
            const result = Model.renameMainCategory(oldName, newName.trim());
            if (result.success) {
                View.showAlert('Main category renamed successfully!', 'success');
                this.loadCategoryManagement();
                this.loadProducts();
                View.populateMainCategoryDropdowns();
            } else {
                View.showAlert(result.error, 'error');
            }
        }
    },

    async renameSubCategory(mainCategory, oldName) {
        const newName = prompt(`Enter new name for "${oldName}":`, oldName);
        
        if (newName && newName.trim() !== oldName) {
            const result = Model.renameSubCategory(mainCategory, oldName, newName.trim());
            if (result.success) {
                View.showAlert('Sub category renamed successfully!', 'success');
                this.loadCategoryManagement();
                this.loadProducts();
                View.populateAllSubCategoriesFilter();
            } else {
                View.showAlert(result.error, 'error');
            }
        }
    },

    // Update restaurant name in the header
    updateRestaurantNameInHeader() {
        const restaurantName = Model.getRestaurantName();
        const headerTitle = document.querySelector('.header h1');
        if (headerTitle) {
            headerTitle.innerHTML = `<i class="fas fa-utensils"></i> ${restaurantName}`;
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
        
        // Build detailed breakdown by category and product
        let detailedBreakdown = '';
        Object.keys(stats.categoryStats).sort().forEach(category => {
            const catData = stats.categoryStats[category];
            detailedBreakdown += `\n *${category}* (${Model.formatCurrency(catData.amount)})\n`;
            
            // Sort products by quantity (highest first)
            const products = Object.entries(catData.products)
                .sort((a, b) => b[1].count - a[1].count);
            
            products.forEach(([productName, productData]) => {
                detailedBreakdown += `  • ${productData.count}x ${productName} - ${Model.formatCurrency(productData.amount)}\n`;
            });
        });
        
        const message = `*${Model.getRestaurantName()}*\n` +
                       ` *Daily Report - ${dateStr}*\n` +
                       `━━━━━━━━━━━━━━━━━━\n\n` +
                       ` *SUMMARY*\n` +
                       ` Total Orders: *${stats.totalOrders}*\n` +
                       ` Total Items Sold: *${stats.totalItems}*\n` +
                       ` Total Income: *${Model.formatCurrency(stats.totalAmount)}*\n` +
                       `━━━━━━━━━━━━━━━━━━\n` +
                       ` *DETAILED BREAKDOWN*` +
                       `${detailedBreakdown}\n` +
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
    async clearAllData() {
        const confirmed = await Swal.fire({
            title: 'Clear All Data?',
            html: '<strong>⚠️ WARNING!</strong><br>This will delete:<br>• All products<br>• All orders<br>• Sales history<br>• Settings<br>• User data<br><br>This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Clear Everything',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc2626',
            input: 'checkbox',
            inputPlaceholder: 'I understand this will delete all data'
        });
        
        if (confirmed.isConfirmed && confirmed.value) {
            localStorage.clear();
            View.showAlert('All data cleared successfully! Page will reload.', 'success');
            setTimeout(() => location.reload(), 1500);
        } else if (confirmed.isConfirmed) {
            View.showAlert('Please confirm by checking the box', 'error');
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
            // Show loading state with spinner
            appRoot.innerHTML = '<div class="loading" style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 1rem;"><i class="fas fa-spinner fa-spin" style="font-size: 3rem; color: var(--primary-color);"></i><p style="color: var(--text-color); font-size: 1.1rem;">Loading...</p></div>';

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
                    case 'dining':
                        this.loadDiningPage();
                        this.updateRestaurantNameInHeader();
                        break;
                    case 'orders':
                        this.loadOrders();
                        this.updateRestaurantNameInHeader();
                        break;
                    case 'settings':
                        this.updateSettingsUI();
                        this.setupSettingsPageListeners();
                        this.loadCategoryManagement();
                        this.updateRestaurantNameInHeader();
                        break;
                    case 'history':
                        this.loadSalesHistory();
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
            'dining': ['admin', 'cashier', null], // Dining page access
            'products': ['admin'],
            'orders': ['admin'],
            'settings': ['admin'],
            'history': ['admin'] // Only admin can view sales history
        };
        
        const allowedRoles = permissions[pageName];
        if (!allowedRoles) return true; // Allow if no restriction
        
        const userRole = user ? user.role : null;
        return allowedRoles.includes(userRole);
    },

    // ========================================
    // DINING & TABLE MANAGEMENT CONTROLLERS
    // ========================================

    // Load Dining Page
    loadDiningPage() {
        Model.loadTables();
        Model.loadActiveOrders();
        
        const tables = Model.getAllTables();
        const activeOrders = Model.getActiveOrders();
        const currentOrder = Model.getCurrentOrder();
        
        View.renderTablesGrid(tables, currentOrder ? currentOrder.tableId : null);
        View.renderActiveOrdersSummary(activeOrders);
        View.renderCurrentOrderInfo(currentOrder);
        
        if (currentOrder) {
            this.showDiningOrderPanels(currentOrder);
        }
    },

    // Refresh Tables
    refreshTables() {
        this.loadDiningPage();
    },

    // Add new table
    addNewTable() {
        Swal.fire({
            title: 'Add New Table',
            text: 'Are you sure you want to add a new table?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, Add Table'
        }).then((result) => {
            if (result.isConfirmed) {
                const response = Model.addTable();
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Table Added!',
                        text: `Table ${response.tableId} has been created`,
                        timer: 1500,
                        showConfirmButton: false
                    });
                    this.loadDiningPage();
                }
            }
        });
    },

    // Show delete table modal
    showDeleteTableModal() {
        const tables = Model.getAllTables();
        const freeTables = tables.filter(t => t.status === 'FREE');
        
        if (freeTables.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'No Free Tables',
                text: 'All tables are occupied. Free a table first before deleting.'
            });
            return;
        }

        const tableOptions = freeTables.reduce((obj, table) => {
            obj[table.id] = `Table ${table.number}`;
            return obj;
        }, {});

        Swal.fire({
            title: 'Delete Table',
            text: 'Select a table to delete',
            input: 'select',
            inputOptions: tableOptions,
            inputPlaceholder: 'Select a table',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Delete',
            inputValidator: (value) => {
                if (!value) {
                    return 'Please select a table!'
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteTable(result.value);
            }
        });
    },

    // Delete table
    deleteTable(tableId) {
        const response = Model.deleteTable(tableId);
        if (response.success) {
            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Table has been deleted.',
                timer: 1500,
                showConfirmButton: false
            });
            this.loadDiningPage();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: response.error
            });
        }
    },

    // Handle Table Click
    handleTableClick(tableId) {
        const table = Model.getTableById(tableId);
        if (!table) return;

        // If table is occupied, load the order
        if (table.status === 'OCCUPIED' && table.orderId) {
            const result = Model.selectOrder(table.orderId);
            if (result.success) {
                this.showDiningOrderPanels(result.order);
                View.renderTablesGrid(Model.getAllTables(), tableId);
            }
        } else {
            // Table is free, create new order
            Swal.fire({
                title: `Open Table ${table.number}?`,
                text: 'Start a new dining order for this table',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Open Table',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    const orderResult = Model.createDiningOrder(tableId);
                    if (orderResult.success) {
                        this.showDiningOrderPanels(orderResult.order);
                        View.renderTablesGrid(Model.getAllTables(), tableId);
                        View.renderActiveOrdersSummary(Model.getActiveOrders());
                        
                        Swal.fire({
                            icon: 'success',
                            title: 'Table Opened!',
                            text: `Table ${table.number} is now open. Start adding items.`,
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } else {
                        Swal.fire('Error', orderResult.error, 'error');
                    }
                }
            });
        }
    },

    // Show Dining Order Panels
    showDiningOrderPanels(order) {
        View.renderCurrentOrderInfo(order);
        View.toggleDiningOrderPanels(true);
        
        // Load products
        const products = Model.getAllProducts();
        View.renderDiningProductsGrid(products);
        View.renderDiningCategoryFilters();
        
        // Render order items and summary
        View.renderDiningOrderItems(order);
        View.updateDiningOrderSummary(order);
    },

    // Filter Dining Products by Category
    filterDiningByCategory(category) {
        let products;
        if (category === 'All') {
            products = Model.getAllProducts();
        } else {
            products = Model.filterProductsByMainCategory(category);
        }
        View.renderDiningProductsGrid(products);
        View.renderDiningCategoryFilters(category);
    },

    // Search Dining Products
    searchDiningProducts() {
        const searchInput = document.getElementById('diningProductSearch');
        const searchTerm = searchInput ? searchInput.value : '';
        
        const products = Model.searchProducts(searchTerm);
        View.renderDiningProductsGrid(products);
    },

    // Add Item to Dining Order
    addItemToDiningOrder(productId) {
        const result = Model.addItemToOrder(productId, 1);
        
        if (result.success) {
            const order = Model.getCurrentOrder();
            View.renderDiningOrderItems(order);
            View.updateDiningOrderSummary(order);
            
            // Play success sound or animation
            this.showQuickFeedback('Item added!');
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    },

    // Update Dining Item Quantity
    updateDiningItemQty(productId, newQty) {
        // Add upper limit validation
        if (newQty > 999) {
            View.showAlert('Maximum quantity is 999 items', 'warning');
            newQty = 999;
        }
        if (newQty < 1) {
            this.removeDiningItem(productId);
            return;
        }
        
        const result = Model.updateItemQuantity(productId, newQty);
        
        if (result.success) {
            const order = Model.getCurrentOrder();
            View.renderDiningOrderItems(order);
            View.updateDiningOrderSummary(order);
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    },

    // Remove Dining Item
    removeDiningItem(productId) {
        Swal.fire({
            title: 'Remove Item?',
            text: 'Are you sure you want to remove this item?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Remove',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                const removeResult = Model.removeItemFromOrder(productId);
                if (removeResult.success) {
                    const order = Model.getCurrentOrder();
                    View.renderDiningOrderItems(order);
                    View.updateDiningOrderSummary(order);
                }
            }
        });
    },

    // Generate Temporary Bill
    generateTempBill() {
        const order = Model.getCurrentOrder();
        if (!order) {
            Swal.fire('Error', 'No active order', 'error');
            return;
        }

        if (order.items.length === 0) {
            Swal.fire('Error', 'Order is empty. Please add items first.', 'error');
            return;
        }

        const result = Model.generateTemporaryBill();
        if (result.success) {
            const billHTML = View.generateTempBillHTML(result.order);
            View.showTempBillModal(billHTML);
            
            // Update order info
            View.renderCurrentOrderInfo(result.order);
            View.renderActiveOrdersSummary(Model.getActiveOrders());
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    },

    // Print Kitchen Order Ticket
    printKitchenTicket(order) {
        if (!order) {
            order = Model.getCurrentOrder();
        }
        
        if (!order) {
            Swal.fire('Error', 'No order to print', 'error');
            return;
        }

        if (!order.items || order.items.length === 0) {
            Swal.fire('Error', 'Order is empty', 'error');
            return;
        }

        const kitchenTicketHTML = View.generateKitchenTicketHTML(order);
        
        // Open print window
        const printWindow = window.open('', '', 'height=600,width=400');
        printWindow.document.write(`
            <html>
            <head>
                <title>Kitchen Order Ticket - ${order.orderId}</title>
                <style>
                    body { 
                        font-family: 'Courier New', monospace; 
                        padding: 10px;
                        margin: 0;
                    }
                    .receipt { margin: 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; text-align: left; }
                    @media print {
                        body { margin: 0; padding: 10px; }
                    }
                </style>
            </head>
            <body>
                ${kitchenTicketHTML}
                <script>
                    window.onload = function() {
                        window.print();
                        // Uncomment to auto-close: window.close();
                    }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    // Close Temp Bill Modal
    closeTempBill() {
        View.closeTempBillModal();
    },

    // Show Payment Modal
    showPaymentModal() {
        const order = Model.getCurrentOrder();
        if (!order) {
            Swal.fire('Error', 'No active order', 'error');
            return;
        }

        if (order.items.length === 0) {
            Swal.fire('Error', 'Order is empty', 'error');
            return;
        }

        View.showPaymentModal(order.total);
    },

    // Close Payment Modal
    closePaymentModal() {
        View.closePaymentModal();
    },

    // Process Payment
    processPayment() {
        const paymentInput = document.getElementById('paymentAmount');
        const paymentAmount = parseFloat(paymentInput.value) || 0;
        
        const result = Model.processFinalBill(paymentAmount);
        
        if (result.success) {
            View.closePaymentModal();
            
            // Show final bill
            const billHTML = View.generateFinalBillHTML(result.order);
            const receiptContent = document.getElementById('receiptContent');
            const receiptModal = document.getElementById('receiptModal');
            
            if (receiptContent && receiptModal) {
                receiptContent.innerHTML = billHTML;
                receiptModal.style.display = 'flex';
            }
            
            // Update UI
            View.renderCurrentOrderInfo(result.order);
            View.renderActiveOrdersSummary(Model.getActiveOrders());
            
            // Ask to close order
            setTimeout(() => {
                Swal.fire({
                    title: 'Payment Successful!',
                    text: 'Close this order and free the table?',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Close Order',
                    cancelButtonText: 'Keep Open'
                }).then((closeResult) => {
                    if (closeResult.isConfirmed) {
                        this.closeOrder();
                    }
                });
            }, 500);
            
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    },

    // Close Order
    closeOrder() {
        const result = Model.closeCurrentOrder();
        
        if (result.success) {
            // Refresh the page
            this.loadDiningPage();
            View.toggleDiningOrderPanels(false);
            
            // Refresh orders page if it's currently active
            const currentPage = document.querySelector('.nav-link.active');
            if (currentPage && currentPage.textContent.includes('Orders')) {
                this.loadOrders();
            }
            
            Swal.fire({
                icon: 'success',
                title: 'Order Closed!',
                text: 'Table is now free for new customers',
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    },

    // Cancel Order
    cancelOrder() {
        const order = Model.getCurrentOrder();
        if (!order) return;

        Swal.fire({
            title: 'Cancel Order?',
            text: 'This will delete the order and free the table. This action cannot be undone!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Cancel Order',
            cancelButtonText: 'No, Keep Order',
            confirmButtonColor: '#dc2626'
        }).then((result) => {
            if (result.isConfirmed) {
                const cancelResult = Model.cancelCurrentOrder();
                if (cancelResult.success) {
                    this.loadDiningPage();
                    View.toggleDiningOrderPanels(false);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Order Cancelled',
                        text: 'Order has been cancelled and table is freed',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }
        });
    },

    // Show Active Orders Modal
    showActiveOrdersModal() {
        const activeOrders = Model.getActiveOrders();
        View.renderActiveOrdersList(activeOrders);
        View.showActiveOrdersModal();
    },

    // Close Active Orders Modal
    closeActiveOrdersModal() {
        View.closeActiveOrdersModal();
    },

    // Select Active Order from Modal
    selectActiveOrder(orderId) {
        const result = Model.selectOrder(orderId);
        if (result.success) {
            View.closeActiveOrdersModal();
            this.showDiningOrderPanels(result.order);
            View.renderTablesGrid(Model.getAllTables(), result.order.tableId);
        }
    },

    // ========================================
    // TAKEAWAY ORDER MANAGEMENT
    // ========================================

    // Create Takeaway Order (from POS page)
    createTakeawayOrder() {
        const result = Model.createTakeawayOrder();
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Takeaway Order Created!',
                text: `Order ID: ${result.order.orderId}`,
                timer: 2000,
                showConfirmButton: false
            });
            
            // You can redirect to a takeaway-specific view if needed
            // Or continue using the existing POS interface
        } else {
            Swal.fire('Error', result.error, 'error');
        }
    },

    // Show Quick Feedback (for better UX)
    showQuickFeedback(message) {
        const toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
        });
        
        toast.fire({
            icon: 'success',
            title: message
        });
    }
};

