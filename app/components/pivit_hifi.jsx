'use client';

import { useState } from "react";

/* ─────────────────────────────────────────────
   PIVIT Design Tokens
   ───────────────────────────────────────────── */
const T = {
  brand:      '#DE0B55',
  brandDis:   'rgba(236,33,70,0.26)',
  brandTint:  'rgba(236,33,70,0.08)',
  brandTint2: 'rgba(236,33,70,0.05)',
  surface:    '#FFFFFF',
  subtle:     '#F5F5F5',
  tag:        '#E5E5E5',
  disabled:   '#F5F5F5',
  title:      '#171717',
  body:       '#262626',
  bodyAlt:    '#0A0A0A',
  textSub:    '#525252',
  muted:      '#737373',
  placeholder:'#B2B2B2',
  inactive:   '#757575',
  border:     '#E0E0E0',
  borderSub:  '#D4D4D4',
  error:      '#FF1414',
  kakao:      '#FEE500',
  kakaoText:  'rgba(0,0,0,0.85)',
  overlay:    'rgba(0,0,0,0.5)',
  focusRing:  '#A1A1A1',
  teal:       '#0F6E56',
  tealBg:     '#E1F5EE',
  amber:      '#854F0B',
  amberBg:    '#FAEEDA',
  font:       '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
  r: { xs: 4, sm: 6, md: 8, lg: 10, xl: 14, full: 999 },
};

/* ─────────────────────────────────────────────
   Screen & State Definitions
   ───────────────────────────────────────────── */
const SCREENS = [
  { id: "feed", label: "내 피드(홈)", group: "user" },
  { id: "issues", label: "이슈 목록", group: "user" },
  { id: "rooms", label: "룸 목록", group: "user" },
  { id: "room", label: "룸 상세", group: "user" },
  { id: "issue", label: "이슈 상세", group: "user" },
  { id: "mypage", label: "마이페이지", group: "user" },
  { id: "profile", label: "프로필", group: "user" },
  { id: "room-settings", label: "룸 설정", group: "operator" },
  { id: "issue-publish", label: "이슈 발행/수정", group: "operator" },
  { id: "rep-comment", label: "대표 댓글 지정", group: "operator" },
];

const STATES = {
  feed: ["기본", "구독 룸 없음(Empty)"],
  issues: ["기본", "스포일러 포함 이슈", "이슈 없음(Empty)"],
  rooms: ["Visitor", "Subscriber"],
  room: ["멤버모집-Visitor", "멤버모집-Subscriber", "멤버모집-Member", "멤버모집-Operator", "모집안함-Visitor", "모집안함-Subscriber", "모집안함-Member", "모집안함-Operator"],
  issue: ["Visitor", "Subscriber(구독만)", "Member/Operator", "대표 댓글 없음"],
  mypage: ["룸 탭", "이슈 탭", "댓글 탭", "구독 없음(Empty)"],
  profile: ["내 프로필", "다른 사용자 프로필"],
  "room-settings": ["기본"],
  "issue-publish": ["새 이슈", "이슈 수정"],
  "rep-comment": ["기본"],
};

/* ─────────────────────────────────────────────
   Icons (minimal SVG)
   ───────────────────────────────────────────── */
