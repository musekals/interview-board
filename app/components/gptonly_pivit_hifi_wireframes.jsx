'use client';

import { useState } from 'react';

const TOKENS = {
  color: {
    brand: '#DE0B55',
    brandDisabled: 'rgba(236, 33, 70, 0.26)',
    brandSubtle: 'rgba(236, 33, 70, 0.08)',
    title: '#171717',
    body: '#262626',
    subtle: '#525252',
    muted: '#737373',
    placeholder: '#B2B2B2',
    border: '#E0E0E0',
    borderSoft: '#EFEFEF',
    surface: '#FFFFFF',
    surfaceSubtle: '#F5F5F5',
    surfaceElevated: '#FAFAFA',
    neutral100: '#FAFAFA',
    neutral200: '#F5F5F5',
    neutral300: '#E5E5E5',
    neutral400: '#D4D4D4',
    success: '#0F6E56',
    successSubtle: 'rgba(15, 110, 86, 0.10)',
    warning: '#8A5308',
    warningSubtle: 'rgba(239, 159, 39, 0.14)',
    destructive: '#FF1414',
    destructiveSubtle: 'rgba(255, 20, 20, 0.08)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    focus: '#A1A1A1',
    kakao: '#FEE500',
    blackAlpha: 'rgba(0,0,0,0.85)',
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 999,
  },
  size: {
    header: 56,
    bottomNav: 64,
    input: 52,
    gutter: 16,
    cardPadding: 16,
  },
  shadow: {
    xs: '0 1px 2px rgba(23, 23, 23, 0.05)',
    sm: '0 4px 14px rgba(23, 23, 23, 0.06)',
    md: '0 10px 28px rgba(23, 23, 23, 0.10)',
    device: '0 28px 80px rgba(23, 23, 23, 0.16)',
  },
  font: "Pretendard Variable, Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, Helvetica Neue, Segoe UI, Apple SD Gothic Neo, Noto Sans KR, Malgun Gothic, sans-serif",
};

const SCREEN_GROUPS = [
  { key: 'user', label: '사용자 화면' },
  { key: 'operator', label: '운영자 화면' },
];

const SCREENS = [
  { id: 'feed', label: '내 피드', group: 'user', route: '/feed', nav: 'home' },
  { id: 'issues', label: '이슈 목록', group: 'user', route: '/issues', nav: 'issues' },
  { id: 'rooms', label: '룸 목록', group: 'user', route: '/rooms', nav: 'rooms' },
  { id: 'room', label: '룸 상세', group: 'user', route: '/rooms/:slug', nav: 'rooms' },
  { id: 'issue', label: '이슈 상세', group: 'user', route: '/rooms/:slug/issues/:id', nav: 'issues' },
  { id: 'mypage', label: '마이페이지', group: 'user', route: '/me', nav: 'mypage' },
  { id: 'profile', label: '프로필', group: 'user', route: '/users/:id', nav: 'mypage' },
  { id: 'room-settings', label: '룸 설정', group: 'operator', route: '/operator/rooms/:id/settings', nav: null },
  { id: 'issue-publish', label: '이슈 발행/수정', group: 'operator', route: '/operator/rooms/:id/issues/new', nav: null },
  { id: 'rep-comment', label: '대표 댓글 지정', group: 'operator', route: '/operator/issues/:id/comments', nav: null },
];

const STATES = {
  feed: ['기본', '구독 룸 없음(Empty)'],
  issues: ['기본', '스포일러 포함 이슈', '이슈 없음(Empty)'],
  rooms: ['Visitor', 'Subscriber'],
  room: ['멤버모집-Visitor', '멤버모집-Subscriber', '멤버모집-Member', '멤버모집-Operator', '모집안함-Visitor', '모집안함-Subscriber', '모집안함-Member', '모집안함-Operator'],
  issue: ['Visitor', 'Subscriber(구독만)', 'Member/Operator', '대표 댓글 없음'],
  mypage: ['룸 탭', '이슈 탭', '댓글 탭', '구독 없음(Empty)'],
  profile: ['내 프로필', '다른 사용자 프로필'],
  'room-settings': ['기본'],
  'issue-publish': ['새 이슈', '이슈 수정'],
  'rep-comment': ['기본'],
};

const SCREEN_NOTES = {
  feed: '브랜드 헤더 + 읽기 중심 카드 + 대표 댓글 시그니처 모듈로 재정의했습니다.',
  issues: '이슈 탐색은 compact row 위주로 정리하고, 스포일러는 절제된 경고만 남겼습니다.',
  rooms: '공개 룸은 콘텐츠 허브처럼 보이도록 타일과 CTA 우선순위를 정리했습니다.',
  room: '룸의 결을 먼저 보여주고, 역할에 따라 CTA와 콘텐츠 순서를 분기합니다.',
  issue: '본문-대표댓글-전체댓글 전환이 자연스럽도록 article 리듬을 강화했습니다.',
  mypage: '활동 아카이브와 룸 관계를 조용한 editorial tone으로 정리했습니다.',
  profile: '개인의 활동량보다 해석의 질감과 업적을 강조했습니다.',
  'room-settings': '운영자 화면도 소비자 화면과 동일한 card/input 시스템을 사용합니다.',
  'issue-publish': '글쓰기 폼과 발행 상태를 명확히 분리해 상용 편집기처럼 정리했습니다.',
  'rep-comment': '대표 댓글 1개만 관리하는 단순한 선별 UX로 재구성했습니다.',
};

const FEED_ROOMS = [
  { name: '나는 솔로 해석 룸', initial: '나', tone: 'rose' },
  { name: '테슬라 한국 실사용자 룸', initial: 'T', tone: 'warm' },
  { name: '리벨북스 비문학 스터디', initial: '리', tone: 'stone' },
  { name: '문화 소식 브리핑', initial: '문', tone: 'jade' },
];

const FEED_ISSUES = [
  {
    room: '테슬라 한국 실사용자 룸',
    label: '실사용 토론',
    coverTone: 'warm',
    title: 'FSD 한국 도입, 올해 안 가능할까?',
    thesis: '일정보다 가격 구조와 체감 품질을 중심으로 봐야 합니다.',
    body: '이번 논의의 핵심은 단순 도입 여부가 아니라 한국 도로 환경에서의 체감 성능, OTA 품질, 월정액 구조의 수용성입니다. 기술이 들어오더라도 가격과 체감이 맞지 않으면 논의는 오래가기 어렵습니다.',
    repNick: '@닉A',
    repText: '도입 그 자체보다 과금 구조가 먼저 납득되어야 한다는 점에 공감합니다. 실제 사용자는 기능 소개보다 “돈을 내고 쓸 만한가”를 먼저 판단할 겁니다.',
    comments: 24,
    upvotes: 47,
    views: 312,
    hasMedia: true,
    status: '진행 중',
  },
  {
    room: '나는 솔로 해석 룸',
    label: '장면 해석',
    coverTone: 'rose',
    title: '이번 선택, 진짜 의도였을까?',
    thesis: '감정보다 편집 포인트와 시선 배치를 함께 봐야 합니다.',
    body: '표면적인 대사보다 카메라가 누구를 오래 붙드는지, 리액션 컷이 어떻게 배치되는지가 훨씬 중요합니다. 이 장면은 출연자의 의도만이 아니라 제작진이 어떤 프레임을 만들고 싶은지까지 드러냅니다.',
    repNick: '@닉B',
    repText: '호감 표현이라기보다 “전략적으로 보이게 하는 편집”에 가깝습니다. 마지막 리액션 컷이 들어가는 순간 의미가 바뀌어요.',
    comments: 31,
    upvotes: 62,
    views: 487,
    hasMedia: true,
    status: '진행 중',
  },
  {
    room: '리벨북스 비문학 스터디',
    label: '독서 토론',
    coverTone: 'stone',
    title: '이번 장의 핵심 질문은 무엇인가',
    thesis: '저자의 결론보다 초반 질문 구조가 더 중요합니다.',
    body: '3장은 저자의 결론보다 문제를 세팅하는 방식에 더 큰 힘이 있습니다. 결국 이 장을 읽는 이유도 답을 얻기보다 어떤 질문을 반복하게 되는지 확인하는 데 있습니다.',
    repNick: '@닉E',
    repText: '결론 요약보다 초반 질문 구조를 붙잡아야 책 전체가 다르게 읽힙니다. 이 장이 책의 방향을 사실상 결정해요.',
    comments: 18,
    upvotes: 35,
    views: 198,
    hasMedia: false,
    status: '종료',
  },
];

const ISSUE_ROWS = [
  {
    room: '나는 솔로 해석 룸',
    label: '장면 해석',
    title: '이번 데이트 선택, 어떻게 읽히나',
    thesis: '감정보다 전략의 언어로 읽힙니다.',
    repText: '@닉D 이건 호감보다 계산에 가까워 보입니다.',
    comments: 28,
    upvotes: 53,
    views: 421,
    status: '진행 중',
  },
  {
    room: '리벨북스 비문학 스터디',
    label: '독서 토론',
    title: '이번 장의 핵심 질문은 무엇인가',
    thesis: '저자 결론보다 문제제기에 주목합니다.',
    repText: '@닉E 오히려 이 질문 구조가 더 중요합니다.',
    comments: 18,
    upvotes: 35,
    views: 198,
    status: '종료',
  },
  {
    room: '테슬라 한국 실사용자 룸',
    label: '실사용 토론',
    title: '올해 테슬라 가격 전략, 어떤 신호가 읽히나',
    thesis: '가격보다 포지셔닝 메시지가 중요합니다.',
    repText: '@닉F 국내에서는 할인 폭보다 포지셔닝 변화가 먼저 읽힙니다.',
    comments: 17,
    upvotes: 26,
    views: 177,
    status: '진행 중',
  },
  {
    room: '문화 소식 브리핑',
    label: '공지 해석',
    title: '이번 주 문화정책 발표, 어디를 봐야 하나',
    thesis: '예산 규모보다 배분 기준을 읽어야 합니다.',
    repText: '@닉G 문장보다 우선순위가 더 많은 걸 말해줍니다.',
    comments: 9,
    upvotes: 14,
    views: 103,
    status: '진행 중',
  },
];

