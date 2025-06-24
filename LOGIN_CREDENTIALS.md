# Login Credentials

## Default Users

### Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Access Level:** Full Access
  - POS / Billing ✓
  - Products Management ✓
  - Orders History ✓
  - Settings ✓

### Cashier Account
- **Username:** `cashier`
- **Password:** `cashier123`
- **Access Level:** Limited Access
  - POS / Billing ✓
  - Products Management ✗
  - Orders History ✗
  - Settings ✗

## Role-Based Access Control

### Admin Role
The admin has complete access to all system features:
- View and manage all products
- Add, edit, and delete products
- View complete order history
- Delete orders
- Configure system settings (tax, discount, restaurant info)
- Reset products to default menu
- Access POS for billing

### Cashier Role
The cashier has restricted access for daily operations:
- Access POS/Billing page only
- Add products to cart
- Process sales and payments
- Print receipts
- Cannot access product management, order history, or settings

## Security Notes

⚠️ **Important:** These are default credentials for development/testing purposes. In a production environment, you should:
1. Change default passwords immediately
2. Implement proper password hashing
3. Add user management interface for admins
4. Enable password reset functionality
5. Implement session timeout
6. Add audit logs for sensitive operations

## How to Login

1. Click the **Login** button in the header
2. Enter your username and password
3. Click **Login**
4. You will be redirected to the POS page
5. Navigation menu will show only pages you have access to

## How to Logout

- Click the **Logout** button in the header
- Confirm logout when prompted
- You will be logged out and redirected to POS page
- Navigation will show only the POS page
