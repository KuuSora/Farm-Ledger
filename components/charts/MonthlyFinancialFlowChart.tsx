import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFarm } from '../../context/FarmContext';
import { TransactionType } from '../../types';

const MonthlyFinancialFlowChart: React.FC = () => {
  const { transactions, settings } = useFarm();

  const data = React.useMemo(() => {
    const monthData: { [key: string]: { income: number; expenses: number } } = {};
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthData[monthKey] = { income: 0, expenses: 0 };
    }
    
    transactions.forEach(t => {
      const tDate = new Date(t.date);
      // Filter transactions for the last 12 months
      const diffMonths = (today.getFullYear() - tDate.getFullYear()) * 12 + (today.getMonth() - tDate.getMonth());
      if (diffMonths >= 0 && diffMonths < 12) {
        const monthKey = tDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthData[monthKey]) {
            if (t.type === TransactionType.INCOME) {
                monthData[monthKey].income += t.amount;
            } else {
                monthData[monthKey].expenses += t.amount;
            }
        }
      }
    });

    return Object.keys(monthData).map(key => ({
      name: key,
      Income: monthData[key].income,
      Expenses: monthData[key].expenses
    }));
  }, [transactions]);
  
  if (transactions.length === 0) {
    return <p className="text-center text-text-secondary p-8">No transaction data available to display.</p>;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency, notation: 'compact' }).format(value);
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(value)} />
        <Legend />
        <Line type="monotone" dataKey="Income" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlyFinancialFlowChart;
