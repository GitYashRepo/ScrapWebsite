"use client";

import React, { useEffect, useRef, useState } from "react";

export default function SideBar() {
   const [progress, setProgress] = useState(0);
   const trackRef = useRef(null);

   useEffect(() => {
      const update = () => {
         const doc = document.documentElement;
         const scrollTop = window.scrollY || doc.scrollTop || 0;
         const scrollHeight = doc.scrollHeight || document.body.scrollHeight || 0;
         const docHeight = Math.max(0, scrollHeight - window.innerHeight);
         const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
         setProgress(Math.min(100, Math.max(0, pct)));
      };

      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", update);
      return () => {
         window.removeEventListener("scroll", update);
         window.removeEventListener("resize", update);
      };
   }, []);

   // Click on track => scroll to that position
   const onTrackClick = (e) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const pct = Math.max(0, Math.min(1, y / rect.height));
      const target = pct * (document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: target, behavior: "smooth" });
   };

   return (
      // Hidden on small screens; remove `hidden md:flex` if you want always visible
      <aside
         aria-hidden="true"
         className="fixed right-6 top-1/2 -translate-y-1/2 z-[60] hidden md:flex items-center"
      >
         <div className="flex items-center">
            {/* The thin line / track */}
            <div
               ref={trackRef}
               onClick={onTrackClick}
               className="relative h-[30vh] w-[2px] bg-black rounded-full cursor-pointer"
               // fallback min-height so it's visible even on very short viewports
               style={{ minHeight: 160 }}
            >
               {/* the moving dot */}
               <div
                  className="absolute left-1 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow transition-all duration-150"
                  style={{ top: `${progress}%`, transform: "translate(-50%, -50%)" }}
               />
            </div>
         </div>
      </aside>
   );
}
