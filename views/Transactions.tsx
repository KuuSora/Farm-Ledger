import React, { useState, useMemo, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { Transaction, TransactionType } from '../types';
import { PlusCircleIcon, TrashIcon, PencilIcon } from '../components/icons';
import Card from '../components/Card';

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full p-3 bg-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
);


const TransactionForm: React.FC<{
  transaction?: Transaction;
  type: TransactionType;
  onSave: (transaction: Transaction | Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}> = ({ transaction, type, onSave, onCancel }) => {
  const { settings, crops, setFormInputContext, triggerUIInteraction } = useFarm();
  const [formData, setFormData] = useState({
    amount: transaction?.amount ?? '',
    date: transaction?.date ? transaction.date.split('T')[0] : new Date().toISOString().split('T')[0],
    description: transaction?.description ?? '',
    category: transaction?.category ?? '',
    cropId: transaction?.cropId ?? '',
  });
  const [error, setError] = useState('');

  const categories = type === TransactionType.INCOME ? settings.incomeCategories : settings.expenseCategories;

  useEffect(() => {
    setFormInputContext({ type: 'TransactionForm', transactionType: type, data: formData });
    // Cleanup on unmount
    return () => {
      setFormInputContext(null);
    };
  }, []);

  useEffect(() => {
    setFormInputContext({ type: 'TransactionForm', transactionType: type, data: formData });
  }, [formData, type, setFormInputContext]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'category' && value) {
        setError('');
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
        setError("Please select a category.");
        return;
    }
    const payload = {
      ...formData,
      type,
      amount: parseFloat(formData.amount.toString()),
      date: new Date(formData.date).toISOString(),
      cropId: formData.cropId ? formData.cropId : undefined,
    };
    if (transaction) {
      onSave({ ...payload, id: transaction.id });
    } else {
      onSave(payload);
    }
  };

  const clearHint = () => triggerUIInteraction(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-text-primary">{transaction ? 'Edit' : 'Add'} {type === TransactionType.INCOME ? 'Income' : 'Expense'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput type="number" step="any" name="amount" value={formData.amount} onChange={handleChange} placeholder="Amount" required 
            onFocus={() => triggerUIInteraction(`Enter the total ${type.toLowerCase()} amount.`)} onBlur={clearHint} />
          <FormInput type="date" name="date" value={formData.date} onChange={handleChange} required 
            onFocus={() => triggerUIInteraction('When did this transaction occur?')} onBlur={clearHint} />
          <FormInput type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Description" required 
            onFocus={() => triggerUIInteraction('Provide a brief description of the transaction.')} onBlur={clearHint} />
          <div>
            <FormSelect name="category" value={formData.category} onChange={handleChange} required className={`${error ? 'border-red-500' : ''}`}
              onFocus={() => triggerUIInteraction('Select the most appropriate category.')} onBlur={clearHint}>
              <option value="" disabled>{type === TransactionType.INCOME ? 'Select Source' : 'Select Category'}</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </FormSelect>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <FormSelect name="cropId" value={formData.cropId} onChange={handleChange}
            onFocus={() => triggerUIInteraction('You can link this transaction to a specific crop.')} onBlur={clearHint}>
            <option value="">Link to Crop (Optional)</option>
            {crops.map(crop => <option key={crop.id} value={crop.id}>{crop.name}</option>)}
          </FormSelect>
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-text-secondary bg-gray-200 hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary-dark transition-colors">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Transactions: React.FC<{ defaultTransactionType: TransactionType, payload?: any }> = ({ defaultTransactionType, payload }) => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, settings, crops, triggerUIInteraction } = useFarm();
  const [viewType, setViewType] = useState<TransactionType>(defaultTransactionType);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    cropId: '',
  });
  
  useEffect(() => {
    if (payload) {
      if (payload.openForm) {
        setSelectedTransaction(undefined);
        setIsFormOpen(true);
      } else if (payload.selectedTransactionId) {
        const txToShow = transactions.find(t => t.id === payload.selectedTransactionId);
        if (txToShow) {
          setSelectedTransaction(txToShow);
          setIsFormOpen(true);
        }
      }
    }
  }, [payload, transactions]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const clearFilters = () => {
    setFilters({ startDate: '', endDate: '', category: '', cropId: '' });
  };
  
  const handleViewTypeChange = (newType: TransactionType) => {
    setViewType(newType);
    clearFilters();
  };

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === viewType)
      .filter(t => {
          const transactionDate = new Date(t.date);

          const startDateMatch = !filters.startDate || transactionDate >= new Date(filters.startDate);
          const endDateMatch = !filters.endDate || transactionDate <= new Date(new Date(filters.endDate).setHours(23, 59, 59, 999));
          const categoryMatch = !filters.category || t.category === filters.category;
          const cropMatch = !filters.cropId || t.cropId === filters.cropId;

          return startDateMatch && endDateMatch && categoryMatch && cropMatch;
      })
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, viewType, filters]);

  const handleSave = (transactionData: Transaction | Omit<Transaction, 'id'>) => {
    if ('id' in transactionData) {
      updateTransaction(transactionData);
    } else {
      addTransaction(transactionData);
    }
    setIsFormOpen(false);
    setSelectedTransaction(undefined);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(amount);
  };
  
  const categoriesForFilter = viewType === TransactionType.INCOME ? settings.incomeCategories : settings.expenseCategories;
  const clearHint = () => triggerUIInteraction(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex space-x-1 p-1 bg-gray-200/80 rounded-lg">
          <button onClick={() => handleViewTypeChange(TransactionType.INCOME)} className={`px-4 py-2 text-lg rounded-md transition-colors ${viewType === TransactionType.INCOME ? 'bg-white shadow text-primary' : 'text-text-secondary hover:bg-white/50'}`}>Income</button>
          <button onClick={() => handleViewTypeChange(TransactionType.EXPENSE)} className={`px-4 py-2 text-lg rounded-md transition-colors ${viewType === TransactionType.EXPENSE ? 'bg-white shadow text-primary' : 'text-text-secondary hover:bg-white/50'}`}>Expenses</button>
        </div>
        <button 
          onClick={() => { setSelectedTransaction(undefined); setIsFormOpen(true); }} 
          className="flex items-center text-lg px-6 py-3 rounded-lg text-white bg-primary hover:bg-primary-dark shadow-md transition-transform transform hover:scale-105 w-full sm:w-auto"
          onMouseEnter={() => triggerUIInteraction("Click to open the form for a new transaction.")}
          onMouseLeave={clearHint}
        >
          <PlusCircleIcon className="w-6 h-6 mr-2" />
          Add New {viewType === TransactionType.INCOME ? 'Income' : 'Expense'}
        </button>
      </div>

      {isFormOpen && <TransactionForm transaction={selectedTransaction} type={viewType} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
      
      <Card title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-text-secondary">Start Date</label>
                <FormInput type="date" name="startDate" id="startDate" value={filters.startDate} onChange={handleFilterChange} />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-text-secondary">End Date</label>
                <FormInput type="date" name="endDate" id="endDate" value={filters.endDate} onChange={handleFilterChange} />
            </div>
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-text-secondary">{viewType === TransactionType.INCOME ? 'Source' : 'Category'}</label>
                <FormSelect name="category" id="category" value={filters.category} onChange={handleFilterChange}>
                    <option value="">All</option>
                    {categoriesForFilter.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </FormSelect>
            </div>
            <div>
                <label htmlFor="cropId" className="block text-sm font-medium text-text-secondary">Crop</label>
                <FormSelect name="cropId" id="cropId" value={filters.cropId} onChange={handleFilterChange}>
                    <option value="">All</option>
                    {crops.map(crop => <option key={crop.id} value={crop.id}>{crop.name}</option>)}
                </FormSelect>
            </div>
            <button onClick={clearFilters} className="px-4 py-3 bg-text-secondary text-white rounded-md hover:bg-text-primary transition-colors w-full lg:w-auto">Clear Filters</button>
        </div>
      </Card>
      
      <div className="bg-card rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-text-primary">Date</th>
                  <th className="p-4 font-semibold text-text-primary">Description</th>
                  <th className="p-4 font-semibold text-text-primary">{viewType === TransactionType.INCOME ? 'Source' : 'Category'}</th>
                  <th className="p-4 font-semibold text-text-primary">Linked Crop</th>
                  <th className="p-4 font-semibold text-text-primary text-right">Amount</th>
                  <th className="p-4 font-semibold text-text-primary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="p-4 text-text-secondary whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-4 text-text-primary font-medium">{tx.description}</td>
                    <td className="p-4 text-text-secondary">{tx.category}</td>
                    <td className="p-4 text-text-secondary">{crops.find(c => c.id === tx.cropId)?.name || 'N/A'}</td>
                    <td className={`p-4 text-right font-semibold ${viewType === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4 text-right">
                        <button onClick={() => { setSelectedTransaction(tx); setIsFormOpen(true); }} className="text-blue-500 hover:text-blue-700 p-2">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => deleteTransaction(tx.id)} className="text-red-500 hover:text-red-700 p-2">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-text-secondary">
                      No transactions match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
