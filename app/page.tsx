import WireframeViewer from "./components/wireframes_2nd";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 sm:px-10 lg:px-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="flex flex-col gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
            PIVIT
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            PIVIT 룸/이슈 구독 모델 와이어프레임
          </h1>
          <p className="max-w-3xl text-base leading-7 text-zinc-600">
            PIVIT 룸/이슈 구독 모델 와이어프레임
          </p>
        </section>

        <WireframeViewer />
      </div>
    </main>
  );
}
