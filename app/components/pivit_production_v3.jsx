'use client';

import { useState } from "react";

/* ═══════════════════════════════════════════════
   PIVIT — Production High-Fidelity UI v3
   Tokens: DESIGN.md + pivit-wireframe-hifi-spec.md
   Visual ref: pivit-wireframe-visual-direction.html
   ═══════════════════════════════════════════════ */

const C = {
  brand: "#DE0B55",
  brandSoft: "rgba(236,33,70,0.08)",
  brandSoft2: "rgba(236,33,70,0.12)",
  brandDis: "rgba(236,33,70,0.26)",
  bg: "#FFFFFF",
  subtle: "#F5F5F5",
  line: "#E0E0E0",
  lineSoft: "#EFEFEF",
  title: "#171717",
  body: "#262626",
  sub: "#525252",
  muted: "#737373",
  ph: "#B2B2B2",
  success: "#0F6E56",
  successSoft: "rgba(15,110,86,0.10)",
  warning: "#8A5308",
  warningSoft: "rgba(239,159,39,0.14)",
  danger: "#C51616",
  dangerSoft: "rgba(255,20,20,0.08)",
  error: "#FF1414",
  kakao: "#FEE500",
};
const R = { xs: 4, sm: 6, md: 8, lg: 10, xl: 14, card: 16, full: 999 };
const F = '"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,"Segoe UI",sans-serif';

const SCREENS = [
  { id: "feed", label: "내 피드(홈)", g: "user" },
  { id: "issues", label: "이슈 목록", g: "user" },
  { id: "rooms", label: "룸 목록", g: "user" },
  { id: "room", label: "룸 상세", g: "user" },
  { id: "issue", label: "이슈 상세", g: "user" },
  { id: "mypage", label: "마이페이지", g: "user" },
  { id: "profile", label: "프로필", g: "user" },
  { id: "room-settings", label: "룸 설정", g: "operator" },
  { id: "issue-publish", label: "이슈 발행/수정", g: "operator" },
  { id: "rep-comment", label: "대표 댓글 지정", g: "operator" },
];
const STATES = {
  feed: ["기본", "구독 룸 없음(Empty)"],
  issues: ["기본", "스포일러 포함 이슈", "이슈 없음(Empty)"],
  rooms: ["Visitor", "Subscriber"],
  room: ["멤버모집-Visitor","멤버모집-Subscriber","멤버모집-Member","멤버모집-Operator","모집안함-Visitor","모집안함-Subscriber","모집안함-Member","모집안함-Operator"],
  issue: ["Visitor","Subscriber(구독만)","Member/Operator","대표 댓글 없음"],
  mypage: ["룸 탭","이슈 탭","댓글 탭","구독 없음(Empty)"],
  profile: ["내 프로필","다른 사용자 프로필"],
  "room-settings": ["기본"],
  "issue-publish": ["새 이슈","이슈 수정"],
  "rep-comment": ["기본"],
};

