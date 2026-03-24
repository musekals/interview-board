'use client';

import { useState } from "react";

/* ═══════════════════════════════════════════════════
   PIVIT — High-Fidelity Production UI
   Design tokens from pivit.design-tokens.json
   ═══════════════════════════════════════════════════ */

const T = {
  brand: '#DE0B55',
  brandHover: '#C40A4B',
  brandDis: 'rgba(222,11,85,0.22)',
  brandTint: 'rgba(222,11,85,0.07)',
  brandTint2: 'rgba(222,11,85,0.04)',
  white: '#FFFFFF',
  subtle: '#F7F7F7',
  subtle2: '#F0F0F0',
  tag: '#E8E8E8',
  title: '#171717',
  body: '#262626',
  sub: '#525252',
  muted: '#737373',
  ph: '#ABABAB',
  inactive: '#999999',
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  divider: '#EBEBEB',
  error: '#E5243B',
  errorBg: '#FEF2F2',
  kakao: '#FEE500',
  kakaoTxt: 'rgba(0,0,0,0.85)',
  teal: '#0D7C5F',
  tealBg: '#ECFDF5',
  tealBorder: '#A7F3D0',
  amber: '#92400E',
  amberBg: '#FFFBEB',
  overlay: 'rgba(0,0,0,0.45)',
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 2px 8px rgba(0,0,0,0.06)',
    lg: '0 4px 16px rgba(0,0,0,0.08)',
    card: '0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03)',
  },
  font: '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,"Segoe UI",sans-serif',
  r: { xs: 4, sm: 6, md: 8, lg: 10, xl: 14, '2xl': 18, full: 999 },
};

/* ─── Screen & State defs ─── */
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

/* ─── Deterministic color from name ─── */
const ROOM_PALETTES = [
  { bg: '#FDF2F8', accent: '#EC4899', text: '#9D174D' },
  { bg: '#EFF6FF', accent: '#3B82F6', text: '#1E40AF' },
  { bg: '#ECFDF5', accent: '#10B981', text: '#065F46' },
  { bg: '#FFF7ED', accent: '#F97316', text: '#9A3412' },
  { bg: '#F5F3FF', accent: '#8B5CF6', text: '#5B21B6' },
  { bg: '#FEF9C3', accent: '#EAB308', text: '#854D0E' },
];
const AVATAR_COLORS = ['#6366F1','#EC4899','#14B8A6','#F59E0B','#8B5CF6','#EF4444','#06B6D4','#84CC16'];
function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); }

