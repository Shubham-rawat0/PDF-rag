"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Docs {
  pageContent?: string;
  metadata?: {
    loc?: {
      pageNumber?: number;
    };
    source?: string;
  };
}

interface IMessage {
  role: "assistant" | "user";
  content?: string;
  documents?: Docs[];
  timestamp: number;
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<IMessage[]>([]);
  const [loading,setLoading]=React.useState(false)

  const formatTime = (date: number | Date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });


  const handleSendChatmessage = async () => {
    try {
      if (!message.trim()) return;
  
      setMessages((prev) => [...prev, { role: "user", content: message,timestamp:Date.now() }]);
      setMessage("");
      setLoading(true)
      const response = await fetch(
        `http://localhost:8000/chat?message=${encodeURIComponent(message)}`
      );
      const data = await response.json();
      setLoading(false)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.message,
          documents: data?.docs,
          timestamp: Date.now(),
        },
      ]);
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  };

  return (
    <div className="h-screen flex flex-col text-black  bg-[#efeae2]">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 pb-24">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 shadow-sm ${
                msg.role === "user"
                  ? "bg-[#d9fdd3] rounded-l-lg rounded-tr-lg"
                  : "bg-white rounded-r-lg rounded-tl-lg"
              }`}
            >
              <div>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs flex justify-end mt-1 items-end-safe">
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-lg max-w-[60%] shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 w-full z-10 bg-[#efeae2] px-4 pb-3 pt-1 flex gap-4 border-t">
        <Input
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendChatmessage()}
          className="rounded-full w-150 border-2 border-t h-12 bg-white text-black"
        />
        <Button
          onClick={handleSendChatmessage}
          disabled={(!message.trim()) || loading}
          className="bg-green-600 h-12 hover:bg-green-700 rounded-full opacity-100 border-2 border-t px-6 disabled:bg-[#474d36]"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;

