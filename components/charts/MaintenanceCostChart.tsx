import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFarm } from '../../context/FarmContext';

const MaintenanceCostChart: React.FC = () => {
  const { equipment, settings } = useFarm();

  const data = React.useMemo(() => {
    return equipment.map(item => {
        const totalCost = item.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
        return {
            name: item.name,
            cost: totalCost,
        };
    }).filter(d => d.cost > 0);
  }, [equipment]);

  if (data.length === 0) {
    return <p className="text-center text-text-secondary p-8">No maintenance cost data to display.</p>;
  }
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(value);
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tickFormatter={formatCurrency} />
        <YAxis type="category" dataKey="name" width={150} />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Bar dataKey="cost" name="Total Maintenance Cost" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MaintenanceCostChart;
