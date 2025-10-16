"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import io from "socket.io-client";

let socket;

export default function BuyerChatPage() {
   const { id: productId } = useParams();
   const { data: session, status } = useSession();
   const buyerId = session?.user?.id;

   const [sellerId, setSellerId] = useState(null);
   const [product, setProduct] = useState(null);
   const [message, setMessage] = useState("");
   const [messages, setMessages] = useState([]);

   useEffect(() => {
      if (!productId) return;
      // Fetch product to get seller info
      const fetchProduct = async () => {
         try {
            const res = await fetch(`/api/product/${productId}`);
            const data = await res.json();
            setProduct(data);
            setSellerId(data?.seller?._id);
         } catch (error) {
            console.error("Error loading product for chat:", error);
         }
      };
      fetchProduct();
   }, [productId]);

   useEffect(() => {
      if (!buyerId || !sellerId || !productId) return;

      fetch("/api/socket"); // init socket endpoint
      socket = io({ path: "/api/socket" });

      const roomId = `${buyerId}_${sellerId}_${productId}`;
      socket.emit("joinRoom", roomId);

      socket.on("receiveMessage", (msg) => {
         setMessages((prev) => [...prev, msg]);
      });

      return () => socket.disconnect();
   }, [buyerId, sellerId, productId]);

   useEffect(() => {
      if (!productId) return;
      const fetchMessages = async () => {
         try {
            const res = await fetch("/api/chat/message", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ sessionId: `${buyerId}_${productId}` }),
            });
            const data = await res.json();
            setMessages(data.messages || []);
         } catch (err) {
            console.error("Failed to load messages:", err);
         }
      };
      fetchMessages();
   }, [productId, buyerId]);

   const handleSend = async () => {
      if (!message.trim()) return;
      try {
         const res = await fetch("/api/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               buyerId,
               sellerId,
               productId,
               text: message,
               senderModel: "Buyer",
            }),
         });
         const data = await res.json();
         if (data.message) setMessages((prev) => [...prev, data.message]);
         setMessage("");
      } catch (err) {
         console.error("Failed to send message:", err);
      }
   };

   if (status === "loading" || !product) {
      return <div className="p-6 text-gray-500">Loading chat...</div>;
   }

   return (
      <div className="p-6 max-w-3xl mx-auto h-[80vh] flex flex-col border rounded-lg shadow-md">
         <h1 className="text-xl font-bold mb-2">💬 Chat with {product?.seller?.ownerName}</h1>
         <p className="text-sm text-gray-500 mb-4">
            Product: <span className="font-medium">{product?.name}</span>
         </p>

         <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-lg mb-4">
            {messages.length === 0 ? (
               <p className="text-gray-500 text-center mt-10">No messages yet</p>
            ) : (
               messages.map((msg, i) => (
                  <div
                     key={i}
                     className={`mb-2 p-2 rounded-lg ${msg.senderId === buyerId
                        ? "bg-green-200 text-right ml-auto max-w-xs"
                        : "bg-gray-200 text-left mr-auto max-w-xs"
                        }`}
                  >
                     <p>{msg.text}</p>
                     <span className="block text-xs text-gray-500 mt-1">
                        {msg.time}
                     </span>
                  </div>
               ))
            )}
         </div>

         <div className="flex gap-2">
            <input
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Type your message..."
               className="flex-1 border rounded-lg p-2 focus:outline-none"
            />
            <button
               onClick={handleSend}
               className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700"
            >
               Send
            </button>
         </div>
      </div>
   );
}
