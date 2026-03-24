import type { ComponentType } from "react";

import PIVITHifi from "./pivit_hifi";
import PIVITHifiV2 from "./pivit_hifi_v2";
import PIVITProductionV3 from "./pivit_production_v3";
import GPTOnlyPIVITHifiWireframes from "./gptonly_pivit_hifi_wireframes";

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
  {
    id: "d3",
    label: "3차",
    title: "PIVIT Hi-Fi 디자인 시안 3차",
    notes: "Claude by GPT Prompts",
    fileName: "pivit_production_v3.jsx",
    Component: PIVITProductionV3,
  },
  {
    id: "d4",
    label: "4차",
    title: "PIVIT Hi-Fi 디자인 시안 4차",
    notes: "GPT Pro 단독 작업 1차",
    fileName: "gptonly_pivit_hifi_wireframes.jsx",
    Component: GPTOnlyPIVITHifiWireframes,
  },
];
