import React, { useState, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { Transaction, Crop, TransactionType, Equipment } from '../types';
import { PrintIcon, DownloadIcon, PDFIcon } from '../components/icons';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';


const Summary: React.FC = () => {
  const { settings, transactions, crops, equipment, triggerUIInteraction } = useFarm();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTransactions = useMemo(() => {
    if (!startDate || !endDate) {
      return [];
    }
    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const start = new Date(startDate);
      const end = new Date(new Date(endDate).setHours(23, 59, 59, 999));
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transactions, startDate, endDate]);

  const { totalIncome, totalExpenses, netProfit, incomeTransactions, expenseTransactions } = useMemo(() => {
    const incomeTxns = filteredTransactions.filter(t => t.type === TransactionType.INCOME);
    const expenseTxns = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE);

    const income = incomeTxns.reduce((sum, t) => sum + t.amount, 0);
    const expenses = expenseTxns.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: income - expenses,
      incomeTransactions: incomeTxns.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      expenseTransactions: expenseTxns.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    };
  }, [filteredTransactions]);
  
  const clearHint = () => triggerUIInteraction(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsPDF = () => {
    const input = document.querySelector('.printable-content') as HTMLElement;
    if (!input) return;

    html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`farm_summary_${startDate}_to_${endDate}.pdf`);
    });
  };
  
  const handleSaveAsCSV = () => {
    const escapeCsvCell = (cellData: any): string => {
        const stringData = String(cellData ?? '');
        if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
            return `"${stringData.replace(/"/g, '""')}"`;
        }
        return stringData;
    };
    const toCsvRow = (items: (string | number | undefined)[]) => items.map(escapeCsvCell).join(',');

    let csvContent = "";
    
    csvContent += "Income Transactions\n";
    const incomeHeaders = ['Date', 'Description', 'Category', 'Linked Crop', 'Amount'];
    csvContent += toCsvRow(incomeHeaders) + '\n';
    incomeTransactions.forEach(tx => {
        const row = [formatDate(tx.date), tx.description, tx.category, crops.find(c => c.id === tx.cropId)?.name || '', tx.amount];
        csvContent += toCsvRow(row) + '\n';
    });
    csvContent += '\n';

    csvContent += "Expense Transactions\n";
    const expenseHeaders = ['Date', 'Description', 'Category', 'Linked Crop', 'Amount'];
    csvContent += toCsvRow(expenseHeaders) + '\n';
    expenseTransactions.forEach(tx => {
        const row = [formatDate(tx.date), tx.description, tx.category, crops.find(c => c.id === tx.cropId)?.name || '', tx.amount];
        csvContent += toCsvRow(row) + '\n';
    });
    csvContent += '\n';

    csvContent += "Crop Summary\n";
    const cropHeaders = ['Crop Name', 'Planting Date', 'Harvest Date', 'Area', 'Yield'];
    csvContent += toCsvRow(cropHeaders) + '\n';
    crops.forEach(crop => {
        const row = [
            crop.name,
            formatDate(crop.plantingDate),
            crop.actualHarvestDate ? formatDate(crop.actualHarvestDate) : `Est. ${formatDate(crop.estimatedHarvestDate)}`,
            `${crop.area} ${crop.areaUnit}`,
            crop.yieldAmount ? `${crop.yieldAmount} ${crop.yieldUnit || ''}` : 'Not Recorded'
        ];
        csvContent += toCsvRow(row) + '\n';
    });
    csvContent += '\n';

    csvContent += "Hydroponic Machinery Summary\n";
    const equipmentHeaders = ['Name', 'Model', 'Purchase Date', 'Maintenance Logs', 'Total Maintenance Cost'];
    csvContent += toCsvRow(equipmentHeaders) + '\n';
    equipment.forEach(item => {
        const totalCost = item.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
        const row = [
            item.name,
            item.model,
            formatDate(item.purchaseDate),
            item.maintenanceLogs.length,
            totalCost
        ];
        csvContent += toCsvRow(row) + '\n';
    });


    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `farm_summary_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
      <div className="no-print flex flex-wrap justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-text-primary">Generate Summary Report</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" onFocus={() => triggerUIInteraction("Select the start date for the report.")} onBlur={clearHint} />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" onFocus={() => triggerUIInteraction("Select the end date for the report.")} onBlur={clearHint} />
          </div>
          <div className="flex flex-wrap items-end gap-2 self-end">
            <button 
              onClick={handlePrint} 
              disabled={!startDate || !endDate} 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:bg-gray-400 flex items-center gap-2"
              onMouseEnter={() => triggerUIInteraction("Open the print dialog for this report.")}
              onMouseLeave={clearHint}
            >
              <PrintIcon className="w-5 h-5" />
              <span>Print</span>
            </button>
            <button 
              onClick={handleSaveAsCSV} 
              disabled={!startDate || !endDate} 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
              onMouseEnter={() => triggerUIInteraction("Download the report data as a CSV file.")}
              onMouseLeave={clearHint}
            >
                <DownloadIcon className="w-5 h-5" />
                <span>CSV</span>
            </button>
            <button 
              onClick={handleSaveAsPDF} 
              disabled={!startDate || !endDate} 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
              onMouseEnter={() => triggerUIInteraction("Download the report as a PDF file.")}
              onMouseLeave={clearHint}
            >
                <PDFIcon className="w-5 h-5" />
                <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Printable Area */}
      <div className="printable-content">
        <header className="text-center border-b-2 border-gray-300 pb-4 mb-8">
          <h1 className="text-3xl font-bold">{settings.farmName}</h1>
          <h2 className="text-xl text-text-secondary mt-2">Farm Ledger Summary</h2>
          {startDate && endDate && (
             <p className="text-lg mt-1">For the period of {formatDate(startDate)} to {formatDate(endDate)}</p>
          )}
        </header>

        {!startDate || !endDate ? (
          <div className="no-print text-center text-text-secondary py-16">
            <p className="text-lg">Please select a start and end date to generate the summary report.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <section>
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">Financial Overview</h3>
              <table className="w-full text-lg financial-summary-table">
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium text-text-secondary">Total Income:</td>
                    <td className="py-2 text-right font-semibold text-green-600">{formatCurrency(totalIncome)}</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-medium text-text-secondary">Total Expenses:</td>
                    <td className="py-2 text-right font-semibold text-red-600">{formatCurrency(totalExpenses)}</td>
                  </tr>
                  <tr className="border-t-2 border-black">
                    <td className="py-2 pr-4 font-bold text-text-primary">NET PROFIT / LOSS:</td>
                    <td className={`py-2 text-right font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>{formatCurrency(netProfit)}</td>
                  </tr>
                </tbody>
              </table>
            </section>
            
            <section>
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">Income Transactions</h3>
              <table className="w-full text-left text-sm printable-table">
                <thead>
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Linked Crop</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                   {incomeTransactions.length > 0 ? incomeTransactions.map(tx => (
                     <tr key={tx.id}>
                        <td className="p-2">{formatDate(tx.date)}</td>
                        <td className="p-2">{tx.description}</td>
                        <td className="p-2">{tx.category}</td>
                        <td className="p-2">{crops.find(c => c.id === tx.cropId)?.name || ''}</td>
                        <td className="p-2 text-right">{formatCurrency(tx.amount)}</td>
                     </tr>
                   )) : <tr><td colSpan={5} className="p-4 text-center text-text-secondary">No income transactions in this period.</td></tr>}
                </tbody>
              </table>
            </section>

            <section>
              <h3 className="text-xl font-semibold border-b pb-2 mb-4">Expense Transactions</h3>
              <table className="w-full text-left text-sm printable-table">
                <thead>
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Description</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Linked Crop</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                   {expenseTransactions.length > 0 ? expenseTransactions.map(tx => (
                     <tr key={tx.id}>
                        <td className="p-2">{formatDate(tx.date)}</td>
                        <td className="p-2">{tx.description}</td>
                        <td className="p-2">{tx.category}</td>
                        <td className="p-2">{crops.find(c => c.id === tx.cropId)?.name || ''}</td>
                        <td className="p-2 text-right">{formatCurrency(tx.amount)}</td>
                     </tr>
                   )) : <tr><td colSpan={5} className="p-4 text-center text-text-secondary">No expense transactions in this period.</td></tr>}
                </tbody>
              </table>
            </section>
            
            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Crop Summary</h3>
                <table className="w-full text-left text-sm printable-table">
                    <thead>
                        <tr>
                            <th className="p-2">Crop Name</th>
                            <th className="p-2">Planting Date</th>
                            <th className="p-2">Harvest Date</th>
                            <th className="p-2">Area</th>
                            <th className="p-2">Yield</th>
                        </tr>
                    </thead>
                    <tbody>
                        {crops.length > 0 ? crops.map(crop => (
                            <tr key={crop.id}>
                                <td className="p-2">{crop.name}</td>
                                <td className="p-2">{formatDate(crop.plantingDate)}</td>
                                <td className="p-2">{crop.actualHarvestDate ? formatDate(crop.actualHarvestDate) : `Est. ${formatDate(crop.estimatedHarvestDate)}`}</td>
                                <td className="p-2">{crop.area} {crop.areaUnit}</td>
                                <td className="p-2">{crop.yieldAmount ? `${crop.yieldAmount} ${crop.yieldUnit || ''}` : 'Not Recorded'}</td>
                            </tr>
                        )) : <tr><td colSpan={5} className="p-4 text-center text-text-secondary">No crops have been added.</td></tr>}
                    </tbody>
                </table>
            </section>

            <section>
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">Hydroponic Machinery Summary</h3>
                <table className="w-full text-left text-sm printable-table">
                    <thead>
                        <tr>
                            <th className="p-2">Name</th>
                            <th className="p-2">Model</th>
                            <th className="p-2">Purchase Date</th>
                            <th className="p-2"># Logs</th>
                            <th className="p-2 text-right">Total Maint. Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipment.length > 0 ? equipment.map(item => {
                            const totalCost = item.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
                            return (
                                <tr key={item.id}>
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2">{item.model || 'N/A'}</td>
                                    <td className="p-2">{formatDate(item.purchaseDate)}</td>
                                    <td className="p-2">{item.maintenanceLogs.length}</td>
                                    <td className="p-2 text-right">{formatCurrency(totalCost)}</td>
                                </tr>
                            );
                        }) : <tr><td colSpan={5} className="p-4 text-center text-text-secondary">No machinery has been added.</td></tr>}
                    </tbody>
                </table>
            </section>

          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;