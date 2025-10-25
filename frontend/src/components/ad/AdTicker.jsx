"use client"
import { useEffect, useRef, useState } from "react"
import { GiFastArrow } from "react-icons/gi"

export default function SmoothScroller() {
   const [items, setItems] = useState([])
   const contentRef = useRef(null)
   const [singleSetWidth, setSingleSetWidth] = useState(0)

   useEffect(() => {
      const fetchItems = async () => {
         try {
            const res = await fetch("/api/ads/active")
            const data = await res.json()
            if (res.ok && data.length > 0) setItems(data)
         } catch (err) {
            console.error("Error fetching items:", err)
         }
      }

      fetchItems()
      const interval = setInterval(fetchItems, 5 * 60 * 1000)
      return () => clearInterval(interval)
   }, [])

   useEffect(() => {
      if (!contentRef.current || items.length === 0) return

      const content = contentRef.current
      setTimeout(() => {
         const totalWidth = content.scrollWidth
         const duplicateCount = 5
         const calculatedWidth = totalWidth / duplicateCount
         setSingleSetWidth(calculatedWidth)
      }, 0)
   }, [items])

   useEffect(() => {
      if (!contentRef.current || items.length === 0 || singleSetWidth === 0) return

      const content = contentRef.current
      let animationId
      let position = 0
      const speed = 1

      const animate = () => {
         position -= speed
         const wrappedPosition = position % singleSetWidth
         content.style.transform = `translateX(${wrappedPosition}px)`
         animationId = requestAnimationFrame(animate)
      }

      animationId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationId)
   }, [items, singleSetWidth])

   if (items.length === 0) return null

   const scrollItems = Array(5).fill(items).flat()

   return (
      <div className="fixed bottom-0 left-0 w-full z-50">
         <div className="overflow-hidden flex items-center bg-blue-600 h-24 sm:h-20 w-full">
            <div className="scroller-container w-full">
               <div className="scroller-content flex-nowrap flex items-center gap-4 sm:gap-6" ref={contentRef}>
                  {scrollItems.map((item, index) => (
                     <div
                        key={`${item._id}-${index}`}
                        className="flex-shrink-0 flex items-center gap-2 sm:gap-4 px-4 sm:px-10 py-2 text-white text-sm sm:text-2xl font-medium whitespace-nowrap min-w-max"
                     >
                        <GiFastArrow size={24} className="sm:!w-8 sm:!h-8" />
                        <span className="bg-white text-blue-700 px-1 sm:px-2 py-0.5 sm:py-1 rounded font-bold text-xs sm:text-base">{item.companyName}</span>
                        <span className="text-xs sm:text-lg">{item.title}</span>
                        {item.discountPrice ? (
                           <span className="text-xs sm:text-lg">
                              ₹{item.discountPrice}{" "}
                              <span className="line-through text-gray-200 pl-2 sm:pl-4">₹{item.price}</span>
                           </span>
                        ) : (
                           <span className="text-xs sm:text-lg">₹{item.price}</span>
                        )}
                        <span className="text-xs sm:text-base">
                           <a href={`https://${item.companyWebsite}`} target="_blank" rel="noopener noreferrer">
                              WEB: {item.companyWebsite}
                           </a>
                        </span>
                        <span className="text-xs sm:text-base">Mob: {item.contactNumber}</span>
                        {item.offerDetails && <span className="text-yellow-300 font-semibold text-xs sm:text-base">🎉 {item.offerDetails}</span>}
                        <p className="text-gray-200 text-[10px] sm:text-lg">• Runs till {new Date(item.adEnd).toLocaleString()}</p>
                        <GiFastArrow size={24} className="sm:!w-8 sm:!h-8" />
                     </div>
                  ))}
               </div>
            </div>
         </div>

         <style jsx>{`
        .scroller-container {
          width: 100%;
          overflow: hidden;
        }

        .scroller-content {
          display: flex;
          will-change: transform;
        }
      `}</style>
      </div>
   )
}
