export const dynamic = "force-static";

export const metadata = {
  title: "Cursor Preview | Our Platform",
  description: "Static preview page for the Cursor route so the export build can succeed.",
};

export default function CursorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-50 px-6 py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-12">
        <header className="text-center space-y-4">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Cursor route</p>
          <h1 className="text-4xl font-bold sm:text-5xl">This page is generated statically</h1>
          <p className="text-base text-slate-300 sm:text-lg">
            We removed dynamic search parameter usage here so static export completes cleanly. Feel free to
            replace this content with your own static showcase.
          </p>
        </header>

        <section className="grid gap-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl sm:grid-cols-3">
          {[
            {
              title: "Predictable",
              body: "No runtime data fetching or search params are used on this route.",
            },
            {
              title: "Export-ready",
              body: "Configured with dynamic=force-static so Next.js can pre-render during export.",
            },
            {
              title: "Customizable",
              body: "Swap in your own static content or CTA without worrying about dynamic rendering errors.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-800/70 bg-slate-950/50 p-4 transition hover:border-cyan-400/60 hover:shadow-cyan-400/10"
            >
              <h3 className="text-lg font-semibold text-cyan-200">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.body}</p>
            </div>
          ))}
        </section>

        <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/20 via-emerald-500/10 to-purple-500/20 p-[1px] shadow-2xl">
          <div className="h-full w-full rounded-[15px] bg-slate-950/80 p-8 text-center">
            <h2 className="text-2xl font-semibold text-cyan-200">Next steps</h2>
            <p className="mt-3 text-slate-300">
              Hook this route into your flow, or point links back to the main experience while keeping the build export-ready.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <a
                href="/"
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Return home
              </a>
              <a
                href="/astra/"
                className="rounded-lg border border-cyan-400/70 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:text-white"
              >
                View Astra page
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
