"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function WhatsAppWidget({ brandName = "KabaadMandi", phone = '+918003316534' }) {
   const [open, setOpen] = React.useState(false)
   const [message, setMessage] = React.useState(
      `Hello ${brandName} Team, I’m interested in your scrap metal marketplace. Could you please share details on how to buy and sell materials on your platform. Thank you.`,
   )

   React.useEffect(() => {
      function onKey(e) {
         if (e.key === "Escape") setOpen(false)
      }
      window.addEventListener("keydown", onKey)
      return () => window.removeEventListener("keydown", onKey)
   }, [])

   function send() {
      const sanitizedPhone = String(phone).replace(/[^\d]/g, "")
      const url = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`
      window.open(url, "_blank", "noopener,noreferrer")
   }

   return (
      <>
         {/* Floating button */}
         <button
            type="button"
            aria-label="Open WhatsApp chat"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={cn(
               "fixed z-50 bottom-16 sm:bottom-26 right-1 size-14 rounded-full",
               "flex items-center justify-center cursor-pointer",
            )}
         >
            <img src="/Logo/whatsapp-96.png" alt="whatsapp" />
         </button>

         {/* Panel */}
         {/* Panel */}
         {open && (
            <section
               role="dialog"
               aria-modal="true"
               aria-label="WhatsApp styled chat"
               className={cn(
                  "fixed z-50 right-2 sm:right-8 bottom-32 sm:bottom-16",
                  "w-[320px] sm:w-[360px] h-[60vh] sm:h-[80vh]",
                  "rounded-xl shadow-2xl border border-black/5 overflow-hidden flex flex-col",
                  "bg-[#f6f7f5]"
               )}
            >
               {/* Header */}
               <header className="bg-[#075e54] text-white px-4 py-3 flex items-center gap-3 shrink-0">
                  <div className="size-8 rounded-full bg-white/15 grid place-items-center text-white font-semibold">
                     <span className="sr-only">{brandName} avatar</span>
                     <span aria-hidden="true">{brandName.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                     <p className="text-sm font-semibold leading-tight">{brandName}</p>
                     <p className="text-[11px] opacity-90 leading-tight">Usually replies in a few minutes</p>
                  </div>
                  <button
                     type="button"
                     aria-label="Close chat"
                     onClick={() => setOpen(false)}
                     className="p-1 rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                           fillRule="evenodd"
                           d="M10 8.586 4.293 2.879 2.879 4.293 8.586 10l-5.707 5.707 1.414 1.414L10 11.414l5.707 5.707 1.414-1.414L11.414 10l5.707-5.707-1.414-1.414L10 8.586Z"
                           clipRule="evenodd"
                        />
                     </svg>
                  </button>
               </header>

               {/* Scrollable Messages */}
               <div
                  className={cn("flex-1 overflow-y-auto p-4 space-y-2")}
                  style={{
                     backgroundColor: "#f6f7f5",
                     backgroundImage:
                        "radial-gradient(circle at 1px 1px, color-mix(in oklab, #667085 10%, transparent) 1px, transparent 1px)",
                     backgroundSize: "18px 18px",
                  }}
               >
                  <IncomingBubble>Namaste 🙏,{"\n"}Welcome to {brandName}</IncomingBubble>

                  <IncomingBubble>
                     <div className="space-y-3">
                        <p>Do you want to register as a Buyer?</p>
                        <Link
                           href="/signup"
                           className={cn(
                              "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
                              "border border-[#25d366] text-[#25d366] bg-white hover:bg-[#25d366]/5 transition-colors"
                           )}
                        >
                           Register as Buyer
                        </Link>
                     </div>
                  </IncomingBubble>

                  <IncomingBubble>
                     <div className="space-y-3">
                        <p>Do you want to register as a Seller?</p>
                        <Link
                           href="/signup"
                           className={cn(
                              "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
                              "border border-[#25d366] text-[#25d366] bg-white hover:bg-[#25d366]/5 transition-colors"
                           )}
                        >
                           Register as Seller
                        </Link>
                     </div>
                  </IncomingBubble>
               </div>

               {/* Sticky Footer */}
               <footer className="px-3 py-2 bg-[#f6f7f5] border-t border-black/5 shrink-0">
                  <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                     <input
                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-[#667085]"
                        placeholder="Type your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                           if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              send();
                           }
                        }}
                        aria-label="Message to send on WhatsApp"
                     />
                     <button
                        type="button"
                        className="size-9 rounded-full bg-[#25d366] text-white grid place-items-center"
                        aria-label="Send message"
                        title="Send"
                        onClick={send}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                     </button>
                  </div>
               </footer>
            </section>
         )}
      </>
   )
}

function IncomingBubble({ children }) {
   return (
      <div
         className={cn(
            "max-w-[85%] rounded-xl",
            "bg-white text-[#111827] shadow-sm",
            "px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
         )}
      >
         {children}
      </div>
   )
}
