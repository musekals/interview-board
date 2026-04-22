'use client';

import { useState } from "react";

// ============================================================
// v9.8 — 이슈 목록 개선 + 프로필 편집 화면 신설
// v9.7 기준 두 가지 문제 해결:
//   (1) 이슈 목록이 피드의 축소판 같고 스캔을 돕는 축이 없음.
//   (2) 프로필 편집 경로가 코드상 존재하지 않음.
//
// ── 이슈 목록 변경 ─────────────────────────────────────────
//
// A) 정렬 셀렉터 도입 — 사용자가 탐색 축을 선택.
//    - [최신 / 반응 많은 / 대표 댓글 있는 / 진행 중] 4옵션.
//    - 우측 상단 드롭다운(단일 텍스트 버튼 + ▾).
//    - 기본값: '최신'. v9.7의 "대표 댓글 지정 이슈를 우선 노출" 고정 로직은 제거
//      (원하는 사용자는 '대표 댓글 있는' 정렬을 직접 선택).
//
// B) CompactIssueCard 콘텐츠 재정의 — 피드와 구별되는 고유 가치.
//    - 제거: 운영자 한 줄(opLine), 대표 댓글 한 줄(repShort + Aspect).
//      이전 가설은 "opLine이 본문 TL;DR 역할"이었으나, 실제 서비스 감각에선
//      카드가 본문을 직접 보여주는 편이 '이 이슈가 무슨 이야기인지' 즉시 이해됨.
//    - 추가: 본문 3~5줄(WebkitLineClamp: 5). 목록에서 바로 맥락을 읽을 수 있게.
//    - 유지: 룸 · 룸 Aspect · 제목 · 메트릭 · (선택) 우측 썸네일.
//    - 시각 위계: 종료 이슈는 opacity 0.68 + 옅은 배경으로 후순위.
//
// C) 우측 56×56 썸네일 슬롯(선택적).
//    - thumbUrl이 있을 때만 렌더, 없으면 텍스트가 가로 전체 차지.
//    - 스포일러는 blur 처리(탭 전 노출 금지 원칙).
//
// D) Aspect 필터는 MVP에서 제외.
//    - 검토했으나 파일럿 3~4룸 기준에서는 필터 종류가 너무 적고
//      룸 간 크로스 탐색 수요가 아직 작음. 운영 경험이 쌓인 뒤 도입.
//    - 이슈 목록의 Aspect 역할은 '필터'가 아니라 '카드 표시'에 한정
//      (룸 이름 옆 Aspect 칩은 유지).
//    - STATES.issues: '필터' 시연 상태 제거, '정렬' 시연 상태만 유지.
//
// ── 프로필 / 프로필 편집 변경 ──────────────────────────────
//
// E) profile-edit 화면 신설 — 경로 /me/edit.
//    - 편집 가능 필드: 아바타 / 닉네임 / 한 줄 소개(80자).
//    - 보유 정체성은 '읽기 전용' 섹션으로 노출 + 정체성 관리
//      (aspect-add) 화면으로 이동 링크.
//    - 진입: ProfileScreen(내 프로필) "편집" 버튼 + MyPageScreen
//      ProfileSection에 본인용 "편집" 링크 추가.
//    - 왜 별도 화면인가: (1) 편집 필드가 소수이고 나머지는 자동 계산/
//      전용 화면 관리. (2) v9.7의 aspect-add·issue-publish 패턴과
//      일관. (3) 가입 직후 '프로필 처음 설정' 흐름에 재사용.
//    - STATES: ["기본", "닉네임 중복", "저장 중"].
//
// F) "전역 주력" 개념을 현 시점 와이어프레임에서 전면 제거.
//    - MVP 범위에서 제외하고 향후 버전에서 재도입 예정.
//    - ProfileScreen에서 각 Aspect의 '전역 주력' 표기 / "전역 활동량 기준"
//      설명 문구 삭제. 보유 정체성 영역은 Aspect 칩 + 이 정체성으로
//      활동한 룸 수만 남김(간소화).
//    - ProfileEditScreen의 '전역 주력' 읽기 전용 섹션 삭제.
//    - 관련 notes에서 '전역 주력' 표현 제거.
//
// G) 글로벌 내비게이션 교체 — 하단 탭 바 → 상단 햄버거 + 좌측 드로어.
//    - 기존: Phone 셸이 하단에 고정 4탭(피드/이슈/룸/마이)을 렌더.
//    - 변경: 하단 GNB 제거. 상단에 공통 헤더(Phone이 렌더) 하나 두고,
//      좌측 아이콘은 컨텍스트에 따라 '햄버거' 또는 '백(←)' 으로 전환.
//    - 드로어:
//        · 좌측에서 슬라이드 인(width 280), 백드롭 반투명 0.4, 탭 외부 닫기.
//        · 상단에 유저 프로필 요약(아바타 + 닉네임 + Aspect 칩 일부).
//        · 메인 섹션: 피드 / 이슈 / 룸 / 마이페이지 — 기존 GNB 4개를 그대로 이관.
//        · 보조 섹션: 프로필 편집 / 로그아웃(MVP 이후) 자리.
//        · 현재 화면은 Aspect 보라(#534AB7)로 하이라이트.
//    - 각 화면의 기존 "← 뒤로" / "← 룸으로" 라인은 제거.
//      대신 해당 화면의 헤더 좌측에 백 아이콘이 햄버거 대신 노출됨.
//    - 상세/편집 화면(이슈 상세·프로필·프로필 편집·초대 랜딩·룸 설정·
//      이슈 발행·대표 댓글 지정·운영 사임)은 '백' 컨텍스트.
//    - 허브 화면(피드·이슈 목록·룸 목록·룸 상세·마이페이지·Aspect 추가·
//      룸 참여)은 '햄버거' 컨텍스트. 참고: 룸 상세·Aspect 추가·룸 참여는
//      링크로도 도달하므로 백/햄버거 중 어느 쪽이 맞는지 논쟁 여지가 있으나,
//      이들은 네비게이션 트리 관점에서는 2차 허브로 분류해 햄버거 유지.
//      (진입 컨텍스트에 따라 실제 서비스에선 ← 뒤로 표시될 수도 있음.)
//    - 상단 헤더 가운데에는 로고/타이틀 대신 화면 이름을 짧게 노출.
//      허브 화면은 각 화면 자체에 이미 h1이 있으므로 헤더 중앙은 비워둠
//      (높이 절약). 상세 화면만 헤더 중앙에 화면 타이틀.
//    - 신규 State: Phone 컴포넌트 내부에 drawerOpen 로컬 state. 상위로
//      올릴 필요 없음(드로어 간 상태 공유는 없음).
//
// ── 비변경(의도적) ──────────────────────────────────────────
//   - Aspect 데이터 모델·역할 자체는 그대로. 이슈 상세/댓글 Aspect 표시는 유지.
//   - 룸 상세·룸 목록·이슈 상세·피드는 손대지 않음.
//   - 룸별 그룹핑 아코디언 같은 확장성 약한 구조는 계속 배제.
// ============================================================

// ============================================================
// v9.7 — v9.6 변경 사항 확정
// v9.6 드래프트를 확정 버전으로 승격.
// v9.5 → v9.7 전체 변경 요약:
//
// A) 룸 소유권 재정의 — "운영자는 룸을 위임받아 관리한다"
//    - 기존: 운영자가 단독으로 룸을 archived 전이 가능 (룸 = 운영자 소유물).
//    - 변경: 아카이브는 운영자 단독 액션 아님. 두 경로로 나뉨:
//      (1) "운영 종료 요청" → 어드민 검토 → 이양 또는 아카이브
//      (2) "운영자 사임"   → 어드민이 신규 운영자 지정 or 아카이브 결정
//    - 룸 설정 상단에 "위임된 공간" 철학 배너. 하단 CTA가
//      "운영 종료"  →  "저장 / 운영자 사임 / 운영 종료 요청" 3트랙으로 확장.
//    - 신규 화면 operator-sign-off: 사유 입력 + 어드민 검토 프로세스 안내.
//    - room-settings 상태에 "public(종료 요청 중)", "archived" 추가.
//    - 멤버 보호: 아카이브 확정 시 멤버에게 사전 통지(운영으로 처리).
//
// B) archived 상태 전면 지원
//    - 룸 설정: 모든 편집 액션 비활성(opacity 0.55, pointer-events none),
//      멤버 모집 토글·초대 링크·이슈 초안 섹션 숨김, "보존되는 것 / 중단되는 것"
//      자산 보존 안내.
//    - 룸 상세: 외부(Visitor/Subscriber) 비노출 전제. Member/Operator
//      분기만 시연. Member의 active_aspect 표기는 과거형 "말했었어요".
//
// C) 이슈 드래프트 복원 + 상태 라디오 UI
//    - 룸 상태(draft/public/archived)와 이슈 상태(draft/active/closed/hidden)
//      는 서로 독립. draft 룸에서도 이슈 초안 작성 가능.
//    - 룸 설정에 "이슈 초안" 섹션 추가(draft/public 모두 노출).
//    - 이슈 발행 폼에 [초안, 공개, 닫힘, 숨김] 라디오 그룹. 현재 상태
//      기준으로 전이 가능한 라벨만 활성, 나머지는 흐리게 비활성.
//    - 전이 규칙 (단방향 원칙 + 숨김은 실수 되돌림 수단):
//        · new    → [초안, 공개]
//        · draft  → [초안, 공개]             (공개 후 초안 복귀 불가)
//        · active → [공개, 닫힘, 숨김]
//        · closed → [닫힘, 숨김]              (닫힘 → 공개 불가)
//        · hidden → [숨김, 공개, 닫힘]        (원상복귀 허용)
//    - 하단 CTA는 단일 "저장" 버튼 + 삭제.
//
// D) 분기 단순화 — 개발 용이성
//    - 룸 상세/이슈 상세의 Subscriber(Aspect 보유/미보유) 분기를 한 박스로 통합
//      ("보유하고 있다면 / 없다면" 함께 담고 버튼 라벨만 전환).
//    - 모집닫힘-Subscriber(Aspect 없음/보유) 분기 제거 — 같은 안내이므로 하나로.
//    - join-aspect의 교집합 0/1/2+ 분기(3화면)를 단일 화면으로 통합.
//    - aspect-add의 "룸 댓글 시도 진입" 제거 → join-aspect와 기능 중복.
//      aspect-add는 마이페이지 전역 정체성 관리 용도로만 사용.
//    - join-aspect에서 "~관점으로 말합니다" 설명 문구 제거 — 플랫폼이
//      Aspect의 '관점'을 정의하는 인상 방지.
// ============================================================

// ============================================================
// v9.6 — 드래프트 (v9.7로 확정됨, 위 항목 참조)
// ============================================================

// ============================================================
// v9.5 — 룸 라이프사이클 도입 + 비공개 룸 제외
// v9.4 기준에서:
//
// - rooms.public boolean 제거. lifecycle_status enum 도입:
//   draft → public → archived (단방향 전이).
// - draft: 룸 세팅 + 멤버 모집만. 이슈 발행 불가. 외부 비노출.
// - public: 정상 운영. 룸 목록/피드/이슈 목록에 노출.
// - archived: 운영 종료. 운영자·멤버만 읽기 가능. 외부 숨김.
// - 비공개 운영 룸은 MVP에서 의도적 제외.
// - 이슈 단위 공개/비공개 토글도 제외.
// - RoomSettingsScreen: "공개 상태" 토글 → 라이프사이클 전환 UI
//   (draft→public 버튼, public→archived 버튼, 각각 설명 텍스트).
//   시연 상태를 "draft"와 "public" 두 가지로 분리.
// ============================================================

// ============================================================
// v9.4 — 초대 토큰 모델 단순화
// v9.3 기준에서:
//
// - "사용자 계정에 초대 이력을 남기지 않는다"로 결정.
//   초대 토큰은 URL에만 존재하고, 유저-초대 관계 테이블 없음.
// - 따라서 "모집닫힘-Subscriber(초대+Aspect)" 상태 삭제.
//   룸 상세 화면에서 "나는 이 룸에 초대받았다"를 판단할 수 없음.
// - 초대의 유일한 진입점은 invite-landing 화면. 거기서 가입·
//   Aspect 추가·membership 생성까지 한 흐름으로 처리.
// - 토큰 소진 시점은 "membership 생성"까지 완료된 순간. 도중에
//   이탈해도 유효 기간(7일) 내에는 같은 URL로 재진입 가능.
//   이미 가입된 유저가 URL을 클릭하면 초대 랜딩을 거쳐 바로
//   Aspect 추가 → membership 생성 단계로.
// - 룸 상세의 "모집 닫힘" 안내는 단일 케이스로 단순화.
// ============================================================

// ============================================================
// v9.3 — 초대 링크 의미 재정의 + 멤버 공유 기능 제거
// v9.2 기준에서:
//
// - 초대 링크의 역할을 "모집 닫힘을 뚫는 화이트리스트"로 명확화.
//   일반 규칙: (모집중 AND Aspect 맞음) → 즉시 참여.
//   예외 규칙: (모집닫힘 AND Aspect 맞음 AND 유효한 초대 링크)
//             → 즉시 참여. 운영자가 아는 사람만 선별적으로 받는
//             시나리오가 여기로 수렴.
// - 1:1 초대 링크는 "모집 닫힘" 상태에서만 생성/노출. 모집중일
//   때는 초대 섹션 자체가 숨음(불필요).
// - 공유용 초대 링크(5회용), 멤버의 "지인에게 공유" 버튼, 그리고
//   "모집중-Member(공유가능)" 상태 전부 삭제. 멤버가 링크를
//   뿌리는 경로는 완전히 사라짐.
// - 룸 상단 "공유" 버튼은 OS 기본 공유 시트(URL 복사)로 단순화.
// - 초대 랜딩 화면은 유지. "모집 닫힌 룸에 초대받은 사람"에게
//   맥락을 전달하는 유일한 화면이 됨.
// ============================================================

// ============================================================
// v9.2 — "모집 닫힘" 상태 복원 (참여 모델 정합성)
// v9.1 기준에서 작은 정합성 수정:
//
// - v9.1에서 "모집 중" 배지를 삭제하면서, 운영자의 "현재 새
//   멤버를 받지 않는다" 선택권이 함께 사라졌다. 이건 과잉 삭제.
// - 규칙을 다시 정리하면: (모집 열림 AND Aspect 맞음) 일 때만
//   즉시 참여 가능. 둘 중 하나라도 빠지면 참여 불가.
// - "모집 닫힘" 상태에서는 Aspect가 있어도 버튼 자체가 뜨지
//   않고, "현재 멤버 모집이 닫혀 있어요" 안내만 표시.
// - 룸 목록 카드에는 "모집 중" 배지를 다시 표시(기본은 숨김).
// - 이슈 상세의 Subscriber 댓글 입력 영역도 "모집 닫힘" 분기
//   하나 추가.
//
// v9.1의 핵심 원칙(참여 모델 일원화, Aspect 4레이어)은 유지.
// ============================================================

// ============================================================
// v9.1 — Aspect 모델 정리 + 참여 모델 일원화
// v9 기준(=구 v8.2)에서 두 가지 핵심 정리:
//
// A) 참여 모델 일원화 — Aspect-gated direct join
//    - 룸 허용 Aspect를 가진 Subscriber는 초대 없이 바로 Member.
//    - 초대 링크는 "발견 장치"이지 "자격 장치"가 아님.
//    - 자기 신고 Aspect = 참여 자격.
//
// B) Aspect 4레이어 분리
//    - user_aspects           : 유저 전역 보유 (자기 신고)
//    - room_allowed_aspects   : 룸이 허용 (운영자 설정, 최대 3)
//    - membership.active_aspect : 이 룸에서 "지금 말하는" 정체성
//                                 (룸 가입 시 선택, 나중에 변경 가능)
//    - comment.aspect_snapshot: 댓글 작성 시점 기록(영구 보존)
//
// C) 신규 화면: 룸 참여 — Aspect 선택
//    - 교집합 2+ 일 때 "어떤 정체성으로 참여할지" 선택.
//    - 교집합 1개면 자동 선택, 교집합 0이면 Aspect 추가로 유도.
//
// D) "주력" vs "active aspect" 개념 분리 (※ v9.8에서 '주력' 개념은 일단 제거됨)
//    - [과거 기록] 프로필의 주력은 전역 활동 기반 자동 계산.
//    - 룸별 active_aspect는 멤버십마다 따로 저장.
//    - 프로필/마이페이지에 둘을 구분해 노출.
// ============================================================

const SCREENS = [
  { id: "feed", label: "내 피드(홈)", group: "user" },
  { id: "issues", label: "이슈 목록", group: "user" },
  { id: "rooms", label: "룸 목록", group: "user" },
  { id: "room", label: "룸 상세", group: "user" },
  { id: "issue", label: "이슈 상세", group: "user" },
  { id: "mypage", label: "마이페이지", group: "user" },
  { id: "profile", label: "프로필", group: "user" },
  // [v9.8] 프로필 입력/수정 화면. 편집 가능한 필드(닉네임·한 줄 소개·아바타)만
  // 다루고, 정체성·주력·통계는 읽기 전용으로 안내.
  { id: "profile-edit", label: "프로필 편집", group: "user" },
  { id: "invite-landing", label: "초대 랜딩", group: "user" },
  { id: "aspect-add", label: "Aspect 추가", group: "user" },
  { id: "join-aspect", label: "룸 참여(Aspect 선택)", group: "user" },
  { id: "room-settings", label: "룸 설정", group: "operator" },
  { id: "issue-publish", label: "이슈 발행/수정", group: "operator" },
  { id: "rep-comment", label: "대표 댓글 지정", group: "operator" },
  // [v9.6] 운영자 사임/종료 요청 — 소유권 재정의에 따라 신설
  { id: "operator-sign-off", label: "운영 사임/종료 요청", group: "operator" },
];

const STATES = {
  feed: ["기본", "구독 룸 없음(Empty)"],
  // [v9.8] 정렬 시연 상태만 유지. Aspect 필터는 MVP에서 제외(v9.8 D).
  issues: ["기본", "정렬: 진행 중", "스포일러 포함 이슈", "이슈 없음(Empty)"],
  rooms: ["Visitor", "Subscriber"],
  // [v9.6] 분기 단순화:
  //   · 모집중-Subscriber(Aspect 없음/보유)는 하나의 UI로 통합되므로 시연은 두 케이스
  //     모두 유지(같은 화면이 양쪽 조건에 잘 맞는지 확인용).
  //   · 모집닫힘-Subscriber는 Aspect 유무 무관 → 하나로 통합.
  //   · archived-Member/Operator 추가. 외부(Visitor/Subscriber)는 도달 불가로 제외.
  room: ["모집중-Visitor", "모집중-Subscriber(Aspect 없음)", "모집중-Subscriber(Aspect 보유)", "모집중-Member", "모집중-Operator", "모집닫힘-Visitor", "모집닫힘-Subscriber", "모집닫힘-Member", "모집닫힘-Operator", "archived-Member", "archived-Operator"],
  // [v9.6] 이슈 상세도 Subscriber(Aspect 없음/보유)를 하나의 "Subscriber"로 통합.
  //   다만 Aspect 보유 여부는 실제 렌더링 데이터에 영향 주므로 시연용으로 남겨두되
  //   동일한 카피/레이아웃이 양쪽에 적용됨을 확인할 수 있게 두 state를 유지.
  //   모집 닫힘 Subscriber도 별도 state로 유지 (모집 상태에 따라 CTA 자체가 달라짐).
  issue: ["Visitor", "Subscriber(Aspect 없음)", "Subscriber(Aspect 보유)", "Subscriber(모집 닫힘)", "Member/Operator", "대표 댓글 없음"],
  mypage: ["룸 탭", "이슈 탭", "댓글 탭", "정체성 탭", "구독 없음(Empty)"],
  profile: ["내 프로필", "다른 사용자 프로필"],
  // [v9.8] 프로필 편집 화면 상태:
  //   '기본' — 기존 값이 프리필된 상태
  //   '닉네임 중복' — 닉네임 검증 실패 에러 노출
  //   '저장 중' — 저장 CTA를 비활성 + 진행 힌트로 전환
  "profile-edit": ["기본", "닉네임 중복", "저장 중"],
  "invite-landing": ["유효", "만료", "이미 멤버"],
  // [v9.6] aspect-add: '룸 댓글 시도 진입' 케이스 제거 — join-aspect 화면과 기능이 중복됨.
  //   (join-aspect가 보유/미보유 Aspect를 한 화면에서 처리하므로, 룸 참여 흐름의 진입점은
  //    모두 join-aspect로 통일. aspect-add는 마이페이지에서 전역 정체성을 관리하는 용도만.)
  "aspect-add": ["마이페이지 직접 추가"],
  // [v9.6] join-aspect 단순화: 교집합 0/1/2+ 분기 제거. 한 화면에서 모두 처리.
  //   보유 Aspect가 있으면 즉시 선택 가능, 없으면 Aspect 추가 유도 버튼을 함께 표시.
  "join-aspect": ["기본"],
  // [v9.6] 룸 설정: draft / public / public(종료 요청 중) / archived 4상태.
  "room-settings": ["draft 상태", "public 상태", "public 상태(종료 요청 중)", "archived 상태"],
  // [v9.6] 이슈 발행 — 상태 선택 UI (명시적 라디오 그룹).
  //   - 새 이슈            : 초안 ↔ 공개 중 선택
  //   - 공개된 이슈 수정   : 공개 / 닫힘 / 숨김 선택 가능 (초안 비활성)
  //   - 닫힌 이슈 수정     : 닫힘 / 숨김 선택 가능 (닫힘→공개 불가)
  //   - 숨긴 이슈 수정     : 숨김 / 공개 / 닫힘 선택 가능 (다시 공개 허용)
  //   - 초안 이슈 편집     : 초안 / 공개 선택 가능
  "issue-publish": ["새 이슈", "초안 편집", "공개 이슈 수정", "닫힌 이슈 수정", "숨긴 이슈 수정"],
  "rep-comment": ["기본"],
  // [v9.6 신규] 운영 사임/종료 요청
  "operator-sign-off": ["사임(이양 요청)", "운영 종료 요청"],
};