/* ─── SVG Icons ─── */
const I = {
  upvote: (c=T.muted,s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M4 10l4-6 4 6" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 10v4" stroke={c} strokeWidth="1.6" strokeLinecap="round"/></svg>,
  chat: (c=T.muted,s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M14 10.67A1.33 1.33 0 0112.67 12H4.67L2 14.67V3.33A1.33 1.33 0 013.33 2h9.34A1.33 1.33 0 0114 3.33v7.34z" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye: (c=T.muted,s=14) => <svg width={s} height={s} viewBox="0 0 16 16" fill="none"><path d="M1 8s2.55-5 7-5 7 5 7 5-2.55 5-7 5-7-5-7-5z" stroke={c} strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke={c} strokeWidth="1.2"/></svg>,
  back: (c=T.sub) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 4L6.5 10l6 6" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  share: (c=T.sub) => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 12v3a2 2 0 002 2h8a2 2 0 002-2v-3M13 6l-3-3-3 3M10 3v9" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  camera: (c=T.muted) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="5" width="14" height="10" rx="2" stroke={c} strokeWidth="1.3"/><circle cx="9" cy="10" r="2.5" stroke={c} strokeWidth="1.3"/><path d="M6 5l1-2h4l1 2" stroke={c} strokeWidth="1.3"/></svg>,
  more: (c=T.muted) => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="4" r="1.2" fill={c}/><circle cx="9" cy="9" r="1.2" fill={c}/><circle cx="9" cy="14" r="1.2" fill={c}/></svg>,
  pen: () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M13.5 2.5l2 2L6 14H4v-2l9.5-9.5z" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  check: (c='#fff') => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l3 3 5-6" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  bookmark: (c=T.muted) => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 2h8a1 1 0 011 1v10l-4.5-3L3 13V3a1 1 0 011-1z" stroke={c} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  flag: (c=T.ph) => <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2.5 1.5v11M2.5 2.5h7l-2 2.5 2 2.5h-7" stroke={c} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};
const TabIcon = {
  home: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 10.5L12 3l9 7.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2v-9.5z" stroke={a?T.brand:T.muted} strokeWidth="1.7" fill={a?T.brandTint:'none'}/><path d="M9 22V13h6v9" stroke={a?T.brand:T.muted} strokeWidth="1.7"/></svg>,
  list: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h12" stroke={a?T.brand:T.muted} strokeWidth="1.7" strokeLinecap="round"/></svg>,
  grid: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="2" stroke={a?T.brand:T.muted} strokeWidth="1.5" fill={a?T.brandTint:'none'}/><rect x="13" y="3" width="8" height="8" rx="2" stroke={a?T.brand:T.muted} strokeWidth="1.5" fill={a?T.brandTint:'none'}/><rect x="3" y="13" width="8" height="8" rx="2" stroke={a?T.brand:T.muted} strokeWidth="1.5" fill={a?T.brandTint:'none'}/><rect x="13" y="13" width="8" height="8" rx="2" stroke={a?T.brand:T.muted} strokeWidth="1.5" fill={a?T.brandTint:'none'}/></svg>,
  user: (a) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={a?T.brand:T.muted} strokeWidth="1.6" fill={a?T.brandTint:'none'}/><path d="M4 21c0-3.87 3.58-7 8-7s8 3.13 8 7" stroke={a?T.brand:T.muted} strokeWidth="1.6" strokeLinecap="round"/></svg>,
};

/* ═══ Primitives ═══ */

/* Avatar — user or room */
function Avatar({ name, size=32, isRoom }) {
  const h = hashStr(name || 'A');
  if (isRoom) {
    const pal = ROOM_PALETTES[h % ROOM_PALETTES.length];
    const initial = (name || '?')[0];
    return (
      <div style={{ width: size, height: size, borderRadius: size > 40 ? T.r.xl : T.r.lg, background: pal.bg, border: `1px solid ${pal.accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {/* Decorative inner shape */}
        <div style={{ position:'absolute', bottom: -size*0.15, right: -size*0.15, width: size*0.6, height: size*0.6, borderRadius: '50%', background: `${pal.accent}15` }}/>
        <span style={{ fontSize: size*0.4, fontWeight: 700, color: pal.text, position:'relative', zIndex:1, letterSpacing:'-0.03em' }}>{initial}</span>
      </div>
    );
  }
  const col = AVATAR_COLORS[h % AVATAR_COLORS.length];
  const initial = (name || '?').replace('@','')[0].toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `${col}18`, border: `1.5px solid ${col}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size*0.4, fontWeight: 600, color: col }}>{initial}</span>
    </div>
  );
}

/* Badge */
function Badge({ text, variant='default' }) {
  const map = {
    default: { bg: T.tag, c: T.sub, b: 'transparent' },
    brand: { bg: T.brandTint, c: T.brand, b: 'transparent' },
    brandSolid: { bg: T.brand, c: '#fff', b: 'transparent' },
    teal: { bg: T.tealBg, c: T.teal, b: T.tealBorder },
    amber: { bg: T.amberBg, c: T.amber, b: 'transparent' },
    error: { bg: T.errorBg, c: T.error, b: 'transparent' },
    muted: { bg: T.subtle2, c: T.muted, b: 'transparent' },
  };
  const s = map[variant] || map.default;
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'3px 8px', borderRadius: T.r.full, fontSize:11, fontWeight:500, background:s.bg, color:s.c, border: s.b !== 'transparent' ? `1px solid ${s.b}` : 'none', lineHeight:1.3, whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{text}</span>;
}

/* Buttons */
function BtnPrimary({ children, full, sm, disabled, style:sx }) {
  return <div style={{ padding: sm?'10px 16px':'13px 20px', background: disabled?T.brandDis:T.brand, color:'#fff', borderRadius:T.r.lg, fontSize:sm?13:15, fontWeight:600, textAlign:'center', cursor:disabled?'default':'pointer', width:full?'100%':'auto', boxSizing:'border-box', letterSpacing:'-0.01em', ...sx }}>{children}</div>;
}
function BtnOutline({ children, color, style:sx }) {
  const c = color||T.brand;
  return <div style={{ padding:'11px 16px', background:'#fff', color:c, border:`1.5px solid ${c}`, borderRadius:T.r.lg, fontSize:13, fontWeight:600, textAlign:'center', cursor:'pointer', boxSizing:'border-box', ...sx }}>{children}</div>;
}
function BtnGhost({ children, style:sx }) {
  return <div style={{ padding:'11px 16px', background:T.subtle, color:T.title, borderRadius:T.r.lg, fontSize:13, fontWeight:600, textAlign:'center', cursor:'pointer', ...sx }}>{children}</div>;
}
function BtnSoft({ children, style:sx }) {
  return <div style={{ padding:'11px 16px', background:T.brandTint, color:T.brand, borderRadius:T.r.lg, fontSize:14, fontWeight:600, textAlign:'center', cursor:'pointer', ...sx }}>{children}</div>;
}

/* Image placeholder — looks like a real cover image */
function CoverImg({ h=180, seed=0 }) {
  const hues = [340,210,170,30,260,190];
  const hue = hues[seed % hues.length];
  return (
    <div style={{ width:'100%', height:h, borderRadius:T.r.lg, overflow:'hidden', position:'relative', background:`hsl(${hue},15%,94%)` }}>
      <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg, hsl(${hue},25%,90%) 0%, hsl(${(hue+40)%360},20%,95%) 50%, hsl(${(hue+80)%360},15%,92%) 100%)` }}/>
      <div style={{ position:'absolute', bottom:'-20%', left:'-10%', width:'60%', height:'60%', borderRadius:'50%', background:`hsl(${hue},30%,86%)`, opacity:0.6 }}/>
      <div style={{ position:'absolute', top:'-10%', right:'-5%', width:'40%', height:'50%', borderRadius:'50%', background:`hsl(${(hue+60)%360},20%,88%)`, opacity:0.5 }}/>
    </div>
  );
}

/* Meta info row */
function Meta({ up, cmt, view, style:sx }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:12, color:T.muted, marginTop:8, ...sx }}>
      <span style={{ display:'flex', alignItems:'center', gap:3 }}>{I.upvote(T.muted,13)} {up}</span>
      <span style={{ display:'flex', alignItems:'center', gap:3 }}>{I.chat(T.muted,13)} {cmt}</span>
      {view!==undefined && <span style={{ display:'flex', alignItems:'center', gap:3 }}>{I.eye(T.muted,13)} {view}</span>}
    </div>
  );
}

/* Status badge */
function StatusBadge({ s }) {
  if (s==="진행 중") return null;
  if (s==="종료") return <Badge text="종료" variant="muted" />;
  return null;
}

/* Section header */
function SH({ children, right }) {
  return <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px 8px', background:T.subtle }}>
    <span style={{ fontSize:13, fontWeight:600, color:T.muted, letterSpacing:'-0.01em' }}>{children}</span>
    {right}
  </div>;
}

/* Divider */
function Div({ thick }) {
  return <div style={{ height: thick?6:1, background: thick?T.subtle2:T.divider }} />;
}

/* ═══ Phone Frame ═══ */
function Phone({ children, tab, onTab }) {
  const tabs = [
    { id:'feed', icon:TabIcon.home, label:'피드' },
    { id:'issues', icon:TabIcon.list, label:'이슈' },
    { id:'rooms', icon:TabIcon.grid, label:'룸' },
    { id:'mypage', icon:TabIcon.user, label:'마이' },
  ];
  return (
    <div style={{ width:375, minHeight:720, background:'#fff', borderRadius:40, overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)', flexShrink:0, fontFamily:T.font }}>
      {/* Notch bar */}
      <div style={{ height:48, background:'#fff', display:'flex', alignItems:'flex-end', justifyContent:'center', paddingBottom:6, flexShrink:0 }}>
        <div style={{ width:126, height:5, background:'#222', borderRadius:3, opacity:0.15 }} />
      </div>
      {/* Content */}
      <div style={{ flex:1, overflow:'auto' }}>{children}</div>
      {/* Tab bar */}
      <div style={{ height:54, background:'#fff', borderTop:`1px solid ${T.divider}`, display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 4px', flexShrink:0 }}>
        {tabs.map(t => {
          const a = tab===t.id;
          return (
            <div key={t.id} onClick={()=>onTab?.(t.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, cursor:'pointer', padding:'6px 14px', borderRadius:T.r.lg, background:a?T.brandTint:'transparent', transition:'background 0.15s' }}>
              {t.icon(a)}
              <span style={{ fontSize:10, color:a?T.brand:T.muted, fontWeight:a?600:400, letterSpacing:'-0.02em' }}>{t.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ Card Components ═══ */

/* Big Issue Card — Feed */
function BigIssueCard({ room, title, opLine, body, repNick, repComment, status, cmt, up, view, hasImg, idx=0 }) {
  return (
    <div style={{ padding:'0 16px' }}>
      <div style={{ padding:'16px 0', borderBottom: 'none' }}>
        {/* Room link */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, cursor:'pointer' }}>
          <Avatar name={room} size={22} isRoom />
          <span style={{ fontSize:12, fontWeight:500, color:T.sub }}>{room}</span>
          <span style={{ fontSize:11, color:T.ph }}>·</span>
          <span style={{ fontSize:11, color:T.ph }}>3시간 전</span>
          <StatusBadge s={status} />
        </div>
        {/* Title */}
        <div style={{ fontSize:17, fontWeight:700, color:T.title, lineHeight:1.45, marginBottom:6, letterSpacing:'-0.02em' }}>{title}</div>
        {/* Op line */}
        {opLine && (
          <div style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom:10, padding:'8px 12px', background:T.subtle, borderRadius:T.r.md }}>
            <span style={{ fontSize:12, fontWeight:500, color:T.muted, flexShrink:0 }}>운영자</span>
            <span style={{ fontSize:13, color:T.sub, lineHeight:1.45 }}>{opLine}</span>
          </div>
        )}
        {/* Body */}
        <div style={{ fontSize:14, color:T.body, lineHeight:1.65, marginBottom:hasImg?8:0, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden', letterSpacing:'-0.01em' }}>{body}</div>
        {hasImg && <CoverImg h={160} seed={idx} />}
        {/* Rep comment */}
        {repComment && (
          <div style={{ marginTop:12, padding:'12px 14px', background:T.brandTint2, borderRadius:T.r.lg, borderLeft:`3px solid ${T.brand}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <Avatar name={repNick} size={20} />
              <span style={{ fontSize:12, fontWeight:600, color:T.brand }}>{repNick}</span>
              <Badge text="대표 댓글" variant="brand" />
            </div>
            <div style={{ fontSize:13, color:T.body, lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{repComment}</div>
          </div>
        )}
        <Meta up={up} cmt={cmt} view={view} />
      </div>
      <Div thick />
    </div>
  );
}

/* Compact Issue Card */
function CompactCard({ room, title, opLine, repShort, status, cmt, up, view, isSpoiler }) {
  return (
    <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.divider}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
        <Avatar name={room} size={16} isRoom />
        <span style={{ fontSize:11, fontWeight:500, color:T.sub }}>{room}</span>
      </div>
      <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:4 }}>
        <span style={{ fontSize:15, fontWeight:600, color:T.title, lineHeight:1.4, flex:1, letterSpacing:'-0.02em' }}>{title}</span>
        {isSpoiler && <Badge text="스포" variant="error" />}
        <StatusBadge s={status} />
      </div>
      {isSpoiler ? (
        <div style={{ fontSize:12, color:T.ph, padding:'6px 10px', background:T.subtle, borderRadius:T.r.sm, marginTop:4 }}>스포일러 포함 · 탭하여 보기</div>
      ) : (
        <>
          {opLine && <div style={{ fontSize:12, color:T.muted, marginBottom:3 }}>운영자: {opLine}</div>}
          {repShort && (
            <div style={{ fontSize:12, color:T.sub, display:'flex', alignItems:'center', gap:5, marginTop:4, padding:'6px 10px', background:T.brandTint2, borderRadius:T.r.sm, borderLeft:`2px solid ${T.brand}` }}>
              <span style={{ fontWeight:600, color:T.brand, fontSize:11 }}>대표</span>
              <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{repShort}</span>
            </div>
          )}
        </>
      )}
      <Meta up={up} cmt={cmt} view={view} style={{ marginTop:6 }} />
    </div>
  );
}

