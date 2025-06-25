# Quick Start Guide - Testing Sales History Feature

## 🚀 Getting Started

### Step 1: Open the Application
1. Open `index.html` in your web browser
2. The POS system will load automatically

### Step 2: Login as Admin
1. Click the **"Login"** button in the header
2. Enter credentials:
   - **Username:** `admin`
   - **Password:** `123`
3. Click **"Login"**

### Step 3: Create Some Test Orders
To test the sales history feature, you need to create some orders first:

1. **Go to POS/Billing page**
2. **Add items to cart:**
   - Click on products to add them
   - Adjust quantities as needed
3. **Complete the order:**
   - Enter payment amount
   - Click "Print Bill"
4. **Repeat** several times to create multiple orders

### Step 4: Access Sales History
1. Click **"Sales History"** in the navigation menu
2. You'll see:
   - Overall 3-month summary (if data exists)
   - Monthly breakdown cards
   - Top 10 products table

---

## 🧪 Testing Scenarios

### Scenario 1: View Empty History
**When:** First time using the system
**Expected:** "No Sales History" empty state with message

### Scenario 2: Test Daily Reset (Simulated)
Since daily reset happens at midnight, you can simulate it:

1. Open browser console (F12)
2. Run this command:
```javascript
// Create test daily data
Model.orders = [
  {
    id: '1',
    items: [{productId: '1', name: 'Test Item', price: 100, quantity: 2}],
    totals: {total: 200},
    date: {date: '1/31/2026', time: '10:00 AM'},
    user: 'admin'
  }
];
Model.saveToLocalStorage('orders', Model.orders);

// Manually trigger daily report save
const report = Model.calculateDailyTotal();
Model.saveDailyReportToHistory(report);

// Reload the sales history
Controller.loadSalesHistory();
```

### Scenario 3: View Month Details
1. Click on any month card
2. Modal should open showing:
   - Month summary statistics
   - Daily breakdown table
3. Close modal and return to main view

### Scenario 4: Export to WhatsApp
1. First, set admin phone in Settings:
   - Go to Settings page
   - Enter phone number (e.g., `94771234567`)
   - Save settings
2. Go to Sales History
3. Click **"Export to WhatsApp"**
4. WhatsApp should open with formatted report

### Scenario 5: Test 3-Month Cleanup
To test automatic cleanup of old data:

1. Open console
2. Create test data for multiple months:
```javascript
// Add old months to history
Model.salesHistory.push({
  monthKey: '2025-08',  // 5 months ago
  month: 'August 2025',
  year: 2025,
  monthNumber: 8,
  dailyReports: [],
  totalOrders: 100,
  totalRevenue: 50000,
  totalItems: 300
});

Model.salesHistory.push({
  monthKey: '2025-09',  // 4 months ago
  month: 'September 2025',
  year: 2025,
  monthNumber: 9,
  dailyReports: [],
  totalOrders: 120,
  totalRevenue: 60000,
  totalItems: 360
});

Model.saveToLocalStorage('salesHistory', Model.salesHistory);
console.log('Before cleanup:', Model.salesHistory.length, 'months');

// Run cleanup
Model.cleanupOldSalesHistory();
console.log('After cleanup:', Model.salesHistory.length, 'months');

// Reload view
Controller.loadSalesHistory();
```

**Expected:** Only last 3 months should remain

---

## 📱 Responsive Design Testing

### Desktop (1920x1080)
- Summary grid: 4 columns
- Monthly cards: 3 columns
- All elements clearly visible

### Tablet (768px)
- Summary grid: 2 columns
- Monthly cards: 2 columns
- Touch-friendly buttons

### Mobile (375px)
- Summary grid: 1 column
- Monthly cards: 1 column stacked
- Optimized for small screens

---

## 🔍 Verification Checklist

### Functionality
- [ ] Sales history page loads without errors
- [ ] Summary statistics display correctly
- [ ] Monthly cards show accurate data
- [ ] Month details modal opens and displays data
- [ ] Top products table shows correct rankings
- [ ] WhatsApp export generates proper format
- [ ] Empty state displays when no data
- [ ] Navigation works correctly

### Data Integrity
- [ ] Daily reports save to monthly history
- [ ] Monthly totals aggregate correctly
- [ ] 3-month limit enforced
- [ ] Old data cleaned up automatically
- [ ] Product statistics calculated correctly
- [ ] Category breakdown accurate

