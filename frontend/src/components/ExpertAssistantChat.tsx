import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

export default function ExpertAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your automation expert agent. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [height, setHeight] = useState(320);
  const [dragging, setDragging] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { role: 'user', content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);

    // Create initial assistant message with streaming
    const assistantMsgIndex = messages.length + 1;
    setMessages((msgs) => [...msgs, { role: 'assistant', content: '', streaming: true }]);
    setStreamingMessageId(assistantMsgIndex);

    try {
      // Simular streaming como ChatGPT
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      
      const data = await response.json();
      const fullResponse = data.response || data.error || 'Sin respuesta.';
      
      // Simular typing character por character
      let currentText = '';
      for (let i = 0; i < fullResponse.length; i++) {
        currentText += fullResponse[i];
        setMessages((msgs) => {
          const newMsgs = [...msgs];
          if (newMsgs[assistantMsgIndex]) {
            newMsgs[assistantMsgIndex] = {
              role: 'assistant',
              content: currentText,
              streaming: i < fullResponse.length - 1
            };
          }
          return newMsgs;
        });
        
        // Velocidad de typing
        await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
      }
    } catch {
      setMessages((msgs) => {
        const newMsgs = [...msgs];
        if (newMsgs[assistantMsgIndex]) {
          newMsgs[assistantMsgIndex] = {
            role: 'assistant',
            content: 'Connection error with the agent.',
            streaming: false
          };
        }
        return newMsgs;
      });
    }
    
    setLoading(false);
    setStreamingMessageId(null);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Drag to resize logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const parentRect = chatPanelRef.current?.parentElement?.getBoundingClientRect();
      if (!parentRect) return;
      // Calculate new height from mouse Y position relative to parent bottom
      const newHeight = Math.max(120, Math.min(600, parentRect.bottom - e.clientY));
      setHeight(newHeight);
    };
    const handleMouseUp = () => setDragging(false);
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return (
    <div
      ref={chatPanelRef}
      className="flex flex-col bg-white dark:bg-[#171717] w-full"
      style={{ height: collapsed ? '32px' : `${height}px` }}
    >
      {/* Drag Handle - SOLO esta parte debe hacer drag */}
      <div
        className="h-8 bg-gray-50 dark:bg-[#262626] border-b border-gray-200 dark:border-gray-600 cursor-ns-resize flex items-center px-4 relative group"
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
      >
        <div className="flex-1 h-2 flex items-center justify-center">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full group-hover:bg-gray-400 dark:group-hover:bg-gray-500 transition" />
        </div>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-0.5 rounded"
          onClick={(e) => {
            e.stopPropagation();
            setCollapsed((c) => !c);
          }}
          title={collapsed ? 'Expand chat' : 'Collapse chat'}
        >
          {collapsed ? '▲' : '▼'}
        </button>
      </div>
      {/* Chat content (hidden if collapsed) */}
      {!collapsed && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`text-sm p-2 rounded-lg max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-blue-100 dark:bg-blue-900/30 self-end text-right ml-auto' 
                    : 'bg-gray-100 dark:bg-gray-800 self-start'
                }`}
              >
                <div className="text-gray-900 dark:text-gray-100">
                  {msg.content}
                  {msg.streaming && (
                    <span className="inline-block w-2 h-4 bg-gray-500 dark:bg-gray-400 ml-1 animate-pulse">|</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form
            className="flex p-2 border-t border-gray-100 dark:border-gray-700"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-md text-sm"
              placeholder="Write your question or describe your workflow..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              {loading ? '...' : 'Enviar'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
