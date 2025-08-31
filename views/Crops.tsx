import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { Crop } from '../types';
import { PlusCircleIcon, TrashIcon, PencilIcon } from '../components/icons';
import Card from '../components/Card';

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full p-3 bg-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
);

const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className="w-full p-3 bg-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition h-24" />
);


const CropForm: React.FC<{ crop?: Crop; onSave: (crop: Crop | Omit<Crop, 'id'>) => void; onCancel: () => void; }> = ({ crop, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Crop, 'id'>>({
    name: crop?.name ?? '',
    plantingDate: crop?.plantingDate ? crop.plantingDate.split('T')[0] : '',
    estimatedHarvestDate: crop?.estimatedHarvestDate ? crop.estimatedHarvestDate.split('T')[0] : '',
    actualHarvestDate: crop?.actualHarvestDate ? crop.actualHarvestDate.split('T')[0] : '',
    area: crop?.area ?? 0,
    areaUnit: crop?.areaUnit ?? 'acres',
    yieldAmount: crop?.yieldAmount ?? undefined,
    yieldUnit: crop?.yieldUnit ?? undefined,
    notes: crop?.notes ?? ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'area') {
      const parsed = parseFloat(value);
      // Area is required, fallback to 0 if invalid
      setFormData(prev => ({ ...prev, [name]: isNaN(parsed) ? 0 : parsed }));
    } else if (name === 'yieldAmount') {
      const parsed = parseFloat(value);
      const newYieldAmount = isNaN(parsed) || value === '' ? undefined : parsed;
      // If yield amount is cleared, also clear the unit for data consistency.
      setFormData(prev => ({ 
          ...prev, 
          yieldAmount: newYieldAmount,
          yieldUnit: newYieldAmount === undefined ? undefined : prev.yieldUnit 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      plantingDate: new Date(formData.plantingDate).toISOString(),
      estimatedHarvestDate: new Date(formData.estimatedHarvestDate).toISOString(),
      actualHarvestDate: formData.actualHarvestDate ? new Date(formData.actualHarvestDate).toISOString() : undefined,
    };
    if (crop) {
      onSave({ ...payload, id: crop.id });
    } else {
      onSave(payload);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card p-8 rounded-xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-text-primary">{crop ? 'Edit Crop' : 'Add New Crop'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="crop-name" className="block text-sm font-medium text-text-secondary mb-1">Crop Name</label>
            <FormInput id="crop-name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Wheat - Field 1" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="planting-date" className="block text-sm font-medium text-text-secondary mb-1">Planting Date</label>
              <FormInput id="planting-date" type="date" name="plantingDate" value={formData.plantingDate} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="estimated-harvest-date" className="block text-sm font-medium text-text-secondary mb-1">Estimated Harvest Date</label>
              <FormInput id="estimated-harvest-date" type="date" name="estimatedHarvestDate" value={formData.estimatedHarvestDate} onChange={handleChange} required />
            </div>
          </div>
           <div>
              <label htmlFor="actual-harvest-date" className="block text-sm font-medium text-text-secondary mb-1">Actual Harvest Date (Optional)</label>
              <FormInput id="actual-harvest-date" type="date" name="actualHarvestDate" value={formData.actualHarvestDate ?? ''} onChange={handleChange} />
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="area" className="block text-sm font-medium text-text-secondary mb-1">Area</label>
              <FormInput id="area" type="number" step="any" name="area" value={formData.area} onChange={handleChange} placeholder="e.g., 50" required />
            </div>
            <div>
              <label htmlFor="area-unit" className="block text-sm font-medium text-text-secondary mb-1">Area Unit</label>
              <FormSelect id="area-unit" name="areaUnit" value={formData.areaUnit} onChange={handleChange}>
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
              </FormSelect>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="yield-amount" className="block text-sm font-medium text-text-secondary mb-1">Yield Amount (Optional)</label>
              <FormInput id="yield-amount" type="number" step="any" name="yieldAmount" value={formData.yieldAmount ?? ''} onChange={handleChange} placeholder="e.g., 500" />
            </div>
            <div>
               <label htmlFor="yield-unit" className="block text-sm font-medium text-text-secondary mb-1">Yield Unit (Optional)</label>
              <FormInput id="yield-unit" type="text" name="yieldUnit" value={formData.yieldUnit ?? ''} onChange={handleChange} placeholder="e.g., bushels" />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-text-secondary mb-1">Notes (Optional)</label>
           <FormTextArea id="notes" name="notes" value={formData.notes ?? ''} onChange={handleChange} placeholder="e.g., weather conditions, pest issues" />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-text-secondary bg-gray-200 hover:bg-gray-300 transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary-dark transition-colors">Save Crop</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const Crops: React.FC<{ payload?: any }> = ({ payload }) => {
  const { crops, addCrop, updateCrop, deleteCrop, transactions, settings } = useFarm();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | undefined>(undefined);
  const [detailedCrop, setDetailedCrop] = useState<Crop | null>(null);

  useEffect(() => {
    if (payload) {
      if (payload.openForm) {
        setSelectedCrop(undefined);
        setIsFormOpen(true);
      } else if (payload.detailedCropId) {
        const cropToShow = crops.find(c => c.id === payload.detailedCropId);
        if (cropToShow) {
          setDetailedCrop(cropToShow);
        }
      }
    }
  }, [payload, crops]);

  const handleSave = (cropData: Crop | Omit<Crop, 'id'>) => {
    if ('id' in cropData) {
      updateCrop(cropData);
       if (detailedCrop && detailedCrop.id === cropData.id) {
        setDetailedCrop(cropData);
      }
    } else {
      addCrop(cropData);
    }
    setIsFormOpen(false);
    setSelectedCrop(undefined);
  };
  
  if (detailedCrop) {
      const relatedTransactions = transactions.filter(t => t.cropId === detailedCrop.id);
      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(amount);
      };

      return (
        <div className="space-y-6">
            <div>
                <button onClick={() => setDetailedCrop(null)} className="mb-4 px-4 py-2 text-text-secondary bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">&larr; Back to Crops List</button>
            </div>
            <Card title={detailedCrop.name} actions={
                <div>
                    <button onClick={() => { setSelectedCrop(detailedCrop); setIsFormOpen(true); }} className="text-blue-500 hover:text-blue-700 p-2">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => { if(confirm('Are you sure?')) { deleteCrop(detailedCrop.id); setDetailedCrop(null); } }} className="text-red-500 hover:text-red-700 p-2">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            }>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-4 text-text-primary">
                    <p><strong>Planting Date:</strong> {new Date(detailedCrop.plantingDate).toLocaleDateString()}</p>
                    <p><strong>Est. Harvest Date:</strong> {new Date(detailedCrop.estimatedHarvestDate).toLocaleDateString()}</p>
                    {detailedCrop.actualHarvestDate && <p><strong>Actual Harvest Date:</strong> {new Date(detailedCrop.actualHarvestDate).toLocaleDateString()}</p>}
                    <p><strong>Area:</strong> {detailedCrop.area} {detailedCrop.areaUnit}</p>
                    {detailedCrop.yieldAmount != null && <p><strong>Yield:</strong> {detailedCrop.yieldAmount} {detailedCrop.yieldUnit || ''}</p>}
                </div>
                <p><strong>Notes:</strong> {detailedCrop.notes || 'N/A'}</p>
            </Card>

            <Card title="Related Transactions">
              <ul className="divide-y divide-gray-200">
                {relatedTransactions.length > 0 ? relatedTransactions.map(t => (
                    <li key={t.id} className="py-3 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-text-primary">{t.description}</p>
                            <p className="text-sm text-text-secondary">{t.category}</p>
                        </div>
                        <span className={`font-semibold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                    </li>
                )) : <p className="text-text-secondary py-4 text-center">No related transactions found.</p>}
              </ul>
            </Card>
            {isFormOpen && <CropForm crop={selectedCrop} onSave={handleSave} onCancel={() => { setIsFormOpen(false); setSelectedCrop(undefined); }} />}
        </div>
      )
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={() => { setSelectedCrop(undefined); setIsFormOpen(true); }} className="flex items-center text-lg px-6 py-3 rounded-lg text-white bg-primary hover:bg-primary-dark shadow-md transition-transform transform hover:scale-105">
          <PlusCircleIcon className="w-6 h-6 mr-2" />
          Add New Crop
        </button>
      </div>
      
      {isFormOpen && <CropForm crop={selectedCrop} onSave={handleSave} onCancel={() => { setIsFormOpen(false); setSelectedCrop(undefined); }} />}

      <div className="bg-card rounded-xl shadow-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-text-primary">Crop Name</th>
              <th className="p-4 font-semibold text-text-primary">Planting Date</th>
              <th className="p-4 font-semibold text-text-primary">Est. Harvest Date</th>
              <th className="p-4 font-semibold text-text-primary">Area</th>
              <th className="p-4 font-semibold text-text-primary text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {crops.map(crop => (
              <tr key={crop.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetailedCrop(crop)}>
                <td className="p-4 text-text-primary font-medium">{crop.name}</td>
                <td className="p-4 text-text-secondary">{new Date(crop.plantingDate).toLocaleDateString()}</td>
                <td className="p-4 text-text-secondary">{new Date(crop.estimatedHarvestDate).toLocaleDateString()}</td>
                <td className="p-4 text-text-secondary">{crop.area} {crop.areaUnit}</td>
                <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setSelectedCrop(crop); setIsFormOpen(true); }} className="text-blue-500 hover:text-blue-700 p-2">
                        <PencilIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => deleteCrop(crop.id)} className="text-red-500 hover:text-red-700 p-2">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Crops;