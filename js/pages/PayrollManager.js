// PayrollManager - Re-exported from parent payroll.js module
// This ensures the class is available for import in this directory

// Get PayrollManager from window object (defined in payroll.js)
const PayrollManager = typeof window !== 'undefined' ? window.PayrollManager : null;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PayrollManager };
}

// Also ensure it's available globally
if (typeof window !== 'undefined') {
  window.PayrollManager = PayrollManager || window.PayrollManager;
}

export { PayrollManager };
export default PayrollManager;
