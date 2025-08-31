import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import Card from '../components/Card';
import { TrashIcon } from '../components/icons';

const Settings: React.FC = () => {
  const { settings, setSettings, setCrops, setTransactions, setTodos, crops, transactions, todos } = useFarm();
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState('');

  const handleCategoryAdd = (type: 'income' | 'expense') => {
      const cat = type === 'income' ? newIncomeCat.trim() : newExpenseCat.trim();
      if (!cat) return;
      
      const categories = type === 'income' ? settings.incomeCategories : settings.expenseCategories;
      if (categories.includes(cat)) {
          alert("Category already exists.");
          return;
      }

      setSettings(prev => ({
          ...prev,
          [type === 'income' ? 'incomeCategories' : 'expenseCategories']: [...categories, cat].sort()
      }));
      
      if (type === 'income') setNewIncomeCat('');
      else setNewExpenseCat('');
  };

  const handleCategoryDelete = (type: 'income' | 'expense', category: string) => {
    setSettings(prev => ({
        ...prev,
        [type === 'income' ? 'incomeCategories' : 'expenseCategories']: prev[type === 'income' ? 'incomeCategories' : 'expenseCategories'].filter(c => c !== category)
    }));
  };
  
  const handleBackup = () => {
    const data = {
        crops,
        transactions,
        settings,
        todos,
        backupDate: new Date().toISOString()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `farm_ledger_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };
  
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error("File is not valid text.");
            const data = JSON.parse(text);
            if(confirm("Are you sure you want to restore? This will overwrite all current data.")) {
                setCrops(data.crops || []);
                setTransactions(data.transactions || []);
                setSettings(data.settings || {});
                setTodos(data.todos || []);
                alert("Data restored successfully!");
            }
        } catch (error) {
            alert("Failed to restore data. The file may be corrupt.");
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-8">
        <Card title="Farm Details">
            <div className="space-y-4">
                <div>
                    <label className="block text-lg font-medium text-text-secondary">Farm Name</label>
                    <input type="text" value={settings.farmName} onChange={e => setSettings(p => ({...p, farmName: e.target.value}))} className="mt-1 block w-full p-3 border rounded-lg text-lg" />
                </div>
                <div>
                    <label className="block text-lg font-medium text-text-secondary">Currency</label>
                    <input type="text" value={settings.currency} onChange={e => setSettings(p => ({...p, currency: e.target.value}))} className="mt-1 block w-full p-3 border rounded-lg text-lg" />
                </div>
            </div>
        </Card>

        <Card title="Manage Categories">
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-2">Income Categories</h3>
                    <div className="flex mb-4">
                        <input type="text" value={newIncomeCat} onChange={e => setNewIncomeCat(e.target.value)} placeholder="New income source" className="flex-grow p-2 border rounded-l-lg" />
                        <button onClick={() => handleCategoryAdd('income')} className="p-2 bg-primary text-white rounded-r-lg">Add</button>
                    </div>
                    <ul className="space-y-2">{settings.incomeCategories.map(cat => <li key={cat} className="flex justify-between items-center p-2 bg-gray-50 rounded-md"><span>{cat}</span><button onClick={() => handleCategoryDelete('income', cat)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button></li>)}</ul>
                </div>
                 <div>
                    <h3 className="text-xl font-semibold mb-2">Expense Categories</h3>
                    <div className="flex mb-4">
                        <input type="text" value={newExpenseCat} onChange={e => setNewExpenseCat(e.target.value)} placeholder="New expense category" className="flex-grow p-2 border rounded-l-lg" />
                        <button onClick={() => handleCategoryAdd('expense')} className="p-2 bg-primary text-white rounded-r-lg">Add</button>
                    </div>
                    <ul className="space-y-2">{settings.expenseCategories.map(cat => <li key={cat} className="flex justify-between items-center p-2 bg-gray-50 rounded-md"><span>{cat}</span><button onClick={() => handleCategoryDelete('expense', cat)} className="text-red-500"><TrashIcon className="w-5 h-5"/></button></li>)}</ul>
                </div>
            </div>
        </Card>
        
        <Card title="Data Management">
            <div className="flex items-center space-x-4">
                <button onClick={handleBackup} className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700">Backup Data</button>
                <div>
                    <label htmlFor="restore-file" className="cursor-pointer px-6 py-3 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600">Restore Data</label>
                    <input id="restore-file" type="file" accept=".json" onChange={handleRestore} className="hidden" />
                </div>
            </div>
        </Card>
    </div>
  );
};

export default Settings;