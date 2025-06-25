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
    currency: "Rs.",
    adminPhone: "94716280311",
    lastResetDate: null,
  },
  currentUser: null,
  paymentAmount: 0,
  orderCounter: 1,

  // Category hierarchy
  categoryHierarchy: {
    "Sri Lankan": ["Fried Rice", "Kottu", "Set Menu"],
    "International": ["Pasta", "Noodles", "Pizza"],
    "Beverages": ["Hot Drinks", "Cold Drinks", "Juices"],
    "Meat": ["Chicken", "Beef", "Seafood"]
  },

  // ========================================
  // 1. STORAGE FUNCTIONS
  // ========================================

  // 2ï¸âƒ£ Save to LocalStorage
  saveToLocalStorage(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      localStorage.setItem(key, jsonData);
      return true;
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      return false;
    }
  },

  // 3ï¸âƒ£ Get from LocalStorage
  getFromLocalStorage(key) {
    try {
      const jsonData = localStorage.getItem(key);
      return jsonData ? JSON.parse(jsonData) : null;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  // ========================================
  // 2. PRODUCT MANAGEMENT
  // ========================================

  // Load products from storage
  loadProductsFromStorage() {
    const products = this.getFromLocalStorage("products");
    this.products = products || this.getDefaultProducts();
    return this.products;
  },

  // Reset products to default (useful for testing/demo)
  resetToDefaultProducts() {
    this.products = this.getDefaultProducts();
    this.saveToLocalStorage("products", this.products);
    return this.products;
  },

  // Get default products (for first time)
  getDefaultProducts() {
    return [
      {
        id: "1",
        name: "Vegetable Fried Rice",
        category: "Fried Rice",
        price: 650,
        stock: 50,
      },
      {
        id: "2",
        name: "Egg Fried Rice",
        category: "Fried Rice",
        price: 700,
        stock: 50,
      },
      {
        id: "3",
        name: "Chicken Fried Rice",
        category: "Fried Rice",
        price: 850,
        stock: 40,
      },
      {
        id: "4",
        name: "Seafood Fried Rice",
        category: "Fried Rice",
        price: 950,
        stock: 35,
      },
      {
        id: "5",
        name: "Mixed Fried Rice",
        category: "Fried Rice",
        price: 1000,
        stock: 30,
      },

      // ðŸ¥˜ Kottu
      {
        id: "6",
        name: "Vegetable Kottu",
        category: "Kottu",
        price: 650,
        stock: 40,
      },
      { id: "7", name: "Egg Kottu", category: "Kottu", price: 700, stock: 40 },
      {
        id: "8",
        name: "Chicken Kottu",
        category: "Kottu",
        price: 850,
        stock: 35,
      },
      { id: "9", name: "Beef Kottu", category: "Kottu", price: 950, stock: 30 },
      {
        id: "10",
        name: "Seafood Kottu",
        category: "Kottu",
        price: 1000,
        stock: 25,
      },
      {
        id: "11",
        name: "Cheese Kottu",
        category: "Kottu",
        price: 900,
        stock: 30,
      },

      // ðŸ Pasta
      {
        id: "12",
        name: "Vegetable Pasta",
        category: "Pasta",
        price: 800,
        stock: 30,
      },
      {
        id: "13",
        name: "Chicken Pasta",
        category: "Pasta",
        price: 950,
        stock: 25,
      },
      {
        id: "14",
        name: "Seafood Pasta",
        category: "Pasta",
        price: 1100,
        stock: 20,
      },
      {
        id: "15",
        name: "Cheese Pasta",
        category: "Pasta",
        price: 900,
        stock: 25,
      },

      // ðŸœ Noodles
      {
        id: "16",
        name: "Vegetable Noodles",
        category: "Noodles",
        price: 650,
        stock: 40,
      },
      {
        id: "17",
        name: "Egg Noodles",
        category: "Noodles",
        price: 700,
        stock: 40,
      },
      {
        id: "18",
        name: "Chicken Noodles",
        mainCategory: "International",
        subCategory: "Noodles",
        price: 850,
        stock: 35,
      },
      {
        id: "19",
        name: "Seafood Noodles",
        mainCategory: "International",
        subCategory: "Noodles",
        price: 950,
        stock: 30,
      },
      {
        id: "20",
        name: "Mixed Noodles",
        mainCategory: "International",
        subCategory: "Noodles",
        price: 1000,
        stock: 25,
      },

      // Beverages - Cold Drinks
      {
        id: "21",
        name: "Coca Cola",
        mainCategory: "Beverages",
        subCategory: "Cold Drinks",
        price: 150,
        stock: 100,
      },
      {
        id: "22",
        name: "Sprite",
        mainCategory: "Beverages",
        subCategory: "Cold Drinks",
        price: 150,
        stock: 100,
      },
      {
        id: "23",
        name: "Fanta",
        mainCategory: "Beverages",
        subCategory: "Cold Drinks",
        price: 150,
        stock: 100,
      },
      {
        id: "24",
        name: "Water Bottle",
        mainCategory: "Beverages",
        subCategory: "Cold Drinks",
        price: 100,
        stock: 150,
      },
      {
        id: "25",
        name: "Fresh Lime Juice",
        mainCategory: "Beverages",
        subCategory: "Juices",
        price: 200,
        stock: 60,
      },
      {
        id: "26",
        name: "Iced Coffee",
        mainCategory: "Beverages",
        subCategory: "Hot Drinks",
        price: 300,
        stock: 50,
      },
      {
        id: "27",
        name: "Milk Shake",
        mainCategory: "Beverages",
        subCategory: "Cold Drinks",
        price: 400,
        stock: 40,
      },
      {
        id: "28",
        name: "Orange Juice",
        mainCategory: "Beverages",
        subCategory: "Juices",
        price: 250,
        stock: 60,
      },
    ];
  },

  // Get all products
  getAllProducts() {
    return this.products;
  },

  // 5ï¸âƒ£ Add Product
  addProduct(productData) {
    const product = {
      id: this.generateUniqueId(),
      name: productData.name,
      category: productData.category,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock),
    };
    this.products.push(product);
    this.saveToLocalStorage("products", this.products);
    return product;
  },

  // Get product by ID
  getProductById(productId) {
    return this.products.find((p) => p.id === productId);
  },

  // 7ï¸âƒ£ Update Product
  updateProduct(productId, productData) {
    const index = this.products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      this.products[index] = {
        id: productId,
        name: productData.name,
        category: productData.category,
        price: parseFloat(productData.price),
        stock: parseInt(productData.stock),
      };
      this.saveToLocalStorage("products", this.products);
      return true;
    }
    return false;
  },

  // 8ï¸âƒ£ Delete Product
  deleteProduct(productId) {
    const index = this.products.findIndex((p) => p.id === productId);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveToLocalStorage("products", this.products);
      return true;
    }
    return false;
  },

  // 📟 Search Products
  searchProducts(query) {
    if (!query) return this.products;
    const lowerQuery = query.toLowerCase();
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        (p.mainCategory && p.mainCategory.toLowerCase().includes(lowerQuery)) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(lowerQuery)) ||
        (p.category && p.category.toLowerCase().includes(lowerQuery)),
    );
  },

  // 2️⃣7️⃣ Filter by Category
  filterByCategory(category) {
    if (!category || category === "All") return this.products;
    // Check if it's a main category or subcategory
    return this.products.filter((p) => 
      p.mainCategory === category || 
      p.subCategory === category ||
      p.category === category
    );
  },

  // Filter by main category and subcategory
  filterByHierarchy(mainCategory, subCategory) {
    if (!mainCategory || mainCategory === "All") return this.products;
    let filtered = this.products.filter((p) => p.mainCategory === mainCategory);
    if (subCategory && subCategory !== "All") {
      filtered = filtered.filter((p) => p.subCategory === subCategory);
    }
    return filtered;
  },

  // 2️⃣8️⃣ Sort by Price
  sortByPrice(order = "asc") {
    const sorted = [...this.products];
    return sorted.sort((a, b) =>
      order === "asc" ? a.price - b.price : b.price - a.price,
    );
  },

  // Get unique categories (legacy support)
  getCategories() {
    const categories = ["All"];
    this.products.forEach((p) => {
      const cat = p.subCategory || p.category;
      if (cat && !categories.includes(cat)) {
        categories.push(cat);
      }
    });
    return categories;
  },

  // Get main categories
  getMainCategories() {
    return ["All", ...Object.keys(this.categoryHierarchy)];
  },

  // Get subcategories for a main category
  getSubCategories(mainCategory) {
    if (!mainCategory || mainCategory === "All") {
      return ["All"];
    }
    return ["All", ...(this.categoryHierarchy[mainCategory] || [])];
  },

  // Get all subcategories from products
  getAllSubCategories() {
    const subCategories = ["All"];
    this.products.forEach((p) => {
      const subCat = p.subCategory;
      if (subCat && !subCategories.includes(subCat)) {
        subCategories.push(subCat);
      }
    });
    return subCategories;
  },

  // Load category hierarchy from storage
  loadCategoryHierarchy() {
    const stored = this.getFromLocalStorage("categoryHierarchy");
    if (stored) {
      this.categoryHierarchy = stored;
    }
    return this.categoryHierarchy;
  },

  // Save category hierarchy to storage
  saveCategoryHierarchy() {
    return this.saveToLocalStorage("categoryHierarchy", this.categoryHierarchy);
  },

  // Add main category
  addMainCategory(mainCategory) {
    if (!mainCategory || mainCategory.trim().length === 0) {
      return { success: false, error: "Main category name is required" };
    }
    
    const trimmed = mainCategory.trim();
    if (this.categoryHierarchy[trimmed]) {
      return { success: false, error: "Main category already exists" };
    }
    
    this.categoryHierarchy[trimmed] = [];
    this.saveCategoryHierarchy();
    return { success: true };
  },

  // Add subcategory to main category
  addSubCategory(mainCategory, subCategory) {
    if (!mainCategory || !subCategory) {
      return { success: false, error: "Both main and sub category are required" };
    }
    
    if (!this.categoryHierarchy[mainCategory]) {
      return { success: false, error: "Main category does not exist" };
    }
    
    const trimmedSub = subCategory.trim();
    if (this.categoryHierarchy[mainCategory].includes(trimmedSub)) {
      return { success: false, error: "Sub category already exists" };
    }
    
    this.categoryHierarchy[mainCategory].push(trimmedSub);
    this.saveCategoryHierarchy();
    return { success: true };
  },

  // Delete main category
  deleteMainCategory(mainCategory) {
    if (!this.categoryHierarchy[mainCategory]) {
      return { success: false, error: "Main category does not exist" };
    }
    
    // Check if any products use this category
    const productsUsingCategory = this.products.filter(p => p.mainCategory === mainCategory);
    if (productsUsingCategory.length > 0) {
      return { success: false, error: `Cannot delete. ${productsUsingCategory.length} products use this category` };
    }
    
    delete this.categoryHierarchy[mainCategory];
    this.saveCategoryHierarchy();
    return { success: true };
  },

  // Delete subcategory
  deleteSubCategory(mainCategory, subCategory) {
    if (!this.categoryHierarchy[mainCategory]) {
      return { success: false, error: "Main category does not exist" };
    }
    
    const index = this.categoryHierarchy[mainCategory].indexOf(subCategory);
    if (index === -1) {
      return { success: false, error: "Sub category does not exist" };
    }
    
    // Check if any products use this subcategory
    const productsUsingSubCat = this.products.filter(
      p => p.mainCategory === mainCategory && p.subCategory === subCategory
    );
    if (productsUsingSubCat.length > 0) {
      return { success: false, error: `Cannot delete. ${productsUsingSubCat.length} products use this sub category` };
    }
    
    this.categoryHierarchy[mainCategory].splice(index, 1);
    this.saveCategoryHierarchy();
    return { success: true };
  },

  // Rename main category
  renameMainCategory(oldName, newName) {
    if (!oldName || !newName) {
      return { success: false, error: "Both old and new names are required" };
    }
    
    if (!this.categoryHierarchy[oldName]) {
      return { success: false, error: "Main category does not exist" };
    }
    
    const trimmedNew = newName.trim();
    if (this.categoryHierarchy[trimmedNew] && trimmedNew !== oldName) {
      return { success: false, error: "New category name already exists" };
    }
    
    // Update category hierarchy
    this.categoryHierarchy[trimmedNew] = this.categoryHierarchy[oldName];
    delete this.categoryHierarchy[oldName];
    
    // Update all products using this category
    this.products.forEach(p => {
      if (p.mainCategory === oldName) {
        p.mainCategory = trimmedNew;
      }
    });
    
    this.saveCategoryHierarchy();
    this.saveToLocalStorage("products", this.products);
    return { success: true };
  },

  // Rename subcategory
  renameSubCategory(mainCategory, oldName, newName) {
    if (!mainCategory || !oldName || !newName) {
      return { success: false, error: "All fields are required" };
    }
    
    if (!this.categoryHierarchy[mainCategory]) {
      return { success: false, error: "Main category does not exist" };
    }
    
    const index = this.categoryHierarchy[mainCategory].indexOf(oldName);
    if (index === -1) {
      return { success: false, error: "Sub category does not exist" };
    }
    
    const trimmedNew = newName.trim();
    if (this.categoryHierarchy[mainCategory].includes(trimmedNew) && trimmedNew !== oldName) {
      return { success: false, error: "New sub category name already exists" };
    }
    
    // Update subcategory in hierarchy
    this.categoryHierarchy[mainCategory][index] = trimmedNew;
    
    // Update all products using this subcategory
    this.products.forEach(p => {
      if (p.mainCategory === mainCategory && p.subCategory === oldName) {
        p.subCategory = trimmedNew;
      }
    });
    
    this.saveCategoryHierarchy();
    this.saveToLocalStorage("products", this.products);
    return { success: true };
  },

  // Get category hierarchy
  getCategoryHierarchy() {
    return this.categoryHierarchy;
  },

  // ========================================
  // 3. CART MANAGEMENT
  // ========================================

  // Load cart from storage
  loadCartFromStorage() {
    const cart = this.getFromLocalStorage("cart");
    this.cart = cart || [];
    return this.cart;
  },

  // Get cart
  getCart() {
    return this.cart;
  },

  // 1ï¸âƒ£2ï¸âƒ£ Add to Cart
  addToCart(productId) {
    const product = this.getProductById(productId);
    if (!product) return false;

    const existingItem = this.cart.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        productId: productId,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    this.saveToLocalStorage("cart", this.cart);
    return true;
  },

  // 1ï¸âƒ£4ï¸âƒ£ Update Cart Quantity
  updateCartQuantity(productId, quantity) {
    const item = this.cart.find((item) => item.productId === productId);
    if (item) {
      item.quantity = parseInt(quantity);
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveToLocalStorage("cart", this.cart);
      }
      return true;
    }
    return false;
  },

  // 1ï¸âƒ£5ï¸âƒ£ Remove from Cart
  removeFromCart(productId) {
    const index = this.cart.findIndex((item) => item.productId === productId);
    if (index !== -1) {
      this.cart.splice(index, 1);
      this.saveToLocalStorage("cart", this.cart);
      return true;
    }
    return false;
  },

  // 1ï¸âƒ£6ï¸âƒ£ Clear Cart
  clearCart() {
    this.cart = [];
    this.saveToLocalStorage("cart", this.cart);
  },

  // 1ï¸âƒ£7ï¸âƒ£ Calculate Subtotal
  calculateSubtotal(productId) {
    const item = this.cart.find((item) => item.productId === productId);
    return item ? item.price * item.quantity : 0;
  },

  // 1ï¸âƒ£8ï¸âƒ£ Calculate Total
  calculateTotal() {
    let total = 0;
    this.cart.forEach((item) => {
      total += item.price * item.quantity;
    });

    // Apply tax
    const taxAmount = total * (this.settings.taxRate / 100);
    total += taxAmount;

    // Apply discount
    const discountAmount = total * (this.settings.discount / 100);
    total -= discountAmount;

    return {
      subtotal: this.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      tax: taxAmount,
      discount: discountAmount,
      total: total,
    };
  },

  // ========================================
  // 4. ORDER MANAGEMENT
  // ========================================

  // Load orders from storage
  loadOrdersFromStorage() {
    const orders = this.getFromLocalStorage("orders");
    this.orders = orders || [];
    const counter = this.getFromLocalStorage("orderCounter");
    this.orderCounter = counter || 1;
    return this.orders;
  },

  // 2ï¸âƒ£1ï¸âƒ£ Save Order
  // Save Order
  saveOrder() {
    if (this.cart.length === 0) return false;

    // Check if all products have sufficient stock
    for (let cartItem of this.cart) {
      const product = this.products.find(p => p.id === cartItem.productId);
      if (!product) {
        console.error('Product not found:', cartItem);
        return { error: `Product ${cartItem.name} not found` };
      }
      if (product.stock < cartItem.quantity) {
        return { error: `Insufficient stock for ${cartItem.name}. Available: ${product.stock}` };
      }
    }

    // Deduct stock from products
    this.cart.forEach(cartItem => {
      const product = this.products.find(p => p.id === cartItem.productId);
      if (product) {
        product.stock -= cartItem.quantity;
      }
    });
    
    // Save updated products to localStorage
    this.saveToLocalStorage('products', this.products);

    const totals = this.calculateTotal();
    const paymentData = this.calculateBalance(this.paymentAmount);
    
    const order = {
      id: this.orderCounter.toString(),
      items: [...this.cart],
      totals: totals,
      date: this.getCurrentDateTime(),
      user: this.currentUser ? this.currentUser.username : "Cashier",
      payment: paymentData.payment,
      balance: paymentData.balance,
    };

    this.orders.push(order);
    this.orderCounter++;
    
    this.saveToLocalStorage("orders", this.orders);
    this.saveToLocalStorage("orderCounter", this.orderCounter);
    this.clearCart();
    this.clearPayment();
    
    return order;
  },

  // Get all orders
  getAllOrders() {
    return this.orders;
  },

  // Calculate daily total
  calculateDailyTotal() {
    const total = this.orders.reduce((sum, order) => sum + order.totals.total, 0);
    const orderCount = this.orders.length;
    return {
      total: total,
      orderCount: orderCount,
      orders: this.orders,
    };
  },

  // Get detailed order statistics with category breakdown
  getDetailedOrderStats() {
    const categoryStats = {};
    let totalItems = 0;
    let totalAmount = 0;
    
    this.orders.forEach(order => {
      totalAmount += order.totals.total;
      
      order.items.forEach(item => {
        // Get the product to find its category
        const product = this.getProductById(item.productId);
        const category = product ? product.category : 'Other';
        
        if (!categoryStats[category]) {
          categoryStats[category] = {
            count: 0,
            amount: 0
          };
        }
        
        categoryStats[category].count += item.quantity;
        categoryStats[category].amount += item.price * item.quantity;
        totalItems += item.quantity;
      });
    });
    
    return {
      categoryStats: categoryStats,
      totalOrders: this.orders.length,
      totalItems: totalItems,
      totalAmount: totalAmount
    };
  },

  // 2ï¸âƒ£4ï¸âƒ£ Get Order by ID
  getOrderById(orderId) {
    return this.orders.find((o) => o.id === orderId);
  },

  // 2ï¸âƒ£5ï¸âƒ£ Delete Order
  deleteOrder(orderId) {
    const index = this.orders.findIndex((o) => o.id === orderId);
    if (index !== -1) {
      this.orders.splice(index, 1);
      this.saveToLocalStorage("orders", this.orders);
      return true;
    }
    return false;
  },
  // Reset daily orders (called at midnight)
  resetDailyOrders() {
    const dailyReport = this.calculateDailyTotal();
    this.orders = [];
    this.orderCounter = 1;
    this.saveToLocalStorage("orders", this.orders);
    this.saveToLocalStorage("orderCounter", this.orderCounter);
    return dailyReport;
  },
  // ========================================
  // 5. SETTINGS MANAGEMENT
  // ========================================

  // Load settings
  loadSettings() {
    const settings = this.getFromLocalStorage("settings");
    if (settings) {
      this.settings = settings;
    }
    return this.settings;
  },

  // Check if new day and reset if needed
  checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = this.settings.lastResetDate;
    
    if (lastReset !== today && this.orders.length > 0) {
      // New day detected, generate report
      const report = this.resetDailyOrders();
      
      // Update last reset date
      this.settings.lastResetDate = today;
      this.saveToLocalStorage("settings", this.settings);
      
      return report;
    }
    
    return null;
  },

  // 3ï¸âƒ£2ï¸âƒ£ Update Restaurant Info
  updateRestaurantInfo(name) {
    this.settings.restaurantName = name;
    this.saveToLocalStorage("settings", this.settings);
  },

  // 3ï¸âƒ£3ï¸âƒ£ Set Tax Rate
  setTaxRate(rate) {
    this.settings.taxRate = parseFloat(rate);
    this.saveToLocalStorage("settings", this.settings);
  },

  // Apply Discount
  applyDiscount(discount) {
    this.settings.discount = parseFloat(discount);
    this.saveToLocalStorage("settings", this.settings);
  },

  // Update Admin Phone
  updateAdminPhone(phone) {
    this.settings.adminPhone = phone;
    this.saveToLocalStorage("settings", this.settings);
  },

  getSettings() {
    return this.settings;
  },

  // ========================================
  // 6. USER MANAGEMENT
  // ========================================

  // 2ï¸âƒ£9ï¸âƒ£ Login User
  loginUser(username, password) {
    // Simple authentication (in real app, use server-side)
    const users = this.getFromLocalStorage("users") || [
      { username: "admin", password: "123", role: "admin" },
      { username: "Cashier", password: "cashier123", role: "cashier" },
    ];


    const user = users.find(
      (u) => u.username === username && u.password === password,
    );
    
    console.log('Found user:', user);
    
    if (user) {
      this.currentUser = { username: user.username, role: user.role };
      this.saveToLocalStorage("currentUser", this.currentUser);
      return this.currentUser;
    }
    return null;
  },

  // 3ï¸âƒ£0ï¸âƒ£ Logout User
  logoutUser() {
    this.currentUser = null;
    localStorage.removeItem("currentUser");
  },

  // Load current user
  loadCurrentUser() {
    this.currentUser = this.getFromLocalStorage("currentUser");
    return this.currentUser;
  },

  // 3ï¸âƒ£1ï¸âƒ£ Check User Role
  checkUserRole(requiredRole) {
    if (!this.currentUser) return false;
    return (
      this.currentUser.role === requiredRole ||
      this.currentUser.role === "admin"
    );
  },

  // ========================================
  // 7. UTILITY FUNCTIONS
  // ========================================

  // 3ï¸âƒ£8ï¸âƒ£ Generate Unique ID
  generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // 2ï¸âƒ£2ï¸âƒ£ Get Current Date Time
  getCurrentDateTime() {
    const now = new Date();
    return {
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      full: now.toLocaleString(),
    };
  },

  // 3ï¸âƒ£7ï¸âƒ£ Format Currency
  formatCurrency(amount) {
    return this.settings.currency + " " + parseFloat(amount).toFixed(2);
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
      sufficient: balance >= 0,
    };
  },

  getPaymentAmount() {
    return this.paymentAmount;
  },

  clearPayment() {
    this.paymentAmount = 0;
  },
};

