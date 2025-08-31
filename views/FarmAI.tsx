import React, { useState, useMemo } from 'react';
import { useGemini } from '../hooks/useGemini';
import { generateText, analyzeImage } from '../utils/gemini';
import Card from '../components/Card';
import { useFarm } from '../context/FarmContext';

type AITool = 'pest-id' | 'market-trends' | 'yield-optimization' | 'crop-forecasting';

// --- UI Components & Icons ---

const PestIdIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75v-1.5m-3.375-3.375-1.06-1.06m6.84-1.06-1.06 1.06m-5.78 1.06L5.25 12m1.06-1.06L9 9.375" />
  </svg>
);

const MarketTrendsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519 2.25 2.25 0 012.186.635L21.75 18m-5.25-9l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const YieldOptimizationIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0-2.25l2.25 1.313M12 12.75l-2.25 1.313M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6" />
  </svg>
);

const YieldForecastingIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full p-3 bg-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition" />
);

const FormTextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className="w-full p-3 bg-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition h-24" />
);

const AILoader: React.FC = () => (
  <div className="flex justify-center items-center space-x-2 py-8">
    <div className="w-3 h-3 rounded-full bg-primary animate-pulse [animation-delay:-0.3s]"></div>
    <div className="w-3 h-3 rounded-full bg-primary animate-pulse [animation-delay:-0.15s]"></div>
    <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
  </div>
);

const ResultDisplay: React.FC<{ data: string | null; error: Error | null; loading: boolean; initialState: React.ReactNode }> = ({ data, error, loading, initialState }) => {
  if (loading) return <AILoader />;
  
  if (error) {
    return <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 w-full text-left"><strong>Error:</strong> {error.message}</div>;
  }
  
  if (!data && !error && !loading) {
      return <>{initialState}</>;
  }

  if (data) {
    const blocks: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        blocks.push(<ul key={`ul-${blocks.length}`} className="list-disc pl-6 space-y-2 mb-4">{currentList}</ul>);
        currentList = [];
      }
    };

    data.split('\n').forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('### ')) {
        flushList();
        blocks.push(<h4 key={index} className="text-lg font-semibold mt-4 text-primary-dark">{trimmedLine.substring(4)}</h4>);
      } else if (trimmedLine.startsWith('## ')) {
        flushList();
        blocks.push(<h3 key={index} className="text-xl font-bold mt-5 mb-2 text-primary-dark">{trimmedLine.substring(3)}</h3>);
      } else if (trimmedLine.startsWith('# ')) {
        flushList();
        blocks.push(<h2 key={index} className="text-2xl font-bold mt-6 mb-3 text-primary-dark">{trimmedLine.substring(2)}</h2>);
      } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
        currentList.push(<li key={index} className="pl-2">{trimmedLine.substring(2)}</li>);
      } else if (trimmedLine) {
        flushList();
        blocks.push(<p key={index} className="mb-3 leading-relaxed">{trimmedLine}</p>);
      }
    });

    flushList();

    return (
      <div className="mt-6 p-6 bg-primary/5 rounded-lg border border-primary/20 text-text-primary text-left w-full prose prose-p:text-text-primary prose-li:text-text-primary">
        {blocks}
      </div>
    );
  }
  return null;
};

