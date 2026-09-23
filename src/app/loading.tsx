export default function Loading() {
  return (
    <main className="mx-auto grid max-w-7xl gap-4 px-4 py-8 md:px-6">
      <div className="overflow-hidden rounded-md border border-ink/10 bg-white shadow-sm">
        <div className="h-1 bg-petrol/15">
          <div className="route-loading-bar h-full w-1/2 bg-petrol" />
        </div>
        <div className="grid gap-3 p-5">
          <p className="text-sm font-black text-ink">Caricamento TrovaBenzina...</p>
          <div className="h-4 w-2/3 animate-pulse rounded-sm bg-ink/10" />
          <div className="h-4 w-1/2 animate-pulse rounded-sm bg-ink/10" />
        </div>
      </div>
    </main>
  );
}
