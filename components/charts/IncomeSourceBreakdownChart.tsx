import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFarm } from '../../context/FarmContext';
import { TransactionType } from '../../types';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const IncomeSourceBreakdownChart: React.FC = () => {
    const { transactions, settings } = useFarm();

    const data = React.useMemo(() => {
        const incomeData: { [key: string]: number } = {};
        const thisYear = new Date().getFullYear();
        
        transactions
            .filter(t => t.type === TransactionType.INCOME && new Date(t.date).getFullYear() === thisYear)
            .forEach(t => {
                if (incomeData[t.category]) {
                    incomeData[t.category] += t.amount;
                } else {
                    incomeData[t.category] = t.amount;
                }
            });
        
        return Object.entries(incomeData).map(([name, value]) => ({ name, value }));
    }, [transactions]);

    if (data.length === 0) {
        return <p className="text-center text-text-secondary p-8">No income data for this year to display.</p>;
    }
    
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't render label for small slices

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-semibold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(value)} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default IncomeSourceBreakdownChart;