const FarmAI: React.FC = () => {
  const { triggerUIInteraction } = useFarm();
  const [activeTool, setActiveTool] = useState<AITool>('pest-id');
  
  // State for Pest ID
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { loading: imageLoading, error: imageError, data: imageData, execute: executeImageAnalysis, reset: resetImageAnalysis } = useGemini<[string, File], string>();
  
  // State for simple text-based tools
  const [cropName, setCropName] = useState('');
  const { loading: textLoading, error: textError, data: textData, execute: executeTextGeneration, reset: resetTextGeneration } = useGemini<[string], string>();

  // State for Yield Forecasting
  const [forecastInputs, setForecastInputs] = useState({
    cropType: '',
    plantingDate: '',
    area: '',
    areaUnit: 'acres',
    historicalData: ''
  });
  
  const clearHint = () => triggerUIInteraction(null);

  const imagePreview = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      resetImageAnalysis();
    }
  };

  const handleAnalyzeImage = () => {
    if (!imageFile) return;
    const prompt = "Analyze this image of a plant and identify any potential pests or diseases. Format your response in Markdown. Use headings for sections. Include: 'Condition', 'Description', 'Symptoms', 'Organic Treatments', and 'Chemical Treatments'. If the plant is healthy, state that under 'Condition'.";
    executeImageAnalysis(analyzeImage, prompt, imageFile);
  };

  const handleTextQuery = () => {
    if (!cropName.trim()) return;
    let prompt = '';
    if (activeTool === 'market-trends') {
      prompt = `Provide a market trend analysis for ${cropName}. Format the response in Markdown. Use headings for sections. Include: 'Current Price Snapshot', 'Demand Outlook', 'Key Market Factors', and 'Future Outlook'.`;
    } else if (activeTool === 'yield-optimization') {
      prompt = `Provide actionable tips to optimize the yield for ${cropName}. Include advice on soil preparation, fertilization, irrigation, and pest control.`;
    }
    executeTextGeneration(generateText, prompt);
  };

  const handleForecastInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForecastInputs(prev => ({ ...prev, [name]: value }));
  };

  const handleYieldForecast = () => {
    const { cropType, plantingDate, area, areaUnit, historicalData } = forecastInputs;
    if (!cropType.trim() || !plantingDate || !area) return;

    const prompt = `As a farm advisor, provide a yield forecast for the following crop. Base your forecast on typical conditions and common farming practices for the region where this crop is commonly grown.
Provide the forecast in a clear format, including an estimated yield range (e.g., in bushels/acre or tonnes/hectare) and a breakdown of the key factors that could influence the final yield (e.g., weather, soil health, pest pressure).

Crop Details:
- Crop Type: ${cropType}
- Planting Date: ${plantingDate}
- Area: ${area} ${areaUnit}
- Historical Data / Notes: ${historicalData || 'None provided.'}
`;
    executeTextGeneration(generateText, prompt);
  };
  
  const handleToolChange = (tool: AITool) => {
    setActiveTool(tool);
    resetImageAnalysis();
    resetTextGeneration();
    setImageFile(null);
    setCropName('');
    setForecastInputs({
        cropType: '',
        plantingDate: '',
        area: '',
        areaUnit: 'acres',
        historicalData: ''
    });
  }
  
  const toolConfig = {
    'pest-id': { icon: PestIdIcon, label: 'Pest & Disease ID', hint: "Identify plant issues from a photo." },
    'market-trends': { icon: MarketTrendsIcon, label: 'Market Trends', hint: "Get AI analysis of crop market trends." },
    'yield-optimization': { icon: YieldOptimizationIcon, label: 'Yield Optimization', hint: "Get tips to improve crop yield." },
    'crop-forecasting': { icon: YieldForecastingIcon, label: 'Yield Forecasting', hint: "Predict crop yield with AI." },
  }

  const renderTool = () => {
    switch (activeTool) {
      case 'pest-id':
        return (
          <>
            <p className="text-text-secondary mb-6">Upload a plant photo to identify potential issues with AI vision.</p>
            <div className="flex flex-col items-center">
              <label htmlFor="image-upload" className="w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:bg-gray-100 hover:border-primary transition-colors group" onMouseEnter={() => triggerUIInteraction("Click here to upload an image of a plant.")} onMouseLeave={clearHint}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Crop preview" className="max-h-full max-w-full object-contain rounded-lg" />
                ) : (
                  <div className="text-center text-gray-400 group-hover:text-gray-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="mt-2 font-semibold">Drop image here or click to upload</p>
                    <p className="text-xs">PNG, JPG, or WEBP</p>
                  </div>
                )}
              </label>
              <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <button onClick={handleAnalyzeImage} disabled={!imageFile || imageLoading} className="mt-6 px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none" onMouseEnter={() => triggerUIInteraction("Send the image for AI analysis.")} onMouseLeave={clearHint}>
                {imageLoading ? 'Analyzing...' : 'Analyze Image'}
              </button>
            </div>
            <ResultDisplay 
                data={imageData} 
                error={imageError} 
                loading={imageLoading} 
                initialState={
                    <div className="text-center text-text-secondary mt-8">Your analysis results will appear here.</div>
                } 
            />
          </>
        );
      case 'market-trends':
      case 'yield-optimization':
        const isMarketTrends = activeTool === 'market-trends';
        return (
            <>
                <p className="text-text-secondary mb-6">
                    {isMarketTrends
                        ? "Enter a crop name for an AI-powered market trend analysis."
                        : "Enter a crop name to receive AI-driven advice for improving yield."
                    }
                </p>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <FormInput
                        type="text"
                        value={cropName}
                        onChange={(e) => setCropName(e.target.value)}
                        placeholder="e.g., Wheat, Corn, Soybeans"
                        onFocus={() => triggerUIInteraction("Enter the name of the crop you're interested in.")}
                        onBlur={clearHint}
                    />
                    <button onClick={handleTextQuery} disabled={!cropName.trim() || textLoading} className="w-full sm:w-auto px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none" onMouseEnter={() => triggerUIInteraction("Submit your query to the AI.")} onMouseLeave={clearHint}>
                        {textLoading ? 'Thinking...' : 'Get Insights'}
                    </button>
                </div>
                <ResultDisplay 
                    data={textData} 
                    error={textError} 
                    loading={textLoading} 
                    initialState={
                        <div className="text-center text-text-secondary mt-8">Your AI-generated insights will appear here.</div>
                    } 
                />
            </>
        );
      case 'crop-forecasting':
        const isFormIncomplete = !forecastInputs.cropType.trim() || !forecastInputs.plantingDate || !forecastInputs.area;
        return (
            <>
                <p className="text-text-secondary mb-6">
                    Input crop details to receive an AI-powered yield forecast.
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="cropType" className="block text-sm font-medium text-text-secondary mb-1">Crop Type</label>
                          <FormInput id="cropType" name="cropType" type="text" value={forecastInputs.cropType} onChange={handleForecastInputChange} placeholder="e.g., Corn" required onFocus={() => triggerUIInteraction("Enter the type of crop.")} onBlur={clearHint} />
                      </div>
                      <div>
                          <label htmlFor="plantingDate" className="block text-sm font-medium text-text-secondary mb-1">Planting Date</label>
                          <FormInput id="plantingDate" name="plantingDate" type="date" value={forecastInputs.plantingDate} onChange={handleForecastInputChange} required onFocus={() => triggerUIInteraction("When was the crop planted?")} onBlur={clearHint} />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-text-secondary mb-1">Area</label>
                        <FormInput id="area" name="area" type="number" value={forecastInputs.area} onChange={handleForecastInputChange} placeholder="e.g., 100" required onFocus={() => triggerUIInteraction("Enter the total planted area.")} onBlur={clearHint} />
                    </div>
                    <div>
                        <label htmlFor="areaUnit" className="block text-sm font-medium text-text-secondary mb-1">Area Unit</label>
                        <FormSelect id="areaUnit" name="areaUnit" value={forecastInputs.areaUnit} onChange={handleForecastInputChange} onFocus={() => triggerUIInteraction("Select the unit for the area.")} onBlur={clearHint}>
                            <option value="acres">Acres</option>
                            <option value="hectares">Hectares</option>
                        </FormSelect>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="historicalData" className="block text-sm font-medium text-text-secondary mb-1">Historical Yield / Notes (Optional)</label>
                    <FormTextArea id="historicalData" name="historicalData" value={forecastInputs.historicalData} onChange={handleForecastInputChange} placeholder="e.g., Last year's yield was 180 bu/acre. Soil is clay loam." onFocus={() => triggerUIInteraction("Provide any past data or notes for a more accurate forecast.")} onBlur={clearHint} />
                  </div>
                  <div className="flex justify-center pt-2">
                    <button onClick={handleYieldForecast} disabled={isFormIncomplete || textLoading} className="px-8 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark transition-all transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none" onMouseEnter={() => triggerUIInteraction("Submit the details to get an AI yield forecast.")} onMouseLeave={clearHint}>
                        {textLoading ? 'Forecasting...' : 'Get Forecast'}
                    </button>
                  </div>
                </div>
                <ResultDisplay 
                    data={textData} 
                    error={textError} 
                    loading={textLoading} 
                    initialState={
                        <div className="text-center text-text-secondary mt-8">Your yield forecast will appear here.</div>
                    } 
                />
            </>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <div className="flex flex-wrap justify-center gap-1 p-1 bg-gray-200/80 rounded-xl shadow-inner">
            {Object.entries(toolConfig).map(([toolKey, { icon: Icon, label, hint }]) => (
                <button 
                    key={toolKey}
                    onClick={() => handleToolChange(toolKey as AITool)} 
                    onMouseEnter={() => triggerUIInteraction(hint)}
                    onMouseLeave={clearHint}
                    className={`flex items-center gap-2 px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base font-semibold rounded-lg transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-primary ${
                        activeTool === toolKey 
                        ? 'bg-white text-primary shadow' 
                        : 'text-text-secondary hover:bg-white/60 hover:text-text-primary'
                    }`}
                >
                    <Icon className="w-5 h-5" />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
      </div>
      <Card title={toolConfig[activeTool].label}>
        {renderTool()}
      </Card>
    </div>
  );
};

export default FarmAI;