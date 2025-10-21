"use client";

import { ShieldCheck, Zap, Recycle, Users } from "lucide-react";

export default function AboutUsPage() {
   return (
      <div className="max-w-5xl mx-auto p-6 text-gray-800">
         <h1 className="text-3xl font-bold text-center mb-6">About Kabaad Mandi</h1>

         <section className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-yellow-700 mb-2">
               Transforming Scrap into Value
            </h2>
            <p className="text-gray-600">
               At <strong>Kabaad Mandi</strong>, we are revolutionizing the way scrap materials
               are bought and sold. Our platform connects sellers and buyers across industries,
               creating a transparent, efficient, and secure marketplace for scrap trading.
               Whether you’re looking to buy, sell, or auction industrial scrap, we make it
               simple with secure payments and real-time bidding.
            </p>
         </section>

         <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
               <Zap className="text-yellow-600" /> Our Mission
            </h2>
            <p>
               Our mission is to build an efficient, transparent, and sustainable scrap trading
               ecosystem that benefits both sellers and buyers. Through technology, we aim to
               streamline the scrap supply chain, reduce waste, and promote responsible recycling.
            </p>
         </section>

         <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
               <ShieldCheck className="text-green-600" /> Why Choose Kabaad Mandi?
            </h2>
            <ul className="list-disc ml-6 space-y-1">
               <li>Transparent transactions — no hidden fees, fair and clear pricing.</li>
               <li>Efficient bidding system — get the best market price via auctions or direct offers.</li>
               <li>Secure payments — powered by Razorpay for seamless transactions.</li>
               <li>Wide network — verified buyers and sellers from multiple industries.</li>
               <li>Eco-friendly — promoting sustainability through responsible scrap management.</li>
            </ul>
         </section>

         <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
               <Recycle className="text-green-700" /> Our Vision
            </h2>
            <p>
               To become the leading digital scrap marketplace by helping businesses maximize
               the value of their waste materials while contributing to a circular economy.
            </p>
            <p className="mt-3 text-sm text-gray-500">
               ♻️ We believe in a future where every scrap material finds a new purpose instead
               of ending up in landfills.
            </p>
         </section>

         <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
               <Users className="text-blue-600" /> What We Do
            </h2>
            <p>
               Anyone can register as a <strong>Seller</strong> or <strong>Buyer</strong> on our website
               by paying a one-time subscription fee via Razorpay.
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
               <li><strong>Sellers</strong> can list their scrap for direct sale or create auctions where buyers bid.</li>
               <li><strong>Buyers</strong> can buy directly or participate in live auctions to get the best deals.</li>
            </ul>
         </section>
      </div>
   );
}
