import { Shield } from "lucide-react";


export const metadata = {
   title: "Privacy Policy | Kabaad Mandi",
   description:
      "Read Kabaad Mandi’s privacy policy to understand how we collect, use, and protect your personal information during scrap trading and subscription purchases.",
   keywords: [
      "privacy policy",
      "Kabaad Mandi privacy",
      "data protection",
      "scrap marketplace",
      "Razorpay security",
   ],
   openGraph: {
      title: "Privacy Policy | Kabaad Mandi",
      description:
         "Learn how Kabaad Mandi ensures your data privacy and secure transactions through trusted payment processing.",
      url: "https://www.kabaadmandi.com/privacy-policy",
   },
};

export default function PrivacyPolicy() {
   return (
      <div className="max-w-5xl mx-auto p-6 text-gray-800">
         <h1 className="text-3xl font-bold text-center mb-6">Privacy Policy</h1>

         <section className="space-y-4">
            <p>
               At <strong>Kabaad Mandi</strong>, we value your privacy. This policy explains
               how we collect, use, and protect your personal information.
            </p>

            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
               <Shield className="text-green-600" /> Information We Collect
            </h2>
            <p>
               We collect basic user data such as name, email, contact number, and payment
               information during registration and subscription purchases.
            </p>

            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
               <Shield className="text-green-600" /> How We Use Your Data
            </h2>
            <ul className="list-disc ml-6 space-y-1">
               <li>To verify your account and process your subscription payments.</li>
               <li>To improve our services and provide customer support.</li>
               <li>To send service-related updates and notifications.</li>
            </ul>

            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
               <Shield className="text-green-600" /> Data Security
            </h2>
            <p>
               Your payment details are processed securely through Razorpay. We do not store
               sensitive card or bank details on our servers.
            </p>

            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
               <Shield className="text-green-600" /> Third-Party Sharing
            </h2>
            <p>
               We do not sell or rent your personal data. Limited sharing occurs only with
               trusted service providers like Razorpay for payment processing.
            </p>
         </section>
      </div>
   );
}
