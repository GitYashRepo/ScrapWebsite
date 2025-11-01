import { FileText } from "lucide-react";


export const metadata = {
   title: "Terms & Conditions | Kabaad Mandi",
   description:
      "Read the terms and conditions for using Kabaad Mandi. Understand our policies on user accounts, platform usage, payments, and liability.",
   keywords: [
      "terms and conditions",
      "Kabaad Mandi",
      "scrap marketplace",
      "buyer seller policy",
      "Razorpay payment terms",
   ],
   openGraph: {
      title: "Terms & Conditions | Kabaad Mandi",
      description:
         "Understand the rules and conditions for using Kabaad Mandi's scrap trading platform, including payment and refund policies.",
      url: "https://www.kabaadmandi.com/terms-and-conditions",
   },
};

export default function TermsAndConditions() {
   return (
      <div className="max-w-5xl mx-auto p-6 text-gray-800">
         <h1 className="text-3xl font-bold text-center mb-6">
            Terms & Conditions
         </h1>

         <div className="space-y-4">
            <p>
               Welcome to <strong>Kabaad Mandi</strong>. By accessing or using our website,
               you agree to comply with and be bound by the following terms and conditions.
               Please read them carefully before using our services.
            </p>

            <section>
               <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FileText className="text-yellow-600" /> User Accounts
               </h2>
               <p>
                  Users can register as a <strong>Buyer</strong> or <strong>Seller</strong> by paying
                  our subscription fee through Razorpay. Account details must be accurate and
                  up to date. Kabaad Mandi reserves the right to suspend accounts involved in
                  fraudulent or misleading activities.
               </p>
            </section>

            <section>
               <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FileText className="text-yellow-600" /> Usage of Platform
               </h2>
               <p>
                  Sellers may list scrap materials for sale or auction. Buyers may bid or buy
                  directly. All transactions must comply with local laws and ethical practices.
               </p>
            </section>

            <section>
               <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FileText className="text-yellow-600" /> Payments & Refunds
               </h2>
               <p>
                  Subscription payments are made via Razorpay. Once a subscription is purchased,
                  <strong> the amount is non-refundable</strong>. Please ensure you review your
                  plan before making payment.
               </p>
            </section>

            <section>
               <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <FileText className="text-yellow-600" /> Limitation of Liability
               </h2>
               <p>
                  Kabaad Mandi is a platform connecting buyers and sellers. We are not
                  responsible for the quality or delivery of materials traded between users.
               </p>
            </section>
         </div>
      </div>
   );
}
