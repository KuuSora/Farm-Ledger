import React from 'react';
import Card from '../components/Card';
import ExpenseBreakdownChart from '../components/charts/ExpenseBreakdownChart';
import CropPerformanceChart from '../components/charts/CropPerformanceChart';
import MonthlyFinancialFlowChart from '../components/charts/MonthlyFinancialFlowChart';
import IncomeSourceBreakdownChart from '../components/charts/IncomeSourceBreakdownChart';

const Reports: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Monthly Financial Flow">
        <p className="text-text-secondary mb-4">Track your income and expenses over the last 12 months to understand your farm's cash flow and seasonal trends.</p>
        <div className="h-96">
            <MonthlyFinancialFlowChart />
        </div>
      </Card>
      <Card title="Crop Performance">
        <p className="text-text-secondary mb-4">Analyze the profitability of each crop by comparing its total income against its total expenses.</p>
        <div className="h-96">
            <CropPerformanceChart />
        </div>
      </Card>
      <Card title="Income Source Breakdown">
        <p className="text-text-secondary mb-4">See where your revenue is coming from. This chart breaks down your income by category for the current year.</p>
        <div className="h-96">
            <IncomeSourceBreakdownChart />
        </div>
      </Card>
      <Card title="Expense Category Breakdown">
        <p className="text-text-secondary mb-4">A look at where your money is going. This chart shows the proportion of expenses by category for the current year.</p>
        <div className="h-96">
            <ExpenseBreakdownChart />
        </div>
      </Card>
    </div>
  );
};

export default Reports;