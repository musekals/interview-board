'use client';

import { useState } from "react";

/*
  ============================================================
  디자인 시스템 & 컴포넌트 라이브러리
  v6 와이어프레임 기준 · 디자이너 레퍼런스 + 개발 구현용
  ============================================================
  
  이 파일에 포함된 것:
  1. 디자인 토큰 (컬러, 타이포, 간격, 라운딩)
  2. 공통 컴포넌트 (버튼, 배지, 모달, 토스트, 바텀시트)
  3. 핵심 고유 컴포넌트 (BigIssueCard, CompactIssueCard, RoomCard, 
     RepComment, CommentThread, RoomHeader, SubscribedRoomBar,
     ProfileStats, MemberApplicationCard)
  
  각 섹션을 탭으로 전환하여 확인할 수 있습니다.
*/

// ============================================================
// 1. DESIGN TOKENS
// ============================================================

const tokens = {
  color: {
    brand: { primary: "#4A3FA0", light: "#EEEDFE", mid: "#AFA9EC", dark: "#26215C" },
    text: { primary: "#2C2C2A", secondary: "#5F5E5A", tertiary: "#888780", hint: "#B4B2A9" },
    bg: { primary: "#FFFFFF", secondary: "#FAFAF8", tertiary: "#F1EFE8", card: "#F9F9F6" },
    border: { light: "#EEEDEA", medium: "#D3D1C7", dark: "#B4B2A9" },
    accent: { green: "#0F6E56", greenBg: "#E1F5EE", greenBorder: "#5DCAA5", red: "#A32D2D", redBg: "#FCEBEB", amber: "#854F0B", amberBg: "#FAEEDA" },
    rep: { bg: "#F3F2FC", border: "#7F77DD", text: "#534AB7" },
  },
  font: {
    family: '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    size: { xs: 11, sm: 12, base: 13, md: 14, lg: 15, xl: 17, xxl: 19, title: 20 },
    weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  },
  spacing: { xs: 4, sm: 6, md: 8, lg: 10, xl: 12, xxl: 16, xxxl: 20, section: 24 },
  radius: { sm: 6, md: 8, lg: 10, xl: 12, pill: 20, full: 999, card: 10 },
};

const T = tokens;

// ============================================================
// 2. SHARED STYLES (inline helper)
// ============================================================

const baseText = { fontFamily: T.font.family, color: T.color.text.primary, WebkitFontSmoothing: "antialiased" };

// ============================================================
// 3. COMPONENTS
// ============================================================

// --- Badge ---
function Badge({ text, variant = "default" }) {
  const styles = {
    default: { bg: T.color.bg.tertiary, color: T.color.text.secondary, border: T.color.border.dark },
    brand: { bg: T.color.brand.light, color: T.color.brand.primary, border: T.color.brand.mid },
    green: { bg: T.color.accent.greenBg, color: T.color.accent.green, border: T.color.accent.greenBorder },
    red: { bg: T.color.accent.redBg, color: T.color.accent.red, border: "#F09595" },
    amber: { bg: T.color.accent.amberBg, color: T.color.accent.amber, border: "#EF9F27" },
  };
  const s = styles[variant] || styles.default;
  return <span style={{ ...baseText, display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: T.radius.sm, fontSize: T.font.size.xs, fontWeight: T.font.weight.medium, background: s.bg, color: s.color, border: `1px solid ${s.border}`, lineHeight: 1.4 }}>{text}</span>;
}

// --- MetaRow (업보트/댓글/조회수) ---
function MetaRow({ upvotes, comments, views, compact }) {
  const sz = compact ? 11 : 12;
  const gap = compact ? 8 : 12;
  const items = [
    { icon: "M8 3l1.5 3.3 3.5.5-2.5 2.5.6 3.5L8 11.1l-3.1 1.7.6-3.5L3 6.8l3.5-.5z", val: upvotes },
    { icon: "M2 2.5A1.5 1.5 0 013.5 1h9A1.5 1.5 0 0114 2.5v7a1.5 1.5 0 01-1.5 1.5H6l-3 3V11H3.5A1.5 1.5 0 012 9.5z", val: comments },
  ];
  if (views !== undefined) items.push({ icon: "M8 3C4.4 3 1.4 5.4.5 8c.9 2.6 3.9 5 7.5 5s6.6-2.4 7.5-5c-.9-2.6-3.9-5-7.5-5zm0 8.3A3.3 3.3 0 118 4.7a3.3 3.3 0 010 6.6zm0-5.3a2 2 0 100 4 2 2 0 000-4z", val: views });
  return (
    <div style={{ display: "flex", alignItems: "center", gap, fontSize: sz, color: T.color.text.hint, marginTop: compact ? 4 : 8 }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d={it.icon} fill={T.color.border.dark} /></svg>
          {it.val}
        </span>
      ))}
    </div>
  );
}

