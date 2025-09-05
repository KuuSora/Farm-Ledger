import { GoogleGenAI, Chat } from "@google/genai";

// The API key - for browser use, you can set this directly or use environment variables
// For development, you can temporarily set your API key here:
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 
                 (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '') || 
                 'your-api-key-here'; // Replace with your actual API key for testing

if (!API_KEY || API_KEY === 'your-api-key-here') {
  console.warn('Gemini API key not found. AI features will not work. Please set VITE_GEMINI_API_KEY in your environment or update the API_KEY variable in utils/gemini.ts');
}

const ai = API_KEY && API_KEY !== 'your-api-key-here' ? new GoogleGenAI({ apiKey: API_KEY }) : null;

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
  if (!ai) {
    throw new Error("Gemini API key not configured. Please set your API key to use AI features.");
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
    throw new Error("Failed to analyze image with the Gemini API.");
  }
};


export const generateText = async (prompt: string) => {
  if (!ai) {
    throw new Error("Gemini API key not configured. Please set your API key to use AI features.");
  }
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    throw new Error("Failed to generate text with the Gemini API.");
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

        if (lowerMessage.includes('how many crops')) {
            const count = data.crops?.length || 0;
            return `You have ${count} crop(s) recorded. 🌱`;
        }
        if (lowerMessage.includes('list') && lowerMessage.includes('crop')) {
            const crops = data.crops?.map((c: any) => c.name).join(', ');
            return crops ? `Here are your crops: ${crops}.` : "You haven't added any crops yet!";
        }
        if (lowerMessage.includes('list') && (lowerMessage.includes('todo') || lowerMessage.includes('task'))) {
            const todos = data.uncompletedTodos?.map((t: any) => t.task).join('\n- ');
            return todos ? `Here are your open tasks:\n- ${todos}` : "You have no open tasks. Great job! 👍";
        }
        if (lowerMessage.includes('income') && lowerMessage.includes('expense')) {
            const summary = data.financialSummary30Days;
            if (summary) {
                 return `In the last 30 days, your income was ${summary.income} and your expenses were ${summary.expenses}.`;
            }
            return "I don't have financial summary data right now.";
        }
        
        return "I'm currently offline and have limited capabilities. 😅 I can help with basic data from your app, like listing crops or todos. For more complex questions, I'll need an internet connection.";

    } catch (e) {
        return "I'm having trouble accessing my local memory while offline. Please try again when you're connected to the internet.";
    }
};


export const generateChatResponse = async (message: string, farmDataContext: string = '', formInputContext: string = '', isOnline: boolean) => {
    if (!isOnline || !ai) {
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
        throw new Error("Failed to get a response from the AI assistant.");
    }
};