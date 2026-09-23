"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid max-w-3xl gap-4 px-4 py-8 md:px-6">
      <section className="rounded-md border border-tomato/20 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-tomato">Errore backend</p>
        <h1 className="mt-1 text-2xl font-black text-ink">Non riesco a caricare i dati</h1>
        <p className="mt-2 text-sm text-ink/68">{error.message}</p>
        <button className="mt-4 rounded-md bg-petrol px-4 py-2 text-sm font-black text-white" type="button" onClick={reset}>
          Riprova
        </button>
      </section>
    </main>
  );
}
