# 🚀 Quick Start Guide - Dining & Takeaway Features

## ⚡ 60-Second Overview

Your POS system now has **professional restaurant capabilities**:

### 🍽️ DINING (Table Service)
1. Click **"Dining"** tab
2. Click a **green (FREE)** table
3. Add items by clicking products
4. Click **"Print Temp Bill"** (sends to kitchen)
5. Click **"Process Payment"** when ready
6. Enter payment amount
7. Click **"Confirm & Print Final Bill"**
8. Order closes, table freed automatically

### 🥡 TAKEAWAY (To-Go Orders)
1. Click **"Takeaway"** tab (same as old POS)
2. Add items to cart
3. Calculate total
4. Process payment
5. Print receipt

---

## 🎯 Key Features Added

| Feature | Description |
|---------|-------------|
| **Table Management** | 10 tables (FREE/OCCUPIED status) |
| **Temporary Bill** | Kitchen Order Ticket (KOT/Pre-Bill) |
| **Final Bill** | Payment receipt with change |
| **Active Orders** | Track all in-progress orders |
| **Order Types** | DINING vs TAKEAWAY |
| **Order Status** | OPEN → TEMP_BILL → PAID → CLOSED |

---

## 🏃 Common Tasks

### Open a Table
```
Dining → Click FREE table → Confirm → Start adding items
```

### Add Items
```
Browse categories OR Search → Click product → Quantity adjusts
```

### Send to Kitchen
```
Print Temp Bill (KOT) → Kitchen receives order
```

### Complete Payment
```
Process Payment → Enter amount → Confirm → Final bill prints
```

### Free Table
```
After payment → "Close order?" → Yes → Table becomes FREE
```

---

## 📱 Screen Layouts

### Dining Page (Left-Right Split)

**LEFT SIDE**: Table Grid
- Shows all 10 tables
- Green = Free
- Red = Occupied
- Click to select

**RIGHT SIDE**: Order Management
- Current order details
- Product selection
- Order items list
- Totals and actions

---

## 🎨 Color Codes

| Color | Status | Meaning |
|-------|--------|---------|
| 🟢 Green | FREE | Table available |
| 🔴 Red | OCCUPIED | Table in use |
| 🔵 Blue | OPEN | Order being prepared |
| 🟡 Orange | TEMP_BILL | KOT printed |
| 🟢 Green | PAID | Payment complete |

---

## 💡 Pro Tips

1. **Print Temp Bill early** - Gets order to kitchen faster
2. **Use search** - Faster than browsing categories
3. **Check active orders** - Click summary to see all orders
4. **Verify change** - System calculates automatically
5. **Cancel carefully** - Cancelling deletes the order

---

## 🔄 Typical Workflow

### Lunch Rush (Multiple Tables)

```
1. Table 1: Open → Take order → Temp Bill
2. Table 3: Open → Take order → Temp Bill
3. Table 5: Open → Take order → Temp Bill
4. Table 1: Customer pays → Final Bill → Close
5. Table 7: Open (now free) → New customer
```

### Single Customer Flow

```
1. Customer arrives → Open table
2. Take order → Add items
3. Print Temp Bill → Kitchen prepares
4. Food served → Customer eats
5. Customer asks for bill → Process payment
6. Final Bill → Customer leaves → Close order
```

---

## ⚠️ Important Notes

- **Temp Bill ≠ Payment Receipt**  
  Temp bill is for kitchen. Final bill is for payment.

- **Order Status Matters**  
  Can't process payment until items are added.

- **Tables Auto-Close**  
  After final bill, system prompts to close table.

- **Active Orders Persist**  
  Orders saved even if you navigate away.

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't open table | Table occupied - click to view order |
| Can't add items | No order selected - open a table first |
| Payment button disabled | Order empty - add items first |
| Change showing red | Insufficient payment - enter more |
| Table stuck occupied | Check active orders - close manually |

---

## 📊 Navigation Tabs

| Tab | Who Can Access | Purpose |
|-----|----------------|---------|
| Takeaway | Admin, Cashier | Quick take-out orders |
| Dining | Admin, Cashier | Table service |
| Products | Admin only | Manage inventory |
| Orders | Admin only | View history |
| Sales History | Admin only | Analytics |
| Settings | Admin only | Configure system |

---

## 🎯 Success Checklist

- [ ] Opened a table successfully
- [ ] Added items to order
- [ ] Printed temp bill (KOT)
- [ ] Processed payment
- [ ] Printed final bill
- [ ] Closed order and freed table
- [ ] Viewed active orders summary
- [ ] Searched for products
- [ ] Adjusted item quantities
- [ ] Cancelled an order

---

## 🎉 You're Ready!

Start with **Dining page → Click Table 1 → Add items**

Your restaurant POS is now production-ready! 🍽️✨

---

**Need detailed info?** Check `DINING_FEATURES_GUIDE.md`

**Have questions?** Check browser console (F12) for logs
