"use client";

import { useEffect, useState } from "react";
import ModalBox from "@/components/ui/ModalBox";
import { usePathname } from "next/navigation";

export default function AdDisplayModal() {
   const [ad, setAd] = useState(null);
   const [showModal, setShowModal] = useState(false);
   const pathname = usePathname();

   useEffect(() => {
      const fetchAd = async () => {
         try {
            const res = await fetch("/api/ads/active");
            const data = await res.json();

            if (res.ok && data.length > 0) {
               const randomAd = data[Math.floor(Math.random() * data.length)];
               setAd(randomAd);
               setShowModal(true);
            }
         } catch (err) {
            console.error("Error loading ad:", err);
         }
      };

      fetchAd();
   }, [pathname]);

   if (!ad) return null;

   return (
      <ModalBox isOpen={showModal} onClose={() => setShowModal(false)} title={ad.title}>
         <div className="flex flex-col items-center text-center space-y-3">
            {ad.productImages?.[0] && (
               <img
                  src={ad.productImages[0]}
                  alt={ad.title}
                  className="w-full h-auto object-cover rounded-lg border"
               />
            )}
            <p className="text-lg font-semibold text-gray-800">{ad.description}</p>
            {ad.discountPrice ? (
               <p className="text-xl font-bold text-green-700">
                  ₹{ad.discountPrice}{" "}
                  <span className="line-through text-gray-500 text-sm">
                     ₹{ad.price}
                  </span>
               </p>
            ) : (
               <p className="text-xl font-bold text-blue-700">₹{ad.price}</p>
            )}
            {ad.offerDetails && (
               <p className="text-sm text-red-600 font-semibold">{ad.offerDetails}</p>
            )}
            {ad.companyWebsite && (
               <a
                  href={`https://${ad.companyWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
               >
                  Visit {ad.companyName} - {ad.companyWebsite}
               </a>
            )}
         </div>
      </ModalBox>
   );
}
