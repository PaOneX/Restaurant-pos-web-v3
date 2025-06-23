// ========================================
// APPLICATION ENTRY POINT
// ========================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the POS System
    Controller.initSystem();
    
    // Show POS page by default
    Controller.showPage('pos');
    
    console.log('🎉 Restaurant POS System Ready!');
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Application Error:', event.error);
    View.showAlert('An error occurred. Please try again.', 'error');
});

// Handle print events
window.addEventListener('beforeprint', () => {
    console.log('Printing receipt...');
});

window.addEventListener('afterprint', () => {
    console.log('Print completed');
    // Close modal after print
    setTimeout(() => {
        Controller.closeReceipt();
    }, 500);
});
