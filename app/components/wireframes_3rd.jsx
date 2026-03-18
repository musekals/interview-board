'use client';

import { useState } from "react";

const SCREENS = [
  { id: "feed", label: "내 피드(홈)", group: "user" },
  { id: "issues", label: "이슈 목록", group: "user" },
  { id: "rooms", label: "룸 목록", group: "user" },
  { id: "room", label: "룸 상세", group: "user" },
  { id: "issue", label: "이슈 상세", group: "user" },
  { id: "mypage", label: "마이페이지", group: "user" },
  { id: "room-settings", label: "룸 설정", group: "operator" },
  { id: "issue-publish", label: "이슈 발행/수정", group: "operator" },
  { id: "rep-comment", label: "대표 댓글 지정", group: "operator" },
];

const STATES = {
  feed: ["기본", "구독 룸 없음(Empty)", "Loading"],
  issues: ["기본", "스포일러 포함 이슈", "이슈 없음(Empty)"],
  rooms: ["Visitor", "Subscriber"],
  room: ["쇼케이스-Visitor", "쇼케이스-Subscriber", "쇼케이스-Member", "쇼케이스-Operator", "확장-Visitor", "확장-Subscriber", "확장-Member", "확장-Operator", "대표 이슈 없음"],
  issue: ["Visitor", "Subscriber(구독만)", "Member/Operator", "대표 댓글 없음"],
  mypage: ["룸 탭", "이슈 탭", "댓글 탭", "구독 없음(Empty)"],
  "room-settings": ["기본"],
  "issue-publish": ["새 이슈", "이슈 수정"],
  "rep-comment": ["기본"],
};

