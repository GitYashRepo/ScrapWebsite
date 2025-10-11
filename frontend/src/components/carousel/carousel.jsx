"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function Carousel({
   items,
   intervalMs = 4000,
   className,
   showIndicators = true,
   loop = true,
   pauseOnHover = true,
   initialIndex = 0,
   ariaLabel = "Content carousel",
   onIndexChange,
}) {
   const [index, setIndex] = React.useState(initialIndex)
   const isPausedRef = React.useRef(false)
   const intervalRef = React.useRef(null)
   const count = items.length

   const clearTimer = React.useCallback(() => {
      if (intervalRef.current) {
         clearInterval(intervalRef.current)
         intervalRef.current = null
      }
   }, [])

   const startTimer = React.useCallback(() => {
      if (count <= 1) return
      if (isPausedRef.current) return
      clearTimer()
      intervalRef.current = setInterval(() => {
         setIndex((prev) => {
            const next = prev + 1
            if (next >= count) return loop ? 0 : prev
            return next
         })
      }, intervalMs)
   }, [clearTimer, count, intervalMs, loop])

   React.useEffect(() => {
      startTimer()
      return () => clearTimer()
   }, [startTimer, clearTimer])

   React.useEffect(() => {
      onIndexChange?.(index)
   }, [index, onIndexChange])

   const onMouseEnter = () => {
      isPausedRef.current = true
      clearTimer()
   }

   const onMouseLeave = () => {
      isPausedRef.current = false
      startTimer()
   }

   const goTo = (i) => {
      if (count === 0) return
      const bounded = ((i % count) + count) % count
      setIndex(bounded)
   }

   const next = () => goTo(index + 1)
   const prev = () => goTo(index - 1)

   const onKeyDown = (e) => {
      if (e.key === "ArrowRight") {
         e.preventDefault()
         next()
      } else if (e.key === "ArrowLeft") {
         e.preventDefault()
         prev()
      }
   }

   if (count === 0) {
      return (
         <div className={cn("w-full rounded-lg border bg-card text-card-foreground p-6", className)}>
            <p className="text-sm text-muted-foreground">No items to display.</p>
         </div>
      )
   }

   return (
      <div
         role="region"
         aria-roledescription="carousel"
         aria-label={ariaLabel}
         className={cn(
            "relative w-full h-[80vh] overflow-hidden border bg-card text-card-foreground",
            className
         )}
         onMouseEnter={pauseOnHover ? onMouseEnter : undefined}
         onMouseLeave={pauseOnHover ? onMouseLeave : undefined}
         onKeyDown={onKeyDown}
         tabIndex={0}
      >
         {/* SLIDES CONTAINER */}
         <div
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{
               transform: `translateX(-${index * 100}%)`,
               width: `${count * 100}%`,
            }}
            aria-live="polite"
         >
            {items.map((item, i) => (
               <div
                  key={item.id ?? i}
                  className="w-full h-full flex-shrink-0 flex-grow-0"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Slide ${i + 1} of ${count}`}
                  aria-hidden={i !== index}
               >
                  {item.content}
               </div>
            ))}
         </div>

         {/* CONTROLS */}
         <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-2">
            <Button
               type="button"
               variant="secondary"
               size="icon"
               className="pointer-events-auto bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/50"
               onClick={prev}
               aria-label="Previous slide"
            >
               <span aria-hidden="true">‹</span>
            </Button>

            <Button
               type="button"
               variant="secondary"
               size="icon"
               className="pointer-events-auto bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/50"
               onClick={next}
               aria-label="Next slide"
            >
               <span aria-hidden="true">›</span>
            </Button>
         </div>

         {/* INDICATORS */}
         {showIndicators && count > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-2">
               {items.map((_, i) => {
                  const isActive = i === index
                  return (
                     <button
                        key={i}
                        type="button"
                        aria-label={`Go to slide ${i + 1}`}
                        aria-current={isActive ? "true" : undefined}
                        onClick={() => goTo(i)}
                        className={cn(
                           "h-2.5 w-2.5 rounded-full border transition-colors",
                           isActive
                              ? "bg-primary border-primary"
                              : "bg-background/70 border-border hover:bg-primary/60"
                        )}
                     />
                  )
               })}
            </div>
         )}
      </div>
   )
}