// --- RoomThumb (룸 대표 이미지) ---
function RoomThumb({ size = 36, color }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size > 30 ? T.radius.xl : T.radius.md, background: `linear-gradient(135deg, ${color || T.color.brand.light} 60%, ${T.color.border.medium} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, color: T.color.brand.primary, fontWeight: T.font.weight.bold, flexShrink: 0 }}>
      ◈
    </div>
  );
}

// --- Image Placeholder ---
function ImgPlaceholder({ height = 180 }) {
  return <div style={{ width: "100%", height, background: "linear-gradient(135deg, #F1EFE8 0%, #E6E0FA 50%, #E1F5EE 100%)", borderRadius: T.radius.card, display: "flex", alignItems: "center", justifyContent: "center", fontSize: T.font.size.sm, color: T.color.text.hint, marginTop: T.spacing.md }}>첨부 이미지</div>;
}

// --- StatusBadge ---
function StatusBadge({ status }) {
  if (status === "진행 중") return null;
  if (status === "종료") return <Badge text="종료" variant="default" />;
  if (status === "초안") return <Badge text="초안" variant="amber" />;
  if (status === "숨김") return <Badge text="숨김" variant="red" />;
  return null;
}

// --- ActionButton (업보트, 스크랩, 신고 등) ---
function ActionButton({ icon, label, variant = "default" }) {
  const isActive = variant === "active";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: T.radius.pill, border: `1.5px solid ${isActive ? T.color.brand.mid : T.color.border.medium}`, fontSize: T.font.size.sm, fontWeight: isActive ? T.font.weight.semibold : T.font.weight.regular, color: isActive ? T.color.brand.primary : T.color.text.secondary, cursor: "pointer", background: isActive ? T.color.brand.light : "transparent", transition: "all 0.15s ease" }}>
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {label}
    </div>
  );
}

// --- CTA Button ---
function CTAButton({ label, variant = "primary", size = "md", fullWidth }) {
  const styles = {
    primary: { bg: T.color.brand.primary, color: "#fff", border: "none" },
    secondary: { bg: T.color.brand.light, color: T.color.brand.primary, border: "none" },
    outline: { bg: "transparent", color: T.color.accent.green, border: `1.5px solid ${T.color.accent.green}` },
    ghost: { bg: T.color.bg.tertiary, color: T.color.text.secondary, border: "none" },
    danger: { bg: T.color.accent.redBg, color: T.color.accent.red, border: "none" },
  };
  const s = styles[variant] || styles.primary;
  const padding = size === "sm" ? "8px 12px" : size === "lg" ? "13px 24px" : "11px 16px";
  const fontSize = size === "sm" ? T.font.size.sm : size === "lg" ? T.font.size.md : T.font.size.base;
  return (
    <div style={{ ...baseText, display: "inline-flex", alignItems: "center", justifyContent: "center", padding, borderRadius: T.radius.lg, fontSize, fontWeight: T.font.weight.semibold, background: s.bg, color: s.color, border: s.border, cursor: "pointer", transition: "all 0.15s ease", width: fullWidth ? "100%" : "auto", textAlign: "center" }}>
      {label}
    </div>
  );
}

// --- Toast ---
function Toast({ message, variant = "success" }) {
  const bg = variant === "success" ? T.color.accent.greenBg : variant === "error" ? T.color.accent.redBg : T.color.bg.tertiary;
  const color = variant === "success" ? T.color.accent.green : variant === "error" ? T.color.accent.red : T.color.text.secondary;
  const icon = variant === "success" ? "✓" : variant === "error" ? "✕" : "ℹ";
  return (
    <div style={{ ...baseText, display: "flex", alignItems: "center", gap: T.spacing.md, padding: "12px 16px", borderRadius: T.radius.xl, background: bg, color, fontSize: T.font.size.base, fontWeight: T.font.weight.medium, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", maxWidth: 320, margin: "0 auto" }}>
      <span style={{ fontSize: 16, fontWeight: T.font.weight.bold }}>{icon}</span>
      {message}
    </div>
  );
}

// --- Modal ---
function Modal({ title, description, confirmLabel = "확인", cancelLabel = "취소", danger }) {
  return (
    <div style={{ position: "relative", width: 300, background: "#fff", borderRadius: 16, padding: "24px 20px 16px", boxShadow: "0 16px 48px rgba(0,0,0,0.15)", ...baseText }}>
      <div style={{ fontSize: T.font.size.lg, fontWeight: T.font.weight.bold, color: T.color.text.primary, marginBottom: T.spacing.md }}>{title}</div>
      <div style={{ fontSize: T.font.size.base, color: T.color.text.secondary, lineHeight: 1.55, marginBottom: T.spacing.section }}>{description}</div>
      <div style={{ display: "flex", gap: T.spacing.md }}>
        <div style={{ flex: 1, padding: "10px 0", borderRadius: T.radius.lg, background: T.color.bg.tertiary, color: T.color.text.secondary, fontSize: T.font.size.md, fontWeight: T.font.weight.semibold, textAlign: "center", cursor: "pointer" }}>{cancelLabel}</div>
        <div style={{ flex: 1, padding: "10px 0", borderRadius: T.radius.lg, background: danger ? T.color.accent.red : T.color.brand.primary, color: "#fff", fontSize: T.font.size.md, fontWeight: T.font.weight.semibold, textAlign: "center", cursor: "pointer" }}>{confirmLabel}</div>
      </div>
    </div>
  );
}

// --- BottomSheet ---
function BottomSheet({ title, children }) {
  return (
    <div style={{ width: 343, background: "#fff", borderRadius: "16px 16px 0 0", padding: "12px 0 0", boxShadow: "0 -4px 24px rgba(0,0,0,0.1)", ...baseText }}>
      <div style={{ width: 36, height: 4, borderRadius: 2, background: T.color.border.medium, margin: "0 auto 12px" }} />
      {title && <div style={{ fontSize: T.font.size.lg, fontWeight: T.font.weight.bold, color: T.color.text.primary, padding: "0 20px 12px", borderBottom: `1px solid ${T.color.border.light}` }}>{title}</div>}
      <div style={{ padding: "12px 20px 20px" }}>{children}</div>
    </div>
  );
}

// ============================================================
// 핵심 고유 컴포넌트
// ============================================================

// --- BigIssueCard (피드용 큰 카드) ---
function BigIssueCard({ room, title, opLine, body, repNick, repComment, status, comments, upvotes, views, hasImage }) {
  return (
    <div style={{ ...baseText, padding: "18px 16px", borderBottom: `6px solid ${T.color.bg.tertiary}` }}>
      <div style={{ fontSize: T.font.size.xs, color: T.color.brand.primary, fontWeight: T.font.weight.semibold, marginBottom: T.spacing.sm, display: "flex", alignItems: "center", gap: T.spacing.sm, cursor: "pointer" }}>
        <RoomThumb size={20} />
        <span style={{ textDecoration: "underline", textDecorationColor: T.color.brand.mid, textUnderlineOffset: 2 }}>{room}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: T.spacing.sm, marginBottom: 4 }}>
        <span style={{ fontSize: T.font.size.xl, fontWeight: T.font.weight.bold, color: T.color.text.primary, lineHeight: 1.35, flex: 1 }}>{title}</span>
        <StatusBadge status={status} />
      </div>
      {opLine && <div style={{ fontSize: T.font.size.sm, color: T.color.text.secondary, marginBottom: T.spacing.sm, fontStyle: "italic" }}><span style={{ fontWeight: T.font.weight.medium, fontStyle: "normal", color: T.color.text.hint }}>운영자: </span>{opLine}</div>}
      <div style={{ fontSize: T.font.size.base, color: T.color.text.primary, lineHeight: 1.55, marginBottom: T.spacing.md, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", opacity: 0.85 }}>{body}</div>
      {hasImage && <ImgPlaceholder height={180} />}
      {repComment && (
        <div style={{ background: T.color.bg.card, padding: "12px 14px", borderRadius: T.radius.card, borderLeft: `3px solid ${T.color.brand.mid}`, marginTop: T.spacing.lg }}>
          <div style={{ display: "flex", alignItems: "center", gap: T.spacing.sm, marginBottom: T.spacing.sm }}>
            <span style={{ fontSize: T.font.size.sm, fontWeight: T.font.weight.semibold, color: T.color.rep.text }}>{repNick}</span>
            <Badge text="대표" variant="brand" />
          </div>
          <div style={{ fontSize: T.font.size.md, color: T.color.text.primary, lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{repComment}</div>
        </div>
      )}
      <MetaRow upvotes={upvotes} comments={comments} views={views} />
    </div>
  );
}

// --- CompactIssueCard (이슈 목록용 작은 카드) ---
function CompactIssueCard({ room, title, opLine, repShort, status, comments, upvotes, views, isSpoiler }) {
  return (
    <div style={{ ...baseText, padding: "12px 16px", borderBottom: `1px solid ${T.color.border.light}` }}>
      <div style={{ fontSize: T.font.size.xs, color: T.color.brand.primary, fontWeight: T.font.weight.semibold, marginBottom: 3, display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
        <RoomThumb size={14} />
        <span style={{ textDecoration: "underline", textDecorationColor: T.color.brand.mid, textUnderlineOffset: 2 }}>{room}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: T.spacing.sm, marginBottom: 3 }}>
        <span style={{ fontSize: T.font.size.md, fontWeight: T.font.weight.semibold, color: T.color.text.primary, lineHeight: 1.3, flex: 1 }}>{title}</span>
        {isSpoiler && <Badge text="스포" variant="red" />}
        <StatusBadge status={status} />
      </div>
      {isSpoiler ? <div style={{ fontSize: T.font.size.sm, color: T.color.text.hint, fontStyle: "italic", padding: "4px 0" }}>스포일러 포함 · 탭하여 보기</div> : (
        <>
          {opLine && <div style={{ fontSize: T.font.size.sm, color: T.color.text.hint, marginBottom: 2 }}>운영자: {opLine}</div>}
          {repShort && <div style={{ fontSize: T.font.size.sm, color: T.color.text.secondary, display: "flex", alignItems: "center", gap: 4 }}><span style={{ color: T.color.brand.mid, fontSize: 10 }}>◆</span><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{repShort}</span></div>}
        </>
      )}
      <MetaRow upvotes={upvotes} comments={comments} views={views} compact />
    </div>
  );
}

// --- RepComment (대표 댓글 강조) ---
function RepComment({ nick, text, standalone }) {
  return (
    <div style={{ ...baseText, padding: standalone ? "12px 16px" : "10px 14px", background: T.color.rep.bg, borderRadius: T.radius.card, borderLeft: `3px solid ${T.color.rep.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: T.spacing.sm, marginBottom: 4 }}>
        <span style={{ fontSize: T.font.size.base, fontWeight: T.font.weight.semibold, color: T.color.rep.text }}>{nick}</span>
        <Badge text="대표" variant="brand" />
      </div>
      <div style={{ fontSize: T.font.size.md, color: T.color.text.primary, lineHeight: 1.55 }}>{text}</div>
    </div>
  );
}

