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
}

const ChatComponent: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const [messages, setMessages] = React.useState<IMessage[]>([]);

  const handleSendChatmessage = async () => {
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");

    const response = await fetch(
      `http://localhost:8000/chat?message=${encodeURIComponent(message)}`
    );
    const data = await response.json();

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data?.message, documents: data?.docs },
    ]);
  };

  return (
    <div className="h-screen flex flex-col bg-[#efeae2]">
      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 pb-24">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] px-4 py-2 text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-[#d9fdd3] rounded-l-lg rounded-tr-lg"
                  : "bg-white rounded-r-lg rounded-tl-lg"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input bar */}
      <div className="fixed bottom-5 px-3 py-2 flex gap-2 border-t">
        <Input
          placeholder="Type a message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendChatmessage()}
          className="rounded-full w-150 border-2 border-black"
        />
        <Button
          onClick={handleSendChatmessage}
          disabled={!message.trim()}
          className="bg-green-600 hover:bg-green-700 rounded-full border-2 border-gray px-6 disabled:bg-gray-400"
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;

