"use client"

import * as React from "react"




const SkeletonCard = () => {
   return (
      <div className="border rounded-xl shadow-sm p-4 animate-pulse">
         <div className="w-full h-40 bg-gray-200 rounded-lg mb-3"></div>
         <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
         <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
         <div className="h-3 bg-gray-200 rounded w-5/6 mb-3"></div>
         <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
         <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
         <div className="flex gap-2 mt-4">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
         </div>
      </div>
   )
}


export default SkeletonCard;
