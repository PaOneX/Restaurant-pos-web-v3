# Restaurant POS System

A fully functional Point of Sale (POS) system built with **MVC Architecture** and pure JavaScript (no frameworks).

## 🎯 Features

### ✅ 40+ Core Functions Implemented

1. **System Initialization & Storage** (3 functions)
   - `initSystem()` - Initialize system on page load
   - `saveToLocalStorage()` - Save data permanently
   - `getFromLocalStorage()` - Retrieve saved data

2. **Product Management (CRUD)** (8 functions)
   - `loadProducts()` - Display all products
   - `addProduct()` - Add new product
   - `editProduct()` - Load product to form
   - `updateProduct()` - Update existing product
   - `deleteProduct()` - Delete product
   - `clearProductForm()` - Reset input fields
   - `searchProducts()` - Search by name/category
   - `filterByCategory()` - Filter products

3. **Billing / Cart Management** (8 functions)
   - `loadProductsToPOS()` - Show products on billing screen
   - `addToCart()` - Add product to bill
   - `renderCart()` - Display cart items
   - `updateCartQuantity()` - Change quantity
   - `removeFromCart()` - Remove item
   - `clearCart()` - Empty bill
   - `calculateSubtotal()` - Calculate item total
   - `calculateTotal()` - Calculate bill total with tax/discount

4. **Receipt / Printing** (4 functions)
   - `generateReceipt()` - Create receipt HTML
   - `printBill()` - Print receipt
   - `saveOrder()` - Save order history
   - `getCurrentDateTime()` - Get date/time

5. **Order Management** (3 functions)
   - `loadOrders()` - Show past orders
   - `viewOrder()` - View order details
   - `deleteOrder()` - Remove order record

6. **Search & Filter** (3 functions)
   - `searchByName()` - Search products
   - `filterByCategory()` - Filter by category
   - `sortByPrice()` - Sort products by price

7. **User & Authentication** (3 functions)
   - `loginUser()` - Login cashier/admin
   - `logoutUser()` - Logout
   - `checkUserRole()` - Access control

8. **Settings Management** (3 functions)
   - `updateRestaurantInfo()` - Set restaurant name
   - `setTaxRate()` - Configure tax
   - `applyDiscount()` - Apply discount

9. **Validation & Utilities** (4 functions)
   - `validateProductForm()` - Check empty fields
   - `showAlert()` - Display messages
   - `formatCurrency()` - Format price
   - `generateUniqueId()` - Create IDs

10. **Page Navigation** (2 functions)
    - `showPage()` - Navigate between pages
    - `hideAllPages()` - UI control

## 🏗️ MVC Architecture

### Model (`js/model.js`)
- Data management layer
- LocalStorage operations
- Business data logic
- CRUD operations

### View (`js/view.js`)
- UI rendering layer
- DOM manipulation
- Display updates
- User feedback

### Controller (`js/controller.js`)
- Business logic layer
- Connects Model & View
- Event handling
- Application flow

### App (`js/app.js`)
- Application entry point
- System initialization
- Global event handlers

## 📁 Project Structure

```
Restaurant/
│
├── index.html              # Main application page
├── css/
│   └── style.css          # Complete styling
├── js/
│   ├── model.js           # Data layer
│   ├── view.js            # UI layer
│   ├── controller.js      # Logic layer
│   └── app.js             # Entry point
└── README.md
```

## 🚀 How to Use

### 1. Open the Application
- Open `index.html` in a web browser
- System auto-initializes with sample data

### 2. Login (Optional)
- Click "Login" button
- Default credentials:
  - **Admin**: username: `admin`, password: `admin`
  - **Cashier**: username: `cashier`, password: `cashier`

### 3. Manage Products
- Navigate to "Products" page
- Add new products with name, category, price, stock
- Edit or delete existing products
- Search and filter products

### 4. Process Sales (POS)
- Navigate to "POS / Billing" page
- Click products to add to cart
- Adjust quantities using +/- buttons
- View real-time totals with tax/discount
- Click "Print Bill" to complete order

### 5. View Orders
- Navigate to "Orders" page
- View all past orders
- Click "View" to see order details
- Delete old orders if needed

### 6. Configure Settings
- Navigate to "Settings" page
- Update restaurant name
- Set tax rate (%)
- Set discount rate (%)

## 💾 Data Storage

All data is stored in **browser LocalStorage**:
- Products
- Cart items
- Order history
- Settings
- User session

Data persists between sessions until manually cleared.

## 🎨 Features Highlight

✅ **Responsive Design** - Works on desktop, tablet, mobile  
✅ **Real-time Updates** - Instant UI updates  
✅ **Print Functionality** - Professional receipt printing  
✅ **User Authentication** - Admin and cashier roles  
✅ **Search & Filter** - Fast product lookup  
✅ **Tax & Discount** - Automatic calculations  
✅ **Order History** - Complete transaction records  
✅ **Data Persistence** - LocalStorage integration  
✅ **Clean UI** - Modern, intuitive interface  
✅ **No Dependencies** - Pure JavaScript, no frameworks  

## 🔧 Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling & animations
- **JavaScript (ES6+)** - Logic & functionality
- **Font Awesome** - Icons
- **LocalStorage API** - Data persistence

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## 🎯 Business Use Cases

✅ Small restaurants  
✅ Cafes & coffee shops  
✅ Food trucks  
✅ Bakeries  
✅ Fast food outlets  
✅ Retail stores  
✅ Pop-up shops  

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Developer

Built with ❤️ using pure JavaScript and MVC Architecture

---

**Enjoy your fully functional Restaurant POS System!** 🍽️
