import type { ComponentType } from "react";

import WireframeV1 from "./wireframes";
import WireframeV2 from "./wireframes_2nd";
import WireframeV3 from "./wireframes_3rd";

export type WireframeVersion = {
  id: string;
  label: string;
  title: string;
  notes: string;
  Component: ComponentType;
};

// Add new versions here as new wireframe files are introduced.
export const wireframeVersions: WireframeVersion[] = [
  {
    id: "v1",
    label: "1차",
    title: "1차 작업안",
    notes: "초기 화면 구조와 주요 사용자 흐름을 정리한 첫 번째 버전입니다.",
    Component: WireframeV1,
  },
  {
    id: "v2",
    label: "2차",
    title: "2차 작업안",
    notes: "구독 모델과 화면 상태 비교를 보강한 두 번째 버전입니다.",
    Component: WireframeV2,
  },
  {
    id: "v3",
    label: "3차",
    title: "3차 작업안",
    notes: "룸 목록과 쇼케이스/확장 시나리오를 추가한 최신 작업안입니다.",
    Component: WireframeV3,
  },
];
