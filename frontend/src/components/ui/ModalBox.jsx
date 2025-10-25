"use client";

export default function ModalBox({ isOpen, onClose, title, children }) {
   if (!isOpen) return null;

   return (
      <div className=" fixed z-50 flex items-center justify-center rounded-xl border sm:items-end sm:justify-end sm:bottom-28 sm:right-12 bg-black/50">
         <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">{title}</h2>
               <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                  ✕
               </button>
            </div>
            <div>{children}</div>
         </div>
      </div>
   );
}
