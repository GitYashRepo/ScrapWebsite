"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import io from "socket.io-client";

let socket;

export default function SellerChatPage() {
   const { id: sessionId } = useParams();
   const { data: session, status } = useSession();
   const sellerId = session?.user?.id;

   const [buyer, setBuyer] = useState(null);
   const [product, setProduct] = useState(null);
   const [messages, setMessages] = useState([]);
   const [text, setText] = useState("");
   const [loading, setLoading] = useState(true);
   const messagesEndRef = useRef(null);

   useEffect(() => {
      if (!sessionId) return;

      const fetchSession = async () => {
         try {
            const res = await fetch(`/api/chat/session?sessionId=${sessionId}`);
            const data = await res.json();
            setBuyer(data.buyer);
            setProduct(data.product);
         } catch (err) {
            console.error("Failed to fetch session:", err);
         }
      };

      const fetchMessages = async () => {
         try {
            const res = await fetch("/api/chat/message", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ sessionId }),
            });
            const data = await res.json();
            setMessages(data.messages || []);
            setLoading(false);
         } catch (err) {
            console.error("Failed to load messages:", err);
            setLoading(false);
         }
      };

      fetchSession();
      fetchMessages();
   }, [sessionId]);

   useEffect(() => {
      if (!buyer?._id || !product?._id || !sellerId) return;

      if (!socket) {
         socket = io("http://localhost:4040", {
            transports: ["websocket", "polling"],
         });
      }

      const roomId = `${buyer._id}_${sellerId}_${product._id}`;
      socket.emit("joinRoom", roomId);

      socket.off("receiveMessage");
      socket.off("messageSaved");
      socket.off("errorMessage");

      socket.on("connect", () => console.log("Socket connected (seller):", socket.id));
      socket.on("joined", (d) => console.log("Joined room ack (seller):", d));

      socket.on("receiveMessage", (msg) => {
         setMessages((prev) => {
            // if already exists
            if (prev.some((m) => m._id === msg._id)) return prev;

            // if a temp message from same sender exists, replace it
            const tempIdx = prev.findIndex(
               (m) =>
                  m._id.startsWith("temp-") &&
                  m.sender === msg.sender &&
                  m.message === msg.message
            );

            if (tempIdx !== -1) {
               const newList = [...prev];
               newList[tempIdx] = msg;
               return newList;
            }

            // else just add
            return [...prev, msg];
         });
      });

      // ✅ FIXED messageSaved logic
      socket.on("messageSaved", ({ message: savedMsg }) => {
         setMessages((prev) => {
            if (!savedMsg) return prev;

            // Replace temp message from this sender
            const idx = prev.findIndex(
               (m) =>
                  m._id.startsWith("temp-") &&
                  m.message === savedMsg.message &&
                  m.sender === sellerId
            );

            if (idx !== -1) {
               const newList = [...prev];
               newList[idx] = savedMsg;
               return newList;
            }

            // Otherwise, add only if not already existing
            if (prev.find((m) => m._id === savedMsg._id)) return prev;
            return [...prev, savedMsg];
         });
      });

      socket.on("errorMessage", (d) => console.error("Socket errorMessage (seller):", d));

      return () => {
         socket?.disconnect();
         socket = null;
      };
   }, [buyer, product, sellerId]);

   const handleSend = () => {
      if (!text.trim() || !buyer?._id || !product?._id || !sellerId) return;

      const tempId = `temp-${Date.now()}`;
      const newMsg = {
         _id: tempId,
         sender: sellerId,
         senderModel: "Seller",
         message: text,
         createdAt: new Date().toISOString(),
         time: new Date().toLocaleTimeString(),
      };

      // Optimistic message
      setMessages((p) => [...p, newMsg]);

      // Send to server
      socket.emit("sendMessage", {
         buyerId: buyer._id,
         sellerId,
         productId: product._id,
         message: text,
         senderModel: "Seller",
         tempId,
      });

      setText("");
   };

   if (status === "loading") return <div className="p-6 text-gray-500">Loading...</div>;

   return (
      <div className="pt-6 px-6 max-w-3xl mx-auto h-[80vh] flex flex-col border rounded-lg shadow-md">
         <h2 className="text-lg font-semibold">
            💬 Chat with {buyer?.name || "Buyer"} about{" "}
            <span className="text-green-700">{product?.name || "Product"}</span>
         </h2>
         {product && <p className="text-sm text-gray-600">₹{product.pricePerKg}/kg</p>}
         <div className="flex-1 overflow-y-auto mt-4 p-4 space-y-3 bg-gray-50 rounded-lg">
            {loading ? (
               <div className="text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
               <div className="text-center text-gray-500">No messages yet</div>
            ) : (
               messages.map((msg, i) => (
                  <div
                     key={msg._id || i}
                     className={`flex ${msg.senderModel === "Seller" ? "justify-end" : "justify-start"
                        }`}
                  >
                     <div
                        className={`px-4 py-2 rounded-2xl max-w-xs ${msg.senderModel === "Seller"
                           ? "bg-green-300 text-black"
                           : "bg-gray-200 text-gray-800"
                           }`}
                     >
                        {msg.message}
                        <div className="text-xs text-gray-600 mt-1">
                           {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                        </div>
                     </div>
                  </div>
               ))
            )}
            <div ref={messagesEndRef} />
         </div>

         <div className="p-3 border-t flex gap-3 bg-white">
            <input
               type="text"
               className="flex-1 border rounded-lg px-3 py-2"
               placeholder="Type your message..."
               value={text}
               onChange={(e) => setText(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
               onClick={handleSend}
               className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
               Send
            </button>
         </div>
      </div>
   );
}