### UI/UX
- [ ] Page loads quickly
- [ ] Cards are clickable with hover effects
- [ ] Modal opens smoothly
- [ ] Tables are readable
- [ ] Icons display correctly
- [ ] Colors and styling consistent
- [ ] Responsive on all screen sizes

### Security
- [ ] Only admin can access Sales History
- [ ] Cashier cannot see the page
- [ ] Guest users redirected
- [ ] Data sanitized properly

---

## 🐛 Common Issues & Solutions

### Issue: "No Sales History" always shows
**Solution:** 
- Ensure you have completed some orders
- Check that daily reset has occurred (or manually save report)
- Verify localStorage is enabled in browser

### Issue: Month details don't show
**Solution:**
- Check console for errors
- Verify monthKey is correct
- Ensure dailyReports array exists

### Issue: WhatsApp doesn't open
**Solution:**
- Ensure admin phone is set in Settings
- Check that phone format is correct (no spaces or special chars)
- Verify browser allows pop-ups

### Issue: Data not persisting
**Solution:**
- Check browser localStorage quota
- Clear old localStorage if full
- Check for errors in console

---

## 💾 Data Structure Verification

### Check Current Data
Open console and run:

```javascript
// View sales history
console.log('Sales History:', Model.salesHistory);

// View specific month
console.log('Month data:', Model.getMonthHistory('2026-01'));

// View 3-month summary
console.log('Summary:', Model.getThreeMonthSummary());

// Check localStorage
console.log('Stored:', localStorage.getItem('salesHistory'));
```

### Expected Structure
```javascript
{
  months: [
    {
      monthKey: "2026-01",
      month: "January 2026",
      year: 2026,
      monthNumber: 1,
      dailyReports: [
        {
          date: "2026-01-31",
          dateFormatted: "1/31/2026",
          orders: 5,
          revenue: 5000,
          items: 25,
          categoryStats: {...},
          productStats: {...}
        }
      ],
      totalOrders: 5,
      totalRevenue: 5000,
      totalItems: 25
    }
  ],
  totalOrders: 5,
  totalRevenue: 5000,
  totalItems: 25,
  categoryTotals: {...},
  productTotals: {...}
}
```

---

## 🎯 Performance Testing

### Load Time
- Initial page load: < 1 second
- Sales history render: < 500ms
- Month details modal: < 200ms

### Memory Usage
Check in Chrome DevTools > Memory:
- Baseline: ~5-10 MB
- With 3 months data: ~10-15 MB
- No memory leaks on navigation

---

## 📊 Demo Data Script

Want quick demo data? Run this:

```javascript
// Generate 3 months of demo data
function generateDemoSalesHistory() {
  const months = ['2025-11', '2025-12', '2026-01'];
  const monthNames = ['November 2025', 'December 2025', 'January 2026'];
  
  Model.salesHistory = [];
  
  months.forEach((monthKey, i) => {
    const month = {
      monthKey: monthKey,
      month: monthNames[i],
      year: parseInt(monthKey.split('-')[0]),
      monthNumber: parseInt(monthKey.split('-')[1]),
      dailyReports: [],
      totalOrders: 0,
      totalRevenue: 0,
      totalItems: 0
    };
    
    // Add 20-25 daily reports per month
    const daysInMonth = 20 + Math.floor(Math.random() * 6);
    for (let day = 1; day <= daysInMonth; day++) {
      const orders = 5 + Math.floor(Math.random() * 20);
      const items = orders * (2 + Math.floor(Math.random() * 3));
      const revenue = items * (500 + Math.random() * 1000);
      
      month.dailyReports.push({
        date: `${monthKey}-${String(day).padStart(2, '0')}`,
        dateFormatted: `${month.monthNumber}/${day}/${month.year}`,
        orders: orders,
        revenue: revenue,
        items: items,
        categoryStats: {},
        productStats: {}
      });
      
      month.totalOrders += orders;
      month.totalRevenue += revenue;
      month.totalItems += items;
    }
    
    Model.salesHistory.push(month);
  });
  
  Model.saveToLocalStorage('salesHistory', Model.salesHistory);
  console.log('✅ Demo data generated!');
  Controller.loadSalesHistory();
}

// Run it
generateDemoSalesHistory();
```

---

## 📞 Support & Feedback

If you encounter any issues:
1. Check browser console for errors (F12)
2. Verify you're logged in as admin
3. Review the documentation files
4. Check localStorage for data

---

**Happy Testing! 🎉**

For detailed documentation, see:
- `SALES_HISTORY_FEATURE.md` - Feature documentation
- `CODE_IMPROVEMENTS.md` - Code quality recommendations
- `README.md` - Project overview
