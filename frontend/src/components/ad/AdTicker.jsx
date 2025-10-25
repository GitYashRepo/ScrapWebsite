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
         const itemCount = items.length
         const duplicateCount = 5 // Duplicate 5 times for seamless looping
         const calculatedWidth = totalWidth / duplicateCount
         setSingleSetWidth(calculatedWidth)
      }, 0)
   }, [items])

   useEffect(() => {
      if (!contentRef.current || items.length === 0 || singleSetWidth === 0) return

      const content = contentRef.current
      let animationId;
      let position = 0
      const speed = 1 // pixels per frame

      const animate = () => {
         position -= speed

         // When position exceeds the single set width, it wraps back to 0 seamlessly
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
         <div className="overflow-hidden bg-blue-600 h-12 w-full">
            <div className="scroller-container">
               <div className="scroller-content" ref={contentRef}>
                  {scrollItems.map((item, index) => (
                     <div
                        key={`${item._id}-${index}`}
                        className="inline-flex items-center gap-6 px-10 py-2 text-white text-sm font-medium whitespace-nowrap flex-shrink-0"
                     >
                        <div>
                           <GiFastArrow size={34} />
                        </div>
                        <span className="bg-white text-blue-700 px-2 py-1 rounded font-bold">{item.companyName}</span>
                        <span>{item.title}</span>
                        {item.discountPrice ? (
                           <span>
                              ₹{item.discountPrice} <span className="line-through text-gray-200 text-xs">₹{item.price}</span>
                           </span>
                        ) : (
                           <span>₹{item.price}</span>
                        )}
                        <span><a href={`https://${item.companyWebsite}`} target="_blank" rel="noopener noreferrer">WEB:- {item.companyWebsite}</a></span>
                        <span>Mob:- {item.contactNumber}</span>
                        {item.offerDetails && <span className="text-yellow-300 font-semibold">🎉 {item.offerDetails}</span>}
                        <span className="text-gray-200 text-xs">• Runs till {new Date(item.adEnd).toLocaleDateString()}</span>
                        <div>
                           <GiFastArrow size={34} />
                        </div>
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
