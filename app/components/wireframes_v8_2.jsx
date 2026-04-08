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
  { id: "aspect-add", label: "Aspect 추가", group: "user" },
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
  issue: ["Visitor", "Subscriber(Aspect 없음)", "Subscriber(Aspect 보유)", "Member/Operator", "대표 댓글 없음"],
  mypage: ["룸 탭", "이슈 탭", "댓글 탭", "정체성 탭", "구독 없음(Empty)"],
  profile: ["내 프로필", "다른 사용자 프로필"],
  "invite-landing": ["유효", "만료", "이미 멤버"],
  "aspect-add": ["룸 댓글 시도 진입", "마이페이지 직접 추가"],
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

// [v8.2] 룸 목록 — 카드에 Aspect 칩 노출
function RoomListScreen({ state }) {
  const rooms = [
    { name: "AI 프로덕트 룸", aspects: ["PM", "개발자"], desc: "프로덕트 관점에서 AI를 봅니다", acceptMember: true, issues: 18, subs: 156 },
    { name: "테슬라 오너 룸", aspects: ["테슬라 오너"], desc: "실사용 경험을 모읍니다", acceptMember: true, issues: 12, subs: 84 },
    { name: "0~3세 육아 룸", aspects: ["0~3세 부모"], desc: "지금 이 시기를 함께 지나는 사람들", acceptMember: false, issues: 8, subs: 47 },
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
          {r.acceptMember && <Badge text="멤버 모집 중" color="teal" />}
        </div>
        <div style={{ fontSize: 11, color: "#B4B2A9", marginBottom: 8 }}>이슈 {r.issues}개 · 구독자 {r.subs}명</div>
        <div style={{ flex: 1, padding: "8px 0", background: "#534AB7", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: "center" }}>{state === "Subscriber" ? "구독 중 ✓" : "구독하기"}</div>
      </div>
    ))}
  </div>);
}

