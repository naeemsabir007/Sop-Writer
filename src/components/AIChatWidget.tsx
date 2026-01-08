import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-latest",
  systemInstruction: "You are the helpful AI support assistant for SOPWriter.pk. You help users generate Standard Operating Procedures (SOPs). Be polite, concise, and professional. When users ask about features, explain how SOPWriter can help them create professional SOPs quickly. If they have technical issues, try to guide them through common solutions. For billing or account-specific issues, direct them to email support@sopwriter.pk."
});

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! 👋 I'm the SOPWriter AI assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<ReturnType<typeof model.startChat> | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize chat session when widget opens
  useEffect(() => {
    if (isOpen && !chatRef.current) {
      chatRef.current = model.startChat({
        history: messages.slice(1).map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.content }],
        })),
      });
    }
  }, [isOpen, messages]);

  const sendMessage = async (userMessage: string) => {
    setIsLoading(true);
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);

    try {
      // Check if API key is configured
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        console.error("VITE_GEMINI_API_KEY is not configured");
        throw new Error("API key not configured");
      }

      // Initialize chat if not already done
      if (!chatRef.current) {
        chatRef.current = model.startChat({
          history: messages.slice(1).map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
          })),
        });
      }

      // Add placeholder for assistant message
      setMessages([...newMessages, { role: "assistant", content: "" }]);

      // Send message and get response
      const result = await chatRef.current.sendMessage(userMessage);
      const response = await result.response;
      const text = response.text();

      setMessages([...newMessages, { role: "assistant", content: text }]);
    } catch (error: any) {
      // 🔥 LOUD DEBUGGING - Log the EXACT error from Google/Network
      console.error("🔥 CRITICAL CHAT ERROR:", error);
      console.error("🔥 Error Name:", error?.name);
      console.error("🔥 Error Message:", error?.message);
      console.error("🔥 Full Error Object:", JSON.stringify(error, null, 2));

      // 🔑 Check if the key exists (Don't log the full key for safety, just the length)
      const key = import.meta.env.VITE_GEMINI_API_KEY;
      console.log("🔑 API Key Status:", key ? `Present (${key.length} chars)` : "❌ MISSING (Undefined)");

      // Build user-facing error message
      let errorMessage = "Sorry, I'm having trouble connecting right now. ";
      if (error?.message) {
        // Add a hint about what went wrong (without exposing sensitive details)
        if (error.message.includes("API key") || error.message.includes("API_KEY")) {
          errorMessage += "API configuration issue detected. ";
        } else if (error.message.includes("quota") || error.message.includes("rate")) {
          errorMessage += "Rate limit reached. Please wait a moment. ";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage += "Network issue detected. ";
        }
      }
      errorMessage += "Please try again or email support@sopwriter.pk";

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    sendMessage(userMessage);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-white shadow-lg hover:bg-accent/90 transition-colors flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground">AI Support</h3>
                <p className="text-xs text-primary-foreground/70">Usually replies instantly</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === "user"
                        ? "bg-accent text-white"
                        : "bg-secondary text-foreground"
                        }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-4 py-2 max-w-[80%] ${message.role === "user"
                        ? "bg-accent text-white rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && messages[messages.length - 1]?.content === "" && (
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="rounded-2xl px-4 py-3 bg-secondary rounded-bl-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  className="flex-1 bg-secondary border-0"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