function Badge({ text, color }) {
  const colors = {
    blue: { bg: "#E6F1FB", text: "#185FA5", border: "#85B7EB" },
    green: { bg: "#EAF3DE", text: "#3B6D11", border: "#97C459" },
    gray: { bg: "#F1EFE8", text: "#5F5E5A", border: "#B4B2A9" },
    amber: { bg: "#FAEEDA", text: "#854F0B", border: "#EF9F27" },
    coral: { bg: "#FAECE7", text: "#993C1D", border: "#F0997B" },
    purple: { bg: "#EEEDFE", text: "#534AB7", border: "#AFA9EC" },
    teal: { bg: "#E1F5EE", text: "#0F6E56", border: "#5DCAA5" },
    red: { bg: "#FCEBEB", text: "#A32D2D", border: "#F09595" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 500, background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
      {text}
    </span>
  );
}

function Phone({ children }) {
  return (
    <div style={{ width: 360, minHeight: 640, background: "#fff", borderRadius: 32, border: "2px solid #D3D1C7", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", flexShrink: 0 }}>
      <div style={{ height: 44, background: "#FAFAF8", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #EEEDEA", flexShrink: 0 }}>
        <div style={{ width: 100, height: 6, background: "#D3D1C7", borderRadius: 3 }} />
      </div>
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
      <div style={{ height: 56, background: "#FAFAF8", borderTop: "1px solid #EEEDEA", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 12px", flexShrink: 0 }}>
        {[{ icon: "⌂", label: "피드" }, { icon: "☰", label: "이슈" }, { icon: "◉", label: "룸" }, { icon: "⊕", label: "마이" }].map((n, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontSize: 10, color: i === 0 ? "#534AB7" : "#888780", fontWeight: i === 0 ? 600 : 400 }}>
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            {n.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function MetaRow({ comments, upvotes }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#888780", marginTop: 8 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M8 3l1.5 3.3 3.5.5-2.5 2.5.6 3.5L8 11.1l-3.1 1.7.6-3.5L3 6.8l3.5-.5z" fill="#B4B2A9"/></svg>
        {upvotes}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M2 2.5A1.5 1.5 0 013.5 1h9A1.5 1.5 0 0114 2.5v7a1.5 1.5 0 01-1.5 1.5H6l-3 3V11H3.5A1.5 1.5 0 012 9.5z" fill="#B4B2A9"/></svg>
        {comments}
      </span>
    </div>
  );
}

// [변경2] 운영자 한 줄 복원
function IssueCard({ room, title, opLine, bodyPreview, repComment, status, comments, upvotes, showRoom = true, isSpoiler = false }) {
  const statusColor = status === "진행 중" ? "green" : status === "종료" ? "gray" : "blue";
  return (
    <div style={{ padding: "14px 16px", borderBottom: "1px solid #EEEDEA" }}>
      {showRoom && (
        <div style={{ fontSize: 11, color: "#534AB7", fontWeight: 600, marginBottom: 4, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, background: "#EEEDFE", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>◈</span>
          <span style={{ textDecoration: "underline", textDecorationColor: "#CEC8F6", textUnderlineOffset: 2 }}>{room}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "4px 0" }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#2C2C2A", lineHeight: 1.35, flex: 1 }}>{title}</span>
        {isSpoiler && <Badge text="스포일러" color="red" />}
      </div>
      {isSpoiler ? (
        <div style={{ fontSize: 13, color: "#B4B2A9", fontStyle: "italic", margin: "6px 0", padding: "10px 12px", background: "#F9F9F6", borderRadius: 8, textAlign: "center" }}>
          스포일러가 포함된 이슈입니다. 탭하여 보기
        </div>
      ) : (
        <>
          {/* [변경2] 운영자 한 줄 표시 */}
          {opLine && (
            <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 4, display: "flex", alignItems: "flex-start", gap: 4 }}>
              <span style={{ color: "#888780", flexShrink: 0, fontWeight: 500 }}>운영자:</span>
              <span style={{ fontStyle: "italic" }}>{opLine}</span>
            </div>
          )}
          <div style={{ fontSize: 13, color: "#5F5E5A", margin: "2px 0 6px", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {bodyPreview}
          </div>
          {repComment && (
            <div style={{ fontSize: 12, color: "#2C2C2A", background: "#F9F9F6", padding: "8px 10px", borderRadius: 8, borderLeft: "3px solid #AFA9EC", lineHeight: 1.4 }}>
              <span style={{ color: "#534AB7", fontWeight: 600, fontSize: 11 }}>대표 댓글</span><br />
              {repComment}
            </div>
          )}
        </>
      )}
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <Badge text={status} color={statusColor} />
        <MetaRow comments={comments} upvotes={upvotes} />
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: "#5F5E5A", padding: "12px 16px 6px", background: "#FAFAF8", letterSpacing: "0.01em" }}>
      {children}
    </div>
  );
}

// [변경9] 댓글에 스크랩 액션 추가
function Comment({ nick, text, upvotes, time, replies, isRep }) {
  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#444441" }}>{nick}</span>
          {isRep && <Badge text="대표" color="purple" />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#B4B2A9" }}>{time}</span>
          <span style={{ fontSize: 11, color: "#B4B2A9", cursor: "pointer" }}>⚑</span>
        </div>
      </div>
      <div style={{ fontSize: 14, color: "#444441", lineHeight: 1.5 }}>{text}</div>
      <div style={{ marginTop: 8, display: "flex", gap: 14, fontSize: 12, color: "#888780" }}>
        <span>▲ {upvotes}</span>
        <span>↩ 답글</span>
        <span>⊞ 스크랩</span>
      </div>
      {replies && replies.length > 0 && (
        <div style={{ marginTop: 8, marginLeft: 16, borderLeft: "2px solid #EEEDEA", paddingLeft: 12 }}>
          {replies.map((r, i) => (
            <div key={i} style={{ paddingBottom: 8, marginBottom: i < replies.length - 1 ? 8 : 0, borderBottom: i < replies.length - 1 ? "1px solid #F1EFE8" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#5F5E5A" }}>{r.nick}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "#B4B2A9" }}>{r.time}</span>
                  <span style={{ fontSize: 11, color: "#B4B2A9", cursor: "pointer" }}>⚑</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.45 }}>{r.text}</div>
              <div style={{ marginTop: 4, display: "flex", gap: 12, fontSize: 11, color: "#B4B2A9" }}>
                <span>▲ {r.upvotes}</span>
                <span>↩ 답글</span>
                <span>⊞ 스크랩</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ========= SCREENS =========

// [변경6] 피드 상단에 구독 룸 아바타 행 추가
function SubscribedRoomBar() {
  const rooms = [
    { name: "테슬라", color: "#FAEEDA", textColor: "#854F0B", initial: "T" },
    { name: "나솔", color: "#EEEDFE", textColor: "#534AB7", initial: "나" },
    { name: "리벨", color: "#E1F5EE", textColor: "#0F6E56", initial: "리" },
  ];
  return (
    <div style={{ padding: "10px 16px", borderBottom: "1px solid #EEEDEA", display: "flex", alignItems: "center", gap: 10 }}>
      {rooms.map((r, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: r.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: r.textColor }}>{r.initial}</div>
          <span style={{ fontSize: 10, color: "#888780" }}>{r.name}</span>
        </div>
      ))}
      <div style={{ fontSize: 11, color: "#B4B2A9", marginLeft: "auto" }}>3개 룸 구독 중</div>
    </div>
  );
}

function FeedScreen({ state }) {
  if (state === "Loading")
    return <div style={{ padding: 40, textAlign: "center", color: "#888780" }}><div style={{ width: 32, height: 32, border: "3px solid #EEEDFE", borderTopColor: "#534AB7", borderRadius: "50%", margin: "0 auto 12px" }} />불러오는 중...</div>;
  if (state === "구독 룸 없음(Empty)")
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A", marginBottom: 8 }}>아직 구독한 룸이 없습니다</div>
        <div style={{ fontSize: 13, color: "#888780", marginBottom: 20, lineHeight: 1.5 }}>관심 있는 룸을 구독하면<br />이슈와 반응이 여기에 모입니다</div>
        <div style={{ display: "inline-block", padding: "10px 24px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600 }}>룸 둘러보기</div>
      </div>
    );
  return (
    <div>
      <div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>내 피드</div>
      <SubscribedRoomBar />
      {/* [변경4] 피드에는 대표 댓글이 있는 이슈만 노출 */}
      <IssueCard room="테슬라 한국 실사용자 룸" title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격/체감이 핵심이라 봅니다" bodyPreview="이번 FSD 도입 논의에서 가장 핵심적인 부분은 일정 자체가 아니라 가격 구조와 실제 체감 성능입니다..." repComment="@닉A 도입보다 과금 구조가 더 관건이라는 이야기가..." status="진행 중" comments={24} upvotes={47} />
      <IssueCard room="나는 솔로 해석 룸" title="이번 선택, 진짜 의도였을까?" opLine="행동보다 편집 포인트에 주목해주세요" bodyPreview="이번 장면은 표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다..." repComment="@닉B 이번 장면은 호감보다 편집 의도가..." status="진행 중" comments={31} upvotes={62} />
      <IssueCard room="리벨북스 비문학 스터디" title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 집중합시다" bodyPreview="저자가 3장에서 제기하는 문제의식은 결론 부분보다 오히려 초반의 질문 자체에 더 큰 무게가 있습니다..." repComment="@닉E 오히려 이 대목이 저자의 핵심 논점을..." status="종료" comments={18} upvotes={35} />
    </div>
  );
}

function IssueListScreen({ state }) {
  if (state === "이슈 없음(Empty)")
    return <div style={{ padding: "60px 24px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 12 }}>📋</div><div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>아직 공개된 이슈가 없습니다</div></div>;
  const showSpoiler = state === "스포일러 포함 이슈";
  return (
    <div>
      <div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>최신 이슈</div>
      {/* [변경4] 대표 댓글이 지정된 이슈 우선 노출 원칙 */}
      <div style={{ padding: "4px 16px 8px", fontSize: 11, color: "#B4B2A9" }}>대표 댓글이 지정된 이슈를 우선 노출합니다</div>
      <IssueCard room="나는 솔로 해석 룸" title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" bodyPreview="이번 데이트 장면에서 가장 눈에 띄는 것은 선택 자체보다 선택을 둘러싼 편집 구성입니다..." repComment="@닉D 이건 호감보다 계산에 가까워 보입니다" status="진행 중" comments={28} upvotes={53} />
      {showSpoiler && (
        <IssueCard room="나는 솔로 해석 룸" title="최종 선택 결과 분석" opLine="" bodyPreview="" repComment="" status="진행 중" comments={45} upvotes={89} isSpoiler={true} />
      )}
      <IssueCard room="리벨북스 비문학 스터디" title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 주목합시다" bodyPreview="이 책의 3장은 결론이 아니라 질문 자체가 핵심이며, 독자가 스스로 답을 구성해야 하는 구조입니다." repComment="@닉E 오히려 이 대목이 더 중요합니다" status="종료" comments={18} upvotes={35} />
      <IssueCard room="테슬라 한국 실사용자 룸" title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격/체감이 핵심" bodyPreview="FSD 한국 도입에서 핵심은 일정이 아니라 가격/체감입니다..." repComment="@닉A 도입보다 과금 구조가 관건입니다" status="진행 중" comments={24} upvotes={47} />
    </div>
  );
}

// [변경7] 룸 목록 화면 추가 — Visitor 진입점
function RoomListScreen({ state }) {
  const rooms = [
    { name: "나는 솔로 해석 룸", desc: "감정보다 맥락과 편집으로 봅니다", type: "쇼케이스", issues: 12, subs: 84 },
    { name: "테슬라 한국 실사용자 룸", desc: "루머보다 해석, 드립보다 이유", type: "확장", issues: 18, subs: 156 },
    { name: "리벨북스 비문학 스터디", desc: "저자의 질문을 함께 읽습니다", type: "쇼케이스", issues: 8, subs: 47 },
  ];
  return (
    <div>
      <div style={{ padding: "14px 16px 4px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>공개 룸</div>
      <div style={{ padding: "4px 16px 12px", fontSize: 13, color: "#888780", lineHeight: 1.5 }}>
        결 맞는 룸을 구독하고, 이슈와 반응을 내 피드로 모아보세요
      </div>
      {rooms.map((r, i) => (
        <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid #EEEDEA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color: "#534AB7" }}>◈</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#2C2C2A" }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "#888780" }}>{r.desc}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Badge text={r.type === "쇼케이스" ? "읽기 중심" : "참여 가능"} color={r.type === "쇼케이스" ? "gray" : "teal"} />
            <span style={{ fontSize: 11, color: "#B4B2A9" }}>이슈 {r.issues}개 · 구독자 {r.subs}명</span>
          </div>
          <div style={{ padding: "8px 0", background: "#534AB7", color: "#fff", borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: "center" }}>
            {state === "Subscriber" ? "구독 중 ✓" : "구독하기"}
          </div>
        </div>
      ))}
    </div>
  );
}

// [변경3,5] 룸 상세 — 쇼케이스/확장 분기 + 대표 반응 섹션
function RoomScreen({ state }) {
  const isShowcase = state.startsWith("쇼케이스");
  const isExpansion = state.startsWith("확장");
  const role = state.split("-")[1] || "Visitor";
  const isOp = role === "Operator";
  const isMember = role === "Member";
  const noFeatured = state === "대표 이슈 없음";

  const roomName = isShowcase ? "리벨북스 비문학 스터디" : "나는 솔로 해석 룸";
  const roomDesc = isShowcase ? "저자의 질문을 함께 읽습니다" : "감정보다 맥락과 편집으로 봅니다";
  const roomIntro = isShowcase
    ? "• 한 챕터씩 깊이 읽고, 저자의 문제의식을 함께 곱씹습니다\n• 이 방은 읽기 중심으로 운영됩니다"
    : "• 장면의 의도와 편집 포인트를 같이 봅니다\n• 한 줄 반응보다 이유 있는 댓글을 중시합니다";

  return (
    <div>
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #EEEDEA" }}>
        <span style={{ fontSize: 14, color: "#888780" }}>← 뒤로</span>
        <span style={{ fontSize: 14, color: "#888780" }}>공유</span>
      </div>
      <div style={{ padding: "20px 16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#2C2C2A", flex: 1 }}>{roomName}</span>
          <Badge text={isShowcase ? "읽기 중심" : "참여 가능"} color={isShowcase ? "gray" : "teal"} />
        </div>
        <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 12, lineHeight: 1.5 }}>{roomDesc}</div>
        <div style={{ fontSize: 13, color: "#444441", background: "#F9F9F6", padding: "12px 14px", borderRadius: 10, lineHeight: 1.6, marginBottom: 16, whiteSpace: "pre-line" }}>
          <div style={{ fontWeight: 600, fontSize: 12, color: "#888780", marginBottom: 6 }}>이 방은 이렇게 봅니다</div>
          {roomIntro}
        </div>
        {/* CTA — [변경3] 룸 타입별 분기 */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {role === "Visitor" ? (
            <div style={{ flex: 1, padding: "11px 0", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>구독하기</div>
          ) : (
            <div style={{ flex: 1, padding: "11px 0", background: "#EEEDFE", color: "#534AB7", borderRadius: 10, fontSize: 14, fontWeight: 600, textAlign: "center" }}>구독 중 ✓</div>
          )}
          {isOp && (
            <div style={{ padding: "11px 16px", background: "#F1EFE8", color: "#5F5E5A", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>운영하기</div>
          )}
          {/* [변경3] 확장형만 ⋯ 메뉴 노출, 쇼케이스는 미노출 */}
          {isExpansion && !isOp && (
            <div style={{ width: 40, height: 40, borderRadius: 10, border: "1px solid #D3D1C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#888780", cursor: "pointer", flexShrink: 0 }}>⋯</div>
          )}
        </div>
        {/* [변경3] 확장형 soft signal */}
        {isExpansion && !isOp && (
          <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 6, textAlign: "right" }}>
            {isMember ? "⋯ → 댓글 멤버 탈퇴하기" : "⋯ → 같이 이야기하고 싶다면"}
          </div>
        )}
        {/* [변경3] 쇼케이스형 안내 */}
        {isShowcase && !isOp && (
          <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 6, textAlign: "center", fontStyle: "italic" }}>
            이 방은 읽기 중심으로 운영됩니다
          </div>
        )}
      </div>

      {/* [변경5] 이 룸의 대표 반응 섹션 */}
      <SectionHeader>이 룸의 대표 반응</SectionHeader>
      <div style={{ padding: "0 16px 8px" }}>
        {[
          { nick: "@닉A", text: isShowcase ? "3장 핵심은 결론이 아니라 저자가 던진 질문의 구조에 있습니다" : "이 장면은 호감 표현이 아니라 편집 의도가 드러나는 순간", issue: isShowcase ? "이번 장의 핵심 질문은 무엇인가" : "이번 선택, 진짜 의도였을까?" },
          { nick: "@닉B", text: isShowcase ? "오히려 4장에서 이 논점이 다시 뒤집히는 구조가 인상적" : "편집이 그렇게 보이게 한 것 같아요. 실제 의도와는 다를 수도", issue: isShowcase ? "4장 반전 구조 분석" : "이번 데이트 선택, 어떻게 읽히나" },
        ].map((c, i) => (
          <div key={i} style={{ padding: "10px 12px", background: "#F9F9F6", borderRadius: 8, borderLeft: "3px solid #AFA9EC", marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#534AB7", marginBottom: 2 }}>{c.nick}</div>
            <div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.45 }}>{c.text}</div>
            <div style={{ fontSize: 11, color: "#B4B2A9", marginTop: 4 }}>→ {c.issue}</div>
          </div>
        ))}
      </div>

      {/* 대표 이슈 */}
      {!noFeatured && (
        <>
          <SectionHeader>대표 이슈</SectionHeader>
          <div style={{ margin: "0 16px 8px", padding: 14, border: "1.5px solid #AFA9EC", borderRadius: 12, background: "#FCFCFA" }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>{isShowcase ? "이번 장의 핵심 질문은 무엇인가" : "이번 회차의 진짜 전환점은 어디였나"}</div>
            <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 6, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {isShowcase ? "저자의 결론보다 문제제기 자체에 더 큰 무게가 있습니다..." : "이번 회차에서 가장 주목해야 할 장면은 대사가 아니라 침묵의 순간입니다..."}
            </div>
            <div style={{ fontSize: 12, color: "#2C2C2A", background: "#F3F2FC", padding: "6px 10px", borderRadius: 6 }}>
              <span style={{ color: "#534AB7", fontWeight: 600, fontSize: 11 }}>대표</span> @닉A {isShowcase ? "3장 핵심은 결론이 아니라..." : "이건 대사보다 연출 의도를..."}
            </div>
            <MetaRow comments={36} upvotes={71} />
          </div>
        </>
      )}

      <SectionHeader>최신 이슈</SectionHeader>
      <IssueCard showRoom={false} room="" title={isShowcase ? "4장 반전 구조 분석" : "이번 데이트 선택, 어떻게 읽히나"} opLine={isShowcase ? "이 장의 핵심은 반전 자체가 아닙니다" : "감정보다 전략으로 읽힙니다"} bodyPreview={isShowcase ? "4장에서 저자가 3장의 논점을 뒤집는 구조를 취하고 있습니다..." : "이번 데이트 장면에서 가장 눈에 띄는 것은..."} repComment={isShowcase ? "@닉B 오히려 이 반전이 저자의 진짜 의도..." : "@닉B 이건 호감보다 연출에 가까워..."} status="진행 중" comments={28} upvotes={53} />
      <IssueCard showRoom={false} room="" title={isShowcase ? "5장 프리뷰: 저자의 방향 전환?" : "지난 회차, 가장 갈린 장면은?"} opLine={isShowcase ? "여기서부터 논조가 바뀝니다" : "행동보다 맥락으로 봐주세요"} bodyPreview={isShowcase ? "5장 초반은 이전과 완전히 다른 톤으로 시작합니다..." : "출연자의 의도와 편집의 의도가 교차하는 지점..."} repComment={null} status="예정" comments={8} upvotes={19} />
    </div>
  );
}

// [변경8] 이슈 상세 — Subscriber에게 별도 "멤버 신청" CTA
function IssueDetailScreen({ state }) {
  const canComment = state === "Member/Operator";
  const isSubscriber = state === "Subscriber(구독만)";
  const noRep = state === "대표 댓글 없음";
  const [sort, setSort] = useState("popular");
  return (
    <div>
      <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid #EEEDEA" }}>
        <span style={{ fontSize: 14, color: "#888780" }}>← 룸으로</span>
        <span style={{ fontSize: 14, color: "#888780" }}>공유</span>
      </div>
      <div style={{ padding: "12px 16px 0", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ padding: "3px 10px", background: "#EEEDFE", color: "#534AB7", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", textDecoration: "underline", textDecorationColor: "#CEC8F6", textUnderlineOffset: 2 }}>나는 솔로 해석 룸</span>
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: "#2C2C2A", lineHeight: 1.35, marginBottom: 6 }}>이번 데이트 선택, 어떻게 읽히나</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#B4B2A9" }}>2025.03.15</span>
          <Badge text="진행 중" color="green" />
        </div>
        {/* [변경2] 운영자 한 줄 복원 */}
        <div style={{ fontSize: 13, color: "#5F5E5A", fontStyle: "italic", marginBottom: 10, padding: "6px 0", borderBottom: "1px solid #F1EFE8" }}>
          <span style={{ fontWeight: 500, fontStyle: "normal", color: "#888780" }}>운영자: </span>&quot;행동보다 편집 포인트에 주목해주세요&quot;
        </div>
        <div style={{ fontSize: 13, color: "#534AB7", background: "#F3F2FC", padding: "8px 12px", borderRadius: 8, marginBottom: 10, fontWeight: 500 }}>질문: 이 선택은 감정보다 전략에 가까웠나?</div>
        <div style={{ fontSize: 14, color: "#444441", lineHeight: 1.65, padding: "14px 0", borderTop: "1px solid #EEEDEA", borderBottom: "1px solid #EEEDEA" }}>
          이번 장면은 표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다. 특히 두 출연자의 반응 컷을 교차 배치한 연출은...
          <div style={{ marginTop: 10, width: "100%", height: 100, background: "#F1EFE8", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#888780" }}>이미지/링크/영상 첨부 영역</div>
        </div>
        {/* [변경9] 업보트 + 신고 + 스크랩 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #EEEDEA" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 14px", borderRadius: 20, border: "1.5px solid #D3D1C7", fontSize: 13, fontWeight: 600, color: "#5F5E5A", cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3l1.5 3.3 3.5.5-2.5 2.5.6 3.5L8 11.1l-3.1 1.7.6-3.5L3 6.8l3.5-.5z" fill="#888780"/></svg>
              업보트 53
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "6px 10px", borderRadius: 20, border: "1.5px solid #D3D1C7", fontSize: 12, color: "#888780", cursor: "pointer" }}>⊞ 스크랩</div>
            <div style={{ display: "flex", alignItems: "center", gap: 3, padding: "6px 10px", borderRadius: 20, border: "1.5px solid #D3D1C7", fontSize: 12, color: "#B4B2A9", cursor: "pointer" }}>⚑ 신고</div>
          </div>
          <div style={{ fontSize: 12, color: "#B4B2A9" }}>댓글 28개</div>
        </div>
      </div>

      {/* [변경1] 대표 댓글 1개로 */}
      {!noRep && (
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>대표 댓글</div>
          <div style={{ padding: "10px 14px", background: "#F3F2FC", borderRadius: 10, borderLeft: "3px solid #7F77DD" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#534AB7" }}>@닉A</span>
              <Badge text="대표" color="purple" />
            </div>
            <div style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.5 }}>
              이 장면은 호감 표현이 아니라 편집 의도가 드러나는 순간이라고 봅니다. 시선 처리와 카메라 배치가 특히...
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SectionHeader>전체 댓글</SectionHeader>
        <div style={{ display: "flex", gap: 4, fontSize: 12 }}>
          {[{ k: "popular", l: "인기순" }, { k: "latest", l: "최신순" }].map(s => (
            <span key={s.k} onClick={() => setSort(s.k)} style={{ padding: "4px 10px", borderRadius: 6, background: sort === s.k ? "#2C2C2A" : "#F1EFE8", color: sort === s.k ? "#fff" : "#888780", fontWeight: sort === s.k ? 600 : 400, cursor: "pointer" }}>{s.l}</span>
          ))}
        </div>
      </div>

      <Comment nick="@닉C" text="나는 전략보다 감정이라고 봤는데, 다시 보니 편집 타이밍이 확실히 의도적이긴 합니다." upvotes={12} time="2시간 전"
        replies={[
          { nick: "@닉D", text: "동의합니다. 특히 마지막 리액션 컷이 핵심인 것 같아요.", upvotes: 5, time: "1시간 전" },
          { nick: "@닉E", text: "그 리액션 컷이 오히려 미스리딩 아닌가요?", upvotes: 3, time: "45분 전" },
        ]}
      />
      <Comment nick="@닉F" text="편집보다는 출연자 본인의 선택이 더 크다고 봅니다." upvotes={8} time="3시간 전" replies={[]} />

      {/* [변경8] 하단 CTA — 역할별 분기 */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #EEEDEA", background: "#FAFAF8" }}>
        {canComment ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ flex: 1, height: 38, border: "1px solid #D3D1C7", borderRadius: 10, padding: "0 12px", display: "flex", alignItems: "center", fontSize: 13, color: "#B4B2A9", background: "#fff" }}>댓글을 입력하세요...</div>
            <div style={{ width: 38, height: 38, borderRadius: 10, border: "1px solid #D3D1C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#888780", background: "#fff", cursor: "pointer", flexShrink: 0 }}>📷</div>
            <div style={{ padding: "8px 14px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>작성</div>
          </div>
        ) : isSubscriber ? (
          /* [변경8] Subscriber 전용 — 멤버 신청 유도 */
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#888780", marginBottom: 8 }}>댓글은 멤버만 작성할 수 있습니다</div>
            <div style={{ display: "inline-block", padding: "9px 20px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>댓글 멤버 신청하기</div>
          </div>
        ) : (
          /* Visitor — 구독 유도 */
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#888780", marginBottom: 8 }}>댓글은 멤버만 작성할 수 있습니다</div>
            <div style={{ display: "inline-block", padding: "9px 20px", background: "#534AB7", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600 }}>이 룸 구독하러 가기</div>
          </div>
        )}
      </div>
    </div>
  );
}

function MyPageScreen({ state }) {
  if (state === "구독 없음(Empty)")
    return (
      <div>
        <div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>마이페이지</div>
        <ProfileSection />
        <div style={{ padding: "60px 24px", textAlign: "center", color: "#888780", fontSize: 14 }}>아직 활동 내역이 없습니다</div>
      </div>
    );
  const activeTab = state === "이슈 탭" ? 1 : state === "댓글 탭" ? 2 : 0;
  return (
    <div>
      <div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>마이페이지</div>
      <ProfileSection />
      <div style={{ display: "flex", borderBottom: "2px solid #EEEDEA" }}>
        {["룸", "이슈", "댓글"].map((t, i) => (
          <div key={t} style={{ flex: 1, padding: "12px 0", textAlign: "center", fontSize: 14, fontWeight: activeTab === i ? 600 : 400, color: activeTab === i ? "#534AB7" : "#888780", borderBottom: activeTab === i ? "2px solid #534AB7" : "none", marginBottom: -2 }}>{t}</div>
        ))}
      </div>
      {activeTab === 0 && <MyPageRoomTab />}
      {activeTab === 1 && <MyPageIssueTab />}
      {activeTab === 2 && <MyPageCommentTab />}
    </div>
  );
}

function ProfileSection() {
  return (
    <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #EEEDEA" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#534AB7", fontWeight: 600 }}>K</div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>@김해석</div>
        <div style={{ fontSize: 12, color: "#888780" }}>콘텐츠를 맥락으로 읽는 사람</div>
      </div>
    </div>
  );
}

function RoomItem({ name, color, icon, action }) {
  const colors = { purple: { bg: "#EEEDFE", text: "#534AB7" }, teal: { bg: "#E1F5EE", text: "#0F6E56" }, amber: { bg: "#FAEEDA", text: "#854F0B" } };
  const c = colors[color] || colors.purple;
  return (
    <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1EFE8" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: c.text }}>{icon}</div>
      <span style={{ fontSize: 14, color: "#2C2C2A", flex: 1 }}>{name}</span>
      {action && <span style={{ padding: "4px 10px", background: "#F1EFE8", borderRadius: 6, fontSize: 12, color: "#5F5E5A", fontWeight: 600 }}>{action}</span>}
    </div>
  );
}

function MyPageRoomTab() {
  return (
    <>
      <SectionHeader>구독 중인 룸</SectionHeader>
      <RoomItem name="나는 솔로 해석 룸" color="purple" icon="◈" />
      <RoomItem name="리벨북스 비문학 스터디" color="purple" icon="◈" />
      <SectionHeader>참여 중인 룸</SectionHeader>
      <RoomItem name="흑백요리사 해석 룸" color="teal" icon="◈" />
      <SectionHeader>운영 중인 룸</SectionHeader>
      <RoomItem name="테슬라 한국 실사용자 룸" color="amber" icon="★" action="운영하기" />
    </>
  );
}

function SubTabSelector({ tabs, active, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "10px 16px" }}>
      {tabs.map(s => (
        <span key={s.k} onClick={() => onSelect(s.k)} style={{ padding: "5px 12px", borderRadius: 20, background: active === s.k ? "#2C2C2A" : "#F1EFE8", color: active === s.k ? "#fff" : "#888780", fontSize: 12, fontWeight: active === s.k ? 600 : 400, cursor: "pointer" }}>{s.l}</span>
      ))}
    </div>
  );
}

function MiniIssue({ title, room }) {
  return (
    <div style={{ padding: "10px 16px", borderBottom: "1px solid #F1EFE8" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 11, color: "#888780" }}>{room}</div>
    </div>
  );
}

function MiniComment({ nick, text, issue }) {
  return (
    <div style={{ padding: "10px 16px", borderBottom: "1px solid #F1EFE8" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#5F5E5A", marginBottom: 2 }}>{nick}</div>
      <div style={{ fontSize: 13, color: "#444441", marginBottom: 2 }}>{text}</div>
      <div style={{ fontSize: 11, color: "#B4B2A9" }}>→ {issue}</div>
    </div>
  );
}

function MyPageIssueTab() {
  const [sub, setSub] = useState("scrap");
  return (
    <>
      <SubTabSelector tabs={[{ k: "scrap", l: "스크랩" }, { k: "written", l: "작성" }, { k: "upvoted", l: "업보트" }]} active={sub} onSelect={setSub} />
      {sub === "scrap" && (<><MiniIssue title="이번 데이트 선택, 어떻게 읽히나" room="나는 솔로 해석 룸" /><MiniIssue title="올해 테슬라 가격 전략 분석" room="테슬라 한국 실사용자 룸" /></>)}
      {sub === "written" && <MiniIssue title="FSD 한국 도입, 올해 안 가능할까?" room="테슬라 한국 실사용자 룸" />}
      {sub === "upvoted" && (<><MiniIssue title="이번 장의 핵심 질문은 무엇인가" room="리벨북스 비문학 스터디" /><MiniIssue title="이번 선택, 진짜 의도였을까?" room="나는 솔로 해석 룸" /></>)}
    </>
  );
}

function MyPageCommentTab() {
  const [sub, setSub] = useState("scrap");
  return (
    <>
      <SubTabSelector tabs={[{ k: "scrap", l: "스크랩" }, { k: "written", l: "작성" }, { k: "upvoted", l: "업보트" }]} active={sub} onSelect={setSub} />
      {sub === "scrap" && <MiniComment nick="@닉A" text="도입보다 과금 구조가 더 관건이라는 이야기가..." issue="FSD 한국 도입..." />}
      {sub === "written" && (<><MiniComment nick="나" text="이 장면은 편집보다 출연자 의도가 더 크다고 봅니다." issue="이번 데이트 선택..." /><MiniComment nick="나" text="3장 후반부의 논증 구조가 좀 약한 것 같습니다." issue="이번 장의 핵심..." /></>)}
      {sub === "upvoted" && <MiniComment nick="@닉B" text="이번 장면은 호감보다 편집 의도가 드러나는 순간..." issue="이번 선택, 진짜..." />}
    </>
  );
}

function RoomSettingsScreen() {
  return (
    <div>
      <div style={{ padding: "14px 16px 8px", fontSize: 18, fontWeight: 700, color: "#2C2C2A", borderBottom: "1px solid #EEEDEA" }}>운영자 › 룸 설정</div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {[{ label: "룸 이름", val: "테슬라 한국 실사용자 룸" }, { label: "한 줄 설명", val: "루머보다 해석, 드립보다 이유" }, { label: "상세 설명", val: "실사용/가격/정책 관점의 반응을 모읍니다", multi: true }].map(f => (
          <div key={f.label}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>{f.label}</div>
            <div style={{ padding: f.multi ? "10px 12px" : "9px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: "#2C2C2A", background: "#fff", minHeight: f.multi ? 60 : "auto" }}>{f.val}</div>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>룸 유형</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["쇼케이스형", "확장형"].map((t, i) => (
              <div key={t} style={{ flex: 1, padding: "10px 0", border: i === 0 ? "2px solid #534AB7" : "1px solid #D3D1C7", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: i === 0 ? "#534AB7" : "#888780", background: i === 0 ? "#F3F2FC" : "#fff" }}>{t}</div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>공개 상태</div>
          <div style={{ display: "flex", gap: 8 }}>
            {["비공개", "공개"].map((t, i) => (
              <div key={t} style={{ flex: 1, padding: "10px 0", border: i === 1 ? "2px solid #0F6E56" : "1px solid #D3D1C7", borderRadius: 10, textAlign: "center", fontSize: 13, fontWeight: 600, color: i === 1 ? "#0F6E56" : "#888780", background: i === 1 ? "#E1F5EE" : "#fff" }}>{t}</div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>멤버 관리</div>
          {["@userA", "@userB"].map(u => (
            <div key={u} style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1EFE8" }}>
              <span style={{ fontSize: 14, color: "#2C2C2A" }}>{u}</span>
              <span style={{ fontSize: 12, color: "#993C1D", fontWeight: 500 }}>제거</span>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "9px 12px", border: "1px dashed #D3D1C7", borderRadius: 10, fontSize: 13, color: "#888780", textAlign: "center" }}>+ 사용자 검색 후 추가</div>
        </div>
        <div style={{ padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center", marginTop: 8 }}>저장</div>
      </div>
    </div>
  );
}

// [변경2] 운영자 한 줄 필드 복원
function IssuePublishScreen({ state }) {
  const isEdit = state === "이슈 수정";
  return (
    <div>
      <div style={{ padding: "14px 16px 8px", fontSize: 18, fontWeight: 700, color: "#2C2C2A", borderBottom: "1px solid #EEEDEA" }}>운영자 › {isEdit ? "이슈 수정" : "새 이슈 발행"}</div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { label: "제목", val: isEdit ? "FSD 한국 도입, 올해 안 가능할까?" : "", ph: "이슈 제목을 입력하세요" },
          { label: "운영자 한 줄", val: isEdit ? "일정보다 가격/체감이 핵심이라 봅니다" : "", ph: "이 이슈를 어떤 관점으로 볼지 한 줄로" },
          { label: "질문 (선택)", val: "", ph: "댓글을 끌어낼 질문" },
          { label: "본문", val: isEdit ? "이번 FSD 도입 논의에서 가장 핵심적인 부분은..." : "", ph: "본문을 입력하세요", multi: true },
        ].map(f => (
          <div key={f.label}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>{f.label}</div>
            <div style={{ padding: f.multi ? "10px 12px" : "9px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: f.val ? "#2C2C2A" : "#B4B2A9", background: "#fff", minHeight: f.multi ? 80 : "auto" }}>{f.val || f.ph}</div>
          </div>
        ))}
        <div style={{ padding: 20, border: "1px dashed #D3D1C7", borderRadius: 10, textAlign: "center", color: "#888780", fontSize: 13 }}>이미지 / 링크 / 유튜브 첨부</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>이슈 상태</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["예정", "진행 중", "종료"].map((s, i) => (
              <div key={s} style={{ flex: 1, padding: "8px 0", border: i === 1 ? "2px solid #0F6E56" : "1px solid #D3D1C7", borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 600, color: i === 1 ? "#0F6E56" : "#888780", background: i === 1 ? "#E1F5EE" : "#fff" }}>{s}</div>
            ))}
          </div>
        </div>
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
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <div style={{ flex: 1, padding: "12px 0", background: "#534AB7", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textAlign: "center" }}>{isEdit ? "수정" : "발행"}</div>
          {isEdit && <div style={{ padding: "12px 16px", background: "#FAECE7", color: "#993C1D", borderRadius: 12, fontSize: 14, fontWeight: 600, textAlign: "center" }}>삭제</div>}
        </div>
      </div>
    </div>
  );
}

// [변경1] 대표 댓글 1개로 복원
function RepCommentScreen() {
  return (
    <div>
      <div style={{ padding: "14px 16px 8px", fontSize: 18, fontWeight: 700, color: "#2C2C2A", borderBottom: "1px solid #EEEDEA" }}>운영자 › 대표 댓글 지정</div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>이슈</div>
        <div style={{ padding: "10px 12px", border: "1px solid #D3D1C7", borderRadius: 10, fontSize: 14, color: "#2C2C2A", background: "#fff", marginBottom: 16 }}>FSD 한국 도입, 올해 안 가능할까?</div>
      </div>
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>현재 대표 댓글 (1개)</div>
        <div style={{ padding: "10px 14px", background: "#F3F2FC", borderRadius: 10, borderLeft: "3px solid #7F77DD", display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#534AB7", marginBottom: 3 }}>@닉A</div>
            <div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.45 }}>도입보다 과금 구조가 더 관건이라는 이야기가...</div>
          </div>
          <span style={{ padding: "4px 10px", background: "#FAECE7", color: "#993C1D", borderRadius: 6, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>해제</span>
        </div>
      </div>
      <SectionHeader>전체 댓글</SectionHeader>
      {[
        { nick: "@닉B", text: "이번 건은 일정 자체보다 인프라 준비가..." },
        { nick: "@닉C", text: "오히려 OTA 체감이 더 중요한 포인트라고..." },
        { nick: "@닉D", text: "국내 가격 포지셔닝이 결국 핵심일 것..." },
      ].map((c, i) => (
        <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#444441", marginBottom: 4 }}>{c.nick}</div>
            <div style={{ fontSize: 13, color: "#444441", lineHeight: 1.45 }}>{c.text}</div>
          </div>
          <span style={{ padding: "4px 10px", background: "#EEEDFE", color: "#534AB7", borderRadius: 6, fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>지정</span>
        </div>
      ))}
    </div>
  );
}

// ========= INFO PANEL =========

const SCREEN_INFO = {
  feed: {
    route: "/feed",
    purpose: "구독한 룸들의 최신 이슈를 한 번에 소비하는 메인 화면",
    data: ["구독 Room 아바타 바", "각 Room의 최신 Issue", "운영자 한 줄", "대표 댓글", "댓글·업보트 수"],
    cta: ["이슈 읽기", "룸 보기(룸명 탭)"],
    notes: "상단에 구독 룸 아바타 행 표시. 대표 댓글이 지정된 이슈만 노출 (피드 품질 원칙). 룸명은 탭 가능한 링크.",
  },
  issues: {
    route: "/issues",
    purpose: "공개된 룸들이 발행한 최신 이슈 전체를 보는 목록 화면",
    data: ["공개 Issue", "운영자 한 줄", "본문 미리보기", "대표 댓글", "댓글·업보트 수"],
    cta: ["이슈 읽기", "룸 보기(룸명 탭)"],
    notes: "대표 댓글 지정된 이슈를 우선 노출. 스포일러 이슈는 본문 숨김. 룸명은 탭 가능한 링크.",
  },
  rooms: {
    route: "/rooms",
    purpose: "Visitor가 서비스에 처음 진입했을 때 공개 룸을 발견하는 화면",
    data: ["공개 Room 목록", "룸 유형(읽기 중심/참여 가능)", "이슈 수", "구독자 수"],
    cta: ["구독하기", "룸 상세 보기"],
    notes: "Visitor 진입점. 하단 '룸' 탭 연결 화면. 피드 Empty 상태의 '룸 둘러보기' 버튼이 연결되는 곳.",
  },
  room: {
    route: "/rooms/:slug",
    purpose: "룸의 정체성과 결을 느끼고 구독 여부를 결정하게 만드는 페이지",
    data: ["룸 정보", "룸 유형 배지", "이 룸의 대표 반응 2~3개", "대표 이슈", "최신 이슈"],
    cta: ["구독하기/구독 중", "운영하기(Op)", "⋯ → 멤버 가입(확장형만)"],
    notes: "쇼케이스형: ⋯ 미노출, '읽기 중심' 안내. 확장형: ⋯ 노출, '같이 이야기하고 싶다면' soft signal. '이 룸의 대표 반응' 섹션으로 결 전달 강화.",
  },
  issue: {
    route: "/rooms/:slug/issues/:id",
    purpose: "이슈 본문 + 대표 댓글(1개) + 전체 댓글을 소비하는 핵심 화면",
    data: ["이슈 전체 정보", "운영자 한 줄", "작성일/상태", "대표 댓글(1개)", "전체 댓글 + 대댓글"],
    cta: ["업보트", "스크랩", "신고", "댓글 작성(+이미지)", "정렬", "댓글 스크랩/신고"],
    notes: "Visitor → '구독하러 가기', Subscriber → '댓글 멤버 신청하기', Member/Op → 댓글 입력. 이슈·댓글 모두 스크랩 가능.",
  },
  mypage: {
    route: "/me",
    purpose: "사용자의 개인 활동과 룸 관계를 한 번에 보여주는 허브",
    data: ["프로필", "룸: 구독/참여/운영", "이슈: 스크랩/작성/업보트", "댓글: 스크랩/작성/업보트"],
    cta: ["룸 보기", "운영하기", "서브탭 전환"],
    notes: "이슈·댓글 각각 스크랩/작성/업보트 3분류.",
  },
  "room-settings": {
    route: "/operator/rooms/:id/settings",
    purpose: "운영자가 룸의 정체성/공개 상태/멤버를 관리하는 화면",
    data: ["룸 이름/설명", "룸 유형", "공개 상태", "멤버 목록"],
    cta: ["저장", "멤버 추가/제거"],
    notes: "Operator/Admin만 접근 가능.",
  },
  "issue-publish": {
    route: "/operator/rooms/:id/issues/new",
    purpose: "운영자가 이슈를 발행/수정하는 입력 화면",
    data: ["제목/운영자 한 줄/질문/본문/첨부", "이슈 상태", "대표 이슈 여부", "스포일러 포함"],
    cta: ["발행", "수정", "삭제", "대표 이슈", "스포일러"],
    notes: "운영자 한 줄 필드 복원됨. 이 필드가 이슈 카드와 상세에 노출되어 룸의 관점을 전달.",
  },
  "rep-comment": {
    route: "/operator/issues/:id/comments",
    purpose: "운영자가 이슈별 대표 댓글 1개를 지정하는 화면",
    data: ["이슈 정보", "전체 댓글 목록", "현재 대표 댓글(1개)"],
    cta: ["대표 댓글 지정", "해제"],
    notes: "대표 댓글은 1개만 지정 가능. 해제 후 다른 댓글로 변경.",
  },
};

function InfoPanel({ screenId }) {
  const info = SCREEN_INFO[screenId];
  if (!info) return null;
  return (
    <div style={{ padding: "16px 20px", background: "#FAFAF8", borderRadius: 12, border: "1px solid #EEEDEA", fontSize: 13, color: "#444441", lineHeight: 1.6, maxWidth: 380 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 2 }}>Route</div>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#534AB7", background: "#F3F2FC", padding: "4px 8px", borderRadius: 6, display: "inline-block", marginBottom: 12 }}>{info.route}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>목적</div>
      <div style={{ marginBottom: 12 }}>{info.purpose}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>핵심 데이터</div>
      <div style={{ marginBottom: 12 }}>{info.data.map((d, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}><span style={{ color: "#AFA9EC" }}>•</span> {d}</div>)}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>주요 CTA</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>{info.cta.map((c, i) => <Badge key={i} text={c} color="purple" />)}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>비고</div>
      <div style={{ fontSize: 12, color: "#5F5E5A" }}>{info.notes}</div>
    </div>
  );
}

// ========= MAIN =========

export default function WireframeViewer() {
  const [activeScreen, setActiveScreen] = useState("feed");
  const [activeState, setActiveState] = useState(0);
  const currentStates = STATES[activeScreen] || ["기본"];
  const currentStateName = currentStates[activeState] || currentStates[0];
  const handleScreenChange = (id) => { setActiveScreen(id); setActiveState(0); };
  const activeScreenMeta = SCREENS.find((screen) => screen.id === activeScreen);

  const renderScreen = () => {
    switch (activeScreen) {
      case "feed": return <FeedScreen state={currentStateName} />;
      case "issues": return <IssueListScreen state={currentStateName} />;
      case "rooms": return <RoomListScreen state={currentStateName} />;
      case "room": return <RoomScreen state={currentStateName} />;
      case "issue": return <IssueDetailScreen state={currentStateName} />;
      case "mypage": return <MyPageScreen state={currentStateName} />;
      case "room-settings": return <RoomSettingsScreen />;
      case "issue-publish": return <IssuePublishScreen state={currentStateName} />;
      case "rep-comment": return <RepCommentScreen />;
      default: return null;
    }
  };

  const groups = [
    { key: "user", label: "사용자 화면", hint: "실제 서비스 사용자가 보게 되는 페이지" },
    { key: "operator", label: "운영자 화면", hint: "운영자가 관리와 발행에 사용하는 페이지" },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, "Pretendard", sans-serif', maxWidth: 900 }}>
      <div style={{ marginBottom: 20, display: "grid", gap: 12 }}>
        <div style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #E6E0FA", background: "#FCFBFF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#534AB7", marginBottom: 4 }}>1. 페이지 선택</div>
              <div style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.5 }}>아래 미리보기 자체를 다른 페이지로 바꿉니다.</div>
            </div>
            <Badge text={`현재: ${activeScreenMeta?.label || activeScreen}`} color="purple" />
          </div>
          {groups.map((g) => (
            <div key={g.key} style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7A72C5", textTransform: "uppercase", letterSpacing: "0.05em" }}>{g.label}</div>
                <div style={{ fontSize: 12, color: "#888780", marginTop: 2 }}>{g.hint}</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SCREENS.filter((s) => s.group === g.key).map((s) => (
                  <button key={s.id} onClick={() => handleScreenChange(s.id)} style={{ padding: "7px 14px", borderRadius: 8, border: activeScreen === s.id ? "1.5px solid #534AB7" : "1px solid #D3D1C7", background: activeScreen === s.id ? "#F3F2FC" : "#fff", color: activeScreen === s.id ? "#534AB7" : "#5F5E5A", fontWeight: activeScreen === s.id ? 600 : 400, fontSize: 13, cursor: "pointer" }}>
                    {s.label}
                    {s.id === "rooms" && <span style={{ marginLeft: 4, fontSize: 9, padding: "1px 5px", background: "#FAEEDA", color: "#854F0B", borderRadius: 4, fontWeight: 600 }}>NEW</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 18px", borderRadius: 16, border: "1px solid #D7EBE4", background: "#F8FEFB" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#0F6E56", marginBottom: 4 }}>2. 같은 페이지 안 상태 전환</div>
              <div style={{ fontSize: 13, color: "#5F5E5A", lineHeight: 1.5 }}>권한 차이·빈 상태·룸 유형 등 상황만 바꿔서 비교합니다.</div>
            </div>
            <Badge text={`현재: ${currentStateName}`} color="teal" />
          </div>
          <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 10 }}>
            기준 페이지: <span style={{ fontWeight: 600, color: "#0F6E56" }}>{activeScreenMeta?.label || activeScreen}</span>
          </div>
          {currentStates.length > 1 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {currentStates.map((s, i) => (
                <button key={s} onClick={() => setActiveState(i)} style={{ padding: "6px 12px", borderRadius: 999, border: activeState === i ? "1.5px solid #0F6E56" : "1px solid #C7DED6", background: activeState === i ? "#E1F5EE" : "#fff", color: activeState === i ? "#0F6E56" : "#5F5E5A", fontWeight: activeState === i ? 600 : 400, fontSize: 12, cursor: "pointer" }}>{s}</button>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#888780", padding: "10px 12px", borderRadius: 10, border: "1px dashed #C7DED6", background: "#fff" }}>이 페이지는 추가 상태가 없습니다.</div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Phone>{renderScreen()}</Phone>
        <InfoPanel screenId={activeScreen} />
      </div>
    </div>
  );
}
