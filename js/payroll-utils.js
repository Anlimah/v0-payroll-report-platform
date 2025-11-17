// Payroll calculation utilities
class PayrollUtils {
  static calculatePayrollBreakdown(staff, allowances = [], deductions = []) {
    const basicSalary = Number.parseFloat(staff.basic_salary) || 0
    let totalAllowances = 0
    let totalDeductions = 0

    // Calculate allowances
    allowances.forEach((allowance) => {
      if (allowance.checked) {
        if (allowance.is_percentage) {
          totalAllowances += (basicSalary * (allowance.percentage_value || 0)) / 100
        } else {
          totalAllowances += Number.parseFloat(allowance.amount || 0)
        }
      }
    })

    // Calculate deductions
    deductions.forEach((deduction) => {
      if (deduction.checked) {
        if (deduction.is_percentage) {
          totalDeductions += (basicSalary * (deduction.percentage_value || 0)) / 100
        } else {
          totalDeductions += Number.parseFloat(deduction.amount || 0)
        }
      }
    })

    const grossSalary = basicSalary + totalAllowances
    const netSalary = grossSalary - totalDeductions

    return {
      basicSalary,
      totalAllowances,
      totalDeductions,
      grossSalary,
      netSalary,
    }
  }

  static formatCurrency(value, currency = "GHS") {
    return `${currency} ${Number.parseFloat(value).toFixed(2)}`
  }

  static calculateNetSalaryGHS(netSalary, exchangeRate = 1.0) {
    return netSalary * exchangeRate
  }
}

window.PayrollUtils = PayrollUtils
