"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import io from "socket.io-client";
import emailjs from "@emailjs/browser";

let socket;

export default function BuyerChatPage() {
   const { id: productId } = useParams();
   const { data: session, status } = useSession();
   const buyerId = session?.user?.id;
   const buyerEmail = session?.user?.email;

   const [sellerId, setSellerId] = useState(null);
   const [product, setProduct] = useState(null);
   const [sessionId, setSessionId] = useState(null);
   const [message, setMessage] = useState("");
   const [messages, setMessages] = useState([]);
   const [sellerEmail, setSellerEmail] = useState(null);
   const messagesRef = useRef(null);

   // --- Start Chat / Load session
   useEffect(() => {
      if (!productId || !buyerId) return;

      const startChat = async () => {
         try {
            const res = await fetch("/api/chat/start", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ productId, buyerId }),
            });
            const data = await res.json();

            if (data.sessionId) {
               setSessionId(data.sessionId);
               setProduct(data.product);
               setSellerId(data.seller._id);
               setSellerEmail(data.seller.email);
            } else {
               console.warn("startChat returned no sessionId", data);
            }
         } catch (err) {
            console.error("Error starting chat:", err);
         }
      };

      startChat();
   }, [productId, buyerId]);

   // --- Setup Socket
   useEffect(() => {
      if (!buyerId || !sellerId || !productId) return;

      if (!socket) {
         socket = io("http://localhost:4040", {
            transports: ["websocket", "polling"],
            query: {
               userId: buyerId,
               userRole: "buyer", // ✅ send identity to backend
            },
         });
      }

      const roomId = `${buyerId}_${sellerId}_${productId}`;
      socket.emit("joinRoom", roomId);

      socket.off("receiveMessage");
      socket.off("messageSaved");
      socket.off("errorMessage");

      socket.on("connect", () => console.log("Socket connected (buyer):", socket.id));
      socket.on("joined", (d) => console.log("Joined room ack (buyer):", d));

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

      socket.on("messageSaved", ({ message: savedMsg }) => {
         setMessages((prev) => {
            if (!savedMsg) return prev;

            // Replace temporary message
            const idx = prev.findIndex(
               (m) =>
                  m._id.startsWith("temp-") &&
                  m.message === savedMsg.message &&
                  m.sender === buyerId
            );

            if (idx !== -1) {
               const newList = [...prev];
               newList[idx] = savedMsg;
               return newList;
            }

            // Otherwise add new if not existing
            if (prev.find((m) => m._id === savedMsg._id)) return prev;
            return [...prev, savedMsg];
         });
      });

      socket.on("errorMessage", (d) => console.error("Socket errorMessage (buyer):", d));

      // ✅ Handle seller status event from server
      socket.on("sellerStatus", async (isOnline) => {
         if (!isOnline && sellerEmail) {
            const buyerName = session?.user?.name || "A Buyer"; // get actual name
            await sendOfflineEmail(sellerEmail, product?.seller?.ownerName, buyerName, buyerEmail);
         }
      });


      return () => {
         socket?.disconnect();
         socket = null;
      };
   }, [buyerId, sellerId, productId]);

   // --- Fetch existing messages
   useEffect(() => {
      if (!sessionId) return;
      const fetchMessages = async () => {
         try {
            const res = await fetch("/api/chat/message", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ sessionId }),
            });
            const data = await res.json();
            setMessages(data.messages || []);
         } catch (err) {
            console.error("Failed to load messages:", err);
         }
      };
      fetchMessages();
   }, [sessionId]);

   useEffect(() => {
      console.log("ENV TEST:", {
         service: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
         template: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
         key: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
      });
   }, []);


   // --- Send Email via EmailJS if seller is offline
   const sendOfflineEmail = async (sellerEmail, sellerName, buyerName, buyerEmail) => {
      try {
         const customMessage = `Hello "${sellerName}", a buyer "${buyerName}" has messaged you on Kabaad Mandi. Please login to have a conversation with them! \n\n - Kabaad Mandi Team`;
         const params = {
            to_email: sellerEmail, // matches "To Email" → {{to_email}}
            name: buyerName,       // matches {{name}}
            reply_to: buyerEmail,    // matches "Reply To" → {{email}}
            message: customMessage,      // matches {{message}}
         };

         await emailjs.send(
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
            params,
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
         );

         console.log("📧 Email notification sent to seller!");
      } catch (error) {
         console.error("❌ Failed to send email notification:", error);
      }
   };

   // --- Send message
   const handleSend = () => {
      if (!message.trim() || !buyerId || !sellerId || !productId) return;

      const tempId = `temp-${Date.now()}`;
      const newMsg = {
         _id: tempId,
         sender: buyerId,
         senderModel: "Buyer",
         message,
         createdAt: new Date().toISOString(),
         time: new Date().toLocaleTimeString(),
      };

      setMessages((p) => [...p, newMsg]);

      socket.emit("sendMessage", {
         buyerId,
         sellerId,
         productId,
         message,
         senderModel: "Buyer",
         tempId,
      });

      // ✅ Check if seller is online
      socket.emit("checkSellerStatus", { sellerId }, async (isOnline) => {
         if (!isOnline && sellerEmail) {
            const buyerName = session?.user?.name || "A Buyer";
            await sendOfflineEmail(sellerEmail, product?.seller?.ownerName, buyerName, buyerEmail);
         }
      });


      setMessage("");
   };

   if (status === "loading" || !product) {
      return <div className="p-6 text-gray-500">Loading chat...</div>;
   }

   return (
      <div className="p-6 max-w-3xl min-h-[80vh] mx-auto flex flex-col border rounded-lg shadow-md my-4">
         <h1 className="text-xl font-bold mb-2">💬 Chat with {product?.seller?.ownerName}</h1>
         <p className="text-sm text-gray-500 mb-4">
            Product: <span className="font-medium">{product?.name}</span>
         </p>

         <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-lg mb-4">
            {messages.length === 0 ? (
               <p className="text-gray-500 text-center mt-10">No messages yet</p>
            ) : (
               messages.map((msg, i) => {
                  const isBuyer =
                     String(msg.sender) === String(buyerId) ||
                     msg.senderModel === "Buyer";
                  return (
                     <div
                        key={msg._id || i}
                        className={`mb-2 p-2 rounded-lg ${isBuyer
                           ? "bg-green-200 text-right ml-auto max-w-xs"
                           : "bg-gray-200 text-left mr-auto max-w-xs"
                           }`}
                     >
                        <p>{msg.message}</p>
                        <span className="block text-xs text-gray-500 mt-1">
                           {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                        </span>
                     </div>
                  );
               })
            )}
            <div ref={messagesRef} />
         </div>

         <div className="flex gap-2">
            <input
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Type your message..."
               className="flex-1 border rounded-lg p-2 focus:outline-none"
               onKeyDown={(e) => e.key === "Enter" && handleSend()}
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
