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
    serviceChargeRate: 0,
    discount: 0,
    currency: "Rs.",
    adminPhone: "",
    lastResetDate: null,
  },
  currentUser: null,
  paymentAmount: 0,
  orderCounter: 1,
  
  // Sales History (3 months retention)
  salesHistory: [], // Array of monthly reports
  maxHistoryMonths: 3,

  // Category hierarchy
  categoryHierarchy: {
    "Sri Lankan": ["Fried Rice", "Kottu", "Set Menu"],
    International: ["Pasta", "Noodles", "Pizza"],
    Beverages: ["Hot Drinks", "Cold Drinks", "Juices"],
    Meat: ["Chicken", "Beef", "Seafood"],
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
       // ================= Sri Lankan - Fried Rice =================
  { id: "1", name: "Vegetable Fried Rice", mainCategory: "Sri Lankan", subCategory: "Fried Rice", price: 650 },
  { id: "2", name: "Egg Fried Rice", mainCategory: "Sri Lankan", subCategory: "Fried Rice", price: 750 },
  { id: "3", name: "Chicken Fried Rice", mainCategory: "Sri Lankan", subCategory: "Fried Rice", price: 950 },
  { id: "4", name: "Seafood Fried Rice", mainCategory: "Sri Lankan", subCategory: "Fried Rice", price: 1100 },

  // ================= Sri Lankan - Kottu =================
  { id: "5", name: "Vegetable Kottu", mainCategory: "Sri Lankan", subCategory: "Kottu", price: 650 },
  { id: "6", name: "Egg Kottu", mainCategory: "Sri Lankan", subCategory: "Kottu", price: 750 },
  { id: "7", name: "Chicken Kottu", mainCategory: "Sri Lankan", subCategory: "Kottu", price: 950 },
  { id: "8", name: "Beef Kottu", mainCategory: "Sri Lankan", subCategory: "Kottu", price: 1050 },
  { id: "9", name: "Cheese Kottu", mainCategory: "Sri Lankan", subCategory: "Kottu", price: 1000 },

  // ================= Sri Lankan - Set Menu =================
  { id: "10", name: "Rice & Curry (Veg)", mainCategory: "Sri Lankan", subCategory: "Set Menu", price: 600 },
  { id: "11", name: "Rice & Curry (Chicken)", mainCategory: "Sri Lankan", subCategory: "Set Menu", price: 850 },
  { id: "12", name: "Rice & Curry (Fish)", mainCategory: "Sri Lankan", subCategory: "Set Menu", price: 900 },

  // ================= International - Pasta =================
  { id: "13", name: "Vegetable Pasta", mainCategory: "International", subCategory: "Pasta", price: 900 },
  { id: "14", name: "Chicken Pasta", mainCategory: "International", subCategory: "Pasta", price: 1100 },
  { id: "15", name: "Creamy Cheese Pasta", mainCategory: "International", subCategory: "Pasta", price: 1200 },

  // ================= International - Noodles =================
  { id: "16", name: "Vegetable Noodles", mainCategory: "International", subCategory: "Noodles", price: 650 },
  { id: "17", name: "Chicken Noodles", mainCategory: "International", subCategory: "Noodles", price: 850 },
  { id: "18", name: "Seafood Noodles", mainCategory: "International", subCategory: "Noodles", price: 1000 },

  // ================= International - Pizza =================
  { id: "19", name: "Vegetable Pizza", mainCategory: "International", subCategory: "Pizza", price: 1200 },
  { id: "20", name: "Chicken Pizza", mainCategory: "International", subCategory: "Pizza", price: 1400 },
  { id: "21", name: "Cheese Pizza", mainCategory: "International", subCategory: "Pizza", price: 1300 },

  // ================= Meat - Chicken =================
  { id: "22", name: "Fried Chicken", mainCategory: "Meat", subCategory: "Chicken", price: 900 },
  { id: "23", name: "Chicken Curry", mainCategory: "Meat", subCategory: "Chicken", price: 850 },

  // ================= Meat - Beef =================
  { id: "24", name: "Beef Curry", mainCategory: "Meat", subCategory: "Beef", price: 950 },
  { id: "25", name: "Beef Fry", mainCategory: "Meat", subCategory: "Beef", price: 1000 },

  // ================= Meat - Seafood =================
  { id: "26", name: "Fish Curry", mainCategory: "Meat", subCategory: "Seafood", price: 850 },
  { id: "27", name: "Prawn Fry", mainCategory: "Meat", subCategory: "Seafood", price: 1200 },

  // ================= Beverages - Hot Drinks (WITH STOCK) =================
  { id: "28", name: "Milk Tea", mainCategory: "Beverages", subCategory: "Hot Drinks", price: 150, stock: 50 },
  { id: "29", name: "Black Coffee", mainCategory: "Beverages", subCategory: "Hot Drinks", price: 200, stock: 40 },
  { id: "30", name: "Hot Chocolate", mainCategory: "Beverages", subCategory: "Hot Drinks", price: 250, stock: 30 },

  // ================= Beverages - Cold Drinks (WITH STOCK) =================
  { id: "31", name: "Coca Cola", mainCategory: "Beverages", subCategory: "Cold Drinks", price: 180, stock: 60 },
  { id: "32", name: "Sprite", mainCategory: "Beverages", subCategory: "Cold Drinks", price: 180, stock: 60 },
  { id: "33", name: "Iced Coffee", mainCategory: "Beverages", subCategory: "Cold Drinks", price: 300, stock: 35 },

  // ================= Beverages - Juices (WITH STOCK) =================
  { id: "34", name: "Orange Juice", mainCategory: "Beverages", subCategory: "Juices", price: 250, stock: 25 },
  { id: "35", name: "Mango Juice", mainCategory: "Beverages", subCategory: "Juices", price: 250, stock: 25 },
  { id: "36", name: "Avocado Juice", mainCategory: "Beverages", subCategory: "Juices", price: 300, stock: 20 }

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
      mainCategory: productData.mainCategory || productData.category,
      subCategory: productData.subCategory || "",
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
        mainCategory: productData.mainCategory || productData.category,
        subCategory: productData.subCategory || "",
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
    return this.products.filter(
      (p) =>
        p.mainCategory === category ||
        p.subCategory === category ||
        p.category === category,
    );
  },

  // Filter by main category and subcategory
  filterByHierarchy(mainCategory, subCategory) {
    let filtered = this.products;
    
    // Filter by main category if not "All"
    if (mainCategory && mainCategory !== "All") {
      filtered = filtered.filter((p) => p.mainCategory === mainCategory);
    }
    
    // Filter by subcategory if not "All"
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
      return {
        success: false,
        error: "Both main and sub category are required",
      };
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
    const productsUsingCategory = this.products.filter(
      (p) => p.mainCategory === mainCategory,
    );
    if (productsUsingCategory.length > 0) {
      return {
        success: false,
        error: `Cannot delete. ${productsUsingCategory.length} products use this category`,
      };
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
      (p) => p.mainCategory === mainCategory && p.subCategory === subCategory,
    );
    if (productsUsingSubCat.length > 0) {
      return {
        success: false,
        error: `Cannot delete. ${productsUsingSubCat.length} products use this sub category`,
      };
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
    this.products.forEach((p) => {
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
    if (
      this.categoryHierarchy[mainCategory].includes(trimmedNew) &&
      trimmedNew !== oldName
    ) {
      return { success: false, error: "New sub category name already exists" };
    }

    // Update subcategory in hierarchy
    this.categoryHierarchy[mainCategory][index] = trimmedNew;

    // Update all products using this subcategory
    this.products.forEach((p) => {
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

    // Apply service charge
    const serviceChargeAmount = total * (this.settings.serviceChargeRate / 100);
    total += serviceChargeAmount;

    // Apply discount
    const discountAmount = total * (this.settings.discount / 100);
    total -= discountAmount;

    return {
      subtotal: this.cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      serviceCharge: serviceChargeAmount,
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

    // Check if all products have sufficient stock (only for products with stock tracking)
    for (let cartItem of this.cart) {
      const product = this.products.find((p) => p.id === cartItem.productId);
      if (!product) {
        console.error("Product not found:", cartItem);
        return { error: `Product ${cartItem.name} not found` };
      }
      // Only check stock if product has stock tracking (not null/undefined)
      if (product.stock !== null && product.stock !== undefined && typeof product.stock === 'number') {
        if (product.stock < cartItem.quantity) {
          return {
            error: `Insufficient stock for ${cartItem.name}. Available: ${product.stock}`,
          };
        }
      }
    }

    // Deduct stock from products (only for products with stock tracking)
    this.cart.forEach((cartItem) => {
      const product = this.products.find((p) => p.id === cartItem.productId);
      if (product && product.stock !== null && product.stock !== undefined && typeof product.stock === 'number') {
        product.stock -= cartItem.quantity;
      }
    });

    // Save updated products to localStorage
    this.saveToLocalStorage("products", this.products);

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
    const total = this.orders.reduce(
      (sum, order) => sum + order.totals.total,
      0,
    );
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
    const productStats = {};
    let totalItems = 0;
    let totalAmount = 0;

    this.orders.forEach((order) => {
      totalAmount += order.totals.total;

      order.items.forEach((item) => {
        // Get the product to find its category
        const product = this.getProductById(item.productId);
        const mainCategory = product ? (product.mainCategory || product.category) : "Other";
        const productName = product ? product.name : "Unknown Product";

        // Category stats
        if (!categoryStats[mainCategory]) {
          categoryStats[mainCategory] = {
            count: 0,
            amount: 0,
            products: {}
          };
        }

        categoryStats[mainCategory].count += item.quantity;
        categoryStats[mainCategory].amount += item.price * item.quantity;
        
        // Product stats within category
        if (!categoryStats[mainCategory].products[productName]) {
          categoryStats[mainCategory].products[productName] = {
            count: 0,
            amount: 0
          };
        }
        categoryStats[mainCategory].products[productName].count += item.quantity;
        categoryStats[mainCategory].products[productName].amount += item.price * item.quantity;
        
        // Overall product stats
        if (!productStats[productName]) {
          productStats[productName] = {
            count: 0,
            amount: 0,
            category: mainCategory
          };
        }
        productStats[productName].count += item.quantity;
        productStats[productName].amount += item.price * item.quantity;
        
        totalItems += item.quantity;
      });
    });

    return {
      categoryStats: categoryStats,
      productStats: productStats,
      totalOrders: this.orders.length,
      totalItems: totalItems,
      totalAmount: totalAmount,
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
    
    // Save daily report to monthly history
    this.saveDailyReportToHistory(dailyReport);
    
    this.orders = [];
    this.orderCounter = 1;
    this.saveToLocalStorage("orders", this.orders);
    this.saveToLocalStorage("orderCounter", this.orderCounter);
    return dailyReport;
  },
  
  // Save daily report to monthly sales history
  saveDailyReportToHistory(dailyReport) {
    try {
      const today = new Date();
      const monthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      const dateKey = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Load existing sales history
      this.loadSalesHistory();
      
      // Find or create current month's record
      let monthRecord = this.salesHistory.find(m => m.monthKey === monthKey);
      
      if (!monthRecord) {
        monthRecord = {
          monthKey: monthKey,
          month: today.toLocaleString('default', { month: 'long', year: 'numeric' }),
          year: today.getFullYear(),
          monthNumber: today.getMonth() + 1,
          dailyReports: [],
          totalOrders: 0,
          totalRevenue: 0,
          totalItems: 0
        };
        this.salesHistory.push(monthRecord);
      }
      
      // Get detailed stats for the day
      const stats = this.getDetailedOrderStats();
      
      // Check if today's report already exists
      const existingReportIndex = monthRecord.dailyReports.findIndex(r => r.date === dateKey);
      
      const newDailyReport = {
        date: dateKey,
        dateFormatted: today.toLocaleDateString(),
        orders: dailyReport.orderCount,
        revenue: dailyReport.total,
        items: stats.totalItems,
        categoryStats: stats.categoryStats,
        productStats: stats.productStats,
        timestamp: Date.now()
      };
      
      if (existingReportIndex !== -1) {
        // Replace existing report
        monthRecord.dailyReports[existingReportIndex] = newDailyReport;
      } else {
        // Add new daily report
        monthRecord.dailyReports.push(newDailyReport);
      }
      
      // Recalculate month totals from all daily reports
      monthRecord.totalOrders = 0;
      monthRecord.totalRevenue = 0;
      monthRecord.totalItems = 0;
      
      monthRecord.dailyReports.forEach(report => {
        monthRecord.totalOrders += report.orders || 0;
        monthRecord.totalRevenue += report.revenue || 0;
        monthRecord.totalItems += report.items || 0;
      });
      
      // Clean up old months (keep only last 3 months)
      this.cleanupOldSalesHistory();
      
      // Save to localStorage
      this.saveToLocalStorage('salesHistory', this.salesHistory);
      
      console.log(`✅ Daily report saved to history: ${dateKey}`);
    } catch (error) {
      console.error('Error saving daily report to history:', error);
    }
  },
  
  // Load sales history from localStorage
  loadSalesHistory() {
    try {
      const history = this.getFromLocalStorage('salesHistory');
      this.salesHistory = history || [];
      
      // Clean up on load (in case cleanup was missed)
      this.cleanupOldSalesHistory();
      
      return this.salesHistory;
    } catch (error) {
      console.error('Error loading sales history:', error);
      this.salesHistory = [];
      return [];
    }
  },
  
  // Clean up sales history older than 3 months
  cleanupOldSalesHistory() {
    try {
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - this.maxHistoryMonths);
      
      const cutoffKey = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
      
      // Filter out months older than 3 months
      const beforeCount = this.salesHistory.length;
      this.salesHistory = this.salesHistory.filter(month => month.monthKey >= cutoffKey);
      
      const deletedCount = beforeCount - this.salesHistory.length;
      if (deletedCount > 0) {
        console.log(`🗑️  Cleaned up ${deletedCount} old month(s) from sales history`);
        this.saveToLocalStorage('salesHistory', this.salesHistory);
      }
    } catch (error) {
      console.error('Error cleaning up sales history:', error);
    }
  },
  
  // Get sales history (last 3 months)
  getSalesHistory() {
    this.loadSalesHistory();
    // Sort by month (newest first)
    return this.salesHistory.sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  },
  
  // Get specific month's history
  getMonthHistory(monthKey) {
    this.loadSalesHistory();
    return this.salesHistory.find(m => m.monthKey === monthKey);
  },
  
  // Get sales summary for all 3 months
  getThreeMonthSummary() {
    this.loadSalesHistory();
    
    let totalOrders = 0;
    let totalRevenue = 0;
    let totalItems = 0;
    const categoryTotals = {};
    const productTotals = {};
    
    this.salesHistory.forEach(month => {
      totalOrders += month.totalOrders;
      totalRevenue += month.totalRevenue;
      totalItems += month.totalItems;
      
      // Aggregate daily reports for detailed stats
      month.dailyReports.forEach(day => {
        // Category totals
        if (day.categoryStats) {
          Object.keys(day.categoryStats).forEach(category => {
            if (!categoryTotals[category]) {
              categoryTotals[category] = { count: 0, amount: 0 };
            }
            categoryTotals[category].count += day.categoryStats[category].count;
            categoryTotals[category].amount += day.categoryStats[category].amount;
          });
        }
        
        // Product totals
        if (day.productStats) {
          Object.keys(day.productStats).forEach(product => {
            if (!productTotals[product]) {
              productTotals[product] = {
                count: 0,
                amount: 0,
                category: day.productStats[product].category,
                firstSoldDate: day.date,
                lastSoldDate: day.date
              };
            } else {
              // Update last sold date
              if (day.date > productTotals[product].lastSoldDate) {
                productTotals[product].lastSoldDate = day.date;
              }
              // Update first sold date
              if (day.date < productTotals[product].firstSoldDate) {
                productTotals[product].firstSoldDate = day.date;
              }
            }
            productTotals[product].count += day.productStats[product].count;
            productTotals[product].amount += day.productStats[product].amount;
          });
        }
      });
    });
    
    return {
      months: this.salesHistory,
      totalOrders,
      totalRevenue,
      totalItems,
      categoryTotals,
      productTotals,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      averageItemsPerOrder: totalOrders > 0 ? totalItems / totalOrders : 0
    };
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
  
  // Manually save current day's orders to history (without resetting)
  saveCurrentDayToHistory() {
    if (this.orders.length === 0) {
      return { success: false, message: 'No orders to save' };
    }
    
    try {
      const dailyReport = this.calculateDailyTotal();
      this.saveDailyReportToHistory(dailyReport);
      return { success: true, message: 'Current day saved to history' };
    } catch (error) {
      console.error('Error saving current day:', error);
      return { success: false, message: error.message };
    }
  },

  // 3ï¸âƒ£2ï¸âƒ£ Update Restaurant Info
  updateRestaurantInfo(name) {
    this.settings.restaurantName = name;
    this.saveToLocalStorage("settings", this.settings);
  },

  // 3ï¸âƒ£3ï¸âƒ£ Set Service Charge Rate
  setServiceChargeRate(rate) {
    this.settings.serviceChargeRate = parseFloat(rate);
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

    console.log("Found user:", user);

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