/* Room Issue Card */
function RoomIssueCard({ title, opLine, repShort, status, cmt, up, noRep }) {
  return (
    <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.divider}` }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        {noRep && <div style={{ width:7, height:7, borderRadius:'50%', background:T.brand, flexShrink:0, boxShadow:`0 0 0 3px ${T.brandTint}` }}/>}
        <span style={{ fontSize:15, fontWeight:600, color:T.title, lineHeight:1.4, flex:1, letterSpacing:'-0.02em' }}>{title}</span>
        <StatusBadge s={status} />
      </div>
      {opLine && <div style={{ fontSize:12, color:T.muted, marginBottom:4 }}>운영자: {opLine}</div>}
      {repShort ? (
        <div style={{ fontSize:12, color:T.sub, display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:T.brandTint2, borderRadius:T.r.sm, borderLeft:`2px solid ${T.brand}` }}>
          <span style={{ fontWeight:600, color:T.brand, fontSize:11 }}>대표</span>{repShort}
        </div>
      ) : (
        <div style={{ fontSize:12, color:T.ph, fontStyle:'italic' }}>아직 대표 댓글이 없습니다</div>
      )}
      <Meta up={up} cmt={cmt} style={{ marginTop:6 }} />
    </div>
  );
}

/* Comment */
function CommentItem({ nick, text, up, time, replies, isRep }) {
  return (
    <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.divider}` }}>
      <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
        <Avatar name={nick} size={28} />
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:13, fontWeight:600, color:T.title }}>{nick}</span>
              {isRep && <Badge text="대표" variant="brand" />}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:11, color:T.ph }}>{time}</span>
              <span style={{ cursor:'pointer' }}>{I.more(T.ph)}</span>
            </div>
          </div>
          <div style={{ fontSize:14, color:T.body, lineHeight:1.6, letterSpacing:'-0.01em' }}>{text}</div>
          <div style={{ marginTop:8, display:'flex', gap:14, fontSize:12, color:T.muted }}>
            <span style={{ display:'flex', alignItems:'center', gap:3, cursor:'pointer' }}>{I.upvote(T.muted,13)} {up}</span>
            <span style={{ cursor:'pointer' }}>답글</span>
            <span style={{ display:'flex', alignItems:'center', gap:3, cursor:'pointer' }}>{I.bookmark(T.muted)} 스크랩</span>
          </div>
        </div>
      </div>
      {replies?.length > 0 && (
        <div style={{ marginTop:12, marginLeft:38, paddingLeft:14, borderLeft:`2px solid ${T.divider}` }}>
          {replies.map((r,i) => (
            <div key={i} style={{ paddingBottom:10, marginBottom:i<replies.length-1?10:0, borderBottom:i<replies.length-1?`1px solid ${T.borderLight}`:'none' }}>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                <Avatar name={r.nick} size={22} />
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:T.sub }}>{r.nick}</span>
                    <span style={{ fontSize:11, color:T.ph }}>{r.time}</span>
                  </div>
                  <div style={{ fontSize:13, color:T.sub, lineHeight:1.5 }}>{r.text}</div>
                  <div style={{ marginTop:4, display:'flex', gap:12, fontSize:11, color:T.ph }}>
                    <span style={{ display:'flex', alignItems:'center', gap:3, cursor:'pointer' }}>{I.upvote(T.ph,12)} {r.up}</span>
                    <span style={{ cursor:'pointer' }}>답글</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══ SCREENS ═══ */

/* Subscribed rooms bar */
function SubBar() {
  const rooms = [
    { name:"테슬라 한국 실사용자 룸" },
    { name:"나는 솔로 해석 룸" },
    { name:"리벨북스 비문학 스터디" },
  ];
  return (
    <div style={{ padding:'10px 16px 12px', borderBottom:`1px solid ${T.divider}`, display:'flex', alignItems:'center', gap:14 }}>
      {rooms.map((r,i) => (
        <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, cursor:'pointer' }}>
          <div style={{ padding:2, borderRadius:T.r.xl, border: i===0 ? `2px solid ${T.brand}` : '2px solid transparent' }}>
            <Avatar name={r.name} size={40} isRoom />
          </div>
          <span style={{ fontSize:10, color:i===0?T.title:T.muted, fontWeight:i===0?600:400, maxWidth:48, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.name.split(' ')[0]}</span>
        </div>
      ))}
      <div style={{ marginLeft:'auto', fontSize:11, color:T.ph }}>3개 구독 중</div>
    </div>
  );
}

/* FEED */
function FeedScreen({ state }) {
  if (state.includes("Empty")) return (
    <div style={{ padding:'100px 32px 60px', textAlign:'center' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:T.subtle, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke={T.ph} strokeWidth="1.5"/><path d="M8 10h8M8 14h5" stroke={T.ph} strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <div style={{ fontSize:17, fontWeight:600, color:T.title, marginBottom:6, letterSpacing:'-0.02em' }}>아직 구독한 룸이 없습니다</div>
      <div style={{ fontSize:14, color:T.muted, marginBottom:24, lineHeight:1.6 }}>관심 있는 룸을 구독하면<br/>이슈와 반응이 여기에 모입니다</div>
      <BtnPrimary>룸 둘러보기</BtnPrimary>
    </div>
  );
  return (
    <div>
      <div style={{ padding:'14px 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:22, fontWeight:700, color:T.title, letterSpacing:'-0.03em' }}>내 피드</span>
      </div>
      <SubBar />
      <BigIssueCard idx={0} room="테슬라 한국 실사용자 룸" title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격/체감이 핵심이라 봅니다" body="이번 FSD 도입 논의에서 가장 핵심적인 부분은 일정 자체가 아니라 가격 구조와 실제 체감 성능입니다. 특히 한국 도로 환경에서의 적용 가능성과 OTA 업데이트 체감 품질을 중심으로 봐야 합니다." repNick="@닉A" repComment="도입보다 과금 구조가 더 관건이라는 이야기가 많은데, 실제로 한국 시장에서 FSD 월정액 모델이 성립하려면 OTA 체감 품질이 먼저 올라와야 합니다." status="진행 중" cmt={24} up={47} view={312} hasImg />
      <BigIssueCard idx={1} room="나는 솔로 해석 룸" title="이번 선택, 진짜 의도였을까?" opLine="행동보다 편집 포인트에 주목해주세요" body="이번 장면은 표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다. 두 출연자의 반응 컷을 교차 배치한 연출이 인상적입니다." repNick="@닉B" repComment="이번 장면은 호감 표현이 아니라 편집 의도가 드러나는 순간이라고 봅니다. 시선 처리와 카메라 배치를 보면, 제작진이 '이 사람은 전략적이다'라는 프레임을 씌우고 있어요." status="진행 중" cmt={31} up={62} view={487} hasImg />
      <BigIssueCard idx={2} room="리벨북스 비문학 스터디" title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 집중합시다" body="저자가 3장에서 제기하는 문제의식은 결론 부분보다 오히려 초반의 질문 자체에 더 큰 무게가 있습니다." repNick="@닉E" repComment="오히려 이 대목이 저자의 핵심 논점입니다. 결론에서 말하는 것보다 3장 초반에 던진 질문의 구조가 이 책 전체를 관통하고 있습니다." status="종료" cmt={18} up={35} view={198} />
    </div>
  );
}

/* ISSUE LIST */
function IssueListScreen({ state }) {
  if (state.includes("Empty")) return (
    <div style={{ padding:'100px 32px', textAlign:'center' }}>
      <div style={{ width:64, height:64, borderRadius:'50%', background:T.subtle, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h12" stroke={T.ph} strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <div style={{ fontSize:17, fontWeight:600, color:T.title, marginBottom:6 }}>아직 공개된 이슈가 없습니다</div>
      <div style={{ fontSize:13, color:T.muted }}>룸에서 이슈가 발행되면 여기에 표시됩니다</div>
    </div>
  );
  const sp = state==="스포일러 포함 이슈";
  return (
    <div>
      <div style={{ padding:'14px 16px 4px' }}><span style={{ fontSize:22, fontWeight:700, color:T.title, letterSpacing:'-0.03em' }}>최신 이슈</span></div>
      <div style={{ padding:'2px 16px 10px', fontSize:12, color:T.ph }}>대표 댓글이 지정된 이슈를 우선 노출합니다</div>
      <CompactCard room="나는 솔로 해석 룸" title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" repShort="@닉D 이건 호감보다 계산에 가까워 보입니다" status="진행 중" cmt={28} up={53} view={421} />
      {sp && <CompactCard room="나는 솔로 해석 룸" title="최종 선택 결과 분석" status="진행 중" cmt={45} up={89} view={670} isSpoiler />}
      <CompactCard room="리벨북스 비문학 스터디" title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 주목" repShort="@닉E 오히려 이 대목이 더 중요합니다" status="종료" cmt={18} up={35} view={198} />
      <CompactCard room="테슬라 한국 실사용자 룸" title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격/체감이 핵심" repShort="@닉A 도입보다 과금 구조가 관건" status="진행 중" cmt={24} up={47} view={312} />
    </div>
  );
}

/* ROOM LIST */
function RoomListScreen({ state }) {
  const rooms = [
    { name:"나는 솔로 해석 룸", desc:"감정보다 맥락과 편집으로 봅니다", recruit:false, issues:12, subs:84 },
    { name:"테슬라 한국 실사용자 룸", desc:"루머보다 해석, 드립보다 이유", recruit:true, issues:18, subs:156 },
    { name:"리벨북스 비문학 스터디", desc:"저자의 질문을 함께 읽습니다", recruit:false, issues:8, subs:47 },
  ];
  const isSub = state==="Subscriber";
  return (
    <div>
      <div style={{ padding:'14px 16px 4px' }}><span style={{ fontSize:22, fontWeight:700, color:T.title, letterSpacing:'-0.03em' }}>공개 룸</span></div>
      <div style={{ padding:'2px 16px 14px', fontSize:13, color:T.muted, lineHeight:1.5 }}>결 맞는 룸을 구독하고, 이슈와 반응을 내 피드로 모아보세요</div>
      {rooms.map((r,i) => (
        <div key={i} style={{ padding:'16px', borderBottom:`1px solid ${T.divider}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
            <Avatar name={r.name} size={52} isRoom />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:16, fontWeight:600, color:T.title, marginBottom:2, letterSpacing:'-0.02em' }}>{r.name}</div>
              <div style={{ fontSize:13, color:T.muted }}>{r.desc}</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            {r.recruit && <Badge text="멤버 모집 중" variant="teal" />}
            <span style={{ fontSize:12, color:T.ph }}>이슈 {r.issues}개 · 구독자 {r.subs}명</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {isSub ? (
              <BtnSoft style={{ flex:1 }}>구독 중 ✓</BtnSoft>
            ) : (
              <BtnPrimary full sm style={{ flex:1 }}>구독하기</BtnPrimary>
            )}
            {r.recruit && <BtnOutline color={T.teal}>멤버 신청</BtnOutline>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ROOM DETAIL */
function RoomScreen({ state }) {
  const [accept, role] = state.split("-");
  const recruit = accept==="멤버모집";
  const isOp = role==="Operator";
  const isMem = role==="Member";
  return (
    <div>
      <div style={{ padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:`1px solid ${T.divider}` }}>
        <span style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:2, fontSize:14, color:T.sub }}>{I.back()} 뒤로</span>
        <span style={{ cursor:'pointer' }}>{I.share()}</span>
      </div>
      {/* Cover */}
      <div style={{ padding:'0 16px', marginTop:12 }}><CoverImg h={120} seed={1} /></div>
      {/* Info */}
      <div style={{ padding:'14px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:10 }}>
          <Avatar name="나는 솔로 해석 룸" size={56} isRoom />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:700, color:T.title, marginBottom:3, letterSpacing:'-0.02em' }}>나는 솔로 해석 룸</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {recruit && <Badge text="멤버 모집 중" variant="teal" />}
              <span style={{ fontSize:12, color:T.ph }}>구독자 84명</span>
            </div>
          </div>
        </div>
        <div style={{ fontSize:14, color:T.sub, marginBottom:12, lineHeight:1.5 }}>감정보다 맥락과 편집으로 봅니다</div>
        {isMem ? (
          <div style={{ fontSize:12, color:T.ph, padding:'8px 0', cursor:'pointer' }}>▸ 룸 소개 보기</div>
        ) : (
          <div style={{ fontSize:13, color:T.body, background:T.subtle, padding:'14px 16px', borderRadius:T.r.lg, lineHeight:1.65, marginBottom:14, whiteSpace:'pre-line' }}>
            <div style={{ fontWeight:600, fontSize:12, color:T.muted, marginBottom:8 }}>이 방은 이렇게 봅니다</div>
            {"• 장면의 의도와 편집 포인트를 같이 봅니다\n• 한 줄 반응보다 이유 있는 댓글을 중시합니다"}
          </div>
        )}
        {/* CTA */}
        <div style={{ display:'flex', gap:8 }}>
          {role==="Visitor" ? (
            <BtnPrimary full style={{ flex:1 }}>구독하기</BtnPrimary>
          ) : (
            <BtnSoft style={{ flex:1 }}>구독 중 ✓</BtnSoft>
          )}
          {recruit && !isMem && !isOp && <BtnOutline color={T.teal}>멤버 신청</BtnOutline>}
          {recruit && isMem && <div style={{ padding:'11px 14px', border:`1px solid ${T.border}`, color:T.muted, borderRadius:T.r.lg, fontSize:13, textAlign:'center', cursor:'pointer' }}>멤버 탈퇴</div>}
          {isOp && <BtnGhost>운영하기</BtnGhost>}
        </div>
      </div>
      {isMem && (
        <div style={{ margin:'0 16px 12px', padding:'12px 14px', background:T.subtle, borderRadius:T.r.lg, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:13, color:T.sub }}>운영자에게 건의/제보</span>
          <span style={{ fontSize:13, color:T.brand, fontWeight:600, cursor:'pointer' }}>보내기 →</span>
        </div>
      )}
      {/* Issues */}
      {isMem ? (
        <>
          <SH>참여 가능한 이슈</SH>
          <RoomIssueCard title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" status="진행 중" cmt={28} up={53} noRep />
          <RoomIssueCard title="이번 회차의 진짜 전환점은 어디였나" opLine="말보다 침묵의 장면이 핵심" repShort="@닉A 이건 대사보다 연출 의도를..." status="진행 중" cmt={36} up={71} />
          <SH>지난 이슈</SH>
          <RoomIssueCard title="지난 회차, 가장 갈린 장면은?" opLine="행동보다 맥락으로 봐주세요" repShort="@닉C 그 장면은 연출 의도가 확실히..." status="종료" cmt={22} up={41} />
        </>
      ) : (
        <>
          <SH>대표 이슈</SH>
          <div style={{ margin:'0 16px 10px', padding:'14px 16px', border:`1.5px solid ${T.brand}`, borderRadius:T.r.xl, background:T.brandTint2 }}>
            <div style={{ fontSize:15, fontWeight:600, color:T.title, marginBottom:6, letterSpacing:'-0.02em' }}>이번 회차의 진짜 전환점은 어디였나</div>
            <div style={{ fontSize:12, color:T.sub, marginBottom:8 }}>운영자: 말보다 침묵의 장면이 핵심</div>
            <div style={{ fontSize:12, color:T.body, background:T.brandTint, padding:'8px 12px', borderRadius:T.r.md, display:'flex', alignItems:'center', gap:6 }}>
              <Badge text="대표" variant="brandSolid" />
              <span>@닉A 이건 대사보다 연출 의도를...</span>
            </div>
            <Meta up={71} cmt={36} style={{ marginTop:8 }} />
          </div>
          <SH>최신 이슈</SH>
          <RoomIssueCard title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" repShort="@닉B 이건 호감보다 연출에 가까워..." status="진행 중" cmt={28} up={53} />
          <RoomIssueCard title="지난 회차, 가장 갈린 장면은?" opLine="행동보다 맥락으로 봐주세요" repShort="@닉C 그 장면은 연출 의도가 확실히..." status="종료" cmt={22} up={41} />
        </>
      )}
    </div>
  );
}

/* ISSUE DETAIL */
function IssueDetailScreen({ state }) {
  const canCmt = state==="Member/Operator";
  const isSub = state==="Subscriber(구독만)";
  const noRep = state==="대표 댓글 없음";
  const [sort,setSort] = useState("popular");
  return (
    <div>
      <div style={{ padding:'10px 16px', display:'flex', justifyContent:'space-between', borderBottom:`1px solid ${T.divider}` }}>
        <span style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:2, fontSize:14, color:T.sub }}>{I.back()} 룸으로</span>
        <span style={{ cursor:'pointer' }}>{I.share()}</span>
      </div>
      <div style={{ padding:'12px 16px 0' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 10px', background:T.brandTint, borderRadius:T.r.md, cursor:'pointer', marginBottom:12 }}>
          <Avatar name="나는 솔로 해석 룸" size={16} isRoom />
          <span style={{ fontSize:12, fontWeight:600, color:T.brand }}>나는 솔로 해석 룸</span>
        </div>
      </div>
      <div style={{ padding:'0 16px 16px' }}>
        <div style={{ fontSize:21, fontWeight:700, color:T.title, lineHeight:1.4, marginBottom:8, letterSpacing:'-0.03em' }}>이번 데이트 선택, 어떻게 읽히나</div>
        <div style={{ fontSize:12, color:T.ph, marginBottom:14 }}>2025.03.15 · 조회 421</div>
        {/* Op line */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'10px 14px', background:T.subtle, borderRadius:T.r.lg, marginBottom:12 }}>
          <span style={{ fontSize:12, fontWeight:600, color:T.muted, flexShrink:0, marginTop:1 }}>운영자</span>
          <span style={{ fontSize:13, color:T.sub, lineHeight:1.45 }}>행동보다 편집 포인트에 주목해주세요</span>
        </div>
        {/* Question */}
        <div style={{ fontSize:14, color:T.brand, background:T.brandTint, padding:'12px 16px', borderRadius:T.r.lg, marginBottom:14, fontWeight:500, lineHeight:1.5 }}>질문: 이 선택은 감정보다 전략에 가까웠나?</div>
        {/* Body */}
        <div style={{ fontSize:15, color:T.body, lineHeight:1.7, paddingBottom:14, borderBottom:`1px solid ${T.divider}`, letterSpacing:'-0.01em' }}>이번 장면은 표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다...<div style={{ marginTop:12 }}><CoverImg h={100} seed={3} /></div></div>
        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 0', borderBottom:`1px solid ${T.divider}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 14px', borderRadius:T.r.full, border:`1.5px solid ${T.border}`, fontSize:13, fontWeight:600, color:T.sub, cursor:'pointer', background:'#fff' }}>{I.upvote(T.sub,15)} 53</div>
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'7px 12px', borderRadius:T.r.full, border:`1.5px solid ${T.border}`, fontSize:12, color:T.muted, cursor:'pointer', background:'#fff' }}>{I.bookmark(T.muted)} 스크랩</div>
          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'7px 12px', borderRadius:T.r.full, border:`1.5px solid ${T.border}`, fontSize:12, color:T.ph, cursor:'pointer', background:'#fff' }}>{I.flag()} 신고</div>
          <span style={{ fontSize:11, color:T.ph, marginLeft:'auto' }}>댓글 28</span>
        </div>
      </div>
      {/* Rep comment */}
      {!noRep && (
        <div style={{ padding:'0 16px 14px' }}>
          <div style={{ fontSize:12, fontWeight:600, color:T.muted, marginBottom:10 }}>대표 댓글</div>
          <div style={{ padding:'14px 16px', background:T.brandTint2, borderRadius:T.r.xl, borderLeft:`3px solid ${T.brand}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <Avatar name="@닉A" size={24} />
              <span style={{ fontSize:13, fontWeight:600, color:T.brand }}>@닉A</span>
              <Badge text="대표 댓글" variant="brand" />
            </div>
            <div style={{ fontSize:14, color:T.body, lineHeight:1.65 }}>이 장면은 호감 표현이 아니라 편집 의도가 드러나는 순간이라고 봅니다. 시선 처리와 카메라 배치에서 명확히 드러납니다.</div>
          </div>
        </div>
      )}
      {/* Sort */}
      <div style={{ padding:'0 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <SH>전체 댓글</SH>
        <div style={{ display:'flex', gap:4 }}>
          {[{k:'popular',l:'인기순'},{k:'latest',l:'최신순'}].map(s=>(
            <span key={s.k} onClick={()=>setSort(s.k)} style={{ padding:'5px 12px', borderRadius:T.r.full, background:sort===s.k?T.title:T.subtle, color:sort===s.k?'#fff':T.muted, fontWeight:sort===s.k?600:400, cursor:'pointer', fontSize:12 }}>{s.l}</span>
          ))}
        </div>
      </div>
      <CommentItem nick="@닉C" text="나는 전략보다 감정이라고 봤는데, 편집 타이밍이 확실히 의도적이긴 합니다." up={12} time="2시간 전" replies={[{nick:"@닉D",text:"동의합니다. 마지막 리액션 컷이 핵심인 것 같아요.",up:5,time:"1시간 전"}]} />
      <CommentItem nick="@닉F" text="편집보다는 출연자 본인의 선택이 더 크다고 봅니다." up={8} time="3시간 전" replies={[]} />
      {/* Input */}
      <div style={{ padding:'12px 16px', borderTop:`1px solid ${T.divider}`, background:T.subtle }}>
        {canCmt ? (
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <Avatar name="@김해석" size={28} />
            <div style={{ flex:1, height:40, border:`1px solid ${T.border}`, borderRadius:T.r.lg, padding:'0 14px', display:'flex', alignItems:'center', fontSize:13, color:T.ph, background:'#fff' }}>댓글을 입력하세요...</div>
            <div style={{ width:40, height:40, borderRadius:T.r.lg, border:`1px solid ${T.border}`, display:'flex', alignItems:'center', justifyContent:'center', background:'#fff', cursor:'pointer', flexShrink:0 }}>{I.camera()}</div>
            <BtnPrimary sm style={{ flexShrink:0, padding:'10px 14px' }}>작성</BtnPrimary>
          </div>
        ) : isSub ? (
          <div style={{ textAlign:'center', padding:'8px 0' }}>
            <div style={{ fontSize:13, color:T.muted, marginBottom:10 }}>댓글은 멤버만 작성할 수 있습니다</div>
            <BtnPrimary sm>댓글 멤버 신청하기</BtnPrimary>
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'8px 0' }}>
            <div style={{ fontSize:13, color:T.muted, marginBottom:10 }}>댓글은 멤버만 작성할 수 있습니다</div>
            <BtnPrimary sm>이 룸 구독하러 가기</BtnPrimary>
          </div>
        )}
      </div>
    </div>
  );
}

/* PROFILE */
function ProfileScreen({ state }) {
  const me = state==="내 프로필";
  const name = me ? "@김해석" : "@정분석";
  const bio = me ? "콘텐츠를 맥락으로 읽는 사람" : "데이터로 세상을 봅니다";
  return (
    <div>
      <div style={{ padding:'10px 16px', display:'flex', justifyContent:'space-between', borderBottom:`1px solid ${T.divider}` }}>
        <span style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:2, fontSize:14, color:T.sub }}>{I.back()} 뒤로</span>
        {me && <span style={{ fontSize:14, color:T.brand, fontWeight:600, cursor:'pointer' }}>편집</span>}
      </div>
      <div style={{ padding:'28px 16px 20px', textAlign:'center' }}>
        <div style={{ margin:'0 auto 14px' }}><Avatar name={name} size={80} /></div>
        <div style={{ fontSize:20, fontWeight:700, color:T.title, marginBottom:3, letterSpacing:'-0.02em' }}>{name}</div>
        <div style={{ fontSize:14, color:T.muted, marginBottom:20 }}>{bio}</div>
        <div style={{ display:'flex', gap:8 }}>
          {[{l:"작성 댓글",v:me?47:23},{l:"받은 좋아요",v:me?312:89},{l:"대표 선정",v:me?8:3},{l:"구독 룸",v:me?3:5}].map((s,i)=>(
            <div key={i} style={{ flex:1, padding:'12px 4px', background:T.subtle, borderRadius:T.r.lg }}>
              <div style={{ fontSize:20, fontWeight:700, color:T.title }}>{s.v}</div>
              <div style={{ fontSize:10, color:T.muted, marginTop:3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <SH>대표로 선정된 댓글</SH>
      {[{t:"도입보다 과금 구조가 더 관건이라는 이야기가...",iss:"FSD 한국 도입",rm:"테슬라 한국 실사용자 룸"},{t:"이 장면은 호감보다 편집 의도가 드러나는 순간...",iss:"이번 선택, 진짜 의도?",rm:"나는 솔로 해석 룸"}].map((c,i)=>(
        <div key={i} style={{ padding:'12px 16px', borderBottom:`1px solid ${T.borderLight}`, display:'flex', gap:10 }}>
          <div style={{ width:3, borderRadius:2, background:T.brand, flexShrink:0 }}/>
          <div><div style={{ fontSize:13, color:T.body, lineHeight:1.5, marginBottom:4 }}>{c.t}</div><div style={{ fontSize:11, color:T.ph }}>→ {c.iss} · {c.rm}</div></div>
        </div>
      ))}
      <SH>최근 댓글</SH>
      {[{t:"편집보다 출연자 의도가 더 크다고 봅니다.",iss:"이번 데이트 선택",time:"2시간 전"},{t:"3장 후반부 논증 구조가 좀 약한 것 같습니다.",iss:"이번 장의 핵심 질문",time:"1일 전"}].map((c,i)=>(
        <div key={i} style={{ padding:'12px 16px', borderBottom:`1px solid ${T.borderLight}` }}><div style={{ fontSize:13, color:T.body, marginBottom:3 }}>{c.t}</div><div style={{ fontSize:11, color:T.ph }}>→ {c.iss} · {c.time}</div></div>
      ))}
      <SH>참여 중인 룸</SH>
      {["나는 솔로 해석 룸","테슬라 한국 실사용자 룸"].map((r,i)=>(
        <div key={i} style={{ padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${T.borderLight}` }}>
          <Avatar name={r} size={32} isRoom /><span style={{ fontSize:14, color:T.title }}>{r}</span>
        </div>
      ))}
    </div>
  );
}

/* MYPAGE helpers */
function ProfileBar() {
  return (
    <div style={{ padding:'16px', display:'flex', alignItems:'center', gap:14, borderBottom:`1px solid ${T.divider}` }}>
      <Avatar name="@김해석" size={48} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:16, fontWeight:600, color:T.title, letterSpacing:'-0.02em' }}>@김해석</div>
        <div style={{ fontSize:13, color:T.muted }}>콘텐츠를 맥락으로 읽는 사람</div>
      </div>
      <span style={{ fontSize:12, color:T.brand, fontWeight:600, cursor:'pointer' }}>프로필 →</span>
    </div>
  );
}
function RI({name,action}){return(<div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12,borderBottom:`1px solid ${T.borderLight}`}}><Avatar name={name} size={32} isRoom/><span style={{fontSize:14,color:T.title,flex:1}}>{name}</span>{action&&<span style={{padding:'5px 12px',background:T.subtle,borderRadius:T.r.md,fontSize:12,color:T.sub,fontWeight:600,cursor:'pointer'}}>{action}</span>}</div>);}
function Pills({items,active,onSelect}){return(<div style={{display:'flex',gap:6,padding:'12px 16px'}}>{items.map(s=>(<span key={s.k} onClick={()=>onSelect(s.k)} style={{padding:'6px 14px',borderRadius:T.r.full,background:active===s.k?T.title:T.subtle,color:active===s.k?'#fff':T.muted,fontSize:12,fontWeight:active===s.k?600:400,cursor:'pointer'}}>{s.l}</span>))}</div>);}
function MI({title,room}){return(<div style={{padding:'12px 16px',borderBottom:`1px solid ${T.borderLight}`}}><div style={{fontSize:14,fontWeight:600,color:T.title,marginBottom:3}}>{title}</div><div style={{fontSize:11,color:T.muted}}>{room}</div></div>);}
function MC({nick,text,issue}){return(<div style={{padding:'12px 16px',borderBottom:`1px solid ${T.borderLight}`}}><div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}><Avatar name={nick} size={20}/><span style={{fontSize:12,fontWeight:600,color:T.sub}}>{nick}</span></div><div style={{fontSize:13,color:T.body,marginBottom:3,paddingLeft:28}}>{text}</div><div style={{fontSize:11,color:T.ph,paddingLeft:28}}>→ {issue}</div></div>);}
function MypRooms(){return(<><SH>구독 중</SH><RI name="나는 솔로 해석 룸"/><RI name="리벨북스 비문학 스터디"/><SH>참여 중</SH><RI name="흑백요리사 해석 룸"/><SH>운영 중</SH><RI name="테슬라 한국 실사용자 룸" action="운영하기"/></>);}
function MypIssues(){const[s,setS]=useState("scrap");return(<><Pills items={[{k:'scrap',l:'스크랩'},{k:'written',l:'작성'},{k:'upvoted',l:'업보트'}]} active={s} onSelect={setS}/>{s==="scrap"&&<><MI title="이번 데이트 선택" room="나는 솔로 해석 룸"/><MI title="올해 테슬라 가격 전략" room="테슬라 한국 실사용자 룸"/></>}{s==="written"&&<MI title="FSD 한국 도입" room="테슬라 한국 실사용자 룸"/>}{s==="upvoted"&&<><MI title="이번 장의 핵심 질문" room="리벨북스 비문학 스터디"/><MI title="이번 선택, 진짜 의도?" room="나는 솔로 해석 룸"/></>}</>);}
function MypComments(){const[s,setS]=useState("scrap");return(<><Pills items={[{k:'scrap',l:'스크랩'},{k:'written',l:'작성'},{k:'upvoted',l:'업보트'}]} active={s} onSelect={setS}/>{s==="scrap"&&<MC nick="@닉A" text="도입보다 과금 구조가 더 관건..." issue="FSD 한국 도입"/>}{s==="written"&&<><MC nick="나" text="편집보다 출연자 의도가 더 크다고 봅니다." issue="이번 데이트 선택"/><MC nick="나" text="3장 후반부 논증 구조가 좀 약합니다." issue="이번 장의 핵심 질문"/></>}{s==="upvoted"&&<MC nick="@닉B" text="호감보다 편집 의도가 드러나는 순간..." issue="이번 선택, 진짜 의도?"/>}</>);}

/* MYPAGE */
function MyPageScreen({ state }) {
  if (state.includes("Empty")) return (
    <div><div style={{padding:'14px 16px 10px'}}><span style={{fontSize:22,fontWeight:700,color:T.title,letterSpacing:'-0.03em'}}>마이페이지</span></div><ProfileBar/><div style={{padding:'60px 24px',textAlign:'center'}}><div style={{width:56,height:56,borderRadius:'50%',background:T.subtle,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke={T.ph} strokeWidth="1.5" strokeLinecap="round"/></svg></div><div style={{fontSize:14,color:T.muted}}>아직 활동 내역이 없습니다</div></div></div>
  );
  const at = state==="이슈 탭"?1:state==="댓글 탭"?2:0;
  return (
    <div>
      <div style={{padding:'14px 16px 10px'}}><span style={{fontSize:22,fontWeight:700,color:T.title,letterSpacing:'-0.03em'}}>마이페이지</span></div>
      <ProfileBar/>
      {/* Underline tabs */}
      <div style={{display:'flex',borderBottom:`1px solid ${T.divider}`}}>
        {["룸","이슈","댓글"].map((t,i)=>(
          <div key={t} style={{flex:1,padding:'13px 0',textAlign:'center',fontSize:14,fontWeight:at===i?600:400,color:at===i?T.title:T.muted,borderBottom:at===i?`2px solid ${T.brand}`:'2px solid transparent',cursor:'pointer',letterSpacing:'-0.01em'}}>{t}</div>
        ))}
      </div>
      {at===0&&<MypRooms/>}{at===1&&<MypIssues/>}{at===2&&<MypComments/>}
    </div>
  );
}

/* ═══ OPERATOR SCREENS ═══ */

function RoomSettingsScreen() {
  return (
    <div>
      <div style={{padding:'14px 16px',fontSize:18,fontWeight:700,color:T.title,borderBottom:`1px solid ${T.divider}`,letterSpacing:'-0.02em'}}>운영자 › 룸 설정</div>
      <div style={{padding:16,display:'flex',flexDirection:'column',gap:20}}>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:10}}>룸 대표 이미지</div>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            <Avatar name="테슬라 한국 실사용자 룸" size={64} isRoom/>
            <BtnOutline style={{padding:'8px 16px',fontSize:13}}>이미지 변경</BtnOutline>
          </div>
        </div>
        {[{l:"룸 이름",v:"테슬라 한국 실사용자 룸"},{l:"한 줄 설명",v:"루머보다 해석, 드립보다 이유"},{l:"상세 설명",v:"실사용/가격/정책 관점의 반응을 모읍니다",multi:true}].map(f=>(
          <div key={f.l}><div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:8}}>{f.l}</div><div style={{padding:f.multi?'12px 14px':'11px 14px',border:`1px solid ${T.border}`,borderRadius:T.r.lg,fontSize:14,color:T.title,background:'#fff',minHeight:f.multi?70:'auto',lineHeight:1.5}}>{f.v}</div></div>
        ))}
        <div>
          <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:10}}>멤버 신청</div>
          <div style={{display:'flex',gap:8}}>
            {["받지 않음","받는 중"].map((t,i)=>(
              <div key={t} style={{flex:1,padding:'11px 0',border:i===1?`2px solid ${T.teal}`:`1px solid ${T.border}`,borderRadius:T.r.lg,textAlign:'center',fontSize:13,fontWeight:600,color:i===1?T.teal:T.muted,background:i===1?T.tealBg:'#fff',cursor:'pointer'}}>{t}</div>
            ))}
          </div>
          <div style={{fontSize:11,color:T.ph,marginTop:6}}>&quot;받는 중&quot; 선택 시 룸 상세에 멤버 신청 버튼이 노출됩니다</div>
        </div>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:10}}>공개 상태</div>
          <div style={{display:'flex',gap:8}}>
            {["비공개","공개"].map((t,i)=>(
              <div key={t} style={{flex:1,padding:'11px 0',border:i===1?`2px solid ${T.teal}`:`1px solid ${T.border}`,borderRadius:T.r.lg,textAlign:'center',fontSize:13,fontWeight:600,color:i===1?T.teal:T.muted,background:i===1?T.tealBg:'#fff',cursor:'pointer'}}>{t}</div>
            ))}
          </div>
        </div>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:10}}>멤버 관리</div>
          {["@userA","@userB"].map(u=>(
            <div key={u} style={{padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${T.borderLight}`}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}><Avatar name={u} size={28}/><span style={{fontSize:14,color:T.title}}>{u}</span></div>
              <span style={{fontSize:12,color:T.error,fontWeight:500,cursor:'pointer'}}>제거</span>
            </div>
          ))}
          <div style={{marginTop:10,padding:'11px 14px',border:`1px dashed ${T.border}`,borderRadius:T.r.lg,fontSize:13,color:T.muted,textAlign:'center',cursor:'pointer'}}>+ 사용자 검색 후 추가</div>
        </div>
        <BtnPrimary full style={{marginTop:4}}>저장</BtnPrimary>
      </div>
    </div>
  );
}

function IssuePublishScreen({ state }) {
  const edit = state==="이슈 수정";
  return (
    <div>
      <div style={{padding:'14px 16px',fontSize:18,fontWeight:700,color:T.title,borderBottom:`1px solid ${T.divider}`,letterSpacing:'-0.02em'}}>운영자 › {edit?"이슈 수정":"새 이슈 발행"}</div>
      <div style={{padding:16,display:'flex',flexDirection:'column',gap:16}}>
        {[{l:"제목",v:edit?"FSD 한국 도입, 올해 안 가능할까?":"",ph:"이슈 제목을 입력하세요"},{l:"운영자 한 줄",v:edit?"일정보다 가격/체감이 핵심":"",ph:"이 이슈를 어떤 관점으로 볼지 한 줄로"},{l:"질문 (선택)",v:"",ph:"댓글을 끌어낼 질문"},{l:"본문",v:edit?"이번 FSD 도입 논의에서...":"",ph:"본문을 입력하세요",multi:true}].map(f=>(
          <div key={f.l}><div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:8}}>{f.l}</div><div style={{padding:f.multi?'12px 14px':'11px 14px',border:`1px solid ${T.border}`,borderRadius:T.r.lg,fontSize:14,color:f.v?T.title:T.ph,background:'#fff',minHeight:f.multi?80:'auto'}}>{f.v||f.ph}</div></div>
        ))}
        <div style={{padding:28,border:`1px dashed ${T.border}`,borderRadius:T.r.lg,textAlign:'center',color:T.muted,fontSize:13,cursor:'pointer',background:T.subtle}}>이미지 / 링크 / 유튜브 첨부</div>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:10}}>이슈 상태</div>
          <div style={{display:'flex',gap:6}}>
            {[{l:"초안",a:false,bg:T.amberBg,c:T.amber},{l:"진행 중",a:true,bg:T.tealBg,c:T.teal},{l:"종료",a:false,bg:'#fff',c:T.muted},{l:"숨김",a:false,bg:T.errorBg,c:T.error}].map(s=>(
              <div key={s.l} style={{flex:1,padding:'9px 0',border:s.a?`2px solid ${s.c}`:`1px solid ${T.border}`,borderRadius:T.r.md,textAlign:'center',fontSize:12,fontWeight:600,color:s.c,background:s.a?s.bg:'#fff',cursor:'pointer'}}>{s.l}</div>
            ))}
          </div>
          <div style={{fontSize:11,color:T.ph,marginTop:6}}>초안 = 임시저장 · 숨김 = 공개 후 비노출</div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <div style={{flex:1,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,background:T.subtle,borderRadius:T.r.lg}}><div style={{width:20,height:20,border:`2px solid ${T.border}`,borderRadius:T.r.xs}}/><span style={{fontSize:13,color:T.sub}}>대표 이슈로 설정</span></div>
          <div style={{flex:1,padding:'12px 14px',display:'flex',alignItems:'center',gap:10,background:T.errorBg,borderRadius:T.r.lg}}><div style={{width:20,height:20,border:`2px solid ${T.error}44`,borderRadius:T.r.xs,background:'#fff'}}/><span style={{fontSize:13,color:T.error}}>스포일러 포함</span></div>
        </div>
        <div style={{display:'flex',gap:8,marginTop:4}}>
          <BtnPrimary full style={{flex:1}}>{edit?"수정":"발행"}</BtnPrimary>
          {edit&&<div style={{padding:'13px 16px',background:T.errorBg,color:T.error,borderRadius:T.r.lg,fontSize:14,fontWeight:600,textAlign:'center',cursor:'pointer'}}>삭제</div>}
        </div>
      </div>
    </div>
  );
}

function RepCommentScreen() {
  return (
    <div>
      <div style={{padding:'14px 16px',fontSize:18,fontWeight:700,color:T.title,borderBottom:`1px solid ${T.divider}`,letterSpacing:'-0.02em'}}>운영자 › 대표 댓글 지정</div>
      <div style={{padding:16}}>
        <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:8}}>이슈</div>
        <div style={{padding:'11px 14px',border:`1px solid ${T.border}`,borderRadius:T.r.lg,fontSize:14,color:T.title,background:'#fff',marginBottom:18}}>FSD 한국 도입, 올해 안 가능할까?</div>
      </div>
      <div style={{padding:'0 16px 14px'}}>
        <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:10}}>현재 대표 댓글 (1개)</div>
        <div style={{padding:'14px 16px',background:T.brandTint2,borderRadius:T.r.xl,borderLeft:`3px solid ${T.brand}`,display:'flex',alignItems:'flex-start',gap:10}}>
          <Avatar name="@닉A" size={28}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:T.brand,marginBottom:4}}>@닉A</div>
            <div style={{fontSize:13,color:T.body,lineHeight:1.5}}>도입보다 과금 구조가 더 관건이라는 이야기가...</div>
          </div>
          <span style={{padding:'5px 12px',background:T.errorBg,color:T.error,borderRadius:T.r.md,fontSize:11,fontWeight:600,flexShrink:0,cursor:'pointer'}}>해제</span>
        </div>
      </div>
      <SH>전체 댓글</SH>
      {[{n:"@닉B",t:"이번 건은 일정 자체보다 인프라 준비가..."},{n:"@닉C",t:"오히려 OTA 체감이 더 중요한 포인트라고..."},{n:"@닉D",t:"국내 가격 포지셔닝이 결국 핵심일 것..."}].map((c,i)=>(
        <div key={i} style={{padding:'14px 16px',borderBottom:`1px solid ${T.divider}`,display:'flex',alignItems:'flex-start',gap:10}}>
          <Avatar name={c.n} size={28}/>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600,color:T.body,marginBottom:4}}>{c.n}</div>
            <div style={{fontSize:13,color:T.body,lineHeight:1.5}}>{c.t}</div>
          </div>
          <span style={{padding:'5px 12px',background:T.brandTint,color:T.brand,borderRadius:T.r.md,fontSize:11,fontWeight:600,flexShrink:0,cursor:'pointer'}}>지정</span>
        </div>
      ))}
    </div>
  );
}

/* ═══ INFO PANEL ═══ */
const INFO = {
  feed:{route:"/feed",purpose:"구독 룸들의 최신 이슈를 큰 카드로 소비하는 lean-back reading 피드",data:["구독 Room 아바타 바","큰 이슈 카드: 운영자 한 줄 + 본문 3줄 + 첨부 이미지 + 대표 댓글(최대 5줄)","조회수/댓글수/업보트수"],cta:["이슈 읽기","룸 보기"],notes:"대표 댓글 지정 이슈만 노출. 대표 댓글 5줄 제한."},
  issues:{route:"/issues",purpose:"공개 이슈를 빠르게 스캔하는 탐색 목록",data:["작은 이슈 카드: 제목+운영자 한 줄+대표 댓글 1줄","조회수/댓글수/업보트수"],cta:["이슈 읽기","룸 보기"],notes:"대표 댓글 지정 이슈 우선. 진행 중은 배지 미표시, 종료만 배지."},
  rooms:{route:"/rooms",purpose:"Visitor가 공개 룸을 발견하는 진입 화면",data:["공개 Room + 대표 이미지","멤버 모집 중 배지","이슈 수/구독자 수"],cta:["구독하기","멤버 신청"],notes:"멤버 모집 중인 룸에만 멤버 신청 버튼 노출."},
  room:{route:"/rooms/:slug",purpose:"룸의 결을 느끼고 구독/멤버 신청을 결정하는 페이지",data:["룸 커버+정보","대표 이슈","이슈 목록"],cta:["구독하기","멤버 신청","운영하기"],notes:"멤버 모집 받는 룸: 멤버 신청 CTA 노출."},
  issue:{route:"/rooms/:slug/issues/:id",purpose:"이슈 본문 + 대표 댓글 + 전체 댓글 소비",data:["이슈 전체","대표 댓글(1개)","전체 댓글+대댓글"],cta:["업보트","스크랩","댓글 작성"],notes:"Visitor→구독 유도, Subscriber→멤버 신청, Member/Op→댓글 입력."},
  mypage:{route:"/me",purpose:"개인 활동과 룸 관계 허브",data:["프로필","룸/이슈/댓글 탭"],cta:["룸 보기","운영하기","프로필 보기"],notes:"프로필 섹션에서 상세 프로필로 이동 가능."},
  profile:{route:"/users/:id",purpose:"개인 활동과 업적 프로필",data:["활동 통계","대표 선정 댓글","최근 댓글","참여 룸"],cta:["프로필 편집"],notes:"대표 선정 횟수가 핵심 업적."},
  "room-settings":{route:"/operator/rooms/:id/settings",purpose:"운영자가 룸을 관리",data:["룸 이미지/이름/설명","멤버 신청 토글","공개 상태","멤버 목록"],cta:["저장"],notes:"멤버 신청 '받는 중' 설정 시 버튼 자동 노출."},
  "issue-publish":{route:"/operator/rooms/:id/issues/new",purpose:"이슈 발행/수정",data:["제목/운영자 한 줄/질문/본문","이슈 상태","대표 이슈/스포일러"],cta:["발행","수정","삭제"],notes:"상태: 초안/진행 중/종료/숨김."},
  "rep-comment":{route:"/operator/issues/:id/comments",purpose:"대표 댓글 1개 지정",data:["이슈 정보","전체 댓글","현재 대표"],cta:["지정","해제"],notes:"1개만 지정 가능."},
};

function InfoPanel({ id }) {
  const info = INFO[id]; if(!info) return null;
  return (
    <div style={{padding:'20px',background:'#fff',borderRadius:T.r['2xl'],border:`1px solid ${T.divider}`,fontSize:13,color:T.body,lineHeight:1.65,maxWidth:380,fontFamily:T.font,boxShadow:T.shadow.sm}}>
      <div style={{fontSize:10,fontWeight:700,color:T.ph,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>Route</div>
      <div style={{fontFamily:'ui-monospace,"SF Mono",monospace',fontSize:12,color:T.brand,background:T.brandTint,padding:'5px 10px',borderRadius:T.r.md,display:'inline-block',marginBottom:16}}>{info.route}</div>
      <div style={{fontSize:10,fontWeight:700,color:T.ph,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>목적</div>
      <div style={{marginBottom:16}}>{info.purpose}</div>
      <div style={{fontSize:10,fontWeight:700,color:T.ph,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>핵심 데이터</div>
      <div style={{marginBottom:16}}>{info.data.map((d,i)=><div key={i} style={{display:'flex',gap:8,marginBottom:4}}><span style={{color:T.brand,fontSize:6,marginTop:6}}>●</span><span>{d}</span></div>)}</div>
      <div style={{fontSize:10,fontWeight:700,color:T.ph,marginBottom:6,textTransform:'uppercase',letterSpacing:'0.08em'}}>주요 CTA</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:16}}>{info.cta.map((c,i)=><Badge key={i} text={c} variant="brand"/>)}</div>
      <div style={{fontSize:10,fontWeight:700,color:T.ph,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>비고</div>
      <div style={{fontSize:12,color:T.sub}}>{info.notes}</div>
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function PIVITViewer() {
  const [scr,setScr] = useState("feed");
  const [si,setSi] = useState(0);
  const sts = STATES[scr]||["기본"];
  const sn = sts[si]||sts[0];
  const go = (id)=>{setScr(id);setSi(0);};
  const meta = SCREENS.find(s=>s.id===scr);
  const groups = [{key:"user",label:"사용자 화면"},{key:"operator",label:"운영자 화면"}];

  const render = ()=>{
    switch(scr){
      case "feed": return <FeedScreen state={sn}/>;
      case "issues": return <IssueListScreen state={sn}/>;
      case "rooms": return <RoomListScreen state={sn}/>;
      case "room": return <RoomScreen state={sn}/>;
      case "issue": return <IssueDetailScreen state={sn}/>;
      case "mypage": return <MyPageScreen state={sn}/>;
      case "profile": return <ProfileScreen state={sn}/>;
      case "room-settings": return <RoomSettingsScreen/>;
      case "issue-publish": return <IssuePublishScreen state={sn}/>;
      case "rep-comment": return <RepCommentScreen/>;
      default: return null;
    }
  };

  return (
    <div style={{fontFamily:T.font,maxWidth:920,margin:'0 auto'}}>
      <div style={{marginBottom:24,display:'grid',gap:12}}>
        {/* Screen picker */}
        <div style={{padding:'18px 20px',borderRadius:T.r['2xl'],border:`1px solid ${T.divider}`,background:'#fff',boxShadow:T.shadow.sm}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:14}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:T.brand,marginBottom:3}}>1. 페이지 선택</div>
              <div style={{fontSize:13,color:T.muted}}>아래 미리보기를 다른 페이지로 바꿉니다.</div>
            </div>
            <Badge text={`현재: ${meta?.label||scr}`} variant="brand"/>
          </div>
          {groups.map(g=>(
            <div key={g.key} style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:T.ph,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}}>{g.label}</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {SCREENS.filter(s=>s.group===g.key).map(s=>(
                  <button key={s.id} onClick={()=>go(s.id)} style={{padding:'8px 14px',borderRadius:T.r.md,cursor:'pointer',fontSize:13,fontFamily:T.font,border:scr===s.id?`1.5px solid ${T.brand}`:`1px solid ${T.divider}`,background:scr===s.id?T.brandTint:'#fff',color:scr===s.id?T.brand:T.sub,fontWeight:scr===s.id?600:400}}>{s.label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* State picker */}
        <div style={{padding:'18px 20px',borderRadius:T.r['2xl'],border:`1px solid ${T.divider}`,background:'#fff',boxShadow:T.shadow.sm}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12,marginBottom:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:T.teal,marginBottom:3}}>2. 같은 페이지 안 상태 전환</div>
              <div style={{fontSize:13,color:T.muted}}>권한·멤버 모집 여부·빈 상태 등을 바꿔 비교합니다.</div>
            </div>
            <Badge text={`현재: ${sn}`} variant="teal"/>
          </div>
          <div style={{fontSize:12,color:T.sub,marginBottom:10}}>기준: <span style={{fontWeight:600,color:T.teal}}>{meta?.label}</span></div>
          {sts.length>1?(
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {sts.map((s,i)=>(
                <button key={s} onClick={()=>setSi(i)} style={{padding:'6px 14px',borderRadius:T.r.full,cursor:'pointer',fontSize:12,fontFamily:T.font,border:si===i?`1.5px solid ${T.teal}`:`1px solid ${T.divider}`,background:si===i?T.tealBg:'#fff',color:si===i?T.teal:T.sub,fontWeight:si===i?600:400}}>{s}</button>
              ))}
            </div>
          ):(
            <div style={{fontSize:12,color:T.ph,padding:'10px 14px',borderRadius:T.r.lg,border:`1px dashed ${T.border}`,background:'#fff'}}>추가 상태 없음</div>
          )}
        </div>
      </div>
      {/* Phone + Info */}
      <div style={{display:'flex',gap:28,alignItems:'flex-start',flexWrap:'wrap'}}>
        <Phone tab={['feed','issues','rooms','mypage'].includes(scr)?scr:undefined} onTab={go}>{render()}</Phone>
        <InfoPanel id={scr}/>
      </div>
    </div>
  );
}
