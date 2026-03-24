'use client';

import { useState } from "react";

import DesignSystem from "./design-system";
import PIVITHifi from "./pivit_hifi";
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
    fileName: "design-system.jsx",
    Component: DesignSystem,
  },
];

const DESIGN_TABS = [
  {
    id: "pivit-hifi",
    label: "PIVIT Hi-Fi",
    title: "PIVIT Hi-Fi 디자인 시안",
    notes:
      "와이어프레임이 아니라 비주얼 방향성과 UI 밀도를 확인하는 디자인 시안입니다.",
    fileName: "pivit_hifi.jsx",
    Component: PIVITHifi,
  },
];

export default function WireframeVersionTabs() {
  const [activeVersionId, setActiveVersionId] = useState(DEFAULT_VERSION_ID);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const wireframeTabs = wireframeVersions.map((version) => ({
    ...version,
    section: "wireframe" as const,
  }));
  const designTabs = DESIGN_TABS.map((tab) => ({
    ...tab,
    section: "design" as const,
  }));
  const referenceTabs = REFERENCE_TABS.map((tab) => ({
    ...tab,
    section: "reference" as const,
  }));

  const allTabs = [...wireframeTabs, ...designTabs, ...referenceTabs];

  const activeVersion =
    allTabs.find((version) => version.id === activeVersionId) ??
    wireframeTabs[wireframeTabs.length - 1];

  if (!activeVersion) return null;

  const ActiveComponent = activeVersion.Component;
  const guideLabel =
    activeVersion.section === "wireframe"
      ? "작업안"
      : activeVersion.section === "design"
        ? "디자인 시안"
        : "레퍼런스";

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
              붙일 수 있고, 디자인 시안과 디자인 시스템은 별도 섹션에서
              구분해서 확인할 수 있습니다.
            </p>
          </div>
          <div className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600">
            {wireframeTabs.length} wireframes + {designTabs.length} design +{" "}
            {referenceTabs.length} reference
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              와이어프레임 버전
            </div>
            <div className="flex flex-wrap gap-2">
              {wireframeTabs.map((version) => (
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
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              디자인 시안
            </div>
            <div className="flex flex-wrap gap-2">
              {designTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveVersionId(tab.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    activeVersion.id === tab.id
                      ? "border-rose-700 bg-rose-700 text-white"
                      : "border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300 hover:text-rose-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
              레퍼런스
            </div>
            <div className="flex flex-wrap gap-2">
              {referenceTabs.map((tab) => (
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
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900">
                {activeVersion.title}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                {guideLabel} 안내를 접었다 펼치며 확인할 수 있습니다.
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activeVersion.section === "wireframe" && (
                <a
                  href={`/download/wireframes/${activeVersion.id}`}
                  className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
                >
                  JSX 다운로드
                </a>
              )}
              <button
                onClick={() => setIsGuideOpen((open) => !open)}
                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-900"
              >
                {isGuideOpen
                  ? `${guideLabel} 안내 접기`
                  : `${guideLabel} 안내 펼치기`}
              </button>
            </div>
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