const Icon = {
  star: (c = T.muted, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4L8 11.2l-3.6 1.8.7-4L2.2 6.2l4-.6z" fill={c}/></svg>,
  comment: (c = T.muted, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M2 2.5A1.5 1.5 0 013.5 1h9A1.5 1.5 0 0114 2.5v7a1.5 1.5 0 01-1.5 1.5H6l-3 3V11H3.5A1.5 1.5 0 012 9.5z" fill={c}/></svg>,
  eye: (c = T.muted, s = 14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M8 3C4.4 3 1.4 5.4.5 8c.9 2.6 3.9 5 7.5 5s6.6-2.4 7.5-5c-.9-2.6-3.9-5-7.5-5zm0 8.3A3.3 3.3 0 118 4.7a3.3 3.3 0 010 6.6zm0-5.3a2 2 0 100 4 2 2 0 000-4z" fill={c}/></svg>,
  back: () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M13 4l-6 6 6 6" stroke={T.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  share: () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13.5 6.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM4.5 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM13.5 15.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" stroke={T.muted} strokeWidth="1.4"/><path d="M6.44 10.31l5.13 2.88M11.56 4.81l-5.12 2.88" stroke={T.muted} strokeWidth="1.4"/></svg>,
  camera: () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2.25 5.25a1.5 1.5 0 011.5-1.5h1.69l.56-1.12A1.5 1.5 0 017.34 1.5h3.32a1.5 1.5 0 011.34.83l.56 1.12h1.69a1.5 1.5 0 011.5 1.5v8.25a1.5 1.5 0 01-1.5 1.5h-12a1.5 1.5 0 01-1.5-1.5V5.25z" stroke={T.muted} strokeWidth="1.3"/><circle cx="9" cy="8.625" r="2.625" stroke={T.muted} strokeWidth="1.3"/></svg>,
  flag: () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.33 1.17v11.66M2.33 1.75h7.59a.58.58 0 01.41 1l-1.75 1.75 1.75 1.75a.58.58 0 01-.41 1H2.33" stroke={T.placeholder} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  pen: () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  home: (active) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 8.5L11 2l8 6.5V19a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 013 19V8.5z" stroke={active ? T.brand : T.muted} strokeWidth="1.6" fill={active ? T.brandTint : 'none'}/><path d="M8.25 20.5V11h5.5v9.5" stroke={active ? T.brand : T.muted} strokeWidth="1.6"/></svg>,
  list: (active) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M4 11h14M4 16h10" stroke={active ? T.brand : T.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  grid: (active) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke={active ? T.brand : T.muted} strokeWidth="1.5" fill={active ? T.brandTint : 'none'}/><rect x="12" y="3" width="7" height="7" rx="2" stroke={active ? T.brand : T.muted} strokeWidth="1.5" fill={active ? T.brandTint : 'none'}/><rect x="3" y="12" width="7" height="7" rx="2" stroke={active ? T.brand : T.muted} strokeWidth="1.5" fill={active ? T.brandTint : 'none'}/><rect x="12" y="12" width="7" height="7" rx="2" stroke={active ? T.brand : T.muted} strokeWidth="1.5" fill={active ? T.brandTint : 'none'}/></svg>,
  user: (active) => <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="8" r="4" stroke={active ? T.brand : T.muted} strokeWidth="1.5" fill={active ? T.brandTint : 'none'}/><path d="M4 19.5c0-3.31 3.13-6 7-6s7 2.69 7 6" stroke={active ? T.brand : T.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>,
};

/* ─────────────────────────────────────────────
   Primitives
   ───────────────────────────────────────────── */
function Badge({ text, variant = 'default' }) {
  const styles = {
    default: { bg: T.tag, color: T.textSub },
    brand: { bg: T.brandTint, color: T.brand },
    teal: { bg: T.tealBg, color: T.teal },
    amber: { bg: T.amberBg, color: T.amber },
    error: { bg: '#FCEBEB', color: '#A32D2D' },
    muted: { bg: T.subtle, color: T.muted },
  };
  const s = styles[variant] || styles.default;
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: T.r.full, fontSize: 11, fontWeight: 500, background: s.bg, color: s.color, lineHeight: 1.2, whiteSpace: 'nowrap' }}>{text}</span>;
}

function PrimaryBtn({ children, full, small, disabled, style: sx }) {
  return <div style={{ padding: small ? '10px 16px' : '13px 20px', background: disabled ? T.brandDis : T.brand, color: '#fff', borderRadius: T.r.lg, fontSize: small ? 13 : 15, fontWeight: 600, textAlign: 'center', cursor: disabled ? 'default' : 'pointer', width: full ? '100%' : 'auto', boxSizing: 'border-box', ...sx }}>{children}</div>;
}

function OutlineBtn({ children, color, full, style: sx }) {
  const c = color || T.brand;
  return <div style={{ padding: '12px 16px', background: '#fff', color: c, border: `1.5px solid ${c}`, borderRadius: T.r.lg, fontSize: 13, fontWeight: 600, textAlign: 'center', cursor: 'pointer', width: full ? '100%' : 'auto', boxSizing: 'border-box', ...sx }}>{children}</div>;
}

function SecondaryBtn({ children, style: sx }) {
  return <div style={{ padding: '12px 16px', background: T.subtle, color: T.title, borderRadius: T.r.lg, fontSize: 13, fontWeight: 600, textAlign: 'center', cursor: 'pointer', ...sx }}>{children}</div>;
}

/* Phone Frame */
function Phone({ children, activeTab, onTabChange }) {
  const tabs = [
    { id: 'feed', icon: Icon.home, label: '피드' },
    { id: 'issues', icon: Icon.list, label: '이슈' },
    { id: 'rooms', icon: Icon.grid, label: '룸' },
    { id: 'mypage', icon: Icon.user, label: '마이' },
  ];
  return (
    <div style={{ width: 375, minHeight: 700, background: '#fff', borderRadius: 36, border: '1px solid #E0E0E0', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)', flexShrink: 0, fontFamily: T.font }}>
      {/* Status bar */}
      <div style={{ height: 44, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: 'none', flexShrink: 0 }}>
        <div style={{ width: 120, height: 5, background: T.title, borderRadius: 3, opacity: 0.2 }} />
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>{children}</div>
      {/* Tab bar */}
      <div style={{ height: 52, background: '#fff', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px', flexShrink: 0 }}>
        {tabs.map((t) => {
          const active = activeTab === t.id;
          return (
            <div key={t.id} onClick={() => onTabChange?.(t.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '4px 12px' }}>
              {t.icon(active)}
              <span style={{ fontSize: 10, color: active ? T.brand : T.muted, fontWeight: active ? 600 : 400, letterSpacing: '-0.01em' }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Meta row */
function MetaRow({ comments, upvotes, views, compact }) {
  const s = compact ? 11 : 12;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 10 : 14, fontSize: s, color: T.muted, marginTop: compact ? 6 : 10 }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{Icon.star(T.placeholder, 12)} {upvotes}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{Icon.comment(T.placeholder, 12)} {comments}</span>
      {views !== undefined && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{Icon.eye(T.placeholder, 12)} {views}</span>}
    </div>
  );
}

/* Room Thumbnail */
function RoomThumb({ size = 36, hue, initial }) {
  const colors = [
    { bg: T.brandTint, text: T.brand },
    { bg: T.tealBg, text: T.teal },
    { bg: T.amberBg, text: T.amber },
    { bg: '#EEF2FF', text: '#4338CA' },
  ];
  const c = colors[(hue || 0) % colors.length];
  return <div style={{ width: size, height: size, borderRadius: size > 40 ? T.r.xl : size > 24 ? T.r.lg : T.r.md, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, color: c.text, fontWeight: 600, flexShrink: 0, letterSpacing: '-0.02em' }}>{initial || '◈'}</div>;
}

/* Status badge */
function StatusBadge({ status }) {
  if (status === "진행 중") return null;
  if (status === "종료") return <Badge text="종료" variant="muted" />;
  return null;
}

/* Section header */
function SH({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: T.muted, padding: '14px 16px 8px', background: T.subtle }}>{children}</div>;
}

/* Image placeholder */
function ImgPlaceholder({ h }) {
  return <div style={{ width: '100%', height: h || 180, background: `linear-gradient(135deg, ${T.subtle} 0%, #F0E8EF 50%, ${T.subtle} 100%)`, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: T.placeholder, marginTop: 8 }}>첨부 이미지</div>;
}

/* ─────────────────────────────────────────────
   Card Components
   ───────────────────────────────────────────── */

/* Big Issue Card (Feed) */
function BigIssueCard({ room, roomHue, title, opLine, body, repNick, repComment, status, comments, upvotes, views, hasImage }) {
  return (
    <div style={{ padding: '18px 16px', borderBottom: `6px solid ${T.subtle}` }}>
      {/* Room link */}
      <div style={{ fontSize: 12, color: T.brand, fontWeight: 500, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
        <RoomThumb size={20} hue={roomHue} />
        <span>{room}</span>
      </div>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: T.title, lineHeight: 1.4, flex: 1 }}>{title}</span>
        <StatusBadge status={status} />
      </div>
      {/* Operator line */}
      {opLine && <div style={{ fontSize: 12, color: T.textSub, marginBottom: 8, fontStyle: 'italic' }}><span style={{ fontWeight: 500, fontStyle: 'normal', color: T.muted }}>운영자: </span>{opLine}</div>}
      {/* Body */}
      <div style={{ fontSize: 14, color: T.body, lineHeight: 1.6, marginBottom: hasImage ? 4 : 8, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{body}</div>
      {hasImage && <ImgPlaceholder h={160} />}
      {/* Representative comment */}
      {repComment && (
        <div style={{ background: T.brandTint2, padding: '12px 14px', borderRadius: T.r.lg, borderLeft: `3px solid ${T.brand}`, marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.brand }}>{repNick}</span>
            <Badge text="대표" variant="brand" />
          </div>
          <div style={{ fontSize: 14, color: T.body, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{repComment}</div>
        </div>
      )}
      <MetaRow comments={comments} upvotes={upvotes} views={views} />
    </div>
  );
}

/* Compact Issue Card (Issue List) */
function CompactIssueCard({ room, roomHue, title, opLine, repShort, status, comments, upvotes, views, isSpoiler }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ fontSize: 11, color: T.brand, fontWeight: 500, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
        <RoomThumb size={14} hue={roomHue} />
        <span>{room}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.title, lineHeight: 1.35, flex: 1 }}>{title}</span>
        {isSpoiler && <Badge text="스포" variant="error" />}
        <StatusBadge status={status} />
      </div>
      {isSpoiler ? (
        <div style={{ fontSize: 12, color: T.placeholder, fontStyle: 'italic', padding: '4px 0' }}>스포일러 포함 · 탭하여 보기</div>
      ) : (
        <>
          {opLine && <div style={{ fontSize: 12, color: T.muted, marginBottom: 3 }}>운영자: {opLine}</div>}
          {repShort && <div style={{ fontSize: 12, color: T.textSub, display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ color: T.brand, fontSize: 8 }}>●</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{repShort}</span></div>}
        </>
      )}
      <MetaRow comments={comments} upvotes={upvotes} views={views} compact />
    </div>
  );
}

/* Room Issue Card */
function RoomIssueCard({ title, opLine, repShort, status, comments, upvotes, noRepYet }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {noRepYet && <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.brand, flexShrink: 0 }} />}
        <span style={{ fontSize: 15, fontWeight: 600, color: T.title, lineHeight: 1.35, flex: 1 }}>{title}</span>
        <StatusBadge status={status} />
      </div>
      {opLine && <div style={{ fontSize: 12, color: T.muted, marginBottom: 3, fontStyle: 'italic' }}>운영자: {opLine}</div>}
      {repShort ? (
        <div style={{ fontSize: 12, color: T.textSub, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: T.brand, fontSize: 8 }}>●</span>{repShort}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: T.placeholder, fontStyle: 'italic' }}>아직 대표 댓글 없음</div>
      )}
      <MetaRow comments={comments} upvotes={upvotes} compact />
    </div>
  );
}

/* Comment */
function Comment({ nick, text, upvotes, time, replies, isRep }) {
  return (
    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.body }}>{nick}</span>
          {isRep && <Badge text="대표" variant="brand" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: T.placeholder }}>{time}</span>
          {Icon.flag()}
        </div>
      </div>
      <div style={{ fontSize: 14, color: T.body, lineHeight: 1.6 }}>{text}</div>
      <div style={{ marginTop: 8, display: 'flex', gap: 16, fontSize: 12, color: T.muted }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{Icon.star(T.muted, 12)} {upvotes}</span>
        <span>답글</span>
        <span>스크랩</span>
      </div>
      {replies && replies.length > 0 && (
        <div style={{ marginTop: 10, marginLeft: 14, borderLeft: `2px solid ${T.border}`, paddingLeft: 14 }}>
          {replies.map((r, i) => (
            <div key={i} style={{ paddingBottom: 10, marginBottom: i < replies.length - 1 ? 10 : 0, borderBottom: i < replies.length - 1 ? `1px solid ${T.subtle}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.textSub }}>{r.nick}</span>
                <span style={{ fontSize: 11, color: T.placeholder }}>{r.time}</span>
              </div>
              <div style={{ fontSize: 13, color: T.textSub, lineHeight: 1.5 }}>{r.text}</div>
              <div style={{ marginTop: 4, display: 'flex', gap: 12, fontSize: 11, color: T.placeholder }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{Icon.star(T.placeholder, 11)} {r.upvotes}</span>
                <span>답글</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screens
   ───────────────────────────────────────────── */

/* Subscribed Room Bar */
function SubscribedRoomBar() {
  const rooms = [
    { name: "테슬라", hue: 2, initial: "T" },
    { name: "나솔", hue: 0, initial: "나" },
    { name: "리벨", hue: 1, initial: "리" },
  ];
  return (
    <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
      {rooms.map((r, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
          <RoomThumb size={40} hue={r.hue} initial={r.initial} />
          <span style={{ fontSize: 10, color: T.muted, fontWeight: 500 }}>{r.name}</span>
        </div>
      ))}
      <div style={{ fontSize: 11, color: T.placeholder, marginLeft: 'auto' }}>3개 룸 구독 중</div>
    </div>
  );
}

/* Feed */
function FeedScreen({ state }) {
  if (state === "구독 룸 없음(Empty)") {
    return (
      <div style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: T.title, marginBottom: 8 }}>아직 구독한 룸이 없습니다</div>
        <div style={{ fontSize: 14, color: T.muted, marginBottom: 24, lineHeight: 1.6 }}>관심 있는 룸을 구독하면<br />이슈와 반응이 여기에 모입니다</div>
        <PrimaryBtn>룸 둘러보기</PrimaryBtn>
      </div>
    );
  }
  return (
    <div>
      <div style={{ padding: '14px 16px 8px', fontSize: 20, fontWeight: 700, color: T.title }}>내 피드</div>
      <SubscribedRoomBar />
      <BigIssueCard room="테슬라 한국 실사용자 룸" roomHue={2} title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격/체감이 핵심이라 봅니다" body="이번 FSD 도입 논의에서 가장 핵심적인 부분은 일정 자체가 아니라 가격 구조와 실제 체감 성능입니다. 특히 한국 도로 환경에서의 적용 가능성과 OTA 업데이트 체감 품질을 중심으로 봐야 합니다." repNick="@닉A" repComment="도입보다 과금 구조가 더 관건이라는 이야기가 많은데, 실제로 한국 시장에서 FSD 월정액 모델이 성립하려면 OTA 체감 품질이 먼저 올라와야 합니다. 가격만 맞춰서는 안 됩니다." status="진행 중" comments={24} upvotes={47} views={312} hasImage />
      <BigIssueCard room="나는 솔로 해석 룸" roomHue={0} title="이번 선택, 진짜 의도였을까?" opLine="행동보다 편집 포인트에 주목해주세요" body="이번 장면은 표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다. 두 출연자의 반응 컷을 교차 배치한 연출이 인상적입니다." repNick="@닉B" repComment="이번 장면은 호감 표현이 아니라 편집 의도가 드러나는 순간이라고 봅니다. 시선 처리와 카메라 배치를 보면, 제작진이 '이 사람은 전략적이다'라는 프레임을 씌우고 있어요." status="진행 중" comments={31} upvotes={62} views={487} hasImage />
      <BigIssueCard room="리벨북스 비문학 스터디" roomHue={1} title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 집중합시다" body="저자가 3장에서 제기하는 문제의식은 결론 부분보다 오히려 초반의 질문 자체에 더 큰 무게가 있습니다." repNick="@닉E" repComment="오히려 이 대목이 저자의 핵심 논점입니다. 결론에서 말하는 것보다 3장 초반에 던진 질문의 구조가 이 책 전체를 관통하고 있습니다." status="종료" comments={18} upvotes={35} views={198} />
    </div>
  );
}

/* Issue List */
function IssueListScreen({ state }) {
  if (state === "이슈 없음(Empty)") return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: T.title }}>아직 공개된 이슈가 없습니다</div>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 8 }}>룸에서 이슈가 발행되면 여기에 표시됩니다</div>
    </div>
  );
  const sp = state === "스포일러 포함 이슈";
  return (
    <div>
      <div style={{ padding: '14px 16px 4px', fontSize: 20, fontWeight: 700, color: T.title }}>최신 이슈</div>
      <div style={{ padding: '0 16px 10px', fontSize: 12, color: T.placeholder }}>대표 댓글이 지정된 이슈를 우선 노출합니다</div>
      <CompactIssueCard room="나는 솔로 해석 룸" roomHue={0} title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" repShort="@닉D 이건 호감보다 계산에 가까워 보입니다" status="진행 중" comments={28} upvotes={53} views={421} />
      {sp && <CompactIssueCard room="나는 솔로 해석 룸" roomHue={0} title="최종 선택 결과 분석" status="진행 중" comments={45} upvotes={89} views={670} isSpoiler />}
      <CompactIssueCard room="리벨북스 비문학 스터디" roomHue={1} title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 주목" repShort="@닉E 오히려 이 대목이 더 중요합니다" status="종료" comments={18} upvotes={35} views={198} />
      <CompactIssueCard room="테슬라 한국 실사용자 룸" roomHue={2} title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격/체감이 핵심" repShort="@닉A 도입보다 과금 구조가 관건" status="진행 중" comments={24} upvotes={47} views={312} />
    </div>
  );
}

/* Room List */
function RoomListScreen({ state }) {
  const rooms = [
    { name: "나는 솔로 해석 룸", desc: "감정보다 맥락과 편집으로 봅니다", acceptMember: false, issues: 12, subs: 84, hue: 0 },
    { name: "테슬라 한국 실사용자 룸", desc: "루머보다 해석, 드립보다 이유", acceptMember: true, issues: 18, subs: 156, hue: 2 },
    { name: "리벨북스 비문학 스터디", desc: "저자의 질문을 함께 읽습니다", acceptMember: false, issues: 8, subs: 47, hue: 1 },
  ];
  return (
    <div>
      <div style={{ padding: '14px 16px 4px', fontSize: 20, fontWeight: 700, color: T.title }}>공개 룸</div>
      <div style={{ padding: '4px 16px 14px', fontSize: 13, color: T.muted, lineHeight: 1.5 }}>결 맞는 룸을 구독하고, 이슈와 반응을 내 피드로 모아보세요</div>
      {rooms.map((r, i) => (
        <div key={i} style={{ padding: '16px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <RoomThumb size={48} hue={r.hue} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: T.title, marginBottom: 2 }}>{r.name}</div>
              <div style={{ fontSize: 13, color: T.muted }}>{r.desc}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            {r.acceptMember && <Badge text="멤버 모집 중" variant="teal" />}
            <span style={{ fontSize: 11, color: T.placeholder }}>이슈 {r.issues}개 · 구독자 {r.subs}명</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <PrimaryBtn full small style={{ flex: 1 }}>{state === "Subscriber" ? "구독 중 ✓" : "구독하기"}</PrimaryBtn>
            {r.acceptMember && <OutlineBtn color={T.teal} style={{ padding: '10px 14px' }}>멤버 신청</OutlineBtn>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Room Detail */
function RoomScreen({ state }) {
  const parts = state.split("-");
  const acceptMember = parts[0] === "멤버모집";
  const role = parts[1] || "Visitor";
  const isOp = role === "Operator";
  const isMember = role === "Member";

  return (
    <div>
      {/* Nav */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.border}` }}>
        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: T.muted }}>{Icon.back()} 뒤로</span>
        <span style={{ cursor: 'pointer' }}>{Icon.share()}</span>
      </div>

      {/* Room Header */}
      <div style={{ padding: '16px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <RoomThumb size={52} hue={0} initial="나" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.title, marginBottom: 3 }}>나는 솔로 해석 룸</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {acceptMember && <Badge text="멤버 모집 중" variant="teal" />}
              <span style={{ fontSize: 12, color: T.placeholder }}>구독자 84명</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 14, color: T.textSub, marginBottom: 12 }}>감정보다 맥락과 편집으로 봅니다</div>

        {/* Description */}
        {isMember ? (
          <div style={{ fontSize: 12, color: T.placeholder, padding: '6px 0', marginBottom: 8, cursor: 'pointer' }}>▸ 룸 소개 보기</div>
        ) : (
          <div style={{ fontSize: 13, color: T.body, background: T.subtle, padding: '14px', borderRadius: T.r.lg, lineHeight: 1.6, marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: T.muted, marginBottom: 6 }}>이 방은 이렇게 봅니다</div>
            {"• 장면의 의도와 편집 포인트를 같이 봅니다\n• 한 줄 반응보다 이유 있는 댓글을 중시합니다"}
          </div>
        )}

        {/* CTA */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {role === "Visitor" ? (
            <PrimaryBtn full style={{ flex: 1 }}>구독하기</PrimaryBtn>
          ) : (
            <div style={{ flex: 1, padding: '13px 0', background: T.brandTint, color: T.brand, borderRadius: T.r.lg, fontSize: 15, fontWeight: 600, textAlign: 'center' }}>구독 중 ✓</div>
          )}
          {acceptMember && !isMember && !isOp && (
            <OutlineBtn color={T.teal} style={{ padding: '12px 14px' }}>멤버 신청</OutlineBtn>
          )}
          {acceptMember && isMember && (
            <div style={{ padding: '12px 14px', border: `1px solid ${T.border}`, color: T.muted, borderRadius: T.r.lg, fontSize: 13, textAlign: 'center', cursor: 'pointer' }}>멤버 탈퇴</div>
          )}
          {isOp && <SecondaryBtn style={{ padding: '12px 16px' }}>운영하기</SecondaryBtn>}
        </div>
      </div>

      {/* Member suggestion */}
      {isMember && (
        <div style={{ margin: '0 16px 8px', padding: '12px 14px', background: T.subtle, borderRadius: T.r.lg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: T.textSub }}>운영자에게 건의/제보</span>
          <span style={{ fontSize: 13, color: T.brand, fontWeight: 600, cursor: 'pointer' }}>보내기 →</span>
        </div>
      )}

      {/* Issues */}
      {isMember ? (
        <>
          <SH>참여 가능한 이슈</SH>
          <RoomIssueCard title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" repShort="" status="진행 중" comments={28} upvotes={53} noRepYet />
          <RoomIssueCard title="이번 회차의 진짜 전환점은 어디였나" opLine="말보다 침묵의 장면이 핵심" repShort="@닉A 이건 대사보다 연출 의도를..." status="진행 중" comments={36} upvotes={71} />
          <SH>지난 이슈</SH>
          <RoomIssueCard title="지난 회차, 가장 갈린 장면은?" opLine="행동보다 맥락으로 봐주세요" repShort="@닉C 그 장면은 연출 의도가 확실히..." status="종료" comments={22} upvotes={41} />
        </>
      ) : (
        <>
          <SH>대표 이슈</SH>
          <div style={{ margin: '0 16px 8px', padding: 14, border: `1.5px solid ${T.brand}`, borderRadius: T.r.xl, background: T.brandTint2 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.title, marginBottom: 4 }}>이번 회차의 진짜 전환점은 어디였나</div>
            <div style={{ fontSize: 12, color: T.textSub, fontStyle: 'italic', marginBottom: 6 }}>운영자: 말보다 침묵의 장면이 핵심</div>
            <div style={{ fontSize: 12, color: T.body, background: T.brandTint, padding: '6px 10px', borderRadius: T.r.sm }}>
              <span style={{ color: T.brand, fontWeight: 600, fontSize: 11 }}>대표</span> @닉A 이건 대사보다 연출 의도를...
            </div>
            <MetaRow comments={36} upvotes={71} compact />
          </div>
          <SH>최신 이슈</SH>
          <RoomIssueCard title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" repShort="@닉B 이건 호감보다 연출에 가까워..." status="진행 중" comments={28} upvotes={53} />
          <RoomIssueCard title="지난 회차, 가장 갈린 장면은?" opLine="행동보다 맥락으로 봐주세요" repShort="@닉C 그 장면은 연출 의도가 확실히..." status="종료" comments={22} upvotes={41} />
        </>
      )}
    </div>
  );
}

/* Issue Detail */
function IssueDetailScreen({ state }) {
  const canComment = state === "Member/Operator";
  const isSubscriber = state === "Subscriber(구독만)";
  const noRep = state === "대표 댓글 없음";
  const [sort, setSort] = useState("popular");

  return (
    <div>
      {/* Nav */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: T.muted }}>{Icon.back()} 룸으로</span>
        <span style={{ cursor: 'pointer' }}>{Icon.share()}</span>
      </div>

      {/* Room tag */}
      <div style={{ padding: '12px 16px 0' }}>
        <span style={{ padding: '4px 10px', background: T.brandTint, color: T.brand, borderRadius: T.r.sm, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>나는 솔로 해석 룸</span>
      </div>

      {/* Issue content */}
      <div style={{ padding: '12px 16px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: T.title, lineHeight: 1.35, marginBottom: 8 }}>이번 데이트 선택, 어떻게 읽히나</div>
        <div style={{ fontSize: 12, color: T.placeholder, marginBottom: 12 }}>2025.03.15</div>
        <div style={{ fontSize: 13, color: T.textSub, fontStyle: 'italic', marginBottom: 12, paddingBottom: 10, borderBottom: `1px solid ${T.subtle}` }}>
          <span style={{ fontWeight: 500, fontStyle: 'normal', color: T.muted }}>운영자: </span>&quot;행동보다 편집 포인트에 주목해주세요&quot;
        </div>
        <div style={{ fontSize: 13, color: T.brand, background: T.brandTint, padding: '10px 14px', borderRadius: T.r.md, marginBottom: 12, fontWeight: 500 }}>질문: 이 선택은 감정보다 전략에 가까웠나?</div>
        <div style={{ fontSize: 14, color: T.body, lineHeight: 1.7, padding: '14px 0', borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
          이번 장면은 표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다...
          <ImgPlaceholder h={100} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: T.r.full, border: `1.5px solid ${T.border}`, fontSize: 13, fontWeight: 600, color: T.textSub, cursor: 'pointer' }}>
              {Icon.star(T.muted, 14)} 업보트 53
            </div>
            <div style={{ padding: '7px 12px', borderRadius: T.r.full, border: `1.5px solid ${T.border}`, fontSize: 12, color: T.muted, cursor: 'pointer' }}>스크랩</div>
            <div style={{ padding: '7px 12px', borderRadius: T.r.full, border: `1.5px solid ${T.border}`, fontSize: 12, color: T.placeholder, cursor: 'pointer' }}>신고</div>
          </div>
          <div style={{ fontSize: 11, color: T.placeholder }}>댓글 28 · 조회 421</div>
        </div>
      </div>

      {/* Representative comment */}
      {!noRep && (
        <div style={{ padding: '0 16px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 8 }}>대표 댓글</div>
          <div style={{ padding: '12px 14px', background: T.brandTint2, borderRadius: T.r.lg, borderLeft: `3px solid ${T.brand}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.brand }}>@닉A</span>
              <Badge text="대표" variant="brand" />
            </div>
            <div style={{ fontSize: 14, color: T.body, lineHeight: 1.6 }}>이 장면은 호감 표현이 아니라 편집 의도가 드러나는 순간이라고 봅니다...</div>
          </div>
        </div>
      )}

      {/* Comments */}
      <div style={{ padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <SH>전체 댓글</SH>
        <div style={{ display: 'flex', gap: 4, fontSize: 12, paddingRight: 0 }}>
          {[{ k: 'popular', l: '인기순' }, { k: 'latest', l: '최신순' }].map(s => (
            <span key={s.k} onClick={() => setSort(s.k)} style={{ padding: '4px 10px', borderRadius: T.r.sm, background: sort === s.k ? T.title : T.subtle, color: sort === s.k ? '#fff' : T.muted, fontWeight: sort === s.k ? 600 : 400, cursor: 'pointer', fontSize: 12 }}>{s.l}</span>
          ))}
        </div>
      </div>

      <Comment nick="@닉C" text="나는 전략보다 감정이라고 봤는데, 편집 타이밍이 확실히 의도적이긴 합니다." upvotes={12} time="2시간 전" replies={[{ nick: "@닉D", text: "동의합니다. 마지막 리액션 컷이 핵심인 것 같아요.", upvotes: 5, time: "1시간 전" }]} />
      <Comment nick="@닉F" text="편집보다는 출연자 본인의 선택이 더 크다고 봅니다." upvotes={8} time="3시간 전" replies={[]} />

      {/* Comment input area */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}`, background: T.subtle }}>
        {canComment ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, height: 40, border: `1px solid ${T.border}`, borderRadius: T.r.lg, padding: '0 12px', display: 'flex', alignItems: 'center', fontSize: 13, color: T.placeholder, background: '#fff' }}>댓글을 입력하세요...</div>
            <div style={{ width: 40, height: 40, borderRadius: T.r.lg, border: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer', flexShrink: 0 }}>{Icon.camera()}</div>
            <PrimaryBtn small style={{ flexShrink: 0, padding: '10px 14px' }}>작성</PrimaryBtn>
          </div>
        ) : isSubscriber ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>댓글은 멤버만 작성할 수 있습니다</div>
            <PrimaryBtn small>댓글 멤버 신청하기</PrimaryBtn>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>댓글은 멤버만 작성할 수 있습니다</div>
            <PrimaryBtn small>이 룸 구독하러 가기</PrimaryBtn>
          </div>
        )}
      </div>
    </div>
  );
}

/* Profile */
function ProfileScreen({ state }) {
  const isMe = state === "내 프로필";
  return (
    <div>
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${T.border}` }}>
        <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 14, color: T.muted }}>{Icon.back()} 뒤로</span>
        {isMe && <span style={{ fontSize: 14, color: T.brand, fontWeight: 600, cursor: 'pointer' }}>편집</span>}
      </div>
      <div style={{ padding: '28px 16px 16px', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.brandTint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: T.brand, fontWeight: 700, margin: '0 auto 12px' }}>{isMe ? "K" : "J"}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.title, marginBottom: 3 }}>{isMe ? "@김해석" : "@정분석"}</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>{isMe ? "콘텐츠를 맥락으로 읽는 사람" : "데이터로 세상을 봅니다"}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          {[
            { label: "작성 댓글", val: isMe ? 47 : 23 },
            { label: "받은 좋아요", val: isMe ? 312 : 89 },
            { label: "대표 선정", val: isMe ? 8 : 3 },
            { label: "구독 룸", val: isMe ? 3 : 5 },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, padding: '12px 4px', background: T.subtle, borderRadius: T.r.lg, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.title }}>{s.val}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <SH>대표로 선정된 댓글</SH>
      {[
        { text: "도입보다 과금 구조가 더 관건이라는 이야기가...", issue: "FSD 한국 도입", room: "테슬라 한국 실사용자 룸" },
        { text: "이 장면은 호감보다 편집 의도가 드러나는 순간...", issue: "이번 선택, 진짜 의도?", room: "나는 솔로 해석 룸" },
      ].map((c, i) => (
        <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${T.subtle}` }}>
          <div style={{ fontSize: 13, color: T.body, lineHeight: 1.5, marginBottom: 4 }}>{c.text}</div>
          <div style={{ fontSize: 11, color: T.placeholder }}>→ {c.issue} · {c.room}</div>
        </div>
      ))}

      <SH>최근 댓글</SH>
      {[
        { text: "편집보다 출연자 의도가 더 크다고 봅니다.", issue: "이번 데이트 선택", time: "2시간 전" },
        { text: "3장 후반부 논증 구조가 좀 약한 것 같습니다.", issue: "이번 장의 핵심 질문", time: "1일 전" },
      ].map((c, i) => (
        <div key={i} style={{ padding: '12px 16px', borderBottom: `1px solid ${T.subtle}` }}>
          <div style={{ fontSize: 13, color: T.body, marginBottom: 3 }}>{c.text}</div>
          <div style={{ fontSize: 11, color: T.placeholder }}>→ {c.issue} · {c.time}</div>
        </div>
      ))}

      <SH>참여 중인 룸</SH>
      {["나는 솔로 해석 룸", "테슬라 한국 실사용자 룸"].map((r, i) => (
        <div key={i} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.subtle}` }}>
          <RoomThumb size={28} hue={i} />
          <span style={{ fontSize: 14, color: T.title }}>{r}</span>
        </div>
      ))}
    </div>
  );
}

/* MyPage Helpers */
function ProfileSection() {
  return (
    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${T.border}` }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: T.brandTint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: T.brand, fontWeight: 600 }}>K</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: T.title }}>@김해석</div>
        <div style={{ fontSize: 12, color: T.muted }}>콘텐츠를 맥락으로 읽는 사람</div>
      </div>
      <span style={{ fontSize: 12, color: T.brand, fontWeight: 600, cursor: 'pointer' }}>프로필 →</span>
    </div>
  );
}

function RI({ name, hue, action }) {
  return (
    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.subtle}` }}>
      <RoomThumb size={32} hue={hue} />
      <span style={{ fontSize: 14, color: T.title, flex: 1 }}>{name}</span>
      {action && <span style={{ padding: '5px 12px', background: T.subtle, borderRadius: T.r.sm, fontSize: 12, color: T.textSub, fontWeight: 600 }}>{action}</span>}
    </div>
  );
}

function SubTabs({ tabs, active, onSelect }) {
  return (
    <div style={{ display: 'flex', gap: 6, padding: '12px 16px' }}>
      {tabs.map(s => (
        <span key={s.k} onClick={() => onSelect(s.k)} style={{ padding: '6px 14px', borderRadius: T.r.full, background: active === s.k ? T.title : T.subtle, color: active === s.k ? '#fff' : T.muted, fontSize: 12, fontWeight: active === s.k ? 600 : 400, cursor: 'pointer' }}>{s.l}</span>
      ))}
    </div>
  );
}

function MI({ title, room }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.subtle}` }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.title, marginBottom: 3 }}>{title}</div>
      <div style={{ fontSize: 11, color: T.muted }}>{room}</div>
    </div>
  );
}

