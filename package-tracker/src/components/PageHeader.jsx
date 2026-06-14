export default function PageHeader({ title, description, action }) {
  return (
    <header className="border-b border-slate-200 pb-6 mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
      {action}
    </header>
  );
}