const ROOMS_DATA = [
  {
    name: '나는 솔로 해석 룸',
    initial: '나',
    tone: 'rose',
    desc: '감정보다 맥락과 편집으로 봅니다.',
    category: '장면 해석',
    issues: 12,
    subs: 84,
    acceptMember: false,
  },
  {
    name: '테슬라 한국 실사용자 룸',
    initial: 'T',
    tone: 'warm',
    desc: '루머보다 해석, 드립보다 이유.',
    category: '실사용 토론',
    issues: 18,
    subs: 156,
    acceptMember: true,
  },
  {
    name: '리벨북스 비문학 스터디',
    initial: '리',
    tone: 'stone',
    desc: '저자의 질문을 함께 읽습니다.',
    category: '독서 토론',
    issues: 8,
    subs: 47,
    acceptMember: false,
  },
  {
    name: '문화 소식 브리핑',
    initial: '문',
    tone: 'jade',
    desc: '정책과 현장을 함께 정리합니다.',
    category: '공지 해석',
    issues: 5,
    subs: 33,
    acceptMember: true,
  },
];

const COMMENTS = [
  {
    nick: '@닉C',
    text: '전략으로만 보기엔 감정의 흔적이 남아 있다고 생각합니다. 다만 편집 타이밍이 일부러 오해를 키운 건 맞아 보여요.',
    upvotes: 12,
    time: '2시간 전',
    replies: [
      {
        nick: '@닉D',
        text: '동의합니다. 마지막 리액션 컷이 들어가는 순간 의미가 살짝 틀어집니다.',
        upvotes: 5,
        time: '1시간 전',
      },
    ],
  },
  {
    nick: '@닉F',
    text: '편집 포인트가 중요하긴 하지만 결국 출연자 본인의 선택이 더 크다고 봅니다.',
    upvotes: 8,
    time: '3시간 전',
    replies: [],
  },
  {
    nick: '@닉L',
    text: '이 장면이 화제가 된 건 단일 행동보다 이전 회차와의 연결 때문이라고 봅니다.',
    upvotes: 4,
    time: '5시간 전',
    replies: [],
  },
];

const REP_CANDIDATES = [
  {
    nick: '@닉B',
    text: '이번 건은 일정 자체보다 인프라 준비가 더 큰 변수라고 봅니다. 실제로 사용자가 체감하는 건 기능 도입 시점보다 품질과 가격입니다.',
    upvotes: 22,
    time: '2시간 전',
  },
  {
    nick: '@닉C',
    text: 'OTA 체감이 받쳐주지 않으면 월정액 모델은 오래 못 갑니다. 가격보다 만족도 회복이 먼저입니다.',
    upvotes: 18,
    time: '5시간 전',
  },
  {
    nick: '@닉D',
    text: '국내 가격 포지셔닝이 결국 핵심일 것 같습니다. 기대치를 너무 높이면 반작용도 큽니다.',
    upvotes: 13,
    time: '어제',
  },
];

const PROFILE_STATS = [
  { label: '작성 댓글', value: 47 },
  { label: '받은 좋아요', value: 312 },
  { label: '대표 선정', value: 8 },
  { label: '구독 룸', value: 3 },
];

const clamp = (lines) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

const buttonBase = {
  borderRadius: TOKENS.radius.md,
  height: TOKENS.size.input,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '0 18px',
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: '-0.01em',
  cursor: 'pointer',
  border: '1px solid transparent',
  boxSizing: 'border-box',
  transition: 'all .15s ease',
  whiteSpace: 'nowrap',
};

function Icon({ name, size = 20, color = 'currentColor', stroke = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: { flexShrink: 0 },
  };

  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9.5 20v-5h5v5" /></svg>;
    case 'layers':
      return <svg {...common}><path d="m12 3 8 4-8 4-8-4 8-4Z" /><path d="m4 12 8 4 8-4" /><path d="m4 17 8 4 8-4" /></svg>;
    case 'grid':
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
    case 'user':
      return <svg {...common}><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="4" /></svg>;
    case 'search':
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
    case 'bell':
      return <svg {...common}><path d="M15 17H5.8a1 1 0 0 1-.8-1.6c.7-1 1.3-2.5 1.3-4.4 0-3.1 1.8-5 4.7-5s4.7 1.9 4.7 5c0 1.9.6 3.4 1.3 4.4a1 1 0 0 1-.8 1.6H15" /><path d="M10 17a2 2 0 0 0 4 0" /></svg>;
    case 'menu':
      return <svg {...common}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></svg>;
    case 'arrow-left':
      return <svg {...common}><path d="M15 18 9 12l6-6" /></svg>;
    case 'share':
      return <svg {...common}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /></svg>;
    case 'more':
      return <svg {...common}><circle cx="6" cy="12" r="1.25" /><circle cx="12" cy="12" r="1.25" /><circle cx="18" cy="12" r="1.25" /></svg>;
    case 'chevron-right':
      return <svg {...common}><path d="m9 6 6 6-6 6" /></svg>;
    case 'heart':
      return <svg {...common}><path d="m12 20-1.1-1c-4.2-3.8-6.9-6.3-6.9-9.4A4.1 4.1 0 0 1 8.2 5a4.8 4.8 0 0 1 3.8 1.9A4.8 4.8 0 0 1 15.8 5 4.1 4.1 0 0 1 20 9.6c0 3.1-2.7 5.6-6.9 9.4L12 20Z" /></svg>;
    case 'bookmark':
      return <svg {...common}><path d="M6 4h12v16l-6-3-6 3V4Z" /></svg>;
    case 'flag':
      return <svg {...common}><path d="M5 21V5" /><path d="M5 5h9l-1.2 2.5L14 10H5" /></svg>;
    case 'message-square':
      return <svg {...common}><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>;
    case 'eye':
      return <svg {...common}><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'image':
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.2" /><path d="m21 16-5.3-5.3a1 1 0 0 0-1.4 0L8 17" /></svg>;
    case 'settings':
      return <svg {...common}><path d="m12 3 1.6 2.4 2.8.4.4 2.8L19 10l-1.6 2.4.4 2.8-2.8.4L12 18l-2.4-1.6-2.8.4-.4-2.8L5 10l1.6-2.4-.4-2.8 2.8-.4L12 3Z" /><circle cx="12" cy="10.5" r="3" /></svg>;
    case 'plus':
      return <svg {...common}><path d="M12 5v14" /><path d="M5 12h14" /></svg>;
    case 'users':
      return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="3.5" /><path d="M20 21v-2a4 4 0 0 0-3-3.85" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /></svg>;
    case 'sparkles':
      return <svg {...common}><path d="m12 3 1.1 3.3L16.5 7l-3.4.7L12 11l-1.1-3.3L7.5 7l3.4-.7L12 3Z" /><path d="m18 13 .6 1.8 1.9.4-1.9.4-.6 1.8-.6-1.8-1.9-.4 1.9-.4.6-1.8Z" /><path d="m6 14 .8 2.4 2.5.5-2.5.5L6 20l-.8-2.6-2.5-.5 2.5-.5L6 14Z" /></svg>;
    case 'filter':
      return <svg {...common}><path d="M3 5h18" /><path d="M6 12h12" /><path d="M10 19h4" /></svg>;
    case 'clock':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
    case 'check':
      return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
    case 'x':
      return <svg {...common}><path d="m18 6-12 12" /><path d="M6 6l12 12" /></svg>;
    case 'inbox':
      return <svg {...common}><path d="M4 4h16l-1.6 10H5.6L4 4Z" /><path d="M4.7 14h4.2a3 3 0 0 0 6.2 0h4.2" /><path d="M6 20h12" /></svg>;
    case 'upload':
      return <svg {...common}><path d="M12 16V6" /><path d="m7 10 5-5 5 5" /><rect x="4" y="16" width="16" height="4" rx="1" /></svg>;
    case 'edit':
      return <svg {...common}><path d="m4 20 4.5-1 9-9a1.8 1.8 0 0 0-2.5-2.5l-9 9L4 20Z" /><path d="m13.5 5.5 5 5" /></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="8" /></svg>;
  }
}

function Wordmark() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <div style={{ width: 14, height: 14, borderRadius: 999, background: TOKENS.color.brand, boxShadow: `0 0 0 6px ${TOKENS.color.brandSubtle}` }} />
      <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', color: TOKENS.color.title }}>PIVIT</span>
    </div>
  );
}

function softTone(tone) {
  switch (tone) {
    case 'brand':
      return { bg: TOKENS.color.brandSubtle, text: TOKENS.color.brand, border: 'transparent' };
    case 'success':
      return { bg: TOKENS.color.successSubtle, text: TOKENS.color.success, border: 'transparent' };
    case 'warning':
      return { bg: TOKENS.color.warningSubtle, text: TOKENS.color.warning, border: 'transparent' };
    case 'destructive':
      return { bg: TOKENS.color.destructiveSubtle, text: '#C51616', border: 'transparent' };
    case 'dark':
      return { bg: TOKENS.color.title, text: TOKENS.color.surface, border: 'transparent' };
    default:
      return { bg: TOKENS.color.surfaceSubtle, text: TOKENS.color.subtle, border: 'transparent' };
  }
}

function Badge({ tone = 'neutral', children, icon }) {
  const color = softTone(tone);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 24,
        padding: '0 10px',
        borderRadius: TOKENS.radius.full,
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
      }}
    >
      {icon ? <Icon name={icon} size={12} color={color.text} stroke={2} /> : null}
      {children}
    </span>
  );
}

function PlainButton({ children, variant = 'primary', style, leadingIcon, trailingIcon }) {
  let styles = {};
  if (variant === 'primary') {
    styles = { background: TOKENS.color.brand, color: TOKENS.color.surface };
  } else if (variant === 'secondary') {
    styles = { background: TOKENS.color.surfaceSubtle, color: TOKENS.color.body };
  } else if (variant === 'outline') {
    styles = { background: TOKENS.color.surface, color: TOKENS.color.brand, borderColor: TOKENS.color.brand };
  } else if (variant === 'destructive-outline') {
    styles = { background: TOKENS.color.surface, color: TOKENS.color.destructive, borderColor: TOKENS.color.destructive };
  } else if (variant === 'dark') {
    styles = { background: TOKENS.color.title, color: TOKENS.color.surface };
  } else if (variant === 'kakao') {
    styles = { background: TOKENS.color.kakao, color: TOKENS.color.blackAlpha };
  } else {
    styles = { background: 'transparent', color: TOKENS.color.subtle, borderColor: 'transparent' };
  }

  return (
    <button type="button" style={{ ...buttonBase, ...styles, ...style }}>
      {leadingIcon ? <Icon name={leadingIcon} size={18} color="currentColor" /> : null}
      <span>{children}</span>
      {trailingIcon ? <Icon name={trailingIcon} size={16} color="currentColor" /> : null}
    </button>
  );
}

