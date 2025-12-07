import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { createChatStream } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "Hey! I'm Vinyl, your virtual Karaoke DJ. Need a song suggestion or some artist trivia? Just ask!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    try {
      const stream = await createChatStream(userMsg.text, history);
      
      const botMsgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      for await (const chunk of stream) {
        // Safe cast to any to access text property without strict type import dependency
        const c = chunk as any;
        if (c.text) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === botMsgId 
                ? { ...msg, text: msg.text + c.text }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I'm having trouble hearing you over the music! Try again?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-full max-w-md mx-auto md:mx-0 md:h-[600px] md:rounded-2xl md:border md:shadow-2xl overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-fuchsia-600 rounded-full">
           <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
           <h3 className="font-bold text-white">DJ Vinyl</h3>
           <p className="text-xs text-green-400 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
           </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
             <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
               msg.role === 'user' ? 'bg-slate-700' : 'bg-fuchsia-600'
             }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-slate-300" /> : <Bot className="w-4 h-4 text-white" />}
             </div>
             <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
               msg.role === 'user' 
                 ? 'bg-slate-700 text-white rounded-tr-none' 
                 : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
             }`}>
                {msg.text}
             </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-fuchsia-600 flex items-center justify-center shrink-0">
               <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700">
               <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2">
           <input 
             type="text" 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Ask DJ Vinyl..."
             className="flex-1 bg-slate-900 text-white rounded-xl px-4 py-2 border border-slate-700 focus:outline-none focus:border-fuchsia-500 text-sm"
           />
           <button 
             onClick={handleSend}
             disabled={!input.trim() || isTyping}
             className="p-2 bg-fuchsia-600 rounded-xl text-white disabled:opacity-50 hover:bg-fuchsia-500"
           >
              <Send className="w-5 h-5" />
           </button>
        </div>
      </div>
    </div>
  );
};