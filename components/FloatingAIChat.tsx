import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFarm } from '../context/FarmContext';
import { FarmAIIcon, CloseIcon, SendIcon } from './icons';
import { generateChatResponse } from '../utils/gemini';
import { TransactionType } from '../types';

interface Message {
  role: 'user' | 'model';
  text: string;
}

type Corner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

const FloatingAIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { crops, transactions, settings, todos, equipment, formInputContext, isOnline, uiInteractionEvent } = useFarm();
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const prevIsOnline = useRef(isOnline);
  
  // Draggable state
  const [position, setPosition] = useState({ x: window.innerWidth - 88, y: window.innerHeight - 88 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [corner, setCorner] = useState<Corner>('bottom-right');
  
  // --- Dragging Logic ---
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    const target = e.currentTarget as HTMLElement;
    setOffset({
      x: e.clientX - target.getBoundingClientRect().left,
      y: e.clientY - target.getBoundingClientRect().top
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragging) {
      e.preventDefault();
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      setPosition({ x: newX, y: newY });
    }
  }, [dragging, offset]);

  const handleMouseUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    
    const snapToCorner = () => {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;
        const midX = screenW / 2;
        const midY = screenH / 2;
        
        let newCorner: Corner;
        let newX: number, newY: number;

        const iconWidth = 64; 
        const iconHeight = 64;
        const margin = 24;

        if (position.y < midY) { // Top half
            if (position.x < midX) { // Top-left
                newCorner = 'top-left';
                newX = margin;
                newY = margin;
            } else { // Top-right
                newCorner = 'top-right';
                newX = screenW - iconWidth - margin;
                newY = margin;
            }
        } else { // Bottom half
            if (position.x < midX) { // Bottom-left
                newCorner = 'bottom-left';
                newX = margin;
                newY = screenH - iconHeight - margin;
            } else { // Bottom-right
                newCorner = 'bottom-right';
                newX = screenW - iconWidth - margin;
                newY = screenH - iconHeight - margin;
            }
        }
        setCorner(newCorner);
        setPosition({ x: newX, y: newY });
    };
    snapToCorner();

  }, [dragging, position]);
  
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);


  // --- Component Logic ---

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  
  useEffect(() => {
      if (messages.length === 0) {
          setMessages([{ role: 'model', text: `Hello! I'm Farmy, your friendly AI assistant. 👩‍🌾` }]);
      }
  }, []);
  
  useEffect(() => {
    if (prevIsOnline.current === false && isOnline === true) {
        setMessages(prev => [...prev, { role: 'model', text: "I'm back online! 👩‍💻 You can now ask me more complex questions. ✨" }]);
    }
    prevIsOnline.current = isOnline;
  }, [isOnline]);
  
  const createFarmDataContext = (): string => {
    // Calculate financial summaries for different periods
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    
    const recentTransactions = transactions.slice(0, 10);
    
    // Financial summary for last 30 days
    const financialSummary30Days = transactions
      .filter(t => new Date(t.date) > thirtyDaysAgo)
      .reduce((acc, t) => {
        if (t.type === TransactionType.INCOME) acc.income += t.amount;
        else acc.expenses += t.amount;
        return acc;
      }, { income: 0, expenses: 0 });
    
    // Financial summary for last 7 days
    const financialSummary7Days = transactions
      .filter(t => new Date(t.date) > sevenDaysAgo)
      .reduce((acc, t) => {
        if (t.type === TransactionType.INCOME) acc.income += t.amount;
        else acc.expenses += t.amount;
        return acc;
      }, { income: 0, expenses: 0 });

    // Crop status analysis
    const cropAnalysis = crops.map(crop => ({
      id: crop.id,
      name: crop.name,
      area: crop.area,
      areaUnit: crop.areaUnit,
      plantingDate: crop.plantingDate,
      estimatedHarvestDate: crop.estimatedHarvestDate,
      actualHarvestDate: crop.actualHarvestDate,
      yieldAmount: crop.yieldAmount,
      yieldUnit: crop.yieldUnit,
      status: crop.actualHarvestDate ? 'harvested' : 
              new Date(crop.estimatedHarvestDate) < new Date() ? 'overdue' : 'growing',
      daysToHarvest: crop.actualHarvestDate ? null : 
                    Math.ceil((new Date(crop.estimatedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));

    // Equipment with maintenance analysis
    const equipmentAnalysis = equipment.map(item => ({
      id: item.id,
      name: item.name,
      model: item.model,
      purchaseDate: item.purchaseDate,
      maintenanceLogsCount: item.maintenanceLogs.length,
      totalMaintenanceCost: item.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0),
      lastMaintenanceDate: item.maintenanceLogs.length > 0 ? 
        item.maintenanceLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date : null
    }));

    const summary = {
      settings: {
        farmName: settings.farmName,
        currency: settings.currency,
      },
      crops: cropAnalysis,
      equipment: equipmentAnalysis,
      uncompletedTodos: todos.filter(t => !t.completed),
      completedTodos: todos.filter(t => t.completed),
      recentTransactions: recentTransactions,
      financialSummary30Days,
      financialSummary7Days,
      farmStats: {
        totalCrops: crops.length,
        activeCrops: crops.filter(c => !c.actualHarvestDate).length,
        harvestedCrops: crops.filter(c => c.actualHarvestDate).length,
        cropsReadyToHarvest: crops.filter(c => !c.actualHarvestDate && new Date(c.estimatedHarvestDate) <= new Date()).length,
        totalEquipment: equipment.length,
        totalTasks: todos.length,
        pendingTasks: todos.filter(t => !t.completed).length,
        totalTransactions: transactions.length
      }
    };
    return JSON.stringify(summary, null, 2);
  };

  const createFormInputContext = (): string => {
    if (!formInputContext) return '';
    return JSON.stringify(formInputContext, null, 2);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    const newUserMessage: Message = { role: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const farmContext = createFarmDataContext();
      const formInput = createFormInputContext();
      const responseText = await generateChatResponse(userInput, farmContext, formInput, isOnline);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('An unknown error occurred.');
      setMessages(prev => [...prev, { role: 'model', text: `Oh no! I ran into trouble. 😟\nError: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, index, arr) => {
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
            return <li key={index} className="ml-4 list-disc">{line.replace(/(\* |- )/, '')}</li>;
        }
        if (line.match(/^\s*$/) && index !== arr.length -1) {
            return <br key={index} />;
        }
        return <p key={index}>{line}</p>;
    });
};

  const getChatPositionClasses = () => {
    switch(corner) {
      case 'bottom-right': return 'bottom-full right-0 mb-4 origin-bottom-right';
      case 'bottom-left': return 'bottom-full left-0 mb-4 origin-bottom-left';
      case 'top-right': return 'top-full right-0 mt-4 origin-top-right';
      case 'top-left': return 'top-full left-0 mt-4 origin-top-left';
    }
  };
  
  const getPopupPositionClasses = () => {
    switch(corner) {
      case 'bottom-right': return 'bottom-0 right-full mr-4 origin-right';
      case 'bottom-left': return 'bottom-0 left-full ml-4 origin-left';
      case 'top-right': return 'top-0 right-full mr-4 origin-right';
      case 'top-left': return 'top-0 left-full ml-4 origin-left';
    }
  }
  
  const getIndicatorPositionClasses = () => {
    switch(corner) {
        case 'bottom-right': return 'top-0 left-0';
        case 'bottom-left': return 'top-0 right-0';
        case 'top-right': return 'bottom-0 left-0';
        case 'top-left': return 'bottom-0 right-0';
        default: return 'top-0 left-0';
    }
  }

  const chatOpenStyles = "scale-100 opacity-100";
  const chatClosedStyles = "scale-95 opacity-0 pointer-events-none";

  return (
    <div
      className="fixed z-50 transition-all duration-300 ease-in-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: dragging ? 'none' : 'all 0.3s ease-in-out',
      }}
    >
      <div className="relative">
        <button
          onMouseDown={handleMouseDown}
          onClick={() => !dragging && setIsOpen(!isOpen)}
          className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-transform transform hover:scale-110 cursor-grab active:cursor-grabbing"
          aria-label="Open AI Assistant"
        >
          <FarmAIIcon className="w-8 h-8 pointer-events-none" />
        </button>
        
        <div
            title={isOnline ? 'Online' : 'Offline'}
            className={`absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none transition-colors ${getIndicatorPositionClasses()} ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
        ></div>

        {/* Popup Message */}
        <div className={`absolute w-max max-w-xs p-3 bg-card text-text-primary rounded-lg shadow-xl transition-all duration-300 ${getPopupPositionClasses()} ${uiInteractionEvent ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
          {uiInteractionEvent}
          <div className={`absolute w-3 h-3 bg-card transform rotate-45 ${
            corner.includes('right') ? 'right-[-6px]' : 'left-[-6px]'
          } ${
            corner.includes('top') ? 'top-4' : 'bottom-4'
          }`}></div>
        </div>

        {/* Chat Window */}
        <div className={`absolute w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-card rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out ${getChatPositionClasses()} ${isOpen ? chatOpenStyles : chatClosedStyles}`}>
            <div className="flex items-center justify-between p-4 border-b bg-primary/5 rounded-t-2xl">
              <div className="flex items-center">
                  <FarmAIIcon className="w-7 h-7 text-primary mr-2" />
                  <h3 className="text-lg font-bold text-text-primary">Farmy Assistant</h3>
                  <div className={`w-2.5 h-2.5 rounded-full ml-2 transition-colors ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} title={isOnline ? 'Online' : 'Offline'}></div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-text-secondary hover:text-text-primary">
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div ref={chatBodyRef} className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center self-start flex-shrink-0"><FarmAIIcon className="w-5 h-5 text-primary" /></div>}
                  <div className={`p-3 rounded-2xl max-w-[85%] prose prose-sm max-w-none ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 text-text-primary rounded-bl-none'}`}>
                    {renderMarkdown(msg.text)}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center self-start flex-shrink-0"><FarmAIIcon className="w-5 h-5 text-primary" /></div>
                  <div className="p-3 rounded-2xl bg-gray-100">
                    <div className="flex items-center space-x-1 py-1">
                      <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-text-secondary rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-white rounded-b-2xl">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 p-3 bg-background border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !userInput.trim()} className="p-3 bg-primary text-white rounded-lg disabled:bg-gray-400 transition-colors">
                  <SendIcon className="w-6 h-6"/>
                </button>
              </form>
            </div>
          </div>
        </div>
    </div>
  );
};

export default FloatingAIChat;