function IconButton({ icon, tone = 'neutral', size = 36 }) {
  const palette = tone === 'brand'
    ? { bg: TOKENS.color.brandSubtle, color: TOKENS.color.brand }
    : { bg: TOKENS.color.surfaceSubtle, color: TOKENS.color.subtle };

  return (
    <button
      type="button"
      style={{
        width: size,
        height: size,
        borderRadius: TOKENS.radius.full,
        border: '1px solid transparent',
        background: palette.bg,
        color: palette.color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <Icon name={icon} size={18} color="currentColor" />
    </button>
  );
}

function SurfaceCard({ children, style }) {
  return (
    <div
      style={{
        background: TOKENS.color.surface,
        border: `1px solid ${TOKENS.color.border}`,
        borderRadius: TOKENS.radius.lg,
        boxShadow: TOKENS.shadow.xs,
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CoverArt({ tone = 'rose', label, height = 176, compact = false }) {
  const toneMap = {
    rose: ['#FCE7F1', '#F8BBD1', '#DE0B55'],
    warm: ['#FFF3E6', '#F9D3A9', '#8A5308'],
    stone: ['#F3F2EF', '#D7D3CD', '#525252'],
    jade: ['#EAF6F2', '#BFE3D6', '#0F6E56'],
  };
  const [a, b, c] = toneMap[tone] || toneMap.rose;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: compact ? 12 : 14,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${a} 0%, ${b} 55%, ${TOKENS.color.surface} 100%)`,
      }}
    >
      <div style={{ position: 'absolute', top: -36, right: -24, width: 132, height: 132, borderRadius: 999, background: `${c}18` }} />
      <div style={{ position: 'absolute', bottom: -30, left: -22, width: 120, height: 120, borderRadius: 26, background: `${TOKENS.color.surface}80`, transform: 'rotate(18deg)' }} />
      <div style={{ position: 'absolute', inset: 0, padding: compact ? 14 : 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '4px 10px', borderRadius: TOKENS.radius.full, background: TOKENS.color.surface, color: c, fontSize: 12, fontWeight: 700 }}>
          {label || 'Editorial cover'}
        </div>
        <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between' }}>
          <div style={{ fontSize: compact ? 24 : 34, fontWeight: 800, color: TOKENS.color.title, letterSpacing: '-0.03em' }}>P</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: `${c}66` }} />
            <span style={{ width: 10, height: 10, borderRadius: 999, background: `${c}44` }} />
            <span style={{ width: 10, height: 10, borderRadius: 999, background: `${c}22` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomThumb({ initial = 'P', size = 44, tone = 'rose', square = false }) {
  const toneMap = {
    rose: ['#FCE7F1', TOKENS.color.brand],
    warm: ['#FFF3E6', '#8A5308'],
    stone: ['#F3F2EF', TOKENS.color.subtle],
    jade: ['#EAF6F2', TOKENS.color.success],
  };
  const [bg, fg] = toneMap[tone] || toneMap.rose;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: square ? 14 : Math.min(16, Math.floor(size * 0.34)),
        background: `linear-gradient(135deg, ${bg}, ${TOKENS.color.surface})`,
        color: fg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.max(14, Math.floor(size * 0.34)),
        fontWeight: 800,
        letterSpacing: '-0.03em',
        border: `1px solid ${TOKENS.color.border}`,
        flexShrink: 0,
        boxSizing: 'border-box',
      }}
    >
      {initial}
    </div>
  );
}

function MetaInline({ comments, upvotes, views, date }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, color: TOKENS.color.muted, fontSize: 12 }}>
      {date ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="clock" size={13} color="currentColor" />{date}</span> : null}
      {upvotes !== undefined ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={13} color="currentColor" />{upvotes}</span> : null}
      {comments !== undefined ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="message-square" size={13} color="currentColor" />{comments}</span> : null}
      {views !== undefined ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="eye" size={13} color="currentColor" />{views}</span> : null}
    </div>
  );
}

function RepresentativeCommentCard({ nick, text, compact = false }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: compact ? 14 : 16,
        borderRadius: 12,
        background: TOKENS.color.brandSubtle,
        border: `1px solid rgba(222, 11, 85, 0.12)`,
      }}
    >
      <div style={{ width: 3, borderRadius: 999, background: TOKENS.color.brand, flexShrink: 0 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: TOKENS.color.brand }}>{nick}</span>
          <Badge tone="brand">대표 댓글</Badge>
        </div>
        <div style={{ fontSize: compact ? 13 : 14, lineHeight: 1.65, color: TOKENS.color.title, ...clamp(compact ? 3 : 5) }}>
          {text}
        </div>
      </div>
    </div>
  );
}

function FeaturedIssueCard({ item }) {
  return (
    <SurfaceCard style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <RoomThumb initial={item.room.slice(0, 1)} size={28} tone={item.coverTone} square />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.color.brand }}>{item.label}</div>
            <div style={{ fontSize: 12, color: TOKENS.color.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{item.room}</div>
          </div>
        </div>
        {item.status === '종료' ? <Badge>종료</Badge> : <Badge tone="brand">진행 중</Badge>}
      </div>
      <div style={{ fontSize: 22, lineHeight: 1.3, fontWeight: 800, letterSpacing: '-0.03em', color: TOKENS.color.title, marginBottom: 10, ...clamp(2) }}>
        {item.title}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: TOKENS.color.muted, marginTop: 2 }}>운영자 한 줄</span>
        <p style={{ fontSize: 13, color: TOKENS.color.subtle, margin: 0, lineHeight: 1.55, fontWeight: 500 }}>{item.thesis}</p>
      </div>
      <p style={{ fontSize: 15, color: TOKENS.color.body, lineHeight: 1.7, margin: 0, marginBottom: 14, ...clamp(3) }}>{item.body}</p>
      {item.hasMedia ? <div style={{ marginBottom: 14 }}><CoverArt tone={item.coverTone} label={item.label} height={176} /></div> : null}
      <RepresentativeCommentCard nick={item.repNick} text={item.repText} />
      <div style={{ height: 14 }} />
      <MetaInline comments={item.comments} upvotes={item.upvotes} views={item.views} />
    </SurfaceCard>
  );
}

function IssueRow({ item, spoiler = false }) {
  return (
    <div style={{ padding: '16px 16px 14px', borderBottom: `1px solid ${TOKENS.color.borderSoft}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.color.brand }}>{item.label}</span>
        <span style={{ width: 4, height: 4, borderRadius: 999, background: TOKENS.color.border }} />
        <span style={{ fontSize: 12, color: TOKENS.color.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.room}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ fontSize: 16, lineHeight: 1.45, fontWeight: 700, color: TOKENS.color.title, flex: 1, ...clamp(2) }}>{item.title}</div>
        {spoiler ? <Badge tone="destructive">스포일러</Badge> : item.status === '종료' ? <Badge>종료</Badge> : null}
      </div>
      {spoiler ? (
        <div style={{ padding: '12px 14px', borderRadius: 12, background: TOKENS.color.surfaceSubtle, border: `1px dashed ${TOKENS.color.border}` }}>
          <div style={{ fontSize: 13, color: TOKENS.color.muted, lineHeight: 1.6 }}>미리보기는 숨겨져 있습니다. 탭하여 내용을 확인하세요.</div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, color: TOKENS.color.subtle, lineHeight: 1.55, marginBottom: 6 }}>{item.thesis}</div>
          <div style={{ fontSize: 13, color: TOKENS.color.body, lineHeight: 1.55, marginBottom: 10, ...clamp(1) }}>{item.repText}</div>
        </>
      )}
      <MetaInline comments={item.comments} upvotes={item.upvotes} views={item.views} />
    </div>
  );
}

function RoomDiscoveryCard({ room, subscribed = false }) {
  return (
    <SurfaceCard style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <RoomThumb initial={room.initial} size={56} tone={room.tone} square />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <Badge tone="neutral">{room.category}</Badge>
            {room.acceptMember ? <Badge tone="success">멤버 모집 중</Badge> : null}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: TOKENS.color.title, lineHeight: 1.35, marginBottom: 6 }}>{room.name}</div>
          <div style={{ fontSize: 14, color: TOKENS.color.subtle, lineHeight: 1.6, marginBottom: 10 }}>{room.desc}</div>
          <div style={{ fontSize: 12, color: TOKENS.color.muted, marginBottom: 14 }}>이슈 {room.issues}개 · 구독자 {room.subs}명</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <PlainButton variant={subscribed ? 'secondary' : 'primary'} style={{ flex: 1, minWidth: 120 }}>
              {subscribed ? '구독 중' : '구독하기'}
            </PlainButton>
            {room.acceptMember ? <PlainButton variant="outline" style={{ minWidth: 112 }}>멤버 신청</PlainButton> : null}
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}

