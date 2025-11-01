"use client";

import Carousel from "@/components/carousel/carousel";
import { Recycle, Factory, Truck, Users, Star, ShieldCheck } from "lucide-react";


export default function Home() {
   const slides = [
      {
         content: (
            <figure className="relative w-[100vw] h-[80vh] flex items-center justify-center bg-black">
               <img
                  src="/Carousel/img1.jpg"
                  alt="Scrap recycling plant"
                  className="w-full h-full object-cover opacity-80"
               />
               <figcaption className="absolute inset-x-0 bottom-0 p-6">
                  <div className="rounded-lg bg-black/50 p-4 text-white">
                     <h3 className="text-2xl font-semibold">Transforming Scrap into Value</h3>
                     <p className="text-sm">
                        Empowering industries with a transparent marketplace for all scrap materials.
                     </p>
                  </div>
               </figcaption>
            </figure>
         ),
      },
      {
         content: (
            <figure className="relative w-[100vw] h-[80vh] flex items-center justify-center bg-black">
               <img
                  src="/Carousel/img2.jpg"
                  alt="Industrial scrap metal"
                  className="w-full h-full object-cover opacity-80"
               />
               <figcaption className="absolute inset-x-0 bottom-0 p-6">
                  <div className="rounded-lg bg-black/50 p-4 text-white">
                     <h3 className="text-2xl font-semibold">Buy, Sell & Bid on Scrap</h3>
                     <p className="text-sm">Connecting sellers and buyers through real-time bidding and direct sales.</p>
                  </div>
               </figcaption>
            </figure>
         ),
      },
      {
         content: (
            <figure className="relative w-[100vw] h-[80vh] flex items-center justify-center bg-black">
               <img
                  src="/Carousel/img3.jpg"
                  alt="Eco friendly recycling"
                  className="w-full h-full object-cover opacity-80"
               />
               <figcaption className="absolute inset-x-0 bottom-0 p-6">
                  <div className="rounded-lg bg-black/50 p-4 text-white">
                     <h3 className="text-2xl font-semibold">Building a Sustainable Future</h3>
                     <p className="text-sm">Reducing waste and promoting responsible recycling through technology.</p>
                  </div>
               </figcaption>
            </figure>
         ),
      },
   ];

   return (
      <main className="w-full text-gray-800">
         {/* Hero Carousel */}
         <section aria-label="Carousel demo" className="flex flex-col gap-4">
            <Carousel
               items={slides}
               intervalMs={4000}
               showIndicators
               loop
               className="shadow-sm"
               ariaLabel="Hero carousel"
            />
         </section>

         {/* About Section */}
         <section className="max-w-6xl mx-auto p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-yellow-700">Welcome to Kabaad Mandi</h2>
            <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
               <strong>Kabaad Mandi</strong> is a digital scrap trading platform designed to
               connect sellers and buyers across industries. From metal to plastic, e-waste to paper,
               our platform makes trading scrap simple, transparent, and efficient.
               Whether you are looking to sell industrial waste or buy recycled materials,
               Kabaad Mandi is your one-stop marketplace for all scrap types.
            </p>
         </section>

         {/* Scrap Types */}
         <section className="bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto p-6">
               <h2 className="text-2xl font-bold text-center mb-6">Types of Scrap We Deal In</h2>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                     <Recycle className="text-green-600 mb-3 w-10 h-10" />
                     <h3 className="font-semibold text-lg">Metal Scrap</h3>
                     <p className="text-sm text-gray-600">
                        Includes ferrous and non-ferrous metals such as steel, iron, copper,
                        brass, and aluminum.
                     </p>
                  </div>

                  <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                     <Factory className="text-blue-600 mb-3 w-10 h-10" />
                     <h3 className="font-semibold text-lg">Plastic Scrap</h3>
                     <p className="text-sm text-gray-600">
                        PET, HDPE, LDPE, and PVC plastic materials ready for recycling and reuse.
                     </p>
                  </div>

                  <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                     <Truck className="text-yellow-600 mb-3 w-10 h-10" />
                     <h3 className="font-semibold text-lg">E-Waste</h3>
                     <p className="text-sm text-gray-600">
                        Electronic scrap like wires, circuit boards, batteries, and computer hardware.
                     </p>
                  </div>

                  <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                     <ShieldCheck className="text-red-600 mb-3 w-10 h-10" />
                     <h3 className="font-semibold text-lg">Automotive Scrap</h3>
                     <p className="text-sm text-gray-600">
                        Car parts, tires, batteries, and other vehicle components for recycling.
                     </p>
                  </div>

                  <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                     <Users className="text-purple-600 mb-3 w-10 h-10" />
                     <h3 className="font-semibold text-lg">Paper & Cardboard</h3>
                     <p className="text-sm text-gray-600">
                        Office paper, packaging, and cardboard materials for reuse and recycling.
                     </p>
                  </div>

                  <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                     <Recycle className="text-teal-600 mb-3 w-10 h-10" />
                     <h3 className="font-semibold text-lg">Construction Scrap</h3>
                     <p className="text-sm text-gray-600">
                        Cement debris, metal rods, pipes, and building materials from demolition projects.
                     </p>
                  </div>
               </div>
            </div>
         </section>

         {/* About Platform */}
         <section className="max-w-6xl mx-auto p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Why Choose Kabaad Mandi?</h2>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
               Our goal is to simplify scrap trading with secure payments, easy auctions,
               and verified users. Anyone can register as a <strong>Seller</strong> or
               <strong> Buyer</strong> by purchasing a subscription via Razorpay.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
               <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-md transition">
                  <ShieldCheck className="text-green-700 w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-1">Secure Transactions</h3>
                  <p className="text-sm text-gray-600">
                     All payments are handled through Razorpay ensuring a trusted experience.
                  </p>
               </div>
               <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-md transition">
                  <Recycle className="text-yellow-600 w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-1">Eco-Friendly Process</h3>
                  <p className="text-sm text-gray-600">
                     Encouraging sustainability by enabling responsible scrap management.
                  </p>
               </div>
               <div className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-md transition">
                  <Users className="text-blue-600 w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-1">Verified Community</h3>
                  <p className="text-sm text-gray-600">
                     Work with verified sellers and buyers across multiple industries.
                  </p>
               </div>
            </div>
         </section>

         {/* User Reviews */}
         <section className="bg-yellow-50 py-10">
            <div className="max-w-5xl mx-auto p-6 text-center">
               <h2 className="text-2xl font-bold mb-4">What Our Users Say</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                     {
                        name: "Ravi Kumar",
                        role: "Seller",
                        review:
                           "Kabaad Mandi made it easy to auction my metal scrap. I received better prices than local dealers!",
                     },
                     {
                        name: "Neha Sharma",
                        role: "Buyer",
                        review:
                           "Very transparent and secure platform. The bidding system is smooth and efficient.",
                     },
                     {
                        name: "Amit Patel",
                        role: "Scrap Dealer",
                        review:
                           "Excellent experience! Payment through Razorpay is quick and the website is easy to use.",
                     },
                  ].map((r, i) => (
                     <div key={i} className="bg-white rounded-xl p-6 shadow hover:shadow-md transition text-left">
                        <div className="flex items-center gap-2 mb-3">
                           <Star className="text-yellow-500 w-5 h-5" />
                           <Star className="text-yellow-500 w-5 h-5" />
                           <Star className="text-yellow-500 w-5 h-5" />
                           <Star className="text-yellow-500 w-5 h-5" />
                           <Star className="text-yellow-500 w-5 h-5" />
                        </div>
                        <p className="text-gray-700 mb-3 text-sm italic">“{r.review}”</p>
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-xs text-gray-500">{r.role}</p>
                     </div>
                  ))}
               </div>
            </div>
         </section>
      </main>
   );
}
