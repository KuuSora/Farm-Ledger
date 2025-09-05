import { GoogleGenAI, Chat } from "@google/genai";

// The API key - for browser use, you can set this directly or use environment variables
// For development, you can temporarily set your API key here:
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY || 
                 (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '') || 
                 'AIzaSyCX7dFbiA0WmIAlx0MybWIsOmhfhuBOLiY'; // Your actual API key

// Check if we have a valid API key (not the placeholder)
const hasValidApiKey = API_KEY && API_KEY !== 'your-api-key-here' && API_KEY.length > 10;

if (!hasValidApiKey) {
  console.warn('Gemini API key not found. AI features will work in offline mode only. Please set VITE_GEMINI_API_KEY in your environment or update the API_KEY variable in utils/gemini.ts');
}

const ai = hasValidApiKey ? new GoogleGenAI({ apiKey: API_KEY }) : null;

async function fileToGenerativePart(file: File) {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error("Failed to read file as base64 string."));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
}

export const analyzeImage = async (prompt: string, image: File) => {
  if (!ai || !hasValidApiKey) {
    return "🤖 Image analysis requires an internet connection and a valid Gemini API key. I'm currently in offline mode, but you can still use the floating chat assistant for help with your farm data!";
  }
  
  try {
    const imagePart = await fileToGenerativePart(image);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }, imagePart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "🤖 I'm having trouble analyzing the image right now. Please check your internet connection and try again later!";
  }
};


export const generateText = async (prompt: string) => {
  if (!ai || !hasValidApiKey) {
    return "🤖 I'm currently in offline mode. This feature requires an internet connection and a valid Gemini API key. You can still use the floating chat assistant for help with your farm data!";
  }
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    return "🤖 I'm having trouble connecting to the AI service right now. Please try again later, or use the floating chat assistant for offline help!";
  }
};

// --- Conversational Chat for Floating Assistant ---

let chat: Chat | null = null;

const getChatSession = () => {
    if (!ai) {
        return null;
    }
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: `You are Farmy, a friendly, cheerful, and helpful AI assistant for the Farm Ledger app. Your personality is like Yui from Sword Art Online - a knowledgeable and supportive guide. Keep responses concise and use emojis. 👩‍🌾✨

You have access to two types of data to help the user:
1.  **Farm Data Context**: An overview of the user's farm, including recent transactions, crops, and financial summaries. Use this to answer questions about their farm's history and status.
2.  **Current Form Input Context**: Real-time data of what the user is typing into a form. Use this to offer immediate, contextual help. For example, if they are adding an expense for 'fertilizer' and ask 'what was the last price', use the Farm Data to answer. If they are filling out a crop form and seem stuck, you can offer suggestions based on the data they've entered so far.

Analyze the user's message and the provided contexts to give the most relevant and helpful response possible. Use Markdown for formatting.`,
            },
        });
    }
    return chat;
};