function MC({ nick, text, issue }) {
  return (
    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.subtle}` }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 3 }}>{nick}</div>
      <div style={{ fontSize: 13, color: T.body, marginBottom: 3 }}>{text}</div>
      <div style={{ fontSize: 11, color: T.placeholder }}>→ {issue}</div>
    </div>
  );
}

function MyPageRoomTab() {
  return (
    <>
      <SH>구독 중</SH>
      <RI name="나는 솔로 해석 룸" hue={0} />
      <RI name="리벨북스 비문학 스터디" hue={1} />
      <SH>참여 중</SH>
      <RI name="흑백요리사 해석 룸" hue={3} />
      <SH>운영 중</SH>
      <RI name="테슬라 한국 실사용자 룸" hue={2} action="운영하기" />
    </>
  );
}

function MyPageIssueTab() {
  const [s, setS] = useState("scrap");
  return (
    <>
      <SubTabs tabs={[{ k: 'scrap', l: '스크랩' }, { k: 'written', l: '작성' }, { k: 'upvoted', l: '업보트' }]} active={s} onSelect={setS} />
      {s === "scrap" && <><MI title="이번 데이트 선택" room="나는 솔로 해석 룸" /><MI title="올해 테슬라 가격 전략" room="테슬라 한국 실사용자 룸" /></>}
      {s === "written" && <MI title="FSD 한국 도입" room="테슬라 한국 실사용자 룸" />}
      {s === "upvoted" && <><MI title="이번 장의 핵심 질문" room="리벨북스 비문학 스터디" /><MI title="이번 선택, 진짜 의도?" room="나는 솔로 해석 룸" /></>}
    </>
  );
}

function MyPageCommentTab() {
  const [s, setS] = useState("scrap");
  return (
    <>
      <SubTabs tabs={[{ k: 'scrap', l: '스크랩' }, { k: 'written', l: '작성' }, { k: 'upvoted', l: '업보트' }]} active={s} onSelect={setS} />
      {s === "scrap" && <MC nick="@닉A" text="도입보다 과금 구조가 더 관건..." issue="FSD 한국 도입" />}
      {s === "written" && <><MC nick="나" text="편집보다 출연자 의도가 더 크다고 봅니다." issue="이번 데이트 선택" /><MC nick="나" text="3장 후반부 논증 구조가 좀 약합니다." issue="이번 장의 핵심 질문" /></>}
      {s === "upvoted" && <MC nick="@닉B" text="호감보다 편집 의도가 드러나는 순간..." issue="이번 선택, 진짜 의도?" />}
    </>
  );
}

/* MyPage */
function MyPageScreen({ state }) {
  if (state === "구독 없음(Empty)") {
    return (
      <div>
        <div style={{ padding: '14px 16px 8px', fontSize: 20, fontWeight: 700, color: T.title }}>마이페이지</div>
        <ProfileSection />
        <div style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: T.muted }}>아직 활동 내역이 없습니다</div>
        </div>
      </div>
    );
  }
  const at = state === "이슈 탭" ? 1 : state === "댓글 탭" ? 2 : 0;
  return (
    <div>
      <div style={{ padding: '14px 16px 8px', fontSize: 20, fontWeight: 700, color: T.title }}>마이페이지</div>
      <ProfileSection />
      {/* Underline tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}` }}>
        {["룸", "이슈", "댓글"].map((t, i) => (
          <div key={t} style={{
            flex: 1, padding: '12px 0', textAlign: 'center', fontSize: 14,
            fontWeight: at === i ? 600 : 400,
            color: at === i ? T.title : T.muted,
            borderBottom: at === i ? `2px solid ${T.brand}` : '2px solid transparent',
            cursor: 'pointer',
          }}>{t}</div>
        ))}
      </div>
      {at === 0 && <MyPageRoomTab />}
      {at === 1 && <MyPageIssueTab />}
      {at === 2 && <MyPageCommentTab />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Operator Screens
   ───────────────────────────────────────────── */

function RoomSettingsScreen() {
  return (
    <div>
      <div style={{ padding: '14px 16px', fontSize: 18, fontWeight: 700, color: T.title, borderBottom: `1px solid ${T.border}` }}>운영자 › 룸 설정</div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Image */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 8 }}>룸 대표 이미지</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <RoomThumb size={64} hue={2} initial="T" />
            <OutlineBtn style={{ padding: '8px 16px', fontSize: 13 }}>이미지 변경</OutlineBtn>
          </div>
        </div>

        {/* Fields */}
        {[
          { label: "룸 이름", val: "테슬라 한국 실사용자 룸" },
          { label: "한 줄 설명", val: "루머보다 해석, 드립보다 이유" },
          { label: "상세 설명", val: "실사용/가격/정책 관점의 반응을 모읍니다", multi: true },
        ].map(f => (
          <div key={f.label}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 6 }}>{f.label}</div>
            <div style={{ padding: f.multi ? '12px 14px' : '11px 14px', border: `1px solid ${T.border}`, borderRadius: T.r.lg, fontSize: 14, color: T.title, background: '#fff', minHeight: f.multi ? 64 : 'auto' }}>{f.val}</div>
          </div>
        ))}

        {/* Member toggle */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 8 }}>멤버 신청</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {["받지 않음", "받는 중"].map((t, i) => (
              <div key={t} style={{ flex: 1, padding: '11px 0', border: i === 1 ? `2px solid ${T.teal}` : `1px solid ${T.border}`, borderRadius: T.r.lg, textAlign: 'center', fontSize: 13, fontWeight: 600, color: i === 1 ? T.teal : T.muted, background: i === 1 ? T.tealBg : '#fff', cursor: 'pointer' }}>{t}</div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: T.placeholder, marginTop: 6 }}>&quot;받는 중&quot; 선택 시 룸 상세에 멤버 신청 버튼이 노출됩니다</div>
        </div>

        {/* Visibility */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 8 }}>공개 상태</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {["비공개", "공개"].map((t, i) => (
              <div key={t} style={{ flex: 1, padding: '11px 0', border: i === 1 ? `2px solid ${T.teal}` : `1px solid ${T.border}`, borderRadius: T.r.lg, textAlign: 'center', fontSize: 13, fontWeight: 600, color: i === 1 ? T.teal : T.muted, background: i === 1 ? T.tealBg : '#fff', cursor: 'pointer' }}>{t}</div>
            ))}
          </div>
        </div>

        {/* Members */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 8 }}>멤버 관리</div>
          {["@userA", "@userB"].map(u => (
            <div key={u} style={{ padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.subtle}` }}>
              <span style={{ fontSize: 14, color: T.title }}>{u}</span>
              <span style={{ fontSize: 12, color: '#A32D2D', fontWeight: 500, cursor: 'pointer' }}>제거</span>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '11px 14px', border: `1px dashed ${T.border}`, borderRadius: T.r.lg, fontSize: 13, color: T.muted, textAlign: 'center', cursor: 'pointer' }}>+ 사용자 검색 후 추가</div>
        </div>

        <PrimaryBtn full style={{ marginTop: 4 }}>저장</PrimaryBtn>
      </div>
    </div>
  );
}

function IssuePublishScreen({ state }) {
  const isEdit = state === "이슈 수정";
  return (
    <div>
      <div style={{ padding: '14px 16px', fontSize: 18, fontWeight: 700, color: T.title, borderBottom: `1px solid ${T.border}` }}>운영자 › {isEdit ? "이슈 수정" : "새 이슈 발행"}</div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { label: "제목", val: isEdit ? "FSD 한국 도입, 올해 안 가능할까?" : "", ph: "이슈 제목을 입력하세요" },
          { label: "운영자 한 줄", val: isEdit ? "일정보다 가격/체감이 핵심" : "", ph: "이 이슈를 어떤 관점으로 볼지 한 줄로" },
          { label: "질문 (선택)", val: "", ph: "댓글을 끌어낼 질문" },
          { label: "본문", val: isEdit ? "이번 FSD 도입 논의에서..." : "", ph: "본문을 입력하세요", multi: true },
        ].map(f => (
          <div key={f.label}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 6 }}>{f.label}</div>
            <div style={{ padding: f.multi ? '12px 14px' : '11px 14px', border: `1px solid ${T.border}`, borderRadius: T.r.lg, fontSize: 14, color: f.val ? T.title : T.placeholder, background: '#fff', minHeight: f.multi ? 80 : 'auto' }}>{f.val || f.ph}</div>
          </div>
        ))}

        <div style={{ padding: 24, border: `1px dashed ${T.border}`, borderRadius: T.r.lg, textAlign: 'center', color: T.muted, fontSize: 13, cursor: 'pointer' }}>이미지 / 링크 / 유튜브 첨부</div>

        {/* Status */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 8 }}>이슈 상태</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { l: "초안", active: false, bg: T.amberBg, c: T.amber },
              { l: "진행 중", active: true, bg: T.tealBg, c: T.teal },
              { l: "종료", active: false, bg: '#fff', c: T.muted },
              { l: "숨김", active: false, bg: '#FCEBEB', c: '#A32D2D' },
            ].map((s) => (
              <div key={s.l} style={{ flex: 1, padding: '9px 0', border: s.active ? `2px solid ${s.c}` : `1px solid ${T.border}`, borderRadius: T.r.md, textAlign: 'center', fontSize: 12, fontWeight: 600, color: s.c, background: s.active ? s.bg : '#fff', cursor: 'pointer' }}>{s.l}</div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: T.placeholder, marginTop: 6 }}>초안 = 임시저장(운영자만 보임) · 숨김 = 공개 후 비노출 처리</div>
        </div>

        {/* Checkboxes */}
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, background: T.subtle, borderRadius: T.r.lg }}>
            <div style={{ width: 20, height: 20, border: `2px solid ${T.border}`, borderRadius: T.r.xs }} />
            <span style={{ fontSize: 13, color: T.textSub }}>대표 이슈로 설정</span>
          </div>
          <div style={{ flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, background: '#FCEBEB', borderRadius: T.r.lg }}>
            <div style={{ width: 20, height: 20, border: '2px solid #F09595', borderRadius: T.r.xs, background: '#fff' }} />
            <span style={{ fontSize: 13, color: '#A32D2D' }}>스포일러 포함</span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: T.placeholder, marginTop: -8 }}>스포일러 체크 시 목록에서 본문이 숨겨집니다</div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <PrimaryBtn full style={{ flex: 1 }}>{isEdit ? "수정" : "발행"}</PrimaryBtn>
          {isEdit && <div style={{ padding: '13px 16px', background: '#FCEBEB', color: '#A32D2D', borderRadius: T.r.lg, fontSize: 14, fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}>삭제</div>}
        </div>
      </div>
    </div>
  );
}

function RepCommentScreen() {
  return (
    <div>
      <div style={{ padding: '14px 16px', fontSize: 18, fontWeight: 700, color: T.title, borderBottom: `1px solid ${T.border}` }}>운영자 › 대표 댓글 지정</div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 8 }}>이슈</div>
        <div style={{ padding: '11px 14px', border: `1px solid ${T.border}`, borderRadius: T.r.lg, fontSize: 14, color: T.title, background: '#fff', marginBottom: 16 }}>FSD 한국 도입, 올해 안 가능할까?</div>
      </div>

      <div style={{ padding: '0 16px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginBottom: 8 }}>현재 대표 댓글 (1개)</div>
        <div style={{ padding: '12px 14px', background: T.brandTint2, borderRadius: T.r.lg, borderLeft: `3px solid ${T.brand}`, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.brand, marginBottom: 4 }}>@닉A</div>
            <div style={{ fontSize: 13, color: T.body, lineHeight: 1.5 }}>도입보다 과금 구조가 더 관건이라는 이야기가...</div>
          </div>
          <span style={{ padding: '5px 12px', background: '#FCEBEB', color: '#A32D2D', borderRadius: T.r.sm, fontSize: 11, fontWeight: 600, flexShrink: 0, cursor: 'pointer' }}>해제</span>
        </div>
      </div>

      <SH>전체 댓글</SH>
      {[
        { nick: "@닉B", text: "이번 건은 일정 자체보다 인프라 준비가..." },
        { nick: "@닉C", text: "오히려 OTA 체감이 더 중요한 포인트라고..." },
        { nick: "@닉D", text: "국내 가격 포지셔닝이 결국 핵심일 것..." },
      ].map((c, i) => (
        <div key={i} style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.body, marginBottom: 4 }}>{c.nick}</div>
            <div style={{ fontSize: 13, color: T.body, lineHeight: 1.5 }}>{c.text}</div>
          </div>
          <span style={{ padding: '5px 12px', background: T.brandTint, color: T.brand, borderRadius: T.r.sm, fontSize: 11, fontWeight: 600, flexShrink: 0, marginLeft: 8, cursor: 'pointer' }}>지정</span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Screen Info Panel
   ───────────────────────────────────────────── */
const SCREEN_INFO = {
  feed: { route: "/feed", purpose: "구독 룸들의 최신 이슈를 큰 카드로 소비하는 lean-back reading 피드", data: ["구독 Room 아바타 바", "큰 이슈 카드: 운영자 한 줄 + 본문 3줄 + 첨부 이미지 + 대표 댓글(최대 5줄)", "조회수/댓글수/업보트수"], cta: ["이슈 읽기", "룸 보기(룸명 탭)"], notes: "대표 댓글 지정 이슈만 노출. 첨부 이미지 있는 이슈는 카드에 이미지 표시. 대표 댓글 5줄 제한." },
  issues: { route: "/issues", purpose: "공개 이슈를 빠르게 스캔하는 탐색 목록", data: ["작은 이슈 카드: 제목+운영자 한 줄+대표 댓글 1줄", "조회수/댓글수/업보트수"], cta: ["이슈 읽기", "룸 보기"], notes: "대표 댓글 지정 이슈 우선. 진행 중은 배지 미표시, 종료만 배지." },
  rooms: { route: "/rooms", purpose: "Visitor가 공개 룸을 발견하는 진입 화면", data: ["공개 Room + 대표 이미지", "멤버 모집 중 배지(설정에 따라)", "이슈 수/구독자 수"], cta: ["구독하기", "멤버 신청(모집 중인 룸)"], notes: "Visitor 진입점. 멤버 모집 중인 룸에만 멤버 신청 버튼 노출." },
  room: { route: "/rooms/:slug", purpose: "룸의 결을 느끼고 구독/멤버 신청을 결정하는 페이지", data: ["룸 대표 이미지+정보", "멤버 모집 여부 배지", "대표 이슈", "이슈 목록"], cta: ["구독하기/구독 중", "멤버 신청(모집 중)", "멤버 탈퇴(Member)", "운영하기(Op)", "건의/제보(Member)"], notes: "멤버 모집 받는 룸: 멤버 신청 CTA 노출. 안 받는 룸: 구독만 가능." },
  issue: { route: "/rooms/:slug/issues/:id", purpose: "이슈 본문 + 대표 댓글(1개) + 전체 댓글 소비", data: ["이슈 전체", "운영자 한 줄", "작성일", "조회수", "대표 댓글(1개)", "전체 댓글+대댓글"], cta: ["업보트", "스크랩", "신고", "댓글 작성(+이미지)", "정렬"], notes: "Visitor→구독 유도, Subscriber→멤버 신청, Member/Op→댓글 입력." },
  mypage: { route: "/me", purpose: "개인 활동과 룸 관계 허브", data: ["프로필(→프로필 페이지)", "룸/이슈/댓글 탭"], cta: ["룸 보기", "운영하기", "프로필 보기"], notes: "프로필 섹션에서 상세 프로필로 이동 가능." },
  profile: { route: "/users/:id", purpose: "개인의 활동과 업적을 보여주는 프로필", data: ["활동 통계", "대표 선정 댓글", "최근 댓글", "참여 룸"], cta: ["프로필 편집(내 프로필)"], notes: "대표 선정 횟수가 핵심 업적." },
  "room-settings": { route: "/operator/rooms/:id/settings", purpose: "운영자가 룸을 관리", data: ["룸 대표 이미지", "룸 이름/설명", "멤버 신청 받기/안받기", "공개 상태", "멤버 목록"], cta: ["이미지 변경", "멤버 신청 토글", "저장"], notes: "멤버 신청 '받는 중' 설정 시 룸 상세에 멤버 신청 버튼 자동 노출." },
  "issue-publish": { route: "/operator/rooms/:id/issues/new", purpose: "이슈 발행/수정", data: ["제목/운영자 한 줄/질문/본문/첨부", "이슈 상태(초안/진행 중/종료/숨김)", "대표 이슈/스포일러"], cta: ["발행", "수정", "삭제"], notes: "상태: 초안(임시저장) / 진행 중(공개) / 종료(댓글 마감) / 숨김(비노출)." },
  "rep-comment": { route: "/operator/issues/:id/comments", purpose: "대표 댓글 1개 지정", data: ["이슈 정보", "전체 댓글", "현재 대표(1개)"], cta: ["지정", "해제"], notes: "1개만 지정 가능." },
};

function InfoPanel({ screenId }) {
  const info = SCREEN_INFO[screenId];
  if (!info) return null;
  return (
    <div style={{ padding: '18px 20px', background: '#fff', borderRadius: T.r.xl, border: `1px solid ${T.border}`, fontSize: 13, color: T.body, lineHeight: 1.65, maxWidth: 380, fontFamily: T.font }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Route</div>
      <div style={{ fontFamily: 'monospace', fontSize: 12, color: T.brand, background: T.brandTint, padding: '5px 10px', borderRadius: T.r.sm, display: 'inline-block', marginBottom: 14 }}>{info.route}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 4 }}>목적</div>
      <div style={{ marginBottom: 14 }}>{info.purpose}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 4 }}>핵심 데이터</div>
      <div style={{ marginBottom: 14 }}>
        {info.data.map((d, i) => <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 3 }}><span style={{ color: T.brand, fontSize: 8, marginTop: 5 }}>●</span> {d}</div>)}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 4 }}>주요 CTA</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
        {info.cta.map((c, i) => <Badge key={i} text={c} variant="brand" />)}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.muted, marginBottom: 4 }}>비고</div>
      <div style={{ fontSize: 12, color: T.textSub }}>{info.notes}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Viewer
   ───────────────────────────────────────────── */
export default function PIVITViewer() {
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
      case "room-settings": return <RoomSettingsScreen />;
      case "issue-publish": return <IssuePublishScreen state={currentStateName} />;
      case "rep-comment": return <RepCommentScreen />;
      default: return null;
    }
  };

  const groups = [
    { key: "user", label: "사용자 화면" },
    { key: "operator", label: "운영자 화면" },
  ];

  return (
    <div style={{ fontFamily: T.font, maxWidth: 920, margin: '0 auto' }}>
      {/* Controls */}
      <div style={{ marginBottom: 20, display: 'grid', gap: 12 }}>
        {/* Screen picker */}
        <div style={{ padding: '16px 18px', borderRadius: T.r.xl, border: `1px solid ${T.border}`, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.brand, marginBottom: 3 }}>1. 페이지 선택</div>
              <div style={{ fontSize: 13, color: T.muted }}>아래 미리보기를 다른 페이지로 바꿉니다.</div>
            </div>
            <Badge text={`현재: ${meta?.label || activeScreen}`} variant="brand" />
          </div>
          {groups.map((g) => (
            <div key={g.key} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{g.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SCREENS.filter((s) => s.group === g.key).map((s) => (
                  <button key={s.id} onClick={() => handleScreenChange(s.id)} style={{
                    padding: '8px 14px', borderRadius: T.r.md, cursor: 'pointer', fontSize: 13, fontFamily: T.font,
                    border: activeScreen === s.id ? `1.5px solid ${T.brand}` : `1px solid ${T.border}`,
                    background: activeScreen === s.id ? T.brandTint : '#fff',
                    color: activeScreen === s.id ? T.brand : T.textSub,
                    fontWeight: activeScreen === s.id ? 600 : 400,
                  }}>{s.label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* State picker */}
        <div style={{ padding: '16px 18px', borderRadius: T.r.xl, border: `1px solid ${T.border}`, background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.teal, marginBottom: 3 }}>2. 같은 페이지 안 상태 전환</div>
              <div style={{ fontSize: 13, color: T.muted }}>권한·멤버 모집 여부·빈 상태 등을 바꿔 비교합니다.</div>
            </div>
            <Badge text={`현재: ${currentStateName}`} variant="teal" />
          </div>
          <div style={{ fontSize: 12, color: T.textSub, marginBottom: 10 }}>기준: <span style={{ fontWeight: 600, color: T.teal }}>{meta?.label}</span></div>
          {currentStates.length > 1 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {currentStates.map((s, i) => (
                <button key={s} onClick={() => setActiveState(i)} style={{
                  padding: '6px 14px', borderRadius: T.r.full, cursor: 'pointer', fontSize: 12, fontFamily: T.font,
                  border: activeState === i ? `1.5px solid ${T.teal}` : `1px solid ${T.border}`,
                  background: activeState === i ? T.tealBg : '#fff',
                  color: activeState === i ? T.teal : T.textSub,
                  fontWeight: activeState === i ? 600 : 400,
                }}>{s}</button>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: T.placeholder, padding: '10px 14px', borderRadius: T.r.lg, border: `1px dashed ${T.border}`, background: '#fff' }}>추가 상태 없음</div>
          )}
        </div>
      </div>

      {/* Phone + Info */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <Phone activeTab={['feed', 'issues', 'rooms', 'mypage'].includes(activeScreen) ? activeScreen : undefined} onTabChange={handleScreenChange}>
          {renderScreen()}
        </Phone>
        <InfoPanel screenId={activeScreen} />
      </div>
    </div>
  );
}
