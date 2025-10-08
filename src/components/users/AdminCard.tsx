// // src/components/users/AdminCard.tsx
// 'use client';

// import React from 'react';
// import Image from 'next/image';

// export default function AdminCard({ cabang, name, role, nomortelepon, avatar }: { cabang: string; name: string; role: string; nomortelepon: string; avatar?: string; }) {
//   return (
//     <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center relative overflow-hidden">
//       {/* decorative background faint pattern (optional) */}
//       <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/images/pattern.png')] bg-contain" />

//       <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg mb-4">
//         <Image
//           src={avatar ?? '/avatar-placeholder.png'}
//           alt={name}
//           width={96}
//           height={96}
//           className="object-cover w-full h-full"
//         />
//       </div>

//       <div className="text-sm font-medium text-gray-800">{name}</div>
//       <div className="text-xs text-gray-400 mt-1">{role} - {cabang}</div>
//       {/* <div className="text-xs text-gray-400 mt-1">{role}</div> */}
//       <div className="text-xs text-gray-400 mt-2">{nomortelepon}</div>

//       <div className="mt-4 flex gap-2">
//         <button className="text-xs px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50">Edit</button>
//         <button className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 hover:bg-red-100">Remove</button>
//       </div>
//     </div>
//   );
// }

'use client';

import React from 'react';
import Image from 'next/image';

export default function AdminCard({
  id,
  cabang,
  name,
  role,
  nomortelepon,
  avatar,
  onDelete,
  onEdit,
}: {
  id?: number;
  cabang: string;
  name: string;
  role: string;
  nomortelepon: string;
  avatar?: string;
  onDelete?: () => void;
  onEdit?: () => void;
}) {
  return (
    <div data-id={id ?? ''} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('/images/pattern.png')] bg-contain" />
      <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg mb-4">
        <Image src={avatar ?? '/avatar-placeholder.png'} alt={name} width={96} height={96} className="object-cover w-full h-full" />
      </div>

      <div className="text-sm font-medium text-gray-800">{name}</div>
      <div className="text-xs text-gray-400 mt-1">{role} - {cabang}</div>
      <div className="text-xs text-gray-400 mt-2">{nomortelepon}</div>

      <div className="mt-4 flex gap-2">
        <button onClick={onEdit} className="text-xs px-3 py-1 rounded-md border border-gray-200 hover:bg-gray-50">Edit</button>
        <button onClick={onDelete} className="text-xs px-3 py-1 rounded-md bg-red-50 text-red-600 border border-red-100 hover:bg-red-100">Remove</button>
      </div>
    </div>
  );
}