// --- CommentThread (댓글 + 대댓글) ---
function CommentThread({ nick, text, upvotes, time, replies }) {
  return (
    <div style={{ ...baseText, padding: "12px 16px", borderBottom: `1px solid ${T.color.border.light}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: T.font.size.base, fontWeight: T.font.weight.semibold, color: T.color.text.primary }}>{nick}</span>
        <div style={{ display: "flex", alignItems: "center", gap: T.spacing.md }}>
          <span style={{ fontSize: T.font.size.xs, color: T.color.text.hint }}>{time}</span>
          <span style={{ fontSize: T.font.size.xs, color: T.color.text.hint, cursor: "pointer" }}>⚑</span>
        </div>
      </div>
      <div style={{ fontSize: T.font.size.md, color: T.color.text.primary, lineHeight: 1.5 }}>{text}</div>
      <div style={{ marginTop: T.spacing.md, display: "flex", gap: 14, fontSize: T.font.size.sm, color: T.color.text.hint }}>
        <span>▲ {upvotes}</span><span>↩ 답글</span><span>⊞ 스크랩</span>
      </div>
      {replies && replies.length > 0 && (
        <div style={{ marginTop: T.spacing.md, marginLeft: 16, borderLeft: `2px solid ${T.color.border.light}`, paddingLeft: 12 }}>
          {replies.map((r, i) => (
            <div key={i} style={{ paddingBottom: T.spacing.md, marginBottom: i < replies.length - 1 ? T.spacing.md : 0, borderBottom: i < replies.length - 1 ? `1px solid ${T.color.bg.tertiary}` : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                <span style={{ fontSize: T.font.size.sm, fontWeight: T.font.weight.semibold, color: T.color.text.secondary }}>{r.nick}</span>
                <div style={{ display: "flex", alignItems: "center", gap: T.spacing.md }}>
                  <span style={{ fontSize: T.font.size.xs, color: T.color.text.hint }}>{r.time}</span>
                  <span style={{ fontSize: T.font.size.xs, color: T.color.text.hint }}>⚑</span>
                </div>
              </div>
              <div style={{ fontSize: T.font.size.base, color: T.color.text.secondary, lineHeight: 1.45 }}>{r.text}</div>
              <div style={{ marginTop: 4, display: "flex", gap: 12, fontSize: T.font.size.xs, color: T.color.text.hint }}>
                <span>▲ {r.upvotes}</span><span>↩ 답글</span><span>⊞ 스크랩</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- SubscribedRoomBar (피드 상단) ---
function SubscribedRoomBar() {
  const rooms = [
    { name: "테슬라", color: T.color.accent.amberBg },
    { name: "나솔", color: T.color.brand.light },
    { name: "리벨", color: T.color.accent.greenBg },
  ];
  return (
    <div style={{ ...baseText, padding: "10px 16px", borderBottom: `1px solid ${T.color.border.light}`, display: "flex", alignItems: "center", gap: T.spacing.lg }}>
      {rooms.map((r, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <RoomThumb size={36} color={r.color} />
          <span style={{ fontSize: 10, color: T.color.text.hint }}>{r.name}</span>
        </div>
      ))}
      <div style={{ fontSize: T.font.size.xs, color: T.color.text.hint, marginLeft: "auto" }}>{rooms.length}개 룸 구독 중</div>
    </div>
  );
}

// --- ProfileStats ---
function ProfileStats({ stats }) {
  return (
    <div style={{ ...baseText, display: "flex", gap: T.spacing.md }}>
      {stats.map((s, i) => (
        <div key={i} style={{ flex: 1, padding: "10px 4px", background: T.color.bg.card, borderRadius: T.radius.card, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: T.font.weight.bold, color: T.color.text.primary }}>{s.val}</div>
          <div style={{ fontSize: 10, color: T.color.text.hint, marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// --- MemberApplicationCard ---
function MemberApplicationCard({ nick, reason, time }) {
  return (
    <div style={{ ...baseText, padding: "12px 14px", border: `1px solid ${T.color.border.light}`, borderRadius: T.radius.xl, marginBottom: T.spacing.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: T.spacing.sm }}>
        <span style={{ fontSize: T.font.size.md, fontWeight: T.font.weight.semibold, color: T.color.text.primary }}>{nick}</span>
        <span style={{ fontSize: T.font.size.xs, color: T.color.text.hint }}>{time}</span>
      </div>
      <div style={{ fontSize: T.font.size.base, color: T.color.text.secondary, lineHeight: 1.45, marginBottom: T.spacing.xl }}>{reason}</div>
      <div style={{ display: "flex", gap: T.spacing.md }}>
        <CTAButton label="거절" variant="ghost" size="sm" fullWidth />
        <CTAButton label="승인" variant="primary" size="sm" fullWidth />
      </div>
    </div>
  );
}

// --- ReportSheet (신고 바텀시트 내용) ---
function ReportSheetContent() {
  const reasons = ["부적절한 내용", "스팸 / 광고", "혐오 발언", "기타"];
  return (
    <div style={baseText}>
      {reasons.map((r, i) => (
        <div key={i} style={{ padding: "12px 0", borderBottom: i < reasons.length - 1 ? `1px solid ${T.color.border.light}` : "none", fontSize: T.font.size.md, color: T.color.text.primary, cursor: "pointer" }}>{r}</div>
      ))}
      <div style={{ marginTop: 16 }}><CTAButton label="신고하기" variant="danger" fullWidth /></div>
    </div>
  );
}

// ============================================================
// 4. SHOWCASE APP
// ============================================================

const TABS = [
  { id: "tokens", label: "디자인 토큰" },
  { id: "common", label: "공통 컴포넌트" },
  { id: "cards", label: "이슈 카드" },
  { id: "room", label: "룸 컴포넌트" },
  { id: "comment", label: "댓글/대표 댓글" },
  { id: "overlay", label: "모달/시트/토스트" },
  { id: "profile", label: "프로필/멤버 신청" },
];

function Section({ title, desc, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.color.text.primary, marginBottom: 4 }}>{title}</div>
      {desc && <div style={{ fontSize: 13, color: T.color.text.hint, marginBottom: 12 }}>{desc}</div>}
      {children}
    </div>
  );
}

function TokensTab() {
  return (
    <div>
      <Section title="컬러 팔레트" desc="모든 컬러는 CSS 변수로 관리. 다크모드 대응 시 여기만 수정.">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { label: "Brand Primary", color: T.color.brand.primary },
            { label: "Brand Light", color: T.color.brand.light },
            { label: "Brand Mid", color: T.color.brand.mid },
            { label: "Green", color: T.color.accent.green },
            { label: "Green Bg", color: T.color.accent.greenBg },
            { label: "Red", color: T.color.accent.red },
            { label: "Red Bg", color: T.color.accent.redBg },
            { label: "Amber", color: T.color.accent.amber },
            { label: "Amber Bg", color: T.color.accent.amberBg },
            { label: "Text Primary", color: T.color.text.primary },
            { label: "Text Secondary", color: T.color.text.secondary },
            { label: "Text Hint", color: T.color.text.hint },
            { label: "Bg Secondary", color: T.color.bg.secondary },
            { label: "Bg Tertiary", color: T.color.bg.tertiary },
            { label: "Border Light", color: T.color.border.light },
            { label: "Border Medium", color: T.color.border.medium },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#fff", border: `1px solid ${T.color.border.light}`, borderRadius: 8, fontSize: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, background: c.color, border: `1px solid ${T.color.border.light}` }} />
              <span style={{ color: T.color.text.secondary }}>{c.label}</span>
              <span style={{ color: T.color.text.hint, fontFamily: "monospace", fontSize: 11 }}>{c.color}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="타이포그래피" desc="Pretendard Variable 기본. 웨이트는 400/500/600/700 4단계.">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { size: T.font.size.title, weight: T.font.weight.bold, label: "Title (20px / Bold)" },
            { size: T.font.size.xxl, weight: T.font.weight.bold, label: "Heading (19px / Bold)" },
            { size: T.font.size.xl, weight: T.font.weight.bold, label: "Card Title (17px / Bold)" },
            { size: T.font.size.lg, weight: T.font.weight.semibold, label: "Section (15px / SemiBold)" },
            { size: T.font.size.md, weight: T.font.weight.regular, label: "Body (14px / Regular)" },
            { size: T.font.size.base, weight: T.font.weight.regular, label: "Small Body (13px / Regular)" },
            { size: T.font.size.sm, weight: T.font.weight.medium, label: "Caption (12px / Medium)" },
            { size: T.font.size.xs, weight: T.font.weight.medium, label: "Micro (11px / Medium)" },
          ].map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "4px 0" }}>
              <span style={{ ...baseText, fontSize: t.size, fontWeight: t.weight, minWidth: 200 }}>가나다라마바사 Aa</span>
              <span style={{ fontSize: 11, color: T.color.text.hint }}>{t.label}</span>
            </div>
          ))}
        </div>
      </Section>
      <Section title="간격 & 라운딩">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[6, 8, 10, 12, 16, 20, 24].map(s => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: s * 2, height: 24, background: T.color.brand.light, borderRadius: 4 }} />
              <span style={{ fontSize: 11, color: T.color.text.hint }}>{s}px</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          {[{ r: 6, l: "sm" }, { r: 8, l: "md" }, { r: 10, l: "lg/card" }, { r: 12, l: "xl" }, { r: 20, l: "pill" }, { r: 999, l: "full" }].map(({ r, l }) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 48, height: 32, background: T.color.brand.light, border: `1px solid ${T.color.brand.mid}`, borderRadius: r }} />
              <span style={{ fontSize: 11, color: T.color.text.hint }}>{l} ({r})</span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function CommonTab() {
  return (
    <div>
      <Section title="Badge 변형" desc="variant: default, brand, green, red, amber">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge text="기본" variant="default" />
          <Badge text="브랜드" variant="brand" />
          <Badge text="멤버 모집 중" variant="green" />
          <Badge text="스포일러" variant="red" />
          <Badge text="초안" variant="amber" />
          <Badge text="종료" variant="default" />
          <Badge text="대표" variant="brand" />
        </div>
      </Section>
      <Section title="CTA 버튼" desc="variant: primary, secondary, outline, ghost, danger × size: sm, md, lg">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <CTAButton label="구독하기" />
          <CTAButton label="구독 중 ✓" variant="secondary" />
          <CTAButton label="멤버 신청" variant="outline" />
          <CTAButton label="운영하기" variant="ghost" />
          <CTAButton label="삭제" variant="danger" />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
          <CTAButton label="Small" size="sm" />
          <CTAButton label="Medium (기본)" size="md" />
          <CTAButton label="Large" size="lg" />
        </div>
      </Section>
      <Section title="액션 버튼 (업보트/스크랩/신고)" desc="이슈 상세에서 사용. active 상태 포함.">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ActionButton icon="★" label="업보트 53" />
          <ActionButton icon="★" label="업보트 54" variant="active" />
          <ActionButton icon="⊞" label="스크랩" />
          <ActionButton icon="⚑" label="신고" />
        </div>
      </Section>
      <Section title="MetaRow" desc="업보트 · 댓글 · 조회수 표시. compact 옵션으로 목록용 축소.">
        <MetaRow upvotes={47} comments={24} views={312} />
        <MetaRow upvotes={47} comments={24} views={312} compact />
      </Section>
      <Section title="RoomThumb" desc="룸 대표 이미지. 14~64px 다양한 크기.">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <RoomThumb size={14} />
          <RoomThumb size={20} />
          <RoomThumb size={36} />
          <RoomThumb size={44} />
          <RoomThumb size={52} />
          <RoomThumb size={64} />
        </div>
      </Section>
      <Section title="StatusBadge" desc="진행 중은 미표시. 종료/초안/숨김만 배지.">
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ padding: "4px 8px", background: T.color.bg.secondary, borderRadius: 6, fontSize: 12, color: T.color.text.hint }}>진행 중 = 배지 없음</div>
          <StatusBadge status="종료" />
          <StatusBadge status="초안" />
          <StatusBadge status="숨김" />
        </div>
      </Section>
    </div>
  );
}

function CardsTab() {
  return (
    <div>
      <Section title="BigIssueCard (피드용)" desc="큰 카드. 본문 3줄 + 이미지 + 대표 댓글 5줄. 하단 6px 구분선.">
        <div style={{ maxWidth: 375, border: `1px solid ${T.color.border.light}`, borderRadius: 12, overflow: "hidden" }}>
          <BigIssueCard room="테슬라 한국 실사용자 룸" title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격/체감이 핵심이라 봅니다" body="이번 FSD 도입 논의에서 가장 핵심적인 부분은 일정 자체가 아니라 가격 구조와 실제 체감 성능입니다. 특히 한국 도로 환경에서의 적용 가능성을..." repNick="@닉A" repComment="도입보다 과금 구조가 더 관건이라는 이야기가 많은데, 실제로 한국 시장에서 FSD 월정액 모델이 성립하려면 OTA 체감 품질이 먼저 올라와야 합니다." status="진행 중" comments={24} upvotes={47} views={312} hasImage={true} />
        </div>
      </Section>
      <Section title="CompactIssueCard (이슈 목록용)" desc="작은 카드. 스캔 중심. 1px 구분선.">
        <div style={{ maxWidth: 375, border: `1px solid ${T.color.border.light}`, borderRadius: 12, overflow: "hidden" }}>
          <CompactIssueCard room="나는 솔로 해석 룸" title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" repShort="@닉D 이건 호감보다 계산에 가까워 보입니다" status="진행 중" comments={28} upvotes={53} views={421} />
          <CompactIssueCard room="리벨북스 비문학 스터디" title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 주목" repShort="@닉E 오히려 이 대목이 더 중요합니다" status="종료" comments={18} upvotes={35} views={198} />
          <CompactIssueCard room="나는 솔로 해석 룸" title="최종 선택 결과 분석" opLine="" repShort="" status="진행 중" comments={45} upvotes={89} views={670} isSpoiler />
        </div>
      </Section>
    </div>
  );
}

function RoomTab() {
  return (
    <div>
      <Section title="SubscribedRoomBar (피드 상단)" desc="구독 룸 아바타 가로 나열 + 개수 표시.">
        <div style={{ maxWidth: 375, border: `1px solid ${T.color.border.light}`, borderRadius: 12, overflow: "hidden" }}>
          <SubscribedRoomBar />
        </div>
      </Section>
      <Section title="룸 상세 CTA 조합 예시" desc="멤버 모집 여부 × 역할에 따른 버튼 조합.">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><div style={{ fontSize: 12, color: T.color.text.hint, marginBottom: 4 }}>모집 중 + Visitor</div><div style={{ display: "flex", gap: 8 }}><CTAButton label="구독하기" fullWidth /><CTAButton label="멤버 신청" variant="outline" /></div></div>
          <div><div style={{ fontSize: 12, color: T.color.text.hint, marginBottom: 4 }}>모집 중 + Subscriber</div><div style={{ display: "flex", gap: 8 }}><CTAButton label="구독 중 ✓" variant="secondary" fullWidth /><CTAButton label="멤버 신청" variant="outline" /></div></div>
          <div><div style={{ fontSize: 12, color: T.color.text.hint, marginBottom: 4 }}>모집 중 + Member</div><div style={{ display: "flex", gap: 8 }}><CTAButton label="구독 중 ✓" variant="secondary" fullWidth /><CTAButton label="멤버 탈퇴" variant="ghost" /></div></div>
          <div><div style={{ fontSize: 12, color: T.color.text.hint, marginBottom: 4 }}>모집 안 함 + Visitor</div><div style={{ display: "flex", gap: 8 }}><CTAButton label="구독하기" fullWidth /></div></div>
          <div><div style={{ fontSize: 12, color: T.color.text.hint, marginBottom: 4 }}>Operator</div><div style={{ display: "flex", gap: 8 }}><CTAButton label="구독 중 ✓" variant="secondary" fullWidth /><CTAButton label="운영하기" variant="ghost" /></div></div>
        </div>
      </Section>
    </div>
  );
}

function CommentTab() {
  return (
    <div>
      <Section title="RepComment (대표 댓글)" desc="보라색 좌측 보더 + 배경. 이슈 카드와 이슈 상세에서 모두 사용.">
        <div style={{ maxWidth: 375 }}>
          <RepComment nick="@닉A" text="도입보다 과금 구조가 더 관건이라는 이야기가 많은데, 실제로 한국 시장에서 FSD 월정액 모델이 성립하려면 OTA 체감 품질이 먼저 올라와야 합니다." standalone />
        </div>
      </Section>
      <Section title="CommentThread (댓글 + 대댓글)" desc="업보트/답글/스크랩 액션. 대댓글은 들여쓰기 + 좌측 보더.">
        <div style={{ maxWidth: 375, border: `1px solid ${T.color.border.light}`, borderRadius: 12, overflow: "hidden" }}>
          <CommentThread nick="@닉C" text="나는 전략보다 감정이라고 봤는데, 편집 타이밍이 확실히 의도적이긴 합니다." upvotes={12} time="2시간 전" replies={[
            { nick: "@닉D", text: "동의합니다. 마지막 리액션 컷이 핵심인 것 같아요.", upvotes: 5, time: "1시간 전" },
            { nick: "@닉E", text: "그 리액션 컷이 오히려 미스리딩 아닌가요?", upvotes: 3, time: "45분 전" },
          ]} />
          <CommentThread nick="@닉F" text="편집보다는 출연자 본인의 선택이 더 크다고 봅니다." upvotes={8} time="3시간 전" replies={[]} />
        </div>
      </Section>
    </div>
  );
}

function OverlayTab() {
  return (
    <div>
      <Section title="Toast 변형" desc="success / error / info. 2초 자동 소멸.">
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 340 }}>
          <Toast message="구독이 완료되었습니다" variant="success" />
          <Toast message="오류가 발생했습니다" variant="error" />
          <Toast message="스크랩했습니다" variant="info" />
        </div>
      </Section>
      <Section title="확인 모달" desc="기본 / 위험 동작(빨간 확인 버튼).">
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Modal title="구독 해제" description="이 룸의 이슈가 피드에 더 이상 표시되지 않습니다." confirmLabel="해제" />
          <Modal title="멤버 제거" description="@닉A를 멤버에서 제거하시겠습니까? 댓글 작성 권한이 사라집니다." confirmLabel="제거" danger />
        </div>
      </Section>
      <Section title="바텀시트 — 신고" desc="신고 사유 선택 + 제출.">
        <div style={{ maxWidth: 375 }}>
          <BottomSheet title="신고하기"><ReportSheetContent /></BottomSheet>
        </div>
      </Section>
      <Section title="바텀시트 — 멤버 검색" desc="닉네임 검색 → 결과 → 추가.">
        <div style={{ maxWidth: 375 }}>
          <BottomSheet title="멤버 추가">
            <div style={{ marginBottom: 12 }}>
              <div style={{ height: 36, border: `1px solid ${T.color.border.medium}`, borderRadius: T.radius.lg, padding: "0 12px", display: "flex", alignItems: "center", fontSize: 13, color: T.color.text.hint }}>닉네임으로 검색...</div>
            </div>
            {["@닉A 콘텐츠를 맥락으로 읽는 사람", "@닉B 데이터로 세상을 봅니다"].map((u, i) => (
              <div key={i} style={{ padding: "10px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.color.border.light}` }}>
                <span style={{ fontSize: 14, color: T.color.text.primary }}>{u}</span>
                <CTAButton label="추가" size="sm" />
              </div>
            ))}
          </BottomSheet>
        </div>
      </Section>
    </div>
  );
}