/* ─── Mini icons (1.5px stroke Lucide-like) ─── */
const Ic = {
  up: (c=C.muted)=><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 10l4-5 4 5" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chat: (c=C.muted)=><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M14 10.5a1.5 1.5 0 01-1.5 1.5H5l-3 3V3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v7z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  eye: (c=C.muted)=><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8s-2.5 4.5-6.5 4.5S1.5 8 1.5 8z" stroke={c} strokeWidth="1.2"/><circle cx="8" cy="8" r="2" stroke={c} strokeWidth="1.2"/></svg>,
  back: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M11.5 3.5L5.5 9l6 5.5" stroke={C.muted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  share: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.5 10.5v3.5a1.5 1.5 0 001.5 1.5h8a1.5 1.5 0 001.5-1.5v-3.5M12 5l-3-3-3 3M9 2v8.5" stroke={C.muted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  more: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="4.5" r="1" fill={C.muted}/><circle cx="9" cy="9" r="1" fill={C.muted}/><circle cx="9" cy="13.5" r="1" fill={C.muted}/></svg>,
  attach: <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3.5v11M3.5 9h11" stroke={C.muted} strokeWidth="1.5" strokeLinecap="round"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke={C.muted} strokeWidth="1.3"/><path d="M10.5 10.5L14 14" stroke={C.muted} strokeWidth="1.3" strokeLinecap="round"/></svg>,
  bell: <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6a4 4 0 018 0v2.5l1.5 2.5H2.5L4 8.5V6z" stroke={C.muted} strokeWidth="1.2"/><path d="M6 13a2 2 0 004 0" stroke={C.muted} strokeWidth="1.2"/></svg>,
  bookmark: (c=C.muted)=><svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3.5 2h7a1 1 0 011 1v9.5l-4.5-3-4.5 3V3a1 1 0 011-1z" stroke={c} strokeWidth="1.2"/></svg>,
};

/* ─── Primitives ─── */
function Badge({text,v="neutral"}){
  const m={
    neutral:{bg:C.subtle,c:"#666"},
    brand:{bg:C.brandSoft2,c:C.brand},
    success:{bg:C.successSoft,c:C.success},
    warning:{bg:C.warningSoft,c:C.warning},
    danger:{bg:C.dangerSoft,c:C.danger},
  };
  const s=m[v]||m.neutral;
  return <span style={{display:"inline-flex",alignItems:"center",borderRadius:R.full,padding:"4px 8px",fontSize:11,fontWeight:700,background:s.bg,color:s.c,lineHeight:1.2,whiteSpace:"nowrap"}}>{text}</span>;
}

function Btn({children,v="primary",full,style:sx}){
  const base={height:52,borderRadius:R.lg,padding:"0 18px",display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15,cursor:"pointer",boxSizing:"border-box",fontFamily:F,border:"none",letterSpacing:"-0.01em"};
  const vs={
    primary:{...base,background:C.brand,color:"#fff"},
    secondary:{...base,background:C.subtle,color:C.body,border:`1px solid transparent`},
    outline:{...base,background:"#fff",color:C.brand,border:`1px solid ${C.brand}`},
    outlineTeal:{...base,background:"#fff",color:C.success,border:`1px solid ${C.success}`},
    ghost:{...base,background:C.subtle,color:C.title},
    danger:{...base,background:C.dangerSoft,color:C.danger},
    soft:{...base,background:C.brandSoft,color:C.brand},
    disabled:{...base,background:C.brandDis,color:"#fff",cursor:"default"},
  };
  return <div style={{...vs[v]||vs.primary,width:full?"100%":"auto",...sx}}>{children}</div>;
}

function Thumb({size=56,seed=0}){
  const hues=[345,200,160,30,270,180];
  const h=hues[seed%hues.length];
  return <div style={{width:size,height:size,borderRadius:size>40?R.card:R.xl,border:`1px solid ${C.line}`,flexShrink:0,background:`linear-gradient(135deg, hsl(${h},30%,96%) 0%, ${C.subtle} 100%)`,overflow:"hidden",position:"relative"}}>
    <div style={{position:"absolute",bottom:"-15%",right:"-15%",width:"55%",height:"55%",borderRadius:"50%",background:`hsl(${h},25%,91%)`,opacity:0.7}}/>
  </div>;
}

function MiniThumb({size=18,seed=0}){
  const hues=[345,200,160,30];const h=hues[seed%hues.length];
  return <div style={{width:size,height:size,borderRadius:7,border:`1px solid ${C.line}`,flexShrink:0,background:`linear-gradient(135deg, hsl(${h},30%,96%) 0%, ${C.subtle} 100%)`}}/>;
}

function Meta({up,cmt,view,style:sx}){
  return <div style={{display:"flex",gap:14,fontSize:12,color:C.muted,marginTop:12,...sx}}>
    <span style={{display:"flex",alignItems:"center",gap:3}}>▲ {up}</span>
    <span>댓글 {cmt}</span>
    {view!==undefined&&<span>조회 {view}</span>}
  </div>;
}

function MediaBlock({h=168,seed=0}){
  const hues=[345,200,160,30,270];const hu=hues[seed%hues.length];
  return <div style={{marginTop:12,height:h,borderRadius:12,border:`1px solid ${C.line}`,background:`linear-gradient(135deg, #f8f8f8 0%, hsl(${hu},40%,95%) 100%)`}}/>;
}

/* Representative Comment — SIGNATURE MODULE */
function RepComment({nick,text,compact}){
  return <div style={{marginTop:compact?10:14,background:C.brandSoft,borderRadius:12,padding:14,borderLeft:`2px solid ${C.brand}`}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
      <strong style={{fontSize:13,color:C.title}}>{nick}</strong>
      <Badge text="대표 댓글" v="brand"/>
    </div>
    <p style={{margin:0,fontSize:14,lineHeight:1.6,color:C.body,display:"-webkit-box",WebkitLineClamp:compact?3:5,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{text}</p>
  </div>;
}

function StatusBadge({s}){if(s==="진행 중")return null;if(s==="종료")return <Badge text="종료"/>;return null;}
function SH({children,right}){return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 16px 10px",fontSize:16,fontWeight:700,color:C.title}}><span>{children}</span>{right}</div>;}

/* ─── Phone Shell ─── */
function Phone({children,tab,onTab}){
  const tabs=[{id:"feed",l:"피드",l2:"홈"},{id:"issues",l:"이슈",l2:"목록"},{id:"rooms",l:"룸",l2:"탐색"},{id:"mypage",l:"마이",l2:"프로필"}];
  return <div style={{width:375,minHeight:812,background:"#fff",border:`1px solid ${C.line}`,borderRadius:32,overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 18px 40px rgba(23,23,23,0.08)",flexShrink:0,fontFamily:F}}>
    <div style={{height:32,display:"flex",alignItems:"center",justifyContent:"center",color:C.ph,fontSize:11,borderBottom:`1px solid ${C.lineSoft}`,background:"#fff",flexShrink:0}}>9:41</div>
    <div style={{flex:1,overflow:"auto",background:"#fff"}}>{children}</div>
    <div style={{height:64,borderTop:`1px solid ${C.line}`,display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#fff",flexShrink:0}}>
      {tabs.map(t=>{const a=tab===t.id;return<div key={t.id} onClick={()=>onTab?.(t.id)} style={{display:"grid",placeItems:"center",fontSize:11,color:a?C.brand:C.muted,fontWeight:a?700:400,gap:2,cursor:"pointer"}}><strong style={{fontSize:12}}>{t.l}</strong><span>{t.l2}</span></div>;})}
    </div>
  </div>;
}

function AppHeader(){
  return <div style={{height:56,padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.line}`,background:"#fff",position:"sticky",top:0,zIndex:2}}>
    <div style={{fontSize:19,fontWeight:800,letterSpacing:"-0.02em",color:C.title}}>PI<span style={{color:C.brand}}>VIT</span></div>
    <div style={{display:"flex",gap:12,alignItems:"center"}}>{Ic.search}{Ic.bell}</div>
  </div>;
}

function TopBar({left="← 뒤로",right}){
  return <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 16px",color:C.muted,fontSize:13,borderBottom:`1px solid ${C.lineSoft}`}}>
    <span style={{cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>{Ic.back} {left}</span>
    <div style={{display:"flex",gap:10,alignItems:"center"}}>{right||<>{Ic.share}{Ic.more}</>}</div>
  </div>;
}

/* ═══════════════════════════════════════════════
   SCREEN COMPONENTS
   ═══════════════════════════════════════════════ */

/* ─── FEED ─── */
function FeedCard({room,seed,title,opLine,body,repNick,rep,cmt,up,view,status,media}){
  return <div style={{margin:"0 16px 16px",border:`1px solid ${C.line}`,borderRadius:R.card,padding:18,background:"#fff",boxShadow:"0 2px 10px rgba(23,23,23,0.03)"}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,fontSize:12,fontWeight:700,color:C.brand}}><MiniThumb seed={seed}/>{room}</div>
    <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
      <div style={{fontSize:18,lineHeight:1.35,fontWeight:700,color:C.title,flex:1,letterSpacing:"-0.02em"}}>{title}</div>
      <StatusBadge s={status}/>
    </div>
    <div style={{fontSize:13,color:C.muted,marginBottom:8}}>운영자 한 줄 · {opLine}</div>
    <div style={{fontSize:14,lineHeight:1.65,color:C.body,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{body}</div>
    {media&&<MediaBlock seed={seed}/>}
    {rep&&<RepComment nick={repNick} text={rep}/>}
    <Meta up={up} cmt={cmt} view={view}/>
  </div>;
}

function FeedScreen({state}){
  if(state.includes("Empty"))return<div style={{padding:"100px 32px",textAlign:"center"}}>
    <div style={{fontSize:17,fontWeight:600,color:C.title,marginBottom:8}}>아직 구독한 룸이 없습니다</div>
    <div style={{fontSize:14,color:C.muted,marginBottom:24,lineHeight:1.6}}>관심 있는 룸을 구독하면<br/>이슈와 반응이 여기에 모입니다</div>
    <Btn full>룸 둘러보기</Btn>
  </div>;
  return <div>
    <AppHeader/>
    <div style={{padding:16}}><div style={{fontSize:24,fontWeight:700,color:C.title,lineHeight:1.3}}>내 피드</div><div style={{marginTop:6,fontSize:13,lineHeight:1.5,color:C.muted}}>구독 중인 룸의 최신 논점과 대표 댓글</div></div>
    {/* Room strip */}
    <div style={{display:"flex",gap:10,overflowX:"auto",padding:"0 16px 14px"}}>
      {[{n:"테슬라",s:3},{n:"나는 솔로",s:0},{n:"리벨북스",s:2}].map((r,i)=><div key={i} style={{minWidth:84,display:"grid",gap:6}}>
        <div style={{width:"100%",height:58,borderRadius:R.xl,background:`linear-gradient(135deg, #fff0f5 0%, ${C.subtle} 100%)`,border:`1px solid ${C.line}`}}/>
        <span style={{fontSize:12,color:C.muted}}>{r.n}</span>
      </div>)}
      <div style={{minWidth:84,display:"grid",gap:6}}>
        <div style={{width:"100%",height:58,borderRadius:R.xl,border:`1px dashed ${C.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.ph}}>+</div>
        <span style={{fontSize:12,color:C.ph}}>전체 보기</span>
      </div>
    </div>
    <FeedCard seed={3} room="테슬라 한국 실사용자 룸" title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격 구조와 실제 체감 성능이 핵심입니다." body="이번 FSD 도입 논의에서 가장 핵심적인 부분은 일정 자체보다 가격 구조와 실제 체감 성능입니다. 한국 도로 환경에서의 적용 가능성과 OTA 품질까지 함께 봐야 합니다." repNick="@닉A" rep="도입보다 과금 구조가 더 관건이라는 이야기가 많은데, 실제로 한국 시장에서 FSD 월정액 모델이 성립하려면 OTA 체감 품질이 먼저 올라와야 합니다." status="진행 중" cmt={24} up={47} view={312} media/>
    <FeedCard seed={0} room="나는 솔로 해석 룸" title="이번 선택, 진짜 의도였을까?" opLine="행동보다 편집 포인트에 주목해주세요." body="표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다. 두 출연자의 반응 컷을 교차 배치한 연출이 인상적입니다." repNick="@닉B" rep="호감 표현이 아니라 제작진이 특정 인물을 전략적으로 보이게 만드는 편집 의도가 드러난 장면이라고 봅니다." status="진행 중" cmt={31} up={62} view={487}/>
    <FeedCard seed={2} room="리벨북스 비문학 스터디" title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 집중합시다." body="저자가 3장에서 제기하는 문제의식은 결론 부분보다 오히려 초반의 질문 자체에 더 큰 무게가 있습니다." repNick="@닉E" rep="오히려 이 대목이 저자의 핵심 논점입니다. 결론에서 말하는 것보다 3장 초반에 던진 질문의 구조가 이 책 전체를 관통하고 있습니다." status="종료" cmt={18} up={35} view={198}/>
  </div>;
}

/* ─── ISSUE LIST ─── */
function IssueRow({room,seed,title,opLine,rep,status,cmt,up,view,spoiler}){
  return <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.lineSoft}`}}>
    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,fontSize:12,fontWeight:700,color:C.brand}}><MiniThumb size={14} seed={seed}/>{room}</div>
    <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:4}}>
      <div style={{fontSize:16,fontWeight:700,color:C.title,lineHeight:1.4,flex:1,letterSpacing:"-0.01em"}}>{title}</div>
      {spoiler&&<Badge text="스포일러" v="danger"/>}
      <StatusBadge s={status}/>
    </div>
    {spoiler?<div style={{fontSize:13,color:C.ph,padding:"6px 12px",background:C.subtle,borderRadius:R.md,marginTop:4}}>스포일러 포함 · 탭하여 보기</div>:<>
      {opLine&&<div style={{fontSize:13,color:C.muted,marginBottom:4}}>운영자 한 줄 · {opLine}</div>}
      {rep&&<div style={{fontSize:13,color:C.body,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{rep}</div>}
    </>}
    <Meta up={up} cmt={cmt} view={view} style={{marginTop:8}}/>
  </div>;
}
function IssueListScreen({state}){
  if(state.includes("Empty"))return<div style={{padding:"100px 32px",textAlign:"center"}}><div style={{fontSize:17,fontWeight:600,color:C.title,marginBottom:6}}>아직 공개된 이슈가 없습니다</div><div style={{fontSize:13,color:C.muted}}>룸에서 이슈가 발행되면 여기에 표시됩니다</div></div>;
  const sp=state==="스포일러 포함 이슈";
  return <div>
    <AppHeader/>
    <div style={{padding:"16px 16px 6px"}}><div style={{fontSize:24,fontWeight:700,color:C.title}}>최신 이슈</div><div style={{marginTop:4,fontSize:12,color:C.ph}}>대표 댓글이 지정된 이슈를 우선 노출합니다</div></div>
    <IssueRow room="나는 솔로 해석 룸" seed={0} title="이번 데이트 선택, 어떻게 읽히나" opLine="감정보다 전략으로 읽힙니다" rep="@닉D 이건 호감보다 계산에 가까워 보입니다" status="진행 중" cmt={28} up={53} view={421}/>
    {sp&&<IssueRow room="나는 솔로 해석 룸" seed={0} title="최종 선택 결과 분석" status="진행 중" cmt={45} up={89} view={670} spoiler/>}
    <IssueRow room="리벨북스 비문학 스터디" seed={2} title="이번 장의 핵심 질문은 무엇인가" opLine="저자 결론보다 문제제기에 주목" rep="@닉E 오히려 이 대목이 더 중요합니다" status="종료" cmt={18} up={35} view={198}/>
    <IssueRow room="테슬라 한국 실사용자 룸" seed={3} title="FSD 한국 도입, 올해 안 가능할까?" opLine="일정보다 가격/체감이 핵심" rep="@닉A 도입보다 과금 구조가 관건" status="진행 중" cmt={24} up={47} view={312}/>
  </div>;
}

/* ─── ROOM LIST ─── */
function RoomListScreen({state}){
  const isSub=state==="Subscriber";
  const rooms=[{n:"나는 솔로 해석 룸",d:"감정보다 맥락과 편집으로 봅니다",recruit:false,issues:12,subs:84,s:0},{n:"테슬라 한국 실사용자 룸",d:"루머보다 해석, 드립보다 이유",recruit:true,issues:18,subs:156,s:3},{n:"리벨북스 비문학 스터디",d:"저자의 질문을 함께 읽습니다",recruit:false,issues:8,subs:47,s:2}];
  return <div>
    <AppHeader/>
    <div style={{padding:"16px 16px 6px"}}><div style={{fontSize:24,fontWeight:700,color:C.title}}>공개 룸</div><div style={{marginTop:4,fontSize:13,color:C.muted,lineHeight:1.5}}>결 맞는 룸을 구독하고, 이슈와 반응을 내 피드로 모아보세요</div></div>
    {rooms.map((r,i)=><div key={i} style={{padding:16,borderBottom:`1px solid ${C.lineSoft}`}}>
      <div style={{display:"flex",gap:14,marginBottom:10}}>
        <Thumb size={56} seed={r.s}/>
        <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,color:C.title,marginBottom:2,letterSpacing:"-0.02em"}}>{r.n}</div><div style={{fontSize:13,color:C.muted}}>{r.d}</div></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
        {r.recruit&&<Badge text="멤버 모집 중" v="success"/>}
        <span style={{fontSize:12,color:C.ph}}>이슈 {r.issues}개 · 구독자 {r.subs}명</span>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn v={isSub?"soft":"primary"} full style={{flex:1,height:44,fontSize:14}}>{isSub?"구독 중":"구독하기"}</Btn>
        {r.recruit&&<Btn v="outlineTeal" style={{height:44,fontSize:13}}>멤버 신청</Btn>}
      </div>
    </div>)}
  </div>;
}

/* ─── ROOM DETAIL ─── */
function RoomScreen({state}){
  const [acc,role]=state.split("-");const recruit=acc==="멤버모집";const isOp=role==="Operator";const isMem=role==="Member";
  return <div>
    <TopBar/>
    <div style={{padding:16,borderBottom:`1px solid ${C.line}`}}>
      <div style={{display:"flex",gap:14,marginBottom:14}}>
        <Thumb size={64} seed={0}/>
        <div><div style={{fontSize:20,fontWeight:700,color:C.title,letterSpacing:"-0.02em"}}>나는 솔로 해석 룸</div><div style={{fontSize:14,color:C.muted,marginTop:4}}>감정보다 맥락과 편집으로 봅니다</div><div style={{display:"flex",gap:8,marginTop:10,alignItems:"center",flexWrap:"wrap"}}>{recruit&&<Badge text="멤버 모집 중" v="success"/>}<span style={{fontSize:12,color:C.muted}}>구독자 84명 · 최근 이슈 12개</span></div></div>
      </div>
      {isMem?<div style={{fontSize:12,color:C.ph,cursor:"pointer"}}>▸ 룸 소개 보기</div>:
      <div style={{background:C.subtle,borderRadius:R.xl,padding:14,fontSize:14,lineHeight:1.6,color:C.body,marginBottom:14}}>
        <strong style={{display:"block",fontSize:12,color:C.muted,marginBottom:8}}>이 룸은 이렇게 봅니다</strong>
        • 장면의 의도와 편집 포인트를 같이 봅니다.<br/>• 한 줄 반응보다 이유 있는 댓글을 중시합니다.<br/>• 자극적인 단정 대신 근거 있는 해석을 지향합니다.
      </div>}
      <div style={{display:"flex",gap:10,marginTop:14}}>
        {role==="Visitor"?<Btn v="primary" full style={{flex:1}}>구독하기</Btn>:<Btn v="secondary" full style={{flex:1}}>구독 중</Btn>}
        {recruit&&!isMem&&!isOp&&<Btn v="outline" style={{flex:"none"}}>멤버 신청</Btn>}
        {recruit&&isMem&&<Btn v="ghost" style={{flex:"none",fontSize:13,height:44,color:C.muted,border:`1px solid ${C.line}`}}>멤버 탈퇴</Btn>}
        {isOp&&<Btn v="ghost" style={{flex:"none"}}>운영하기</Btn>}
      </div>
    </div>
    {isMem&&<div style={{margin:"12px 16px",padding:"12px 14px",background:C.subtle,borderRadius:R.lg,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:C.sub}}>운영자에게 건의/제보</span><span style={{fontSize:13,color:C.brand,fontWeight:700,cursor:"pointer"}}>보내기 →</span></div>}
    {isMem?<>
      <SH>참여 가능한 이슈</SH>
      {[{t:"이번 데이트 선택, 어떻게 읽히나",op:"감정보다 전략으로 읽힙니다",r:"",s:"진행 중",c:28,u:53,nr:true},{t:"이번 회차의 진짜 전환점은 어디였나",op:"말보다 침묵의 장면이 핵심",r:"@닉A 이건 대사보다 연출 의도를...",s:"진행 중",c:36,u:71}].map((x,i)=><div key={i} style={{padding:"14px 16px",borderBottom:`1px solid ${C.lineSoft}`}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>{x.nr&&<div style={{width:7,height:7,borderRadius:"50%",background:C.brand,flexShrink:0}}/>}<span style={{fontSize:15,fontWeight:700,color:C.title,flex:1,lineHeight:1.4}}>{x.t}</span><StatusBadge s={x.s}/></div>
        <div style={{fontSize:13,color:C.muted,marginBottom:4}}>운영자 한 줄 · {x.op}</div>
        {x.r?<div style={{fontSize:13,color:C.body}}>{x.r}</div>:<div style={{fontSize:12,color:C.ph,fontStyle:"italic"}}>아직 대표 댓글이 없습니다</div>}
        <Meta up={x.u} cmt={x.c} style={{marginTop:6}}/>
      </div>)}
      <SH>지난 이슈</SH>
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.lineSoft}`}}><div style={{fontSize:15,fontWeight:700,color:C.title,marginBottom:4}}>지난 회차, 가장 갈린 장면은?</div><div style={{fontSize:13,color:C.muted}}>운영자 한 줄 · 행동보다 맥락으로 봐주세요</div><div style={{fontSize:13,color:C.body,marginTop:4}}>@닉C 그 장면은 연출 의도가 확실히...</div><Meta up={41} cmt={22} style={{marginTop:6}}/></div>
    </>:<>
      <SH>대표 이슈</SH>
      <div style={{margin:"0 16px 10px",border:`1.5px solid ${C.brand}`,borderRadius:R.card,padding:18,background:C.brandSoft}}>
        <div style={{fontSize:17,fontWeight:700,color:C.title,marginBottom:6}}>이번 회차의 진짜 전환점은 어디였나</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:8}}>운영자 한 줄 · 말보다 침묵의 장면이 핵심입니다.</div>
        <RepComment nick="@닉A" text="대사보다 리액션 컷과 침묵의 타이밍에서 제작진의 의도가 더 선명하게 드러납니다." compact/>
        <Meta up={71} cmt={36}/>
      </div>
      <SH>최신 이슈</SH>
      {[{t:"이번 데이트 선택, 어떻게 읽히나",op:"감정보다 전략으로 읽힙니다",r:"@닉B 이건 호감보다 연출에 가까워 보입니다.",s:"진행 중",c:28,u:53},{t:"지난 회차, 가장 갈린 장면은?",op:"행동보다 맥락으로 봐주세요",r:"@닉C 그 장면은 연출 의도가 확실히 있습니다.",s:"종료",c:22,u:41}].map((x,i)=><div key={i} style={{padding:"14px 16px",borderBottom:`1px solid ${C.lineSoft}`}}>
        <div style={{fontSize:15,fontWeight:700,color:C.title,marginBottom:4,lineHeight:1.4}}>{x.t}</div>
        <div style={{fontSize:13,color:C.muted,marginBottom:4}}>운영자 한 줄 · {x.op}</div>
        <div style={{fontSize:13,color:C.body}}>{x.r}</div>
        <Meta up={x.u} cmt={x.c} style={{marginTop:6}}/>
      </div>)}
    </>}
  </div>;
}

/* ─── ISSUE DETAIL ─── */
function IssueDetailScreen({state}){
  const canCmt=state==="Member/Operator";const isSub=state==="Subscriber(구독만)";const noRep=state==="대표 댓글 없음";
  const [sort,setSort]=useState("popular");
  return <div>
    <TopBar left="룸으로"/>
    <div style={{padding:16,borderBottom:`1px solid ${C.line}`}}>
      <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"7px 10px",borderRadius:R.full,background:C.brandSoft,color:C.brand,fontSize:12,fontWeight:700}}>나는 솔로 해석 룸</span>
      <div style={{marginTop:14,fontSize:24,fontWeight:700,color:C.title,lineHeight:1.3,letterSpacing:"-0.03em"}}>이번 데이트 선택, 어떻게 읽히나</div>
      <div style={{marginTop:8,fontSize:13,color:C.muted}}>2025.03.15 · 조회 421</div>
      <div style={{marginTop:14,fontSize:14,color:C.muted}}>운영자 한 줄 · 행동보다 편집 포인트에 주목해주세요.</div>
      <div style={{marginTop:10,background:C.brandSoft,borderLeft:`2px solid ${C.brand}`,borderRadius:R.lg,padding:"10px 12px",fontSize:14,fontWeight:600,color:C.title}}>질문 · 이 선택은 감정보다 전략에 가까웠나?</div>
      <div style={{padding:"16px 0",fontSize:15,lineHeight:1.72,color:C.body}}>이번 장면은 표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에 핵심이 있습니다. 두 출연자의 반응 컷을 교차 배치한 방식이 특정 해석을 유도하고 있기 때문입니다.</div>
      <MediaBlock h={120} seed={1}/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        {["업보트 53","스크랩","신고"].map((a,i)=><div key={i} style={{height:36,padding:"0 12px",border:`1px solid ${C.line}`,borderRadius:R.full,display:"inline-flex",alignItems:"center",fontSize:12,color:i===2?C.ph:C.body,background:"#fff",cursor:"pointer"}}>{a}</div>)}
      </div>
    </div>
    {!noRep&&<><SH>대표 댓글</SH><div style={{margin:"0 16px 14px",border:`1px solid ${C.line}`,borderRadius:R.card,padding:18,background:"#fff"}}><RepComment nick="@닉A" text="호감 표현이 아니라 편집 의도가 드러나는 순간이라고 봅니다. 시선 처리와 반응 컷 배치를 보면 제작진이 특정 프레임을 만들어 주고 있어요."/></div></>}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 16px 10px"}}>
      <SH>전체 댓글</SH>
      <div style={{display:"flex",gap:6}}>{[{k:"popular",l:"인기순"},{k:"latest",l:"최신순"}].map(s=><span key={s.k} onClick={()=>setSort(s.k)} style={{height:32,padding:"0 10px",borderRadius:R.full,background:sort===s.k?C.title:C.subtle,color:sort===s.k?"#fff":C.muted,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",cursor:"pointer"}}>{s.l}</span>)}</div>
    </div>
    {[{n:"@닉C",t:"전략이 전혀 없었다고 보긴 어렵지만, 결국 편집 타이밍이 특정 해석을 강하게 밀어 주고 있었던 것 같습니다.",u:12,time:"2시간 전",reply:{n:"@닉D",t:"동의합니다. 마지막 리액션 컷이 가장 결정적이었어요.",time:"1시간 전"}},{n:"@닉F",t:"편집보다 출연자 본인의 선택이 더 컸다고 봅니다. 그래서 더 흥미롭기도 했고요.",u:8,time:"3시간 전"}].map((c,i)=><div key={i} style={{padding:"14px 16px",borderBottom:`1px solid ${C.lineSoft}`}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:12}}><span style={{fontWeight:700,color:C.title}}>{c.n}</span><span style={{color:C.muted}}>{c.time}</span></div>
      <div style={{fontSize:14,lineHeight:1.6,color:C.body}}>{c.t}</div>
      <div style={{marginTop:8,fontSize:12,color:C.muted,display:"flex",gap:12}}>▲ {c.u}<span>답글</span><span>스크랩</span></div>
      {c.reply&&<div style={{marginTop:10,marginLeft:14,paddingLeft:12,borderLeft:`2px solid ${C.line}`}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4,fontSize:12}}><span style={{fontWeight:700,color:C.title}}>{c.reply.n}</span><span style={{color:C.muted}}>{c.reply.time}</span></div>
        <div style={{fontSize:13,lineHeight:1.6,color:C.body}}>{c.reply.t}</div>
      </div>}
    </div>)}
    {/* Composer */}
    <div style={{borderTop:`1px solid ${C.line}`,padding:"12px 16px",display:"flex",gap:10,background:"#fff",position:"sticky",bottom:0}}>
      {canCmt?<><div style={{flex:1,height:52,border:`1px solid ${C.line}`,borderRadius:R.lg,display:"flex",alignItems:"center",padding:"0 14px",color:C.ph,fontSize:14}}>댓글을 입력하세요...</div><div style={{width:52,height:52,borderRadius:R.lg,border:`1px solid ${C.line}`,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted}}>{Ic.attach}</div><Btn style={{minWidth:72,height:52}}>작성</Btn></>:
      <div style={{flex:1,textAlign:"center",padding:"10px 0"}}><div style={{fontSize:13,color:C.muted,marginBottom:10}}>{isSub?"댓글은 멤버만 작성할 수 있습니다":"이 룸을 구독하면 댓글을 읽을 수 있습니다"}</div><Btn style={{height:44,fontSize:14}}>{isSub?"댓글 멤버 신청하기":"이 룸 구독하러 가기"}</Btn></div>}
    </div>
  </div>;
}

/* ─── PROFILE ─── */
function ProfileScreen({state}){const me=state==="내 프로필";
  return <div>
    <TopBar right={me?<span style={{fontSize:14,color:C.brand,fontWeight:700,cursor:"pointer"}}>편집</span>:null}/>
    <div style={{padding:"28px 16px 20px",textAlign:"center"}}>
      <div style={{width:80,height:80,borderRadius:"50%",background:C.subtle,border:`1px solid ${C.line}`,margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,color:C.muted}}>{me?"K":"J"}</div>
      <div style={{fontSize:20,fontWeight:700,color:C.title}}>{me?"@김해석":"@정분석"}</div>
      <div style={{fontSize:14,color:C.muted,marginTop:4}}>{me?"콘텐츠를 맥락으로 읽는 사람":"데이터로 세상을 봅니다"}</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:20}}>
        {[{l:"작성 댓글",v:me?47:23},{l:"받은 좋아요",v:me?312:89},{l:"대표 선정",v:me?8:3},{l:"구독 룸",v:me?3:5}].map((s,i)=><div key={i} style={{padding:"12px 4px",background:C.subtle,borderRadius:R.lg}}>
          <div style={{fontSize:20,fontWeight:700,color:C.title}}>{s.v}</div><div style={{fontSize:10,color:C.muted,marginTop:3}}>{s.l}</div>
        </div>)}
      </div>
    </div>
    <SH>대표로 선정된 댓글</SH>
    {[{t:"도입보다 과금 구조가 더 관건이라는 이야기가...",iss:"FSD 한국 도입",rm:"테슬라 한국 실사용자 룸"},{t:"호감보다 편집 의도가 드러나는 순간...",iss:"이번 선택, 진짜 의도?",rm:"나는 솔로 해석 룸"}].map((c,i)=><div key={i} style={{padding:"12px 16px",borderBottom:`1px solid ${C.lineSoft}`,borderLeft:`2px solid ${C.brand}`,marginLeft:16,paddingLeft:14}}><div style={{fontSize:13,color:C.body,lineHeight:1.5,marginBottom:4}}>{c.t}</div><div style={{fontSize:11,color:C.ph}}>→ {c.iss} · {c.rm}</div></div>)}
    <SH>최근 댓글</SH>
    {[{t:"편집보다 출연자 의도가 더 크다고 봅니다.",iss:"이번 데이트 선택",time:"2시간 전"},{t:"3장 후반부 논증 구조가 좀 약합니다.",iss:"이번 장의 핵심 질문",time:"1일 전"}].map((c,i)=><div key={i} style={{padding:"12px 16px",borderBottom:`1px solid ${C.lineSoft}`}}><div style={{fontSize:13,color:C.body,marginBottom:3}}>{c.t}</div><div style={{fontSize:11,color:C.ph}}>→ {c.iss} · {c.time}</div></div>)}
    <SH>참여 중인 룸</SH>
    {["나는 솔로 해석 룸","테슬라 한국 실사용자 룸"].map((r,i)=><div key={i} style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${C.lineSoft}`}}><Thumb size={32} seed={i}/><span style={{fontSize:14,color:C.title}}>{r}</span></div>)}
  </div>;
}

/* ─── MYPAGE ─── */
function ProfileBar(){return<div style={{padding:16,display:"flex",alignItems:"center",gap:14,borderBottom:`1px solid ${C.line}`}}>
  <div style={{width:48,height:48,borderRadius:"50%",background:C.subtle,border:`1px solid ${C.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:C.muted}}>K</div>
  <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,color:C.title}}>@김해석</div><div style={{fontSize:13,color:C.muted}}>콘텐츠를 맥락으로 읽는 사람</div></div>
  <span style={{fontSize:12,color:C.brand,fontWeight:700,cursor:"pointer"}}>프로필 →</span>
</div>;}
function RI({n,act,seed}){return<div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${C.lineSoft}`}}><Thumb size={32} seed={seed||0}/><span style={{fontSize:14,color:C.title,flex:1}}>{n}</span>{act&&<span style={{padding:"5px 12px",background:C.subtle,borderRadius:R.md,fontSize:12,color:C.sub,fontWeight:600}}>{act}</span>}</div>;}
function Pills({items,a,set}){return<div style={{display:"flex",gap:6,padding:"12px 16px"}}>{items.map(s=><span key={s.k} onClick={()=>set(s.k)} style={{height:32,padding:"0 12px",borderRadius:R.full,background:a===s.k?C.title:C.subtle,color:a===s.k?"#fff":C.muted,fontSize:12,fontWeight:700,display:"flex",alignItems:"center",cursor:"pointer"}}>{s.l}</span>)}</div>;}
function MI({t,r}){return<div style={{padding:"12px 16px",borderBottom:`1px solid ${C.lineSoft}`}}><div style={{fontSize:14,fontWeight:700,color:C.title,marginBottom:3}}>{t}</div><div style={{fontSize:11,color:C.muted}}>{r}</div></div>;}
function MC({n,t,iss}){return<div style={{padding:"12px 16px",borderBottom:`1px solid ${C.lineSoft}`}}><div style={{fontSize:12,fontWeight:700,color:C.sub,marginBottom:3}}>{n}</div><div style={{fontSize:13,color:C.body,marginBottom:3}}>{t}</div><div style={{fontSize:11,color:C.ph}}>→ {iss}</div></div>;}

function MyPageScreen({state}){
  const [sub,setSub]=useState("scrap");
  if(state.includes("Empty"))return<div><div style={{padding:16}}><div style={{fontSize:24,fontWeight:700,color:C.title}}>마이페이지</div></div><ProfileBar/><div style={{padding:"60px 24px",textAlign:"center",fontSize:14,color:C.muted}}>아직 활동 내역이 없습니다</div></div>;
  const at=state==="이슈 탭"?1:state==="댓글 탭"?2:0;
  return <div>
    <div style={{padding:16}}><div style={{fontSize:24,fontWeight:700,color:C.title}}>마이페이지</div></div>
    <ProfileBar/>
    <div style={{display:"flex",borderBottom:`1px solid ${C.line}`}}>{["룸","이슈","댓글"].map((t,i)=><div key={t} style={{flex:1,padding:"13px 0",textAlign:"center",fontSize:14,fontWeight:at===i?700:400,color:at===i?C.title:C.muted,borderBottom:at===i?`2px solid ${C.brand}`:"2px solid transparent",cursor:"pointer"}}>{t}</div>)}</div>
    {at===0&&<><SH>구독 중</SH><RI n="나는 솔로 해석 룸" seed={0}/><RI n="리벨북스 비문학 스터디" seed={2}/><SH>참여 중</SH><RI n="흑백요리사 해석 룸" seed={4}/><SH>운영 중</SH><RI n="테슬라 한국 실사용자 룸" seed={3} act="운영하기"/></>}
    {at===1&&<><Pills items={[{k:"scrap",l:"스크랩"},{k:"written",l:"작성"},{k:"upvoted",l:"업보트"}]} a={sub} set={setSub}/>{sub==="scrap"&&<><MI t="이번 데이트 선택" r="나는 솔로 해석 룸"/><MI t="올해 테슬라 가격 전략" r="테슬라 한국 실사용자 룸"/></>}{sub==="written"&&<MI t="FSD 한국 도입" r="테슬라 한국 실사용자 룸"/>}{sub==="upvoted"&&<><MI t="이번 장의 핵심 질문" r="리벨북스 비문학 스터디"/><MI t="이번 선택, 진짜 의도?" r="나는 솔로 해석 룸"/></>}</>}
    {at===2&&<><Pills items={[{k:"scrap",l:"스크랩"},{k:"written",l:"작성"},{k:"upvoted",l:"업보트"}]} a={sub} set={setSub}/>{sub==="scrap"&&<MC n="@닉A" t="도입보다 과금 구조가 더 관건..." iss="FSD 한국 도입"/>}{sub==="written"&&<><MC n="나" t="편집보다 출연자 의도가 더 크다고 봅니다." iss="이번 데이트 선택"/><MC n="나" t="3장 후반부 논증 구조가 좀 약합니다." iss="이번 장의 핵심 질문"/></>}{sub==="upvoted"&&<MC n="@닉B" t="호감보다 편집 의도가 드러나는 순간..." iss="이번 선택, 진짜 의도?"/>}</>}
  </div>;
}

/* ─── OPERATOR: ROOM SETTINGS ─── */
function RoomSettingsScreen(){
  return <div>
    <TopBar left="설정" right={<Btn style={{height:36,fontSize:13,padding:"0 16px"}}>저장</Btn>}/>
    <div style={{padding:16,display:"flex",flexDirection:"column",gap:16}}>
      {/* Section 1: Basic */}
      <div style={{border:`1px solid ${C.line}`,borderRadius:R.xl,padding:16,background:"#fff"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.title,marginBottom:14}}>기본 정보</div>
        <div style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:8}}>룸 대표 이미지</div>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}><Thumb size={64} seed={3}/><Btn v="outline" style={{height:36,fontSize:13,padding:"0 14px"}}>이미지 변경</Btn></div>
        {[{l:"룸 이름",v:"테슬라 한국 실사용자 룸"},{l:"한 줄 설명",v:"루머보다 해석, 드립보다 이유"},{l:"상세 설명",v:"실사용/가격/정책 관점의 반응을 모읍니다",m:true}].map(f=><div key={f.l} style={{marginBottom:14}}><div style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:6}}>{f.l}</div><div style={{height:f.m?70:52,border:`1px solid ${C.line}`,borderRadius:R.lg,padding:"0 14px",display:"flex",alignItems:f.m?"flex-start":"center",paddingTop:f.m?12:0,fontSize:14,color:C.title,background:"#fff",boxSizing:"border-box"}}>{f.v}</div></div>)}
      </div>
      {/* Section 2: Policy */}
      <div style={{border:`1px solid ${C.line}`,borderRadius:R.xl,padding:16,background:"#fff"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.title,marginBottom:14}}>운영 정책</div>
        <div style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:8}}>멤버 신청</div>
        <div style={{display:"flex",gap:8,marginBottom:6}}>{["받지 않음","받는 중"].map((t,i)=><div key={t} style={{flex:1,height:44,border:i===1?`2px solid ${C.success}`:`1px solid ${C.line}`,borderRadius:R.lg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:i===1?C.success:C.muted,background:i===1?C.successSoft:"#fff",cursor:"pointer"}}>{t}</div>)}</div>
        <div style={{fontSize:11,color:C.ph,marginBottom:16}}>&quot;받는 중&quot; 선택 시 룸 상세에 멤버 신청 버튼이 노출됩니다</div>
        <div style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:8}}>공개 상태</div>
        <div style={{display:"flex",gap:8}}>{["비공개","공개"].map((t,i)=><div key={t} style={{flex:1,height:44,border:i===1?`2px solid ${C.success}`:`1px solid ${C.line}`,borderRadius:R.lg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:i===1?C.success:C.muted,background:i===1?C.successSoft:"#fff",cursor:"pointer"}}>{t}</div>)}</div>
      </div>
      {/* Section 3: Members */}
      <div style={{border:`1px solid ${C.line}`,borderRadius:R.xl,padding:16,background:"#fff"}}>
        <div style={{fontSize:14,fontWeight:700,color:C.title,marginBottom:14}}>멤버 관리</div>
        {["@userA","@userB"].map(u=><div key={u} style={{padding:"12px 0",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${C.lineSoft}`}}><span style={{fontSize:14,color:C.title}}>{u}</span><span style={{fontSize:12,color:C.danger,fontWeight:500,cursor:"pointer"}}>제거</span></div>)}
        <div style={{marginTop:10,height:44,border:`1px dashed ${C.line}`,borderRadius:R.lg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:C.muted,cursor:"pointer"}}>+ 사용자 검색 후 추가</div>
      </div>
    </div>
  </div>;
}

/* ─── OPERATOR: ISSUE PUBLISH ─── */
function IssuePublishScreen({state}){
  const edit=state==="이슈 수정";
  return <div>
    <TopBar left={edit?"이슈 수정":"새 이슈 발행"} right={<Btn style={{height:36,fontSize:13,padding:"0 16px"}}>{edit?"수정":"발행"}</Btn>}/>
    <div style={{padding:16,display:"flex",flexDirection:"column",gap:14}}>
      {[{l:"제목",v:edit?"FSD 한국 도입, 올해 안 가능할까?":"",ph:"이슈 제목을 입력하세요"},{l:"운영자 한 줄",v:edit?"일정보다 가격/체감이 핵심":"",ph:"이 이슈를 어떤 관점으로 볼지 한 줄로"},{l:"질문 (선택)",v:"",ph:"댓글을 끌어낼 질문"},{l:"본문",v:edit?"이번 FSD 도입 논의에서...":"",ph:"본문을 입력하세요",m:true}].map(f=><div key={f.l}><div style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:6}}>{f.l}</div><div style={{height:f.m?80:52,border:`1px solid ${C.line}`,borderRadius:R.lg,padding:f.m?"12px 14px":"0 14px",display:"flex",alignItems:f.m?"flex-start":"center",fontSize:14,color:f.v?C.title:C.ph,background:"#fff",boxSizing:"border-box"}}>{f.v||f.ph}</div></div>)}
      <div style={{height:60,border:`1px dashed ${C.line}`,borderRadius:R.lg,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:13,background:C.subtle}}>이미지 / 링크 / 유튜브 첨부</div>
      <div><div style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:8}}>이슈 상태</div>
        <div style={{display:"flex",gap:6}}>{[{l:"초안",a:false,c:C.warning},{l:"진행 중",a:true,c:C.success},{l:"종료",a:false,c:C.muted},{l:"숨김",a:false,c:C.danger}].map(s=><div key={s.l} style={{flex:1,height:40,border:s.a?`2px solid ${s.c}`:`1px solid ${C.line}`,borderRadius:R.md,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:s.a?s.c:C.muted,background:s.a?`${s.c}11`:"#fff",cursor:"pointer"}}>{s.l}</div>)}</div>
        <div style={{fontSize:11,color:C.ph,marginTop:6}}>초안 = 임시저장 · 숨김 = 공개 후 비노출</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <div style={{flex:1,height:44,padding:"0 14px",display:"flex",alignItems:"center",gap:10,background:C.subtle,borderRadius:R.lg}}><div style={{width:18,height:18,border:`2px solid ${C.line}`,borderRadius:4}}/><span style={{fontSize:13,color:C.sub}}>대표 이슈로 설정</span></div>
        <div style={{flex:1,height:44,padding:"0 14px",display:"flex",alignItems:"center",gap:10,background:C.dangerSoft,borderRadius:R.lg}}><div style={{width:18,height:18,border:`2px solid ${C.danger}44`,borderRadius:4,background:"#fff"}}/><span style={{fontSize:13,color:C.danger}}>스포일러 포함</span></div>
      </div>
      {edit&&<Btn v="danger" full style={{height:44,fontSize:14}}>삭제</Btn>}
    </div>
  </div>;
}

/* ─── OPERATOR: REP COMMENT ─── */
function RepCommentScreen(){
  return <div>
    <TopBar left="대표 댓글 지정"/>
    <div style={{padding:16}}>
      <div style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:6}}>이슈</div>
      <div style={{height:52,border:`1px solid ${C.line}`,borderRadius:R.lg,display:"flex",alignItems:"center",padding:"0 14px",fontSize:14,color:C.title,marginBottom:18}}>FSD 한국 도입, 올해 안 가능할까?</div>
    </div>
    <div style={{padding:"0 16px 14px"}}>
      <div style={{fontSize:12,fontWeight:500,color:C.muted,marginBottom:10}}>현재 대표 댓글 (1개)</div>
      <div style={{border:`1px solid ${C.line}`,borderRadius:R.card,padding:16,background:"#fff"}}>
        <RepComment nick="@닉A" text="도입보다 과금 구조가 더 관건이라는 이야기가 많은데, 실제로 한국 시장에서 FSD 월정액 모델이 성립하려면..."/>
        <div style={{marginTop:10,textAlign:"right"}}><Btn v="danger" style={{height:32,fontSize:12,padding:"0 14px"}}>해제</Btn></div>
      </div>
    </div>
    <SH>전체 댓글</SH>
    {[{n:"@닉B",t:"이번 건은 일정 자체보다 인프라 준비가..."},{n:"@닉C",t:"오히려 OTA 체감이 더 중요한 포인트라고..."},{n:"@닉D",t:"국내 가격 포지셔닝이 결국 핵심일 것..."}].map((c,i)=><div key={i} style={{padding:"14px 16px",borderBottom:`1px solid ${C.lineSoft}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
      <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:C.title,marginBottom:4}}>{c.n}</div><div style={{fontSize:13,lineHeight:1.5,color:C.body}}>{c.t}</div></div>
      <Btn v="outline" style={{height:32,fontSize:12,padding:"0 14px",flexShrink:0}}>지정</Btn>
    </div>)}
  </div>;
}

