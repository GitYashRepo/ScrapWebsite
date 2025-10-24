const ChatsTable = ({ data }) => {
   if (!data.length) return <p>No active conversations yet.</p>;

   return (
      <div className="overflow-x-auto border rounded-2xl">
         <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
               <tr>
                  <th className="p-3 text-left">Seller</th>
                  <th className="p-3 text-left">Buyer</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Created At</th>
               </tr>
            </thead>
            <tbody>
               {data.map((chat) => (
                  <tr key={chat._id} className="border-b hover:bg-gray-50">
                     <td className="p-3">{chat.seller?.ownerName}</td>
                     <td className="p-3">{chat.buyer?.name}</td>
                     <td className="p-3">{chat.product?.name}</td>
                     <td className="p-3">{chat.status}</td>
                     <td className="p-3">{new Date(chat.createdAt).toLocaleDateString()}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
   );
};
export default ChatsTable;