function CommentCard({ comment, isRepresentative = false, depth = 0 }) {
  return (
    <div style={{ marginLeft: depth ? 20 : 0, padding: depth ? '14px 0 0 16px' : '16px 0', borderLeft: depth ? `2px solid ${TOKENS.color.borderSoft}` : 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: TOKENS.color.body }}>{comment.nick}</span>
          {isRepresentative ? <Badge tone="brand">대표</Badge> : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: TOKENS.color.muted, fontSize: 12 }}>
          <span>{comment.time}</span>
          <Icon name="more" size={16} color="currentColor" />
        </div>
      </div>
      <div style={{ fontSize: 14, color: TOKENS.color.body, lineHeight: 1.7, marginBottom: 10 }}>{comment.text}</div>
      <div style={{ display: 'flex', gap: 14, color: TOKENS.color.muted, fontSize: 12, alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={13} color="currentColor" />{comment.upvotes}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="message-square" size={13} color="currentColor" />답글</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="bookmark" size={13} color="currentColor" />스크랩</span>
      </div>
      {comment.replies && comment.replies.length > 0 ? (
        <div style={{ marginTop: 12 }}>
          {comment.replies.map((reply, index) => (
            <div key={`${reply.nick}-${index}`} style={{ borderTop: index === 0 ? `1px solid ${TOKENS.color.borderSoft}` : 'none' }}>
              <CommentCard comment={reply} depth={1} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Segmented({ options, active }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`, gap: 8 }}>
      {options.map((option) => {
        const selected = option.value === active;
        return (
          <div
            key={option.value}
            style={{
              minHeight: 48,
              padding: '0 12px',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              border: `1px solid ${selected ? (option.tone === 'success' ? TOKENS.color.success : option.tone === 'warning' ? TOKENS.color.warning : option.tone === 'destructive' ? TOKENS.color.destructive : TOKENS.color.brand) : TOKENS.color.border}`,
              background: selected
                ? option.tone === 'success'
                  ? TOKENS.color.successSubtle
                  : option.tone === 'warning'
                    ? TOKENS.color.warningSubtle
                    : option.tone === 'destructive'
                      ? TOKENS.color.destructiveSubtle
                      : TOKENS.color.brandSubtle
                : TOKENS.color.surface,
              color: selected
                ? option.tone === 'success'
                  ? TOKENS.color.success
                  : option.tone === 'warning'
                    ? TOKENS.color.warning
                    : option.tone === 'destructive'
                      ? TOKENS.color.destructive
                      : TOKENS.color.brand
                : TOKENS.color.subtle,
              fontSize: 13,
              fontWeight: 700,
              lineHeight: 1.4,
              boxSizing: 'border-box',
            }}
          >
            {option.label}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value, placeholder, multiline = false, helper, action }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: TOKENS.color.muted }}>{label}</span>
        {action ? <span style={{ fontSize: 12, color: TOKENS.color.brand, fontWeight: 600 }}>{action}</span> : null}
      </div>
      <div
        style={{
          minHeight: multiline ? 120 : TOKENS.size.input,
          borderRadius: 12,
          border: `1px solid ${TOKENS.color.border}`,
          background: TOKENS.color.surface,
          padding: multiline ? '14px 14px' : '0 14px',
          display: 'flex',
          alignItems: multiline ? 'flex-start' : 'center',
          boxSizing: 'border-box',
          fontSize: 15,
          color: value ? TOKENS.color.body : TOKENS.color.placeholder,
          lineHeight: multiline ? 1.65 : 1.4,
        }}
      >
        {value || placeholder}
      </div>
      {helper ? <div style={{ marginTop: 8, fontSize: 12, color: TOKENS.color.muted, lineHeight: 1.55 }}>{helper}</div> : null}
    </div>
  );
}

function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: TOKENS.color.title, letterSpacing: '-0.02em' }}>{title}</div>
      {action ? <button type="button" style={{ background: 'transparent', border: 'none', color: TOKENS.color.brand, fontWeight: 700, fontSize: 13, padding: 0, cursor: 'pointer' }}>{action}</button> : null}
    </div>
  );
}

function EmptyState({ icon = 'inbox', title, body, action }) {
  return (
    <div style={{ padding: '72px 28px 40px', textAlign: 'center' }}>
      <div style={{ width: 72, height: 72, margin: '0 auto 18px', borderRadius: 999, background: TOKENS.color.surfaceSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', color: TOKENS.color.brand }}>
        <Icon name={icon} size={28} color="currentColor" />
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: TOKENS.color.title, letterSpacing: '-0.03em', marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 14, color: TOKENS.color.muted, lineHeight: 1.7, marginBottom: 20 }}>{body}</div>
      {action ? <PlainButton>{action}</PlainButton> : null}
    </div>
  );
}

function StatusBar() {
  return (
    <div style={{ height: 32, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: TOKENS.color.title, background: TOKENS.color.surface }}>
      <span>9:41</span>
      <div style={{ width: 74, height: 6, borderRadius: 999, background: TOKENS.color.title, opacity: 0.9 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 14, height: 10, border: `1.5px solid ${TOKENS.color.title}`, borderRadius: 2, position: 'relative', display: 'inline-block' }}><span style={{ position: 'absolute', top: 1, bottom: 1, left: 1, right: 4, background: TOKENS.color.title, borderRadius: 1 }} /></span>
      </div>
    </div>
  );
}

function BottomNav({ active }) {
  const items = [
    { key: 'home', label: '피드', icon: 'home' },
    { key: 'issues', label: '이슈', icon: 'layers' },
    { key: 'rooms', label: '룸', icon: 'grid' },
    { key: 'mypage', label: '마이', icon: 'user' },
  ];
  return (
    <div style={{ height: TOKENS.size.bottomNav, borderTop: `1px solid ${TOKENS.color.border}`, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'stretch' }}>
      {items.map((item) => {
        const selected = item.key === active;
        return (
          <div key={item.key} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: selected ? TOKENS.color.brand : TOKENS.color.muted, fontSize: 11, fontWeight: selected ? 700 : 600, width: '100%' }}>
              <Icon name={item.icon} size={20} color="currentColor" />
              <span>{item.label}</span>
              <span style={{ width: 18, height: 2, borderRadius: 999, background: selected ? TOKENS.color.brand : 'transparent' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PhoneChrome({ children, navKey, showBottomNav = true, footer, footerOffset = 0 }) {
  const footerPadding = footer ? 96 + footerOffset : 32;
  return (
    <div style={{ width: 390, height: 844, borderRadius: 36, background: TOKENS.color.surface, border: '1px solid #D8D8D8', overflow: 'hidden', boxShadow: TOKENS.shadow.device, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: TOKENS.color.surface }}>
        <div style={{ height: '100%', overflowY: 'auto', paddingBottom: showBottomNav ? footerPadding + TOKENS.size.bottomNav : footerPadding }}>{children}</div>
        {footer ? (
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: showBottomNav ? TOKENS.size.bottomNav + footerOffset : footerOffset, background: 'rgba(255,255,255,0.98)', backdropFilter: 'blur(14px)', borderTop: `1px solid ${TOKENS.color.border}` }}>
            {footer}
          </div>
        ) : null}
      </div>
      {showBottomNav ? <BottomNav active={navKey} /> : null}
    </div>
  );
}

function TopBar({ left, center, right, border = true, sticky = true }) {
  return (
    <div style={{ position: sticky ? 'sticky' : 'relative', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(14px)', borderBottom: border ? `1px solid ${TOKENS.color.border}` : 'none' }}>
      <div style={{ height: TOKENS.size.header, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>{left}</div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>{center}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, minWidth: 72 }}>{right}</div>
      </div>
    </div>
  );
}

function BrandHeader() {
  return <TopBar left={<Wordmark />} right={<><IconButton icon="search" /><IconButton icon="bell" /><IconButton icon="user" tone="brand" /></>} />;
}

function TitleHeader({ title, rightIcons = ['search'] }) {
  return (
    <TopBar
      left={<span style={{ fontSize: 20, fontWeight: 800, color: TOKENS.color.title, letterSpacing: '-0.03em' }}>{title}</span>}
      right={
        <>
          {rightIcons.map((icon) => <IconButton key={icon} icon={icon} />)}
        </>
      }
    />
  );
}

function BackHeader({ title, rightIcons = ['share', 'more'], rightLabel }) {
  return (
    <TopBar
      left={<><IconButton icon="arrow-left" /><span style={{ fontSize: 18, fontWeight: 800, color: TOKENS.color.title, letterSpacing: '-0.02em' }}>{title}</span></>}
      right={rightLabel ? <span style={{ color: TOKENS.color.brand, fontSize: 13, fontWeight: 700 }}>{rightLabel}</span> : <>{rightIcons.map((icon) => <IconButton key={icon} icon={icon} />)}</>}
    />
  );
}

function IntroBlock({ title, body, accent }) {
  return (
    <div style={{ padding: '20px 16px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {accent ? <Badge tone="brand">{accent}</Badge> : null}
        <div style={{ fontSize: 12, color: TOKENS.color.muted, fontWeight: 700 }}>COMMUNITY EDITORIAL</div>
      </div>
      <div style={{ fontSize: 28, lineHeight: 1.2, fontWeight: 800, letterSpacing: '-0.04em', color: TOKENS.color.title, marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 14, lineHeight: 1.7, color: TOKENS.color.muted }}>{body}</div>
    </div>
  );
}

function RoomRail() {
  return (
    <div style={{ padding: '0 16px 18px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 12, width: 'max-content' }}>
        {FEED_ROOMS.map((room) => (
          <div key={room.name} style={{ width: 86, flexShrink: 0 }}>
            <div style={{ marginBottom: 8 }}>
              <RoomThumb initial={room.initial} size={60} tone={room.tone} square />
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.45, color: TOKENS.color.body, fontWeight: 700, ...clamp(2) }}>{room.name}</div>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 26 }}>
          <button type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: TOKENS.radius.full, border: `1px solid ${TOKENS.color.border}`, background: TOKENS.color.surface, color: TOKENS.color.subtle, fontWeight: 700, cursor: 'pointer' }}>
            전체 룸 보기
            <Icon name="chevron-right" size={14} color="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function PivitFeedPage({ state = '기본' }) {
  const isEmpty = state === '구독 룸 없음(Empty)';
  return (
    <PhoneChrome navKey="home">
      <BrandHeader />
      {isEmpty ? (
        <>
          <IntroBlock title="아직 구독한 룸이 없습니다" body="관심 있는 룸을 구독하면 이슈와 대표 댓글이 여기에 모입니다. 처음엔 몇 개의 룸만 골라도 충분합니다." accent="시작하기" />
          <EmptyState title="비어 있는 피드" body="읽고 싶은 주제가 담긴 룸을 구독해보세요. 최신 논점과 좋은 반응이 자동으로 모입니다." action="룸 둘러보기" />
        </>
      ) : (
        <>
          <IntroBlock title="내 피드" body="구독 중인 룸의 대표 논점과 좋은 반응을 먼저 읽을 수 있도록 정리했습니다." accent="For you" />
          <RoomRail />
          <div style={{ padding: '0 16px 24px', display: 'grid', gap: 16 }}>
            {FEED_ISSUES.map((item) => <FeaturedIssueCard key={item.title} item={item} />)}
          </div>
        </>
      )}
    </PhoneChrome>
  );
}

export function PivitIssuesPage({ state = '기본' }) {
  const isEmpty = state === '이슈 없음(Empty)';
  const hasSpoiler = state === '스포일러 포함 이슈';
  return (
    <PhoneChrome navKey="issues">
      <TitleHeader title="최신 이슈" rightIcons={['filter', 'search']} />
      <div style={{ padding: '18px 16px 14px' }}>
        <SurfaceCard style={{ padding: 14, background: TOKENS.color.surfaceSubtle, borderColor: TOKENS.color.surfaceSubtle, boxShadow: 'none' }}>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: TOKENS.color.subtle }}>대표 댓글이 지정된 이슈를 우선 보여줍니다. 진행 중 / 종료 / 스포일러 상태를 빠르게 나눠볼 수 있습니다.</div>
        </SurfaceCard>
      </div>
      <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        <Badge tone="dark">전체</Badge>
        <Badge>진행 중</Badge>
        <Badge>종료</Badge>
        <Badge tone="destructive">스포일러 포함</Badge>
      </div>
      {isEmpty ? (
        <EmptyState title="아직 공개된 이슈가 없습니다" body="이 룸에서는 아직 읽을 수 있는 이슈가 없습니다. 조금 뒤 다시 확인하거나 다른 룸을 둘러보세요." action="공개 룸 보기" />
      ) : (
        <SurfaceCard style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderBottom: 'none', boxShadow: 'none' }}>
          <IssueRow item={ISSUE_ROWS[0]} />
          {hasSpoiler ? <IssueRow item={{ ...ISSUE_ROWS[0], title: '최종 선택 결과 분석', room: '나는 솔로 해석 룸', repText: '', views: 670, comments: 45, upvotes: 89 }} spoiler /> : null}
          {ISSUE_ROWS.slice(1).map((item) => <IssueRow key={item.title} item={item} />)}
        </SurfaceCard>
      )}
    </PhoneChrome>
  );
}

export function PivitRoomsPage({ state = 'Visitor' }) {
  const subscribed = state === 'Subscriber';
  return (
    <PhoneChrome navKey="rooms">
      <TitleHeader title="공개 룸" rightIcons={['search']} />
      <div style={{ padding: '18px 16px 16px' }}>
        <SurfaceCard style={{ padding: 18, background: TOKENS.color.surfaceSubtle, borderColor: TOKENS.color.surfaceSubtle, boxShadow: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: TOKENS.color.brandSubtle, color: TOKENS.color.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkles" size={18} color="currentColor" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: TOKENS.color.title, letterSpacing: '-0.02em' }}>결이 맞는 룸을 찾으세요</div>
          </div>
          <div style={{ fontSize: 14, color: TOKENS.color.subtle, lineHeight: 1.65 }}>작품, 논점, 운영 방식이 분명한 룸만 골라두었습니다. 구독한 뒤 멤버로 더 깊게 참여할 수도 있습니다.</div>
        </SurfaceCard>
      </div>
      <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        <Badge tone="dark">전체</Badge>
        <Badge>작품 채널</Badge>
        <Badge>운영 소통 및 건의</Badge>
        <Badge>문화 소식</Badge>
      </div>
      <div style={{ padding: '0 16px 24px', display: 'grid', gap: 14 }}>
        {ROOMS_DATA.map((room) => <RoomDiscoveryCard key={room.name} room={room} subscribed={subscribed} />)}
      </div>
    </PhoneChrome>
  );
}

export function PivitRoomPage({ state = '멤버모집-Visitor' }) {
  const [membership, role] = state.split('-');
  const acceptMember = membership === '멤버모집';
  const isVisitor = role === 'Visitor';
  const isMember = role === 'Member';
  const isOperator = role === 'Operator';

  const primaryButton = isVisitor ? '구독하기' : '구독 중';
  const secondaryVariant = isVisitor ? 'primary' : 'secondary';

  return (
    <PhoneChrome navKey="rooms">
      <BackHeader title="룸 상세" />
      <div style={{ padding: '20px 16px 0' }}>
        <SurfaceCard style={{ padding: 18 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
            <RoomThumb initial="나" size={72} tone="rose" square />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <Badge tone="brand">장면 해석</Badge>
                {acceptMember ? <Badge tone="success">멤버 모집 중</Badge> : null}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.03em', color: TOKENS.color.title, marginBottom: 6 }}>나는 솔로 해석 룸</div>
              <div style={{ fontSize: 14, color: TOKENS.color.subtle, lineHeight: 1.6, marginBottom: 10 }}>감정보다 맥락과 편집으로 봅니다.</div>
              <div style={{ fontSize: 12, color: TOKENS.color.muted }}>구독자 84명 · 최근 이슈 12개</div>
            </div>
          </div>

          {isMember ? (
            <div style={{ padding: '12px 14px', borderRadius: 12, background: TOKENS.color.surfaceSubtle, border: `1px solid ${TOKENS.color.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.color.title, marginBottom: 2 }}>이 룸은 이렇게 봅니다</div>
                <div style={{ fontSize: 12, color: TOKENS.color.muted }}>요약된 운영 원칙 보기</div>
              </div>
              <Icon name="chevron-right" size={16} color={TOKENS.color.muted} />
            </div>
          ) : (
            <div style={{ padding: 16, borderRadius: 14, background: TOKENS.color.surfaceSubtle, border: `1px solid ${TOKENS.color.borderSoft}`, marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.color.muted, marginBottom: 10 }}>이 룸은 이렇게 봅니다</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {['장면의 의도와 편집 포인트를 함께 봅니다.', '한 줄 반응보다 이유가 있는 댓글을 중시합니다.', '감정 표현도 좋지만 논거를 남기는 태도를 우선합니다.'].map((text) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: TOKENS.color.brand, marginTop: 8, flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: TOKENS.color.body, lineHeight: 1.65 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <PlainButton variant={secondaryVariant} style={{ flex: 1 }}>{primaryButton}</PlainButton>
            {acceptMember && !isMember && !isOperator ? <PlainButton variant="outline" style={{ flex: 1 }}>멤버 신청</PlainButton> : null}
            {isMember ? <PlainButton variant="destructive-outline" style={{ flex: 1 }}>멤버 탈퇴</PlainButton> : null}
            {isOperator ? <PlainButton variant="dark" style={{ flex: 1 }}>운영하기</PlainButton> : null}
          </div>
        </SurfaceCard>
      </div>

      {isMember ? (
        <div style={{ padding: '12px 16px 0' }}>
          <SurfaceCard style={{ padding: '14px 16px', background: TOKENS.color.surfaceSubtle, borderColor: TOKENS.color.surfaceSubtle, boxShadow: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TOKENS.color.title, marginBottom: 4 }}>운영자에게 건의 / 제보</div>
                <div style={{ fontSize: 12, color: TOKENS.color.muted }}>룸 운영과 관련된 제안을 조용히 남길 수 있습니다.</div>
              </div>
              <button type="button" style={{ background: 'transparent', border: 'none', color: TOKENS.color.brand, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>보내기</button>
            </div>
          </SurfaceCard>
        </div>
      ) : null}

      <div style={{ padding: '20px 16px 24px', display: 'grid', gap: 20 }}>
        {isMember ? (
          <>
            <div>
              <SectionHeader title="참여 가능한 이슈" />
              <SurfaceCard style={{ overflow: 'hidden' }}>
                <IssueRow item={{ ...ISSUE_ROWS[0], repText: '아직 대표 댓글이 없습니다. 첫 댓글을 남겨보세요.' }} />
                <IssueRow item={{ ...ISSUE_ROWS[2], title: '이번 회차의 진짜 전환점은 어디였나', room: '나는 솔로 해석 룸', label: '장면 해석', repText: '@닉A 이건 대사보다 연출 의도를 붙잡아야 합니다.' }} />
              </SurfaceCard>
            </div>
            <div>
              <SectionHeader title="지난 이슈" />
              <SurfaceCard style={{ overflow: 'hidden' }}>
                <IssueRow item={{ ...ISSUE_ROWS[1], title: '지난 회차, 가장 갈린 장면은?', room: '나는 솔로 해석 룸', label: '장면 해석', repText: '@닉C 그 장면은 연출 의도가 더 강하게 읽힙니다.' }} />
              </SurfaceCard>
            </div>
          </>
        ) : (
          <>
            <div>
              <SectionHeader title="대표 이슈" />
              <FeaturedIssueCard item={{ ...FEED_ISSUES[1], hasMedia: false, title: '이번 회차의 진짜 전환점은 어디였나', thesis: '말보다 침묵의 장면이 핵심입니다.', repText: '@닉A 이건 대사보다 연출 의도를 붙잡아야 합니다.' }} />
            </div>
            <div>
              <SectionHeader title="최신 이슈" />
              <SurfaceCard style={{ overflow: 'hidden' }}>
                <IssueRow item={ISSUE_ROWS[0]} />
                <IssueRow item={{ ...ISSUE_ROWS[1], title: '지난 회차, 가장 갈린 장면은?', room: '나는 솔로 해석 룸', label: '장면 해석', repText: '@닉C 그 장면은 연출 의도가 더 강하게 읽힙니다.' }} />
              </SurfaceCard>
            </div>
          </>
        )}
      </div>
    </PhoneChrome>
  );
}

export function PivitIssuePage({ state = 'Member/Operator' }) {
  const canComment = state === 'Member/Operator';
  const subscriberOnly = state === 'Subscriber(구독만)';
  const noRep = state === '대표 댓글 없음';
  const [sort, setSort] = useState('popular');

  const footer = canComment ? (
    <div style={{ padding: '12px 16px 14px' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, minHeight: TOKENS.size.input, borderRadius: 12, border: `1px solid ${TOKENS.color.border}`, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 15, color: TOKENS.color.placeholder }}>댓글을 입력하세요…</div>
        <button type="button" style={{ width: TOKENS.size.input, height: TOKENS.size.input, borderRadius: 12, border: `1px solid ${TOKENS.color.border}`, background: TOKENS.color.surface, color: TOKENS.color.subtle, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="image" size={20} color="currentColor" /></button>
        <PlainButton style={{ minWidth: 84 }}>작성</PlainButton>
      </div>
    </div>
  ) : (
    <div style={{ padding: '16px' }}>
      <SurfaceCard style={{ padding: 16, background: TOKENS.color.surfaceSubtle, borderColor: TOKENS.color.surfaceSubtle, boxShadow: 'none' }}>
        <div style={{ fontSize: 13, color: TOKENS.color.muted, lineHeight: 1.6, marginBottom: 12, textAlign: 'center' }}>댓글은 멤버만 작성할 수 있습니다.</div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <PlainButton>{subscriberOnly ? '댓글 멤버 신청하기' : '이 룸 구독하러 가기'}</PlainButton>
        </div>
      </SurfaceCard>
    </div>
  );

  return (
    <PhoneChrome navKey="issues" footer={footer}>
      <BackHeader title="이슈 상세" />
      <div style={{ padding: '18px 16px 24px' }}>
        <div style={{ marginBottom: 12 }}><Badge tone="brand">나는 솔로 해석 룸</Badge></div>
        <div style={{ fontSize: 28, lineHeight: 1.18, fontWeight: 800, letterSpacing: '-0.04em', color: TOKENS.color.title, marginBottom: 12 }}>이번 데이트 선택, 어떻게 읽히나</div>
        <MetaInline date="2025.03.15" comments={28} views={421} upvotes={53} />
        <div style={{ height: 16 }} />

        <SurfaceCard style={{ padding: 16, background: TOKENS.color.surfaceSubtle, borderColor: TOKENS.color.surfaceSubtle, boxShadow: 'none', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.color.muted, marginBottom: 8 }}>운영자 한 줄</div>
          <div style={{ fontSize: 14, lineHeight: 1.65, color: TOKENS.color.body, fontWeight: 600 }}>감정보다 편집 포인트에 주목해주세요.</div>
        </SurfaceCard>

        <div style={{ padding: '14px 16px', borderRadius: 14, background: TOKENS.color.brandSubtle, border: `1px solid rgba(222, 11, 85, 0.12)`, marginBottom: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.color.brand, marginBottom: 8 }}>이슈 질문</div>
          <div style={{ fontSize: 15, lineHeight: 1.6, color: TOKENS.color.title, fontWeight: 700 }}>이 선택은 감정보다 전략에 가까웠나?</div>
        </div>

        <article style={{ fontSize: 15, lineHeight: 1.8, color: TOKENS.color.body, display: 'grid', gap: 14, marginBottom: 18 }}>
          <p style={{ margin: 0 }}>이번 장면은 표면적인 대사보다 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다. 특히 두 출연자의 반응 컷을 교차 배치한 방식은 시청자가 “호감”이 아니라 “전략”의 언어로 읽게 만드는 장치로 보입니다.</p>
          <p style={{ margin: 0 }}>따라서 이 장면을 해석할 때는 누가 무슨 말을 했는지만 보지 말고, 어떤 표정과 정적이 얼마나 오래 유지되는지까지 함께 봐야 합니다.</p>
        </article>

        <div style={{ marginBottom: 18 }}><CoverArt tone="rose" label="Scene analysis" height={188} /></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <PlainButton variant="secondary" style={{ height: 40, borderRadius: TOKENS.radius.full, fontSize: 13, padding: '0 14px' }} leadingIcon="heart">업보트 53</PlainButton>
          <PlainButton variant="secondary" style={{ height: 40, borderRadius: TOKENS.radius.full, fontSize: 13, padding: '0 14px' }} leadingIcon="bookmark">스크랩</PlainButton>
          <PlainButton variant="secondary" style={{ height: 40, borderRadius: TOKENS.radius.full, fontSize: 13, padding: '0 14px' }} leadingIcon="share">공유</PlainButton>
          <PlainButton variant="secondary" style={{ height: 40, borderRadius: TOKENS.radius.full, fontSize: 13, padding: '0 14px' }} leadingIcon="flag">신고</PlainButton>
        </div>

        {!noRep ? (
          <div style={{ marginBottom: 24 }}>
            <SectionHeader title="대표 댓글" />
            <RepresentativeCommentCard nick="@닉A" text="이 장면은 호감 표현이 아니라 편집 의도가 드러나는 순간이라고 봅니다. 마지막 리액션 컷이 들어가는 방식이 전략적으로 읽히게 만들어요." />
          </div>
        ) : null}

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <SectionHeader title="전체 댓글" />
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { value: 'popular', label: '인기순' },
                { value: 'latest', label: '최신순' },
              ].map((item) => {
                const selected = item.value === sort;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSort(item.value)}
                    style={{
                      height: 32,
                      padding: '0 12px',
                      borderRadius: TOKENS.radius.full,
                      border: 'none',
                      background: selected ? TOKENS.color.title : TOKENS.color.surfaceSubtle,
                      color: selected ? TOKENS.color.surface : TOKENS.color.subtle,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <SurfaceCard style={{ padding: '0 16px' }}>
            {COMMENTS.map((comment, index) => (
              <div key={`${comment.nick}-${index}`} style={{ borderBottom: index < COMMENTS.length - 1 ? `1px solid ${TOKENS.color.borderSoft}` : 'none' }}>
                <CommentCard comment={comment} />
              </div>
            ))}
          </SurfaceCard>
        </div>
      </div>
    </PhoneChrome>
  );
}

export function PivitMyPage({ state = '룸 탭' }) {
  const empty = state === '구독 없음(Empty)';
  const activeMain = state === '이슈 탭' ? 'issues' : state === '댓글 탭' ? 'comments' : 'rooms';
  const [subTab, setSubTab] = useState('saved');

  return (
    <PhoneChrome navKey="mypage">
      <TitleHeader title="마이" rightIcons={['settings']} />
      <div style={{ padding: '18px 16px 0' }}>
        <SurfaceCard style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <RoomThumb initial="K" size={56} tone="rose" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: TOKENS.color.title, letterSpacing: '-0.02em', marginBottom: 4 }}>@김해석</div>
              <div style={{ fontSize: 13, color: TOKENS.color.muted, lineHeight: 1.55, marginBottom: 6 }}>콘텐츠를 맥락으로 읽는 사람</div>
              <button type="button" style={{ background: 'transparent', border: 'none', padding: 0, color: TOKENS.color.brand, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>프로필 보기</button>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <div style={{ padding: '18px 16px 0' }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${TOKENS.color.border}` }}>
          {[
            { value: 'rooms', label: '룸' },
            { value: 'issues', label: '이슈' },
            { value: 'comments', label: '댓글' },
          ].map((tab) => {
            const selected = tab.value === activeMain;
            return (
              <div key={tab.value} style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <button type="button" style={{ height: 46, background: 'transparent', border: 'none', borderBottom: selected ? `3px solid ${TOKENS.color.brand}` : '3px solid transparent', color: selected ? TOKENS.color.title : TOKENS.color.muted, fontSize: 15, fontWeight: selected ? 800 : 700, cursor: 'pointer' }}>{tab.label}</button>
              </div>
            );
          })}
        </div>
      </div>

      {empty ? (
        <EmptyState title="아직 활동 내역이 없습니다" body="구독한 룸, 저장한 이슈, 남긴 댓글이 차곡차곡 쌓이는 공간입니다." action="공개 룸 보기" />
      ) : (
        <div style={{ padding: '18px 16px 24px', display: 'grid', gap: 20 }}>
          {activeMain === 'rooms' ? (
            <>
              <div>
                <SectionHeader title="구독 중" />
                <SurfaceCard>
                  {['나는 솔로 해석 룸', '리벨북스 비문학 스터디'].map((item, index) => (
                    <div key={item} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: index === 0 ? `1px solid ${TOKENS.color.borderSoft}` : 'none' }}>
                      <RoomThumb initial={item.slice(0, 1)} size={36} tone={index === 0 ? 'rose' : 'stone'} square />
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: TOKENS.color.title }}>{item}</div>
                    </div>
                  ))}
                </SurfaceCard>
              </div>
              <div>
                <SectionHeader title="참여 중" />
                <SurfaceCard>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <RoomThumb initial="흑" size={36} tone="jade" square />
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: TOKENS.color.title }}>흑백요리사 해석 룸</div>
                    <Badge tone="success">멤버</Badge>
                  </div>
                </SurfaceCard>
              </div>
              <div>
                <SectionHeader title="운영 중" />
                <SurfaceCard>
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <RoomThumb initial="T" size={36} tone="warm" square />
                    <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: TOKENS.color.title }}>테슬라 한국 실사용자 룸</div>
                    <PlainButton variant="secondary" style={{ height: 36, padding: '0 12px', fontSize: 12 }}>운영하기</PlainButton>
                  </div>
                </SurfaceCard>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                {[
                  { value: 'saved', label: '스크랩' },
                  { value: 'written', label: '작성' },
                  { value: 'upvoted', label: '업보트' },
                ].map((tab) => {
                  const selected = subTab === tab.value;
                  return (
                    <button key={tab.value} type="button" onClick={() => setSubTab(tab.value)} style={{ height: 34, padding: '0 14px', borderRadius: TOKENS.radius.full, border: 'none', background: selected ? TOKENS.color.title : TOKENS.color.surfaceSubtle, color: selected ? TOKENS.color.surface : TOKENS.color.subtle, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{tab.label}</button>
                  );
                })}
              </div>
              <SurfaceCard style={{ overflow: 'hidden' }}>
                {activeMain === 'issues' ? (
                  <>
                    {[
                      { title: '이번 데이트 선택', room: '나는 솔로 해석 룸' },
                      { title: '올해 테슬라 가격 전략', room: '테슬라 한국 실사용자 룸' },
                    ].map((item, index) => (
                      <div key={item.title} style={{ padding: '16px 16px', borderBottom: index === 0 ? `1px solid ${TOKENS.color.borderSoft}` : 'none' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: TOKENS.color.title, marginBottom: 6 }}>{subTab === 'written' && index === 0 ? 'FSD 한국 도입, 올해 안 가능할까?' : item.title}</div>
                        <div style={{ fontSize: 12, color: TOKENS.color.muted }}>{subTab === 'upvoted' && index === 0 ? '리벨북스 비문학 스터디' : item.room}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { text: '편집보다 출연자 의도가 더 크다고 봅니다.', issue: '이번 데이트 선택' },
                      { text: '3장 후반부 논증 구조가 좀 약한 것 같습니다.', issue: '이번 장의 핵심 질문' },
                    ].map((item, index) => (
                      <div key={item.text} style={{ padding: '16px 16px', borderBottom: index === 0 ? `1px solid ${TOKENS.color.borderSoft}` : 'none' }}>
                        <div style={{ fontSize: 14, lineHeight: 1.65, color: TOKENS.color.body, marginBottom: 6 }}>{subTab === 'upvoted' && index === 0 ? '호감보다 편집 의도가 드러나는 순간...' : item.text}</div>
                        <div style={{ fontSize: 12, color: TOKENS.color.muted }}>→ {item.issue}</div>
                      </div>
                    ))}
                  </>
                )}
              </SurfaceCard>
            </>
          )}
        </div>
      )}
    </PhoneChrome>
  );
}

export function PivitProfilePage({ state = '내 프로필' }) {
  const me = state === '내 프로필';
  return (
    <PhoneChrome navKey="mypage">
      <BackHeader title="프로필" rightLabel={me ? '편집' : null} rightIcons={me ? [] : ['more']} />
      <div style={{ padding: '20px 16px 24px', display: 'grid', gap: 20 }}>
        <SurfaceCard style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <RoomThumb initial={me ? 'K' : 'J'} size={82} tone={me ? 'rose' : 'jade'} />
            <div style={{ height: 14 }} />
            <div style={{ fontSize: 22, fontWeight: 800, color: TOKENS.color.title, letterSpacing: '-0.03em', marginBottom: 6 }}>{me ? '@김해석' : '@정분석'}</div>
            <div style={{ fontSize: 14, lineHeight: 1.65, color: TOKENS.color.muted }}>{me ? '콘텐츠를 맥락으로 읽는 사람' : '데이터로 세상을 봅니다.'}</div>
          </div>
        </SurfaceCard>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
          {PROFILE_STATS.map((stat) => (
            <SurfaceCard key={stat.label} style={{ padding: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: TOKENS.color.title, letterSpacing: '-0.03em', marginBottom: 6 }}>{me ? stat.value : Math.max(1, stat.value - 20)}</div>
              <div style={{ fontSize: 12, color: TOKENS.color.muted }}>{stat.label}</div>
            </SurfaceCard>
          ))}
        </div>

        <div>
          <SectionHeader title="대표로 선정된 댓글" />
          <SurfaceCard style={{ overflow: 'hidden' }}>
            {[
              { text: '도입보다 과금 구조가 더 관건이라는 이야기가 많은데, 결국 납득 가능한 가격이 먼저입니다.', issue: 'FSD 한국 도입', room: '테슬라 한국 실사용자 룸' },
              { text: '이 장면은 호감보다 편집 의도가 드러나는 순간이라고 봅니다.', issue: '이번 선택, 진짜 의도?', room: '나는 솔로 해석 룸' },
            ].map((item, index) => (
              <div key={item.text} style={{ padding: '16px 16px', borderBottom: index === 0 ? `1px solid ${TOKENS.color.borderSoft}` : 'none' }}>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: TOKENS.color.body, marginBottom: 8 }}>{item.text}</div>
                <div style={{ fontSize: 12, color: TOKENS.color.muted }}>→ {item.issue} · {item.room}</div>
              </div>
            ))}
          </SurfaceCard>
        </div>

        <div>
          <SectionHeader title="최근 댓글" />
          <SurfaceCard style={{ overflow: 'hidden' }}>
            {[
              { text: '편집보다 출연자 의도가 더 크다고 봅니다.', issue: '이번 데이트 선택', time: '2시간 전' },
              { text: '3장 후반부 논증 구조가 약하다고 느꼈습니다.', issue: '이번 장의 핵심 질문', time: '1일 전' },
            ].map((item, index) => (
              <div key={item.text} style={{ padding: '16px 16px', borderBottom: index === 0 ? `1px solid ${TOKENS.color.borderSoft}` : 'none' }}>
                <div style={{ fontSize: 14, lineHeight: 1.65, color: TOKENS.color.body, marginBottom: 8 }}>{item.text}</div>
                <div style={{ fontSize: 12, color: TOKENS.color.muted }}>→ {item.issue} · {item.time}</div>
              </div>
            ))}
          </SurfaceCard>
        </div>

        <div>
          <SectionHeader title="참여 중인 룸" />
          <SurfaceCard style={{ overflow: 'hidden' }}>
            {['나는 솔로 해석 룸', '테슬라 한국 실사용자 룸'].map((item, index) => (
              <div key={item} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: index === 0 ? `1px solid ${TOKENS.color.borderSoft}` : 'none' }}>
                <RoomThumb initial={item.slice(0, 1)} size={36} tone={index === 0 ? 'rose' : 'warm'} square />
                <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.color.title }}>{item}</div>
              </div>
            ))}
          </SurfaceCard>
        </div>
      </div>
    </PhoneChrome>
  );
}

function OperatorSectionCard({ title, body, children }) {
  return (
    <SurfaceCard style={{ padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.color.muted, marginBottom: 6 }}>{title}</div>
      {body ? <div style={{ fontSize: 13, color: TOKENS.color.subtle, lineHeight: 1.6, marginBottom: 14 }}>{body}</div> : null}
      {children}
    </SurfaceCard>
  );
}

export function PivitRoomSettingsPage() {
  const footer = (
    <div style={{ padding: '12px 16px 16px' }}>
      <PlainButton style={{ width: '100%' }}>저장</PlainButton>
    </div>
  );
  return (
    <PhoneChrome showBottomNav={false} footer={footer}>
      <BackHeader title="룸 설정" rightLabel="저장" rightIcons={[]} />
      <div style={{ padding: '20px 16px 24px', display: 'grid', gap: 16 }}>
        <OperatorSectionCard title="기본 정보" body="대표 이미지, 이름, 소개 문장을 현재 제품의 카드 시스템 안에서 수정합니다.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <RoomThumb initial="T" size={72} tone="warm" square />
            <PlainButton variant="secondary" leadingIcon="upload">이미지 변경</PlainButton>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            <Field label="룸 이름" value="테슬라 한국 실사용자 룸" />
            <Field label="한 줄 설명" value="루머보다 해석, 드립보다 이유" />
            <Field label="상세 설명" value="실사용/가격/정책 관점의 반응을 모읍니다. 한 줄 반응보다 실제 경험과 근거를 남기는 댓글을 우선합니다." multiline />
          </div>
        </OperatorSectionCard>

        <OperatorSectionCard title="운영 정책" body="멤버 신청 여부와 공개 상태를 같은 시각 언어 안에서 관리합니다.">
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.color.muted, marginBottom: 8 }}>멤버 신청</div>
              <Segmented active="open" options={[{ value: 'closed', label: '받지 않음' }, { value: 'open', label: '받는 중', tone: 'success' }]} />
              <div style={{ marginTop: 8, fontSize: 12, color: TOKENS.color.muted }}>받는 중을 선택하면 룸 상세에 멤버 신청 버튼이 표시됩니다.</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: TOKENS.color.muted, marginBottom: 8 }}>공개 상태</div>
              <Segmented active="public" options={[{ value: 'private', label: '비공개' }, { value: 'public', label: '공개', tone: 'success' }]} />
            </div>
          </div>
        </OperatorSectionCard>

        <OperatorSectionCard title="멤버 관리" body="현재 참여 중인 멤버를 정리하고 새 사용자를 추가할 수 있습니다.">
          <div style={{ display: 'grid', gap: 10 }}>
            {['@userA', '@userB', '@userC'].map((member) => (
              <div key={member} style={{ minHeight: 52, borderRadius: 12, border: `1px solid ${TOKENS.color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.color.body }}>{member}</div>
                <button type="button" style={{ background: 'transparent', border: 'none', color: TOKENS.color.destructive, fontWeight: 700, cursor: 'pointer' }}>제거</button>
              </div>
            ))}
            <div style={{ minHeight: 52, borderRadius: 12, border: `1px dashed ${TOKENS.color.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: TOKENS.color.muted, fontSize: 14, fontWeight: 700 }}>
              <Icon name="plus" size={16} color="currentColor" />사용자 검색 후 추가
            </div>
          </div>
        </OperatorSectionCard>
      </div>
    </PhoneChrome>
  );
}

export function PivitIssuePublishPage({ state = '새 이슈' }) {
  const editing = state === '이슈 수정';
  const footer = (
    <div style={{ padding: '12px 16px 16px', display: 'flex', gap: 8 }}>
      <PlainButton style={{ flex: 1 }}>{editing ? '수정' : '발행'}</PlainButton>
      {editing ? <PlainButton variant="destructive-outline" style={{ width: 92 }}>삭제</PlainButton> : null}
    </div>
  );
  return (
    <PhoneChrome showBottomNav={false} footer={footer}>
      <BackHeader title={editing ? '이슈 수정' : '새 이슈 발행'} />
      <div style={{ padding: '20px 16px 24px', display: 'grid', gap: 16 }}>
        <OperatorSectionCard title="이슈 본문" body="제목, 운영자 한 줄, 질문, 본문을 상용 편집기 수준으로 정리합니다.">
          <div style={{ display: 'grid', gap: 14 }}>
            <Field label="제목" value={editing ? 'FSD 한국 도입, 올해 안 가능할까?' : ''} placeholder="이슈 제목을 입력하세요" />
            <Field label="운영자 한 줄" value={editing ? '일정보다 가격 구조와 체감 품질이 핵심입니다.' : ''} placeholder="이 이슈를 어떤 관점으로 볼지 한 줄로 정리하세요" />
            <Field label="질문 (선택)" value="" placeholder="댓글을 끌어낼 질문을 적어보세요" />
            <Field label="본문" value={editing ? '이번 FSD 도입 논의의 핵심은 기능 도입 일정이 아니라 가격 구조와 한국 도로 환경에서의 체감 품질입니다.' : ''} placeholder="본문을 입력하세요" multiline />
          </div>
        </OperatorSectionCard>

        <OperatorSectionCard title="첨부" body="이미지, 링크, 영상 임베드를 한곳에서 관리합니다.">
          <div style={{ minHeight: 120, borderRadius: 12, border: `1px dashed ${TOKENS.color.border}`, background: TOKENS.color.surfaceSubtle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: TOKENS.color.muted }}>
            <Icon name="upload" size={22} color="currentColor" />
            <div style={{ fontSize: 14, fontWeight: 700 }}>이미지 / 링크 / 유튜브 첨부</div>
          </div>
        </OperatorSectionCard>

        <OperatorSectionCard title="발행 상태" body="초안, 진행 중, 종료, 숨김 상태를 명확하게 구분합니다.">
          <Segmented
            active="live"
            options={[
              { value: 'draft', label: '초안', tone: 'warning' },
              { value: 'live', label: '진행 중', tone: 'success' },
              { value: 'closed', label: '종료' },
              { value: 'hidden', label: '숨김', tone: 'destructive' },
            ]}
          />
          <div style={{ marginTop: 10, fontSize: 12, color: TOKENS.color.muted, lineHeight: 1.6 }}>초안은 운영자만 보이고, 숨김은 공개 후 비노출 처리에 사용합니다.</div>
        </OperatorSectionCard>

        <OperatorSectionCard title="추가 옵션" body="이슈의 노출 맥락과 주의 상태를 함께 설정합니다.">
          <div style={{ display: 'grid', gap: 10 }}>
            <SurfaceCard style={{ padding: '14px 16px', background: TOKENS.color.brandSubtle, borderColor: 'rgba(222, 11, 85, 0.12)', boxShadow: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.color.title, marginBottom: 4 }}>대표 이슈로 설정</div>
                  <div style={{ fontSize: 12, color: TOKENS.color.muted }}>룸 상세 상단에 우선 노출됩니다.</div>
                </div>
                <Icon name="check" size={18} color={TOKENS.color.brand} />
              </div>
            </SurfaceCard>
            <SurfaceCard style={{ padding: '14px 16px', background: TOKENS.color.destructiveSubtle, borderColor: 'rgba(255, 20, 20, 0.12)', boxShadow: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TOKENS.color.title, marginBottom: 4 }}>스포일러 포함</div>
                  <div style={{ fontSize: 12, color: TOKENS.color.muted }}>목록에서는 미리보기를 제한해 보여줍니다.</div>
                </div>
                <Icon name="check" size={18} color={TOKENS.color.destructive} />
              </div>
            </SurfaceCard>
          </div>
        </OperatorSectionCard>
      </div>
    </PhoneChrome>
  );
}

export function PivitRepCommentPage() {
  return (
    <PhoneChrome showBottomNav={false}>
      <BackHeader title="대표 댓글 지정" />
      <div style={{ padding: '20px 16px 24px', display: 'grid', gap: 16 }}>
        <OperatorSectionCard title="이슈 정보" body="대표 댓글을 선정할 대상 이슈입니다.">
          <div style={{ fontSize: 16, fontWeight: 800, color: TOKENS.color.title, lineHeight: 1.4, marginBottom: 8 }}>FSD 한국 도입, 올해 안 가능할까?</div>
          <div style={{ fontSize: 13, color: TOKENS.color.subtle, lineHeight: 1.6 }}>일정보다 가격 구조와 체감 품질을 중심으로 봐야 합니다.</div>
        </OperatorSectionCard>

        <div>
          <SectionHeader title="현재 대표 댓글" />
          <RepresentativeCommentCard nick="@닉A" text="도입 그 자체보다 과금 구조가 먼저 납득되어야 한다는 점에 공감합니다. 실제 사용자는 기능 소개보다 비용과 만족도를 먼저 평가합니다." />
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
            <PlainButton variant="destructive-outline" style={{ height: 40, fontSize: 13 }}>해제</PlainButton>
          </div>
        </div>

        <div>
          <SectionHeader title="전체 댓글" />
          <SurfaceCard style={{ overflow: 'hidden' }}>
            {REP_CANDIDATES.map((comment, index) => (
              <div key={`${comment.nick}-${index}`} style={{ padding: '16px 16px', borderBottom: index < REP_CANDIDATES.length - 1 ? `1px solid ${TOKENS.color.borderSoft}` : 'none', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: TOKENS.color.body }}>{comment.nick}</span>
                    <span style={{ fontSize: 12, color: TOKENS.color.muted }}>{comment.time}</span>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.65, color: TOKENS.color.body, marginBottom: 8 }}>{comment.text}</div>
                  <div style={{ fontSize: 12, color: TOKENS.color.muted }}>업보트 {comment.upvotes}</div>
                </div>
                <PlainButton variant="outline" style={{ height: 38, padding: '0 14px', fontSize: 13 }}>지정</PlainButton>
              </div>
            ))}
          </SurfaceCard>
        </div>
      </div>
    </PhoneChrome>
  );
}

function ScreenRenderer({ screen, state }) {
  switch (screen) {
    case 'feed':
      return <PivitFeedPage state={state} />;
    case 'issues':
      return <PivitIssuesPage state={state} />;
    case 'rooms':
      return <PivitRoomsPage state={state} />;
    case 'room':
      return <PivitRoomPage state={state} />;
    case 'issue':
      return <PivitIssuePage state={state} />;
    case 'mypage':
      return <PivitMyPage state={state} />;
    case 'profile':
      return <PivitProfilePage state={state} />;
    case 'room-settings':
      return <PivitRoomSettingsPage state={state} />;
    case 'issue-publish':
      return <PivitIssuePublishPage state={state} />;
    case 'rep-comment':
      return <PivitRepCommentPage state={state} />;
    default:
      return null;
  }
}

export default function PivitHighFidelityWireframes() {
  const [activeScreen, setActiveScreen] = useState('feed');
  const [activeStateIndex, setActiveStateIndex] = useState(0);
  const screenMeta = SCREENS.find((item) => item.id === activeScreen) || SCREENS[0];
  const currentStates = STATES[activeScreen] || ['기본'];
  const currentState = currentStates[activeStateIndex] || currentStates[0];

  const setScreen = (screenId) => {
    setActiveScreen(screenId);
    setActiveStateIndex(0);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F6F6F7 0%, #ECECEE 100%)', fontFamily: TOKENS.font, padding: 28, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gap: 20 }}>
        <SurfaceCard style={{ padding: 20, borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: TOKENS.color.brand, marginBottom: 8, letterSpacing: '0.06em' }}>PIVIT HIGH-FIDELITY WIREFRAMES</div>
              <div style={{ fontSize: 28, lineHeight: 1.2, fontWeight: 800, letterSpacing: '-0.04em', color: TOKENS.color.title, marginBottom: 10 }}>와이어프레임을 실제 제품 톤으로 구체화한 JSX</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: TOKENS.color.muted, maxWidth: 760 }}>브랜드 primary, 버튼/입력 높이 52px, 헤더 56px, radius 10px, editorial discussion tone을 기준으로 모든 화면을 일관된 모바일 웹 경험으로 재정렬했습니다.</div>
            </div>
            <div style={{ display: 'grid', gap: 8, alignContent: 'start' }}>
              <Badge tone="brand">브랜드 중심 high-fi</Badge>
              <Badge>상용 웹사이트 수준</Badge>
              <Badge tone="success">전체 페이지 포함</Badge>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 18 }}>
            {SCREEN_GROUPS.map((group) => (
              <div key={group.key}>
                <div style={{ fontSize: 12, fontWeight: 800, color: group.key === 'operator' ? TOKENS.color.success : TOKENS.color.brand, marginBottom: 10 }}>{group.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {SCREENS.filter((item) => item.group === group.key).map((item) => {
                    const selected = item.id === activeScreen;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setScreen(item.id)}
                        style={{
                          height: 40,
                          padding: '0 14px',
                          borderRadius: 12,
                          border: `1px solid ${selected ? TOKENS.color.brand : TOKENS.color.border}`,
                          background: selected ? TOKENS.color.brandSubtle : TOKENS.color.surface,
                          color: selected ? TOKENS.color.brand : TOKENS.color.subtle,
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: TOKENS.color.subtle, marginBottom: 10 }}>화면 상태</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {currentStates.map((stateLabel, index) => {
                  const selected = index === activeStateIndex;
                  return (
                    <button
                      key={stateLabel}
                      type="button"
                      onClick={() => setActiveStateIndex(index)}
                      style={{
                        height: 36,
                        padding: '0 14px',
                        borderRadius: TOKENS.radius.full,
                        border: `1px solid ${selected ? TOKENS.color.title : TOKENS.color.border}`,
                        background: selected ? TOKENS.color.title : TOKENS.color.surface,
                        color: selected ? TOKENS.color.surface : TOKENS.color.subtle,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {stateLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </SurfaceCard>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(390px, 390px) minmax(320px, 1fr)', gap: 24, alignItems: 'start' }}>
          <ScreenRenderer screen={activeScreen} state={currentState} />

          <div style={{ display: 'grid', gap: 16 }}>
            <SurfaceCard style={{ padding: 20, borderRadius: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: TOKENS.color.brand, marginBottom: 10 }}>CURRENT SCREEN</div>
              <div style={{ fontSize: 24, lineHeight: 1.2, fontWeight: 800, letterSpacing: '-0.03em', color: TOKENS.color.title, marginBottom: 10 }}>{screenMeta.label}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                <Badge tone="brand">{screenMeta.route}</Badge>
                <Badge>{currentState}</Badge>
              </div>
              <div style={{ fontSize: 14, color: TOKENS.color.muted, lineHeight: 1.7 }}>{SCREEN_NOTES[activeScreen]}</div>
            </SurfaceCard>

            <SurfaceCard style={{ padding: 20, borderRadius: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: TOKENS.color.success, marginBottom: 12 }}>APPLIED SYSTEM</div>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  '브랜드 primary #DE0B55를 CTA, 상태 강조, 대표 요소에만 제한적으로 사용',
                  'Pretendard Variable 기반의 24 / 20 / 18 / 16 / 14px 정보 계층 적용',
                  '헤더 56px, 버튼·입력 52px, radius 10px, thin border 기반의 제품 톤 유지',
                  '대표 댓글 패턴을 feed / room / issue detail 전체에서 같은 시그니처 모듈로 통일',
                  '운영자 화면도 같은 카드·폼 시스템으로 맞춰 별도 백오피스처럼 보이지 않게 구성',
                ].map((line) => (
                  <div key={line} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 999, background: TOKENS.color.successSubtle, color: TOKENS.color.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name="check" size={12} color="currentColor" />
                    </div>
                    <div style={{ fontSize: 14, color: TOKENS.color.body, lineHeight: 1.65 }}>{line}</div>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </div>
      </div>
    </div>
  );
}