// [v8.2] 룸 상세 — Aspect 박스 추가, 파일럿 룸을 AI 프로덕트 룸으로
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <RoomThumb size={52} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#2C2C2A", marginBottom: 4 }}>AI 프로덕트 룸</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {acceptMember && <Badge text="멤버 모집 중" color="teal" />}
            <span style={{ fontSize: 11, color: "#B4B2A9" }}>구독자 156명</span>
          </div>
        </div>
      </div>

      {/* [v8.2] Aspect 박스 — 룸 정체성의 핵심 표시 */}
      <div style={{ padding: "10px 12px", background: "#F5F9FD", borderRadius: 10, border: "1px solid #D6E6F3", marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "#5F7B95", fontWeight: 600, marginBottom: 6 }}>이 룸의 시선</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <AspectChip text="PM" />
          <AspectChip text="개발자" />
        </div>
        <div style={{ fontSize: 11, color: "#888780", marginTop: 6, lineHeight: 1.4 }}>이 정체성을 가진 사람만 댓글을 작성할 수 있습니다</div>
      </div>

      <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 10 }}>프로덕트 관점에서 AI를 봅니다</div>

      {isMember ? (
        <div style={{ fontSize: 12, color: "#B4B2A9", padding: "6px 0", marginBottom: 8, cursor: "pointer" }}>▸ 룸 소개 보기</div>
      ) : (
        <div style={{ fontSize: 13, color: "#444441", background: "#F9F9F6", padding: "12px 14px", borderRadius: 10, lineHeight: 1.6, marginBottom: 12, whiteSpace: "pre-line" }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: "#888780", marginBottom: 6 }}>이 방은 이렇게 봅니다</div>
          {"• 기술 트렌드보다 프로덕트 의사결정 관점\n• 사용자 가치로 환산되지 않는 논의는 후순위"}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {role === "Visitor" ? (
          <div style={{ flex: 1, padding: "11px 0", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>구독하기</div>
        ) : (
          <div style={{ flex: 1, padding: "11px 0", background: "#EEEDFE", color: "#534AB7", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>구독 중 ✓</div>
        )}
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

      {/* [v8.2] 초대 안내 — Aspect 언급 추가 */}
      {acceptMember && !isMember && !isOp && (
        <div style={{ marginTop: 10, padding: "10px 14px", background: "#F8FEFB", borderRadius: 10, border: "1px solid #D7EBE4" }}>
          <div style={{ fontSize: 12, color: "#0F6E56", fontWeight: 600, marginBottom: 4 }}>참여는 초대 링크로 열립니다</div>
          <div style={{ fontSize: 11, color: "#5F5E5A", lineHeight: 1.5 }}>초대 링크가 있으면 PM 또는 개발자 정체성을 추가하고 바로 참여할 수 있어요</div>
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
    {isMember ? (<>
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

// [v8.2] 이슈 상세 — Aspect 칩, 댓글 입력 영역 3상태(Member / Subscriber+Aspect / Subscriber-Aspect)
function IssueDetailScreen({ state }) {
  const canComment = state === "Member/Operator";
  const isSubscriberNoAspect = state === "Subscriber(Aspect 없음)";
  const isSubscriberWithAspect = state === "Subscriber(Aspect 보유)";
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
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}><div style={{ flex: 1, height: 38, border: "1px solid #D3D1C7", borderRadius: 10, padding: "0 12px", display: "flex", alignItems: "center", fontSize: 13, color: "#B4B2A9", background: "#fff" }}>댓글을 입력하세요...</div><div style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #D3D1C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#888780", background: "#fff", flexShrink: 0 }}>📷</div><div style={{ padding: "8px 14px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>작성</div></div>
      ) : isSubscriberWithAspect ? (
        /* [v8.2] Aspect 보유 상태 — 한 번의 탭으로 Member 진입 */
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 6 }}>댓글을 작성하려면 이 룸의 멤버가 되어야 합니다</div>
          <div style={{ fontSize: 11, color: "#888780", marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>
            보유 정체성 <AspectChip text="PM" size="sm" /> 으로 참여 가능
          </div>
          <div><div style={{ display: "inline-block", padding: "9px 20px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>PM으로 참여하기</div></div>
        </div>
      ) : isSubscriberNoAspect ? (
        /* [v8.2] Aspect 미보유 상태 — Aspect 추가 화면으로 유도 */
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 6 }}>이 룸은 다음 정체성을 가진 사람만 댓글을 작성합니다</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 8 }}>
            <AspectChip text="PM" />
            <AspectChip text="개발자" />
          </div>
          <div style={{ display: "inline-block", padding: "9px 20px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>내 정체성에 추가하고 참여</div>
          <div style={{ fontSize: 10, color: "#B4B2A9", marginTop: 6 }}>자기 신고 기반입니다</div>
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

    {/* [v8.2] 보유 Aspect 섹션 */}
    <SH>보유 정체성 {isMe && <span style={{ fontSize: 11, color: "#534AB7", marginLeft: 6, fontWeight: 500, cursor: "pointer" }}>+ 추가</span>}</SH>
    <div style={{ padding: "8px 16px 16px" }}>
      {[
        { label: "PM", comments: 32, rep: 6, primary: true },
        { label: "0~3세 부모", comments: 12, rep: 2, primary: false },
        { label: "테슬라 오너", comments: 3, rep: 0, primary: false },
      ].map((a, i) => (
        <div key={i} style={{ padding: "10px 12px", background: a.primary ? "#F5F9FD" : "#FAFAF8", borderRadius: 10, border: `1px solid ${a.primary ? "#D6E6F3" : "#EEEDEA"}`, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AspectChip text={a.label} />
            {a.primary && <span style={{ fontSize: 10, color: "#534AB7", fontWeight: 600 }}>주력</span>}
          </div>
          <div style={{ fontSize: 11, color: "#888780" }}>댓글 {a.comments} · 대표 {a.rep}</div>
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
// [v8.2] 정체성 탭 신규
function MyPageAspectTab() {
  return (<>
    <div style={{ padding: "12px 16px", fontSize: 12, color: "#888780", lineHeight: 1.5 }}>정체성별로 활동 이력이 쌓입니다. 가장 활발한 정체성이 자동으로 주력으로 표시됩니다.</div>
    {[
      { label: "PM", comments: 32, rep: 6, rooms: ["AI 프로덕트 룸", "LLM Eval 스터디"], primary: true },
      { label: "0~3세 부모", comments: 12, rep: 2, rooms: ["0~3세 육아 룸"], primary: false },
      { label: "테슬라 오너", comments: 3, rep: 0, rooms: ["테슬라 오너 룸"], primary: false },
    ].map((a, i) => (
      <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #F1EFE8" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <AspectChip text={a.label} />
          {a.primary && <span style={{ fontSize: 10, color: "#534AB7", fontWeight: 600, padding: "1px 6px", background: "#EEEDFE", borderRadius: 4 }}>주력</span>}
        </div>
        <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 3 }}>댓글 {a.comments}개 · 대표 선정 {a.rep}회</div>
        <div style={{ fontSize: 11, color: "#888780" }}>활동 룸: {a.rooms.join(" · ")}</div>
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

// ===== [v8.2] 초대 랜딩 — Aspect 칩, 참여 조건 박스 추가 =====
function InviteLandingScreen({ state }) {
  if (state === "만료") return (<div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ width: 64, height: 64, borderRadius: "50%", background: "#F1EFE8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", color: "#B4B2A9" }}>✕</div><div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A", marginBottom: 8 }}>이 초대는 만료되었어요</div><div style={{ fontSize: 13, color: "#888780", lineHeight: 1.6, marginBottom: 24 }}>이 초대 링크는 만료되었거나<br />이미 사용된 링크입니다.</div><div style={{ display: "inline-block", padding: "11px 24px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>룸을 구독해 둘러보기</div></div>);
  if (state === "이미 멤버") return (<div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ width: 64, height: 64, borderRadius: "50%", background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", color: "#0F6E56" }}>✓</div><div style={{ fontSize: 18, fontWeight: 700, color: "#2C2C2A", marginBottom: 8 }}>이미 이 룸의 멤버예요</div><div style={{ fontSize: 13, color: "#888780", marginBottom: 24 }}>AI 프로덕트 룸</div><div style={{ display: "inline-block", padding: "11px 24px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>이슈 보러 가기</div></div>);
  // 유효
  return (<div>
    <div style={{ padding: "32px 24px 20px", textAlign: "center", background: "linear-gradient(180deg, #F3F2FC 0%, #fff 100%)" }}>
      <div style={{ fontSize: 12, color: "#534AB7", fontWeight: 600, marginBottom: 12 }}>초대를 받으셨습니다</div>
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
      {/* [v8.2] 참여 조건 박스 */}
      <div style={{ padding: "10px 12px", background: "#F5F9FD", borderRadius: 10, border: "1px solid #D6E6F3", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#5F7B95", fontWeight: 600, marginBottom: 4 }}>참여 조건</div>
        <div style={{ fontSize: 12, color: "#444441", lineHeight: 1.5 }}>가입 시 PM 또는 개발자 정체성을 본인의 프로필에 추가합니다. 자기 신고 기반이며 거짓 신고 시 제한될 수 있습니다.</div>
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

// ===== INFO PANEL =====
const SCREEN_INFO = {
  feed: { route: "/feed", purpose: "구독 룸들의 최신 이슈를 큰 카드로 소비하는 피드", data: ["구독 Room 아바타 바", "큰 이슈 카드: 룸 Aspect + 운영자 한 줄 + 본문 + 대표 댓글(작성자 Aspect)", "조회수/댓글수/업보트수"], cta: ["이슈 읽기", "룸 보기"], notes: "[v8.2] 룸 카드 헤더와 대표 댓글 작성자에 Aspect 칩 표시. 같은 이슈를 누구의 시선에서 본 것인지 한눈에 드러남. 파일럿 룸을 Aspect 친화적으로 재구성: AI 프로덕트 룸(PM·개발자), 테슬라 오너 룸(테슬라 오너), 0~3세 육아 룸(0~3세 부모)." },
  issues: { route: "/issues", purpose: "공개 이슈를 빠르게 스캔하는 탐색 목록", data: ["작은 이슈 카드: 룸 Aspect + 제목 + 운영자 한 줄 + 대표 댓글(Aspect)"], cta: ["이슈 읽기", "룸 보기"], notes: "[v8.2] 룸 이름 옆에 Aspect 칩, 대표 댓글 작성자 옆에도 Aspect 칩." },
  rooms: { route: "/rooms", purpose: "공개 룸 발견 화면", data: ["공개 Room", "룸의 Aspect", "이슈 수/구독자 수"], cta: ["구독하기"], notes: "[v8.2] 모든 룸 카드에 Aspect 칩 노출. 룸의 정체성이 한 줄 설명보다 먼저 시각적으로 전달됨." },
  room: { route: "/rooms/:slug", purpose: "룸의 결을 느끼고 구독을 결정하는 페이지", data: ["룸 정보", "이 룸의 시선(Aspect)", "대표 이슈", "이슈 목록"], cta: ["구독하기/구독 중", "지인에게 공유(Member, 공유용 링크 활성 시)", "멤버 탈퇴(Member)", "운영하기(Op)"], notes: "[v8.2] 룸 정보 영역 바로 아래에 'Aspect 박스' 추가 — 이 정체성을 가진 사람만 댓글 작성 가능 안내. 초대 안내문에도 'PM 또는 개발자 정체성을 추가하고 참여' 같은 구체 표현으로 변경." },
  issue: { route: "/rooms/:slug/issues/:id", purpose: "이슈 본문 + 대표 댓글 + 전체 댓글", data: ["이슈 전체", "룸 Aspect", "대표 댓글(작성자 Aspect)", "전체 댓글(작성자 Aspect)"], cta: ["업보트", "스크랩", "댓글 작성"], notes: "[v8.2] 모든 댓글에 작성자 Aspect 칩 표시. 댓글 입력 영역은 4가지 상태: (1) Member/Op는 작성 가능, (2) Subscriber(Aspect 보유)는 'PM으로 참여하기' 한 번에 멤버 진입, (3) Subscriber(Aspect 미보유)는 '내 정체성에 추가하고 참여' → Aspect 추가 화면으로 이동, (4) Visitor는 구독 유도." },
  "aspect-add": { route: "/me/aspects/add", purpose: "[v8.2 신규] 자기 정체성을 자기 신고로 추가", data: ["보유 정체성 목록", "추가 가능한 정체성(카테고리별)", "자기 신고 안내"], cta: ["+ 정체성 추가", "완료"], notes: "[v8.2 신규] 두 가지 진입 경로: (1) 룸에서 댓글 시도 시 자동 진입(상단에 '이 룸은 X 정체성이 필요합니다' 안내 박스), (2) 마이페이지 정체성 탭에서 직접 추가. 카테고리는 직업/전문성 우선, 라이프스테이지/소유는 '추후 확대'로 표시. 자유 입력 불가, 큐레이션 풀에서만 선택. 자기 신고 only — 거짓 신고 시 신고 누적으로 제한." },
  mypage: { route: "/me", purpose: "개인 활동과 룸 관계 허브", data: ["프로필(Aspect 칩 포함)", "룸/이슈/댓글/정체성 4개 탭"], cta: ["룸 보기", "운영하기", "프로필 보기", "정체성 추가"], notes: "[v8.2] 프로필 섹션에 보유 Aspect 칩 노출. 정체성 탭 신규 추가 — 보유 Aspect별 활동 이력(댓글 수, 대표 선정, 활동 룸) 표시. 가장 활발한 Aspect는 '주력' 표시." },
  profile: { route: "/users/:id", purpose: "활동과 업적 프로필", data: ["통계", "보유 정체성(활동 강도 포함)", "대표 선정 댓글", "참여 룸"], cta: ["편집(내 프로필)", "정체성 추가(내 프로필)"], notes: "[v8.2] 보유 정체성 섹션 추가 — 각 Aspect별 댓글 수와 대표 선정 횟수 표시. 가장 활발한 Aspect는 '주력' 표시. 대표 댓글과 참여 룸에도 Aspect 칩 노출." },
  "invite-landing": { route: "/invite/:token", purpose: "초대 링크로 진입한 사용자에게 룸의 결을 보여주고 가입 유도", data: ["룸 소개", "이 룸의 Aspect", "참여 조건 안내", "대표 이슈 미리보기"], cta: ["가입하고 정체성 추가"], notes: "[v8.2] 룸 이름 아래에 Aspect 칩 표시. '참여 조건' 박스 추가 — 가입 다음 단계에서 정체성 추가가 필요함을 명시. 자기 신고 기반임을 안내." },
  "room-settings": { route: "/operator/rooms/:id/settings", purpose: "운영자가 룸을 관리", data: ["룸 정보", "이 룸의 시선(Aspect, 필수)", "멤버 모집", "1:1/공유용 초대 링크", "공개 상태", "멤버 목록(Aspect 포함)"], cta: ["정체성 추가/제거", "1:1 링크 생성", "공유용 링크 복사/중지", "저장"], notes: "[v8.2] '이 룸의 시선' 영역 신규 추가 — 룸 생성/수정 시 필수, 최대 3개, 플랫폼 큐레이션 풀에서만 선택. 멤버 목록에도 각 멤버의 (해당 룸 가입 시 선택한) Aspect 표시." },
  "issue-publish": { route: "/operator/rooms/:id/issues/new", purpose: "이슈 발행/수정", data: ["제목/운영자 한 줄/질문/본문/첨부", "상태/대표 이슈/스포일러"], cta: ["발행", "수정", "삭제"], notes: "v8.1과 동일. Aspect는 룸 단위에 묶이므로 이슈 발행 시점의 변경은 없음." },
  "rep-comment": { route: "/operator/issues/:id/comments", purpose: "대표 댓글 지정", data: ["이슈", "댓글 목록(Aspect 포함)", "현재 대표(Aspect 포함)"], cta: ["지정", "해제"], notes: "[v8.2] 댓글 작성자별 Aspect 칩 표시 — 운영자가 어떤 시선의 댓글을 대표로 올릴지 판단할 때 도움." },
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
      case "room-settings": return <RoomSettingsScreen />;
      case "issue-publish": return <IssuePublishScreen state={currentStateName} />;
      case "rep-comment": return <RepCommentScreen />;
      default: return null;
    }
  };
  const groups = [{ key: "user", label: "사용자 화면", hint: "실제 서비스 사용자가 보게 되는 페이지" }, { key: "operator", label: "운영자 화면", hint: "운영자가 관리와 발행에 사용하는 페이지" }];
  return (<div style={{ fontFamily: '-apple-system, "Pretendard", sans-serif', maxWidth: 920 }}><div style={{ marginBottom: 20, display: "grid", gap: 12 }}><div style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #E6E0FA", background: "#FCFBFF" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}><div><div style={{ fontSize: 12, fontWeight: 700, color: "#534AB7", marginBottom: 4 }}>1. 페이지 선택</div><div style={{ fontSize: 13, color: "#5F5E5A" }}>아래 미리보기를 다른 페이지로 바꿉니다.</div></div><Badge text={`현재: ${meta?.label || activeScreen}`} color="purple" /></div>{groups.map((g) => (<div key={g.key} style={{ marginBottom: 12 }}><div style={{ marginBottom: 6 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#7A72C5", textTransform: "uppercase", letterSpacing: "0.05em" }}>{g.label}</div><div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{g.hint}</div></div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{SCREENS.filter((s) => s.group === g.key).map((s) => (<button key={s.id} onClick={() => handleScreenChange(s.id)} style={{ padding: "7px 14px", borderRadius: 8, border: activeScreen === s.id ? "1.5px solid #534AB7" : "1px solid #D3D1C7", background: activeScreen === s.id ? "#F3F2FC" : "#fff", color: activeScreen === s.id ? "#534AB7" : "#5F5E5A", fontWeight: activeScreen === s.id ? 600 : 400, fontSize: 13, cursor: "pointer" }}>{s.label}</button>))}</div></div>))}</div><div style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #D7EBE4", background: "#F8FEFB" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}><div><div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", marginBottom: 4 }}>2. 같은 페이지 안 상태 전환</div><div style={{ fontSize: 13, color: "#5F5E5A" }}>권한·Aspect 보유 여부·빈 상태 등을 바꿔 비교합니다.</div></div><Badge text={`현재: ${currentStateName}`} color="teal" /></div><div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 10 }}>기준: <span style={{ fontWeight: 600, color: "#0F6E56" }}>{meta?.label}</span></div>{currentStates.length > 1 ? (<div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{currentStates.map((s, i) => (<button key={s} onClick={() => setActiveState(i)} style={{ padding: "6px 12px", borderRadius: 999, border: activeState === i ? "1.5px solid #0F6E56" : "1px solid #C7DED6", background: activeState === i ? "#E1F5EE" : "#fff", color: activeState === i ? "#0F6E56" : "#5F5E5A", fontWeight: activeState === i ? 600 : 400, fontSize: 12, cursor: "pointer" }}>{s}</button>))}</div>) : (<div style={{ fontSize: 12, color: "#888780", padding: "10px 12px", borderRadius: 10, border: "1px dashed #C7DED6", background: "#fff" }}>추가 상태 없음</div>)}</div></div><div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}><Phone>{renderScreen()}</Phone><InfoPanel screenId={activeScreen} /></div></div>);
}
