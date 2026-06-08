import React, { useState, useRef, useEffect } from "react";
import api from "../services/api";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const WELCOME =
  "Hello! I'm your financial assistant. Ask me anything about your bills, payments, vendors, or users.";

const suggestionLabels = [
  "How much do we owe in total?",
  "Which bills are overdue?",
  "What's coming due this week?",
  "Top vendors by pending amount",
  "How many bills were paid this month?",
];

const AiAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: WELCOME },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMsg: Message = { role: "user", text: question.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.role !== "assistant" || m.text !== WELCOME)
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text }));

      const { data } = await api.post("/ai/ask", {
        question: question.trim(),
        history,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.data.answer },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: msg },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", text: WELCOME }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Financial Assistant</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Ask questions about your bills, payments, vendors, and more
          </p>
        </div>
        <button onClick={clearChat} className="btn-secondary text-sm">
          Clear chat
        </button>
      </div>

      <div className="card flex flex-col h-[calc(100vh-220px)]">
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-brand-600 text-white rounded-br-md"
                    : "bg-surface-hover text-slate-200 rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-hover text-slate-400 rounded-2xl rounded-bl-md px-4 py-2.5 text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          )}

          {messages.length === 1 && !loading && (
            <div className="flex flex-wrap gap-2 pt-2">
              {suggestionLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => send(label)}
                  className="text-xs px-3 py-1.5 rounded-full border border-surface-border text-slate-400 hover:text-white hover:border-brand-500/50 hover:bg-brand-500/10 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 p-4 border-t border-surface-border"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={loading}
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AiAssistantPage;
