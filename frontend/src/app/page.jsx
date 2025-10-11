"use client"

import Carousel from "@/components/carousel/carousel";


export default function Home() {
   const slides = [
      {
         content: (
            <figure className="relative w-[100vw] h-[80vh] flex items-center justify-center bg-black">
               {/* Using placeholder per guidelines, hard-coded query */}
               <img
                  src="/Carousel/img1.jpg"
                  alt="Serene landscape with mountains"
                  className="w-full object-contain"
               />
               <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  <div className="rounded-md bg-background/70 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                     <h3 className="text-balance text-lg font-semibold text-primary">Calm Morning</h3>
                     <p className="text-sm text-muted-foreground">A gentle start with misty peaks and soft light.</p>
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
                  alt="Minimal modern architecture"
                  className="w-full object-contain"
               />
               <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  <div className="rounded-md bg-background/70 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                     <h3 className="text-balance text-lg font-semibold text-primary">Clean Lines</h3>
                     <p className="text-sm text-muted-foreground">Minimal forms and balanced proportions.</p>
                  </div>
               </figcaption>
            </figure>
         ),
      },
      {
         content: (
            <figure className="relative w-[100vw] h-[80vh] flex items-center justify-center bg-black">
               <img src="/Carousel/img3.jpg" alt="Creative workspace desk" className="w-full object-contain" />
               <figcaption className="absolute inset-x-0 bottom-0 p-4">
                  <div className="rounded-md bg-background/70 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                     <h3 className="text-balance text-lg font-semibold text-primary">Focused Flow</h3>
                     <p className="text-sm text-muted-foreground">A workspace that invites clarity and deep work.</p>
                  </div>
               </figcaption>
            </figure>
         ),
      },
   ]

   return (
      <main className="">
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
      </main>
   );
}
