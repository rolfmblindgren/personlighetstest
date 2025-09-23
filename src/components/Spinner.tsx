// src/components/Spinner.tsx
export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 text-slate-600">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-teal-500" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
