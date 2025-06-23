// ========================================
// VIEW LAYER - UI Rendering
// ========================================

const View = {
    
    // ========================================
    // 1. PRODUCT VIEW FUNCTIONS
    // ========================================

    // 4️⃣ Display Products in Management Table
    renderProductsTable(products) {
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No products found</td></tr>';
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${Model.formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="btn btn-sm btn-edit" onclick="Controller.editProduct('${product.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="Controller.deleteProduct('${product.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');
    },

    // 1️⃣1️⃣ Display Products in POS Grid
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
                <p class="category">${product.category}</p>
                <p class="price">${Model.formatCurrency(product.price)}</p>
                <p class="stock">Stock: ${product.stock}</p>
            </div>
        `).join('');
    },

    // Populate category filter dropdown
    renderCategoryFilter(categories) {
        const select = document.getElementById('categoryFilter');
        if (!select) return;

        select.innerHTML = categories.map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');
    },

    // ========================================
    // 2. CART VIEW FUNCTIONS
    // ========================================

    // 1️⃣3️⃣ Render Cart
    renderCart(cart) {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');

        if (!cartItems) return;

        if (cart.length === 0) {
            cartItems.innerHTML = '';
            if (emptyCart) emptyCart.style.display = 'block';
            this.updateTotalDisplay({ subtotal: 0, tax: 0, discount: 0, total: 0 });
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">${Model.formatCurrency(item.price)}</p>
                </div>
                <div class="item-controls">
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
                <div class="item-subtotal">
                    ${Model.formatCurrency(Model.calculateSubtotal(item.productId))}
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
        const taxEl = document.getElementById('taxAmount');
        const discountEl = document.getElementById('discountAmount');
        const totalEl = document.getElementById('totalAmount');

        if (subtotalEl) subtotalEl.textContent = Model.formatCurrency(totals.subtotal);
        if (taxEl) taxEl.textContent = Model.formatCurrency(totals.tax);
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

    // 1️⃣9️⃣ Generate Receipt
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
                        <span>Tax (${settings.taxRate}%):</span>
                        <span>${Model.formatCurrency(order.totals.tax)}</span>
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

    // 2️⃣3️⃣ Display Orders
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
                <td>${order.id}</td>
                <td>${order.date.full}</td>
                <td>${order.items.length}</td>
                <td>${Model.formatCurrency(order.totals.total)}</td>
                <td>${order.user}</td>
                <td>
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
        const taxInput = document.getElementById('taxRate');
        const discountInput = document.getElementById('discountRate');

        if (nameInput) nameInput.value = settings.restaurantName;
        if (taxInput) taxInput.value = settings.taxRate;
        if (discountInput) discountInput.value = settings.discount;

        // Update header
        const header = document.querySelector('.header h1');
        if (header) header.textContent = settings.restaurantName;
    },

    // ========================================
    // 6. PAGE NAVIGATION
    // ========================================

    // 3️⃣9️⃣ Show Page
    showPage(pageName) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active'));

        // Show selected page
        const selectedPage = document.getElementById(pageName + 'Page');
        if (selectedPage) {
            selectedPage.classList.add('active');
        }

        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('onclick')?.includes(pageName)) {
                link.classList.add('active');
            }
        });
    },

    // ========================================
    // 7. FORM HANDLING
    // ========================================

    // 6️⃣ Fill Product Form (for editing)
    fillProductForm(product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;

        // Change button text
        const submitBtn = document.querySelector('#productForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Update Product';
            submitBtn.classList.add('btn-update');
        }
    },

    // 9️⃣ Clear Product Form
    clearProductForm() {
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';

        // Reset button
        const submitBtn = document.querySelector('#productForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = 'Add Product';
            submitBtn.classList.remove('btn-update');
        }
    },

    // ========================================
    // 8. ALERTS & MESSAGES
    // ========================================

    // 3️⃣6️⃣ Show Alert
    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(alert, container.firstChild);

        // Auto remove after 3 seconds
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.remove(), 300);
        }, 3000);
    },

    // Show confirmation dialog
    showConfirm(message) {
        return confirm(message);
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
        if (userDisplay) {
            if (user) {
                userDisplay.textContent = `${user.username} (${user.role})`;
            } else {
                userDisplay.textContent = 'Guest';
            }
        }
    },

    showLoginForm() {
        this.showModal('loginModal');
    },

    hideLoginForm() {
        this.hideModal('loginModal');
    }
};
