export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-20 text-zinc-900 sm:px-10 lg:px-16 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-16">
        <section className="flex flex-col gap-6">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Interview Board
          </p>
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              고객 인터뷰 내용을
              <br />
              한눈에 정리하는 보드
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              흩어진 인터뷰 기록을 한곳에 모아 핵심 발언, 반복되는 문제,
              다음 액션까지 차분하게 정리할 수 있는 공간입니다.
            </p>
          </div>
        </section>

        <section className="grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">기록</h2>
            <p className="text-base leading-7 text-zinc-600 dark:text-zinc-300">
              인터뷰 메모와 관찰 내용을 주제별로 모아 빠르게 훑어볼 수
              있습니다.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">정리</h2>
            <p className="text-base leading-7 text-zinc-600 dark:text-zinc-300">
              반복해서 등장하는 의견과 중요한 신호를 구분해 맥락 있게
              정리합니다.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">공유</h2>
            <p className="text-base leading-7 text-zinc-600 dark:text-zinc-300">
              팀이 같은 화면을 보며 인사이트와 다음 판단 기준을 함께 맞출 수
              있습니다.
            </p>
          </div>
        </section>

        <section className="border-t border-black/10 pt-8 dark:border-white/10">
          <p className="max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            고객의 말을 놓치지 않고, 인터뷰 이후의 논의를 더 명확하게 만드는
            데 집중한 간결한 랜딩 페이지입니다.
          </p>
        </section>
      </div>
    </main>
  );
}
