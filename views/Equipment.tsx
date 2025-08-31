
import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import { Equipment, MaintenanceLog } from '../types';
import { PlusCircleIcon, TrashIcon, PencilIcon, WrenchIcon, FarmAIIcon } from '../components/icons';
import Card from '../components/Card';
import { useGemini } from '../hooks/useGemini';
import { generateText } from '../utils/gemini';


// --- Reusable Form Components ---

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full p-3 bg-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
);

const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className="w-full p-3 bg-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition h-24" />
);

// --- Equipment Form ---

const EquipmentForm: React.FC<{ equipment?: Equipment; onSave: (data: Equipment | Omit<Equipment, 'id' | 'maintenanceLogs'>) => void; onCancel: () => void; }> = ({ equipment, onSave, onCancel }) => {
  const { triggerUIInteraction } = useFarm();
  const [formData, setFormData] = useState({
    name: equipment?.name ?? '',
    purchaseDate: equipment?.purchaseDate ? equipment.purchaseDate.split('T')[0] : '',
    model: equipment?.model ?? '',
    notes: equipment?.notes ?? ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, purchaseDate: new Date(formData.purchaseDate).toISOString() };
    if (equipment) {
      onSave({ ...equipment, ...payload });
    } else {
      onSave(payload);
    }
  };
  
  const clearHint = () => triggerUIInteraction(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card p-8 rounded-xl shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">{equipment ? 'Edit Machinery' : 'Add New Machinery'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput name="name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="e.g., Nutrient Dosing System" required onFocus={() => triggerUIInteraction("Enter the name of the machinery.")} onBlur={clearHint} />
            <FormInput name="model" value={formData.model} onChange={e => setFormData(p => ({...p, model: e.target.value}))} placeholder="Model (e.g., pH Pro Controller)" onFocus={() => triggerUIInteraction("Enter the model name or number.")} onBlur={clearHint} />
            <FormInput type="date" name="purchaseDate" value={formData.purchaseDate} onChange={e => setFormData(p => ({...p, purchaseDate: e.target.value}))} required onFocus={() => triggerUIInteraction("When was this machinery purchased?")} onBlur={clearHint} />
            <FormTextArea name="notes" value={formData.notes} onChange={e => setFormData(p => ({...p, notes: e.target.value}))} placeholder="Notes..." onFocus={() => triggerUIInteraction("Add any relevant notes.")} onBlur={clearHint} />
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-text-secondary bg-gray-200 hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary-dark">Save</button>
            </div>
        </form>
      </div>
    </div>
  );
};

// --- Maintenance Log Form ---

const MaintenanceLogForm: React.FC<{ onSave: (log: Omit<MaintenanceLog, 'id'>) => void; onCancel: () => void; }> = ({ onSave, onCancel }) => {
    const { triggerUIInteraction } = useFarm();
    const [logData, setLogData] = useState({ date: new Date().toISOString().split('T')[0], description: '', cost: '' });
    const clearHint = () => triggerUIInteraction(null);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...logData, date: new Date(logData.date).toISOString(), cost: parseFloat(logData.cost) || 0 });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-card p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Add Maintenance Log</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormInput type="date" value={logData.date} onChange={e => setLogData(p => ({...p, date: e.target.value}))} required onFocus={() => triggerUIInteraction("When was the maintenance performed?")} onBlur={clearHint} />
                    <FormInput value={logData.description} onChange={e => setLogData(p => ({...p, description: e.target.value}))} placeholder="Description (e.g., Calibrate pH sensor)" required onFocus={() => triggerUIInteraction("Describe the service performed.")} onBlur={clearHint} />
                    <FormInput type="number" step="any" value={logData.cost} onChange={e => setLogData(p => ({...p, cost: e.target.value}))} placeholder="Cost" onFocus={() => triggerUIInteraction("Enter the total cost of the service.")} onBlur={clearHint} />
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg text-text-secondary bg-gray-200 hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg text-white bg-primary hover:bg-primary-dark">Save Log</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Main Equipment View ---

