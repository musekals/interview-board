'use client';

import { useState } from "react";

import { wireframeVersions } from "./wireframe-registry";

const DEFAULT_VERSION_ID =
  wireframeVersions[wireframeVersions.length - 1]?.id ?? "";

export default function WireframeVersionTabs() {
  const [activeVersionId, setActiveVersionId] = useState(DEFAULT_VERSION_ID);

  const activeVersion =
    wireframeVersions.find((version) => version.id === activeVersionId) ??
    wireframeVersions[wireframeVersions.length - 1];

  if (!activeVersion) return null;

  const ActiveComponent = activeVersion.Component;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-zinc-200 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Wireframe Versions
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              작업 버전별 비교
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-zinc-600">
              상단 탭으로 와이어프레임 버전을 전환해 비교할 수 있습니다. 새
              버전이 생기면 버전 registry에 항목만 추가하면 같은 방식으로
              붙일 수 있습니다.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
            {wireframeVersions.length} versions
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {wireframeVersions.map((version) => (
            <button
              key={version.id}
              onClick={() => setActiveVersionId(version.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeVersion.id === version.id
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {version.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="text-sm font-semibold text-zinc-900">
            {activeVersion.title}
          </div>
          <div className="mt-1 text-sm leading-6 text-zinc-600">
            {activeVersion.notes}
          </div>
        </div>
      </section>

      <ActiveComponent />
    </div>
  );
}