function ProfileTab() {
  return (
    <div>
      <Section title="ProfileStats" desc="작성 댓글 / 받은 좋아요 / 대표 선정 / 구독 룸 4개 지표.">
        <div style={{ maxWidth: 340 }}>
          <ProfileStats stats={[{ label: "작성 댓글", val: 47 }, { label: "받은 좋아요", val: 312 }, { label: "대표 선정", val: 8 }, { label: "구독 룸", val: 3 }]} />
        </div>
      </Section>
      <Section title="MemberApplicationCard" desc="운영자가 보는 멤버 신청 카드. 승인/거절 CTA.">
        <div style={{ maxWidth: 340 }}>
          <MemberApplicationCard nick="@김해석" reason="이 룸의 관점이 마음에 들어서 같이 이야기하고 싶습니다. 나솔 시즌1부터 꾸준히 보고 있고, 편집 분석에 관심이 많습니다." time="3시간 전" />
          <MemberApplicationCard nick="@정분석" reason="콘텐츠 해석에 관심이 많아 참여하고 싶습니다." time="1일 전" />
        </div>
      </Section>
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================

export default function DesignSystem() {
  const [tab, setTab] = useState("tokens");
  const renderTab = () => {
    switch (tab) {
      case "tokens": return <TokensTab />;
      case "common": return <CommonTab />;
      case "cards": return <CardsTab />;
      case "room": return <RoomTab />;
      case "comment": return <CommentTab />;
      case "overlay": return <OverlayTab />;
      case "profile": return <ProfileTab />;
      default: return <TokensTab />;
    }
  };

  return (
    <div style={{ ...baseText, maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.color.brand.primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Design System & Component Library</div>
        <div style={{ fontSize: 13, color: T.color.text.hint }}>v6 와이어프레임 기준 · 디자이너 레퍼런스 + 개발 구현 코드</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20, padding: "12px 16px", background: T.color.bg.secondary, borderRadius: 12, border: `1px solid ${T.color.border.light}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "7px 14px", borderRadius: 8, border: tab === t.id ? `1.5px solid ${T.color.brand.primary}` : `1px solid ${T.color.border.medium}`, background: tab === t.id ? T.color.brand.light : "#fff", color: tab === t.id ? T.color.brand.primary : T.color.text.secondary, fontWeight: tab === t.id ? 600 : 400, fontSize: 13, cursor: "pointer", fontFamily: T.font.family }}>
            {t.label}
          </button>
        ))}
      </div>
      {renderTab()}
    </div>
  );
}
