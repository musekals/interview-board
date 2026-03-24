'use client';

import { useState } from "react";

import DesignSystem from "./design-system";
import { wireframeVersions } from "./wireframe-registry";

const DEFAULT_VERSION_ID =
  wireframeVersions[wireframeVersions.length - 1]?.id ?? "";

const REFERENCE_TABS = [
  {
    id: "design-system",
    label: "디자인 시스템",
    title: "디자인 시스템",
    notes:
      "v6 와이어프레임 기준 디자인 토큰과 공통 컴포넌트를 정리한 레퍼런스입니다.",
    Component: DesignSystem,
  },
];

export default function WireframeVersionTabs() {
  const [activeVersionId, setActiveVersionId] = useState(DEFAULT_VERSION_ID);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const allTabs = [...wireframeVersions, ...REFERENCE_TABS];

  const activeVersion =
    allTabs.find((version) => version.id === activeVersionId) ??
    wireframeVersions[wireframeVersions.length - 1];

  if (!activeVersion) return null;

  const ActiveComponent = activeVersion.Component;
  const isReferenceTab = REFERENCE_TABS.some(
    (tab) => tab.id === activeVersion.id,
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-zinc-200 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Wireframe Versions
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              작업 버전과 레퍼런스 보기
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-zinc-600">
              상단 탭으로 와이어프레임 버전을 전환해 비교할 수 있습니다. 새
              버전이 생기면 버전 registry에 항목만 추가하면 같은 방식으로
              붙일 수 있고, 디자인 시스템도 같은 자리에서 함께 확인할 수
              있습니다.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
            {wireframeVersions.length} versions + {REFERENCE_TABS.length} reference
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
          {REFERENCE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveVersionId(tab.id)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeVersion.id === tab.id
                  ? "border-teal-700 bg-teal-700 text-white"
                  : "border-teal-200 bg-teal-50 text-teal-800 hover:border-teal-300 hover:text-teal-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900">
                {activeVersion.title}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {isReferenceTab
                  ? "레퍼런스 안내를 접었다 펼치며 확인할 수 있습니다."
                  : "작업안 안내를 접었다 펼치며 확인할 수 있습니다."}
              </div>
            </div>
            <button
              onClick={() => setIsGuideOpen((open) => !open)}
              className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
            >
              {isGuideOpen
                ? isReferenceTab
                  ? "레퍼런스 안내 접기"
                  : "작업안 안내 접기"
                : isReferenceTab
                  ? "레퍼런스 안내 펼치기"
                  : "작업안 안내 펼치기"}
            </button>
          </div>
          {isGuideOpen && (
            <div className="mt-4 whitespace-pre-line border-t border-zinc-200 pt-4 text-sm leading-6 text-zinc-600">
              {activeVersion.notes}
            </div>
          )}
        </div>
      </section>

      <ActiveComponent />
    </div>
  );
}