/* ═══ INFO PANEL ═══ */
const INFO={feed:{r:"/feed",p:"구독 룸의 최신 이슈를 editorial feed로 소비",d:["구독 Room strip","Featured issue cards","대표 댓글 signature module"],cta:["이슈 읽기","룸 보기"],n:"대표 댓글 지정 이슈만 노출. 5줄 제한."},issues:{r:"/issues",p:"공개 이슈를 빠르게 스캔하는 compact list",d:["이슈 row: 제목+운영자+대표 snippet","스포일러 블라인드 처리"],cta:["이슈 읽기","룸 보기"],n:"진행 중은 배지 미표시, 종료만 neutral badge."},rooms:{r:"/rooms",p:"공개 룸을 발견하고 구독/멤버 신청",d:["Room discovery card","멤버 모집 배지","이슈/구독자 stats"],cta:["구독하기","멤버 신청"],n:"멤버 모집 중인 룸에만 신청 버튼 노출."},room:{r:"/rooms/:slug",p:"룸의 결을 이해하고 구독/멤버 결정",d:["Room hero + manifesto","대표 이슈 highlight","최신 이슈 list"],cta:["구독하기","멤버 신청","운영하기"],n:"Member는 intro collapsed + 참여 이슈 우선."},issue:{r:"/rooms/:slug/issues/:id",p:"이슈 본문 + 대표 댓글 + 토론 소비",d:["Article body","Question block","대표 댓글 signature","Threaded comments"],cta:["업보트","스크랩","댓글 작성"],n:"Visitor→구독, Subscriber→멤버신청, Member→댓글."},mypage:{r:"/me",p:"개인 활동과 룸 관계 허브",d:["Profile summary","룸/이슈/댓글 탭"],cta:["룸 보기","운영하기"],n:"Underline 1차 탭 + pill 2차 탭."},profile:{r:"/users/:id",p:"해석의 질감이 느껴지는 프로필",d:["Stats grid","대표 선정 댓글","최근 댓글"],cta:["편집"],n:"대표 선정 횟수가 핵심 업적."},"room-settings":{r:"/operator/rooms/:id/settings",p:"운영자 룸 관리 — 같은 브랜드 시스템",d:["기본 정보 card","운영 정책 card","멤버 관리 card"],cta:["저장"],n:"섹션 카드로 나눠 정리."},"issue-publish":{r:"/operator/rooms/:id/issues/new",p:"이슈 발행/수정 폼",d:["Form fields","상태 selector","옵션 cards"],cta:["발행","수정","삭제"],n:"상태: 초안/진행 중/종료/숨김."},"rep-comment":{r:"/operator/issues/:id/comments",p:"대표 댓글 1개 지정",d:["현재 대표","전체 댓글 list"],cta:["지정","해제"],n:"1개만 지정 가능."}};

