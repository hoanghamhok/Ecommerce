"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchChatbotAnswer } from "@/services/api";

type ChatMsg = {
  id: number;
  sender: "user" | "bot";
  text: string;
  typing?: boolean; // đang gõ từng chữ
};

const TYPE_DELAY_MS = 15; // tốc độ gõ (ms/char). Tăng số này để gõ chậm hơn.

export default function App() {
  return (
    <div className="relative w-0 h-0 bg-gray-100 flex items-center justify-center p-4 font-inter">
      <Chatbox />
    </div>
  );
}

function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 1, sender: "bot", text: "Hello! How can I help you today?" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const skipTypingRef = useRef(false); // cho phép skip hiệu ứng gõ

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  // sleep helper
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Hàm gõ dần dần vào message có id = targetId
  const typeIntoMessage = async (targetId: number, fullText: string) => {
    skipTypingRef.current = false;
    // bắt đầu với chuỗi rỗng
    for (let i = 1; i <= fullText.length; i++) {
      if (skipTypingRef.current) break;

      const chunk = fullText.slice(0, i);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === targetId ? { ...m, text: chunk } : m
        )
      );
      await sleep(TYPE_DELAY_MS);
    }
    // đảm bảo kết thúc với fullText + tắt trạng thái typing
    setMessages((prev) =>
      prev.map((m) =>
        m.id === targetId ? { ...m, text: fullText, typing: false } : m
      )
    );
    scrollToBottom();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const newText = inputValue.trim();
    if (newText === "" || isLoading) return;

    const newUserMessage: ChatMsg = {
      id: Date.now(),
      sender: "user",
      text: newText,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const botAnswer = await fetchChatbotAnswer(newText);

      // Tạo tin nhắn bot rỗng trước, bật typing
      const botId = Date.now() + 1;
      const botShell: ChatMsg = {
        id: botId,
        sender: "bot",
        text: "",
        typing: true,
      };
      setMessages((prev) => [...prev, botShell]);

      // Gõ từng chữ vào bubble bot
      await typeIntoMessage(botId, botAnswer);
    } catch (error) {
      console.error("Chatbot API error:", error);
      const errorMessage: ChatMsg = {
        id: Date.now() + 1,
        sender: "bot",
        text:
          "Sorry, I'm having trouble connecting right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Skip gõ: set cờ để vòng lặp dừng, fill full ngay
  const skipTyping = () => {
    skipTypingRef.current = true;
  };

  // Có đang có message nào typing không?
  const hasTyping = messages.some((m) => m.typing);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-inter">
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform duration-200 hover:scale-110"
          aria-label="Open chat"
        >
          <MessageSquare size={28} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 h-[60vh] bg-white rounded-xl shadow-2xl flex flex-col transition-all duration-300 ease-out">
          <header className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-xl">
            <h3 className="text-lg font-semibold">Chat with us</h3>
            <div className="flex items-center gap-2">
              {hasTyping && (
                <button
                  onClick={skipTyping}
                  className="px-2 py-1 text-xs rounded bg-white/20 hover:bg-white/30"
                >
                  Skip
                </button>
              )}
              <button
                onClick={toggleChat}
                className="p-1 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </header>

          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="flex flex-col space-y-3">
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}

              {isLoading && !hasTyping && (
                <div className="flex items-start gap-3 justify-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bot size={18} className="text-gray-600" />
                  </span>
                  <div className="max-w-[75%] p-3 rounded-2xl bg-gray-200 text-gray-800 rounded-bl-lg">
                    <p className="text-sm italic">Thinking…</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-4 border-t bg-white rounded-b-xl"
          >
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isLoading ? "Waiting for response..." : "Type your message..."
                }
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function MessageItem({ message }: { message: ChatMsg }) {
  const isUser = message.sender === "user";

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <Bot size={18} className="text-gray-600" />
        </span>
      )}

      <MarkdownBubble text={message.text} isUser={isUser} isTyping={!!message.typing} />

      {isUser && (
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={18} className="text-gray-600" />
        </span>
      )}
    </div>
  );
}

function MarkdownBubble({
  text,
  isUser,
  isTyping,
}: {
  text: string;
  isUser: boolean;
  isTyping: boolean;
}) {
  return (
    <div
      className={[
        "max-w-[75%] p-3 rounded-2xl whitespace-pre-wrap break-words",
        isUser
          ? "bg-blue-600 text-white rounded-br-lg"
          : "bg-gray-200 text-gray-800 rounded-bl-lg",
      ].join(" ")}
    >
      <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    // Headings: bớt margin và bỏ margin cuối
    h1: (p) => <h1 className="text-base font-semibold mb-1 last:mb-0" {...p} />,
    h2: (p) => <h2 className="text-base font-semibold mb-1 last:mb-0" {...p} />,
    h3: (p) => <h3 className="text-sm font-semibold mb-1 last:mb-0" {...p} />,

    // Paragraph: siết khoảng cách
    p:  (p) => <p className="text-sm leading-relaxed mb-1 last:mb-0" {...p} />,

    // UL/OL: giảm indent + xoá margin của <p> bên trong <li>
    ul: (p) => (
      <ul
        className="
          list-disc pl-4 mb-1 last:mb-0
          space-y-[2px]
          [&_li]:leading-relaxed
          [&_li>p]:m-0 [&_li>p]:mb-0
        "
        {...p}
      />
    ),
    ol: (p) => (
      <ol
        className="
          list-decimal pl-4 mb-1 last:mb-0
          space-y-[2px]
          [&_li]:leading-relaxed
          [&_li>p]:m-0 [&_li>p]:mb-0
        "
        {...p}
      />
    ),

    // LI để mặc định, spacing do UL/OL quản lý
    li: (p) => <li className="text-sm" {...p} />,

    strong: (p) => (
      <strong
        className={isUser ? "font-semibold" : "font-semibold text-gray-900"}
        {...p}
      />
    ),
    em: (p) => <em className="italic" {...p} />,
    blockquote: (p) => (
      <blockquote
        className="border-l-4 pl-3 text-sm italic opacity-90 mb-1 last:mb-0"
        {...p}
      />
    ),
    code: ({ children, className, ...p }) =>
      !className ? (
        <code className="px-1 py-0.5 rounded bg-black/10 text-xs" {...p}>
          {children}
        </code>
      ) : (
        <pre className="text-xs p-3 rounded bg-black/10 overflow-x-auto mb-1 last:mb-0">
          <code className={className} {...p}>{children}</code>
        </pre>
      ),
    a: (p) => (
      <a
        className="underline underline-offset-2"
        target="_blank"
        rel="noreferrer"
        {...p}
      />
    ),
    hr: (p) => <hr className="my-2 border-gray-300" {...p} />,
  }}
>
  {text || (isTyping ? " " : "")}
</ReactMarkdown>

      {isTyping && (
        <span className="inline-block align-baseline ml-1 w-[6px] h-[1em] bg-current animate-pulse" />
      )}
    </div>
  );
}