function Badge({ text, color }) {
  const C = { blue: { bg: "#E6F1FB", t: "#185FA5", b: "#85B7EB" }, green: { bg: "#EAF3DE", t: "#3B6D11", b: "#97C459" }, gray: { bg: "#F1EFE8", t: "#5F5E5A", b: "#B4B2A9" }, amber: { bg: "#FAEEDA", t: "#854F0B", b: "#EF9F27" }, purple: { bg: "#EEEDFE", t: "#534AB7", b: "#AFA9EC" }, teal: { bg: "#E1F5EE", t: "#0F6E56", b: "#5DCAA5" }, red: { bg: "#FCEBEB", t: "#A32D2D", b: "#F09595" }, coral: { bg: "#FAECE7", t: "#993C1D", b: "#F0997B" } };
  const c = C[color] || C.gray;
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: c.bg, color: c.t, border: `1px solid ${c.b}` }}>{text}</span>;
}

// [v8.2] Aspect 칩 — 댓글/룸 정보/프로필에서 사용.
// 현재는 직업/전문성 카테고리(blue)만. 추후 라이프스테이지·소유/경험은 다른 색상으로 확장 가능.
function AspectChip({ text, size }) {
  const sm = size === "sm";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      padding: sm ? "1px 7px" : "2px 9px",
      borderRadius: 999,
      fontSize: sm ? 10 : 11,
      fontWeight: 600,
      background: "#E6F1FB",
      color: "#185FA5",
      border: "1px solid #85B7EB",
      lineHeight: 1.4,
    }}>
      <span style={{ fontSize: sm ? 8 : 9, opacity: 0.7 }}>◇</span>{text}
    </span>
  );
}

// [v9.8 G] 글로벌 내비게이션 교체.
//   - 하단 탭 바 제거.
//   - 상단에 공통 헤더(좌측 아이콘 + 중앙 타이틀 + 우측 여백).
//     좌측 아이콘은 'hamburger' 또는 'back' — isDetail prop으로 전환.
//   - 햄버거 탭 → 좌측 드로어(280px) 슬라이드. 백드롭 클릭 시 닫힘.
//   - 드로어 안에 기존 GNB 4항목(피드/이슈/룸/마이페이지) + 보조(프로필 편집).
//   - activeScreen prop으로 현재 화면을 표시.
//   - onScreenChange(id) 콜백으로 상위 상태 변경.
function Phone({
  children,
  activeScreen,
  onScreenChange,
  isDetail,
  screenTitle,
  exportMode = false,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);
  const go = (id) => {
    if (onScreenChange) onScreenChange(id);
    closeDrawer();
  };

  // 드로어 메인 링크 정의 — 기존 하단 GNB 4항목 그대로 이관.
  const mainLinks = [
    { id: "feed",   icon: "⌂", label: "피드" },
    { id: "issues", icon: "☰", label: "이슈" },
    { id: "rooms",  icon: "◉", label: "룸" },
    { id: "mypage", icon: "⊕", label: "마이페이지" },
  ];
  // 보조 링크 — 자주 쓰는 보조 진입점.
  const subLinks = [
    { id: "profile-edit", icon: "✎", label: "프로필 편집" },
  ];

  const renderLeftIcon = () => {
    if (isDetail) {
      // 상세/편집 화면: ← 백 아이콘. 클릭 동작은 브라우저 history.back에 해당하지만
      // 와이어프레임에선 데모 단순화를 위해 피드로 돌려보내 둔다(기능 증명보다 형태 증명).
      return (
        <span
          onClick={() => go("feed")}
          style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#2C2C2A", cursor: "pointer", userSelect: "none" }}
          aria-label="back"
        >‹</span>
      );
    }
    // 허브 화면: 햄버거
    return (
      <span
        onClick={openDrawer}
        style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#2C2C2A", cursor: "pointer", userSelect: "none" }}
        aria-label="menu"
      >≡</span>
    );
  };

  return (
    <div style={{ width: 375, minHeight: exportMode ? "auto" : 700, background: "#fff", borderRadius: 32, border: "2px solid #D3D1C7", overflow: exportMode ? "visible" : "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", flexShrink: 0, position: "relative" }}>

      {/* Status bar (notch) */}
      <div style={{ height: 44, background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #EEEDEA", flexShrink: 0 }}>
        <div style={{ width: 100, height: 6, background: "#D3D1C7", borderRadius: 3 }} />
      </div>

      {/* [v9.8 G] 공통 헤더 */}
      <div style={{
        height: 48,
        background: "#fff",
        borderBottom: "1px solid #EEEDEA",
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        flexShrink: 0,
      }}>
        {renderLeftIcon()}
        <div style={{ flex: 1, textAlign: "center", fontSize: 14, fontWeight: 600, color: "#2C2C2A", letterSpacing: "-0.01em" }}>
          {/* 허브 화면은 각 화면 내부에 자체 h1이 있어 중앙 타이틀 생략.
              상세 화면만 screenTitle 노출. */}
          {isDetail ? (screenTitle || "") : ""}
        </div>
        <div style={{ width: 40 }} /> {/* 좌우 대칭용 스페이서 */}
      </div>

      {/* Body */}
      <div style={{ flex: exportMode ? "0 0 auto" : 1, overflow: exportMode ? "visible" : "auto", position: "relative" }}>
        {children}

        {/* Drawer backdrop — Phone 내부에 두어서 기기 경계 밖으로 넘치지 않게 */}
        {drawerOpen && (
          <div
            onClick={closeDrawer}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(28, 28, 26, 0.4)",
              zIndex: 20,
              animation: "pivitFade .15s ease-out",
            }}
          />
        )}

        {/* Drawer panel */}
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: 0,
          width: 280,
          background: "#fff",
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform .22s ease-out",
          zIndex: 21,
          boxShadow: drawerOpen ? "4px 0 24px rgba(0,0,0,0.12)" : "none",
          display: "flex", flexDirection: "column",
        }}>
          {/* Drawer 상단: 유저 프로필 요약 */}
          <div style={{ padding: "18px 18px 14px", borderBottom: "1px solid #EEEDEA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#534AB7", fontWeight: 700 }}>K</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#2C2C2A" }}>@김해석</div>
                <div style={{ fontSize: 11, color: "#888780", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>프로덕트로 사람을 본다</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              <AspectChip text="PM" size="sm" />
              <AspectChip text="0~3세 부모" size="sm" />
              <AspectChip text="테슬라 오너" size="sm" />
            </div>
          </div>

          {/* Main links */}
          <div style={{ padding: "8px 0" }}>
            {mainLinks.map(l => {
              const active = activeScreen === l.id;
              return (
                <div
                  key={l.id}
                  onClick={() => go(l.id)}
                  style={{
                    padding: "10px 18px",
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer",
                    background: active ? "#F3F2FC" : "transparent",
                    borderLeft: `3px solid ${active ? "#534AB7" : "transparent"}`,
                  }}
                >
                  <span style={{ fontSize: 18, width: 20, textAlign: "center", color: active ? "#534AB7" : "#5F5E5A" }}>{l.icon}</span>
                  <span style={{ fontSize: 14, color: active ? "#534AB7" : "#2C2C2A", fontWeight: active ? 600 : 500 }}>{l.label}</span>
                </div>
              );
            })}
          </div>

          <div style={{ height: 1, background: "#EEEDEA", margin: "4px 18px" }} />

          {/* Sub links */}
          <div style={{ padding: "8px 0" }}>
            {subLinks.map(l => {
              const active = activeScreen === l.id;
              return (
                <div
                  key={l.id}
                  onClick={() => go(l.id)}
                  style={{
                    padding: "10px 18px",
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer",
                    background: active ? "#F3F2FC" : "transparent",
                    borderLeft: `3px solid ${active ? "#534AB7" : "transparent"}`,
                  }}
                >
                  <span style={{ fontSize: 15, width: 20, textAlign: "center", color: active ? "#534AB7" : "#888780" }}>{l.icon}</span>
                  <span style={{ fontSize: 13, color: active ? "#534AB7" : "#5F5E5A", fontWeight: active ? 600 : 500 }}>{l.label}</span>
                </div>
              );
            })}
          </div>

          {/* Drawer 하단 — 여백 차지용. 실제 서비스에선 설정·로그아웃이 여기에 올 자리. */}
          <div style={{ flex: 1 }} />
          <div style={{ padding: "14px 18px", borderTop: "1px solid #EEEDEA", fontSize: 11, color: "#B4B2A9" }}>
            PIVIT · v9.8
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ comments, upvotes, views, compact }) {
  const s = compact ? 11 : 12;
  return (<div style={{ display: "flex", alignItems: "center", gap: compact ? 8 : 12, fontSize: s, color: "#888780", marginTop: compact ? 4 : 8 }}><span style={{ display: "flex", alignItems: "center", gap: 3 }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3l1.5 3.3 3.5.5-2.5 2.5.6 3.5L8 11.1l-3.1 1.7.6-3.5L3 6.8l3.5-.5z" fill="#B4B2A9"/></svg>{upvotes}</span><span style={{ display: "flex", alignItems: "center", gap: 3 }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M2 2.5A1.5 1.5 0 013.5 1h9A1.5 1.5 0 0114 2.5v7a1.5 1.5 0 01-1.5 1.5H6l-3 3V11H3.5A1.5 1.5 0 012 9.5z" fill="#B4B2A9"/></svg>{comments}</span>{views !== undefined && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3C4.4 3 1.4 5.4.5 8c.9 2.6 3.9 5 7.5 5s6.6-2.4 7.5-5c-.9-2.6-3.9-5-7.5-5zm0 8.3A3.3 3.3 0 118 4.7a3.3 3.3 0 010 6.6zm0-5.3a2 2 0 100 4 2 2 0 000-4z" fill="#B4B2A9"/></svg>{views}</span>}</div>);
}

function StatusBadge({ status }) { if (status === "진행 중") return null; if (status === "종료") return <Badge text="종료" color="gray" />; return null; }
function SH({ children }) { return <div style={{ fontSize: 13, fontWeight: 600, color: "#5F5E5A", padding: "12px 16px 6px", background: "#FAFAF8" }}>{children}</div>; }
function RoomThumb({ size, color }) { const sz = size || 36; return <div style={{ width: sz, height: sz, borderRadius: sz > 30 ? 12 : 8, background: `linear-gradient(135deg, ${color || "#EEEDFE"} 60%, #D3D1C7 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: sz * 0.38, color: "#534AB7", fontWeight: 600, flexShrink: 0, overflow: "hidden" }}>◈</div>; }
function ImgPlaceholder({ h }) { return <div style={{ width: "100%", height: h || 180, background: "linear-gradient(135deg, #F1EFE8 0%, #E6E0FA 100%)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#888780", marginTop: 8 }}>첨부 이미지</div>; }

// ===== ISSUE CARDS =====
// [v8.2] 모든 카드에 roomAspects / repAspect 추가. 작성자 Aspect가 시선의 출처를 보여줌.
function BigIssueCard({ room, roomAspects, title, opLine, body, repNick, repAspect, repComment, status, comments, upvotes, views, hasImage }) {
  return (<div style={{ padding: "18px 16px", borderBottom: "6px solid #F1EFE8" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
      <div style={{ fontSize: 11, color: "#534AB7", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <RoomThumb size={20} />
        <span style={{ textDecoration: "underline", textDecorationColor: "#CEC8F6", textUnderlineOffset: 2 }}>{room}</span>
      </div>
      {roomAspects && roomAspects.map(a => <AspectChip key={a} text={a} size="sm" />)}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><span style={{ fontSize: 17, fontWeight: 700, color: "#2C2C2A", lineHeight: 1.35, flex: 1 }}>{title}</span><StatusBadge status={status} /></div>
    {opLine && <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 6, fontStyle: "italic" }}><span style={{ fontWeight: 500, fontStyle: "normal", color: "#888780" }}>운영자: </span>{opLine}</div>}
    <div style={{ fontSize: 13, color: "#444441", lineHeight: 1.55, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{body}</div>
    {hasImage && <ImgPlaceholder h={180} />}
    {repComment && (<div style={{ background: "#F9F9F6", padding: "12px 14px", borderRadius: 10, borderLeft: "3px solid #AFA9EC", marginTop: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#534AB7" }}>{repNick}</span>
        {repAspect && <AspectChip text={repAspect} size="sm" />}
        <Badge text="대표" color="purple" />
      </div>
      <div style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{repComment}</div>
    </div>)}
    <MetaRow comments={comments} upvotes={upvotes} views={views} />
  </div>);
}
// [v9.8 B] 카드 콘텐츠 재정의:
//   - 제거: 운영자 한 줄(opLine), 대표 댓글 한 줄(repShort + repNick/repAspect).
//     이전엔 "opLine이 본문 TL;DR 역할"이라 두었으나, 카드에서 바로 본문을 읽는 편이
//     '이 이슈가 무슨 이야기인지' 즉시 이해됨. 목록의 고유 가치를 본문 발췌로 재정의.
//   - 추가: body(본문). 썸네일 유무에 따라 clamp 줄 수 분기.
//       · 썸네일 없음: 5줄까지 (텍스트 중심 이슈의 맥락을 더 보여줌)
//       · 썸네일 있음: 3줄까지 (카드 높이가 썸네일 56px에 맞춰 조절)
// [v9.8 C] 썸네일은 그대로 유지. 스포일러는 썸네일 blur + 본문 자리에 간단한 안내.
// [v9.8]   종료 이슈는 opacity 0.68 + 옅은 배경으로 시각 후순위.
function CompactIssueCard({ room, roomAspects, title, body, status, comments, upvotes, views, isSpoiler, thumbUrl }) {
  const isClosed = status === "종료";
  const hasThumb = Boolean(thumbUrl);
  return (<div style={{
    padding: "12px 16px",
    borderBottom: "1px solid #EEEDEA",
    opacity: isClosed ? 0.68 : 1,
    background: isClosed ? "#FAFAF8" : "transparent",
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  }}>
    {/* 본문 영역 (텍스트) */}
    <div style={{ flex: 1, minWidth: 0 /* 텍스트 영역이 flex에서 줄 수 있게 */ }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
        <div style={{ fontSize: 11, color: "#534AB7", fontWeight: 600, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
          <RoomThumb size={14} />
          <span style={{ textDecoration: "underline", textDecorationColor: "#CEC8F6", textUnderlineOffset: 2 }}>{room}</span>
        </div>
        {roomAspects && roomAspects.map(a => <AspectChip key={a} text={a} size="sm" />)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", lineHeight: 1.3, flex: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{title}</span>
        {isSpoiler && <Badge text="스포" color="red" />}
        <StatusBadge status={status} />
      </div>
      {isSpoiler ? (
        <div style={{ fontSize: 12, color: "#B4B2A9", fontStyle: "italic", padding: "4px 0 6px" }}>스포일러 포함 · 탭하여 보기</div>
      ) : body ? (
        <div style={{
          fontSize: 13,
          color: "#5F5E5A",
          lineHeight: 1.55,
          marginBottom: 6,
          display: "-webkit-box",
          WebkitLineClamp: hasThumb ? 3 : 5,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          /* 텍스트 끝이 썸네일 아래로 너무 길어지지 않도록 최대 높이 가드 */
          maxHeight: hasThumb ? "calc(1.55em * 3)" : "calc(1.55em * 5)",
        }}>{body}</div>
      ) : null}
      <MetaRow comments={comments} upvotes={upvotes} views={views} compact />
    </div>

    {/* 우측 썸네일 슬롯 — thumbUrl 있을 때만 렌더. 없으면 이 블록 자체를 건너뛰어서
        텍스트가 가로 전체를 차지하도록 함. */}
    {hasThumb && (
      <div style={{
        width: 56,
        height: 56,
        borderRadius: 8,
        background: typeof thumbUrl === "string" && thumbUrl.startsWith("#")
          ? thumbUrl  /* 와이어프레임 시연: hex 문자열이면 색상 블록으로 사용 */
          : `#E6E3D8 url(${thumbUrl}) center/cover no-repeat`,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        border: "1px solid #EEEDEA",
      }}>
        {isSpoiler && (
          /* 스포일러 이슈: 탭 전 노출 금지 — 썸네일 블러 + 아이콘 */
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(250, 250, 248, 0.6)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "#A32D2D",
          }}>⚠</div>
        )}
      </div>
    )}
  </div>);
}
function RoomIssueCard({ title, opLine, repNick, repAspect, repShort, status, comments, upvotes, noRepYet }) {
  return (<div style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>{noRepYet && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#534AB7", flexShrink: 0 }} />}<span style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", lineHeight: 1.3, flex: 1 }}>{title}</span><StatusBadge status={status} /></div>
    {opLine && <div style={{ fontSize: 12, color: "#888780", marginBottom: 2, fontStyle: "italic" }}>운영자: {opLine}</div>}
    {repShort ? (
      <div style={{ fontSize: 12, color: "#5F5E5A", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        <span style={{ color: "#AFA9EC", fontSize: 10 }}>◆</span>
        {repNick && <span style={{ fontWeight: 600 }}>{repNick}</span>}
        {repAspect && <AspectChip text={repAspect} size="sm" />}
        <span>{repShort}</span>
      </div>
    ) : <div style={{ fontSize: 11, color: "#B4B2A9", fontStyle: "italic" }}>아직 대표 댓글 없음</div>}
    <MetaRow comments={comments} upvotes={upvotes} compact />
  </div>);
}
function Comment({ nick, aspect, text, upvotes, time, replies, isRep }) {
  return (<div style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#444441" }}>{nick}</span>
        {aspect && <AspectChip text={aspect} size="sm" />}
        {isRep && <Badge text="대표" color="purple" />}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 11, color: "#B4B2A9" }}>{time}</span><span style={{ fontSize: 11, color: "#B4B2A9" }}>⚑</span></div>
    </div>
    <div style={{ fontSize: 14, color: "#444441", lineHeight: 1.5 }}>{text}</div>
    <div style={{ marginTop: 8, display: "flex", gap: 14, fontSize: 12, color: "#888780" }}><span>▲ {upvotes}</span><span>↩ 답글</span><span>⊞ 스크랩</span></div>
    {replies && replies.length > 0 && (<div style={{ marginTop: 8, marginLeft: 16, borderLeft: "2px solid #EEEDEA", paddingLeft: 12 }}>{replies.map((r, i) => (<div key={i} style={{ paddingBottom: 8, marginBottom: i < replies.length - 1 ? 8 : 0, borderBottom: i < replies.length - 1 ? "1px solid #F1EFE8" : "none" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#5F5E5A" }}>{r.nick}</span>
          {r.aspect && <AspectChip text={r.aspect} size="sm" />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 11, color: "#B4B2A9" }}>{r.time}</span><span style={{ fontSize: 11, color: "#B4B2A9" }}>⚑</span></div>
      </div>
      <div style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.45 }}>{r.text}</div>
      <div style={{ marginTop: 4, display: "flex", gap: 12, fontSize: 11, color: "#B4B2A9" }}><span>▲ {r.upvotes}</span><span>↩ 답글</span><span>⊞ 스크랩</span></div>
    </div>))}</div>)}
  </div>);
}