function InfoPanel({id}){const i=INFO[id];if(!i)return null;return<div style={{padding:20,background:"#fff",borderRadius:18,border:`1px solid ${C.line}`,fontSize:13,color:C.body,lineHeight:1.65,maxWidth:380,fontFamily:F,boxShadow:"0 6px 24px rgba(23,23,23,0.06)"}}>
  <div style={{fontSize:10,fontWeight:700,color:C.ph,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.08em"}}>Route</div>
  <div style={{fontFamily:"ui-monospace,monospace",fontSize:12,color:C.brand,background:C.brandSoft,padding:"5px 10px",borderRadius:R.md,display:"inline-block",marginBottom:16}}>{i.r}</div>
  <div style={{fontSize:10,fontWeight:700,color:C.ph,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.08em"}}>목적</div><div style={{marginBottom:16}}>{i.p}</div>
  <div style={{fontSize:10,fontWeight:700,color:C.ph,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>핵심 데이터</div><div style={{marginBottom:16}}>{i.d.map((d,j)=><div key={j} style={{display:"flex",gap:8,marginBottom:4}}><span style={{color:C.brand,fontSize:6,marginTop:6}}>●</span>{d}</div>)}</div>
  <div style={{fontSize:10,fontWeight:700,color:C.ph,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.08em"}}>주요 CTA</div><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:16}}>{i.cta.map((c,j)=><Badge key={j} text={c} v="brand"/>)}</div>
  <div style={{fontSize:10,fontWeight:700,color:C.ph,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.08em"}}>비고</div><div style={{fontSize:12,color:C.sub}}>{i.n}</div>
</div>;}

/* ═══ MAIN ═══ */
export default function PIVITViewer(){
  const [scr,setScr]=useState("feed");const [si,setSi]=useState(0);
  const sts=STATES[scr]||["기본"];const sn=sts[si]||sts[0];
  const go=id=>{setScr(id);setSi(0);};const meta=SCREENS.find(s=>s.id===scr);
  const render=()=>{switch(scr){
    case "feed":return<FeedScreen state={sn}/>;case "issues":return<IssueListScreen state={sn}/>;case "rooms":return<RoomListScreen state={sn}/>;case "room":return<RoomScreen state={sn}/>;case "issue":return<IssueDetailScreen state={sn}/>;case "mypage":return<MyPageScreen state={sn}/>;case "profile":return<ProfileScreen state={sn}/>;case "room-settings":return<RoomSettingsScreen/>;case "issue-publish":return<IssuePublishScreen state={sn}/>;case "rep-comment":return<RepCommentScreen/>;default:return null;}};
  return <div style={{fontFamily:F,maxWidth:920,margin:"0 auto"}}>
    <div style={{marginBottom:24,display:"grid",gap:12}}>
      <div style={{padding:"18px 20px",borderRadius:18,border:`1px solid ${C.line}`,background:"#fff",boxShadow:"0 6px 24px rgba(23,23,23,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}><div><div style={{fontSize:13,fontWeight:700,color:C.brand}}>1. 페이지 선택</div><div style={{fontSize:13,color:C.muted,marginTop:3}}>미리보기를 다른 페이지로 바꿉니다.</div></div><Badge text={`현재: ${meta?.label||scr}`} v="brand"/></div>
        {[{k:"user",l:"사용자 화면"},{k:"operator",l:"운영자 화면"}].map(g=><div key={g.k} style={{marginBottom:12}}><div style={{fontSize:10,fontWeight:700,color:C.ph,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{g.l}</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{SCREENS.filter(s=>s.g===g.k).map(s=><button key={s.id} onClick={()=>go(s.id)} style={{padding:"8px 14px",borderRadius:R.md,cursor:"pointer",fontSize:13,fontFamily:F,border:scr===s.id?`1.5px solid ${C.brand}`:`1px solid ${C.line}`,background:scr===s.id?C.brandSoft:"#fff",color:scr===s.id?C.brand:C.sub,fontWeight:scr===s.id?700:400}}>{s.label}</button>)}</div></div>)}
      </div>
      <div style={{padding:"18px 20px",borderRadius:18,border:`1px solid ${C.line}`,background:"#fff",boxShadow:"0 6px 24px rgba(23,23,23,0.06)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}><div><div style={{fontSize:13,fontWeight:700,color:C.success}}>2. 상태 전환</div><div style={{fontSize:13,color:C.muted,marginTop:3}}>권한·모집·빈 상태 비교</div></div><Badge text={`현재: ${sn}`} v="success"/></div>
        {sts.length>1?<div style={{display:"flex",flexWrap:"wrap",gap:6}}>{sts.map((s,i)=><button key={s} onClick={()=>setSi(i)} style={{padding:"6px 14px",borderRadius:R.full,cursor:"pointer",fontSize:12,fontFamily:F,border:si===i?`1.5px solid ${C.success}`:`1px solid ${C.line}`,background:si===i?C.successSoft:"#fff",color:si===i?C.success:C.sub,fontWeight:si===i?700:400}}>{s}</button>)}</div>:<div style={{fontSize:12,color:C.ph,padding:"10px 14px",borderRadius:R.lg,border:`1px dashed ${C.line}`}}>추가 상태 없음</div>}
      </div>
    </div>
    <div style={{display:"flex",gap:28,alignItems:"flex-start",flexWrap:"wrap"}}>
      <Phone tab={["feed","issues","rooms","mypage"].includes(scr)?scr:undefined} onTab={go}>{render()}</Phone>
      <InfoPanel id={scr}/>
    </div>
  </div>;
}
