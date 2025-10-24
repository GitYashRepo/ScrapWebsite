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
   // const sellerEmail = session?.user?.email;
   // const emailSentRef = useRef(sessionStorage.getItem("emailSentToBuyer") === "true");

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
         socket = io("https://scrapwebsite.onrender.com", {
            transports: ["websocket", "polling"],
            query: {
               userId: sellerId,
               userRole: "seller", // ✅ identify as seller
            },
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

      // ✅ Listen for buyer online/offline updates
      // socket.on("buyerStatus", async (isOnline) => {
      //    if (!isOnline && buyer?.email) {
      //       const sellerName = session?.user?.name || "A Seller";
      //       await sendOfflineEmailToBuyer(
      //          buyer.email,
      //          buyer.name,
      //          product?.name,
      //          sellerName,
      //          sellerEmail
      //       );
      //    }
      // });

      return () => {
         socket?.disconnect();
         socket = null;
         // sessionStorage.removeItem("emailSentToBuyer");
         // emailSentRef.current = false;
      };
   }, [buyer, product, sellerId]);

   // --- EmailJS details
   // const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
   // const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
   // const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

   // --- Send email to buyer when offline
   // const sendOfflineEmailToBuyer = async (buyerEmail, buyerName, productName, sellerName, sellerEmail) => {
   //    if (emailSentRef.current) {
   //       console.log("📨 Email already sent to buyer. Skipping...");
   //       return;
   //    }

   //    try {
   //       const customMessage = `Hello "${buyerName}", the seller "${sellerName}" has messaged you about the product "${productName}" on Kabaad Mandi. Please login to continue your conversation.\n\n- Kabaad Mandi Team`;

   //       const params = {
   //          to_email: buyerEmail,
   //          name: sellerName,
   //          reply_to: sellerEmail,
   //          message: customMessage,
   //       };

   //       await emailjs.send(serviceId, templateId, params, publicKey);

   //       emailSentRef.current = true;
   //       sessionStorage.setItem("emailSentToBuyer", "true");
   //       console.log("📧 Email notification sent to buyer!");
   //    } catch (error) {
   //       console.error("❌ Failed to send email notification to buyer:", error);
   //    }
   // };

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

      // ✅ Check if buyer is online before sending email
      // socket.emit("checkBuyerStatus", { buyerId: buyer._id }, async (isOnline) => {
      //    if (!isOnline && buyer?.email) {
      //       const sellerName = session?.user?.name || "A Seller";
      //       await sendOfflineEmailToBuyer(
      //          buyer.email,
      //          buyer.name,
      //          product?.name,
      //          sellerName,
      //          sellerEmail
      //       );
      //    }
      // });

      setText("");
   };

   if (status === "loading") return <div className="p-6 text-gray-500">Loading...</div>;

   return (
      <div className="pt-6 px-6 max-w-3xl mx-auto h-[80vh] flex flex-col border rounded-lg shadow-md my-4">
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
