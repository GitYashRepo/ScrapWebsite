"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001");

export default function ChatPage({ searchParams }) {
  const { productId, buyerId } = searchParams;
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [product, setProduct] = useState(null);

  // 1️⃣ Start session
  useEffect(() => {
    const startChat = async () => {
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, buyerId }),
      });
      const data = await res.json();
      setSessionId(data.sessionId);
    };
    startChat();
  }, [productId, buyerId]);

  // 2️⃣ Join room when session ready
  useEffect(() => {
    if (!sessionId) return;
    socket.emit("joinRoom", sessionId);

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("newMessage");
  }, [sessionId]);

  // 3️⃣ Send message
  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("sendMessage", {
      sessionId,
      sender: buyerId,
      senderModel: "Buyer",
      message: input,
    });
    setInput("");
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4 mt-8">
      {product && (
        <div className="border-b pb-4 mb-4">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <p className="text-gray-500">{product.description}</p>
          <img src={product.images?.[0]} alt="" className="w-40 mt-2 rounded-lg" />
        </div>
      )}
      <div className="h-80 overflow-y-auto border p-3 rounded-lg mb-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-2 ${
              msg.senderModel === "Buyer" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block px-3 py-1 rounded-xl ${
                msg.senderModel === "Buyer"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {msg.message}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded-lg p-2"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
}
