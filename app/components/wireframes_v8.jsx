'use client';

import { useState } from "react";

const SCREENS = [
  { id: "feed", label: "내 피드(홈)", group: "user" },
  { id: "issues", label: "이슈 목록", group: "user" },
  { id: "rooms", label: "룸 목록", group: "user" },
  { id: "room", label: "룸 상세", group: "user" },
  { id: "issue", label: "이슈 상세", group: "user" },
  { id: "mypage", label: "마이페이지", group: "user" },
  { id: "profile", label: "프로필", group: "user" },
  { id: "invite-landing", label: "초대 랜딩", group: "user" },
  { id: "room-settings", label: "룸 설정", group: "operator" },
  { id: "issue-publish", label: "이슈 발행/수정", group: "operator" },
  { id: "rep-comment", label: "대표 댓글 지정", group: "operator" },
];

const STATES = {
  feed: ["기본", "구독 룸 없음(Empty)"],
  issues: ["기본", "스포일러 포함 이슈", "이슈 없음(Empty)"],
  rooms: ["Visitor", "Subscriber"],
  // [v8] 멤버 모집 룸: 초대 링크 기반. Member(공유가능)=공유용 링크 활성 상태
  room: ["멤버모집-Visitor", "멤버모집-Subscriber", "멤버모집-Member", "멤버모집-Member(공유가능)", "멤버모집-Operator", "모집안함-Visitor", "모집안함-Subscriber", "모집안함-Member", "모집안함-Operator"],
  issue: ["Visitor", "Subscriber(구독만)", "Member/Operator", "대표 댓글 없음"],
  mypage: ["룸 탭", "이슈 탭", "댓글 탭", "구독 없음(Empty)"],
  profile: ["내 프로필", "다른 사용자 프로필"],
  "invite-landing": ["유효", "만료", "이미 멤버"],
  "room-settings": ["기본"],
  "issue-publish": ["새 이슈", "이슈 수정"],
  "rep-comment": ["기본"],
};

function Badge({ text, color }) {
  const C = { blue: { bg: "#E6F1FB", t: "#185FA5", b: "#85B7EB" }, green: { bg: "#EAF3DE", t: "#3B6D11", b: "#97C459" }, gray: { bg: "#F1EFE8", t: "#5F5E5A", b: "#B4B2A9" }, amber: { bg: "#FAEEDA", t: "#854F0B", b: "#EF9F27" }, purple: { bg: "#EEEDFE", t: "#534AB7", b: "#AFA9EC" }, teal: { bg: "#E1F5EE", t: "#0F6E56", b: "#5DCAA5" }, red: { bg: "#FCEBEB", t: "#A32D2D", b: "#F09595" }, coral: { bg: "#FAECE7", t: "#993C1D", b: "#F0997B" } };
  const c = C[color] || C.gray;
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: c.bg, color: c.t, border: `1px solid ${c.b}` }}>{text}</span>;
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
function BigIssueCard({ room, title, opLine, body, repNick, repComment, status, comments, upvotes, views, hasImage }) {
  return (<div style={{ padding: "18px 16px", borderBottom: "6px solid #F1EFE8" }}><div style={{ fontSize: 11, color: "#534AB7", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}><RoomThumb size={20} /><span style={{ textDecoration: "underline", textDecorationColor: "#CEC8F6", textUnderlineOffset: 2 }}>{room}</span></div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><span style={{ fontSize: 17, fontWeight: 700, color: "#2C2C2A", lineHeight: 1.35, flex: 1 }}>{title}</span><StatusBadge status={status} /></div>{opLine && <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 6, fontStyle: "italic" }}><span style={{ fontWeight: 500, fontStyle: "normal", color: "#888780" }}>운영자: </span>{opLine}</div>}<div style={{ fontSize: 13, color: "#444441", lineHeight: 1.55, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{body}</div>{hasImage && <ImgPlaceholder h={180} />}{repComment && (<div style={{ background: "#F9F9F6", padding: "12px 14px", borderRadius: 10, borderLeft: "3px solid #AFA9EC", marginTop: 10 }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#534AB7" }}>{repNick}</span><Badge text="대표" color="purple" /></div><div style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{repComment}</div></div>)}<MetaRow comments={comments} upvotes={upvotes} views={views} /></div>);
}
function CompactIssueCard({ room, title, opLine, repShort, status, comments, upvotes, views, isSpoiler }) {
  return (<div style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA" }}><div style={{ fontSize: 11, color: "#534AB7", fontWeight: 600, marginBottom: 3, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}><RoomThumb size={14} /><span style={{ textDecoration: "underline", textDecorationColor: "#CEC8F6", textUnderlineOffset: 2 }}>{room}</span></div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}><span style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", lineHeight: 1.3, flex: 1 }}>{title}</span>{isSpoiler && <Badge text="스포" color="red" />}<StatusBadge status={status} /></div>{isSpoiler ? <div style={{ fontSize: 12, color: "#B4B2A9", fontStyle: "italic", padding: "4px 0" }}>스포일러 포함 · 탭하여 보기</div> : (<>{opLine && <div style={{ fontSize: 12, color: "#888780", marginBottom: 2 }}>운영자: {opLine}</div>}{repShort && <div style={{ fontSize: 12, color: "#5F5E5A", display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: "#AFA9EC", fontSize: 10 }}>◆</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{repShort}</span></div>}</>)}<MetaRow comments={comments} upvotes={upvotes} views={views} compact /></div>);
}
function RoomIssueCard({ title, opLine, repShort, status, comments, upvotes, noRepYet }) {
  return (<div style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA" }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>{noRepYet && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#534AB7", flexShrink: 0 }} />}<span style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", lineHeight: 1.3, flex: 1 }}>{title}</span><StatusBadge status={status} /></div>{opLine && <div style={{ fontSize: 12, color: "#888780", marginBottom: 2, fontStyle: "italic" }}>운영자: {opLine}</div>}{repShort ? <div style={{ fontSize: 12, color: "#5F5E5A", display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: "#AFA9EC", fontSize: 10 }}>◆</span>{repShort}</div> : <div style={{ fontSize: 11, color: "#B4B2A9", fontStyle: "italic" }}>아직 대표 댓글 없음</div>}<MetaRow comments={comments} upvotes={upvotes} compact /></div>);
}
function Comment({ nick, text, upvotes, time, replies, isRep }) {
  return (<div style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 13, fontWeight: 600, color: "#444441" }}>{nick}</span>{isRep && <Badge text="대표" color="purple" />}</div><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 11, color: "#B4B2A9" }}>{time}</span><span style={{ fontSize: 11, color: "#B4B2A9" }}>⚑</span></div></div><div style={{ fontSize: 14, color: "#444441", lineHeight: 1.5 }}>{text}</div><div style={{ marginTop: 8, display: "flex", gap: 14, fontSize: 12, color: "#888780" }}><span>▲ {upvotes}</span><span>↩ 답글</span><span>⊞ 스크랩</span></div>{replies && replies.length > 0 && (<div style={{ marginTop: 8, marginLeft: 16, borderLeft: "2px solid #EEEDEA", paddingLeft: 12 }}>{replies.map((r, i) => (<div key={i} style={{ paddingBottom: 8, marginBottom: i < replies.length - 1 ? 8 : 0, borderBottom: i < replies.length - 1 ? "1px solid #F1EFE8" : "none" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}><span style={{ fontSize: 12, fontWeight: 600, color: "#5F5E5A" }}>{r.nick}</span><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 11, color: "#B4B2A9" }}>{r.time}</span><span style={{ fontSize: 11, color: "#B4B2A9" }}>⚑</span></div></div><div style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.45 }}>{r.text}</div><div style={{ marginTop: 4, display: "flex", gap: 12, fontSize: 11, color: "#B4B2A9" }}><span>▲ {r.upvotes}</span><span>↩ 답글</span><span>⊞ 스크랩</span></div></div>))}</div>)}</div>);
}