// ========= SCREENS =========
function SubscribedRoomBar() {
  const rooms = [{ name: "AI 프로덕트", color: "#E6F1FB" }, { name: "테슬라 오너", color: "#FAEEDA" }, { name: "0~3세 육아", color: "#E1F5EE" }];
  return (<div style={{ padding: "10px 16px", borderBottom: "1px solid #EEEDEA", display: "flex", alignItems: "center", gap: 10 }}>{rooms.map((r, i) => (<div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}><RoomThumb size={36} color={r.color} /><span style={{ fontSize: 10, color: "#888780" }}>{r.name}</span></div>))}<div style={{ fontSize: 11, color: "#B4B2A9", marginLeft: "auto" }}>3개 룸 구독 중</div></div>);
}

function FeedScreen({ state }) {
  if (state === "구독 룸 없음(Empty)") return (<div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📭</div><div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A", marginBottom: 8 }}>아직 구독한 룸이 없습니다</div><div style={{ fontSize: 13, color: "#888780", marginBottom: 20, lineHeight: 1.5 }}>관심 있는 룸을 구독하면<br />이슈와 반응이 여기에 모입니다</div><div style={{ display: "inline-block", padding: "10px 24px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>룸 둘러보기</div></div>);
  return (<div>
    <div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>내 피드</div>
    <SubscribedRoomBar />
    <BigIssueCard
      room="AI 프로덕트 룸"
      roomAspects={["PM", "개발자"]}
      title="OpenAI Agent SDK, 프로덕트에 어떻게 적용할까"
      opLine="기술보다 워크플로우 설계가 핵심"
      body="이번 SDK는 단순한 API 래퍼가 아니라 에이전트 오케스트레이션 패턴을 제시합니다. 프로덕트 관점에서 어떤 부분을 먼저 적용할 수 있을지 논의해봅시다."
      repNick="@김PM" repAspect="PM"
      repComment="툴 자체보다 '어떤 사용자 태스크를 에이전트에게 위임할 것인가'를 먼저 정의해야 합니다. 저희 팀은 데이터 정리와 리포트 생성부터 시작했는데, 사용자가 결과를 검토할 수 있는 지점을 명확히 둔 게 핵심이었어요."
      status="진행 중" comments={24} upvotes={47} views={312} hasImage
    />
    <BigIssueCard
      room="테슬라 오너 룸"
      roomAspects={["테슬라 오너"]}
      title="겨울철 주행거리 체감, 다들 어느 정도인가요"
      opLine="공식 수치보다 실제 체감 위주로"
      body="영하권에 들어서면서 1회 충전 주행거리가 눈에 띄게 줄었습니다. 모델별, 연식별로 어느 정도 체감하시는지 공유해주세요."
      repNick="@모델Y오너" repAspect="테슬라 오너"
      repComment="모델Y 롱레인지 2023년식 기준으로, 영상 10도일 때 450km 정도였는데 영하 5도에서는 320km 수준으로 떨어집니다. 장거리 갈 때는 슈퍼차저 한 번 더 들르는 걸 계산에 넣고 있어요."
      status="진행 중" comments={31} upvotes={62} views={487} hasImage
    />
    <BigIssueCard
      room="0~3세 육아 룸"
      roomAspects={["0~3세 부모"]}
      title="18개월, 갑자기 밤잠 설치는데 이유가 뭘까요"
      opLine="발달 단계 vs 환경 요인"
      body="잘 자던 아이가 최근 일주일째 새벽에 두세 번씩 깹니다. 비슷한 시기 겪으신 분들 계신가요?"
      repNick="@두돌맘" repAspect="0~3세 부모"
      repComment="18개월쯤 수면 퇴행이 흔합니다. 분리불안이 심해지는 시기와 겹치면 더 그래요. 환경 바꾸기보다 안정감을 주는 루틴(같은 책, 같은 자장가)을 일주일 정도 유지하니 좋아졌습니다."
      status="종료" comments={18} upvotes={35} views={198}
    />
  </div>);
}

function IssueListScreen({ state }) {
  // [v9.8] 시연용 상태 분기.
  //   '정렬: 진행 중'은 sort='active'로 '종료' 이슈를 걸러낸 결과를 보여줌.
  //   나머지는 기본값(sort='latest').
  //   Aspect 필터는 MVP에서 제외(v9.8 D) — 관련 상태/UI/로직 없음.
  const [sort, setSort] = useState(state === "정렬: 진행 중" ? "active" : "latest");
  const [sortOpen, setSortOpen] = useState(false);

  if (state === "이슈 없음(Empty)") return <div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>아직 공개된 이슈가 없습니다</div></div>;
  const sp = state === "스포일러 포함 이슈";

  // [v9.8 B] 카드 콘텐츠가 '본문 발췌' 중심으로 바뀜.
  //   - opLine / repShort / repNick / repAspect 필드 제거.
  //   - body: 이슈 본문 앞부분. 썸네일 유무에 따라 3~5줄 clamp.
  //   - thumbUrl: 선택적(있으면 56×56 우측 슬롯).
  //   - hasRep: '대표 댓글 있는' 정렬을 위해 남겨둔 가벼운 플래그(실 구현은 서버 필드).
  const allIssues = [
    {
      room: "AI 프로덕트 룸", roomAspects: ["PM", "개발자"],
      title: "OpenAI Agent SDK, 프로덕트에 어떻게 적용할까",
      body: "이번 SDK는 단순한 API 래퍼가 아니라 에이전트 오케스트레이션 패턴을 제시합니다. tool use, streaming, 중간 상태 노출까지 — 팀이 프로덕트에 녹이려면 어떤 의사결정을 먼저 해야 하는지 함께 정리해봅시다. 특히 'PM이 정의한 태스크 범위'와 '개발자가 구현 가능한 범위' 사이의 간극을 좁히는 일이 가장 까다롭습니다.",
      status: "진행 중", comments: 28, upvotes: 53, views: 421,
      _recency: 0, thumbUrl: "#CEC8F6", hasRep: true,
    },
    ...(sp ? [{
      room: "0~3세 육아 룸", roomAspects: ["0~3세 부모"],
      title: "어린이집 적응기, 우리 아이 사례",
      isSpoiler: true,
      status: "진행 중", comments: 45, upvotes: 89, views: 670,
      _recency: 1, thumbUrl: "#F5D7C4", hasRep: true,
    }] : []),
    {
      room: "테슬라 오너 룸", roomAspects: ["테슬라 오너"],
      title: "겨울철 주행거리, 어느 정도 체감하시나요",
      body: "영하권에 들어서면서 1회 충전 주행거리가 눈에 띄게 줄었습니다. 모델별·연식별로 어느 정도 체감하시는지 공유해주세요. 공식 EPA 수치보다는 실제 겨울 운행에서 나오는 체감 숫자 위주로 모아보려 합니다.",
      status: "진행 중", comments: 24, upvotes: 47, views: 312,
      _recency: 2, thumbUrl: "#D8E5F1", hasRep: true,
    },
    /* 썸네일 없는 이슈 — 본문이 5줄까지 확장되는지 확인용 */
    {
      room: "AI 프로덕트 룸", roomAspects: ["PM", "개발자"],
      title: "LLM 프로덕트 평가 지표, 무엇을 기준으로 삼나요",
      body: "정답이 없는 생성 결과를 어떻게 '좋다/나쁘다'로 판단할지가 어렵습니다. 사내에서는 휴먼 리뷰 샘플링 + 사용자 피드백 로그 + 태스크 성공률 3축으로 임시 기준을 만들어두었는데, 다들 어떤 방식으로 접근하시는지 궁금합니다. 오프라인 벤치마크는 프로덕트 성능과 잘 맞지 않더라고요.",
      status: "진행 중", comments: 12, upvotes: 19, views: 180,
      _recency: 3, hasRep: false,
    },
    {
      room: "0~3세 육아 룸", roomAspects: ["0~3세 부모"],
      title: "18개월, 갑자기 밤잠 설치는데 이유가 뭘까요",
      body: "잘 자던 아이가 최근 일주일째 새벽에 두세 번씩 깹니다. 비슷한 시기 겪으신 분들 계신가요? 어린이집 적응과 시기가 겹쳐 원인을 분리해보기가 어려워요.",
      status: "종료", comments: 18, upvotes: 35, views: 198,
      _recency: 4, hasRep: true,
    },
  ];

  // [v9.8] 정렬.
  //   - latest: 최신(이 데모에선 _recency 오름차순)
  //   - hot   : 반응 많은(upvotes 내림차순)
  //   - rep   : 대표 댓글 있는 이슈 우선(hasRep 플래그)
  //   - active: 진행 중만(종료 이슈 제외)
  const sorted = (() => {
    if (sort === "hot") return [...allIssues].sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
    if (sort === "rep") return [...allIssues].sort((a, b) => (b.hasRep ? 1 : 0) - (a.hasRep ? 1 : 0));
    if (sort === "active") return allIssues.filter(i => i.status !== "종료");
    return [...allIssues].sort((a, b) => a._recency - b._recency);
  })();

  const sortLabel = { latest: "최신", hot: "반응 많은", rep: "대표 댓글 있는", active: "진행 중" }[sort];

  return (<div>
    <div style={{ padding: "14px 16px 6px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>최신 이슈</div>
    <div style={{ padding: "0 16px 10px", fontSize: 11, color: "#B4B2A9" }}>원하는 축으로 정렬해 탐색할 수 있어요</div>

    {/* [v9.8] 정렬 셀렉터 + 결과 개수 */}
    <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1EFE8", position: "relative" }}>
      <span style={{ fontSize: 12, color: "#888780" }}>
        전체 <span style={{ color: "#2C2C2A", fontWeight: 600 }}>{sorted.length}개</span>
      </span>
      <div style={{ position: "relative" }}>
        <span
          onClick={() => setSortOpen(o => !o)}
          style={{
            fontSize: 12,
            color: "#534AB7",
            fontWeight: 600,
            cursor: "pointer",
            padding: "4px 8px",
            borderRadius: 6,
            border: "1px solid #E6E0FA",
            background: "#FCFBFF",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {sortLabel} <span style={{ fontSize: 9 }}>▾</span>
        </span>
        {sortOpen && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: "#fff",
            border: "1px solid #E6E0FA",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(83, 74, 183, 0.08)",
            minWidth: 130,
            zIndex: 10,
            overflow: "hidden",
          }}>
            {[
              { k: "latest", l: "최신" },
              { k: "hot", l: "반응 많은" },
              { k: "rep", l: "대표 댓글 있는" },
              { k: "active", l: "진행 중" },
            ].map(o => (
              <div
                key={o.k}
                onClick={() => { setSort(o.k); setSortOpen(false); }}
                style={{
                  padding: "8px 12px",
                  fontSize: 12,
                  color: sort === o.k ? "#534AB7" : "#5F5E5A",
                  fontWeight: sort === o.k ? 600 : 400,
                  background: sort === o.k ? "#F3F2FC" : "#fff",
                  cursor: "pointer",
                  borderBottom: "1px solid #F1EFE8",
                }}
              >
                {o.l}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

    {/* 결과 리스트 */}
    {sorted.length > 0 ? sorted.map((iss, i) => (
      <CompactIssueCard key={i} {...iss} />
    )) : (
      <div style={{ padding: "40px 24px", textAlign: "center", color: "#888780", fontSize: 13 }}>
        조건에 맞는 이슈가 없습니다
      </div>
    )}
  </div>);
}

// [v9.2] 룸 목록 — "모집 중" 배지 복원. 단 의미는 바뀜:
//   v8 이전: "신청 받는 중"
//   v9.2: "Aspect 맞으면 바로 참여 가능한 상태"
// 기본은 모집 중으로 노출. 모집 닫힘 룸은 배지 없음(표시 자체를 생략).
function RoomListScreen({ state }) {
  const rooms = [
    { name: "AI 프로덕트 룸", aspects: ["PM", "개발자"], desc: "프로덕트 관점에서 AI를 봅니다", isOpen: true, issues: 18, subs: 156, members: 42 },
    { name: "테슬라 오너 룸", aspects: ["테슬라 오너"], desc: "실사용 경험을 모읍니다", isOpen: true, issues: 12, subs: 84, members: 31 },
    { name: "0~3세 육아 룸", aspects: ["0~3세 부모"], desc: "지금 이 시기를 함께 지나는 사람들", isOpen: false, issues: 8, subs: 47, members: 22 },
  ];
  return (<div>
    <div style={{ padding: "14px 16px 4px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>공개 룸</div>
    <div style={{ padding: "4px 16px 12px", fontSize: 13, color: "#888780", lineHeight: 1.5 }}>같은 정체성을 가진 사람들의 시선으로 이슈를 봅니다</div>
    {rooms.map((r, i) => (
      <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid #EEEDEA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <RoomThumb size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#2C2C2A" }}>{r.name}</div>
            <div style={{ fontSize: 12, color: "#888780" }}>{r.desc}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          {r.aspects.map(a => <AspectChip key={a} text={a} />)}
          {r.isOpen && <Badge text="모집 중" color="teal" />}
        </div>
        <div style={{ fontSize: 11, color: "#B4B2A9", marginBottom: 8 }}>이슈 {r.issues}개 · 구독자 {r.subs}명 · 멤버 {r.members}명</div>
        <div style={{ flex: 1, padding: "8px 0", background: "#534AB7", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: "center" }}>{state === "Subscriber" ? "구독 중 ✓" : "구독하기"}</div>
      </div>
    ))}
  </div>);
}

// [v9.6] 룸 상세 변경점:
//   - archived 분기 추가: archived 룸은 외부(Visitor/Subscriber)에 숨겨지므로
//     멤버/운영자 시점만 시연. 모든 새 활동 CTA 제거, "자산 보존" 안내.
//     Member의 active_aspect 표기는 과거형("말했었어요").
//   - Subscriber(Aspect 보유/미보유) 분기 통합: 같은 안내 박스에서 양쪽 상황을
//     자연스럽게 담는 카피로 변경. 버튼만 현재 상황(보유/미보유)에 따라 바뀜.
//     두 시연 state는 버튼 라벨 차이 확인용으로 유지.
//
// 참여 규칙 (변함 없음):
//   모집중 AND Aspect 맞음  → 즉시 참여
//   모집닫힘                → 룸 상세에서는 항상 막힘. 초대 흐름은 invite-landing 전용.
//   archived               → 새 가입·구독 불가. 멤버·운영자만 읽기.
function RoomScreen({ state }) {
  const dashIdx = state.indexOf("-");
  const prefix = dashIdx >= 0 ? state.slice(0, dashIdx) : "모집중";
  const afterDash = dashIdx >= 0 ? state.slice(dashIdx + 1) : "Visitor";
  const isArchived = prefix === "archived";
  const isOpen = prefix === "모집중";
  const role =
    afterDash.startsWith("Subscriber") ? "Subscriber" :
    afterDash.startsWith("Member") ? "Member" :
    afterDash.startsWith("Operator") ? "Operator" : "Visitor";
  // Aspect 보유 여부 — 버튼 라벨만 바꿈. UI 구조는 동일.
  const hasAspect = afterDash === "Subscriber(Aspect 보유)";
  const isOp = role === "Operator";
  const isMember = role === "Member";
  const isSubscriber = role === "Subscriber";

  return (<div>
    {/* [v9.8 G] 공통 헤더가 ≡ 햄버거를 제공하므로 '← 뒤로' 제거.
                '공유'만 화면 액션으로 우측에 유지. */}
    <div style={{ padding: "10px 16px", display: "flex", justifyContent: "flex-end", alignItems: "center", borderBottom: "1px solid #EEEDEA" }}><span style={{ fontSize: 13, color: "#5F5E5A", fontWeight: 500, cursor: "pointer" }}>공유</span></div>

    {/* [v9.6] archived 상단 배너 — 운영 종료 사실을 명확히 */}
    {isArchived && (
      <div style={{ padding: "10px 16px", background: "#F1EFE8", borderBottom: "1px solid #D3D1C7", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#888780", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#5F5E5A" }}>운영이 종료된 룸입니다</div>
          <div style={{ fontSize: 11, color: "#888780", marginTop: 2, lineHeight: 1.4 }}>새 이슈 발행과 댓글 작성이 중단되었습니다. 기존 이슈와 반응은 계속 읽을 수 있습니다.</div>
        </div>
      </div>
    )}

    <div style={{ padding: "16px 16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <RoomThumb size={52} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#2C2C2A", marginBottom: 4 }}>AI 프로덕트 룸</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {isOpen && <Badge text="모집 중" color="teal" />}
            {isArchived && <Badge text="운영 종료" color="gray" />}
            <span style={{ fontSize: 11, color: "#B4B2A9" }}>구독자 156명 · 멤버 42명</span>
          </div>
        </div>
      </div>

      {/* Aspect 박스 — 룸 정체성 */}
      <div style={{ padding: "10px 12px", background: "#F5F9FD", borderRadius: 10, border: "1px solid #D6E6F3", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "#5F7B95", fontWeight: 600, marginBottom: 6 }}>이 룸의 시선</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <AspectChip text="PM" />
          <AspectChip text="개발자" />
        </div>
        <div style={{ fontSize: 11, color: "#888780", marginTop: 6, lineHeight: 1.4 }}>
          {isArchived ? "이 룸은 종료되었습니다. 과거 댓글의 정체성 표시는 그대로 보존됩니다." : "이 정체성을 가진 사람만 댓글을 작성할 수 있습니다"}
        </div>
      </div>

      <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 10 }}>프로덕트 관점에서 AI를 봅니다</div>

      {isMember || isOp ? (
        <div style={{ fontSize: 12, color: "#B4B2A9", padding: "6px 0", marginBottom: 8, cursor: "pointer" }}>▸ 룸 소개 보기</div>
      ) : (
        <div style={{ fontSize: 13, color: "#444441", background: "#F9F9F6", padding: "12px 14px", borderRadius: 10, lineHeight: 1.6, marginBottom: 12, whiteSpace: "pre-line" }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: "#888780", marginBottom: 6 }}>이 방은 이렇게 봅니다</div>
          {"• 기술 트렌드보다 프로덕트 의사결정 관점\n• 사용자 가치로 환산되지 않는 논의는 후순위"}
        </div>
      )}

      {/* CTA 영역 — 역할별 분기 */}
      {/* [v9.6] archived: 새 가입/구독 불가. 멤버·운영자는 읽기 전용 상태 표시만. */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {!isArchived && role === "Visitor" && (
          <div style={{ flex: 1, padding: "11px 0", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>구독하기</div>
        )}
        {!isArchived && isSubscriber && (
          <div style={{ flex: 1, padding: "11px 0", background: "#EEEDFE", color: "#534AB7", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>구독 중 ✓</div>
        )}
        {!isArchived && isMember && (
          <div style={{ flex: 1, padding: "11px 0", background: "#EEEDFE", color: "#534AB7", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>멤버 · 구독 중 ✓</div>
        )}
        {!isArchived && isOp && (
          <div style={{ flex: 1, padding: "11px 0", background: "#EEEDFE", color: "#534AB7", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>운영자 · 구독 중 ✓</div>
        )}
        {!isArchived && isMember && (
          <div style={{ padding: "11px 14px", border: "1px solid #D3D1C7", color: "#888780", borderRadius: 10, fontSize: 13, textAlign: "center" }}>멤버 탈퇴</div>
        )}
        {!isArchived && isOp && (
          <div style={{ padding: "11px 16px", background: "#F1EFE8", color: "#5F5E5A", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>운영하기</div>
        )}
        {/* archived: 읽기 전용 표시 */}
        {isArchived && isMember && (
          <div style={{ flex: 1, padding: "11px 0", background: "#F1EFE8", color: "#5F5E5A", borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: "center" }}>종료된 룸 · 읽기 전용</div>
        )}
        {isArchived && isOp && (
          <div style={{ flex: 1, padding: "11px 0", background: "#F1EFE8", color: "#5F5E5A", borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: "center" }}>운영 종료됨 · 자산 보존</div>
        )}
      </div>

      {/* [v9.6] Subscriber 안내 — Aspect 보유/미보유 통합 카피.
          같은 박스에 "보유하고 있다면 / 없다면"을 모두 담고, 버튼만 현 상황에 맞게 전환. */}
      {!isArchived && isSubscriber && isOpen && (
        <div style={{ marginTop: 10, padding: "12px 14px", background: "#F5F9FD", borderRadius: 10, border: "1px solid #D6E6F3" }}>
          <div style={{ fontSize: 12, color: "#185FA5", fontWeight: 600, marginBottom: 6 }}>이 룸은 다음 정체성을 가진 사람이 참여합니다</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
            <AspectChip text="PM" size="sm" />
            <AspectChip text="개발자" size="sm" />
          </div>
          <div style={{ fontSize: 11, color: "#5F5E5A", lineHeight: 1.55, marginBottom: 10 }}>
            해당 정체성을 보유하고 있다면 바로 멤버가 될 수 있고, 없다면 정체성을 추가한 뒤 참여할 수 있습니다. 정체성은 자기 신고 기반입니다.
          </div>
          <div style={{ display: "inline-block", padding: "9px 18px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            {hasAspect ? "PM으로 참여하기" : "정체성 추가하고 참여"}
          </div>
        </div>
      )}
      {/* 모집 닫힘 안내 — Aspect 유무 무관 */}
      {!isArchived && !isOpen && !isMember && !isOp && (
        <div style={{ marginTop: 10, padding: "12px 14px", background: "#FAFAF8", borderRadius: 10, border: "1px solid #EEEDEA" }}>
          <div style={{ fontSize: 12, color: "#5F5E5A", fontWeight: 600, marginBottom: 4 }}>현재 멤버 모집이 닫혀 있어요</div>
          <div style={{ fontSize: 11, color: "#888780", lineHeight: 1.5 }}>운영자가 멤버 모집을 일시적으로 닫아둔 상태입니다. 룸의 이슈와 반응은 계속 구독해서 볼 수 있어요.</div>
        </div>
      )}

      {/* Member의 active_aspect 표시 — 현재형 */}
      {isMember && !isArchived && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "#F3F2FC", borderRadius: 10, border: "1px solid #D9D5F5", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#5F5E9E", fontWeight: 600 }}>이 룸에서 나는</span>
            <AspectChip text="PM" size="sm" />
            <span style={{ fontSize: 11, color: "#5F5E9E" }}>으로 말하고 있어요</span>
          </div>
          <span style={{ fontSize: 11, color: "#534AB7", fontWeight: 600, cursor: "pointer" }}>변경</span>
        </div>
      )}
      {/* archived-Member: 변경 링크 없이 과거형 */}
      {isMember && isArchived && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "#F9F9F6", borderRadius: 10, border: "1px solid #EEEDEA", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "#888780", fontWeight: 600 }}>이 룸에서 나는</span>
          <AspectChip text="PM" size="sm" />
          <span style={{ fontSize: 11, color: "#888780" }}>으로 말했었어요</span>
        </div>
      )}
    </div>

    {isMember && !isArchived && (
      <div style={{ margin: "0 16px 8px", padding: "10px 14px", background: "#F9F9F6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#5F5E5A" }}>운영자에게 건의/제보</span>
        <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 600, cursor: "pointer" }}>보내기 →</span>
      </div>
    )}

    {/* 이슈 목록 */}
    {isMember || isOp ? (<>
      <SH>{isArchived ? "보존된 이슈" : "참여 가능한 이슈"}</SH>
      {!isArchived && <RoomIssueCard title="OpenAI Agent SDK, 프로덕트 적용 사례" opLine="기술보다 워크플로우 설계가 핵심" repShort="" status="진행 중" comments={28} upvotes={53} noRepYet />}
      <RoomIssueCard title="LLM 프로덕트의 평가 지표를 어떻게 잡을 것인가" opLine="정확도보다 사용자 신뢰" repNick="@김PM" repAspect="PM" repShort="태스크 완료율 + 사용자 수정 빈도..." status={isArchived ? "종료" : "진행 중"} comments={36} upvotes={71} />
      {!isArchived && <SH>지난 이슈</SH>}
      <RoomIssueCard title="GPT-4o 출시 후 우리 프로덕트의 변화" opLine="비용보다 응답 품질 변화 위주" repNick="@개발자L" repAspect="개발자" repShort="컨텍스트 처리 방식이 확연히 좋아져..." status="종료" comments={22} upvotes={41} />
    </>) : (<>
      <SH>대표 이슈</SH>
      <div style={{ margin: "0 16px 8px", padding: 14, border: "1.5px solid #AFA9EC", borderRadius: 12, background: "#FCFCFA" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>LLM 프로덕트의 평가 지표를 어떻게 잡을 것인가</div>
        <div style={{ fontSize: 12, color: "#5F5E5A", fontStyle: "italic", marginBottom: 6 }}>운영자: 정확도보다 사용자 신뢰</div>
        <div style={{ fontSize: 12, color: "#2C2C2A", background: "#F3F2FC", padding: "6px 10px", borderRadius: 6, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
          <span style={{ color: "#534AB7", fontWeight: 600, fontSize: 11 }}>대표</span>
          <span style={{ fontWeight: 600 }}>@김PM</span>
          <AspectChip text="PM" size="sm" />
          <span>태스크 완료율 + 사용자 수정 빈도...</span>
        </div>
        <MetaRow comments={36} upvotes={71} compact />
      </div>
      <SH>최신 이슈</SH>
      <RoomIssueCard title="OpenAI Agent SDK, 프로덕트 적용 사례" opLine="기술보다 워크플로우 설계가 핵심" repNick="@김PM" repAspect="PM" repShort="툴보다 사용자 태스크 정의가 먼저..." status="진행 중" comments={28} upvotes={53} />
      <RoomIssueCard title="GPT-4o 출시 후 우리 프로덕트의 변화" opLine="비용보다 응답 품질 변화 위주" repNick="@개발자L" repAspect="개발자" repShort="컨텍스트 처리 방식이 확연히 좋아져..." status="종료" comments={22} upvotes={41} />
    </>)}
  </div>);
}

// [v9.2] 이슈 상세 — 댓글 입력 영역에 "모집 닫힘" 분기 추가
function IssueDetailScreen({ state }) {
  const canComment = state === "Member/Operator";
  const isSubscriberNoAspect = state === "Subscriber(Aspect 없음)";
  const isSubscriberWithAspect = state === "Subscriber(Aspect 보유)";
  const isSubscriberClosed = state === "Subscriber(모집 닫힘)";
  const noRep = state === "대표 댓글 없음";
  const [sort, setSort] = useState("popular");
  return (<div>
    {/* [v9.8 G] 공통 헤더가 ‹ 백을 제공하므로 '← 룸으로' 제거.
                '공유'만 화면 액션으로 우측에 유지. */}
    <div style={{ padding: "10px 16px", display: "flex", justifyContent: "flex-end", borderBottom: "1px solid #EEEDEA" }}><span style={{ fontSize: 13, color: "#5F5E5A", fontWeight: 500, cursor: "pointer" }}>공유</span></div>
    <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <span style={{ padding: "3px 10px", background: "#EEEDFE", color: "#534AB7", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationColor: "#CEC8F6", textUnderlineOffset: 2 }}>AI 프로덕트 룸</span>
      <AspectChip text="PM" size="sm" />
      <AspectChip text="개발자" size="sm" />
    </div>
    <div style={{ padding: "12px 16px" }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: "#2C2C2A", lineHeight: 1.35, marginBottom: 6 }}>OpenAI Agent SDK, 프로덕트에 어떻게 적용할까</div>
      <div style={{ fontSize: 12, color: "#B4B2A9", marginBottom: 10 }}>2026.04.05</div>
      <div style={{ fontSize: 13, color: "#5F5E5A", fontStyle: "italic", marginBottom: 10, padding: "6px 0", borderBottom: "1px solid #F1EFE8" }}><span style={{ fontWeight: 500, fontStyle: "normal", color: "#888780" }}>운영자: </span>&quot;기술 자체보다 워크플로우 설계가 핵심&quot;</div>
      <div style={{ fontSize: 13, color: "#534AB7", background: "#F3F2FC", padding: "8px 12px", borderRadius: 8, marginBottom: 10, fontWeight: 500 }}>질문: 어떤 사용자 태스크를 가장 먼저 에이전트에게 위임할 수 있을까?</div>
      <div style={{ fontSize: 14, color: "#444441", lineHeight: 1.65, padding: "14px 0", borderTop: "1px solid #EEEDEA", borderBottom: "1px solid #EEEDEA" }}>이번 SDK는 단순한 API 래퍼가 아니라 에이전트 오케스트레이션 패턴을 제시합니다...<ImgPlaceholder h={100} /></div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #EEEDEA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 20, border: "1.5px solid #D3D1C7", fontSize: 13, fontWeight: 600, color: "#5F5E5A" }}>▲ 업보트 53</div>
          <div style={{ padding: "6px 10px", borderRadius: 20, border: "1.5px solid #D3D1C7", fontSize: 12, color: "#888780" }}>⊞ 스크랩</div>
          <div style={{ padding: "6px 10px", borderRadius: 20, border: "1.5px solid #D3D1C7", fontSize: 12, color: "#B4B2A9" }}>⚑ 신고</div>
        </div>
        <div style={{ fontSize: 12, color: "#B4B2A9" }}>댓글 28 · 조회 421</div>
      </div>
    </div>
    {!noRep && <div style={{ padding: "0 16px 12px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>대표 댓글</div>
      <div style={{ padding: "10px 14px", background: "#F3F2FC", borderRadius: 10, borderLeft: "3px solid #7F77DD" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#534AB7" }}>@김PM</span>
          <AspectChip text="PM" size="sm" />
          <Badge text="대표" color="purple" />
        </div>
        <div style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.5 }}>툴 자체보다 &apos;어떤 사용자 태스크를 에이전트에게 위임할 것인가&apos;를 먼저 정의해야 합니다...</div>
      </div>
    </div>}
    <div style={{ padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><SH>전체 댓글</SH><div style={{ display: "flex", gap: 4, fontSize: 12 }}>{[{ k: "popular", l: "인기순" }, { k: "latest", l: "최신순" }].map(s => (<span key={s.k} onClick={() => setSort(s.k)} style={{ padding: "4px 10px", borderRadius: 6, background: sort === s.k ? "#2C2C2A" : "#F1EFE8", color: sort === s.k ? "#fff" : "#888780", fontWeight: sort === s.k ? 600 : 400, cursor: "pointer" }}>{s.l}</span>))}</div></div>
    <Comment nick="@개발자L" aspect="개발자" text="구현 관점에서 streaming 처리와 tool use 핸들링이 가장 까다로웠습니다. 특히 중간 결과를 사용자에게 어떻게 보여줄지가 핵심." upvotes={12} time="2시간 전" replies={[{ nick: "@김PM", aspect: "PM", text: "동의합니다. 중간 상태 노출이 신뢰도에 직결되더라고요.", upvotes: 5, time: "1시간 전" }]} />
    <Comment nick="@PM박" aspect="PM" text="저희는 리서치 요약부터 시작했는데, 사용자가 결과를 검토하고 수정할 수 있는 지점을 명확히 둔 게 컸습니다." upvotes={8} time="3시간 전" replies={[]} />
    <div style={{ padding: "12px 16px", borderTop: "1px solid #EEEDEA", background: "#FAFAF8" }}>
      {canComment ? (
        /* Member: active_aspect로 작성한다는 힌트 표시 */
        <div>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <AspectChip text="PM" size="sm" />
            <span>으로 댓글 작성 중</span>
            <span style={{ marginLeft: "auto", color: "#534AB7", fontWeight: 600, cursor: "pointer" }}>변경</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, height: 38, border: "1px solid #D3D1C7", borderRadius: 10, padding: "0 12px", display: "flex", alignItems: "center", fontSize: 13, color: "#B4B2A9", background: "#fff" }}>댓글을 입력하세요...</div>
            <div style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #D3D1C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#888780", background: "#fff", flexShrink: 0 }}>📷</div>
            <div style={{ padding: "8px 14px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>작성</div>
          </div>
        </div>
      ) : (isSubscriberWithAspect || isSubscriberNoAspect) ? (
        /* [v9.6] Subscriber(Aspect 보유/미보유) 통합 UI.
           한 화면에서 양쪽 상황을 자연스럽게 담고, 버튼 라벨만 현재 상황에 맞게 전환. */
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 6 }}>이 룸은 다음 정체성을 가진 사람이 댓글을 작성합니다</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
            <AspectChip text="PM" />
            <AspectChip text="개발자" />
          </div>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 10, lineHeight: 1.5 }}>
            보유하고 있다면 바로 멤버가 되고, 없다면 정체성을 추가한 뒤 참여할 수 있습니다. 정체성은 자기 신고 기반입니다.
          </div>
          <div style={{ display: "inline-block", padding: "9px 20px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>
            {isSubscriberWithAspect ? "PM으로 참여하기" : "정체성 추가하고 참여"}
          </div>
        </div>
      ) : isSubscriberClosed ? (
        /* 모집 닫힘 — Aspect 유무와 관계없이 참여 불가 */
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#5F5E5A", fontWeight: 600, marginBottom: 6 }}>현재 이 룸은 멤버 모집이 닫혀 있어요</div>
          <div style={{ fontSize: 11, color: "#888780", lineHeight: 1.5 }}>운영자가 모집을 다시 열면 바로 참여할 수 있습니다.<br />이슈와 반응은 계속 구독해서 볼 수 있어요.</div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 13, color: "#888780", marginBottom: 8 }}>댓글은 멤버만 작성할 수 있습니다</div><div style={{ display: "inline-block", padding: "9px 20px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>이 룸 구독하러 가기</div></div>
      )}
    </div>
  </div>);
}

// ===== 프로필 =====
// [v8.2] 보유 Aspect 섹션 추가, 파일럿 룸 기준으로 데이터 재구성
// [v9.8 G] '← 뒤로 / 편집 →' 상단 바 제거. 공통 헤더가 ‹ 백 제공.
//          '편집' 액션은 프로필 정보 영역의 우측 상단에 작은 버튼으로 유지.
function ProfileScreen({ state }) {
  const isMe = state === "내 프로필";
  return (<div>
    <div style={{ padding: "24px 16px 16px", textAlign: "center", position: "relative" }}>
      {/* [v9.8 G] 내 프로필일 때만 우측 상단에 편집 버튼 */}
      {isMe && (
        <span style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: "6px 12px",
          fontSize: 12,
          color: "#534AB7",
          fontWeight: 600,
          background: "#F3F2FC",
          border: "1px solid #E6E0FA",
          borderRadius: 999,
          cursor: "pointer",
        }}>편집</span>
      )}
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#534AB7", fontWeight: 700, margin: "0 auto 10px" }}>{isMe ? "K" : "J"}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A", marginBottom: 2 }}>{isMe ? "@김해석" : "@정분석"}</div>
      <div style={{ fontSize: 13, color: "#888780", marginBottom: 12 }}>{isMe ? "프로덕트로 사람을 본다" : "데이터로 세상을 봅니다"}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>{[{ label: "작성 댓글", val: isMe ? 47 : 23 }, { label: "받은 좋아요", val: isMe ? 312 : 89 }, { label: "대표 선정", val: isMe ? 8 : 3 }, { label: "구독 룸", val: isMe ? 3 : 5 }].map((s, i) => (<div key={i} style={{ flex: 1, padding: "10px 4px", background: "#F9F9F6", borderRadius: 10, textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A" }}>{s.val}</div><div style={{ fontSize: 10, color: "#888780", marginTop: 2 }}>{s.label}</div></div>))}</div>
    </div>

    {/* [v9.8] 보유 정체성 섹션 — '전역 주력' 개념 제거.
               각 Aspect의 활동량(댓글·대표·룸 수)은 그대로 노출. */}
    <SH>보유 정체성 {isMe && <span style={{ fontSize: 11, color: "#534AB7", marginLeft: 6, fontWeight: 500, cursor: "pointer" }}>+ 추가</span>}</SH>
    <div style={{ padding: "4px 16px 4px", fontSize: 11, color: "#B4B2A9" }}>각 룸에서는 따로 active aspect를 고를 수 있어요</div>
    <div style={{ padding: "8px 16px 16px" }}>
      {[
        { label: "PM", comments: 32, rep: 6, rooms: 2 },
        { label: "0~3세 부모", comments: 12, rep: 2, rooms: 1 },
        { label: "테슬라 오너", comments: 3, rep: 0, rooms: 1 },
      ].map((a, i) => (
        <div key={i} style={{ padding: "10px 12px", background: "#FAFAF8", borderRadius: 10, border: "1px solid #EEEDEA", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AspectChip text={a.label} />
          </div>
          <div style={{ fontSize: 11, color: "#888780" }}>댓글 {a.comments} · 대표 {a.rep} · 룸 {a.rooms}</div>
        </div>
      ))}
    </div>

    <SH>대표로 선정된 댓글</SH>
    {[
      { text: "툴보다 '어떤 사용자 태스크를 위임할 것인가'를 먼저 정의해야...", aspect: "PM", issue: "Agent SDK 적용", room: "AI 프로덕트 룸" },
      { text: "18개월 수면 퇴행은 분리불안과 겹치는 시기라...", aspect: "0~3세 부모", issue: "18개월 수면 퇴행", room: "0~3세 육아 룸" },
    ].map((c, i) => (
      <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid #F1EFE8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
          <AspectChip text={c.aspect} size="sm" />
        </div>
        <div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.45, marginBottom: 4 }}>{c.text}</div>
        <div style={{ fontSize: 11, color: "#B4B2A9" }}>→ {c.issue} · {c.room}</div>
      </div>
    ))}

    <SH>참여 중인 룸</SH>
    {[{ name: "AI 프로덕트 룸", aspect: "PM" }, { name: "0~3세 육아 룸", aspect: "0~3세 부모" }].map((r, i) => (
      <div key={i} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1EFE8" }}>
        <RoomThumb size={28} />
        <span style={{ fontSize: 14, color: "#2C2C2A", flex: 1 }}>{r.name}</span>
        <AspectChip text={r.aspect} size="sm" />
      </div>
    ))}
  </div>);
}

// ===== 프로필 편집 =====
// [v9.8] 신규: 프로필 입력/수정 화면.
//   편집 가능 필드: 아바타 · 닉네임 · 한 줄 소개(80자).
//   편집 불가 필드는 같은 화면에 '읽기 전용' 섹션으로 노출하고 관리 경로를 안내:
//     · 보유 정체성 → 정체성 관리 화면(/me/aspects/add)으로 이동.
//   통계는 편집 화면에서 생략(순수 관람용이므로 편집 맥락 무관).
//   '전역 주력' 개념은 v9.8에서 제거(향후 버전에서 재도입 예정).
//
// 상태:
//   '기본'        — 기존 값 프리필
//   '닉네임 중복' — 닉네임 검증 실패 인라인 에러
//   '저장 중'     — 저장 CTA를 비활성 + '저장 중…' 상태로 전환
//
// 입력 원칙(v9.7과 정합):
//   - 정체성은 자기 신고 원칙이므로 여기서 추가/수정 불가.
//     전용 화면(aspect-add)에서만 다룸.
function ProfileEditScreen({ state }) {
  const isNickDup = state === "닉네임 중복";
  const isSaving = state === "저장 중";

  // 필드 편집 값(와이어프레임 시연 — 실제 서비스에서는 useState 초기값이 서버 값)
  const [nick, setNick] = useState(isNickDup ? "김해석" : "김해석");
  const [bio, setBio] = useState("프로덕트로 사람을 본다");
  const bioLimit = 80;

  return (<div>
    {/* [v9.8 G] 공통 헤더가 ‹ 백(취소 역할) + 중앙 '프로필 편집' 타이틀을 제공하므로
                자체 헤더에서는 '저장' 액션만 우측에 남김. */}
    <div style={{ padding: "10px 16px", display: "flex", justifyContent: "flex-end", alignItems: "center", borderBottom: "1px solid #EEEDEA", background: "#fff" }}>
      <span style={{
        fontSize: 14,
        color: isSaving ? "#B4B2A9" : "#534AB7",
        fontWeight: 600,
        cursor: isSaving ? "default" : "pointer",
      }}>{isSaving ? "저장 중…" : "저장"}</span>
    </div>

    {/* 아바타 영역 — 탭해서 변경 */}
    <div style={{ padding: "28px 16px 20px", textAlign: "center", borderBottom: "1px solid #F1EFE8" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={{
          width: 88, height: 88, borderRadius: "50%",
          background: "#EEEDFE",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 34, color: "#534AB7", fontWeight: 700,
        }}>K</div>
        {/* 변경 아이콘 배지 */}
        <div style={{
          position: "absolute", right: -2, bottom: -2,
          width: 30, height: 30, borderRadius: "50%",
          background: "#534AB7", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, border: "2px solid #fff",
          cursor: "pointer",
        }}>✎</div>
      </div>
      <div style={{ fontSize: 11, color: "#888780", marginTop: 10 }}>이미지를 탭해서 변경</div>
    </div>

    {/* ====== 편집 가능 섹션 ====== */}
    <SH>편집할 수 있는 항목</SH>

    {/* 닉네임 */}
    <div style={{ padding: "12px 16px 4px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A" }}>닉네임</span>
        <span style={{ fontSize: 11, color: "#B4B2A9" }}>3~16자 · 영문/한글/숫자/언더스코어</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", height: 44,
        border: `1.5px solid ${isNickDup ? "#F09595" : "#D3D1C7"}`,
        borderRadius: 10, background: "#fff",
      }}>
        <span style={{ fontSize: 14, color: "#888780", fontWeight: 600 }}>@</span>
        <input
          value={nick}
          onChange={e => setNick(e.target.value)}
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: "#2C2C2A", background: "transparent", fontFamily: "inherit" }}
          placeholder="닉네임"
        />
        {/* 유효 체크 인디케이터 (기본 상태에서만) */}
        {!isNickDup && <span style={{ fontSize: 12, color: "#3B6D11", fontWeight: 600 }}>사용 가능</span>}
      </div>
      {isNickDup && (
        <div style={{ fontSize: 11, color: "#A32D2D", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
          <span>⚠</span>
          <span>이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해주세요.</span>
        </div>
      )}
    </div>

    {/* 한 줄 소개 */}
    <div style={{ padding: "16px 16px 20px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A" }}>한 줄 소개</span>
        <span style={{ fontSize: 11, color: bio.length > bioLimit ? "#A32D2D" : "#B4B2A9" }}>{bio.length} / {bioLimit}</span>
      </div>
      <textarea
        value={bio}
        onChange={e => setBio(e.target.value)}
        rows={2}
        maxLength={bioLimit + 10 /* 초과 시 카운터가 붉게 되는 걸 시연하려면 maxLength보다 약간 너그럽게 */}
        style={{
          width: "100%", padding: "10px 12px",
          border: "1.5px solid #D3D1C7", borderRadius: 10,
          fontSize: 14, color: "#2C2C2A", lineHeight: 1.5,
          resize: "none", background: "#fff", outline: "none",
          fontFamily: "inherit", boxSizing: "border-box",
        }}
        placeholder="나를 한 줄로 설명해보세요"
      />
      <div style={{ fontSize: 11, color: "#888780", marginTop: 6, lineHeight: 1.5 }}>
        프로필과 댓글 상단에 노출돼요. 다른 사람이 당신의 결을 짐작하는 첫 단서가 됩니다.
      </div>
    </div>

    {/* ====== 읽기 전용 섹션: 정체성 ====== */}
    {/* [v9.8] 정체성은 자기 신고 원칙 + 전용 관리 화면 존재. 여기선 요약만 보여주고
              "정체성 관리로 가기" 링크로 유도. */}
    <SH>보유 정체성 <span style={{ fontSize: 11, color: "#B4B2A9", marginLeft: 6, fontWeight: 400 }}>읽기 전용</span></SH>
    <div style={{ padding: "8px 16px 16px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        <AspectChip text="PM" />
        <AspectChip text="0~3세 부모" />
        <AspectChip text="테슬라 오너" />
      </div>
      <div style={{
        padding: "10px 14px",
        background: "#FAFAF8",
        borderRadius: 10,
        border: "1px solid #EEEDEA",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ flex: 1, fontSize: 12, color: "#5F5E5A", lineHeight: 1.5 }}>
          정체성은 별도 화면에서 추가하거나 뺄 수 있어요.
        </div>
        <span style={{
          fontSize: 12, fontWeight: 600, color: "#534AB7",
          padding: "6px 12px", borderRadius: 8, background: "#F3F2FC",
          cursor: "pointer", flexShrink: 0,
          border: "1px solid #E6E0FA",
        }}>정체성 관리 →</span>
      </div>
    </div>

    {/* ====== 하단 보조 영역 ====== */}
    <div style={{ padding: "0 16px 32px" }}>
      <div style={{ borderTop: "1px solid #F1EFE8", paddingTop: 14 }}>
        <div style={{ fontSize: 11, color: "#B4B2A9", lineHeight: 1.6 }}>
          저장하면 즉시 반영되며, 당신이 쓴 기존 댓글에는 영향이 없어요.<br />
          닉네임은 한 달에 두 번까지 바꿀 수 있어요.
        </div>
      </div>
    </div>
  </div>);
}

// ===== 마이페이지 =====
// [v8.2] 정체성 탭 추가, 파일럿 룸 기준 데이터
function MyPageScreen({ state }) {
  if (state === "구독 없음(Empty)") return (<div><div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>마이페이지</div><ProfileSection /><div style={{ padding: "60px 24px", textAlign: "center", color: "#888780", fontSize: 14 }}>아직 활동 내역이 없습니다</div></div>);
  const at = state === "이슈 탭" ? 1 : state === "댓글 탭" ? 2 : state === "정체성 탭" ? 3 : 0;
  return (<div>
    <div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>마이페이지</div>
    <ProfileSection />
    <div style={{ display: "flex", borderBottom: "2px solid #EEEDEA" }}>
      {["룸", "이슈", "댓글", "정체성"].map((t, i) => (
        <div key={t} style={{ flex: 1, padding: "12px 0", textAlign: "center", fontSize: 14, fontWeight: at === i ? 600 : 400, color: at === i ? "#534AB7" : "#888780", borderBottom: at === i ? "2px solid #534AB7" : "none", marginBottom: -2 }}>{t}</div>
      ))}
    </div>
    {at === 0 && <MyPageRoomTab />}
    {at === 1 && <MyPageIssueTab />}
    {at === 2 && <MyPageCommentTab />}
    {at === 3 && <MyPageAspectTab />}
  </div>);
}
function ProfileSection() {
  return (<div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #EEEDEA" }}>
    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#534AB7", fontWeight: 600 }}>K</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A", marginBottom: 3 }}>@김해석</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <AspectChip text="PM" size="sm" />
        <AspectChip text="0~3세 부모" size="sm" />
        <AspectChip text="테슬라 오너" size="sm" />
      </div>
    </div>
    {/* [v9.8] 본인 뷰에서는 "프로필 →" 와 "편집" 두 경로를 모두 제공.
              '프로필 →'은 상세 확인, '편집'은 수정 화면(/me/edit)으로 직행. */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 600, cursor: "pointer" }}>프로필 →</span>
      <span style={{ fontSize: 11, color: "#888780", fontWeight: 500, cursor: "pointer", textDecoration: "underline", textDecorationColor: "#D3D1C7", textUnderlineOffset: 2 }}>편집</span>
    </div>
  </div>);
}
function RI({ name, color, icon, aspect, action }) {
  const C = { purple: { bg: "#EEEDFE", t: "#534AB7" }, teal: { bg: "#E1F5EE", t: "#0F6E56" }, amber: { bg: "#FAEEDA", t: "#854F0B" } };
  const c = C[color] || C.purple;
  return (<div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1EFE8" }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: c.t }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, color: "#2C2C2A" }}>{name}</div>
      {aspect && <div style={{ marginTop: 2 }}><AspectChip text={aspect} size="sm" /></div>}
    </div>
    {action && <span style={{ padding: "4px 10px", background: "#F1EFE8", borderRadius: 6, fontSize: 12, color: "#5F5E5A", fontWeight: 600 }}>{action}</span>}
  </div>);
}
function MyPageRoomTab() {
  return (<>
    <SH>구독 중</SH>
    <RI name="AI 프로덕트 룸" color="purple" icon="◈" aspect="PM" />
    <RI name="0~3세 육아 룸" color="purple" icon="◈" aspect="0~3세 부모" />
    <SH>참여 중</SH>
    <RI name="테슬라 오너 룸" color="teal" icon="◈" aspect="테슬라 오너" />
    <SH>운영 중</SH>
    <RI name="LLM Eval 스터디 룸" color="amber" icon="★" aspect="PM" action="운영하기" />
  </>);
}
function ST({ tabs, active, onSelect }) { return (<div style={{ display: "flex", gap: 6, padding: "10px 16px" }}>{tabs.map(s => (<span key={s.k} onClick={() => onSelect(s.k)} style={{ padding: "5px 12px", borderRadius: 20, background: active === s.k ? "#2C2C2A" : "#F1EFE8", color: active === s.k ? "#fff" : "#888780", fontSize: 12, fontWeight: active === s.k ? 600 : 400, cursor: "pointer" }}>{s.l}</span>))}</div>); }
function MI({ title, room }) { return (<div style={{ padding: "10px 16px", borderBottom: "1px solid #F1EFE8" }}><div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 2 }}>{title}</div><div style={{ fontSize: 11, color: "#888780" }}>{room}</div></div>); }
function MC({ nick, aspect, text, issue }) {
  return (<div style={{ padding: "10px 16px", borderBottom: "1px solid #F1EFE8" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2, flexWrap: "wrap" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#5F5E5A" }}>{nick}</span>
      {aspect && <AspectChip text={aspect} size="sm" />}
    </div>
    <div style={{ fontSize: 13, color: "#444441", marginBottom: 2 }}>{text}</div>
    <div style={{ fontSize: 11, color: "#B4B2A9" }}>→ {issue}</div>
  </div>);
}
function MyPageIssueTab() {
  const [s, setS] = useState("scrap");
  return (<><ST tabs={[{ k: "scrap", l: "스크랩" }, { k: "written", l: "작성" }, { k: "upvoted", l: "업보트" }]} active={s} onSelect={setS} />
    {s === "scrap" && <><MI title="OpenAI Agent SDK 적용 사례" room="AI 프로덕트 룸" /><MI title="겨울철 주행거리 체감" room="테슬라 오너 룸" /></>}
    {s === "written" && <MI title="LLM 프로덕트 평가 지표" room="AI 프로덕트 룸" />}
    {s === "upvoted" && <><MI title="18개월 수면 퇴행" room="0~3세 육아 룸" /><MI title="GPT-4o 출시 후 변화" room="AI 프로덕트 룸" /></>}
  </>);
}
function MyPageCommentTab() {
  const [s, setS] = useState("scrap");
  return (<><ST tabs={[{ k: "scrap", l: "스크랩" }, { k: "written", l: "작성" }, { k: "upvoted", l: "업보트" }]} active={s} onSelect={setS} />
    {s === "scrap" && <MC nick="@김PM" aspect="PM" text="툴보다 사용자 태스크 정의가 먼저..." issue="Agent SDK 적용" />}
    {s === "written" && <>
      <MC nick="나" aspect="PM" text="평가 지표는 정확도보다 사용자 수정 빈도가 의미 있더라고요." issue="LLM 평가 지표" />
      <MC nick="나" aspect="0~3세 부모" text="저희 아이는 같은 책 반복으로 잡혔어요." issue="18개월 수면 퇴행" />
    </>}
    {s === "upvoted" && <MC nick="@개발자L" aspect="개발자" text="컨텍스트 처리 방식이 확연히 좋아져..." issue="GPT-4o 출시 후" />}
  </>);
}
// [v9.8] 정체성 탭 — 각 Aspect의 활동 이력과 룸별 active_aspect 노출.
//   '전역 주력' 개념은 제거(v9.8 F).
function MyPageAspectTab() {
  return (<>
    <div style={{ padding: "12px 16px", fontSize: 12, color: "#888780", lineHeight: 1.5 }}>정체성별로 활동 이력이 쌓입니다. 각 룸에서는 별도로 어떤 정체성으로 말할지 고를 수 있어요.</div>
    {[
      { label: "PM", comments: 32, rep: 6, activeIn: ["AI 프로덕트 룸", "LLM Eval 스터디"] },
      { label: "0~3세 부모", comments: 12, rep: 2, activeIn: ["0~3세 육아 룸"] },
      { label: "테슬라 오너", comments: 3, rep: 0, activeIn: ["테슬라 오너 룸"] },
    ].map((a, i) => (
      <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #F1EFE8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <AspectChip text={a.label} />
        </div>
        <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 3 }}>댓글 {a.comments}개 · 대표 선정 {a.rep}회</div>
        <div style={{ fontSize: 11, color: "#888780" }}>이 정체성으로 활동 중인 룸: {a.activeIn.join(" · ")}</div>
      </div>
    ))}
    <div style={{ padding: "16px", textAlign: "center" }}>
      <div style={{ display: "inline-block", padding: "9px 18px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>+ 정체성 추가</div>
      <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 6 }}>플랫폼이 큐레이션한 목록에서 선택</div>
    </div>
  </>);
}

// ===== [v9.6] 룸 설정 — 소유권 재정의 + 이슈 드래프트 섹션 + archived 지원 =====
// state:
//   - "draft 상태"              : 공개 전. 세팅·초대·이슈 초안 작성 가능.
//   - "public 상태"             : 정상 운영.
//   - "public 상태(종료 요청 중)": 운영자가 종료 요청 후 어드민 검토 대기.
//   - "archived 상태"           : 종료됨. 모든 편집 비활성. 자산 보존 안내.
function RoomSettingsScreen({ state }) {
  const isDraft = state === "draft 상태";
  const isPendingSignOff = state === "public 상태(종료 요청 중)";
  const isArchived = state === "archived 상태";
  const isPublic = !isDraft && !isArchived; // 종료 요청 중도 public 범주
  // archived에서는 모든 편집 필드를 흐리고 상호작용 차단
  const readOnlyStyle = isArchived ? { opacity: 0.55, pointerEvents: "none" } : {};

  // 상태 배너 스타일
  const bannerBg = isDraft ? "#FAEEDA" : isPendingSignOff ? "#FAECE7" : isArchived ? "#F1EFE8" : "#E1F5EE";
  const bannerBorder = isDraft ? "#EF9F27" : isPendingSignOff ? "#F0997B" : isArchived ? "#B4B2A9" : "#5DCAA5";
  const bannerDot = isDraft ? "#854F0B" : isPendingSignOff ? "#993C1D" : isArchived ? "#5F5E5A" : "#0F6E56";
  const bannerFg = bannerDot;
  const bannerTitle =
    isDraft ? "Draft — 준비 중" :
    isPendingSignOff ? "종료 요청 중 — 어드민 검토 대기" :
    isArchived ? "Archived — 운영 종료" :
    "Public — 운영 중";
  const bannerDesc =
    isDraft ? "이 룸은 아직 외부에 공개되지 않았습니다. 룸 정보 설정, 멤버 초대, 이슈 초안 작성이 가능합니다. 공개 후 초안은 일반 발행 흐름으로 이어집니다." :
    isPendingSignOff ? "종료 요청이 어드민에 전달되었습니다. 검토 결과에 따라 (1) 신규 운영자 지정, (2) 룸 아카이브 중 하나로 결정됩니다. 결정 전까지는 정상 운영할 수 있으며, 요청은 언제든 취소할 수 있습니다." :
    isArchived ? "이 룸은 운영이 종료되었습니다. 기존 이슈와 댓글은 운영자·멤버에게 보존되어 있으나, 새로운 활동은 불가합니다. 되돌릴 수 없습니다." :
    "이 룸은 룸 목록과 피드에 노출되고 있습니다. 이슈 발행, 댓글, 모집 관리가 모두 가능합니다.";

  return (<div>
    {/* [v9.8 G] 공통 헤더가 '룸 설정' 타이틀을 이미 보여주므로 내부 헤더는
                섹션 경로 힌트만 얇게. */}
    <div style={{ padding: "10px 16px 0", fontSize: 11, color: "#888780", fontWeight: 500, letterSpacing: "0.02em" }}>운영자 섹션</div>
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>

      {/* 소유권 철학 배너 — archived에서도 유지(철학은 유효) */}
      <div style={{ padding: "10px 12px", background: "#F3F2FC", borderRadius: 10, border: "1px solid #D9D5F5" }}>
        <div style={{ fontSize: 11, color: "#534AB7", fontWeight: 700, marginBottom: 3, letterSpacing: "0.02em" }}>운영자 안내</div>
        <div style={{ fontSize: 11, color: "#5F5E9E", lineHeight: 1.55 }}>이 룸은 운영자에게 <strong>위임된 공간</strong>입니다. 주제·정체성·이슈 선정은 운영자가 결정하지만, 룸의 지속과 종료는 멤버의 활동과도 직결됩니다. 운영 종료는 어드민 검토를 거칩니다.</div>
      </div>

      {/* 라이프사이클 상태 배너 */}
      <div style={{ padding: "12px 14px", background: bannerBg, borderRadius: 12, border: `1.5px solid ${bannerBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: bannerDot }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: bannerFg }}>{bannerTitle}</span>
        </div>
        <div style={{ fontSize: 11, color: bannerFg, lineHeight: 1.5 }}>{bannerDesc}</div>
      </div>

      {/* [v9.6] archived 자산 보존 안내 — archived 전용 추가 박스 */}
      {isArchived && (
        <div style={{ padding: "12px 14px", background: "#FAFAF8", borderRadius: 12, border: "1px solid #EEEDEA" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#5F5E5A", marginBottom: 6 }}>보존되는 것 / 중단되는 것</div>
          <div style={{ fontSize: 11, color: "#5F5E5A", lineHeight: 1.7 }}>
            <div>· 기존 이슈와 댓글, 작성 시점의 Aspect 표시 — 그대로 보존</div>
            <div>· 멤버 목록과 각자의 활동 이력 — 그대로 보존</div>
            <div>· 새 이슈 발행, 댓글 작성, 멤버 가입, 초대 링크 발급 — 모두 중단</div>
            <div>· 룸 정보·Aspect·멤버 관리 — 편집 불가</div>
          </div>
        </div>
      )}

      {/* 룸 정보 — archived는 읽기 전용 시각화 */}
      <div style={readOnlyStyle}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>룸 대표 이미지</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <RoomThumb size={64} />
          {!isArchived && <div style={{ padding: "8px 16px", border: "1px dashed #D3D1C7", borderRadius: 8, fontSize: 13, color: "#888780" }}>이미지 변경</div>}
        </div>
      </div>
      <div style={readOnlyStyle}>
        {[{ label: "룸 이름", val: "AI 프로덕트 룸" }, { label: "한 줄 설명", val: "프로덕트 관점에서 AI를 봅니다" }, { label: "상세 설명", val: "기술 트렌드보다 의사결정 관점의 논의를 모읍니다", multi: true }].map(f => (
          <div key={f.label} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>{f.label}</div>
            <div style={{ padding: f.multi ? "10px 12px" : "9px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: "#2C2C2A", background: "#fff", minHeight: f.multi ? 60 : "auto" }}>{f.val}</div>
          </div>
        ))}
      </div>

      {/* 이 룸의 시선 (Aspect) — archived면 × / + 숨김 */}
      <div style={{ padding: "14px", background: "#F5F9FD", borderRadius: 12, border: "1.5px solid #D6E6F3", ...readOnlyStyle }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#185FA5", marginBottom: 4 }}>이 룸의 시선 {!isArchived && "(필수)"}</div>
        <div style={{ fontSize: 11, color: "#5F7B95", marginBottom: 10, lineHeight: 1.5 }}>
          {isArchived
            ? "운영 종료된 룸의 시선은 변경할 수 없습니다. 과거 댓글의 Aspect 표시는 그대로 보존됩니다."
            : "이 정체성을 가진 사람만 댓글 작성이 가능합니다. 최대 3개까지 선택할 수 있습니다."}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, background: "#E6F1FB", border: "1px solid #85B7EB", fontSize: 11, fontWeight: 600, color: "#185FA5" }}>
            ◇ PM {!isArchived && <span style={{ color: "#85B7EB", marginLeft: 2 }}>×</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, background: "#E6F1FB", border: "1px solid #85B7EB", fontSize: 11, fontWeight: 600, color: "#185FA5" }}>
            ◇ 개발자 {!isArchived && <span style={{ color: "#85B7EB", marginLeft: 2 }}>×</span>}
          </div>
          {!isArchived && <div style={{ padding: "4px 10px", borderRadius: 999, border: "1px dashed #B4B2A9", fontSize: 11, color: "#888780", cursor: "pointer" }}>+ 정체성 추가</div>}
        </div>
        {!isArchived && <div style={{ fontSize: 10, color: "#B4B2A9" }}>플랫폼 큐레이션 풀에서 선택 · 자유 입력 불가</div>}
      </div>

      {/* 이슈 초안 섹션 — draft/public에서만 노출 (archived는 보존된 이슈로만 존재) */}
      {!isArchived && (
        <div style={{ padding: "14px", background: "#FFF9EE", borderRadius: 12, border: "1px solid #F0DA8E" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#854F0B" }}>이슈 초안</div>
              <div style={{ fontSize: 11, color: "#7A5F0B", marginTop: 2, lineHeight: 1.5 }}>
                {isDraft
                  ? "공개 전에 미리 이슈를 써둘 수 있습니다. 룸을 공개한 뒤 초안에서 바로 발행할 수 있어요."
                  : "발행 전 임시 저장한 이슈입니다. 외부에는 보이지 않습니다."}
              </div>
            </div>
            <div style={{ padding: "6px 12px", background: "#EF9F27", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>+ 초안 작성</div>
          </div>
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { title: "LLM 프로덕트의 평가 지표를 어떻게 잡을 것인가", updated: "2일 전" },
              { title: "Agent SDK 적용, 실제 프로덕트 사례", updated: "5일 전" },
            ].map((d, i) => (
              <div key={i} style={{ padding: "10px 12px", background: "#fff", borderRadius: 8, border: "1px solid #F0DA8E", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 2 }}>수정: {d.updated}</div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <span style={{ padding: "4px 10px", background: "#F1EFE8", color: "#5F5E5A", borderRadius: 6, fontSize: 11, fontWeight: 500 }}>편집</span>
                  {!isDraft && <span style={{ padding: "4px 10px", background: "#E1F5EE", color: "#0F6E56", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>발행</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1:1 초대 링크 — archived에서는 노출 안 함 (새 가입 불가) */}
      {!isArchived && (
        <div style={{ padding: "14px", background: "#F5F9FD", borderRadius: 12, border: "1px solid #D6E6F3" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#185FA5" }}>1:1 초대 링크</div>
              <div style={{ fontSize: 11, color: "#5F7B95", marginTop: 2 }}>1회용 · 7일 만료</div>
            </div>
            <div style={{ padding: "8px 14px", background: "#534AB7", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>링크 생성</div>
          </div>
          <div style={{ fontSize: 11, color: "#5F5E5A", lineHeight: 1.5 }}>
            {isDraft
              ? "공개 전에 함께 활동할 멤버를 미리 초대할 수 있습니다. 초대받은 사람은 룸의 정체성 조건이 맞으면 멤버가 됩니다."
              : "모집이 닫힌 상태에서 특정인에게만 선별적으로 참여 권한을 주는 장치입니다. 버튼을 누를 때마다 새 링크가 생성됩니다."}
          </div>
        </div>
      )}

      {/* 멤버 모집 토글 — public 상태에서만 노출 */}
      {isPublic && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>멤버 모집</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["닫힘", "열림"].map((t, i) => (
              <div key={t} style={{ flex: 1, padding: "10px 0", border: i === 1 ? "2px solid #0F6E56" : "1px solid #D3D1C7", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: i === 1 ? "#0F6E56" : "#888780", background: i === 1 ? "#E1F5EE" : "#fff" }}>{t}</div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 6, lineHeight: 1.4 }}>닫힘: 초대 링크를 받은 사람만 참여 가능 · 열림: 정체성 맞으면 누구나 참여 가능</div>
        </div>
      )}

      {/* 멤버 관리 — archived에서는 제거/추가 버튼 없이 목록만 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>멤버 {isArchived ? "(보존됨)" : "관리"}</div>
        {[{ nick: "@PM박", aspect: "PM" }, { nick: "@개발자L", aspect: "개발자" }].map(u => (
          <div key={u.nick} style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1EFE8" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 14, color: "#2C2C2A" }}>{u.nick}</span>
              <AspectChip text={u.aspect} size="sm" />
            </div>
            {!isArchived && <span style={{ fontSize: 12, color: "#993C1D", fontWeight: 500 }}>제거</span>}
          </div>
        ))}
        {!isArchived && <div style={{ marginTop: 8, padding: "9px 12px", border: "1px dashed #D3D1C7", borderRadius: 10, fontSize: 13, color: "#888780", textAlign: "center" }}>+ 사용자 검색 후 추가</div>}
      </div>

      {/* 하단 CTA — 상태별 분기 */}
      {isDraft && (
        <div>
          <div style={{ padding: "13px 0", background: "#0F6E56", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center" }}>룸 공개</div>
          <div style={{ fontSize: 11, color: "#5F5E5A", marginTop: 8, lineHeight: 1.5, textAlign: "center" }}>이 룸이 룸 목록과 피드에 노출되고, 이슈를 발행할 수 있게 됩니다. 저장해둔 초안이 있으면 공개 후 바로 발행할 수 있어요.</div>
        </div>
      )}
      {isPendingSignOff && (
        <div>
          <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center", marginBottom: 10 }}>저장</div>
          <div style={{ padding: "12px 0", background: "#fff", color: "#5F5E5A", border: "1.5px solid #D3D1C7", borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: "center" }}>종료 요청 취소</div>
          <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 8, lineHeight: 1.5, textAlign: "center" }}>어드민이 검토 중입니다. 요청을 취소하면 계속 운영할 수 있습니다.</div>
        </div>
      )}
      {!isDraft && !isPendingSignOff && !isArchived && (
        <div>
          <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center", marginBottom: 12 }}>저장</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ padding: "11px 0", background: "#fff", color: "#5F5E5A", border: "1.5px solid #D3D1C7", borderRadius: 12, fontSize: 13, fontWeight: 600, textAlign: "center" }}>운영자 사임 (다른 운영자에게 이양 요청)</div>
            <div style={{ padding: "11px 0", background: "#FCEBEB", color: "#993C1D", borderRadius: 12, fontSize: 13, fontWeight: 600, textAlign: "center" }}>운영 종료 요청</div>
          </div>
          <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 10, lineHeight: 1.5, textAlign: "center" }}>
            두 액션 모두 어드민 검토를 거칩니다. 운영자가 단독으로 룸을 종료할 수는 없습니다. 멤버들의 댓글 활동은 보호됩니다.
          </div>
        </div>
      )}
      {isArchived && (
        <div style={{ padding: "14px", background: "#F9F9F6", borderRadius: 12, border: "1px solid #EEEDEA", textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "#888780", lineHeight: 1.6 }}>이 룸은 종료 상태입니다. 더 이상의 전환은 불가합니다.<br />기존 이슈와 댓글은 운영자·멤버에게 영구 보존됩니다.</div>
        </div>
      )}
    </div>
  </div>);
}

// ===== [v9.6 신규] 운영 사임 / 종료 요청 화면 =====
// 운영자가 룸 설정 하단 CTA를 누르면 이 화면으로 진입.
// 두 케이스:
//   - "사임(이양 요청)": 운영자가 더 이상 못 맡는데 룸은 계속 운영되길 원함
//   - "운영 종료 요청": 룸 자체를 아카이브하자는 제안
// 어느 쪽이든 어드민 검토 대기 상태로 들어가고, 운영자는 결과 통지를 기다림.
function OperatorSignOffScreen({ state }) {
  const isSignOff = state === "사임(이양 요청)";
  return (<div>
    {/* [v9.8 G] 공통 헤더가 ‹ 백 + 화면 타이틀 제공. 상세 화면 내부 별도 헤더는
                컨텍스트 보강용 서브타이틀만 남김(어떤 서브플로우인지 구분). */}
    <div style={{ padding: "10px 16px 12px", borderBottom: "1px solid #EEEDEA" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#5F5E5A" }}>{isSignOff ? "운영자 사임" : "운영 종료 요청"}</div>
    </div>
    <div style={{ padding: "20px 16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <RoomThumb size={48} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#2C2C2A" }}>AI 프로덕트 룸</div>
          <div style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>구독자 156명 · 멤버 42명 · 이슈 18개</div>
        </div>
      </div>
    </div>

    {/* 철학 안내 — 이 화면의 존재 이유 */}
    <div style={{ margin: "0 16px 16px", padding: "12px 14px", background: "#F3F2FC", borderRadius: 12, border: "1px solid #D9D5F5" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#534AB7", marginBottom: 4 }}>왜 이 절차가 필요한가</div>
      <div style={{ fontSize: 11, color: "#5F5E9E", lineHeight: 1.6 }}>
        멤버들은 이 룸에서 자기 정체성을 걸고 댓글을 써왔습니다. 운영자 한 명의 결정으로 그 활동 공간이 갑자기 사라지지 않도록, 사임과 종료는 어드민이 함께 판단합니다.
      </div>
    </div>

    {/* 두 선택지 — 운영자가 어떤 결정을 원하는지 */}
    <div style={{ padding: "0 16px 12px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>무엇을 요청하시겠어요?</div>

      <div style={{ padding: 14, background: isSignOff ? "#F5F9FD" : "#fff", borderRadius: 12, border: isSignOff ? "2px solid #85B7EB" : "1px solid #D3D1C7", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: isSignOff ? "6px solid #185FA5" : "2px solid #D3D1C7", background: "#fff", flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>운영자 사임 — 다른 사람이 운영</div>
          <div style={{ fontSize: 12, color: "#5F5E5A", lineHeight: 1.5 }}>내가 더 이상 운영을 맡지 못하지만, 룸은 계속 살아 있으면 좋겠다. 어드민이 적합한 후임 운영자를 찾거나 기존 멤버 중에서 지정합니다. 후임을 못 찾으면 아카이브로 전환됩니다.</div>
        </div>
      </div>

      <div style={{ padding: 14, background: !isSignOff ? "#FAECE7" : "#fff", borderRadius: 12, border: !isSignOff ? "2px solid #F0997B" : "1px solid #D3D1C7", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: "50%", border: !isSignOff ? "6px solid #993C1D" : "2px solid #D3D1C7", background: "#fff", flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>운영 종료 요청 — 룸 자체를 아카이브</div>
          <div style={{ fontSize: 12, color: "#5F5E5A", lineHeight: 1.5 }}>주제가 더 이상 유효하지 않거나, 활동이 사실상 멈췄다. 이 룸은 아카이브로 전환되어야 한다고 본다. 어드민이 검토 후 결정하며, 확정 시 멤버에게 사전 통지가 전달됩니다.</div>
        </div>
      </div>
    </div>

    {/* 사유 입력 — 어드민 판단 자료 */}
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>사유 (어드민 검토용 · 필수)</div>
      <div style={{ padding: "10px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 13, color: "#B4B2A9", minHeight: 90, background: "#fff", lineHeight: 1.5 }}>
        {isSignOff
          ? "예: 개인 사정으로 운영을 지속하기 어려워졌습니다. 룸은 계속 운영되면 좋겠고, 후임자는 어드민 판단에 맡기겠습니다."
          : "예: 원래 이슈로 삼았던 주제가 성숙 단계에 들어서 최근 3개월간 발행할 이슈가 줄었습니다. 룸을 아카이브로 정리하는 게 적절해 보입니다."}
      </div>
    </div>

    {/* 확인 안내 + 제출 */}
    <div style={{ padding: "0 16px 24px" }}>
      <div style={{ padding: "11px 14px", background: "#FFF8E5", borderRadius: 10, border: "1px solid #F0DA8E", marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: "#7A5F0B", lineHeight: 1.6 }}>
          <strong>요청 제출 후</strong> · 어드민이 검토하며, 이 기간 동안은 &quot;종료 요청 중&quot; 상태로 표시됩니다. 검토 결과가 나오기 전까지는 언제든 요청을 취소할 수 있습니다. 멤버들에게는 결정이 확정된 시점에 통지됩니다.
        </div>
      </div>
      <div style={{ padding: "12px 0", background: isSignOff ? "#185FA5" : "#993C1D", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center" }}>
        {isSignOff ? "사임 요청 보내기" : "종료 요청 보내기"}
      </div>
    </div>
  </div>);
}

// ===== [v9.6] 이슈 발행 / 수정 — 상태 선택 UI 복원 =====
// 상태 선택을 명시적 라디오 그룹으로 제공: [초안, 공개, 닫힘, 숨김]
// 현재 상태에서 전이 가능한 라벨만 활성화, 비활성은 흐리게 + 전이 불가 안내.
//
// 모델:
//   - 상태 4값: draft(초안) / active(공개) / closed(닫힘) / hidden(숨김)
//   - 전이 규칙:
//       · 새 이슈    : draft ↔ active
//       · 초안 편집  : draft, active (닫힘/숨김은 draft 단계에서 의미 없음 → 비활성)
//       · 공개 수정  : active, closed, hidden (draft는 비활성 — 초안으로 되돌림 불가)
//       · 닫힘 수정  : closed, hidden (draft/active 비활성 — 닫힘→공개 불가)
//       · 숨김 수정  : hidden, active, closed (숨김은 원상복귀 가능, draft는 여전히 불가)
//   - 이유: "숨김"은 실수 발행의 원상복귀 수단이므로 외부 노출을 다시 허용할 수 있어야 함.
//
// state:
//   "새 이슈"       → 새로 작성
//   "초안 편집"     → draft 상태 이슈 편집
//   "공개 이슈 수정"→ active 상태 이슈 편집
//   "닫힌 이슈 수정"→ closed 상태 이슈 편집 (공개 되돌림 불가)
//   "숨긴 이슈 수정"→ hidden 상태 이슈 편집 (공개/닫힘으로 복귀 가능)
function IssuePublishScreen({ state }) {
  const mode =
    state === "초안 편집" ? "draft" :
    state === "공개 이슈 수정" ? "active" :
    state === "닫힌 이슈 수정" ? "closed" :
    state === "숨긴 이슈 수정" ? "hidden" :
    "new";

  // 헤더 타이틀
  const headerTitle =
    mode === "draft" ? "초안 편집" :
    mode === "active" ? "이슈 수정" :
    mode === "closed" ? "닫힌 이슈 수정" :
    mode === "hidden" ? "숨긴 이슈 수정" :
    "새 이슈";

  // 현재 상태 배지
  const badge =
    mode === "draft" ? { text: "초안", color: "amber" } :
    mode === "active" ? { text: "공개", color: "teal" } :
    mode === "closed" ? { text: "닫힘", color: "gray" } :
    mode === "hidden" ? { text: "숨김", color: "red" } :
    null;

  // 샘플 필드값
  const fieldVals = {
    title:
      mode === "active" ? "OpenAI Agent SDK, 프로덕트에 어떻게 적용할까" :
      mode === "draft" ? "LLM 평가 지표를 어떻게 잡을까" :
      mode === "closed" ? "GPT-4o 출시 후 우리 프로덕트의 변화" :
      mode === "hidden" ? "오타가 많아 숨김 처리한 이슈" :
      "",
    opLine:
      mode === "active" ? "기술보다 워크플로우 설계가 핵심" :
      mode === "draft" ? "정확도보다 사용자 신뢰" :
      mode === "closed" ? "비용보다 응답 품질 변화 위주" :
      mode === "hidden" ? "(숨김 처리됨)" :
      "",
    body:
      mode === "active" ? "이번 SDK는 단순한 API 래퍼가 아니라..." :
      mode === "draft" ? "LLM 프로덕트의 평가는..." :
      mode === "closed" ? "GPT-4o 출시 이후 컨텍스트 처리 방식이..." :
      mode === "hidden" ? "본문을 수정한 뒤 다시 공개할 수 있습니다..." :
      "",
  };

  // 상태 옵션 정의 — 각 모드별로 선택 가능 여부가 다름
  // 팔레트 (활성 시 색상)
  const STATE_OPTS = [
    { key: "draft",  label: "초안", desc: "운영자만 보임, 외부 비노출",      bg: "#FAEEDA", fg: "#854F0B", border: "#EF9F27" },
    { key: "active", label: "공개", desc: "구독자·멤버에게 공개, 댓글 작성 가능", bg: "#E1F5EE", fg: "#0F6E56", border: "#5DCAA5" },
    { key: "closed", label: "닫힘", desc: "읽기 가능, 댓글 작성 불가. 다시 공개할 수는 없습니다.", bg: "#F1EFE8", fg: "#5F5E5A", border: "#B4B2A9" },
    { key: "hidden", label: "숨김", desc: "외부 비노출, 운영자만 보임",         bg: "#FCEBEB", fg: "#A32D2D", border: "#F09595" },
  ];

  // 현재 모드에서 선택 가능한 상태 집합 & 기본 선택값
  const enabledStates =
    mode === "new"    ? ["draft", "active"] :              // 새 이슈: draft ↔ active
    mode === "draft"  ? ["draft", "active"] :              // 초안: active로만 공개 가능
    mode === "active" ? ["active", "closed", "hidden"] :   // 공개: draft로 못 되돌림
    mode === "closed" ? ["closed", "hidden"] :             // 닫힘: 공개로 되돌림 불가
    mode === "hidden" ? ["hidden", "active", "closed"] :   // 숨김: 공개/닫힘으로 복귀 허용
    [];
  const currentSelection =
    mode === "new"    ? "draft" :   // 기본 선택: 초안 (공개하려면 바꿔야 함)
    mode === "draft"  ? "draft" :
    mode === "active" ? "active" :
    mode === "closed" ? "closed" :
    mode === "hidden" ? "hidden" :
    "draft";

  return (<div>
    {/* [v9.8 G] 공통 헤더가 '이슈 발행/수정' 타이틀을 제공.
                내부는 편집 중 이슈의 상태 배지만 강조해서 맥락 전달. */}
    <div style={{ padding: "10px 16px", borderBottom: "1px solid #EEEDEA", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div style={{ fontSize: 11, color: "#888780", fontWeight: 500, letterSpacing: "0.02em" }}>운영자 · {headerTitle}</div>
      {badge && <Badge text={badge.text} color={badge.color} />}
    </div>

    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 본문 입력 필드 */}
      {[
        { label: "제목", val: fieldVals.title, ph: "이슈 제목을 입력하세요" },
        { label: "운영자 한 줄", val: fieldVals.opLine, ph: "이 이슈를 어떤 관점으로 볼지 한 줄로" },
        { label: "질문 (선택)", val: "", ph: "댓글을 끌어낼 질문" },
        { label: "본문", val: fieldVals.body, ph: "본문을 입력하세요", multi: true },
      ].map(f => (
        <div key={f.label}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>{f.label}</div>
          <div style={{ padding: f.multi ? "10px 12px" : "9px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: f.val ? "#2C2C2A" : "#B4B2A9", background: "#fff", minHeight: f.multi ? 80 : "auto" }}>{f.val || f.ph}</div>
        </div>
      ))}

      <div style={{ padding: 20, border: "1px dashed #D3D1C7", borderRadius: 10, textAlign: "center", color: "#888780", fontSize: 13 }}>이미지 / 링크 / 유튜브 첨부</div>

      {/* 옵션: 대표 이슈 / 스포일러 — 상태와 무관한 플래그 */}
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: "#F9F9F6", borderRadius: 10 }}>
          <div style={{ width: 20, height: 20, border: "2px solid #D3D1C7", borderRadius: 4 }} />
          <span style={{ fontSize: 13, color: "#5F5E5A" }}>대표 이슈로 설정</span>
        </div>
        <div style={{ flex: 1, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: "#FCEBEB", borderRadius: 10 }}>
          <div style={{ width: 20, height: 20, border: "2px solid #F09595", borderRadius: 4, background: "#fff" }} />
          <span style={{ fontSize: 13, color: "#A32D2D" }}>스포일러 포함</span>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: -8 }}>스포일러 체크 시 목록에서 본문이 숨겨집니다</div>

      {/* ===== [v9.6] 이슈 상태 선택 — 명시적 라디오 그룹 =====
          현재 상태 기준으로 전이 가능한 상태만 활성화됨.
          특히 "공개" 이후 "초안"으로의 되돌림은 불가(라벨이 비활성). */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>이슈 상태</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {STATE_OPTS.map(opt => {
            const enabled = enabledStates.includes(opt.key);
            const isSel = enabled && opt.key === currentSelection;
            return (
              <div
                key={opt.key}
                style={{
                  padding: "10px 12px",
                  border: isSel ? `2px solid ${opt.border}` : "1px solid #D3D1C7",
                  borderRadius: 10,
                  background: isSel ? opt.bg : enabled ? "#fff" : "#FAFAF8",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  opacity: enabled ? 1 : 0.5,
                  cursor: enabled ? "pointer" : "not-allowed",
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: "50%",
                  border: isSel ? `5px solid ${opt.fg}` : "2px solid #D3D1C7",
                  background: "#fff",
                  flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: enabled ? (isSel ? opt.fg : "#2C2C2A") : "#B4B2A9" }}>{opt.label}</div>
                  <div style={{ fontSize: 11, color: enabled ? "#888780" : "#B4B2A9", marginTop: 2 }}>{opt.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        {/* 제약 안내 문구 — 모드별 맞춤 */}
        <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 8, lineHeight: 1.5 }}>
          {mode === "new" && "새 이슈는 초안으로 저장하거나 바로 공개할 수 있어요. 한 번 공개한 뒤에는 초안으로 되돌릴 수 없습니다."}
          {mode === "draft" && "초안은 언제든 공개로 전환할 수 있어요. 다만 한 번 공개하면 초안으로 돌아올 수 없습니다."}
          {mode === "active" && "이미 공개된 이슈는 초안으로 되돌릴 수 없습니다. 멈추고 싶으면 \"닫힘\"(읽기만 허용) 또는 \"숨김\"(외부 비노출)을 쓰세요."}
          {mode === "closed" && "닫힌 이슈는 다시 공개할 수 없습니다(닫힘 → 공개 불가). 외부 노출 자체를 멈추려면 \"숨김\"으로 전환하세요."}
          {mode === "hidden" && "숨긴 이슈는 다시 공개하거나 닫힘으로 전환할 수 있습니다. 초안으로는 되돌릴 수 없습니다."}
        </div>
      </div>

      {/* ===== 하단 CTA ===== */}
      {mode === "new" && (
        <div style={{ marginTop: 4 }}>
          <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center" }}>저장</div>
          <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 6, lineHeight: 1.5 }}>위에서 선택한 상태로 저장됩니다. &quot;초안&quot;은 외부 비노출, &quot;공개&quot;는 바로 구독자·멤버에게 노출.</div>
        </div>
      )}
      {mode === "draft" && (
        <div style={{ marginTop: 4 }}>
          <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center" }}>저장</div>
          <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 6, lineHeight: 1.5 }}>상태를 &quot;공개&quot;로 바꿔 저장하면 바로 발행됩니다.</div>
          <div style={{ marginTop: 12, padding: "12px 0", background: "#FAECE7", color: "#993C1D", borderRadius: 12, fontSize: 13, fontWeight: 600, textAlign: "center" }}>초안 삭제</div>
        </div>
      )}
      {(mode === "active" || mode === "closed" || mode === "hidden") && (
        <div style={{ marginTop: 4 }}>
          <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center" }}>저장</div>
          <div style={{ marginTop: 12, padding: "12px 0", background: "#FAECE7", color: "#993C1D", borderRadius: 12, fontSize: 13, fontWeight: 600, textAlign: "center" }}>이슈 삭제</div>
        </div>
      )}
    </div>
  </div>);
}

// ===== 대표 댓글 지정 =====
// [v8.2] 댓글 작성자 Aspect 칩 표시 — 운영자가 어떤 시선의 댓글을 대표로 고를지 판단에 도움
function RepCommentScreen() {
  return (<div>
    {/* [v9.8 G] 공통 헤더가 '대표 댓글 지정' 타이틀 제공 — 내부는 섹션 힌트만. */}
    <div style={{ padding: "10px 16px", fontSize: 11, color: "#888780", fontWeight: 500, letterSpacing: "0.02em", borderBottom: "1px solid #EEEDEA" }}>운영자 섹션</div>
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>이슈</div>
      <div style={{ padding: "10px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: "#2C2C2A", background: "#fff", marginBottom: 16 }}>OpenAI Agent SDK, 프로덕트에 어떻게 적용할까</div>
    </div>
    <div style={{ padding: "0 16px 12px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>현재 대표 댓글 (1개)</div>
      <div style={{ padding: "10px 14px", background: "#F3F2FC", borderRadius: 10, borderLeft: "3px solid #7F77DD", display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#534AB7" }}>@김PM</span>
            <AspectChip text="PM" size="sm" />
          </div>
          <div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.45 }}>툴 자체보다 &apos;어떤 사용자 태스크를 위임할 것인가&apos;를 먼저 정의해야...</div>
        </div>
        <span style={{ padding: "4px 10px", background: "#FAECE7", color: "#993C1D", borderRadius: 6, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>해제</span>
      </div>
    </div>
    <SH>전체 댓글</SH>
    {[
      { nick: "@개발자L", aspect: "개발자", text: "구현 관점에서 streaming과 tool use 핸들링이 까다로웠습니다..." },
      { nick: "@PM박", aspect: "PM", text: "리서치 요약부터 시작했는데 검토 가능한 지점을 둔 게 컸어요..." },
      { nick: "@개발자K", aspect: "개발자", text: "에러 핸들링 패턴이 SDK에 잘 정리되어 있어서..." },
    ].map((c, i) => (
      <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#444441" }}>{c.nick}</span>
            <AspectChip text={c.aspect} size="sm" />
          </div>
          <div style={{ fontSize: 13, color: "#444441", lineHeight: 1.45 }}>{c.text}</div>
        </div>
        <span style={{ padding: "4px 10px", background: "#EEEDFE", color: "#534AB7", borderRadius: 6, fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>지정</span>
      </div>
    ))}
  </div>);
}

// ===== [v9.1] 초대 랜딩 — 초대 = 발견 장치로 재정의 =====
function InviteLandingScreen({ state }) {
  if (state === "만료") return (<div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F1EFE8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", color: "#B4B2A9" }}>✕</div><div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A", marginBottom: 8 }}>이 초대는 만료되었어요</div><div style={{ fontSize: 13, color: "#888780", lineHeight: 1.6, marginBottom: 24 }}>이 초대 링크는 만료되었거나<br />이미 사용된 링크입니다.</div><div style={{ display: "inline-block", padding: "11px 24px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>룸 둘러보기</div></div>);
  if (state === "이미 멤버") return (<div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", color: "#0F6E56" }}>✓</div><div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A", marginBottom: 8 }}>이미 이 룸의 멤버예요</div><div style={{ fontSize: 13, color: "#888780", marginBottom: 24 }}>AI 프로덕트 룸</div><div style={{ display: "inline-block", padding: "11px 24px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>이슈 보러 가기</div></div>);
  // 유효
  return (<div>
    <div style={{ padding: "32px 24px 20px", textAlign: "center", background: "linear-gradient(180deg, #F3F2FC 0%, #fff 100%)" }}>
      <div style={{ fontSize: 12, color: "#534AB7", fontWeight: 600, marginBottom: 12 }}>운영자가 당신을 초대했어요</div>
      <RoomThumb size={56} />
      <div style={{ fontSize: 20, fontWeight: 700, color: "#2C2C2A", marginTop: 12, marginBottom: 6 }}>AI 프로덕트 룸</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
        <AspectChip text="PM" />
        <AspectChip text="개발자" />
      </div>
      <div style={{ fontSize: 13, color: "#888780", marginBottom: 16 }}>프로덕트 관점에서 AI를 봅니다</div>
    </div>
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 13, color: "#444441", background: "#F9F9F6", padding: "12px 14px", borderRadius: 10, lineHeight: 1.6, marginBottom: 12, whiteSpace: "pre-line" }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: "#888780", marginBottom: 6 }}>이 방은 이렇게 봅니다</div>
        {"• 기술 트렌드보다 프로덕트 의사결정 관점\n• 사용자 가치로 환산되지 않는 논의는 후순위"}
      </div>
      {/* [v9.3] 참여 조건 박스 — 모집 닫힘 백도어 맥락으로 재조정 */}
      <div style={{ padding: "12px 14px", background: "#F5F9FD", borderRadius: 10, border: "1.5px solid #85B7EB", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#185FA5", fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>초대 전용 참여</div>
        <div style={{ fontSize: 12, color: "#444441", lineHeight: 1.6 }}>이 룸은 현재 멤버 모집이 닫혀 있지만, 초대를 받은 분은 참여할 수 있습니다. 가입 후 PM 또는 개발자 정체성을 프로필에 추가하면 바로 멤버가 됩니다. 정체성은 자기 신고 기반입니다.</div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>이 룸의 이슈와 반응</div>
      <div style={{ padding: 12, border: "1px solid #EEEDEA", borderRadius: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>LLM 프로덕트 평가 지표를 어떻게 잡을 것인가</div>
        <div style={{ fontSize: 12, color: "#5F5E5A", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <span style={{ color: "#AFA9EC", fontSize: 10 }}>◆</span>
          <span style={{ fontWeight: 600 }}>@김PM</span>
          <AspectChip text="PM" size="sm" />
          <span>태스크 완료율 + 사용자 수정 빈도...</span>
        </div>
        <MetaRow comments={36} upvotes={71} compact />
      </div>
      <div style={{ padding: 12, border: "1px solid #EEEDEA", borderRadius: 10, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>OpenAI Agent SDK 적용 사례</div>
        <div style={{ fontSize: 12, color: "#5F5E5A", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          <span style={{ color: "#AFA9EC", fontSize: 10 }}>◆</span>
          <span style={{ fontWeight: 600 }}>@개발자L</span>
          <AspectChip text="개발자" size="sm" />
          <span>구현 관점에서 streaming이 핵심...</span>
        </div>
        <MetaRow comments={28} upvotes={53} compact />
      </div>
      <div style={{ padding: "13px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>가입하고 정체성 추가</div>
      <div style={{ fontSize: 11, color: "#B4B2A9", textAlign: "center", marginBottom: 16 }}>가입 다음 단계에서 PM 또는 개발자 정체성을 선택합니다</div>
    </div>
  </div>);
}

// ===== Aspect 추가 화면 =====
// [v9.6] 진입 경로를 "마이페이지 직접 추가" 하나로 통일.
//   이전에는 "룸 댓글 시도 시 진입" 경로가 있었으나, 이는 join-aspect 화면과 기능 중복.
//   룸 참여 흐름에서 정체성이 없는 유저도 join-aspect에서 "추가하고 참여"로 처리.
//   이 화면은 전역 정체성 풀 관리 용도로만 사용.
function AspectAddScreen() {
  return (<div>
    {/* [v9.8 G] 공통 헤더가 ‹ 백(닫기 역할) + '정체성 추가' 타이틀 제공.
                자체 바에는 '완료' 저장 액션만 남김. */}
    <div style={{ padding: "10px 16px", display: "flex", justifyContent: "flex-end", alignItems: "center", borderBottom: "1px solid #EEEDEA" }}>
      <span style={{ fontSize: 14, color: "#534AB7", fontWeight: 600, cursor: "pointer" }}>완료</span>
    </div>

    <div style={{ padding: "16px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>내가 보유한 정체성 (3)</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        <AspectChip text="PM" />
        <AspectChip text="0~3세 부모" />
        <AspectChip text="테슬라 오너" />
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 4 }}>추가 가능한 정체성</div>
      <div style={{ fontSize: 11, color: "#B4B2A9", marginBottom: 12 }}>플랫폼이 큐레이션한 목록입니다 · 자기 신고 기반</div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#5F7B95", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>직업 / 전문성</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["개발자", "디자이너", "마케터", "데이터 분석가", "기획자", "연구자"].map(a => (
            <div key={a} style={{ padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: "#fff", color: "#5F5E5A", border: "1px dashed #B4B2A9", cursor: "pointer" }}>+ {a}</div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#5F7B95", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>라이프스테이지 <span style={{ color: "#B4B2A9", fontWeight: 400 }}>· 추후 확대 예정</span></div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["임신 중", "초등 학부모", "수험생 학부모"].map(a => (
            <div key={a} style={{ padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: "#fff", color: "#5F5E5A", border: "1px dashed #B4B2A9", cursor: "pointer" }}>+ {a}</div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#5F7B95", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>소유 / 경험 <span style={{ color: "#B4B2A9", fontWeight: 400 }}>· 추후 확대 예정</span></div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {["현대/기아 오너", "아이폰 사용자", "맥북 사용자"].map(a => (
            <div key={a} style={{ padding: "5px 11px", borderRadius: 999, fontSize: 11, fontWeight: 500, background: "#fff", color: "#5F5E5A", border: "1px dashed #B4B2A9", cursor: "pointer" }}>+ {a}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: "11px 14px", background: "#FFF8E5", borderRadius: 10, border: "1px solid #F0DA8E", marginTop: 16 }}>
        <div style={{ fontSize: 11, color: "#7A5F0B", lineHeight: 1.5 }}>
          <strong>안내</strong> · 정체성은 자기 신고 기반이며, 거짓 신고 시 신고 누적으로 제한될 수 있습니다. 한 번 추가한 정체성은 댓글 활동 이력과 함께 프로필에 표시됩니다.
        </div>
      </div>
    </div>
  </div>);
}

// ===== [v9.6] 룸 참여 — Aspect 선택 (단순화) =====
// v9.1의 3분기(교집합 0/1/2+)를 하나의 화면으로 통합.
// 한 화면에서 다음을 모두 다룬다:
//   - 보유한 허용 Aspect가 있으면 라디오 리스트로 표시, 선택해서 참여.
//   - 어느 쪽도 보유하지 않았으면 "정체성 추가" 옵션이 함께 보임.
//   - 허용 Aspect가 1개뿐이면 해당 옵션만 자동 선택되어 표시됨 (리스트의
//     자연스러운 케이스).
// 선택된 값은 membership.active_aspect로 저장되고, 댓글에는
// comment.aspect_snapshot으로 박힘.
function JoinAspectScreen() {
  // 시연용 데이터:
  //   이 룸의 허용 Aspect: [PM, 개발자]
  //   유저의 보유 Aspect: [PM]  → 교집합 1개(PM), 교집합 밖(개발자)은 추가 옵션으로 표시
  // [v9.6] Aspect 이름만 노출. 이전 "~~관점으로 말합니다" 설명 문구는 제거
  //   (플랫폼이 Aspect의 '관점'을 정의하는 인상을 주지 않기 위해).
  const allowedAspects = [
    { label: "PM", owned: true },
    { label: "개발자", owned: false },
  ];
  const ownedCount = allowedAspects.filter(a => a.owned).length;
  const hasAnyOwned = ownedCount > 0;

  return (<div>
    {/* [v9.8 G] 공통 헤더가 ‹ 백 + '룸 참여(Aspect 선택)' 타이틀 제공하므로
                내부 상단 바 제거. */}

    <div style={{ padding: "20px 16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <RoomThumb size={48} />
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#2C2C2A" }}>AI 프로덕트 룸</div>
          <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
            <AspectChip text="PM" size="sm" />
            <AspectChip text="개발자" size="sm" />
          </div>
        </div>
      </div>
    </div>

    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>어떤 정체성으로 참여할까요?</div>
      <div style={{ fontSize: 12, color: "#888780", lineHeight: 1.5, marginBottom: 16 }}>
        {hasAnyOwned
          ? "보유한 정체성으로 바로 참여할 수 있습니다. 이 룸이 허용하지만 아직 보유하지 않은 정체성은 추가한 뒤 참여할 수 있어요."
          : "이 룸에 참여하려면 아래 정체성 중 하나를 추가해야 합니다. 정체성은 자기 신고 기반이에요."}
      </div>

      {/* 보유한 허용 Aspect — 선택 가능한 라디오 */}
      {hasAnyOwned && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#5F7B95", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>보유한 정체성</div>
          {allowedAspects.filter(a => a.owned).map((o, i) => {
            const isSel = i === 0; // 시연: 첫 보유 Aspect가 기본 선택
            return (
              <div key={o.label} style={{ padding: "14px", background: isSel ? "#F5F9FD" : "#fff", borderRadius: 12, border: isSel ? "2px solid #85B7EB" : "1px solid #D3D1C7", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", border: isSel ? "6px solid #185FA5" : "2px solid #D3D1C7", background: "#fff", flexShrink: 0 }} />
                <AspectChip text={o.label} />
              </div>
            );
          })}
        </div>
      )}

      {/* 아직 보유하지 않은 허용 Aspect — 추가 경로 안내 */}
      {allowedAspects.some(a => !a.owned) && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#888780", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            {hasAnyOwned ? "추가하면 참여 가능한 정체성" : "이 룸이 허용하는 정체성"}
          </div>
          {allowedAspects.filter(a => !a.owned).map(o => (
            <div key={o.label} style={{ padding: "12px 14px", background: "#FAFAF8", borderRadius: 12, border: "1px dashed #D3D1C7", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px dashed #D3D1C7", background: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#B4B2A9" }}>+</div>
              <AspectChip text={o.label} />
              <span style={{ fontSize: 11, color: "#534AB7", fontWeight: 600, cursor: "pointer", flexShrink: 0, marginLeft: "auto" }}>추가하고 참여</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, color: "#B4B2A9", lineHeight: 1.5, margin: "12px 0" }}>
        * 이 선택은 이 룸에서만 적용됩니다. 다른 룸에서는 별도로 정체성을 고를 수 있어요.
      </div>

      {hasAnyOwned ? (
        <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center", marginTop: 8 }}>PM으로 참여</div>
      ) : (
        <div style={{ padding: "12px 0", background: "#fff", color: "#B4B2A9", border: "1.5px solid #D3D1C7", borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: "center", marginTop: 8 }}>정체성을 먼저 추가하세요</div>
      )}
    </div>
  </div>);
}

// ===== INFO PANEL =====
const SCREEN_INFO = {
  feed: { route: "/feed", purpose: "구독 룸들의 최신 이슈를 큰 카드로 소비하는 피드", data: ["구독 Room 아바타 바", "큰 이슈 카드: 룸 Aspect + 운영자 한 줄 + 본문 + 대표 댓글(작성자 Aspect)", "조회수/댓글수/업보트수"], cta: ["이슈 읽기", "룸 보기"], notes: "[v9] 룸 카드 헤더와 대표 댓글 작성자에 Aspect 칩 표시. 파일럿 룸을 Aspect 친화적으로 재구성: AI 프로덕트 룸(PM·개발자), 테슬라 오너 룸(테슬라 오너), 0~3세 육아 룸(0~3세 부모)." },
  issues: { route: "/issues", purpose: "공개 이슈를 빠르게 스캔·탐색하는 목록 — 본문 발췌와 정렬 축으로 읽을지 말지 결정", data: ["정렬 셀렉터(최신 / 반응 많은 / 대표 댓글 있는 / 진행 중)", "작은 이슈 카드: 룸 + 룸 Aspect + 제목 + 본문 발췌(3~5줄) + 메트릭", "우측 썸네일(선택, 56×56) — 첨부 이미지 있을 때만 노출", "종료된 이슈는 시각 후순위(opacity 낮춤)"], cta: ["정렬 변경", "이슈 읽기", "룸 보기"], notes: "[v9.8] (A) 정렬 셀렉터 도입, v9.7의 '대표 댓글 지정 이슈 우선' 고정 로직은 제거. (B) 카드 콘텐츠 재정의: 운영자 한 줄·대표 댓글 제거, 본문 발췌로 교체(썸네일 있으면 3줄, 없으면 5줄). (C) 우측 56×56 썸네일, 없으면 슬롯 생략. 스포일러는 blur. (D) Aspect 필터는 MVP 범위에서 제외 — 파일럿 규모에선 필터 종류가 적고 크로스 탐색 수요가 작음. 룸 이름 옆 Aspect 칩은 유지." },
  rooms: { route: "/rooms", purpose: "공개 룸 발견 화면", data: ["공개 Room", "룸의 Aspect", "모집 중 배지", "이슈/구독자/멤버 수"], cta: ["구독하기"], notes: "[v9.2] '모집 중' 배지 복원. 의미는 v8 이전과 다름: '신청 받는 중'이 아니라 'Aspect 맞으면 바로 참여 가능한 상태'. 모집 닫힘 룸은 배지 없음." },
  room: { route: "/rooms/:slug", purpose: "룸의 결을 느끼고 구독/참여를 결정하는 페이지", data: ["룸 정보", "모집 상태 / 운영 종료 배너", "이 룸의 시선(Aspect)", "역할별 CTA", "active_aspect(Member, 현재형/과거형)"], cta: ["구독하기", "참여하기(Subscriber)", "active_aspect 변경(Member)", "운영하기(Op)"], notes: "[v9.6] 분기 정돈: (1) Subscriber(Aspect 보유/미보유)를 같은 박스로 통합 — 카피와 버튼 라벨만 전환. (2) archived-Member / archived-Operator 추가 — 외부 Visitor/Subscriber는 도달 불가. (3) archived Member는 active_aspect를 '말했었어요' 과거형으로. (4) 모집닫힘-Subscriber는 Aspect 유무 무관하게 같은 안내. 참여 규칙: 모집중+Aspect 보유/미보유는 즉시 참여 또는 정체성 추가→참여. archived는 새 활동 불가, 읽기만." },
  issue: { route: "/rooms/:slug/issues/:id", purpose: "이슈 본문 + 대표 댓글 + 전체 댓글", data: ["이슈 전체", "룸 Aspect", "대표 댓글(작성자 Aspect)", "전체 댓글(작성자 Aspect)"], cta: ["업보트", "스크랩", "댓글 작성", "참여하기"], notes: "[v9.6] 댓글 입력 영역 4분기로 축소: Member(작성 가능), Subscriber(Aspect 보유/미보유 통합 — 같은 카피/같은 레이아웃, 버튼 라벨만 전환), Subscriber(모집 닫힘), Visitor. 모든 댓글에 작성자 Aspect 칩. Subscriber 통합 카피: '이 룸은 다음 정체성을 가진 사람이 댓글을 작성합니다. 보유하고 있다면 바로 멤버가 되고, 없다면 정체성을 추가한 뒤 참여할 수 있어요.'" },
  "aspect-add": { route: "/me/aspects/add", purpose: "전역 정체성 풀 관리 (마이페이지 전용)", data: ["보유 정체성 목록", "추가 가능한 정체성(카테고리별)", "자기 신고 안내"], cta: ["+ 정체성 추가", "완료"], notes: "[v9.6] 진입 경로를 '마이페이지 직접 추가' 하나로 통일. 이전의 '룸 댓글 시도 진입' 케이스는 join-aspect 화면과 기능 중복이어서 제거 — 룸 참여 흐름에서 정체성이 없는 유저도 join-aspect에서 '추가하고 참여'로 처리. 카테고리는 직업/전문성 우선, 라이프스테이지/소유는 '추후 확대'. 자유 입력 불가, 큐레이션 풀에서만 선택." },
  "join-aspect": { route: "/rooms/:slug/join", purpose: "이 룸에서 어떤 정체성으로 말할지 선택 — 룸 참여의 단일 진입점", data: ["룸 정보", "보유한 허용 Aspect(라디오)", "추가하면 참여 가능한 Aspect(점선 카드)"], cta: ["PM으로 참여", "추가하고 참여"], notes: "[v9.6 단일화] 룸 참여 Aspect 선택의 유일한 화면. 기존의 교집합 0/1/2+ 분기(3화면) + '룸 댓글 시도 진입' 별도 화면을 모두 통합. 보유한 허용 Aspect는 라디오 리스트로, 보유하지 않은 허용 Aspect는 '추가하고 참여' 점선 카드로 함께 표시. Aspect 칩 옆에 '~관점으로 말합니다' 같은 설명 문구 제거 — 플랫폼이 Aspect의 '관점'을 정의하지 않음. 보유 Aspect가 전혀 없으면 하단 CTA가 '정체성을 먼저 추가하세요' 비활성 버튼. 선택 결과는 membership.active_aspect에 저장." },
  mypage: { route: "/me", purpose: "개인 활동과 룸 관계 허브", data: ["프로필(Aspect 칩 포함)", "룸/이슈/댓글/정체성 4개 탭"], cta: ["룸 보기", "운영하기", "프로필 보기", "정체성 추가"], notes: "[v9.1] 정체성 탭에서 각 Aspect별 '이 정체성으로 활동 중인 룸' 리스트를 보여줌. 즉 어느 룸에서 해당 Aspect가 active_aspect로 선택되어 있는지. [v9.8] '전역 주력' 개념 제거(향후 재도입). [v9.8] 본인용 ProfileSection에 '편집' 링크 추가(→ /me/edit)." },
  profile: { route: "/users/:id", purpose: "활동과 업적 프로필", data: ["통계", "보유 정체성(활동 강도)", "대표 선정 댓글", "참여 룸"], cta: ["편집(내 프로필) → /me/edit", "정체성 추가(내 프로필)"], notes: "[v9.1] Aspect별 댓글 수/대표 선정/활동 룸 수 표시. 참여 룸 리스트에는 그 룸의 active_aspect 칩도 함께 표시. [v9.8] '전역 주력' 배지/설명 제거(향후 재도입). '편집' 버튼이 /me/edit(profile-edit 화면)으로 연결됨." },
  "profile-edit": { route: "/me/edit", purpose: "프로필 입력 / 수정 — 닉네임·한 줄 소개·아바타", data: ["아바타(편집)", "닉네임(편집, 3~16자, 중복 검증)", "한 줄 소개(편집, 80자)", "보유 정체성(읽기 전용, 정체성 관리로 이동 링크)"], cta: ["저장", "취소", "아바타 변경", "정체성 관리 → /me/aspects/add"], notes: "[v9.8 신규] 프로필 수정 전용 화면. 편집 가능 필드는 3개(아바타·닉네임·소개), 나머지는 읽기 전용으로 노출하고 변경 경로 안내. 정체성은 자기 신고 원칙 + 전용 관리 화면(aspect-add)에 분리. 통계는 이 화면에서 생략(관람용). 닉네임 중복 시 인라인 에러, 저장 중엔 CTA를 '저장 중…'으로 전환. 가입 직후 '프로필 처음 설정' 흐름에도 재사용. '전역 주력' 섹션은 제거(v9.8 F — 향후 재도입)." },
  "invite-landing": { route: "/invite/:token", purpose: "모집 닫힌 룸에 초대받은 사람에게 맥락과 가입 경로 제공", data: ["룸 소개", "이 룸의 Aspect", "초대 전용 참여 안내", "대표 이슈 미리보기"], cta: ["가입하고 정체성 추가"], notes: "[v9.4] 초대 토큰 모델 단순화: 토큰은 URL에만 존재, 사용자 계정과 무관. 소진 시점 = membership 생성 완료 순간. 유효 기간(7일) 내에는 도중 이탈해도 같은 URL로 재진입 가능. 이미 가입된 유저가 URL을 클릭하면 이 화면을 거쳐 Aspect 추가 → membership 생성 단계로. 초대의 유일한 진입점." },
  "room-settings": { route: "/operator/rooms/:id/settings", purpose: "운영자가 룸을 관리 (위임된 공간 관점)", data: ["라이프사이클 상태(draft/public/종료 요청 중/archived)", "소유권 철학 배너", "룸 정보", "이 룸의 시선(Aspect, 필수)", "이슈 초안 목록", "멤버 모집(public일 때만)", "1:1 초대 링크", "멤버 목록(Aspect 포함)"], cta: ["룸 공개(draft→public)", "저장", "운영자 사임(이양 요청)", "운영 종료 요청", "종료 요청 취소", "이슈 초안 작성/편집/발행", "1:1 링크 생성"], notes: "[v9.6] 룸 소유권 재정의: 운영자는 위임받은 관리자이며, 단독으로 룸을 archived로 바꿀 권한 없음. 상단에 '위임된 공간' 철학 배너. 하단 CTA가 '운영 종료' → '운영자 사임(이양 요청)' + '운영 종료 요청' 두 트랙으로 분리. 두 액션 모두 어드민 검토 후 결정. archived 상태에서는 모든 편집 액션 비활성화(opacity 55%, pointer-events none), 멤버 모집 토글·초대 링크·이슈 초안 섹션 모두 숨김, '보존되는 것/중단되는 것' 박스로 자산 보존 원칙 명시. 이슈 초안 섹션은 draft/public 모두에서 노출." },
  "issue-publish": { route: "/operator/rooms/:id/issues/new", purpose: "이슈 발행 / 초안 저장 / 상태 변경", data: ["제목/운영자 한 줄/질문/본문/첨부", "현재 상태 배지", "이슈 상태 라디오 그룹(초안/공개/닫힘/숨김)", "대표 이슈/스포일러 옵션"], cta: ["저장", "초안 삭제", "이슈 삭제"], notes: "[v9.6] 상태 선택 UI = 명시적 라디오 그룹 [초안, 공개, 닫힘, 숨김]. 현재 모드별로 선택 가능한 상태만 활성화, 나머지는 흐리게 비활성. 상태 전이 규칙: new→[draft,active], draft→[draft,active], active→[active,closed,hidden], closed→[closed,hidden] (닫힘 → 공개 불가 — 라디오 안내에도 명시), hidden→[hidden,active,closed] (숨김은 원상복귀 허용). 핵심 제약: 공개된 이슈는 초안으로 되돌릴 수 없음. 닫힘은 일방향(다시 공개 불가). 숨김은 실수 되돌리기 수단이므로 공개/닫힘으로 복귀 가능. 하단 CTA는 단일 '저장' 버튼만(선택한 상태로 저장됨). 5개 모드: new/draft/active/closed/hidden." },
  "rep-comment": { route: "/operator/issues/:id/comments", purpose: "대표 댓글 지정", data: ["이슈", "댓글 목록(Aspect 포함)", "현재 대표(Aspect 포함)"], cta: ["지정", "해제"], notes: "[v9] 댓글 작성자별 Aspect 칩 표시 — 운영자가 어떤 시선의 댓글을 대표로 올릴지 판단할 때 도움." },
  "operator-sign-off": { route: "/operator/rooms/:id/sign-off", purpose: "[v9.6 신규] 운영자가 사임 또는 종료를 요청하고 어드민 검토를 기다림", data: ["룸 스냅샷 정보", "소유권 철학 안내", "두 선택지(사임/종료)", "사유 입력", "검토 프로세스 안내"], cta: ["사임 요청 보내기", "종료 요청 보내기"], notes: "[v9.6 신규] 룸 소유권 재정의에 따라 추가된 화면. 운영자 단독으로 룸을 archived로 전이할 수 없고, 이 화면에서 두 가지 중 하나를 선택해 어드민에 요청. (1) 사임: 후임 운영자 지정 요청, 못 찾으면 아카이브. (2) 종료: 룸 자체 아카이브 제안. 어느 쪽이든 멤버의 댓글 자산은 보호되며, 확정 시 사전 통지가 진행됨(MVP에서는 통지 자체는 어드민 운영으로 처리)." },
};

function InfoPanel({ screenId }) {
  const info = SCREEN_INFO[screenId]; if (!info) return null;
  return (<div style={{ padding: "16px 20px", background: "#FAFAF8", borderRadius: 12, border: "1px solid #EEEDEA", fontSize: 13, color: "#444441", lineHeight: 1.6, maxWidth: 380 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 2 }}>Route</div><div style={{ fontFamily: "monospace", fontSize: 12, color: "#534AB7", background: "#F3F2FC", padding: "4px 8px", borderRadius: 6, display: "inline-block", marginBottom: 12 }}>{info.route}</div><div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>목적</div><div style={{ marginBottom: 12 }}>{info.purpose}</div><div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>핵심 데이터</div><div style={{ marginBottom: 12 }}>{info.data.map((d, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}><span style={{ color: "#AFA9EC" }}>•</span> {d}</div>)}</div><div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>주요 CTA</div><div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>{info.cta.map((c, i) => <Badge key={i} text={c} color="purple" />)}</div><div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>비고</div><div style={{ fontSize: 12, color: "#5F5E5A" }}>{info.notes}</div></div>);
}

// ===== MAIN =====
export default function WireframeViewer({
  exportMode = false,
  initialScreen = "feed",
  initialStateIndex = 0,
} = {}) {
  const resolveScreen = (screenId) =>
    SCREENS.some((screen) => screen.id === screenId) ? screenId : "feed";
  const resolveStateIndex = (screenId, stateIndex) => {
    const states = STATES[screenId] || ["기본"];
    const parsedIndex = Number(stateIndex);
    return Number.isInteger(parsedIndex) &&
      parsedIndex >= 0 &&
      parsedIndex < states.length
      ? parsedIndex
      : 0;
  };

  const [activeScreen, setActiveScreen] = useState(() =>
    resolveScreen(initialScreen),
  );
  const [activeState, setActiveState] = useState(() =>
    resolveStateIndex(resolveScreen(initialScreen), initialStateIndex),
  );

  const currentStates = STATES[activeScreen] || ["기본"];
  const currentStateName = currentStates[activeState] || currentStates[0];
  const handleScreenChange = (id) => { setActiveScreen(id); setActiveState(0); };
  const meta = SCREENS.find((s) => s.id === activeScreen);
  const renderScreen = () => {
    switch (activeScreen) {
      case "feed": return <FeedScreen state={currentStateName} />;
      case "issues": return <IssueListScreen state={currentStateName} />;
      case "rooms": return <RoomListScreen state={currentStateName} />;
      case "room": return <RoomScreen state={currentStateName} />;
      case "issue": return <IssueDetailScreen state={currentStateName} />;
      case "mypage": return <MyPageScreen state={currentStateName} />;
      case "profile": return <ProfileScreen state={currentStateName} />;
      case "profile-edit": return <ProfileEditScreen state={currentStateName} />;
      case "invite-landing": return <InviteLandingScreen state={currentStateName} />;
      case "aspect-add": return <AspectAddScreen />;
      case "join-aspect": return <JoinAspectScreen />;
      case "room-settings": return <RoomSettingsScreen state={currentStateName} />;
      case "issue-publish": return <IssuePublishScreen state={currentStateName} />;
      case "rep-comment": return <RepCommentScreen />;
      case "operator-sign-off": return <OperatorSignOffScreen state={currentStateName} />;
      default: return null;
    }
  };
  const groups = [{ key: "user", label: "사용자 화면", hint: "실제 서비스 사용자가 보게 되는 페이지" }, { key: "operator", label: "운영자 화면", hint: "운영자가 관리와 발행에 사용하는 페이지" }];
  // [v9.8 G] Phone 헤더 좌측 아이콘 컨텍스트.
  //   허브: hamburger / 상세(편집·서브 플로우): back.
  //   join-aspect / aspect-add는 링크/버튼을 타고 들어오는 서브플로우라 상세로 분류.
  const DETAIL_SCREENS = new Set([
    "issue", "profile", "profile-edit", "invite-landing",
    "aspect-add", "join-aspect",
    "room-settings", "issue-publish", "rep-comment", "operator-sign-off",
  ]);
  const isDetail = DETAIL_SCREENS.has(activeScreen);
  if (exportMode) {
    return (
      <div
        id="wireframe-capture-root"
        style={{
          fontFamily: '-apple-system, "Pretendard", sans-serif',
          background: "#ffffff",
          display: "inline-flex",
          padding: 0,
          margin: 0,
        }}
      >
        <div id="wireframe-capture-phone">
          <Phone
            activeScreen={activeScreen}
            onScreenChange={handleScreenChange}
            isDetail={isDetail}
            screenTitle={meta?.label}
            exportMode
          >
            {renderScreen()}
          </Phone>
        </div>
      </div>
    );
  }
  return (<div style={{ fontFamily: '-apple-system, "Pretendard", sans-serif', maxWidth: 920 }}><div style={{ marginBottom: 20, display: "grid", gap: 12 }}><div style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #E6E0FA", background: "#FCFBFF" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}><div><div style={{ fontSize: 12, fontWeight: 700, color: "#534AB7", marginBottom: 4 }}>1. 페이지 선택</div><div style={{ fontSize: 13, color: "#5F5E5A" }}>아래 미리보기를 다른 페이지로 바꿉니다.</div></div><Badge text={`현재: ${meta?.label || activeScreen}`} color="purple" /></div>{groups.map((g) => (<div key={g.key} style={{ marginBottom: 12 }}><div style={{ marginBottom: 6 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#7A72C5", textTransform: "uppercase", letterSpacing: "0.05em" }}>{g.label}</div><div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{g.hint}</div></div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{SCREENS.filter((s) => s.group === g.key).map((s) => (<button key={s.id} onClick={() => handleScreenChange(s.id)} style={{ padding: "7px 14px", borderRadius: 8, border: activeScreen === s.id ? "1.5px solid #534AB7" : "1px solid #D3D1C7", background: activeScreen === s.id ? "#F3F2FC" : "#fff", color: activeScreen === s.id ? "#534AB7" : "#5F5E5A", fontWeight: activeScreen === s.id ? 600 : 400, fontSize: 13, cursor: "pointer" }}>{s.label}</button>))}</div></div>))}</div><div style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #D7EBE4", background: "#F8FEFB" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}><div><div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", marginBottom: 4 }}>2. 같은 페이지 안 상태 전환</div><div style={{ fontSize: 13, color: "#5F5E5A" }}>권한·Aspect 보유·모집 상태·빈 상태 등을 바꿔 비교합니다.</div></div><Badge text={`현재: ${currentStateName}`} color="teal" /></div><div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 10 }}>기준: <span style={{ fontWeight: 600, color: "#0F6E56" }}>{meta?.label}</span></div>{currentStates.length > 1 ? (<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{currentStates.map((s, i) => (<button key={s} onClick={() => setActiveState(i)} style={{ padding: "6px 12px", borderRadius: 999, border: activeState === i ? "1.5px solid #0F6E56" : "1px solid #C7DED6", background: activeState === i ? "#E1F5EE" : "#fff", color: activeState === i ? "#0F6E56" : "#5F5E5A", fontWeight: activeState === i ? 600 : 400, fontSize: 12, cursor: "pointer" }}>{s}</button>))}</div>) : (<div style={{ fontSize: 12, color: "#888780", padding: "10px 12px", borderRadius: 10, border: "1px dashed #C7DED6", background: "#fff" }}>추가 상태 없음</div>)}</div></div><div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}><Phone activeScreen={activeScreen} onScreenChange={handleScreenChange} isDetail={isDetail} screenTitle={meta?.label}>{renderScreen()}</Phone><InfoPanel screenId={activeScreen} /></div></div>);
}
