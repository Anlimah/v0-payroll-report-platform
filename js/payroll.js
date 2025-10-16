class PayrollManager {
	constructor() {
		this.currentPeriod = null;
		this.currentStaff = null;
		this.selectedAllowances = [];
		this.selectedDeductions = [];
		this.currencyRate = 1.0;
	}

	async initialize() {
		await this.loadCurrencyRate();
	}

	async loadCurrencyRate() {
		try {
			const response = await window.ApiService.get(
				API_ENDPOINTS.CURRENCY_RATES + "?current=true"
			);
			if (response.success && response.data) {
				this.currencyRate = Number.parseFloat(response.data.rate);
			}
		} catch (error) {
			console.error("Error loading currency rate:", error);
		}
	}

	async searchStaff(staffNumber) {
		try {
			const response = await window.ApiService.get(
				API_ENDPOINTS.STAFFS + `?staff_number=${staffNumber}`
			);
			if (response.success && response.data) {
				this.currentStaff = response.data;
				return response.data;
			}
			return null;
		} catch (error) {
			console.error("Error searching staff:", error);
			return null;
		}
	}

	calculatePayroll(basicSalary, allowances, deductions) {
		let totalAllowances = 0;
		let totalDeductions = 0;

		// Calculate allowances
		allowances.forEach((allowance) => {
			if (allowance.is_percentage) {
				totalAllowances += (basicSalary * allowance.percentage_value) / 100;
			} else {
				totalAllowances += Number.parseFloat(allowance.amount);
			}
		});

		// Calculate deductions
		deductions.forEach((deduction) => {
			if (deduction.is_percentage) {
				totalDeductions += (basicSalary * deduction.percentage_value) / 100;
			} else {
				totalDeductions += Number.parseFloat(deduction.amount);
			}
		});

		const grossSalary = basicSalary + totalAllowances;
		const netSalary = grossSalary - totalDeductions;
		const netSalaryGHS = netSalary * this.currencyRate;

		return {
			basic_salary: basicSalary,
			total_allowances: totalAllowances,
			total_deductions: totalDeductions,
			gross_salary: grossSalary,
			net_salary: netSalary,
			net_salary_ghs: netSalaryGHS,
			currency_rate: this.currencyRate,
		};
	}

	async savePayrollEntry(
		periodId,
		staffId,
		basicSalary,
		allowances,
		deductions
	) {
		const payrollData = {
			payroll_period_id: periodId,
			staff_id: staffId,
			basic_salary: basicSalary,
			allowances: allowances,
			deductions: deductions,
		};

		try {
			const response = await window.ApiService.post(
				API_ENDPOINTS.PAYROLL_ENTRIES,
				payrollData
			);
			return response;
		} catch (error) {
			console.error("Error saving payroll entry:", error);
			throw error;
		}
	}

	async updatePayrollEntry(entryId, basicSalary, allowances, deductions) {
		const payrollData = {
			id: entryId,
			basic_salary: basicSalary,
			allowances: allowances,
			deductions: deductions,
		};

		try {
			const response = await window.ApiService.put(
				API_ENDPOINTS.PAYROLL_ENTRIES,
				payrollData
			);
			return response;
		} catch (error) {
			console.error("Error updating payroll entry:", error);
			throw error;
		}
	}

	formatCurrency(amount, currency = "USD") {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 2,
		}).format(amount);
	}

	formatCurrencyGHS(amount) {
		return `GHS ${Number.parseFloat(amount).toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;
	}
}

// Export for use in other modules
window.PayrollManager = PayrollManager;
