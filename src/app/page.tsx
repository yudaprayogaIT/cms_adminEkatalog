// import SalesChartPlaceholder from "./components/dashboard/SalesChartPlaceholder";
// import StatCard from "./components/dashboard/StatCard";


// export default function Page() {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-semibold">Dashboard</h1>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard title="Total User" value="40,689" subtitle="8.5% Up from yesterday" />
//         <StatCard title="Total Order" value="10,293" subtitle="1.3% Up from past week" />
//         <StatCard title="Total Sales" value="$89,000" subtitle="4.3% Down from yesterday" />
//         <StatCard title="Total Pending" value="2,040" subtitle="1.8% Up from yesterday" />
//       </div>
//       <div className="bg-white rounded-xl shadow p-5">
//         <h2 className="font-medium mb-4">Sales Details</h2>
//         <SalesChartPlaceholder />
//       </div>
//     </div>
//   );
// }

// src/app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h2 className="text-2xl font-montserrat font-semibold mb-4">
        Selamat Datang di CMS Admin
      </h2>
      <p className="text-gray-600">
        Ini adalah tampilan dashboard utama sistem e-katalog ETM.
      </p>
    </div>
  );
}
