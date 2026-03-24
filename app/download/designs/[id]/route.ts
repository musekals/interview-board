import { readFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { designVersions } from "@/app/components/design-registry";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const version = designVersions.find((item) => item.id === id);

  if (!version) {
    return NextResponse.json(
      { error: "Design version not found." },
      { status: 404 },
    );
  }

  const filePath = path.join(process.cwd(), "app", "components", version.fileName);
  const fileContents = await readFile(filePath, "utf8");

  return new NextResponse(fileContents, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${version.fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
