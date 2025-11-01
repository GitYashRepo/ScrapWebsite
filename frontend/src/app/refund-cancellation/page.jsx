"use client";

import { Ban } from "lucide-react";


export default function RefundAndCancellation() {
   return (
      <div className="max-w-5xl mx-auto p-6 text-gray-800">
         <h1 className="text-3xl font-bold text-center mb-6">
            Refund & Cancellation Policy
         </h1>

         <section className="space-y-4">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
               <Ban className="text-red-600" /> Subscription Policy
            </h2>
            <p>
               Once you purchase a subscription on <strong>Kabaad Mandi</strong> via Razorpay,
               the payment is final and <strong>non-refundable</strong>. We do not offer any
               refunds or cancellations for activated subscriptions.
            </p>

            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
               <Ban className="text-red-600" /> Payment Issues
            </h2>
            <p>
               If you experience any payment failure or incorrect deduction, please contact
               our support team immediately with your transaction ID. We will coordinate
               with Razorpay to resolve the issue promptly.
            </p>

            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
               <Ban className="text-red-600" /> Service Continuity
            </h2>
            <p>
               Subscriptions remain active for their purchased duration. We do not provide
               partial refunds for unused periods or inactive accounts.
            </p>
         </section>
      </div>
   );
}