const EquipmentView: React.FC<{ payload?: any }> = ({ payload }) => {
    const { equipment, addEquipment, updateEquipment, deleteEquipment, addMaintenanceLog, deleteMaintenanceLog, settings, triggerUIInteraction } = useFarm();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLogFormOpen, setIsLogFormOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>(undefined);
    const [detailedEquipment, setDetailedEquipment] = useState<Equipment | null>(null);
    const { loading: aiLoading, error: aiError, data: aiData, execute: executePrediction, reset: resetPrediction } = useGemini<[string], string>();

    useEffect(() => {
        if (payload?.detailedEquipmentId) {
            setDetailedEquipment(equipment.find(e => e.id === payload.detailedEquipmentId) || null);
        }
    }, [payload, equipment]);

    const handleSave = (data: Equipment | Omit<Equipment, 'id' | 'maintenanceLogs'>) => {
        if ('id' in data) {
            updateEquipment(data);
            if(detailedEquipment?.id === data.id) setDetailedEquipment(data);
        } else {
            addEquipment(data);
        }
        setIsFormOpen(false);
        setSelectedEquipment(undefined);
    };

    const handleSaveLog = (log: Omit<MaintenanceLog, 'id'>) => {
        if (detailedEquipment) {
            addMaintenanceLog(detailedEquipment.id, log);
        }
        setIsLogFormOpen(false);
    };
    
    const handlePredictMaintenance = () => {
        if (!detailedEquipment) return;
        
        const logHistory = detailedEquipment.maintenanceLogs
            .map(log => `- Date: ${new Date(log.date).toLocaleDateString()}, Description: ${log.description}, Cost: ${settings.currency} ${log.cost}`)
            .join('\n');
            
        const prompt = `
            Based on the following maintenance history for a piece of hydroponic machinery (${detailedEquipment.name} - ${detailedEquipment.model}), predict the next likely maintenance needs.
            Consider common service intervals for things like pumps, sensors, and lighting systems.
            
            Maintenance History:
            ${logHistory || "No maintenance logged yet."}

            Provide a short, actionable prediction. For example: "The pH and EC sensors are likely due for recalibration within the next 30 days." or "Consider checking the water pump impeller for wear in the next 2-3 months."
        `;
        executePrediction(generateText, prompt);
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(amount);
    const clearHint = () => triggerUIInteraction(null);
    
    if (detailedEquipment) {
        return (
            <div className="space-y-6">
                <div><button onClick={() => setDetailedEquipment(null)} className="mb-4 px-4 py-2 text-text-secondary bg-gray-200 rounded-lg hover:bg-gray-300">&larr; Back to Machinery List</button></div>
                <Card title={detailedEquipment.name} actions={
                    <div>
                        <button onClick={() => { setSelectedEquipment(detailedEquipment); setIsFormOpen(true); }} className="text-blue-500 p-2"><PencilIcon className="w-5 h-5" /></button>
                        <button onClick={() => { if(confirm('Are you sure?')) { deleteEquipment(detailedEquipment.id); setDetailedEquipment(null); } }} className="text-red-500 p-2"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                }>
                    <p><strong>Model:</strong> {detailedEquipment.model || 'N/A'}</p>
                    <p><strong>Purchase Date:</strong> {new Date(detailedEquipment.purchaseDate).toLocaleDateString()}</p>
                    <p><strong>Notes:</strong> {detailedEquipment.notes || 'N/A'}</p>
                </Card>

                <Card title="Maintenance History" actions={
                    <button onClick={() => setIsLogFormOpen(true)} className="flex items-center text-sm px-3 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                        <PlusCircleIcon className="w-5 h-5 mr-1" /> Log Service
                    </button>
                }>
                    <ul className="divide-y divide-gray-200">
                        {detailedEquipment.maintenanceLogs.length > 0 ? detailedEquipment.maintenanceLogs.map(log => (
                            <li key={log.id} className="py-3 flex justify-between items-center group">
                                <div>
                                    <p className="font-medium">{log.description}</p>
                                    <p className="text-sm text-text-secondary">{new Date(log.date).toLocaleDateString()} - {formatCurrency(log.cost)}</p>
                                </div>
                                <button onClick={() => deleteMaintenanceLog(detailedEquipment.id, log.id)} className="text-red-500 opacity-0 group-hover:opacity-100"><TrashIcon className="w-5 h-5"/></button>
                            </li>
                        )) : <p className="text-text-secondary text-center py-4">No maintenance logged yet.</p>}
                    </ul>
                </Card>
                
                <Card title="AI Maintenance Advisor">
                    <div className="text-center">
                        <button 
                            onClick={handlePredictMaintenance} 
                            disabled={aiLoading || detailedEquipment.maintenanceLogs.length < 2} 
                            className="flex items-center mx-auto text-lg px-6 py-3 rounded-lg text-white bg-primary hover:bg-primary-dark shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                            onMouseEnter={() => triggerUIInteraction("Use AI to analyze the maintenance history and predict future needs.")}
                            onMouseLeave={clearHint}
                        >
                            <FarmAIIcon className="w-6 h-6 mr-2" />
                            {aiLoading ? 'Analyzing...' : 'Predict Next Maintenance'}
                        </button>
                         {detailedEquipment.maintenanceLogs.length < 2 && <p className="text-xs text-text-secondary mt-2">Needs at least 2 logs for prediction.</p>}
                    </div>
                    {aiLoading && <div className="text-center p-4">Loading...</div>}
                    {aiError && <p className="text-red-500 text-center p-4">Error: {aiError.message}</p>}
                    {aiData && <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center"><p className="font-semibold text-primary-dark">{aiData}</p></div>}
                </Card>

                {isFormOpen && <EquipmentForm equipment={selectedEquipment} onSave={handleSave} onCancel={() => { setIsFormOpen(false); setSelectedEquipment(undefined); }} />}
                {isLogFormOpen && <MaintenanceLogForm onSave={handleSaveLog} onCancel={() => setIsLogFormOpen(false)} />}
            </div>
        );
    }
    
    return (
        <div>
            <div className="flex justify-end mb-6">
                <button onClick={() => { setSelectedEquipment(undefined); setIsFormOpen(true); }} className="flex items-center text-lg px-6 py-3 rounded-lg text-white bg-primary hover:bg-primary-dark shadow-md" onMouseEnter={() => triggerUIInteraction("Add a new piece of machinery.")} onMouseLeave={clearHint}>
                    <PlusCircleIcon className="w-6 h-6 mr-2" /> Add Machinery
                </button>
            </div>

            {isFormOpen && <EquipmentForm equipment={selectedEquipment} onSave={handleSave} onCancel={() => { setIsFormOpen(false); setSelectedEquipment(undefined); }} />}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment.map(item => (
                    <div 
                        key={item.id} 
                        onClick={() => setDetailedEquipment(item)} 
                        className="bg-card rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
                        onMouseEnter={() => triggerUIInteraction(`View details for ${item.name}.`)}
                        onMouseLeave={clearHint}
                    >
                        <h3 className="text-xl font-bold text-text-primary mb-2">{item.name}</h3>
                        <p className="text-text-secondary">{item.model}</p>
                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center text-sm text-text-secondary">
                            <WrenchIcon className="w-5 h-5 mr-2" />
                            <span>{item.maintenanceLogs.length} maintenance logs</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EquipmentView;