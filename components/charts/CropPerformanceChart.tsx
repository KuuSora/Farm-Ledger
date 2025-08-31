
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFarm } from '../../context/FarmContext';
import { TransactionType } from '../../types';

const CropPerformanceChart: React.FC = () => {
  const { transactions, crops, settings } = useFarm();

  const data = React.useMemo(() => {
    return crops.map(crop => {
      const income = transactions
        .filter(t => t.cropId === crop.id && t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = transactions
        .filter(t => t.cropId === crop.id && t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: crop.name,
        income,
        expenses,
        profit: income - expenses
      };
    });
  }, [transactions, crops]);

  if (data.length === 0) {
    return <p className="text-center text-text-secondary p-8">No crop data to display.</p>;
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(value);
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={formatCurrency} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Bar dataKey="income" fill="#22c55e" />
        <Bar dataKey="expenses" fill="#ef4444" />
        <Bar dataKey="profit" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CropPerformanceChart;
