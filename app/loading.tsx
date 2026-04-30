export default function Loading() {
  return (
    <main className="max-w-5xl mx-auto px-5 py-9 flex-1 animate-pulse">
      <div className="h-10 w-2/3 bg-grey-light/40 rounded mb-3" />
      <div className="h-4 w-1/2 bg-grey-light/30 rounded mb-8" />
      {[0, 1].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-black/5 p-7 mb-5">
          <div className="h-6 w-1/3 bg-grey-light/40 rounded mb-4" />
          <div className="h-4 w-full bg-grey-light/30 rounded mb-2" />
          <div className="h-4 w-5/6 bg-grey-light/30 rounded" />
        </div>
      ))}
    </main>
  );
}
