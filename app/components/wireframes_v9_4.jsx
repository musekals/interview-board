'use client';

import { useState } from "react";

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
// D) "주력" vs "active aspect" 개념 분리
//    - 프로필의 주력은 전역 활동 기반 자동 계산.
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
  { id: "invite-landing", label: "초대 랜딩", group: "user" },
  { id: "aspect-add", label: "Aspect 추가", group: "user" },
  { id: "join-aspect", label: "룸 참여(Aspect 선택)", group: "user" },
  { id: "room-settings", label: "룸 설정", group: "operator" },
  { id: "issue-publish", label: "이슈 발행/수정", group: "operator" },
  { id: "rep-comment", label: "대표 댓글 지정", group: "operator" },
];

const STATES = {
  feed: ["기본", "구독 룸 없음(Empty)"],
  issues: ["기본", "스포일러 포함 이슈", "이슈 없음(Empty)"],
  rooms: ["Visitor", "Subscriber"],
  // [v9.4] "모집닫힘-Subscriber(초대+Aspect)" 삭제 — 초대 판정이 계정에 없으므로
  //   룸 상세 화면에서는 "초대받았음"을 알 수 없음. 초대 흐름은 invite-landing 전용.
  room: ["모집중-Visitor", "모집중-Subscriber(Aspect 없음)", "모집중-Subscriber(Aspect 보유)", "모집중-Member", "모집중-Operator", "모집닫힘-Visitor", "모집닫힘-Subscriber(Aspect 없음)", "모집닫힘-Subscriber(Aspect 보유)", "모집닫힘-Member", "모집닫힘-Operator"],
  // [v9.2] 이슈 상세의 Subscriber 댓글 입력 영역에도 모집 닫힘 분기 추가
  issue: ["Visitor", "Subscriber(Aspect 없음)", "Subscriber(Aspect 보유)", "Subscriber(모집 닫힘)", "Member/Operator", "대표 댓글 없음"],
  mypage: ["룸 탭", "이슈 탭", "댓글 탭", "정체성 탭", "구독 없음(Empty)"],
  profile: ["내 프로필", "다른 사용자 프로필"],
  "invite-landing": ["유효", "만료", "이미 멤버"],
  "aspect-add": ["룸 댓글 시도 진입", "마이페이지 직접 추가"],
  "join-aspect": ["교집합 2개", "교집합 1개(자동)"],
  "room-settings": ["기본"],
  "issue-publish": ["새 이슈", "이슈 수정"],
  "rep-comment": ["기본"],
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

function Phone({ children }) {
  return (
    <div style={{ width: 375, minHeight: 700, background: "#fff", borderRadius: 32, border: "2px solid #D3D1C7", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", flexShrink: 0 }}>
      <div style={{ height: 44, background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #EEEDEA", flexShrink: 0 }}><div style={{ width: 100, height: 6, background: "#D3D1C7", borderRadius: 3 }} /></div>
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
      <div style={{ height: 56, background: "#FAFAF8", borderTop: "1px solid #EEEDEA", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 12px", flexShrink: 0 }}>
        {[{ icon: "⌂", label: "피드" }, { icon: "☰", label: "이슈" }, { icon: "◉", label: "룸" }, { icon: "⊕", label: "마이" }].map((n, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 10, color: i === 0 ? "#534AB7" : "#888780", fontWeight: i === 0 ? 600 : 400 }}><span style={{ fontSize: 18 }}>{n.icon}</span>{n.label}</div>
        ))}
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
function CompactIssueCard({ room, roomAspects, title, opLine, repNick, repAspect, repShort, status, comments, upvotes, views, isSpoiler }) {
  return (<div style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
      <div style={{ fontSize: 11, color: "#534AB7", fontWeight: 600, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
        <RoomThumb size={14} />
        <span style={{ textDecoration: "underline", textDecorationColor: "#CEC8F6", textUnderlineOffset: 2 }}>{room}</span>
      </div>
      {roomAspects && roomAspects.map(a => <AspectChip key={a} text={a} size="sm" />)}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", lineHeight: 1.3, flex: 1 }}>{title}</span>{isSpoiler && <Badge text="스포" color="red" />}<StatusBadge status={status} /></div>
    {isSpoiler ? <div style={{ fontSize: 12, color: "#B4B2A9", fontStyle: "italic", padding: "4px 0" }}>스포일러 포함 · 탭하여 보기</div> : (<>
      {opLine && <div style={{ fontSize: 12, color: "#888780", marginBottom: 2 }}>운영자: {opLine}</div>}
      {repShort && <div style={{ fontSize: 12, color: "#5F5E5A", display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
        <span style={{ color: "#AFA9EC", fontSize: 10 }}>◆</span>
        {repNick && <span style={{ fontWeight: 600 }}>{repNick}</span>}
        {repAspect && <AspectChip text={repAspect} size="sm" />}
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{repShort}</span>
      </div>}
    </>)}
    <MetaRow comments={comments} upvotes={upvotes} views={views} compact />
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
  if (state === "이슈 없음(Empty)") return <div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>아직 공개된 이슈가 없습니다</div></div>;
  const sp = state === "스포일러 포함 이슈";
  return (<div>
    <div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>최신 이슈</div>
    <div style={{ padding: "0 16px 8px", fontSize: 11, color: "#B4B2A9" }}>대표 댓글이 지정된 이슈를 우선 노출합니다</div>
    <CompactIssueCard room="AI 프로덕트 룸" roomAspects={["PM", "개발자"]} title="OpenAI Agent SDK, 프로덕트 적용 사례" opLine="기술보다 워크플로우 설계가 핵심" repNick="@김PM" repAspect="PM" repShort="툴보다 사용자 태스크 정의가 먼저" status="진행 중" comments={28} upvotes={53} views={421} />
    {sp && <CompactIssueCard room="0~3세 육아 룸" roomAspects={["0~3세 부모"]} title="어린이집 적응기, 우리 아이 사례" isSpoiler status="진행 중" comments={45} upvotes={89} views={670} />}
    <CompactIssueCard room="0~3세 육아 룸" roomAspects={["0~3세 부모"]} title="18개월 수면 퇴행, 다들 겪으셨나요" opLine="발달 단계 vs 환경 요인" repNick="@두돌맘" repAspect="0~3세 부모" repShort="분리불안 시기와 겹친 듯합니다" status="종료" comments={18} upvotes={35} views={198} />
    <CompactIssueCard room="테슬라 오너 룸" roomAspects={["테슬라 오너"]} title="겨울철 주행거리, 어느 정도 체감하시나요" opLine="공식 수치보다 실제 체감 위주" repNick="@모델Y오너" repAspect="테슬라 오너" repShort="450 → 320km로 체감 떨어집니다" status="진행 중" comments={24} upvotes={47} views={312} />
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

// [v9.4] 룸 상세 — 초대 백도어 UI 삭제 (초대는 invite-landing 전용)
// 참여 규칙:
//   모집중 AND Aspect 맞음  → 즉시 참여
//   모집닫힘                → 룸 상세에서는 항상 막힘. 초대받은 사람은
//                            invite-landing 화면에서 가입 → 자동 Member 진입.
function RoomScreen({ state }) {
  const dashIdx = state.indexOf("-");
  const prefix = dashIdx >= 0 ? state.slice(0, dashIdx) : "모집중";
  const afterDash = dashIdx >= 0 ? state.slice(dashIdx + 1) : "Visitor";
  const isOpen = prefix === "모집중";
  const role =
    afterDash.startsWith("Subscriber") ? "Subscriber" :
    afterDash.startsWith("Member") ? "Member" :
    afterDash.startsWith("Operator") ? "Operator" : "Visitor";
  const hasAspect = afterDash === "Subscriber(Aspect 보유)";
  const isOp = role === "Operator";
  const isMember = role === "Member";
  const isSubscriber = role === "Subscriber";

  return (<div>
    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEEDEA" }}><span style={{ fontSize: 14, color: "#888780" }}>← 뒤로</span><span style={{ fontSize: 14, color: "#888780" }}>공유</span></div>
    <div style={{ padding: "16px 16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <RoomThumb size={52} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#2C2C2A", marginBottom: 4 }}>AI 프로덕트 룸</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {isOpen && <Badge text="모집 중" color="teal" />}
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
        <div style={{ fontSize: 11, color: "#888780", marginTop: 6, lineHeight: 1.4 }}>이 정체성을 가진 사람만 댓글을 작성할 수 있습니다</div>
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
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {role === "Visitor" && (
          <div style={{ flex: 1, padding: "11px 0", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>구독하기</div>
        )}
        {isSubscriber && (
          <div style={{ flex: 1, padding: "11px 0", background: "#EEEDFE", color: "#534AB7", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>구독 중 ✓</div>
        )}
        {isMember && (
          <div style={{ flex: 1, padding: "11px 0", background: "#EEEDFE", color: "#534AB7", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>멤버 · 구독 중 ✓</div>
        )}
        {isOp && (
          <div style={{ flex: 1, padding: "11px 0", background: "#EEEDFE", color: "#534AB7", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>운영자 · 구독 중 ✓</div>
        )}
        {isMember && (
          <div style={{ padding: "11px 14px", border: "1px solid #D3D1C7", color: "#888780", borderRadius: 10, fontSize: 13, textAlign: "center" }}>멤버 탈퇴</div>
        )}
        {isOp && (
          <div style={{ padding: "11px 16px", background: "#F1EFE8", color: "#5F5E5A", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>운영하기</div>
        )}
      </div>

      {/* [v9.4] Subscriber 안내 — 초대 백도어 UI 삭제. 3케이스로 단순화. */}
      {/* case A: 모집중 + Aspect 보유 → 즉시 참여 */}
      {isSubscriber && isOpen && hasAspect && (
        <div style={{ marginTop: 10, padding: "12px 14px", background: "#F5F9FD", borderRadius: 10, border: "1px solid #D6E6F3" }}>
          <div style={{ fontSize: 12, color: "#185FA5", fontWeight: 600, marginBottom: 6 }}>바로 참여할 수 있어요</div>
          <div style={{ fontSize: 11, color: "#5F5E5A", lineHeight: 1.5, marginBottom: 8, display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            보유 정체성 <AspectChip text="PM" size="sm" /> 으로 이 룸의 멤버가 될 수 있습니다
          </div>
          <div style={{ display: "inline-block", padding: "9px 18px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>PM으로 참여하기</div>
        </div>
      )}
      {/* case B: 모집중 + Aspect 미보유 → Aspect 추가 후 참여 */}
      {isSubscriber && isOpen && !hasAspect && (
        <div style={{ marginTop: 10, padding: "12px 14px", background: "#FAFAF8", borderRadius: 10, border: "1px solid #EEEDEA" }}>
          <div style={{ fontSize: 12, color: "#5F5E5A", fontWeight: 600, marginBottom: 6 }}>이 룸에 참여하려면 정체성이 필요해요</div>
          <div style={{ fontSize: 11, color: "#888780", lineHeight: 1.5, marginBottom: 8 }}>PM 또는 개발자 정체성을 추가하면 바로 참여할 수 있습니다. 자기 신고 기반입니다.</div>
          <div style={{ display: "inline-block", padding: "9px 18px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>정체성 추가하고 참여</div>
        </div>
      )}
      {/* case C: 모집 닫힘 → Aspect 유무 무관하게 막힘. 초대 여부는 이 화면에서 판정할 수 없음. */}
      {!isOpen && !isMember && !isOp && (
        <div style={{ marginTop: 10, padding: "12px 14px", background: "#FAFAF8", borderRadius: 10, border: "1px solid #EEEDEA" }}>
          <div style={{ fontSize: 12, color: "#5F5E5A", fontWeight: 600, marginBottom: 4 }}>현재 멤버 모집이 닫혀 있어요</div>
          <div style={{ fontSize: 11, color: "#888780", lineHeight: 1.5 }}>운영자가 멤버 모집을 일시적으로 닫아둔 상태입니다. 룸의 이슈와 반응은 계속 구독해서 볼 수 있어요.</div>
        </div>
      )}

      {/* Member의 active_aspect 표시 */}
      {isMember && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "#F3F2FC", borderRadius: 10, border: "1px solid #D9D5F5", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#5F5E9E", fontWeight: 600 }}>이 룸에서 나는</span>
            <AspectChip text="PM" size="sm" />
            <span style={{ fontSize: 11, color: "#5F5E9E" }}>으로 말하고 있어요</span>
          </div>
          <span style={{ fontSize: 11, color: "#534AB7", fontWeight: 600, cursor: "pointer" }}>변경</span>
        </div>
      )}
    </div>

    {isMember && (
      <div style={{ margin: "0 16px 8px", padding: "10px 14px", background: "#F9F9F6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#5F5E5A" }}>운영자에게 건의/제보</span>
        <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 600, cursor: "pointer" }}>보내기 →</span>
      </div>
    )}

    {/* 이슈 목록 */}
    {isMember || isOp ? (<>
      <SH>참여 가능한 이슈</SH>
      <RoomIssueCard title="OpenAI Agent SDK, 프로덕트 적용 사례" opLine="기술보다 워크플로우 설계가 핵심" repShort="" status="진행 중" comments={28} upvotes={53} noRepYet />
      <RoomIssueCard title="LLM 프로덕트의 평가 지표를 어떻게 잡을 것인가" opLine="정확도보다 사용자 신뢰" repNick="@김PM" repAspect="PM" repShort="태스크 완료율 + 사용자 수정 빈도..." status="진행 중" comments={36} upvotes={71} />
      <SH>지난 이슈</SH>
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
    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EEEDEA" }}><span style={{ fontSize: 14, color: "#888780" }}>← 룸으로</span><span style={{ fontSize: 14, color: "#888780" }}>공유</span></div>
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
        /* [v9.1] Member는 active_aspect로 작성한다는 힌트 표시 */
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
      ) : isSubscriberWithAspect ? (
        /* [v9.1] Aspect 보유 — 바로 Member 진입 */
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 6 }}>바로 멤버가 되어 댓글을 작성할 수 있어요</div>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
            보유 정체성 <AspectChip text="PM" size="sm" /> 으로 참여 가능
          </div>
          <div><div style={{ display: "inline-block", padding: "9px 20px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>PM으로 참여하기</div></div>
        </div>
      ) : isSubscriberNoAspect ? (
        /* [v9.1] Aspect 미보유 — Aspect 추가 후 즉시 Member */
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 6 }}>이 룸은 다음 정체성을 가진 사람만 댓글을 작성합니다</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
            <AspectChip text="PM" />
            <AspectChip text="개발자" />
          </div>
          <div style={{ display: "inline-block", padding: "9px 20px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>정체성 추가하고 참여</div>
          <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 6 }}>자기 신고 기반입니다</div>
        </div>
      ) : isSubscriberClosed ? (
        /* [v9.2] 모집 닫힘 — Aspect 유무와 관계없이 참여 불가 */
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
function ProfileScreen({ state }) {
  const isMe = state === "내 프로필";
  return (<div>
    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EEEDEA" }}><span style={{ fontSize: 14, color: "#888780" }}>← 뒤로</span>{isMe && <span style={{ fontSize: 14, color: "#534AB7", fontWeight: 600 }}>편집</span>}</div>
    <div style={{ padding: "24px 16px 16px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#534AB7", fontWeight: 700, margin: "0 auto 10px" }}>{isMe ? "K" : "J"}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A", marginBottom: 2 }}>{isMe ? "@김해석" : "@정분석"}</div>
      <div style={{ fontSize: 13, color: "#888780", marginBottom: 12 }}>{isMe ? "프로덕트로 사람을 본다" : "데이터로 세상을 봅니다"}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>{[{ label: "작성 댓글", val: isMe ? 47 : 23 }, { label: "받은 좋아요", val: isMe ? 312 : 89 }, { label: "대표 선정", val: isMe ? 8 : 3 }, { label: "구독 룸", val: isMe ? 3 : 5 }].map((s, i) => (<div key={i} style={{ flex: 1, padding: "10px 4px", background: "#F9F9F6", borderRadius: 10, textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A" }}>{s.val}</div><div style={{ fontSize: 10, color: "#888780", marginTop: 2 }}>{s.label}</div></div>))}</div>
    </div>

    {/* [v9.1] 보유 Aspect 섹션 — "전역 주력" 용어로 명확화 */}
    <SH>보유 정체성 {isMe && <span style={{ fontSize: 11, color: "#534AB7", marginLeft: 6, fontWeight: 500, cursor: "pointer" }}>+ 추가</span>}</SH>
    <div style={{ padding: "4px 16px 4px", fontSize: 11, color: "#B4B2A9" }}>전역 활동량 기준 · 각 룸에서는 따로 active aspect를 고를 수 있어요</div>
    <div style={{ padding: "8px 16px 16px" }}>
      {[
        { label: "PM", comments: 32, rep: 6, rooms: 2, primary: true },
        { label: "0~3세 부모", comments: 12, rep: 2, rooms: 1, primary: false },
        { label: "테슬라 오너", comments: 3, rep: 0, rooms: 1, primary: false },
      ].map((a, i) => (
        <div key={i} style={{ padding: "10px 12px", background: a.primary ? "#F5F9FD" : "#FAFAF8", borderRadius: 10, border: `1px solid ${a.primary ? "#D6E6F3" : "#EEEDEA"}`, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AspectChip text={a.label} />
            {a.primary && <span style={{ fontSize: 10, color: "#534AB7", fontWeight: 600 }}>전역 주력</span>}
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
    <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 600, cursor: "pointer" }}>프로필 →</span>
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
// [v9.1] 정체성 탭 — 전역 주력 + 각 룸별 active_aspect 구분 노출
function MyPageAspectTab() {
  return (<>
    <div style={{ padding: "12px 16px", fontSize: 12, color: "#888780", lineHeight: 1.5 }}>정체성별로 전역 활동 이력이 쌓입니다. 각 룸에서는 별도로 어떤 정체성으로 말할지 고를 수 있어요.</div>
    {[
      { label: "PM", comments: 32, rep: 6, activeIn: ["AI 프로덕트 룸", "LLM Eval 스터디"], primary: true },
      { label: "0~3세 부모", comments: 12, rep: 2, activeIn: ["0~3세 육아 룸"], primary: false },
      { label: "테슬라 오너", comments: 3, rep: 0, activeIn: ["테슬라 오너 룸"], primary: false },
    ].map((a, i) => (
      <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #F1EFE8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <AspectChip text={a.label} />
          {a.primary && <span style={{ fontSize: 10, color: "#534AB7", fontWeight: 600, padding: "1px 6px", background: "#EEEDFE", borderRadius: 4 }}>전역 주력</span>}
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

// ===== [v8] 룸 설정 — 초대 링크 2종 추가 =====
function RoomSettingsScreen() {
  return (<div>
    <div style={{ padding: "14px 16px 8px", fontSize: 18, fontWeight: 700, color: "#2C2C2A", borderBottom: "1px solid #EEEDEA" }}>운영자 › 룸 설정</div>
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <div><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>룸 대표 이미지</div><div style={{ display: "flex", alignItems: "center", gap: 12 }}><RoomThumb size={64} /><div style={{ padding: "8px 16px", border: "1px dashed #D3D1C7", borderRadius: 8, fontSize: 13, color: "#888780" }}>이미지 변경</div></div></div>
      {[{ label: "룸 이름", val: "AI 프로덕트 룸" }, { label: "한 줄 설명", val: "프로덕트 관점에서 AI를 봅니다" }, { label: "상세 설명", val: "기술 트렌드보다 의사결정 관점의 논의를 모읍니다", multi: true }].map(f => (<div key={f.label}><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>{f.label}</div><div style={{ padding: f.multi ? "10px 12px" : "9px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: "#2C2C2A", background: "#fff", minHeight: f.multi ? 60 : "auto" }}>{f.val}</div></div>))}

      {/* [v8.2] 이 룸의 시선 (Aspect) — 필수, 최대 3개 */}
      <div style={{ padding: "14px", background: "#F5F9FD", borderRadius: 12, border: "1.5px solid #D6E6F3" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#185FA5", marginBottom: 4 }}>이 룸의 시선 (필수)</div>
        <div style={{ fontSize: 11, color: "#5F7B95", marginBottom: 10, lineHeight: 1.5 }}>이 정체성을 가진 사람만 댓글 작성이 가능합니다. 최대 3개까지 선택할 수 있습니다.</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, background: "#E6F1FB", border: "1px solid #85B7EB", fontSize: 11, fontWeight: 600, color: "#185FA5" }}>
            ◇ PM <span style={{ color: "#85B7EB", marginLeft: 2 }}>×</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 999, background: "#E6F1FB", border: "1px solid #85B7EB", fontSize: 11, fontWeight: 600, color: "#185FA5" }}>
            ◇ 개발자 <span style={{ color: "#85B7EB", marginLeft: 2 }}>×</span>
          </div>
          <div style={{ padding: "4px 10px", borderRadius: 999, border: "1px dashed #B4B2A9", fontSize: 11, color: "#888780", cursor: "pointer" }}>+ 정체성 추가</div>
        </div>
        <div style={{ fontSize: 10, color: "#B4B2A9" }}>플랫폼 큐레이션 풀에서 선택 · 자유 입력 불가</div>
      </div>

      {/* [v9.3] 멤버 모집 — 기본 "닫힘" 선택 상태로 시연. 실제 서비스에서는 운영자가 토글 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>멤버 모집</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["닫힘", "열림"].map((t, i) => (
            <div key={t} style={{ flex: 1, padding: "10px 0", border: i === 0 ? "2px solid #185FA5" : "1px solid #D3D1C7", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: i === 0 ? "#185FA5" : "#888780", background: i === 0 ? "#F5F9FD" : "#fff" }}>{t}</div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 6, lineHeight: 1.4 }}>닫힘: 초대 링크를 받은 사람만 참여 가능 · 열림: 정체성 맞으면 누구나 참여 가능</div>
      </div>

      {/* [v9.3] 1:1 초대 링크 — "모집 닫힘"일 때만 노출됨. 공유용 5회용 링크 삭제. */}
      {/* 와이어프레임에서는 위 멤버 모집이 "닫힘"인 시연 상태이므로 이 블록을 그대로 보여줌 */}
      <div style={{ padding: "14px", background: "#F5F9FD", borderRadius: 12, border: "1px solid #D6E6F3" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#185FA5" }}>1:1 초대 링크</div>
            <div style={{ fontSize: 11, color: "#5F7B95", marginTop: 2 }}>1회용 · 7일 만료</div>
          </div>
          <div style={{ padding: "8px 14px", background: "#534AB7", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>링크 생성</div>
        </div>
        <div style={{ fontSize: 11, color: "#5F5E5A", lineHeight: 1.5, marginBottom: 8 }}>모집이 닫힌 상태에서 특정인에게만 선별적으로 참여 권한을 주는 장치입니다. 버튼을 누를 때마다 새 링크가 생성됩니다. 링크를 받은 사람은 본인의 정체성이 룸 조건과 맞으면 참여할 수 있습니다.</div>
        <div style={{ fontSize: 10, color: "#B4B2A9" }}>※ 모집이 &quot;열림&quot; 상태가 되면 이 섹션은 숨겨집니다 — 누구나 참여 가능하므로 초대가 불필요</div>
      </div>

      <div><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>공개 상태</div><div style={{ display: "flex", gap: 8 }}>{["비공개", "공개"].map((t, i) => (<div key={t} style={{ flex: 1, padding: "10px 0", border: i === 1 ? "2px solid #0F6E56" : "1px solid #D3D1C7", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: i === 1 ? "#0F6E56" : "#888780", background: i === 1 ? "#E1F5EE" : "#fff" }}>{t}</div>))}</div></div>
      <div><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>멤버 관리</div>{[{ nick: "@PM박", aspect: "PM" }, { nick: "@개발자L", aspect: "개발자" }].map(u => (<div key={u.nick} style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1EFE8" }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 14, color: "#2C2C2A" }}>{u.nick}</span><AspectChip text={u.aspect} size="sm" /></div><span style={{ fontSize: 12, color: "#993C1D", fontWeight: 500 }}>제거</span></div>))}<div style={{ marginTop: 8, padding: "9px 12px", border: "1px dashed #D3D1C7", borderRadius: 10, fontSize: 13, color: "#888780", textAlign: "center" }}>+ 사용자 검색 후 추가</div></div>
      <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center", marginTop: 8 }}>저장</div>
    </div>
  </div>);
}

// ===== 이슈 발행 (v6 그대로) =====
function IssuePublishScreen({ state }) {
  const isEdit = state === "이슈 수정";
  return (<div><div style={{ padding: "14px 16px 8px", fontSize: 18, fontWeight: 700, color: "#2C2C2A", borderBottom: "1px solid #EEEDEA" }}>운영자 › {isEdit ? "이슈 수정" : "새 이슈 발행"}</div><div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>{[{ label: "제목", val: isEdit ? "FSD 한국 도입, 올해 안 가능할까?" : "", ph: "이슈 제목을 입력하세요" }, { label: "운영자 한 줄", val: isEdit ? "일정보다 가격/체감이 핵심" : "", ph: "이 이슈를 어떤 관점으로 볼지 한 줄로" }, { label: "질문 (선택)", val: "", ph: "댓글을 끌어낼 질문" }, { label: "본문", val: isEdit ? "이번 FSD 도입 논의에서..." : "", ph: "본문을 입력하세요", multi: true }].map(f => (<div key={f.label}><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>{f.label}</div><div style={{ padding: f.multi ? "10px 12px" : "9px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: f.val ? "#2C2C2A" : "#B4B2A9", background: "#fff", minHeight: f.multi ? 80 : "auto" }}>{f.val || f.ph}</div></div>))}<div style={{ padding: 20, border: "1px dashed #D3D1C7", borderRadius: 10, textAlign: "center", color: "#888780", fontSize: 13 }}>이미지 / 링크 / 유튜브 첨부</div><div><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>이슈 상태</div><div style={{ display: "flex", gap: 6 }}>{["초안", "진행 중", "종료", "숨김"].map((s, i) => (<div key={s} style={{ flex: 1, padding: "8px 0", border: i === 1 ? "2px solid #0F6E56" : "1px solid #D3D1C7", borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 600, color: i === 1 ? "#0F6E56" : i === 0 ? "#854F0B" : i === 3 ? "#A32D2D" : "#888780", background: i === 1 ? "#E1F5EE" : i === 0 ? "#FAEEDA" : i === 3 ? "#FCEBEB" : "#fff" }}>{s}</div>))}</div><div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 4 }}>초안 = 임시저장(운영자만 보임) · 숨김 = 공개 후 비노출 처리</div></div><div style={{ display: "flex", gap: 8 }}><div style={{ flex: 1, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: "#F9F9F6", borderRadius: 10 }}><div style={{ width: 20, height: 20, border: "2px solid #D3D1C7", borderRadius: 4 }} /><span style={{ fontSize: 13, color: "#5F5E5A" }}>대표 이슈로 설정</span></div><div style={{ flex: 1, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: "#FCEBEB", borderRadius: 10 }}><div style={{ width: 20, height: 20, border: "2px solid #F09595", borderRadius: 4, background: "#fff" }} /><span style={{ fontSize: 13, color: "#A32D2D" }}>스포일러 포함</span></div></div><div style={{ fontSize: 11, color: "#B4B2A9", marginTop: -8 }}>스포일러 체크 시 목록에서 본문이 숨겨집니다</div><div style={{ display: "flex", gap: 8, marginTop: 8 }}><div style={{ flex: 1, padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center" }}>{isEdit ? "수정" : "발행"}</div>{isEdit && <div style={{ padding: "12px 16px", background: "#FAECE7", color: "#993C1D", borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: "center" }}>삭제</div>}</div></div></div>);
}

// ===== 대표 댓글 지정 =====
// [v8.2] 댓글 작성자 Aspect 칩 표시 — 운영자가 어떤 시선의 댓글을 대표로 고를지 판단에 도움
function RepCommentScreen() {
  return (<div>
    <div style={{ padding: "14px 16px 8px", fontSize: 18, fontWeight: 700, color: "#2C2C2A", borderBottom: "1px solid #EEEDEA" }}>운영자 › 대표 댓글 지정</div>
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

// ===== [v8.2 신규] Aspect 추가 화면 =====
// 진입 경로: (1) 룸 댓글 시도 시 자동, (2) 마이페이지에서 직접
function AspectAddScreen({ state }) {
  const fromRoom = state === "룸 댓글 시도 진입";
  return (<div>
    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEEDEA" }}>
      <span style={{ fontSize: 14, color: "#888780" }}>← 닫기</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>정체성 추가</span>
      <span style={{ fontSize: 14, color: "#534AB7", fontWeight: 600 }}>완료</span>
    </div>

    {fromRoom && (
      <div style={{ padding: "14px 16px", background: "#F5F9FD", borderBottom: "1px solid #D6E6F3" }}>
        <div style={{ fontSize: 12, color: "#5F7B95", fontWeight: 600, marginBottom: 4 }}>AI 프로덕트 룸에 참여하려면</div>
        <div style={{ fontSize: 13, color: "#2C2C2A", marginBottom: 8 }}>다음 중 하나의 정체성이 필요합니다</div>
        <div style={{ display: "flex", gap: 6 }}>
          <AspectChip text="PM" />
          <AspectChip text="개발자" />
        </div>
      </div>
    )}

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

// ===== [v9.1 신규] 룸 참여 — Aspect 선택 화면 =====
// 유저가 룸 허용 Aspect를 2개 이상 보유했을 때, 이 룸에서 어떤 정체성으로
// 말할지 선택하는 단계. 1개면 이 화면 없이 자동 선택, 0개면 aspect-add로 유도.
// 선택된 값은 membership.active_aspect로 저장되고, 해당 룸의 댓글에는
// 이 값이 comment.aspect_snapshot으로 박힘.
function JoinAspectScreen({ state }) {
  const singleMatch = state === "교집합 1개(자동)";
  return (<div>
    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEEDEA" }}>
      <span style={{ fontSize: 14, color: "#888780" }}>← 뒤로</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A" }}>룸 참여</span>
      <span style={{ fontSize: 14, color: "#B4B2A9" }}> </span>
    </div>

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

    {singleMatch ? (
      // 교집합 1개 — 자동 선택 확인 화면
      <div style={{ padding: "0 16px" }}>
        <div style={{ padding: "16px", background: "#F5F9FD", borderRadius: 12, border: "1px solid #D6E6F3", marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "#5F7B95", fontWeight: 600, marginBottom: 8 }}>이 룸에서 다음 정체성으로 참여합니다</div>
          <div style={{ marginBottom: 8 }}><AspectChip text="PM" /></div>
          <div style={{ fontSize: 11, color: "#888780", lineHeight: 1.5 }}>보유하신 정체성 중 이 룸이 허용하는 건 하나입니다. 나중에 다른 정체성을 추가하면 이 룸 설정에서 변경할 수 있어요.</div>
        </div>
        <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center" }}>PM으로 참여</div>
      </div>
    ) : (
      // 교집합 2개 이상 — 유저가 고름
      <div style={{ padding: "0 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>어떤 정체성으로 참여할까요?</div>
        <div style={{ fontSize: 12, color: "#888780", lineHeight: 1.5, marginBottom: 16 }}>이 룸의 댓글에는 여기서 고른 정체성이 표시됩니다. 나중에 이 룸 설정에서 변경할 수 있어요.</div>

        {[
          { label: "PM", sel: true, desc: "프로덕트 의사결정 관점으로 말합니다" },
          { label: "개발자", sel: false, desc: "기술 구현 관점으로 말합니다" },
        ].map((o, i) => (
          <div key={i} style={{ padding: "14px", background: o.sel ? "#F5F9FD" : "#fff", borderRadius: 12, border: o.sel ? "2px solid #85B7EB" : "1px solid #D3D1C7", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: o.sel ? "6px solid #185FA5" : "2px solid #D3D1C7", background: "#fff", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 4 }}><AspectChip text={o.label} /></div>
              <div style={{ fontSize: 12, color: "#5F5E5A" }}>{o.desc}</div>
            </div>
          </div>
        ))}

        <div style={{ fontSize: 11, color: "#B4B2A9", lineHeight: 1.5, margin: "12px 0" }}>
          * 이 선택은 이 룸에서만 적용됩니다. 프로필의 &quot;전역 주력&quot; 정체성과는 별개예요.
        </div>

        <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center", marginTop: 8 }}>PM으로 참여</div>
      </div>
    )}
  </div>);
}

// ===== INFO PANEL =====
const SCREEN_INFO = {
  feed: { route: "/feed", purpose: "구독 룸들의 최신 이슈를 큰 카드로 소비하는 피드", data: ["구독 Room 아바타 바", "큰 이슈 카드: 룸 Aspect + 운영자 한 줄 + 본문 + 대표 댓글(작성자 Aspect)", "조회수/댓글수/업보트수"], cta: ["이슈 읽기", "룸 보기"], notes: "[v9] 룸 카드 헤더와 대표 댓글 작성자에 Aspect 칩 표시. 파일럿 룸을 Aspect 친화적으로 재구성: AI 프로덕트 룸(PM·개발자), 테슬라 오너 룸(테슬라 오너), 0~3세 육아 룸(0~3세 부모)." },
  issues: { route: "/issues", purpose: "공개 이슈를 빠르게 스캔하는 탐색 목록", data: ["작은 이슈 카드: 룸 Aspect + 제목 + 운영자 한 줄 + 대표 댓글(Aspect)"], cta: ["이슈 읽기", "룸 보기"], notes: "[v9] 룸 이름 옆에 Aspect 칩, 대표 댓글 작성자 옆에도 Aspect 칩." },
  rooms: { route: "/rooms", purpose: "공개 룸 발견 화면", data: ["공개 Room", "룸의 Aspect", "모집 중 배지", "이슈/구독자/멤버 수"], cta: ["구독하기"], notes: "[v9.2] '모집 중' 배지 복원. 의미는 v8 이전과 다름: '신청 받는 중'이 아니라 'Aspect 맞으면 바로 참여 가능한 상태'. 모집 닫힘 룸은 배지 없음." },
  room: { route: "/rooms/:slug", purpose: "룸의 결을 느끼고 구독/참여를 결정하는 페이지", data: ["룸 정보", "모집 상태", "이 룸의 시선(Aspect)", "역할별 CTA", "active_aspect(Member)"], cta: ["구독하기", "PM으로 참여하기 (모집중+Aspect)", "정체성 추가하고 참여 (모집중)", "active_aspect 변경(Member)", "운영하기(Op)"], notes: "[v9.4] 참여 규칙 단순화: (모집중 AND Aspect) 일 때만 즉시 참여. 모집 닫힘은 Aspect 유무 무관하게 막힘. 초대받은 사람의 진입은 이 화면이 아니라 invite-landing 화면에서만 처리 — 룸 상세는 '이 사람이 초대받았는지'를 알 수 없음(사용자 계정에 초대 이력을 남기지 않는 모델). Subscriber 상태는 3케이스(모집중+Aspect보유/모집중+Aspect미보유/모집닫힘)." },
  issue: { route: "/rooms/:slug/issues/:id", purpose: "이슈 본문 + 대표 댓글 + 전체 댓글", data: ["이슈 전체", "룸 Aspect", "대표 댓글(작성자 Aspect)", "전체 댓글(작성자 Aspect)"], cta: ["업보트", "스크랩", "댓글 작성"], notes: "[v9.2] 모든 댓글에 작성자 Aspect 칩. 댓글 입력 영역 5상태: Member는 'PM으로 댓글 작성 중' 힌트+변경 링크, Subscriber(Aspect 보유)는 'PM으로 참여하기', Subscriber(Aspect 미보유)는 '정체성 추가하고 참여', Subscriber(모집 닫힘)은 '모집 닫혀 있어요' 안내만(초대 유무는 이 화면에서 분기하지 않음 — 초대 흐름은 룸 상세에서 처리), Visitor는 구독 유도." },
  "aspect-add": { route: "/me/aspects/add", purpose: "자기 정체성을 자기 신고로 추가", data: ["보유 정체성 목록", "추가 가능한 정체성(카테고리별)", "자기 신고 안내"], cta: ["+ 정체성 추가", "완료"], notes: "[v9] 두 가지 진입 경로: (1) 룸에서 댓글 시도 시 자동 진입, (2) 마이페이지 정체성 탭에서 직접 추가. 카테고리는 직업/전문성 우선, 라이프스테이지/소유는 '추후 확대'. 자유 입력 불가, 큐레이션 풀에서만 선택. 추가 후 join-aspect 또는 룸 상세로 복귀." },
  "join-aspect": { route: "/rooms/:slug/join", purpose: "[v9.1 신규] 이 룸에서 어떤 정체성으로 말할지 선택", data: ["룸 정보", "유저 보유 × 룸 허용 교집합", "라디오 선택 UI"], cta: ["PM으로 참여", "개발자로 참여"], notes: "[v9.1 신규] Aspect 4레이어 분리의 UX 반영. 교집합이 2개 이상일 때만 노출; 1개면 자동 선택(확인 화면), 0개면 aspect-add로 유도. 선택 결과는 membership.active_aspect에 저장되며, 이 룸의 댓글에는 이 값이 comment.aspect_snapshot으로 박힘. 프로필의 '전역 주력'과는 분리된 개념임을 화면 하단 주석으로 명시." },
  mypage: { route: "/me", purpose: "개인 활동과 룸 관계 허브", data: ["프로필(Aspect 칩 포함)", "룸/이슈/댓글/정체성 4개 탭"], cta: ["룸 보기", "운영하기", "프로필 보기", "정체성 추가"], notes: "[v9.1] 정체성 탭에서 각 Aspect별 '이 정체성으로 활동 중인 룸' 리스트를 보여줌. 즉 어느 룸에서 해당 Aspect가 active_aspect로 선택되어 있는지. 전역 주력은 활동량 기반 자동 계산 — 룸별 active_aspect와 별개." },
  profile: { route: "/users/:id", purpose: "활동과 업적 프로필", data: ["통계", "보유 정체성(전역 활동 강도)", "대표 선정 댓글", "참여 룸"], cta: ["편집(내 프로필)", "정체성 추가(내 프로필)"], notes: "[v9.1] '전역 주력' 용어로 명확화. 각 Aspect에 댓글 수/대표 선정/활동 룸 수 표시. 참여 룸 리스트에는 그 룸의 active_aspect 칩도 함께 표시." },
  "invite-landing": { route: "/invite/:token", purpose: "모집 닫힌 룸에 초대받은 사람에게 맥락과 가입 경로 제공", data: ["룸 소개", "이 룸의 Aspect", "초대 전용 참여 안내", "대표 이슈 미리보기"], cta: ["가입하고 정체성 추가"], notes: "[v9.4] 초대 토큰 모델 단순화: 토큰은 URL에만 존재, 사용자 계정과 무관. 소진 시점 = membership 생성 완료 순간. 유효 기간(7일) 내에는 도중 이탈해도 같은 URL로 재진입 가능. 이미 가입된 유저가 URL을 클릭하면 이 화면을 거쳐 Aspect 추가 → membership 생성 단계로. 초대의 유일한 진입점 — 룸 상세에서는 초대 판정 불가능하므로 '초대받은 사람이 룸 상세로 바로 간다'는 경로 자체가 없음." },
  "room-settings": { route: "/operator/rooms/:id/settings", purpose: "운영자가 룸을 관리", data: ["룸 정보", "이 룸의 시선(Aspect, 필수)", "멤버 모집 열림/닫힘", "1:1 초대 링크(모집 닫힘일 때만)", "공개 상태", "멤버 목록(Aspect 포함)"], cta: ["정체성 추가/제거", "1:1 링크 생성", "저장"], notes: "[v9.3] 공유용 초대 링크(5회용) 섹션 삭제. 1:1 초대 링크만 유지되며, 모집 상태가 '닫힘'일 때만 이 섹션이 노출되도록 함(와이어프레임 시연에서는 기본 선택을 '닫힘'으로 두어 섹션이 보이도록 함). 멤버 모집 토글 아래에 '닫힘: 초대 링크를 받은 사람만 참여 가능 · 열림: 정체성 맞으면 누구나 참여 가능' 설명 추가." },
  "issue-publish": { route: "/operator/rooms/:id/issues/new", purpose: "이슈 발행/수정", data: ["제목/운영자 한 줄/질문/본문/첨부", "상태/대표 이슈/스포일러"], cta: ["발행", "수정", "삭제"], notes: "Aspect는 룸 단위에 묶이므로 이슈 발행 시점의 변경은 없음." },
  "rep-comment": { route: "/operator/issues/:id/comments", purpose: "대표 댓글 지정", data: ["이슈", "댓글 목록(Aspect 포함)", "현재 대표(Aspect 포함)"], cta: ["지정", "해제"], notes: "[v9] 댓글 작성자별 Aspect 칩 표시 — 운영자가 어떤 시선의 댓글을 대표로 올릴지 판단할 때 도움." },
};

function InfoPanel({ screenId }) {
  const info = SCREEN_INFO[screenId]; if (!info) return null;
  return (<div style={{ padding: "16px 20px", background: "#FAFAF8", borderRadius: 12, border: "1px solid #EEEDEA", fontSize: 13, color: "#444441", lineHeight: 1.6, maxWidth: 380 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 2 }}>Route</div><div style={{ fontFamily: "monospace", fontSize: 12, color: "#534AB7", background: "#F3F2FC", padding: "4px 8px", borderRadius: 6, display: "inline-block", marginBottom: 12 }}>{info.route}</div><div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>목적</div><div style={{ marginBottom: 12 }}>{info.purpose}</div><div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>핵심 데이터</div><div style={{ marginBottom: 12 }}>{info.data.map((d, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}><span style={{ color: "#AFA9EC" }}>•</span> {d}</div>)}</div><div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>주요 CTA</div><div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>{info.cta.map((c, i) => <Badge key={i} text={c} color="purple" />)}</div><div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>비고</div><div style={{ fontSize: 12, color: "#5F5E5A" }}>{info.notes}</div></div>);
}

// ===== MAIN =====
export default function WireframeViewer() {
  const [activeScreen, setActiveScreen] = useState("feed");
  const [activeState, setActiveState] = useState(0);
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
      case "invite-landing": return <InviteLandingScreen state={currentStateName} />;
      case "aspect-add": return <AspectAddScreen state={currentStateName} />;
      case "join-aspect": return <JoinAspectScreen state={currentStateName} />;
      case "room-settings": return <RoomSettingsScreen />;
      case "issue-publish": return <IssuePublishScreen state={currentStateName} />;
      case "rep-comment": return <RepCommentScreen />;
      default: return null;
    }
  };
  const groups = [{ key: "user", label: "사용자 화면", hint: "실제 서비스 사용자가 보게 되는 페이지" }, { key: "operator", label: "운영자 화면", hint: "운영자가 관리와 발행에 사용하는 페이지" }];
  return (<div style={{ fontFamily: '-apple-system, "Pretendard", sans-serif', maxWidth: 920 }}><div style={{ marginBottom: 20, display: "grid", gap: 12 }}><div style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #E6E0FA", background: "#FCFBFF" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}><div><div style={{ fontSize: 12, fontWeight: 700, color: "#534AB7", marginBottom: 4 }}>1. 페이지 선택</div><div style={{ fontSize: 13, color: "#5F5E5A" }}>아래 미리보기를 다른 페이지로 바꿉니다.</div></div><Badge text={`현재: ${meta?.label || activeScreen}`} color="purple" /></div>{groups.map((g) => (<div key={g.key} style={{ marginBottom: 12 }}><div style={{ marginBottom: 6 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#7A72C5", textTransform: "uppercase", letterSpacing: "0.05em" }}>{g.label}</div><div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{g.hint}</div></div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{SCREENS.filter((s) => s.group === g.key).map((s) => (<button key={s.id} onClick={() => handleScreenChange(s.id)} style={{ padding: "7px 14px", borderRadius: 8, border: activeScreen === s.id ? "1.5px solid #534AB7" : "1px solid #D3D1C7", background: activeScreen === s.id ? "#F3F2FC" : "#fff", color: activeScreen === s.id ? "#534AB7" : "#5F5E5A", fontWeight: activeScreen === s.id ? 600 : 400, fontSize: 13, cursor: "pointer" }}>{s.label}</button>))}</div></div>))}</div><div style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #D7EBE4", background: "#F8FEFB" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}><div><div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", marginBottom: 4 }}>2. 같은 페이지 안 상태 전환</div><div style={{ fontSize: 13, color: "#5F5E5A" }}>권한·Aspect 보유·모집 상태·빈 상태 등을 바꿔 비교합니다.</div></div><Badge text={`현재: ${currentStateName}`} color="teal" /></div><div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 10 }}>기준: <span style={{ fontWeight: 600, color: "#0F6E56" }}>{meta?.label}</span></div>{currentStates.length > 1 ? (<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{currentStates.map((s, i) => (<button key={s} onClick={() => setActiveState(i)} style={{ padding: "6px 12px", borderRadius: 999, border: activeState === i ? "1.5px solid #0F6E56" : "1px solid #C7DED6", background: activeState === i ? "#E1F5EE" : "#fff", color: activeState === i ? "#0F6E56" : "#5F5E5A", fontWeight: activeState === i ? 600 : 400, fontSize: 12, cursor: "pointer" }}>{s}</button>))}</div>) : (<div style={{ fontSize: 12, color: "#888780", padding: "10px 12px", borderRadius: 10, border: "1px dashed #C7DED6", background: "#fff" }}>추가 상태 없음</div>)}</div></div><div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}><Phone>{renderScreen()}</Phone><InfoPanel screenId={activeScreen} /></div></div>);
}
