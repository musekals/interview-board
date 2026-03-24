import type { ComponentType } from "react";

import PIVITHifi from "./pivit_hifi";
import PIVITHifiV2 from "./pivit_hifi_v2";

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
    notes: "Claude 버전 #1",
    fileName: "pivit_hifi.jsx",
    Component: PIVITHifi,
  },
  {
    id: "d2",
    label: "2차",
    title: "PIVIT Hi-Fi 디자인 시안 2차",
    notes: "Claude 버전 #2 : 좀 더 상용 서비스 같이 해줘",
    fileName: "pivit_hifi_v2.jsx",
    Component: PIVITHifiV2,
  },
];
