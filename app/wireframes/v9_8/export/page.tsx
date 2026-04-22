import WireframeV9_8 from "@/app/components/wireframes_v9_8_3";

type ExportPageProps = {
  searchParams?: Promise<{
    screen?: string;
    state?: string;
  }>;
};

export default async function WireframeV98ExportPage({
  searchParams,
}: ExportPageProps) {
  const params = (await searchParams) ?? {};
  const screen = params.screen ?? "feed";
  const stateIndex = Number(params.state ?? "0");

  return (
    <main className="m-0 inline-flex bg-white p-0">
      <WireframeV9_8
        exportMode
        initialScreen={screen}
        initialStateIndex={stateIndex}
      />
    </main>
  );
}
