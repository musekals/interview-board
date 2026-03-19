import type { ComponentType } from "react";

import WireframeV1 from "./wireframes";
import WireframeV2 from "./wireframes_2nd";
import WireframeV3 from "./wireframes_3rd";
import WireframeV4 from "./wireframes_4th";

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
    notes: `1. 대표 댓글 1개로 — 이슈 상세의 대표 댓글이 1개만 표시되고, 운영자 대표 댓글 지정 화면도 1개 지정/해제 구조로 변경.
2. 운영자 한 줄 복원 — 이슈 카드에 "운영자:" 한 줄이 다시 나오고, 이슈 상세에도 본문 위에 표시. 이슈 발행 화면에도 필드 복원.
3. 쇼케이스/확장형 룸 분기 — 룸 상세 상태에 "쇼케이스-Visitor/Subscriber/Member/Operator"와 "확장-" 시리즈 추가. 쇼케이스는 ⋯ 버튼 미노출 + "읽기 중심으로 운영됩니다" 안내, 확장형은 ⋯ 노출 + "같이 이야기하고 싶다면" soft signal.
4. 피드/이슈 목록 노출 원칙 — 이슈 목록 상단에 "대표 댓글이 지정된 이슈를 우선 노출합니다" 문구 명시. Info Panel 비고에도 원칙 기록.
5. "이 룸의 대표 반응" 섹션 — 룸 상세에 이슈와 분리된 대표 반응 2개를 모아 보여주는 섹션 추가. 원본 이슈명도 표시해서 어디서 나온 반응인지 확인 가능.
6. 피드 상단 구독 룸 아바타 — 내 피드 상단에 구독 중인 룸 3개의 아이콘이 가로로 나열되고 "3개 룸 구독 중" 표시.
7. 룸 목록 화면 추가 — /rooms 경로의 공개 룸 목록 화면 신규 추가. 각 룸에 "읽기 중심" / "참여 가능" 배지 표시. Visitor 진입점이자 피드 Empty의 "룸 둘러보기" 연결 대상.
8. Subscriber 전용 멤버 신청 CTA — 이슈 상세 하단이 3분기: Visitor → "이 룸 구독하러 가기", Subscriber → "댓글 멤버 신청하기", Member/Op → 댓글 입력창.
9. 스크랩 버튼 추가 — 이슈 상세의 업보트/신고 옆에 "⊞ 스크랩" 추가. 댓글·대댓글에도 "⊞ 스크랩" 액션 추가. 이슈 카드의 룸명에 밑줄 처리로 탭 가능한 링크임을 시각적으로 표현.`,
    Component: WireframeV3,
  },
  {
    id: "v4",
    label: "4차",
    title: "4차 작업안",
    notes: `1. Member가 보는 룸 상세 차별화
쇼케이스-Member / 확장-Member 상태로 전환해서 확인 가능
룸 소개가 "▸ 룸 소개 펼치기"로 접혀 있음 (탭하면 열림)
"이 룸의 대표 반응" 섹션 대신 바로 "진행 중 이슈" 섹션이 먼저 노출
대표 댓글 아직 없는 이슈에 "댓글 대기" 앰버 배지 표시

2. 쇼케이스 중심 + 확장은 예외적 모드
쇼케이스: "읽기 중심" 배지, ⋯ 메뉴 없음, 참여 CTA 없음
확장: "참여 가능" 배지, ⋯ → "같이 이야기하고 싶다면" soft signal
룸 목록에서도 유형 배지로 구분

3. 이슈 상태 표시 간소화
"진행 중"은 기본 상태이므로 배지 미표시
"예정"과 "종료"만 배지로 노출
이슈 상세에서도 날짜만 표시하고 진행 중 배지는 생략

4. 피드 vs 이슈 목록 레이아웃 분리
내 피드: 큰 카드(BigIssueCard) — 운영자 한 줄 + 대표 댓글 전문이 넉넉하게 표시. 카드 간 6px 두꺼운 구분선. 스크롤만으로도 읽는 재미가 있는 "큰 카드형 해석 피드"
이슈 목록: 작은 카드(CompactIssueCard) — 운영자 한 줄 + 대표 댓글 1줄(말줄임). 탐색/스캔에 최적화`,
    Component: WireframeV4,
  },
];
