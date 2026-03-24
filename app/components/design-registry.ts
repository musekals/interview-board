import type { ComponentType } from "react";

import PIVITHifi from "./pivit_hifi";

export type DesignVersion = {
  id: string;
  label: string;
  title: string;
  notes: string;
  fileName: string;
  Component: ComponentType;
};

// Add new design iterations here as new design files are introduced.
export const designVersions: DesignVersion[] = [
  {
    id: "d1",
    label: "1차",
    title: "PIVIT Hi-Fi 디자인 시안 1차",
    notes:
      "와이어프레임이 아니라 비주얼 방향성과 UI 밀도를 확인하는 첫 번째 디자인 시안입니다.",
    fileName: "pivit_hifi.jsx",
    Component: PIVITHifi,
  },
];