// ========= SCREENS =========
function SubscribedRoomBar() {
  const rooms = [{ name: "테슬라", color: "#FAEEDA" }, { name: "나솔", color: "#EEEDFE" }, { name: "리벨", color: "#E1F5EE" }];
  return (<div style={{ padding: "10px 16px", borderBottom: "1px solid #EEEDEA", display: "flex", alignItems: "center", gap: 10 }}>{rooms.map((r, i) => (<div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}><RoomThumb size={36} color={r.color} /><span style={{ fontSize: 10, color: "#888780" }}>{r.name}</span></div>))}<div style={{ fontSize: 11, color: "#B4B2A9", marginLeft: "auto" }}>3개 룸 구독 중</div></div>);
}

function FeedScreen({ state }) {
  if (state === "구독 룸 없음(Empty)") return (<div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📭</div><div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A", marginBottom: 8 }}>아직 구독한 룸이 없습니다</div><div style={{ fontSize: 13, color: "#888780", marginBottom: 20, lineHeight: 1.5 }}>관심 있는 룸을 구독하면<br />이슈와 반응이 여기에 모입니다</div><div style={{ display: "inline-block", padding: "10px 24px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>룸 둘러보기</div></div>);
  return (<div><div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>내 피드</div><SubscribedRoomBar /><BigIssueCard room="테슬라 한국 실사용자 룸" title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격/체감이 핵심이라 봅니다" body="이번 FSD 도입 논의에서 가장 핵심적인 부분은 일정 자체가 아니라 가격 구조와 실제 체감 성능입니다." repNick="@닉A" repComment="도입보다 과금 구조가 더 관건이라는 이야기가 많은데, 실제로 한국 시장에서 FSD 월정액 모델이 성립하려면 OTA 체감 품질이 먼저 올라와야 합니다." status="진행 중" comments={24} upvotes={47} views={312} hasImage /><BigIssueCard room="나는 솔로 해석 룸" title="이번 선택, 진짜 의도였을까?" opLine="행동보다 편집 포인트에 주목해주세요" body="이번 장면은 표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다." repNick="@닉B" repComment="이번 장면은 호감 표현이 아니라 편집 의도가 드러나는 순간이라고 봅니다. 시선 처리와 카메라 배치를 보면, 제작진이 '이 사람은 전략적이다'라는 프레임을 씌우고 있어요." status="진행 중" comments={31} upvotes={62} views={487} hasImage /><BigIssueCard room="리벨북스 비문학 스터디" title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 집중합시다" body="저자가 3장에서 제기하는 문제의식은 결론 부분보다 오히려 초반의 질문 자체에 더 큰 무게가 있습니다." repNick="@닉E" repComment="오히려 이 대목이 저자의 핵심 논점입니다. 결론에서 말하는 것보다 3장 초반에 던진 질문의 구조가 이 책 전체를 관통하고 있습니다." status="종료" comments={18} upvotes={35} views={198} /></div>);
}

function IssueListScreen({ state }) {
  if (state === "이슈 없음(Empty)") return <div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>아직 공개된 이슈가 없습니다</div></div>;
  const sp = state === "스포일러 포함 이슈";
  return (<div><div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>최신 이슈</div><div style={{ padding: "0 16px 8px", fontSize: 11, color: "#B4B2A9" }}>대표 댓글이 지정된 이슈를 우선 노출합니다</div><CompactIssueCard room="나는 솔로 해석 룸" title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" repShort="@닉D 이건 호감보다 계산에 가까워 보입니다" status="진행 중" comments={28} upvotes={53} views={421} />{sp && <CompactIssueCard room="나는 솔로 해석 룸" title="최종 선택 결과 분석" isSpoiler status="진행 중" comments={45} upvotes={89} views={670} />}<CompactIssueCard room="리벨북스 비문학 스터디" title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 주목" repShort="@닉E 오히려 이 대목이 더 중요합니다" status="종료" comments={18} upvotes={35} views={198} /><CompactIssueCard room="테슬라 한국 실사용자 룸" title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격/체감이 핵심" repShort="@닉A 도입보다 과금 구조가 관건" status="진행 중" comments={24} upvotes={47} views={312} /></div>);
}

// [v8] 룸 목록 — 멤버 신청 버튼 제거, 구독 CTA만
function RoomListScreen({ state }) {
  const rooms = [
    { name: "나는 솔로 해석 룸", desc: "감정보다 맥락과 편집으로 봅니다", acceptMember: false, issues: 12, subs: 84 },
    { name: "테슬라 한국 실사용자 룸", desc: "루머보다 해석, 드립보다 이유", acceptMember: true, issues: 18, subs: 156 },
    { name: "리벨북스 비문학 스터디", desc: "저자의 질문을 함께 읽습니다", acceptMember: false, issues: 8, subs: 47 },
  ];
  return (<div><div style={{ padding: "14px 16px 4px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>공개 룸</div><div style={{ padding: "4px 16px 12px", fontSize: 13, color: "#888780", lineHeight: 1.5 }}>결 맞는 룸을 구독하고, 이슈와 반응을 내 피드로 모아보세요</div>{rooms.map((r, i) => (<div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid #EEEDEA" }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><RoomThumb size={44} /><div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 600, color: "#2C2C2A" }}>{r.name}</div><div style={{ fontSize: 12, color: "#888780" }}>{r.desc}</div></div></div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>{r.acceptMember && <Badge text="멤버 모집 중" color="teal" />}<span style={{ fontSize: 11, color: "#B4B2A9" }}>이슈 {r.issues}개 · 구독자 {r.subs}명</span></div><div style={{ flex: 1, padding: "8px 0", background: "#534AB7", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: "center" }}>{state === "Subscriber" ? "구독 중 ✓" : "구독하기"}</div></div>))}</div>);
}

// [v8] 룸 상세 — 초대 링크 기반, 멤버 신청 제거
function RoomScreen({ state }) {
  const isShareable = state === "멤버모집-Member(공유가능)";
  const cleanState = isShareable ? "멤버모집-Member" : state;
  const parts = cleanState.split("-");
  const acceptMember = parts[0] === "멤버모집";
  const role = parts[1] || "Visitor";
  const isOp = role === "Operator";
  const isMember = role === "Member";

  return (<div>
    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEEDEA" }}><span style={{ fontSize: 14, color: "#888780" }}>← 뒤로</span><span style={{ fontSize: 14, color: "#888780" }}>공유</span></div>
    <div style={{ padding: "16px 16px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}><RoomThumb size={52} /><div style={{ flex: 1 }}><div style={{ fontSize: 19, fontWeight: 700, color: "#2C2C2A", marginBottom: 2 }}>나는 솔로 해석 룸</div><div style={{ display: "flex", alignItems: "center", gap: 6 }}>{acceptMember && <Badge text="멤버 모집 중" color="teal" />}<span style={{ fontSize: 11, color: "#B4B2A9" }}>구독자 84명</span></div></div></div>
      <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 10 }}>감정보다 맥락과 편집으로 봅니다</div>

      {isMember ? (
        <div style={{ fontSize: 12, color: "#B4B2A9", padding: "6px 0", marginBottom: 8, cursor: "pointer" }}>▸ 룸 소개 보기</div>
      ) : (
        <div style={{ fontSize: 13, color: "#444441", background: "#F9F9F6", padding: "12px 14px", borderRadius: 10, lineHeight: 1.6, marginBottom: 12, whiteSpace: "pre-line" }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: "#888780", marginBottom: 6 }}>이 방은 이렇게 봅니다</div>
          {"• 장면의 의도와 편집 포인트를 같이 봅니다\n• 한 줄 반응보다 이유 있는 댓글을 중시합니다"}
        </div>
      )}

      {/* [v8] CTA: 구독 + 역할별 보조 */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {role === "Visitor" ? (
          <div style={{ flex: 1, padding: "11px 0", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>구독하기</div>
        ) : (
          <div style={{ flex: 1, padding: "11px 0", background: "#EEEDFE", color: "#534AB7", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>구독 중 ✓</div>
        )}
        {/* [v8] Member: 공유용 링크 활성 시에만 공유 버튼 */}
        {isShareable && (
          <div style={{ padding: "11px 14px", background: "#E1F5EE", color: "#0F6E56", borderRadius: 10, fontSize: 13, fontWeight: 600, textAlign: "center", border: "1.5px solid #5DCAA5" }}>지인에게 공유</div>
        )}
        {isMember && (
          <div style={{ padding: "11px 14px", border: "1px solid #D3D1C7", color: "#888780", borderRadius: 10, fontSize: 13, textAlign: "center" }}>멤버 탈퇴</div>
        )}
        {isOp && (
          <div style={{ padding: "11px 16px", background: "#F1EFE8", color: "#5F5E5A", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>운영하기</div>
        )}
      </div>

      {/* [v8] 초대 안내 — 멤버 신청 대신 */}
      {acceptMember && !isMember && !isOp && (
        <div style={{ marginTop: 10, padding: "10px 14px", background: "#F8FEFB", borderRadius: 10, border: "1px solid #D7EBE4" }}>
          <div style={{ fontSize: 12, color: "#0F6E56", fontWeight: 600, marginBottom: 4 }}>참여는 초대 링크로 열립니다</div>
          <div style={{ fontSize: 11, color: "#5F5E5A", lineHeight: 1.5 }}>초대 링크가 있으면 바로 참여할 수 있어요</div>
        </div>
      )}
    </div>

    {/* Member: 건의/제보 */}
    {isMember && (
      <div style={{ margin: "0 16px 8px", padding: "10px 14px", background: "#F9F9F6", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: "#5F5E5A" }}>운영자에게 건의/제보</span>
        <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 600, cursor: "pointer" }}>보내기 →</span>
      </div>
    )}

    {/* 이슈 목록 */}
    {isMember ? (<>
      <SH>참여 가능한 이슈</SH>
      <RoomIssueCard title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" repShort="" status="진행 중" comments={28} upvotes={53} noRepYet />
      <RoomIssueCard title="이번 회차의 진짜 전환점은 어디였나" opLine="말보다 침묵의 장면이 핵심" repShort="@닉A 이건 대사보다 연출 의도를..." status="진행 중" comments={36} upvotes={71} noRepYet={false} />
      <SH>지난 이슈</SH>
      <RoomIssueCard title="지난 회차, 가장 갈린 장면은?" opLine="행동보다 맥락으로 봐주세요" repShort="@닉C 그 장면은 연출 의도가 확실히..." status="종료" comments={22} upvotes={41} noRepYet={false} />
    </>) : (<>
      <SH>대표 이슈</SH>
      <div style={{ margin: "0 16px 8px", padding: 14, border: "1.5px solid #AFA9EC", borderRadius: 12, background: "#FCFCFA" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>이번 회차의 진짜 전환점은 어디였나</div>
        <div style={{ fontSize: 12, color: "#5F5E5A", fontStyle: "italic", marginBottom: 4 }}>운영자: 말보다 침묵의 장면이 핵심</div>
        <div style={{ fontSize: 12, color: "#2C2C2A", background: "#F3F2FC", padding: "6px 10px", borderRadius: 6 }}><span style={{ color: "#534AB7", fontWeight: 600, fontSize: 11 }}>대표</span> @닉A 이건 대사보다 연출 의도를...</div>
        <MetaRow comments={36} upvotes={71} compact />
      </div>
      <SH>최신 이슈</SH>
      <RoomIssueCard title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" repShort="@닉B 이건 호감보다 연출에 가까워..." status="진행 중" comments={28} upvotes={53} noRepYet={false} />
      <RoomIssueCard title="지난 회차, 가장 갈린 장면은?" opLine="행동보다 맥락으로 봐주세요" repShort="@닉C 그 장면은 연출 의도가 확실히..." status="종료" comments={22} upvotes={41} noRepYet={false} />
    </>)}
  </div>);
}

// [v8] 이슈 상세 — 하단 CTA 카피 변경
function IssueDetailScreen({ state }) {
  const canComment = state === "Member/Operator"; const isSubscriber = state === "Subscriber(구독만)"; const noRep = state === "대표 댓글 없음";
  const [sort, setSort] = useState("popular");
  return (<div>
    <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EEEDEA" }}><span style={{ fontSize: 14, color: "#888780" }}>← 룸으로</span><span style={{ fontSize: 14, color: "#888780" }}>공유</span></div>
    <div style={{ padding: "12px 16px 0" }}><span style={{ padding: "3px 10px", background: "#EEEDFE", color: "#534AB7", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationColor: "#CEC8F6", textUnderlineOffset: 2 }}>나는 솔로 해석 룸</span></div>
    <div style={{ padding: "12px 16px" }}>
      <div style={{ fontSize: 19, fontWeight: 700, color: "#2C2C2A", lineHeight: 1.35, marginBottom: 6 }}>이번 데이트 선택, 어떻게 읽히나</div>
      <div style={{ fontSize: 12, color: "#B4B2A9", marginBottom: 10 }}>2025.03.15</div>
      <div style={{ fontSize: 13, color: "#5F5E5A", fontStyle: "italic", marginBottom: 10, padding: "6px 0", borderBottom: "1px solid #F1EFE8" }}><span style={{ fontWeight: 500, fontStyle: "normal", color: "#888780" }}>운영자: </span>&quot;행동보다 편집 포인트에 주목해주세요&quot;</div>
      <div style={{ fontSize: 13, color: "#534AB7", background: "#F3F2FC", padding: "8px 12px", borderRadius: 8, marginBottom: 10, fontWeight: 500 }}>질문: 이 선택은 감정보다 전략에 가까웠나?</div>
      <div style={{ fontSize: 14, color: "#444441", lineHeight: 1.65, padding: "14px 0", borderTop: "1px solid #EEEDEA", borderBottom: "1px solid #EEEDEA" }}>이번 장면은 표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다...<ImgPlaceholder h={100} /></div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #EEEDEA" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 20, border: "1.5px solid #D3D1C7", fontSize: 13, fontWeight: 600, color: "#5F5E5A" }}><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3l1.5 3.3 3.5.5-2.5 2.5.6 3.5L8 11.1l-3.1 1.7.6-3.5L3 6.8l3.5-.5z" fill="#888780"/></svg>업보트 53</div>
          <div style={{ padding: "6px 10px", borderRadius: 20, border: "1.5px solid #D3D1C7", fontSize: 12, color: "#888780" }}>⊞ 스크랩</div>
          <div style={{ padding: "6px 10px", borderRadius: 20, border: "1.5px solid #D3D1C7", fontSize: 12, color: "#B4B2A9" }}>⚑ 신고</div>
        </div>
        <div style={{ fontSize: 12, color: "#B4B2A9" }}>댓글 28 · 조회 421</div>
      </div>
    </div>
    {!noRep && <div style={{ padding: "0 16px 12px" }}><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>대표 댓글</div><div style={{ padding: "10px 14px", background: "#F3F2FC", borderRadius: 10, borderLeft: "3px solid #7F77DD" }}><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><span style={{ fontSize: 13, fontWeight: 600, color: "#534AB7" }}>@닉A</span><Badge text="대표" color="purple" /></div><div style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.5 }}>이 장면은 호감 표현이 아니라 편집 의도가 드러나는 순간이라고 봅니다...</div></div></div>}
    <div style={{ padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}><SH>전체 댓글</SH><div style={{ display: "flex", gap: 4, fontSize: 12 }}>{[{ k: "popular", l: "인기순" }, { k: "latest", l: "최신순" }].map(s => (<span key={s.k} onClick={() => setSort(s.k)} style={{ padding: "4px 10px", borderRadius: 6, background: sort === s.k ? "#2C2C2A" : "#F1EFE8", color: sort === s.k ? "#fff" : "#888780", fontWeight: sort === s.k ? 600 : 400, cursor: "pointer" }}>{s.l}</span>))}</div></div>
    <Comment nick="@닉C" text="나는 전략보다 감정이라고 봤는데, 편집 타이밍이 확실히 의도적이긴 합니다." upvotes={12} time="2시간 전" replies={[{ nick: "@닉D", text: "동의합니다. 마지막 리액션 컷이 핵심인 것 같아요.", upvotes: 5, time: "1시간 전" }]} />
    <Comment nick="@닉F" text="편집보다는 출연자 본인의 선택이 더 크다고 봅니다." upvotes={8} time="3시간 전" replies={[]} />
    <div style={{ padding: "12px 16px", borderTop: "1px solid #EEEDEA", background: "#FAFAF8" }}>
      {canComment ? (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ flex: 1, height: 38, border: "1px solid #D3D1C7", borderRadius: 10, padding: "0 12px", display: "flex", alignItems: "center", fontSize: 13, color: "#B4B2A9", background: "#fff" }}>댓글을 입력하세요...</div><div style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #D3D1C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#888780", background: "#fff", flexShrink: 0 }}>📷</div><div style={{ padding: "8px 14px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>작성</div></div>
      ) : isSubscriber ? (
        /* [v8] 초대 안내로 변경 */
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#888780", marginBottom: 6 }}>댓글은 멤버만 작성할 수 있어요</div>
          <div style={{ fontSize: 12, color: "#B4B2A9", lineHeight: 1.5 }}>참여는 초대 링크로 열립니다</div>
          <div style={{ display: "inline-block", padding: "8px 16px", border: "1px solid #D3D1C7", borderRadius: 8, fontSize: 12, color: "#5F5E5A", marginTop: 8, cursor: "pointer" }}>이 룸에서 참여 방법 보기</div>
        </div>
      ) : (
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 13, color: "#888780", marginBottom: 8 }}>댓글은 멤버만 작성할 수 있습니다</div><div style={{ display: "inline-block", padding: "9px 20px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>이 룸 구독하러 가기</div></div>
      )}
    </div>
  </div>);
}

// ===== 프로필 =====
function ProfileScreen({ state }) {
  const isMe = state === "내 프로필";
  return (<div><div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EEEDEA" }}><span style={{ fontSize: 14, color: "#888780" }}>← 뒤로</span>{isMe && <span style={{ fontSize: 14, color: "#534AB7", fontWeight: 600 }}>편집</span>}</div><div style={{ padding: "24px 16px 16px", textAlign: "center" }}><div style={{ width: 72, height: 72, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#534AB7", fontWeight: 700, margin: "0 auto 10px" }}>{isMe ? "K" : "J"}</div><div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A", marginBottom: 2 }}>{isMe ? "@김해석" : "@정분석"}</div><div style={{ fontSize: 13, color: "#888780", marginBottom: 16 }}>{isMe ? "콘텐츠를 맥락으로 읽는 사람" : "데이터로 세상을 봅니다"}</div><div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>{[{ label: "작성 댓글", val: isMe ? 47 : 23 }, { label: "받은 좋아요", val: isMe ? 312 : 89 }, { label: "대표 선정", val: isMe ? 8 : 3 }, { label: "구독 룸", val: isMe ? 3 : 5 }].map((s, i) => (<div key={i} style={{ flex: 1, padding: "10px 4px", background: "#F9F9F6", borderRadius: 10, textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A" }}>{s.val}</div><div style={{ fontSize: 10, color: "#888780", marginTop: 2 }}>{s.label}</div></div>))}</div></div><SH>대표로 선정된 댓글</SH>{[{ text: "도입보다 과금 구조가 더 관건이라는 이야기가...", issue: "FSD 한국 도입", room: "테슬라 한국 실사용자 룸" }, { text: "이 장면은 호감보다 편집 의도가 드러나는 순간...", issue: "이번 선택, 진짜 의도?", room: "나는 솔로 해석 룸" }].map((c, i) => (<div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid #F1EFE8" }}><div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.45, marginBottom: 4 }}>{c.text}</div><div style={{ fontSize: 11, color: "#B4B2A9" }}>→ {c.issue} · {c.room}</div></div>))}<SH>최근 댓글</SH>{[{ text: "편집보다 출연자 의도가 더 크다고 봅니다.", issue: "이번 데이트 선택", time: "2시간 전" }, { text: "3장 후반부 논증 구조가 좀 약한 것 같습니다.", issue: "이번 장의 핵심 질문", time: "1일 전" }].map((c, i) => (<div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid #F1EFE8" }}><div style={{ fontSize: 13, color: "#444441", marginBottom: 2 }}>{c.text}</div><div style={{ fontSize: 11, color: "#B4B2A9" }}>→ {c.issue} · {c.time}</div></div>))}<SH>참여 중인 룸</SH>{["나는 솔로 해석 룸", "테슬라 한국 실사용자 룸"].map((r, i) => (<div key={i} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1EFE8" }}><RoomThumb size={28} /><span style={{ fontSize: 14, color: "#2C2C2A" }}>{r}</span></div>))}</div>);
}

// ===== 마이페이지 (v6 그대로, 초대 탭 없음) =====
function MyPageScreen({ state }) {
  if (state === "구독 없음(Empty)") return (<div><div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>마이페이지</div><ProfileSection /><div style={{ padding: "60px 24px", textAlign: "center", color: "#888780", fontSize: 14 }}>아직 활동 내역이 없습니다</div></div>);
  const at = state === "이슈 탭" ? 1 : state === "댓글 탭" ? 2 : 0;
  return (<div><div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>마이페이지</div><ProfileSection /><div style={{ display: "flex", borderBottom: "2px solid #EEEDEA" }}>{["룸", "이슈", "댓글"].map((t, i) => (<div key={t} style={{ flex: 1, padding: "12px 0", textAlign: "center", fontSize: 14, fontWeight: at === i ? 600 : 400, color: at === i ? "#534AB7" : "#888780", borderBottom: at === i ? "2px solid #534AB7" : "none", marginBottom: -2 }}>{t}</div>))}</div>{at === 0 && <MyPageRoomTab />}{at === 1 && <MyPageIssueTab />}{at === 2 && <MyPageCommentTab />}</div>);
}
function ProfileSection() { return (<div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #EEEDEA" }}><div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#534AB7", fontWeight: 600 }}>K</div><div style={{ flex: 1 }}><div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>@김해석</div><div style={{ fontSize: 12, color: "#888780" }}>콘텐츠를 맥락으로 읽는 사람</div></div><span style={{ fontSize: 12, color: "#534AB7", fontWeight: 600, cursor: "pointer" }}>프로필 →</span></div>); }
function RI({ name, color, icon, action }) { const C = { purple: { bg: "#EEEDFE", t: "#534AB7" }, teal: { bg: "#E1F5EE", t: "#0F6E56" }, amber: { bg: "#FAEEDA", t: "#854F0B" } }; const c = C[color] || C.purple; return (<div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1EFE8" }}><div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: c.t }}>{icon}</div><span style={{ fontSize: 14, color: "#2C2C2A", flex: 1 }}>{name}</span>{action && <span style={{ padding: "4px 10px", background: "#F1EFE8", borderRadius: 6, fontSize: 12, color: "#5F5E5A", fontWeight: 600 }}>{action}</span>}</div>); }
function MyPageRoomTab() { return (<><SH>구독 중</SH><RI name="나는 솔로 해석 룸" color="purple" icon="◈" /><RI name="리벨북스 비문학 스터디" color="purple" icon="◈" /><SH>참여 중</SH><RI name="흑백요리사 해석 룸" color="teal" icon="◈" /><SH>운영 중</SH><RI name="테슬라 한국 실사용자 룸" color="amber" icon="★" action="운영하기" /></>); }
function ST({ tabs, active, onSelect }) { return (<div style={{ display: "flex", gap: 6, padding: "10px 16px" }}>{tabs.map(s => (<span key={s.k} onClick={() => onSelect(s.k)} style={{ padding: "5px 12px", borderRadius: 20, background: active === s.k ? "#2C2C2A" : "#F1EFE8", color: active === s.k ? "#fff" : "#888780", fontSize: 12, fontWeight: active === s.k ? 600 : 400, cursor: "pointer" }}>{s.l}</span>))}</div>); }
function MI({ title, room }) { return (<div style={{ padding: "10px 16px", borderBottom: "1px solid #F1EFE8" }}><div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 2 }}>{title}</div><div style={{ fontSize: 11, color: "#888780" }}>{room}</div></div>); }
function MC({ nick, text, issue }) { return (<div style={{ padding: "10px 16px", borderBottom: "1px solid #F1EFE8" }}><div style={{ fontSize: 12, fontWeight: 600, color: "#5F5E5A", marginBottom: 2 }}>{nick}</div><div style={{ fontSize: 13, color: "#444441", marginBottom: 2 }}>{text}</div><div style={{ fontSize: 11, color: "#B4B2A9" }}>→ {issue}</div></div>); }
function MyPageIssueTab() { const [s, setS] = useState("scrap"); return (<><ST tabs={[{ k: "scrap", l: "스크랩" }, { k: "written", l: "작성" }, { k: "upvoted", l: "업보트" }]} active={s} onSelect={setS} />{s === "scrap" && <><MI title="이번 데이트 선택" room="나는 솔로 해석 룸" /><MI title="올해 테슬라 가격 전략" room="테슬라 한국 실사용자 룸" /></>}{s === "written" && <MI title="FSD 한국 도입" room="테슬라 한국 실사용자 룸" />}{s === "upvoted" && <><MI title="이번 장의 핵심 질문" room="리벨북스 비문학 스터디" /><MI title="이번 선택, 진짜 의도?" room="나는 솔로 해석 룸" /></>}</>); }
function MyPageCommentTab() { const [s, setS] = useState("scrap"); return (<><ST tabs={[{ k: "scrap", l: "스크랩" }, { k: "written", l: "작성" }, { k: "upvoted", l: "업보트" }]} active={s} onSelect={setS} />{s === "scrap" && <MC nick="@닉A" text="도입보다 과금 구조가 더 관건..." issue="FSD 한국 도입" />}{s === "written" && <><MC nick="나" text="편집보다 출연자 의도가 더 크다고 봅니다." issue="이번 데이트 선택" /><MC nick="나" text="3장 후반부 논증 구조가 좀 약합니다." issue="이번 장의 핵심 질문" /></>}{s === "upvoted" && <MC nick="@닉B" text="호감보다 편집 의도가 드러나는 순간..." issue="이번 선택, 진짜 의도?" />}</>); }

// ===== [v8] 룸 설정 — 초대 링크 2종 추가 =====
function RoomSettingsScreen() {
  return (<div>
    <div style={{ padding: "14px 16px 8px", fontSize: 18, fontWeight: 700, color: "#2C2C2A", borderBottom: "1px solid #EEEDEA" }}>운영자 › 룸 설정</div>
    <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <div><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>룸 대표 이미지</div><div style={{ display: "flex", alignItems: "center", gap: 12 }}><RoomThumb size={64} /><div style={{ padding: "8px 16px", border: "1px dashed #D3D1C7", borderRadius: 8, fontSize: 13, color: "#888780" }}>이미지 변경</div></div></div>
      {[{ label: "룸 이름", val: "테슬라 한국 실사용자 룸" }, { label: "한 줄 설명", val: "루머보다 해석, 드립보다 이유" }, { label: "상세 설명", val: "실사용/가격/정책 관점의 반응을 모읍니다", multi: true }].map(f => (<div key={f.label}><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>{f.label}</div><div style={{ padding: f.multi ? "10px 12px" : "9px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: "#2C2C2A", background: "#fff", minHeight: f.multi ? 60 : "auto" }}>{f.val}</div></div>))}

      {/* [v8] 멤버 모집 */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>멤버 모집</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["닫힘", "열림"].map((t, i) => (
            <div key={t} style={{ flex: 1, padding: "10px 0", border: i === 1 ? "2px solid #0F6E56" : "1px solid #D3D1C7", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: i === 1 ? "#0F6E56" : "#888780", background: i === 1 ? "#E1F5EE" : "#fff" }}>{t}</div>
          ))}
        </div>
      </div>

      {/* [v8] 1:1 초대 링크 — 일회성 액션 */}
      <div style={{ padding: "14px", background: "#F9F9F6", borderRadius: 12, border: "1px solid #EEEDEA" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A" }}>1:1 초대 링크</div>
            <div style={{ fontSize: 11, color: "#888780", marginTop: 2 }}>1회용 · 7일 만료</div>
          </div>
          <div style={{ padding: "8px 14px", background: "#534AB7", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>링크 생성</div>
        </div>
        <div style={{ fontSize: 11, color: "#B4B2A9", lineHeight: 1.5 }}>버튼을 누를 때마다 새 링크가 생성됩니다. 특정 사람에게 DM이나 카톡으로 직접 전달하세요.</div>
      </div>

      {/* [v8] 공유용 초대 링크 */}
      <div style={{ padding: "14px", background: "#F8FEFB", borderRadius: 12, border: "1px solid #D7EBE4" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A" }}>공유용 초대 링크</div>
            <div style={{ fontSize: 11, color: "#0F6E56", marginTop: 2 }}>5회용 · 7일 · 활성 중</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ padding: "7px 12px", background: "#E1F5EE", color: "#0F6E56", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid #5DCAA5" }}>링크 복사</div>
            <div style={{ padding: "7px 12px", background: "#fff", color: "#888780", borderRadius: 8, fontSize: 12, border: "1px solid #D3D1C7" }}>중지</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#5F5E5A", lineHeight: 1.5, marginBottom: 6 }}>멤버가 지인에게 전달할 수 있는 링크입니다. 활성 상태에서만 룸 상세의 멤버에게 &quot;지인에게 공유&quot; 버튼이 보입니다.</div>
        <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#B4B2A9" }}>
          <span>사용: 2/5</span>
          <span>만료: 3일 후</span>
        </div>
      </div>

      <div><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>공개 상태</div><div style={{ display: "flex", gap: 8 }}>{["비공개", "공개"].map((t, i) => (<div key={t} style={{ flex: 1, padding: "10px 0", border: i === 1 ? "2px solid #0F6E56" : "1px solid #D3D1C7", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: i === 1 ? "#0F6E56" : "#888780", background: i === 1 ? "#E1F5EE" : "#fff" }}>{t}</div>))}</div></div>
      <div><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>멤버 관리</div>{["@userA", "@userB"].map(u => (<div key={u} style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1EFE8" }}><span style={{ fontSize: 14, color: "#2C2C2A" }}>{u}</span><span style={{ fontSize: 12, color: "#993C1D", fontWeight: 500 }}>제거</span></div>))}<div style={{ marginTop: 8, padding: "9px 12px", border: "1px dashed #D3D1C7", borderRadius: 10, fontSize: 13, color: "#888780", textAlign: "center" }}>+ 사용자 검색 후 추가</div></div>
      <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center", marginTop: 8 }}>저장</div>
    </div>
  </div>);
}

// ===== 이슈 발행 (v6 그대로) =====
function IssuePublishScreen({ state }) {
  const isEdit = state === "이슈 수정";
  return (<div><div style={{ padding: "14px 16px 8px", fontSize: 18, fontWeight: 700, color: "#2C2C2A", borderBottom: "1px solid #EEEDEA" }}>운영자 › {isEdit ? "이슈 수정" : "새 이슈 발행"}</div><div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>{[{ label: "제목", val: isEdit ? "FSD 한국 도입, 올해 안 가능할까?" : "", ph: "이슈 제목을 입력하세요" }, { label: "운영자 한 줄", val: isEdit ? "일정보다 가격/체감이 핵심" : "", ph: "이 이슈를 어떤 관점으로 볼지 한 줄로" }, { label: "질문 (선택)", val: "", ph: "댓글을 끌어낼 질문" }, { label: "본문", val: isEdit ? "이번 FSD 도입 논의에서..." : "", ph: "본문을 입력하세요", multi: true }].map(f => (<div key={f.label}><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>{f.label}</div><div style={{ padding: f.multi ? "10px 12px" : "9px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: f.val ? "#2C2C2A" : "#B4B2A9", background: "#fff", minHeight: f.multi ? 80 : "auto" }}>{f.val || f.ph}</div></div>))}<div style={{ padding: 20, border: "1px dashed #D3D1C7", borderRadius: 10, textAlign: "center", color: "#888780", fontSize: 13 }}>이미지 / 링크 / 유튜브 첨부</div><div><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>이슈 상태</div><div style={{ display: "flex", gap: 6 }}>{["초안", "진행 중", "종료", "숨김"].map((s, i) => (<div key={s} style={{ flex: 1, padding: "8px 0", border: i === 1 ? "2px solid #0F6E56" : "1px solid #D3D1C7", borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 600, color: i === 1 ? "#0F6E56" : i === 0 ? "#854F0B" : i === 3 ? "#A32D2D" : "#888780", background: i === 1 ? "#E1F5EE" : i === 0 ? "#FAEEDA" : i === 3 ? "#FCEBEB" : "#fff" }}>{s}</div>))}</div><div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 4 }}>초안 = 임시저장(운영자만 보임) · 숨김 = 공개 후 비노출 처리</div></div><div style={{ display: "flex", gap: 8 }}><div style={{ flex: 1, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: "#F9F9F6", borderRadius: 10 }}><div style={{ width: 20, height: 20, border: "2px solid #D3D1C7", borderRadius: 4 }} /><span style={{ fontSize: 13, color: "#5F5E5A" }}>대표 이슈로 설정</span></div><div style={{ flex: 1, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, background: "#FCEBEB", borderRadius: 10 }}><div style={{ width: 20, height: 20, border: "2px solid #F09595", borderRadius: 4, background: "#fff" }} /><span style={{ fontSize: 13, color: "#A32D2D" }}>스포일러 포함</span></div></div><div style={{ fontSize: 11, color: "#B4B2A9", marginTop: -8 }}>스포일러 체크 시 목록에서 본문이 숨겨집니다</div><div style={{ display: "flex", gap: 8, marginTop: 8 }}><div style={{ flex: 1, padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center" }}>{isEdit ? "수정" : "발행"}</div>{isEdit && <div style={{ padding: "12px 16px", background: "#FAECE7", color: "#993C1D", borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: "center" }}>삭제</div>}</div></div></div>);
}

// ===== 대표 댓글 지정 (v6 그대로) =====
function RepCommentScreen() {
  return (<div><div style={{ padding: "14px 16px 8px", fontSize: 18, fontWeight: 700, color: "#2C2C2A", borderBottom: "1px solid #EEEDEA" }}>운영자 › 대표 댓글 지정</div><div style={{ padding: 16 }}><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>이슈</div><div style={{ padding: "10px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: "#2C2C2A", background: "#fff", marginBottom: 16 }}>FSD 한국 도입, 올해 안 가능할까?</div></div><div style={{ padding: "0 16px 12px" }}><div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>현재 대표 댓글 (1개)</div><div style={{ padding: "10px 14px", background: "#F3F2FC", borderRadius: 10, borderLeft: "3px solid #7F77DD", display: "flex", alignItems: "flex-start", gap: 10 }}><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#534AB7", marginBottom: 3 }}>@닉A</div><div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.45 }}>도입보다 과금 구조가 더 관건이라는 이야기가...</div></div><span style={{ padding: "4px 10px", background: "#FAECE7", color: "#993C1D", borderRadius: 6, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>해제</span></div></div><SH>전체 댓글</SH>{[{ nick: "@닉B", text: "이번 건은 일정 자체보다 인프라 준비가..." }, { nick: "@닉C", text: "오히려 OTA 체감이 더 중요한 포인트라고..." }, { nick: "@닉D", text: "국내 가격 포지셔닝이 결국 핵심일 것..." }].map((c, i) => (<div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#444441", marginBottom: 4 }}>{c.nick}</div><div style={{ fontSize: 13, color: "#444441", lineHeight: 1.45 }}>{c.text}</div></div><span style={{ padding: "4px 10px", background: "#EEEDFE", color: "#534AB7", borderRadius: 6, fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>지정</span></div>))}</div>);
}

// ===== [v8] 초대 랜딩 =====
function InviteLandingScreen({ state }) {
  if (state === "만료") return (<div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F1EFE8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", color: "#B4B2A9" }}>✕</div><div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A", marginBottom: 8 }}>이 초대는 만료되었어요</div><div style={{ fontSize: 13, color: "#888780", lineHeight: 1.6, marginBottom: 24 }}>이 초대 링크는 만료되었거나<br />이미 사용된 링크입니다.</div><div style={{ display: "inline-block", padding: "11px 24px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>룸을 구독해 둘러보기</div></div>);
  if (state === "이미 멤버") return (<div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", color: "#0F6E56" }}>✓</div><div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A", marginBottom: 8 }}>이미 이 룸의 멤버예요</div><div style={{ fontSize: 13, color: "#888780", marginBottom: 24 }}>나는 솔로 해석 룸</div><div style={{ display: "inline-block", padding: "11px 24px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>이슈 보러 가기</div></div>);
  // 유효
  return (<div>
    <div style={{ padding: "32px 24px 20px", textAlign: "center", background: "linear-gradient(180deg, #F3F2FC 0%, #fff 100%)" }}>
      <div style={{ fontSize: 12, color: "#534AB7", fontWeight: 600, marginBottom: 12 }}>초대를 받으셨습니다</div>
      <RoomThumb size={56} />
      <div style={{ fontSize: 20, fontWeight: 700, color: "#2C2C2A", marginTop: 12, marginBottom: 4 }}>나는 솔로 해석 룸</div>
      <div style={{ fontSize: 13, color: "#888780", marginBottom: 16 }}>감정보다 맥락과 편집으로 봅니다</div>
    </div>
    <div style={{ padding: "0 16px" }}>
      <div style={{ fontSize: 13, color: "#444441", background: "#F9F9F6", padding: "12px 14px", borderRadius: 10, lineHeight: 1.6, marginBottom: 16, whiteSpace: "pre-line" }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: "#888780", marginBottom: 6 }}>이 방은 이렇게 봅니다</div>
        {"• 장면의 의도와 편집 포인트를 같이 봅니다\n• 한 줄 반응보다 이유 있는 댓글을 중시합니다"}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>이 룸의 이슈와 반응</div>
      <div style={{ padding: 12, border: "1px solid #EEEDEA", borderRadius: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>이번 회차의 진짜 전환점은 어디였나</div>
        <div style={{ fontSize: 12, color: "#5F5E5A", display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: "#AFA9EC", fontSize: 10 }}>◆</span>@닉A 이건 대사보다 연출 의도를...</div>
        <MetaRow comments={36} upvotes={71} compact />
      </div>
      <div style={{ padding: 12, border: "1px solid #EEEDEA", borderRadius: 10, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>이번 데이트 선택, 어떻게 읽히나</div>
        <div style={{ fontSize: 12, color: "#5F5E5A", display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: "#AFA9EC", fontSize: 10 }}>◆</span>@닉B 이건 호감보다 연출에 가까워...</div>
        <MetaRow comments={28} upvotes={53} compact />
      </div>
      <div style={{ padding: "13px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center", marginBottom: 8 }}>가입하고 참여하기</div>
      <div style={{ fontSize: 11, color: "#B4B2A9", textAlign: "center", marginBottom: 16 }}>가입하면 이 룸에서 댓글을 작성할 수 있습니다</div>
    </div>
  </div>);
}

// ===== INFO PANEL =====
const SCREEN_INFO = {
  feed: { route: "/feed", purpose: "구독 룸들의 최신 이슈를 큰 카드로 소비하는 피드", data: ["구독 Room 아바타 바", "큰 이슈 카드: 운영자 한 줄 + 본문 + 대표 댓글", "조회수/댓글수/업보트수"], cta: ["이슈 읽기", "룸 보기"], notes: "v6과 동일. 대표 댓글 지정 이슈만 노출." },
  issues: { route: "/issues", purpose: "공개 이슈를 빠르게 스캔하는 탐색 목록", data: ["작은 이슈 카드: 제목+운영자 한 줄+대표 댓글 1줄"], cta: ["이슈 읽기", "룸 보기"], notes: "v6과 동일." },
  rooms: { route: "/rooms", purpose: "공개 룸 발견 화면", data: ["공개 Room + 멤버 모집 중 배지", "이슈 수/구독자 수"], cta: ["구독하기"], notes: "[v8] 멤버 신청 버튼 제거. 구독 CTA만 노출. 멤버 모집 중 배지는 유지." },
  room: { route: "/rooms/:slug", purpose: "룸의 결을 느끼고 구독을 결정하는 페이지", data: ["룸 정보", "대표 이슈", "이슈 목록"], cta: ["구독하기/구독 중", "지인에게 공유(Member, 공유용 링크 활성 시)", "멤버 탈퇴(Member)", "운영하기(Op)"], notes: "[v8] 멤버 신청 제거. Visitor/Subscriber: '참여는 초대 링크로 열립니다' 안내. Member(공유가능): 공유용 초대 링크 활성 시 '지인에게 공유' 버튼 노출, 비활성이면 버튼 숨김." },
  issue: { route: "/rooms/:slug/issues/:id", purpose: "이슈 본문 + 대표 댓글 + 전체 댓글", data: ["이슈 전체", "대표 댓글(1개)", "전체 댓글+대댓글"], cta: ["업보트", "스크랩", "댓글 작성"], notes: "[v8] Subscriber: '댓글은 멤버만 작성할 수 있어요 · 참여는 초대 링크로 열립니다' + '이 룸에서 참여 방법 보기'. Visitor: 구독 유도." },
  mypage: { route: "/me", purpose: "개인 활동과 룸 관계 허브", data: ["프로필", "룸/이슈/댓글 탭"], cta: ["룸 보기", "운영하기", "프로필 보기"], notes: "v6과 동일. A릴리즈에서 초대 탭 미추가." },
  profile: { route: "/users/:id", purpose: "활동과 업적 프로필", data: ["통계", "대표 선정 댓글", "참여 룸"], cta: ["편집(내 프로필)"], notes: "v6과 동일." },
  "invite-landing": { route: "/invite/:token", purpose: "초대 링크로 진입한 사용자에게 룸의 결을 보여주고 가입 유도", data: ["룸 소개", "대표 이슈 미리보기"], cta: ["가입하고 참여하기"], notes: "[v8] 3개 상태: 유효(가입 CTA), 만료(구독 유도), 이미 멤버(이슈 보기). 비회원은 회원가입 후 자동 멤버 가입+자동 구독." },
  "room-settings": { route: "/operator/rooms/:id/settings", purpose: "운영자가 룸을 관리", data: ["룸 정보", "멤버 모집 (닫힘/열림)", "1:1 초대 링크", "공유용 초대 링크", "공개 상태", "멤버 목록"], cta: ["1:1 링크 생성(일회성)", "공유용 링크 복사/중지", "저장"], notes: "[v8] 1:1 초대: 버튼 누를 때마다 1회용·7일 링크 즉시 생성, 상태 관리 없음. 공유용 초대: 고정 규칙(5회용·7일), 활성 시 멤버에게 공유 버튼 노출, 사용현황·만료 표시. 별도 초대 관리 대시보드 없음." },
  "issue-publish": { route: "/operator/rooms/:id/issues/new", purpose: "이슈 발행/수정", data: ["제목/운영자 한 줄/질문/본문/첨부", "상태/대표 이슈/스포일러"], cta: ["발행", "수정", "삭제"], notes: "v6과 동일." },
  "rep-comment": { route: "/operator/issues/:id/comments", purpose: "대표 댓글 지정", data: ["이슈", "댓글 목록", "현재 대표"], cta: ["지정", "해제"], notes: "v6과 동일." },
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
      case "room-settings": return <RoomSettingsScreen />;
      case "issue-publish": return <IssuePublishScreen state={currentStateName} />;
      case "rep-comment": return <RepCommentScreen />;
      default: return null;
    }
  };
  const groups = [{ key: "user", label: "사용자 화면", hint: "실제 서비스 사용자가 보게 되는 페이지" }, { key: "operator", label: "운영자 화면", hint: "운영자가 관리와 발행에 사용하는 페이지" }];
  return (<div style={{ fontFamily: '-apple-system, "Pretendard", sans-serif', maxWidth: 920 }}><div style={{ marginBottom: 20, display: "grid", gap: 12 }}><div style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #E6E0FA", background: "#FCFBFF" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}><div><div style={{ fontSize: 12, fontWeight: 700, color: "#534AB7", marginBottom: 4 }}>1. 페이지 선택</div><div style={{ fontSize: 13, color: "#5F5E5A" }}>아래 미리보기를 다른 페이지로 바꿉니다.</div></div><Badge text={`현재: ${meta?.label || activeScreen}`} color="purple" /></div>{groups.map((g) => (<div key={g.key} style={{ marginBottom: 12 }}><div style={{ marginBottom: 6 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#7A72C5", textTransform: "uppercase", letterSpacing: "0.05em" }}>{g.label}</div><div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{g.hint}</div></div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{SCREENS.filter((s) => s.group === g.key).map((s) => (<button key={s.id} onClick={() => handleScreenChange(s.id)} style={{ padding: "7px 14px", borderRadius: 8, border: activeScreen === s.id ? "1.5px solid #534AB7" : "1px solid #D3D1C7", background: activeScreen === s.id ? "#F3F2FC" : "#fff", color: activeScreen === s.id ? "#534AB7" : "#5F5E5A", fontWeight: activeScreen === s.id ? 600 : 400, fontSize: 13, cursor: "pointer" }}>{s.label}</button>))}</div></div>))}</div><div style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #D7EBE4", background: "#F8FEFB" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}><div><div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", marginBottom: 4 }}>2. 같은 페이지 안 상태 전환</div><div style={{ fontSize: 13, color: "#5F5E5A" }}>권한·멤버 모집 여부·빈 상태 등을 바꿔 비교합니다.</div></div><Badge text={`현재: ${currentStateName}`} color="teal" /></div><div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 10 }}>기준: <span style={{ fontWeight: 600, color: "#0F6E56" }}>{meta?.label}</span></div>{currentStates.length > 1 ? (<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{currentStates.map((s, i) => (<button key={s} onClick={() => setActiveState(i)} style={{ padding: "6px 12px", borderRadius: 999, border: activeState === i ? "1.5px solid #0F6E56" : "1px solid #C7DED6", background: activeState === i ? "#E1F5EE" : "#fff", color: activeState === i ? "#0F6E56" : "#5F5E5A", fontWeight: activeState === i ? 600 : 400, fontSize: 12, cursor: "pointer" }}>{s}</button>))}</div>) : (<div style={{ fontSize: 12, color: "#888780", padding: "10px 12px", borderRadius: 10, border: "1px dashed #C7DED6", background: "#fff" }}>추가 상태 없음</div>)}</div></div><div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}><Phone>{renderScreen()}</Phone><InfoPanel screenId={activeScreen} /></div></div>);
}