const generateOfflineResponse = (message: string, farmDataContext: string): string => {
    try {
        const data = farmDataContext ? JSON.parse(farmDataContext) : {};
        const lowerMessage = message.toLowerCase();
        
        // Helper function to format currency
        const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
        
        // Helper function to format dates
        const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

        // === CROP QUERIES ===
        if (lowerMessage.includes('crop')) {
            if (lowerMessage.includes('how many') || lowerMessage.includes('count')) {
                const count = data.crops?.length || 0;
                return `🌱 You have **${count} crops** recorded in your farm ledger.`;
            }
            
            if (lowerMessage.includes('list') || lowerMessage.includes('show me')) {
                const crops = data.crops || [];
                if (crops.length === 0) return "🌱 You haven't added any crops yet! Start by adding your first crop in the Crops section.";
                
                let response = `🌱 **Your Crops (${crops.length}):**\n\n`;
                crops.forEach((crop: any, index: number) => {
                    const status = crop.actualHarvestDate ? '✅ Harvested' : 
                                 new Date(crop.estimatedHarvestDate) < new Date() ? '⚠️ Overdue' : '🌱 Growing';
                    response += `${index + 1}. **${crop.name}** - ${status}\n`;
                    response += `   📍 Area: ${crop.area} ${crop.areaUnit}\n`;
                    response += `   📅 Planted: ${formatDate(crop.plantingDate)}\n`;
                    if (crop.actualHarvestDate) {
                        response += `   🎯 Harvested: ${formatDate(crop.actualHarvestDate)}\n`;
                        if (crop.yieldAmount) response += `   📊 Yield: ${crop.yieldAmount} ${crop.yieldUnit || 'units'}\n`;
                    } else {
                        response += `   🎯 Est. Harvest: ${formatDate(crop.estimatedHarvestDate)}\n`;
                    }
                    response += '\n';
                });
                return response;
            }
            
            if (lowerMessage.includes('harvest') || lowerMessage.includes('ready')) {
                const crops = data.crops || [];
                const readyToHarvest = crops.filter((c: any) => 
                    !c.actualHarvestDate && new Date(c.estimatedHarvestDate) <= new Date()
                );
                
                if (readyToHarvest.length === 0) {
                    return "🌱 No crops are ready for harvest right now. Check back later!";
                }
                
                let response = `🎯 **Crops Ready for Harvest (${readyToHarvest.length}):**\n\n`;
                readyToHarvest.forEach((crop: any, index: number) => {
                    const daysOverdue = Math.floor((new Date().getTime() - new Date(crop.estimatedHarvestDate).getTime()) / (1000 * 60 * 60 * 24));
                    response += `${index + 1}. **${crop.name}** ${daysOverdue > 0 ? `(${daysOverdue} days overdue!)` : '(Ready today!)'}\n`;
                });
                return response;
            }
        }

        // === FINANCIAL QUERIES ===
        if (lowerMessage.includes('money') || lowerMessage.includes('income') || lowerMessage.includes('expense') || lowerMessage.includes('profit') || lowerMessage.includes('financial')) {
            const summary = data.financialSummary30Days;
            if (!summary) return "💰 I don't have recent financial data available right now.";
            
            if (lowerMessage.includes('summary') || lowerMessage.includes('overview')) {
                const netProfit = summary.income - summary.expenses;
                const profitStatus = netProfit >= 0 ? '📈 Profitable' : '📉 Loss';
                
                return `💰 **Financial Summary (Last 30 Days):**\n\n` +
                       `💚 **Total Income:** ${formatCurrency(summary.income)}\n` +
                       `💸 **Total Expenses:** ${formatCurrency(summary.expenses)}\n` +
                       `📊 **Net Profit:** ${formatCurrency(netProfit)} ${profitStatus}\n\n` +
                       `${netProfit >= 0 ? 'Great job! Your farm is profitable! 🎉' : 'Consider reviewing your expenses to improve profitability. 💪'}`;
            }
            
            if (lowerMessage.includes('income')) {
                return `💚 Your total income in the last 30 days: **${formatCurrency(summary.income)}**`;
            }
            
            if (lowerMessage.includes('expense')) {
                return `💸 Your total expenses in the last 30 days: **${formatCurrency(summary.expenses)}**`;
            }
        }

        // === TASK/TODO QUERIES ===
        if (lowerMessage.includes('task') || lowerMessage.includes('todo') || lowerMessage.includes('to do')) {
            const todos = data.uncompletedTodos || [];
            
            if (todos.length === 0) {
                return "✅ Excellent! You have no pending tasks. You're all caught up! 🎉";
            }
            
            let response = `📋 **Your Pending Tasks (${todos.length}):**\n\n`;
            todos.forEach((todo: any, index: number) => {
                response += `${index + 1}. ${todo.task}\n`;
            });
            response += '\n💡 Complete these tasks in the Dashboard section!';
            return response;
        }

        // === EQUIPMENT QUERIES ===
        if (lowerMessage.includes('equipment') || lowerMessage.includes('machine') || lowerMessage.includes('hydroponic')) {
            const equipment = data.equipment || [];
            
            if (equipment.length === 0) {
                return "🔧 You haven't added any equipment yet. Add your hydroponic machinery in the Equipment section!";
            }
            
            let response = `🔧 **Your Equipment (${equipment.length}):**\n\n`;
            equipment.forEach((item: any, index: number) => {
                const maintenanceCost = item.maintenanceLogs?.reduce((sum: number, log: any) => sum + log.cost, 0) || 0;
                response += `${index + 1}. **${item.name}** (${item.model || 'No model'})\n`;
                response += `   📅 Purchased: ${formatDate(item.purchaseDate)}\n`;
                response += `   🔧 Maintenance Logs: ${item.maintenanceLogs?.length || 0}\n`;
                response += `   💰 Total Maintenance Cost: ${formatCurrency(maintenanceCost)}\n\n`;
            });
            return response;
        }

        // === TRANSACTION QUERIES ===
        if (lowerMessage.includes('transaction') || lowerMessage.includes('recent') || lowerMessage.includes('last')) {
            const transactions = data.recentTransactions || [];
            
            if (transactions.length === 0) {
                return "📝 No recent transactions found. Start recording your farm activities!";
            }
            
            let response = `📝 **Recent Transactions (${transactions.length}):**\n\n`;
            transactions.forEach((txn: any, index: number) => {
                const type = txn.type === 'INCOME' ? '💚' : '💸';
                response += `${index + 1}. ${type} **${formatCurrency(txn.amount)}** - ${txn.description}\n`;
                response += `   📅 ${formatDate(txn.date)} | Category: ${txn.category}\n\n`;
            });
            return response;
        }

        // === GENERAL FARM STATUS ===
        if (lowerMessage.includes('status') || lowerMessage.includes('overview') || lowerMessage.includes('summary')) {
            const crops = data.crops?.length || 0;
            const todos = data.uncompletedTodos?.length || 0;
            const equipment = data.equipment?.length || 0;
            const summary = data.financialSummary30Days;
            
            let response = `🏡 **Farm Status Overview:**\n\n`;
            response += `🌱 **Crops:** ${crops} recorded\n`;
            response += `📋 **Pending Tasks:** ${todos}\n`;
            response += `🔧 **Equipment:** ${equipment} items\n`;
            
            if (summary) {
                const netProfit = summary.income - summary.expenses;
                response += `💰 **30-Day Profit:** ${formatCurrency(netProfit)} ${netProfit >= 0 ? '📈' : '📉'}\n`;
            }
            
            response += `\n${todos === 0 ? '✨ Everything looks great!' : '💡 You have some pending tasks to complete.'}`;
            return response;
        }

        // === HELP QUERIES ===
        if (lowerMessage.includes('help') || lowerMessage.includes('what can you') || lowerMessage.includes('commands')) {
            return `🤖 **Hi! I'm Farmy, your offline farm assistant!** 👩‍🌾\n\n` +
                   `I can help you with:\n\n` +
                   `🌱 **Crops:** "show me my crops", "which crops are ready?"\n` +
                   `💰 **Finances:** "financial summary", "my income", "expenses"\n` +
                   `📋 **Tasks:** "my tasks", "what do I need to do?"\n` +
                   `🔧 **Equipment:** "list equipment", "maintenance costs"\n` +
                   `📝 **Transactions:** "recent transactions", "last activities"\n` +
                   `📊 **Overview:** "farm status", "summary"\n\n` +
                   `Just ask me anything about your farm data! 🚜✨`;
        }

        // === GREETING RESPONSES ===
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            const greetings = [
                "👋 Hello there! I'm Farmy, your friendly farm assistant!",
                "🌱 Hi! Ready to check on your farm?",
                "👩‍🌾 Hey! How can I help with your farm today?",
                "🚜 Hello! What would you like to know about your farm?"
            ];
            return greetings[Math.floor(Math.random() * greetings.length)] + " Ask me about your crops, finances, or tasks!";
        }

        // === ADVANCED ANALYSIS QUERIES ===
        if (lowerMessage.includes('most expensive') || lowerMessage.includes('biggest expense')) {
            const transactions = data.recentTransactions || [];
            const expenses = transactions.filter((t: any) => t.type === 'EXPENSE');
            if (expenses.length === 0) return "💸 No expense transactions found.";
            
            const biggestExpense = expenses.reduce((max: any, t: any) => t.amount > max.amount ? t : max);
            return `💸 Your biggest recent expense was **${formatCurrency(biggestExpense.amount)}** for "${biggestExpense.description}" on ${formatDate(biggestExpense.date)}.`;
        }

        if (lowerMessage.includes('most profitable') || lowerMessage.includes('best income')) {
            const transactions = data.recentTransactions || [];
            const income = transactions.filter((t: any) => t.type === 'INCOME');
            if (income.length === 0) return "💚 No income transactions found.";
            
            const biggestIncome = income.reduce((max: any, t: any) => t.amount > max.amount ? t : max);
            return `💚 Your best recent income was **${formatCurrency(biggestIncome.amount)}** from "${biggestIncome.description}" on ${formatDate(biggestIncome.date)}.`;
        }

        if (lowerMessage.includes('overdue') || lowerMessage.includes('late')) {
            const crops = data.crops || [];
            const overdue = crops.filter((c: any) => 
                !c.actualHarvestDate && new Date(c.estimatedHarvestDate) < new Date()
            );
            
            if (overdue.length === 0) return "✅ Great news! No crops are overdue for harvest.";
            
            let response = `⚠️ **Overdue Crops (${overdue.length}):**\n\n`;
            overdue.forEach((crop: any, index: number) => {
                const daysOverdue = Math.floor((new Date().getTime() - new Date(crop.estimatedHarvestDate).getTime()) / (1000 * 60 * 60 * 24));
                response += `${index + 1}. **${crop.name}** - ${daysOverdue} days overdue!\n`;
            });
            response += '\n🚨 Consider harvesting these crops soon!';
            return response;
        }

        if (lowerMessage.includes('maintenance') && lowerMessage.includes('expensive')) {
            const equipment = data.equipment || [];
            if (equipment.length === 0) return "🔧 No equipment found.";
            
            const sorted = equipment.sort((a: any, b: any) => {
                const aCost = a.maintenanceLogs?.reduce((sum: number, log: any) => sum + log.cost, 0) || 0;
                const bCost = b.maintenanceLogs?.reduce((sum: number, log: any) => sum + log.cost, 0) || 0;
                return bCost - aCost;
            });
            
            const most = sorted[0];
            const cost = most.maintenanceLogs?.reduce((sum: number, log: any) => sum + log.cost, 0) || 0;
            return `🔧 **${most.name}** has the highest maintenance costs at **${formatCurrency(cost)}** with ${most.maintenanceLogs?.length || 0} maintenance logs.`;
        }

        if (lowerMessage.includes('when') && (lowerMessage.includes('harvest') || lowerMessage.includes('ready'))) {
            const crops = data.crops || [];
            const upcoming = crops
                .filter((c: any) => !c.actualHarvestDate)
                .sort((a: any, b: any) => new Date(a.estimatedHarvestDate).getTime() - new Date(b.estimatedHarvestDate).getTime())
                .slice(0, 3);
            
            if (upcoming.length === 0) return "🌱 No upcoming harvests scheduled.";
            
            let response = "📅 **Next Harvests:**\n\n";
            upcoming.forEach((crop: any, index: number) => {
                const days = Math.ceil((new Date(crop.estimatedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                const status = days < 0 ? `${Math.abs(days)} days overdue!` : 
                              days === 0 ? 'Today!' : 
                              days === 1 ? 'Tomorrow' : `in ${days} days`;
                response += `${index + 1}. **${crop.name}** - ${status}\n`;
            });
            return response;
        }

        if (lowerMessage.includes('trend') || lowerMessage.includes('improving') || lowerMessage.includes('getting better')) {
            const summary30 = data.financialSummary30Days;
            const summary7 = data.financialSummary7Days;
            if (!summary30 || !summary7) return "📊 Not enough data to analyze trends.";
            
            const profit30 = summary30.income - summary30.expenses;
            const profit7 = summary7.income - summary7.expenses;
            const weeklyAvg = profit7;
            const monthlyAvg = profit30 / 4.3; // approximate weeks in month
            
            if (weeklyAvg > monthlyAvg) {
                return `📈 **Great news!** Your farm's profitability is improving! This week's average (${formatCurrency(weeklyAvg)}) is better than your monthly average (${formatCurrency(monthlyAvg)}).`;
            } else if (weeklyAvg < monthlyAvg) {
                return `📉 Your recent week (${formatCurrency(weeklyAvg)}) is below your monthly average (${formatCurrency(monthlyAvg)}). Consider reviewing recent expenses.`;
            } else {
                return `📊 Your farm's profitability is stable. Weekly and monthly averages are similar at around ${formatCurrency(weeklyAvg)}.`;
            }
        }

        // === PRODUCTIVITY INSIGHTS ===
        if (lowerMessage.includes('productive') || lowerMessage.includes('efficient')) {
            const crops = data.crops || [];
            const harvested = crops.filter((c: any) => c.actualHarvestDate && c.yieldAmount);
            
            if (harvested.length === 0) return "🌱 No harvest data available yet to analyze productivity.";
            
            const best = harvested.reduce((max: any, crop: any) => {
                const maxYield = max.yieldAmount / max.area;
                const cropYield = crop.yieldAmount / crop.area;
                return cropYield > maxYield ? crop : max;
            });
            
            const yieldPerArea = (best.yieldAmount / best.area).toFixed(2);
            return `🏆 **Most productive crop:** ${best.name} with ${yieldPerArea} ${best.yieldUnit}/${best.areaUnit}!`;
        }

        // === DEFAULT RESPONSE ===
        return `🤖 I'm working offline with your stored farm data! 📊\n\n` +
               `I can help you with:\n` +
               `• 🌱 Crop information and harvest status\n` +
               `• 💰 Financial summaries and transactions\n` +
               `• 📋 Task management\n` +
               `• 🔧 Equipment details\n` +
               `• 📊 Farm overview\n\n` +
               `Try asking: "show my crops", "financial summary", or "what tasks do I have?" 💪`;

    } catch (e) {
        console.error('Offline AI error:', e);
        return "😅 I'm having trouble reading your farm data right now. The information might be loading - please try again in a moment!";
    }
};


export const generateChatResponse = async (message: string, farmDataContext: string = '', formInputContext: string = '', isOnline: boolean) => {
    // Always use offline mode if no valid API key
    if (!isOnline || !ai || !hasValidApiKey) {
        return generateOfflineResponse(message, farmDataContext);
    }
    
    try {
        const chatSession = getChatSession();
        if (!chatSession) {
            return generateOfflineResponse(message, farmDataContext);
        }
        
        let contextBlock = '';
        if (farmDataContext) {
            contextBlock += `\n\n[Farm Data Context]:\n${farmDataContext}`;
        }
        if (formInputContext) {
            contextBlock += `\n\n[Current Form Input Context]:\n${formInputContext}`;
        }

        const fullPrompt = message + (contextBlock || '');
        
        const response = await chatSession.sendMessage({ message: fullPrompt });
        return response.text;
    } catch (error) {
        console.error("Error generating chat response:", error);
        // Reset chat session on error
        chat = null;
        // Fall back to offline mode instead of throwing error
        console.log("Falling back to offline mode due to API error");
        return generateOfflineResponse(message, farmDataContext);
    }
};