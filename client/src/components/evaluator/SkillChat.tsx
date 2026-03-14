import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Code, FileText, CheckCircle, Zap, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Evaluation } from "@shared/schema";

interface Message {
  id: string;
  role: "user" | "system";
  content: string;
  type?: "text" | "analysis" | "error";
  data?: any;
}

interface SkillChatProps {
  evaluation: Evaluation;
}

export default function SkillChat({ evaluation }: SkillChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "Hello! I'm the Evaluation Assistant. Describe your use case and I'll analyze if this skill fits your needs, provide detailed feedback, and generate a refined, safe, and optimized version of the code.",
      type: "text"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<{role: "user" | "assistant", content: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      type: "text"
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    const newHistory = [...conversationHistory, { role: "user" as const, content: userText }];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: userText,
          skillCode: evaluation.skillCode || "",
          evaluationSummary: evaluation.summary,
          conversationHistory: newHistory,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "system",
          content: data.message || "Something went wrong. Please check your AI provider configuration in Settings.",
          type: "error"
        };
        setMessages(prev => [...prev, errorMsg]);
      } else {
        const isConversational = data.isConversational || (!data.fit && !data.report && !data.refinedCode);
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: "system",
          content: data.feedback || data.message || "Analysis complete.",
          type: isConversational ? "text" : "analysis",
          data: isConversational ? undefined : {
            fit: data.fit || "Unknown",
            feedback: data.feedback || "",
            report: data.report || "",
            code: data.refinedCode || null,
          }
        };
        setMessages(prev => [...prev, aiResponse]);
        const assistantContent = isConversational
          ? (data.feedback || data.message || "")
          : JSON.stringify(data);
        setConversationHistory([...newHistory, { role: "assistant" as const, content: assistantContent }]);
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: "Failed to connect to the chat service. Please try again.",
        type: "error"
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] md:h-[600px] glass-panel rounded-2xl border-white/10 shadow-2xl overflow-hidden mt-4 md:mt-6">
      <div className="p-4 bg-black/40 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-primary" />
          <h3 className="font-mono font-bold">Evaluation Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-xs font-mono text-muted-foreground">Ready</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary/20 text-primary ml-3' : 'bg-white/10 text-foreground mr-3'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className="flex flex-col space-y-2">
                  {msg.type === 'text' && (
                    <div className={`p-4 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary/20 text-foreground rounded-tr-none' : 'bg-white/5 text-foreground rounded-tl-none border border-white/5'}`}>
                      {msg.content}
                    </div>
                  )}

                  {msg.type === 'error' && (
                    <div className="p-4 rounded-2xl text-sm bg-destructive/20 text-foreground rounded-tl-none border border-destructive/30 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <span>{msg.content}</span>
                    </div>
                  )}

                  {msg.type === 'analysis' && msg.data && (
                    <div className="bg-black/50 border border-primary/30 rounded-2xl overflow-hidden">
                      <div className="p-4 border-b border-white/5">
                        <p className="text-sm mb-4">{msg.data.feedback}</p>
                        <div className="flex gap-4 mb-4 flex-wrap">
                          <div className={`flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-lg border ${
                            msg.data.fit === 'Good' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            msg.data.fit === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            <CheckCircle className="w-3 h-3" />
                            <span>Fit: {msg.data.fit}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs font-mono bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/20">
                            <Zap className="w-3 h-3" />
                            <span>Optimized</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs font-mono bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-lg border border-purple-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Secured</span>
                          </div>
                        </div>
                      </div>
                      
                      {(msg.data.code || msg.data.report) && (
                        <div className="p-0">
                          <Tabs defaultValue={msg.data.code ? "code" : "report"} className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b border-white/5 bg-transparent p-0">
                              {msg.data.code && (
                                <TabsTrigger value="code" className="rounded-none data-[state=active]:bg-white/5 data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 py-3 font-mono text-xs">
                                  <Code className="w-3 h-3 mr-2" />
                                  Refined Code
                                </TabsTrigger>
                              )}
                              {msg.data.report && (
                                <TabsTrigger value="report" className="rounded-none data-[state=active]:bg-white/5 data-[state=active]:border-b-2 data-[state=active]:border-primary px-6 py-3 font-mono text-xs">
                                  <FileText className="w-3 h-3 mr-2" />
                                  Full Report
                                </TabsTrigger>
                              )}
                            </TabsList>
                            {msg.data.code && (
                              <TabsContent value="code" className="p-0 m-0 border-none outline-none">
                                <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto bg-[#0d0d12] max-h-[400px] overflow-y-auto">
                                  <code>{msg.data.code}</code>
                                </pre>
                              </TabsContent>
                            )}
                            {msg.data.report && (
                              <TabsContent value="report" className="p-6 m-0 border-none outline-none text-sm text-muted-foreground max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                                {msg.data.report}
                              </TabsContent>
                            )}
                          </Tabs>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex max-w-[85%] flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 text-foreground flex items-center justify-center mr-3">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 rounded-tl-none border border-white/5 flex space-x-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-black/40 border-t border-white/5">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your use case or ask a clarifying question..."
            className="flex-1 bg-black/50 border-white/10 focus-visible:ring-primary h-12 rounded-xl text-sm"
            data-testid="input-chat-message"
          />
          <Button 
            type="submit" 
            disabled={!inputValue.trim() || isTyping}
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center shrink-0"
            data-testid="button-send-chat"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
