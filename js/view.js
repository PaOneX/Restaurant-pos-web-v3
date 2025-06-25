// ========================================
// VIEW LAYER - UI Rendering
// ========================================

const View = {
    
    // ========================================
    // 1. PRODUCT VIEW FUNCTIONS
    // ========================================

    // 4ï¸âƒ£ Display Products in Management Table
    renderProductsTable(products) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td data-label="Product ID">${Security.escapeHTML(product.id)}</td>
                <td data-label="Product Name">${Security.escapeHTML(product.name)}</td>
                <td data-label="Main Category">${Security.escapeHTML(product.mainCategory || product.category || 'N/A')}</td>
                <td data-label="Sub Category">${Security.escapeHTML(product.subCategory || 'N/A')}</td>
                <td data-label="Price">${Model.formatCurrency(product.price)}</td>
                <td data-label="Stock">${product.stock}</td>
                <td data-label="Actions">
                    <button class="btn btn-sm btn-edit" onclick="Controller.editProduct('${Security.escapeHTML(product.id)}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="Controller.deleteProduct('${Security.escapeHTML(product.id)}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // 1ï¸âƒ£1ï¸âƒ£ Display Products in POS Grid
    renderProductsGrid(products) {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        if (products.length === 0) {
            grid.innerHTML = '<p class="text-center">No products available</p>';
            return;
        }

        grid.innerHTML = products.map(product => `
            <div class="product-card" onclick="Controller.addToCart('${product.id}')">
                <div class="product-icon">
                    <i class="fas fa-utensils"></i>
                </div>
                <h4>${product.name}</h4>
                <p class="category">${product.subCategory || product.category || 'Uncategorized'}</p>
                <p class="price">${Model.formatCurrency(product.price)}</p>
                <p class="stock">Stock: ${product.stock}</p>
            </div>
        `).join('');
    },

    // Render POS Main Category Filters
    renderPOSMainCategoryFilters(selectedMainCategory = 'All') {
        const container = document.getElementById('mainCategoryFilters');
        if (!container) return;

        const mainCategories = Model.getMainCategories();
        container.innerHTML = mainCategories.map(cat => `
            <button class="category-btn ${cat === selectedMainCategory ? 'active' : ''}" 
                    onclick="Controller.filterPOSByMainCategory('${cat}')">
                <i class="fas fa-${this.getMainCategoryIcon(cat)}"></i>
                <span>${cat}</span>
            </button>
        `).join('');
    },

    // Render POS Sub Category Filters
    renderPOSSubCategoryFilters(mainCategory, selectedSubCategory = 'All') {
        const container = document.getElementById('subCategoryFilters');
        if (!container) return;

        if (!mainCategory || mainCategory === 'All') {
            container.innerHTML = '';
            return;
        }

        const subCategories = Model.getSubCategories(mainCategory);
        container.innerHTML = subCategories.map(cat => `
            <button class="category-btn ${cat === selectedSubCategory ? 'active' : ''}" 
                    onclick="Controller.filterPOSBySubCategory('${cat}')">
                <span>${cat}</span>
            </button>
        `).join('');
    },

    // Render POS Category Filters (legacy support)
    renderPOSCategoryFilters(categories, selectedCategory = 'All') {
        const container = document.getElementById('categoryFilters');
        if (!container) return;

        container.innerHTML = categories.map(cat => `
            <button class="category-btn ${cat === selectedCategory ? 'active' : ''}" 
                    onclick="Controller.filterPOSByCategory('${cat}')">
                <i class="fas fa-${this.getCategoryIcon(cat)}"></i>
                <span>${cat}</span>
            </button>
        `).join('');
    },

    // Get icon for main category
    getMainCategoryIcon(category) {
        const icons = {
            'All': 'th',
            'Sri Lankan': 'flag',
            'International': 'globe',
            'Beverages': 'mug-hot',
            'Meat': 'drumstick-bite'
        };
        return icons[category] || 'utensils';
    },

    // Get icon for category
    getCategoryIcon(category) {
        const icons = {
            'All': 'th',
            'Fried Rice': 'bowl-rice',
            'Kottu': 'mortar-pestle',
            'Pasta': 'stroopwafel',
            'Noodles': 'wheat-awn',
            'Beverages': 'mug-hot'
        };
        return icons[category] || 'utensils';
    },

    // Populate category filter dropdown
    renderCategoryFilter(categories) {
        const select = document.getElementById('categoryFilter');
        if (!select) return;

        select.innerHTML = categories.map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
    },

    // Populate main category dropdowns
    populateMainCategoryDropdowns() {
        const mainCategories = Model.getMainCategories();
        
        // Product form dropdown
        const formSelect = document.getElementById('productMainCategory');
        if (formSelect) {
            formSelect.innerHTML = '<option value="">Select Main Category</option>' +
                mainCategories.filter(cat => cat !== 'All').map(cat => 
                    `<option value="${cat}">${cat}</option>`
                ).join('');
        }
        
        // Filter dropdown
        const filterSelect = document.getElementById('mainCategoryFilter');
        if (filterSelect) {
            filterSelect.innerHTML = mainCategories.map(cat => 
                `<option value="${cat}">${cat}</option>`
            ).join('');
        }
    },

    // Populate subcategory dropdown based on main category
    populateSubCategoryDropdown(mainCategory, selectedSubCategory = '') {
        const subCategories = Model.getSubCategories(mainCategory);
        const formSelect = document.getElementById('productSubCategory');
        
        if (formSelect) {
            formSelect.innerHTML = '<option value="">Select Sub Category</option>' +
                subCategories.filter(cat => cat !== 'All').map(cat => 
                    `<option value="${cat}" ${cat === selectedSubCategory ? 'selected' : ''}>${cat}</option>`
                ).join('');
        }
    },

    // Populate all subcategories filter
    populateAllSubCategoriesFilter() {
        const subCategories = Model.getAllSubCategories();
        const filterSelect = document.getElementById('subCategoryFilter');
        
        if (filterSelect) {
            filterSelect.innerHTML = subCategories.map(cat => 
                `<option value="${cat}">${cat}</option>`
            ).join('');
        }
    },

    // ========================================
    // 2. CART VIEW FUNCTIONS
    // ========================================

    // 1ï¸âƒ£3ï¸âƒ£ Render Cart
    renderCart(cart) {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');

        if (!cartItems) return;

        if (cart.length === 0) {
            cartItems.innerHTML = '';
            if (emptyCart) emptyCart.style.display = 'block';
            this.updateTotalDisplay({ subtotal: 0, serviceCharge: 0, discount: 0, total: 0 });
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-row item-details">
                    <div class="item-name-wrap">
                        <h4>${item.name}</h4>
                    </div>
                    <div class="item-price-wrap">
                        <p class="item-price">${Model.formatCurrency(item.price)}</p>
                    </div>
                </div>
                <div class="item-row item-controls">
                    <button class="btn-qty" onclick="Controller.updateCartQuantity('${item.productId}', ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" value="${item.quantity}" min="1" 
                           onchange="Controller.updateCartQuantity('${item.productId}', this.value)"
                           class="qty-input">
                    <button class="btn-qty" onclick="Controller.updateCartQuantity('${item.productId}', ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn-remove" onclick="Controller.removeFromCart('${item.productId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="item-row item-subtotal-row">
                    <span class="subtotal-label">Subtotal:</span>
                    <span class="item-subtotal">${Model.formatCurrency(Model.calculateSubtotal(item.productId))}</span>
                </div>
            </div>
        `).join('');

        // Update totals
        const totals = Model.calculateTotal();
        this.updateTotalDisplay(totals);
    },

    // Update total display
    updateTotalDisplay(totals) {
        const subtotalEl = document.getElementById('subtotalAmount');
        const serviceChargeEl = document.getElementById('serviceChargeAmount');
        const discountEl = document.getElementById('discountAmount');
        const totalEl = document.getElementById('totalAmount');

        if (subtotalEl) subtotalEl.textContent = Model.formatCurrency(totals.subtotal);
        if (serviceChargeEl) serviceChargeEl.textContent = Model.formatCurrency(totals.serviceCharge);
        if (discountEl) discountEl.textContent = Model.formatCurrency(totals.discount);
        if (totalEl) totalEl.textContent = Model.formatCurrency(totals.total);
    },

    // Display balance/change
    displayBalance(balanceData) {
        const balanceDisplay = document.getElementById('balanceDisplay');
        const balanceAmount = document.getElementById('balanceAmount');

        if (!balanceDisplay || !balanceAmount) return;

        if (balanceData.payment > 0) {
            balanceDisplay.style.display = 'block';
            balanceAmount.textContent = Model.formatCurrency(Math.abs(balanceData.balance));
            
            // Color code based on sufficient payment
            if (balanceData.sufficient) {
                balanceAmount.className = 'balance-value balance-positive';
                balanceAmount.parentElement.querySelector('span:first-child').textContent = 'Change:';
            } else {
                balanceAmount.className = 'balance-value balance-negative';
                balanceAmount.parentElement.querySelector('span:first-child').textContent = 'Short:';
            }
        } else {
            balanceDisplay.style.display = 'none';
        }
    },

    clearPaymentFields() {
        const paymentInput = document.getElementById('paymentAmount');
        const balanceDisplay = document.getElementById('balanceDisplay');
        
        if (paymentInput) paymentInput.value = '';
        if (balanceDisplay) balanceDisplay.style.display = 'none';
    },

    // ========================================
    // 3. RECEIPT VIEW FUNCTIONS
    // ========================================

    // 1ï¸âƒ£9ï¸âƒ£ Generate Receipt
    generateReceipt(order) {
        const settings = Model.getSettings();
        const receiptContainer = document.getElementById('receiptContent');
        
        if (!receiptContainer) return '';

        const receiptHTML = `
            <div class="receipt">
                <div class="receipt-header">
                    <h2>${settings.restaurantName}</h2>
                    <p>Date: ${order.date.date}</p>
                    <p>Time: ${order.date.time}</p>
                    <p>Order #: ${order.id}</p>
                    <p>Cashier: ${order.user}</p>
                </div>
                <hr>
                <div class="receipt-items">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>${Model.formatCurrency(item.price)}</td>
                                    <td>${Model.formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <hr>
                <div class="receipt-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>${Model.formatCurrency(order.totals.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>Service Charge (${settings.serviceChargeRate}%):</span>
                        <span>${Model.formatCurrency(order.totals.serviceCharge)}</span>
                    </div>
                    <div class="total-row">
                        <span>Discount (${settings.discount}%):</span>
                        <span>-${Model.formatCurrency(order.totals.discount)}</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>TOTAL:</span>
                        <span>${Model.formatCurrency(order.totals.total)}</span>
                    </div>
                    ${order.payment ? `
                    <hr>
                    <div class="total-row">
                        <span>Payment:</span>
                        <span>${Model.formatCurrency(order.payment)}</span>
                    </div>
                    <div class="total-row">
                        <span>Change:</span>
                        <span>${Model.formatCurrency(order.balance)}</span>
                    </div>
                    ` : ''}
                </div>
                <hr>
                <div class="receipt-footer">
                    <p>Thank you for your order!</p>
                    <p>Please come again</p>
                </div>
            </div>
        `;

        receiptContainer.innerHTML = receiptHTML;
        return receiptHTML;
    },

    // ========================================
    // 4. ORDER HISTORY VIEW
    // ========================================

    // 2ï¸âƒ£3ï¸âƒ£ Display Orders
    renderOrdersTable(orders) {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
            return;
        }

        // Sort by date (newest first)
        const sortedOrders = [...orders].reverse();

        tbody.innerHTML = sortedOrders.map(order => `
            <tr>
                <td data-label="Order ID">${order.id}</td>
                <td data-label="Date & Time">${order.date.full}</td>
                <td data-label="Items">${order.items.length}</td>
                <td data-label="Total">${Model.formatCurrency(order.totals.total)}</td>
                <td data-label="Cashier">${order.user}</td>
                <td data-label="Actions">
                    <button class="btn btn-sm btn-view" onclick="Controller.viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="Controller.deleteOrder('${order.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // ========================================
    // 5. SETTINGS VIEW
    // ========================================

    // Update settings display
    updateSettingsDisplay(settings) {
        const nameInput = document.getElementById('restaurantName');
        const serviceChargeInput = document.getElementById('serviceChargeRate');
        const discountInput = document.getElementById('discountRate');
        const phoneInput = document.getElementById('adminPhone');

        if (nameInput) nameInput.value = settings.restaurantName;
        if (serviceChargeInput) serviceChargeInput.value = settings.serviceChargeRate;
        if (discountInput) discountInput.value = settings.discount;
        if (phoneInput) phoneInput.value = settings.adminPhone || '';

        // Update header
        const header = document.querySelector('.header h1');
        if (header) header.textContent = settings.restaurantName;
    },

    // Render Category Management
    renderCategoryManagement() {
        const container = document.getElementById('categoryList');
        if (!container) return;

        const hierarchy = Model.getCategoryHierarchy();
        const mainCategories = Object.keys(hierarchy);

        if (mainCategories.length === 0) {
            container.innerHTML = '<p class="text-muted">No categories yet. Add your first main category above.</p>';
            return;
        }

        container.innerHTML = mainCategories.map(mainCat => `
            <div class="category-main-item">
                <div class="category-main-header">
                    <h5>
                        <i class="fas fa-folder"></i>
                        ${mainCat}
                    </h5>
                    <div class="category-main-actions">
                        <button class="btn-icon" onclick="Controller.renameMainCategory('${mainCat}')" title="Rename">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="Controller.deleteMainCategory('${mainCat}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="category-sub-list">
                    ${hierarchy[mainCat].length === 0 
                        ? '<span class="text-muted" style="font-size: 0.9rem;">No subcategories</span>'
                        : hierarchy[mainCat].map(subCat => `
                            <div class="category-sub-item">
                                <span>${subCat}</span>
                                <button class="btn-icon" onclick="Controller.renameSubCategory('${mainCat}', '${subCat}')" title="Rename">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon btn-delete" onclick="Controller.deleteSubCategory('${mainCat}', '${subCat}')" title="Delete">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `).join('');
    },

    // ========================================
    // 6. PAGE NAVIGATION
    // ========================================

    // Page navigation is now handled by Controller with dynamic loading
    // Keeping this for backward compatibility
    showPage(pageName) {
        // This is now handled by Controller.showPage()
        console.log('Page navigation:', pageName);
    },

    // ========================================
    // 7. FORM HANDLING
    // ========================================

    // 6ï¸âƒ£ Fill Product Form (for editing)
    fillProductForm(product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        
        // Handle both old and new category system
        if (product.mainCategory && product.subCategory) {
            document.getElementById('productMainCategory').value = product.mainCategory;
            View.populateSubCategoryDropdown(product.mainCategory, product.subCategory);
            document.getElementById('productSubCategory').value = product.subCategory;
        } else if (product.category) {
            // Legacy category - try to map to new system
            document.getElementById('productMainCategory').value = '';
            document.getElementById('productSubCategory').value = '';
        }
        
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;

        // Change button text
        const submitBtn = document.querySelector('#productForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Product';
            submitBtn.classList.add('btn-update');
        }
    },

    // 9ï¸âƒ£ Clear Product Form
    clearProductForm() {
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        
        // Clear subcategory dropdown
        const subCatSelect = document.getElementById('productSubCategory');
        if (subCatSelect) {
            subCatSelect.innerHTML = '<option value="">Select Sub Category</option>';
        }

        // Reset button
        const submitBtn = document.querySelector('#productForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Add Product';
            submitBtn.classList.remove('btn-update');
        }
    },

    // ========================================
    // 8. ALERTS & MESSAGES
    // ========================================

    // 3ï¸âƒ£6ï¸âƒ£ Show Alert
    // Show Alert using SweetAlert2
    showAlert(message, type = 'info') {
        const iconMap = {
            'success': 'success',
            'error': 'error',
            'warning': 'warning',
            'info': 'info'
        };

        Swal.fire({
            icon: iconMap[type] || 'info',
            title: type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Info',
            text: message,
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
            timerProgressBar: true
        });
    },

    // Show confirmation dialog using SweetAlert2
    showConfirm(message) {
        return Swal.fire({
            title: 'Are you sure?',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#6366f1',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            return result.isConfirmed;
        });
    },

    // ========================================
    // 9. MODAL HANDLING
    // ========================================

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    },

    // ========================================
    // 10. USER INTERFACE
    // ========================================

    updateUserDisplay(user) {
        const userDisplay = document.getElementById('currentUser');
        const loginBtn = document.querySelector('.btn-login');
        const logoutBtn = document.querySelector('.btn-logout');
        
        if (userDisplay) {
            if (user) {
                userDisplay.textContent = `${user.username} (${user.role})`;
                if (loginBtn) loginBtn.style.display = 'none';
                if (logoutBtn) logoutBtn.style.display = 'inline-flex';
            } else {
                userDisplay.textContent = 'Guest';
                if (loginBtn) loginBtn.style.display = 'inline-flex';
                if (logoutBtn) logoutBtn.style.display = 'none';
            }
        }
        
        // Update navigation based on role
        this.updateNavigationForRole(user ? user.role : null);
    },

    updateNavigationForRole(role) {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const allowedRoles = link.getAttribute('data-role');
            
            if (!allowedRoles) {
                link.style.display = 'flex';
                return;
            }
            
            if (!role) {
                // Guest user - hide all except POS
                if (allowedRoles.includes('cashier')) {
                    link.style.display = 'flex';
                } else {
                    link.style.display = 'none';
                }
            } else if (allowedRoles.includes(role)) {
                link.style.display = 'flex';
            } else {
                link.style.display = 'none';
            }
        });
    },

    showLoginForm() {
        this.showModal('loginModal');
    },

    hideLoginForm() {
        this.hideModal('loginModal');
    },

    // ========================================
    // 11. SALES HISTORY VIEW FUNCTIONS
    // ========================================

    // Render 3-month sales history
    renderSalesHistory(summary) {
        const historyContainer = document.getElementById('salesHistoryContainer');
        if (!historyContainer) return;

        if (summary.months.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-chart-line fa-3x"></i>
                    <h3>No Sales History</h3>
                    <p>Sales history will appear here once you start recording daily sales.</p>
                </div>
            `;
            return;
        }

        // Overall Summary Card
        const summaryCard = `
            <div class="summary-card">
                <h2><i class="fas fa-chart-bar"></i> 3-Month Summary</h2>
                <div class="summary-grid">
                    <div class="summary-item">
                        <i class="fas fa-shopping-cart"></i>
                        <div>
                            <h3>${summary.totalOrders}</h3>
                            <p>Total Orders</p>
                        </div>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-utensils"></i>
                        <div>
                            <h3>${summary.totalItems}</h3>
                            <p>Items Sold</p>
                        </div>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-dollar-sign"></i>
                        <div>
                            <h3>${Model.formatCurrency(summary.totalRevenue)}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-receipt"></i>
                        <div>
                            <h3>${Model.formatCurrency(summary.averageOrderValue)}</h3>
                            <p>Avg Order Value</p>
                        </div>
                    </div>
                </div>
                <div class="export-section">
                    <button class="btn btn-primary" onclick="Controller.exportSalesHistory()">
                        <i class="fab fa-whatsapp"></i> Export to WhatsApp
                    </button>
                </div>
            </div>
        `;

        // Monthly Cards
        const monthlyCards = summary.months.map(month => `
            <div class="month-card" onclick="Controller.viewMonthDetails('${month.monthKey}')">
                <div class="month-header">
                    <h3><i class="fas fa-calendar-alt"></i> ${month.month}</h3>
                    <span class="month-badge">${month.dailyReports.length} days</span>
                </div>
                <div class="month-stats">
                    <div class="stat-row">
                        <span><i class="fas fa-shopping-bag"></i> Orders:</span>
                        <strong>${month.totalOrders}</strong>
                    </div>
                    <div class="stat-row">
                        <span><i class="fas fa-box"></i> Items:</span>
                        <strong>${month.totalItems}</strong>
                    </div>
                    <div class="stat-row">
                        <span><i class="fas fa-money-bill-wave"></i> Revenue:</span>
                        <strong>${Model.formatCurrency(month.totalRevenue)}</strong>
                    </div>
                </div>
                <div class="month-footer">
                    <button class="btn-view-details">
                        View Details <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // All Products Section - Show ALL products sold in 3 months
        const allProducts = Object.entries(summary.productTotals)
            .sort((a, b) => b[1].count - a[1].count);

        const allProductsTable = `
            <div class="top-products-card">
                <div class="products-header">
                    <div>
                        <h2><i class="fas fa-list-alt"></i> All Products Sold in 3 Months</h2>
                        <p class="products-count">${allProducts.length} Products | ${summary.totalItems} Total Items Sold</p>
                    </div>
                    <div class="products-actions">
                        <button class="btn btn-sm btn-export" onclick="View.exportProductsTable()">
                            <i class="fas fa-file-excel"></i> Export
                        </button>
                    </div>
                </div>
                
                <div class="table-filters">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="productSearchInput" placeholder="Search products..." onkeyup="View.filterProductsTable()">
                    </div>
                    <div class="sort-controls">
                        <label><i class="fas fa-sort"></i> Sort by:</label>
                        <select id="productSortSelect" onchange="View.sortProductsTable()">
                            <option value="qty-desc">Quantity (High to Low)</option>
                            <option value="qty-asc">Quantity (Low to High)</option>
                            <option value="revenue-desc">Revenue (High to Low)</option>
                            <option value="revenue-asc">Revenue (Low to High)</option>
                            <option value="date-desc">Recently Sold</option>
                            <option value="date-asc">Oldest Sold</option>
                            <option value="name-asc">Name (A to Z)</option>
                            <option value="name-desc">Name (Z to A)</option>
                        </select>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="top-products-table" id="productsTable">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Date Range</th>
                                <th>Total Qty Sold</th>
                                <th>Avg Unit Price</th>
                                <th>Total Revenue</th>
                                <th>% of Total</th>
                            </tr>
                        </thead>
                        <tbody id="productsTableBody">
                            ${allProducts.map(([name, data], index) => {
                                const percentOfTotal = summary.totalRevenue > 0 
                                    ? ((data.amount / summary.totalRevenue) * 100).toFixed(1) 
                                    : 0;
                                const avgPrice = data.count > 0 
                                    ? Model.formatCurrency(data.amount / data.count) 
                                    : 'N/A';
                                const dateRange = data.firstSoldDate && data.lastSoldDate
                                    ? (data.firstSoldDate === data.lastSoldDate 
                                        ? new Date(data.firstSoldDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        : `${new Date(data.firstSoldDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(data.lastSoldDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
                                    : 'N/A';
                                return `
                                    <tr data-name="${name.toLowerCase()}" data-qty="${data.count}" data-revenue="${data.amount}" data-date="${data.lastSoldDate || ''}">
                                        <td data-label="#">${index + 1}</td>
                                        <td data-label="Product Name"><strong>${name}</strong></td>
                                        <td data-label="Category"><span class="category-badge">${data.category || 'N/A'}</span></td>
                                        <td data-label="Date Range"><span class="date-range">${dateRange}</span></td>
                                        <td data-label="Total Qty Sold"><strong>${data.count}</strong></td>
                                        <td data-label="Avg Unit Price">${avgPrice}</td>
                                        <td data-label="Total Revenue"><strong>${Model.formatCurrency(data.amount)}</strong></td>
                                        <td data-label="% of Total">${percentOfTotal}%</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="background: var(--light-color); font-weight: bold;">
                                <td colspan="3"><strong>TOTAL</strong></td>
                                <td>-</td>
                                <td><strong>${summary.totalItems}</strong></td>
                                <td>-</td>
                                <td><strong>${Model.formatCurrency(summary.totalRevenue)}</strong></td>
                                <td>100%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="table-info">
                    <span id="productsTableInfo">Showing ${allProducts.length} of ${allProducts.length} products</span>
                </div>
            </div>
        `;

        historyContainer.innerHTML = summaryCard + 
            '<h2 class="section-title"><i class="fas fa-calendar"></i> Monthly Breakdown</h2>' +
            '<div class="months-grid">' + monthlyCards + '</div>' + 
            allProductsTable;
    },

    // Show month details in modal
    showMonthDetailsModal(monthData) {
        const modal = document.getElementById('monthDetailsModal');
        if (!modal) {
            // Create modal if it doesn't exist
            const modalHTML = `
                <div id="monthDetailsModal" class="modal">
                    <div class="modal-content modal-large">
                        <div class="modal-header">
                            <h2 id="monthDetailsTitle"></h2>
                            <button class="close close-prominent" onclick="View.hideModal('monthDetailsModal')" aria-label="Close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div id="monthDetailsBody" class="modal-body"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        const titleEl = document.getElementById('monthDetailsTitle');
        const bodyEl = document.getElementById('monthDetailsBody');

        if (titleEl) {
            titleEl.innerHTML = `<i class="fas fa-calendar-alt"></i> ${monthData.month} - Detailed Report`;
        }

        if (bodyEl) {
            const dailyReports = monthData.dailyReports
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(day => `
                    <tr>
                        <td data-label="Date">${day.dateFormatted}</td>
                        <td data-label="Orders">${day.orders}</td>
                        <td data-label="Items">${day.items}</td>
                        <td data-label="Revenue">${Model.formatCurrency(day.revenue)}</td>
                    </tr>
                `).join('');

            bodyEl.innerHTML = `
                <div class="month-details-summary">
                    <div class="detail-stat">
                        <i class="fas fa-shopping-cart"></i>
                        <div>
                            <h3>${monthData.totalOrders}</h3>
                            <p>Total Orders</p>
                        </div>
                    </div>
                    <div class="detail-stat">
                        <i class="fas fa-boxes"></i>
                        <div>
                            <h3>${monthData.totalItems}</h3>
                            <p>Items Sold</p>
                        </div>
                    </div>
                    <div class="detail-stat">
                        <i class="fas fa-money-bill-wave"></i>
                        <div>
                            <h3>${Model.formatCurrency(monthData.totalRevenue)}</h3>
                            <p>Total Revenue</p>
                        </div>
                    </div>
                    <div class="detail-stat">
                        <i class="fas fa-calendar-day"></i>
                        <div>
                            <h3>${monthData.dailyReports.length}</h3>
                            <p>Trading Days</p>
                        </div>
                    </div>
                </div>
                
                <h3><i class="fas fa-list"></i> Daily Breakdown</h3>
                <div class="table-responsive">
                    <table class="details-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Orders</th>
                                <th>Items</th>
                                <th>Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dailyReports}
                        </tbody>
                    </table>
                </div>
            `;
        }

        this.showModal('monthDetailsModal');
    },

    // Filter products table by search input
    filterProductsTable() {
        const searchInput = document.getElementById('productSearchInput');
        const filter = searchInput ? searchInput.value.toLowerCase() : '';
        const table = document.getElementById('productsTable');
        const tbody = document.getElementById('productsTableBody');
        
        if (!tbody) return;
        
        const rows = tbody.getElementsByTagName('tr');
        let visibleCount = 0;
        
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const name = row.getAttribute('data-name') || '';
            
            if (name.includes(filter)) {
                row.style.display = '';
                visibleCount++;
                // Update ranking number
                const firstCell = row.cells[0];
                if (firstCell) firstCell.innerHTML = visibleCount;
            } else {
                row.style.display = 'none';
            }
        }
        
        // Update info text
        const infoEl = document.getElementById('productsTableInfo');
        const totalCount = rows.length;
        if (infoEl) {
            infoEl.textContent = `Showing ${visibleCount} of ${totalCount} products`;
        }
    },

    // Sort products table by selected criteria
    sortProductsTable() {
        const select = document.getElementById('productSortSelect');
        const tbody = document.getElementById('productsTableBody');
        
        if (!select || !tbody) return;
        
        const sortBy = select.value;
        const rows = Array.from(tbody.getElementsByTagName('tr'));
        
        rows.sort((a, b) => {
            const nameA = a.getAttribute('data-name') || '';
            const nameB = b.getAttribute('data-name') || '';
            const qtyA = parseInt(a.getAttribute('data-qty')) || 0;
            const qtyB = parseInt(b.getAttribute('data-qty')) || 0;
            const revenueA = parseFloat(a.getAttribute('data-revenue')) || 0;
            const revenueB = parseFloat(b.getAttribute('data-revenue')) || 0;
            const dateA = a.getAttribute('data-date') || '';
            const dateB = b.getAttribute('data-date') || '';
            
            switch(sortBy) {
                case 'qty-desc':
                    return qtyB - qtyA;
                case 'qty-asc':
                    return qtyA - qtyB;
                case 'revenue-desc':
                    return revenueB - revenueA;
                case 'revenue-asc':
                    return revenueA - revenueB;
                case 'date-desc':
                    return dateB.localeCompare(dateA);
                case 'date-asc':
                    return dateA.localeCompare(dateB);
                case 'name-asc':
                    return nameA.localeCompare(nameB);
                case 'name-desc':
                    return nameB.localeCompare(nameA);
                default:
                    return qtyB - qtyA;
            }
        });
        
        // Re-append sorted rows and update ranking
        rows.forEach((row, index) => {
            tbody.appendChild(row);
            // Update ranking number if row is visible
            if (row.style.display !== 'none') {
                const firstCell = row.cells[0];
                if (firstCell) firstCell.innerHTML = index + 1;
            }
        });
        
        // Re-apply filter to update rankings correctly
        this.filterProductsTable();
    },

    // Export products table to CSV
    exportProductsTable() {
        const table = document.getElementById('productsTable');
        if (!table) {
            alert('No products table found');
            return;
        }
        
        let csv = [];
        
        // Add headers
        const headers = [];
        const headerCells = table.querySelectorAll('thead th');
        headerCells.forEach(cell => headers.push(cell.textContent.trim()));
        csv.push(headers.join(','));
        
        // Add visible rows
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            if (row.style.display !== 'none') {
                const cells = row.querySelectorAll('td');
                const rowData = [];
                cells.forEach(cell => {
                    // Get text content, remove badge styling
                    let text = cell.textContent.trim();
                    // Wrap in quotes if contains comma
                    if (text.includes(',')) {
                        text = '"' + text + '"';
                    }
                    rowData.push(text);
                });
                csv.push(rowData.join(','));
            }
        });
        
        // Add footer/total row
        const footerCells = table.querySelectorAll('tfoot td');
        if (footerCells.length > 0) {
            const footerData = [];
            footerCells.forEach(cell => {
                let text = cell.textContent.trim();
                if (text.includes(',')) {
                    text = '"' + text + '"';
                }
                footerData.push(text);
            });
            csv.push(footerData.join(','));
        }
        
        // Create blob and download
        const csvContent = csv.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const date = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `products_3months_${date}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        Swal.fire({
            icon: 'success',
            title: 'Exported!',
            text: 'Products table exported successfully',
            timer: 2000,
            showConfirmButton: false
        });
    }};