# 🧪 Testing Guide

## How to Test Your New Features

### Option 1: Open Directly
1. Navigate to: `d:\Icet\Internet Technology\Resturant - v3\`
2. Double-click `index.html`
3. System opens in your default browser

### Option 2: Local Server (Recommended)
```bash
# Navigate to project folder
cd "d:\Icet\Internet Technology\Resturant - v3"

# Start local server (if you have Python)
python -m http.server 8000

# Or if you have Node.js
npx http-server -p 8000

# Then open: http://localhost:8000
```

---

## 🧪 Test Scenarios

### Test 1: Open a Dining Table
1. Click "Dining" tab
2. Click on Table 1 (green/FREE)
3. Confirm "Open Table"
4. ✅ Table should turn red (OCCUPIED)
5. ✅ Order panel should appear on right

### Test 2: Add Items to Order
1. Click on any product (e.g., "Chicken Fried Rice")
2. ✅ Item appears in order list
3. Click + button to increase quantity
4. ✅ Quantity and subtotal update
5. ✅ Total updates automatically

### Test 3: Print Temporary Bill
1. With items in order, click "Print Temp Bill (KOT)"
2. ✅ Modal appears with temp receipt
3. ✅ Shows "TEMPORARY BILL" header
4. ✅ Has order details and items
5. Try printing (Ctrl+P)

### Test 4: Process Payment
1. Close temp bill modal
2. Click "Process Payment"
3. Enter amount: 5000
4. ✅ Change shows in green
5. Click "Confirm & Print Final Bill"
6. ✅ Final receipt appears
7. ✅ Shows "PAID" status

### Test 5: Close Order
1. After payment confirmation
2. Click "Yes, Close Order"
3. ✅ Table 1 turns green (FREE)
4. ✅ Order removed from active list
5. ✅ Ready for next customer

### Test 6: Multiple Tables
1. Open Table 2
2. Add items
3. Don't close - click Table 3
4. Open Table 3, add different items
5. ✅ Both tables shown as OCCUPIED
6. Click back on Table 2
7. ✅ Table 2's order loads
8. ✅ Items from Table 2 displayed

### Test 7: Active Orders Summary
1. With multiple tables open
2. Check "Active Orders" summary
3. ✅ Shows count of open orders
4. ✅ Shows total revenue
5. Click "View All Orders"
6. ✅ Modal shows all active orders

### Test 8: Cancel Order
1. Open a table
2. Add items
3. Click "Cancel Order"
4. Confirm cancellation
5. ✅ Order deleted
6. ✅ Table becomes FREE
7. ✅ Items cleared

### Test 9: Takeaway Order
1. Click "Takeaway" tab
2. ✅ Shows original POS interface
3. Add items to cart
4. Process payment as before
5. ✅ Works like original system

### Test 10: Search Products
1. In dining page with table open
2. Use search box
3. Type "chicken"
4. ✅ Only chicken items show
5. Clear search
6. ✅ All items return

---

## 🐛 What to Check

### Visual Checks
- [ ] Tables display in grid (10 tables)
- [ ] Green tables are FREE
- [ ] Red tables are OCCUPIED
- [ ] Navigation tabs show Takeaway & Dining
- [ ] All icons display correctly
- [ ] Responsive on mobile (test with F12 → responsive mode)

### Functional Checks
- [ ] Can open FREE tables
- [ ] Can't open OCCUPIED tables (loads order instead)
- [ ] Items add to order correctly
- [ ] Quantity controls work (+/-)
- [ ] Remove item works
- [ ] Totals calculate correctly
- [ ] Service charge applies (if set in settings)
- [ ] Discount applies (if set in settings)
- [ ] Temp bill prints
- [ ] Final bill prints
- [ ] Payment validation works (insufficient amount blocked)
- [ ] Change calculates correctly
- [ ] Order closes properly
- [ ] Table frees after close

### Data Checks (Browser Console)
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Check for:
   - [ ] `tables` - Contains 10 tables
   - [ ] `activeOrders` - Contains open orders
   - [ ] `orders` - Contains closed orders
   - [ ] All data persists on page reload

---

## 🔍 Debug Tips

### If something doesn't work:

1. **Check Browser Console** (F12 → Console)
   - Look for error messages in red
   - Note the error and line number

2. **Check localStorage** (F12 → Application → Local Storage)
   - Verify data is saving
   - Clear localStorage if needed: `localStorage.clear()`

3. **Reload Page**
   - Sometimes helps refresh state
   - Data should persist

4. **Check Network** (F12 → Network)
   - Make sure all files load
   - No 404 errors

---

## ✅ Expected Behavior

### Normal Flow
```
Click Table → Opens → Add Items → Temp Bill → Payment → Close → Table Free
```

### Multiple Tables
```
Table 1: OPEN
Table 2: OPEN
Table 3: OPEN
Process Table 1 → Close → FREE
Table 2 & 3 still OPEN
```

### Data Persistence
```
Open orders → Refresh page → Orders still there
Close order → Check "orders" in localStorage → Order in history
```

---

## 🎉 Success Criteria

You know it's working if:

✅ Can create dining orders  
✅ Can create takeaway orders  
✅ Tables change status correctly  
✅ Multiple orders can be tracked  
✅ Temp bills generate properly  
✅ Final bills print correctly  
✅ Payment calculates change  
✅ Orders close and archive  
✅ Tables free after closing  
✅ Data persists across reloads

---

## 📸 Screenshots to Take

For documentation:
1. Dining page with tables
2. Open order with items
3. Temporary bill
4. Payment modal
5. Final bill
6. Active orders modal
7. Multiple occupied tables

---

## 🚨 Known Limitations

These are **intentional** design choices:

- **10 tables max** (by default, can increase in code)
- **No table editing** (create only)
- **No order editing after temp bill** (kitchen already has it)
- **Must complete payment to close** (prevents data loss)
- **localStorage only** (no server sync)

---

## 🎯 Quick Reset

If you want to start fresh:

```javascript
// In browser console (F12):
localStorage.clear();
location.reload();
```

This will:
- Delete all orders
- Reset all tables
- Clear all data
- Start fresh

---

## 📞 Support Checklist

Before asking for help:

- [ ] Checked browser console for errors
- [ ] Verified all files are present
- [ ] Cleared localStorage and retried
- [ ] Tested in different browser
- [ ] Checked documentation files

---

## 🎉 Ready to Test!

Start with the basic flow:

1. Open index.html
2. Click "Dining"
3. Click Table 1
4. Add "Chicken Fried Rice"
5. Print Temp Bill
6. Process Payment (enter 2000)
7. Close Order

**If this works, everything works!** 🎊
