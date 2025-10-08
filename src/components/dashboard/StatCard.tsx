type Props = { title: string; value: string; subtitle?: string };

export default function StatCard({ title, value, subtitle }: Props) {
  return (
    <div className="bg-white rounded-xl p-4 shadow flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-2xl font-semibold">{value}</h2>
        {subtitle && <p className="text-xs text-green-500 mt-1">{subtitle}</p>}
      </div>
      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </div>
    </div>
  );
}
