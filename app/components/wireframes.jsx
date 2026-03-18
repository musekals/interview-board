'use client';

import { useState } from "react";

const SCREENS = [
  { id: "feed", label: "내 피드(홈)", group: "user" },
  { id: "issues", label: "이슈 목록", group: "user" },
  { id: "room", label: "룸 상세", group: "user" },
  { id: "issue", label: "이슈 상세", group: "user" },
  { id: "mypage", label: "마이페이지", group: "user" },
  { id: "login", label: "로그인/온보딩", group: "user" },
  { id: "room-settings", label: "룸 설정", group: "operator" },
  { id: "issue-publish", label: "이슈 발행/수정", group: "operator" },
  { id: "rep-comment", label: "대표 댓글 지정", group: "operator" },
  { id: "admin", label: "어드민 룸 관리", group: "admin" },
];

const STATES = {
  feed: ["기본", "구독 룸 없음(Empty)", "Loading"],
  issues: ["기본", "이슈 없음(Empty)", "Loading"],
  room: ["Visitor", "Subscriber", "Member", "Operator", "대표 이슈 없음"],
  issue: ["Visitor/Subscriber", "Member/Operator", "대표 댓글 없음"],
  mypage: ["기본", "구독 없음(Empty)"],
  login: ["로그인", "회원가입"],
  "room-settings": ["기본"],
  "issue-publish": ["새 이슈", "이슈 수정"],
  "rep-comment": ["기본"],
  admin: ["기본"],
};

function StatusBadge({ text, color }) {
  const colors = {
    blue: { bg: "#E6F1FB", text: "#185FA5", border: "#85B7EB" },
    green: { bg: "#EAF3DE", text: "#3B6D11", border: "#97C459" },
    gray: { bg: "#F1EFE8", text: "#5F5E5A", border: "#B4B2A9" },
    amber: { bg: "#FAEEDA", text: "#854F0B", border: "#EF9F27" },
    coral: { bg: "#FAECE7", text: "#993C1D", border: "#F0997B" },
    purple: { bg: "#EEEDFE", text: "#534AB7", border: "#AFA9EC" },
    teal: { bg: "#E1F5EE", text: "#0F6E56", border: "#5DCAA5" },
  };
  const c = colors[color] || colors.gray;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 500,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        letterSpacing: "-0.01em",
      }}
    >
      {text}
    </span>
  );
}

function Phone({ children }) {
  return (
    <div
      style={{
        width: 360,
        minHeight: 640,
        background: "#fff",
        borderRadius: 32,
        border: "2px solid #D3D1C7",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        flexShrink: 0,
      }}
    >
      {/* Status bar */}
      <div
        style={{
          height: 44,
          background: "#FAFAF8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #EEEDEA",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 100,
            height: 6,
            background: "#D3D1C7",
            borderRadius: 3,
          }}
        />
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
      {/* Bottom nav */}
      <div
        style={{
          height: 56,
          background: "#FAFAF8",
          borderTop: "1px solid #EEEDEA",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 12px",
          flexShrink: 0,
        }}
      >
        {[
          { icon: "⌂", label: "피드" },
          { icon: "☰", label: "이슈" },
          { icon: "◉", label: "룸" },
          { icon: "⊕", label: "마이" },
        ].map((n, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              fontSize: 10,
              color: i === 0 ? "#534AB7" : "#888780",
              fontWeight: i === 0 ? 600 : 400,
            }}
          >
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            {n.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function IssueCard({ room, title, opLine, repComment, status, showRoom = true }) {
  const statusColor =
    status === "진행 중" ? "green" : status === "종료" ? "gray" : "blue";
  return (
    <div
      style={{
        padding: "14px 16px",
        borderBottom: "1px solid #EEEDEA",
      }}
    >
      {showRoom && (
        <div
          style={{
            fontSize: 11,
            color: "#534AB7",
            fontWeight: 600,
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              background: "#EEEDFE",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
            }}
          >
            ◈
          </span>
          {room}
        </div>
      )}
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "#2C2C2A",
          margin: "4px 0",
          lineHeight: 1.35,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#5F5E5A",
          marginBottom: 6,
          display: "flex",
          alignItems: "flex-start",
          gap: 4,
        }}
      >
        <span style={{ color: "#888780", flexShrink: 0 }}>운영자:</span>
        <span style={{ fontStyle: "italic" }}>{opLine}</span>
      </div>
      {repComment && (
        <div
          style={{
            fontSize: 12,
            color: "#2C2C2A",
            background: "#F9F9F6",
            padding: "8px 10px",
            borderRadius: 8,
            borderLeft: "3px solid #AFA9EC",
            lineHeight: 1.4,
          }}
        >
          <span style={{ color: "#534AB7", fontWeight: 600, fontSize: 11 }}>
            대표 댓글
          </span>
          <br />
          {repComment}
        </div>
      )}
      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <StatusBadge text={status} color={statusColor} />
      </div>
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#5F5E5A",
        padding: "12px 16px 6px",
        background: "#FAFAF8",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </div>
  );
}

// ========= SCREEN RENDERERS =========

function FeedScreen({ state }) {
  if (state === "Loading")
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#888780" }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid #EEEDFE",
            borderTopColor: "#534AB7",
            borderRadius: "50%",
            margin: "0 auto 12px",
          }}
        />
        불러오는 중...
      </div>
    );
  if (state === "구독 룸 없음(Empty)")
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A", marginBottom: 8 }}>
          아직 구독한 룸이 없습니다
        </div>
        <div style={{ fontSize: 13, color: "#888780", marginBottom: 20, lineHeight: 1.5 }}>
          관심 있는 룸을 구독하면
          <br />
          이슈와 반응이 여기에 모입니다
        </div>
        <div
          style={{
            display: "inline-block",
            padding: "10px 24px",
            background: "#534AB7",
            color: "#fff",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          룸 둘러보기
        </div>
      </div>
    );
  return (
    <div>
      <div
        style={{
          padding: "14px 16px 8px",
          fontSize: 20,
          fontWeight: 700,
          color: "#2C2C2A",
        }}
      >
        내 피드
      </div>
      <IssueCard
        room="테슬라 한국 실사용자 룸"
        title="FSD 한국 도입, 올해 안 가능할까?"
        opLine="일정보다 가격/체감이 핵심이라 봅니다"
        repComment="@닉A 도입보다 과금 구조가 더 관건이라는 이야기가..."
        status="진행 중"
      />
      <IssueCard
        room="나는 솔로 해석 룸"
        title="이번 선택, 진짜 의도였을까?"
        opLine="행동보다 편집 포인트에 주목해주세요"
        repComment="@닉B 이번 장면은 호감보다 편집 의도가..."
        status="진행 중"
      />
      <IssueCard
        room="리벨북스 비문학 스터디"
        title="이번 장의 핵심 질문은 무엇인가"
        opLine="저자 결론보다 문제제기에 집중합시다"
        repComment="@닉E 오히려 이 대목이 저자의 핵심 논점을..."
        status="종료"
      />
    </div>
  );
}

function IssueListScreen({ state }) {
  if (state === "이슈 없음(Empty)")
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>
          아직 공개된 이슈가 없습니다
        </div>
      </div>
    );
  return (
    <div>
      <div
        style={{
          padding: "14px 16px 8px",
          fontSize: 20,
          fontWeight: 700,
          color: "#2C2C2A",
        }}
      >
        최신 이슈
      </div>
      <IssueCard
        room="나는 솔로 해석 룸"
        title="이번 데이트 선택, 어떻게 읽히나"
        opLine="감정보다 전략으로 읽힙니다"
        repComment="@닉D 이건 호감보다 계산에 가까워 보입니다"
        status="진행 중"
      />
      <IssueCard
        room="리벨북스 비문학 스터디"
        title="이번 장의 핵심 질문은 무엇인가"
        opLine="저자 결론보다 문제제기에 주목합시다"
        repComment="@닉E 오히려 이 대목이 더 중요합니다"
        status="종료"
      />
      <IssueCard
        room="테슬라 한국 실사용자 룸"
        title="FSD 한국 도입, 올해 안 가능할까?"
        opLine="일정보다 가격/체감이 핵심"
        repComment="@닉A 도입보다 과금 구조가 관건입니다"
        status="진행 중"
      />
    </div>
  );
}

function RoomScreen({ state }) {
  const isOp = state === "Operator";
  const noFeatured = state === "대표 이슈 없음";
  return (
    <div>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #EEEDEA",
        }}
      >
        <span style={{ fontSize: 14, color: "#888780" }}>← 뒤로</span>
        <span style={{ fontSize: 14, color: "#888780" }}>공유</span>
      </div>
      {/* Room info */}
      <div style={{ padding: "20px 16px 16px" }}>
        <div
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#2C2C2A",
            marginBottom: 6,
          }}
        >
          나는 솔로 해석 룸
        </div>
        <div style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 12, lineHeight: 1.5 }}>
          감정보다 맥락과 편집으로 봅니다
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#444441",
            background: "#F9F9F6",
            padding: "12px 14px",
            borderRadius: 10,
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          <div
            style={{ fontWeight: 600, fontSize: 12, color: "#888780", marginBottom: 6 }}
          >
            이 방은 이렇게 봅니다
          </div>
          • 장면의 의도와 편집 포인트를 같이 봅니다
          <br />• 한 줄 반응보다 이유 있는 댓글을 중시합니다
        </div>
        {/* CTA */}
        <div style={{ display: "flex", gap: 8 }}>
          {state === "Visitor" ? (
            <div
              style={{
                flex: 1,
                padding: "11px 0",
                background: "#534AB7",
                color: "#fff",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              구독하기
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                padding: "11px 0",
                background: "#EEEDFE",
                color: "#534AB7",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              구독 중 ✓
            </div>
          )}
          {isOp && (
            <div
              style={{
                padding: "11px 16px",
                background: "#F1EFE8",
                color: "#5F5E5A",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              운영하기
            </div>
          )}
        </div>
      </div>

      {/* Featured issue */}
      {!noFeatured && (
        <>
          <SectionHeader>대표 이슈</SectionHeader>
          <div
            style={{
              margin: "0 16px 8px",
              padding: 14,
              border: "1.5px solid #AFA9EC",
              borderRadius: 12,
              background: "#FCFCFA",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2A", marginBottom: 4 }}>
              이번 회차의 진짜 전환점은 어디였나
            </div>
            <div style={{ fontSize: 12, color: "#5F5E5A", marginBottom: 6, fontStyle: "italic" }}>
              운영자: &quot;말보다 침묵의 장면이 핵심&quot;
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#2C2C2A",
                background: "#F3F2FC",
                padding: "6px 10px",
                borderRadius: 6,
              }}
            >
              <span style={{ color: "#534AB7", fontWeight: 600, fontSize: 11 }}>
                대표
              </span>{" "}
              @닉A 이건 대사보다 연출 의도를...
            </div>
          </div>
        </>
      )}

      {/* Latest issues */}
      <SectionHeader>최신 이슈</SectionHeader>
      <IssueCard
        showRoom={false}
        room=""
        title="이번 데이트 선택, 어떻게 읽히나"
        opLine="감정보다 전략으로 읽힙니다"
        repComment="@닉B 이건 호감보다 연출에 가까워..."
        status="진행 중"
      />
      <IssueCard
        showRoom={false}
        room=""
        title="다음 회차 예고에서 가장 궁금한 점"
        opLine="예고편 편집이 핵심입니다"
        repComment={null}
        status="예정"
      />
      <IssueCard
        showRoom={false}
        room=""
        title="지난 회차, 가장 갈린 장면은?"
        opLine="행동보다 맥락으로 봐주세요"
        repComment="@닉C 그 장면은 연출 의도가 확실히..."
        status="종료"
      />
    </div>
  );
}

function IssueDetailScreen({ state }) {
  const canComment = state === "Member/Operator";
  const noRep = state === "대표 댓글 없음";
  return (
    <div>
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #EEEDEA",
        }}
      >
        <span style={{ fontSize: 14, color: "#888780" }}>← 룸으로</span>
        <span style={{ fontSize: 14, color: "#888780" }}>공유</span>
      </div>
      {/* Room badge */}
      <div
        style={{
          padding: "12px 16px 0",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            padding: "3px 10px",
            background: "#EEEDFE",
            color: "#534AB7",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          나는 솔로 해석 룸
        </span>
      </div>
      {/* Title & meta */}
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontSize: 19, fontWeight: 700, color: "#2C2C2A", lineHeight: 1.35, marginBottom: 8 }}>
          이번 데이트 선택, 어떻게 읽히나
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#534AB7",
            background: "#F3F2FC",
            padding: "8px 12px",
            borderRadius: 8,
            marginBottom: 10,
            fontWeight: 500,
          }}
        >
          질문: 이 선택은 감정보다 전략에 가까웠나?
        </div>
        <div style={{ fontSize: 12, color: "#5F5E5A", fontStyle: "italic", marginBottom: 14 }}>
          운영자: &quot;행동보다 편집 포인트에 주목해주세요&quot;
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#444441",
            lineHeight: 1.65,
            padding: "14px 0",
            borderTop: "1px solid #EEEDEA",
            borderBottom: "1px solid #EEEDEA",
          }}
        >
          이번 장면은 표면적인 대사보다도 카메라가 담은 시선의 방향과 편집 타이밍에
          핵심이 있습니다. 특히 두 출연자의 반응 컷을 교차 배치한 연출은...
          <div
            style={{
              marginTop: 10,
              width: "100%",
              height: 100,
              background: "#F1EFE8",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "#888780",
            }}
          >
            이미지/링크/영상 첨부 영역
          </div>
        </div>
      </div>

      {/* Representative comment */}
      {!noRep && (
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>
            대표 댓글
          </div>
          <div
            style={{
              padding: "12px 14px",
              background: "#F3F2FC",
              borderRadius: 10,
              borderLeft: "3px solid #7F77DD",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#534AB7",
                marginBottom: 4,
              }}
            >
              @닉A
            </div>
            <div style={{ fontSize: 14, color: "#2C2C2A", lineHeight: 1.5 }}>
              이 장면은 호감 표현이 아니라 편집 의도가 드러나는 순간이라고 봅니다.
              시선 처리와 카메라 배치가 특히...
            </div>
          </div>
        </div>
      )}

      {/* All comments */}
      <SectionHeader>전체 댓글</SectionHeader>
      {[
        { nick: "@닉B", text: "오히려 편집이 그렇게 보이게 한 것 같아요. 실제 의도와는 다를 수도..." },
        { nick: "@닉C", text: "나는 전략보다 감정이라고 봤는데, 다시 보니 편집 타이밍이 확실히..." },
      ].map((c, i) => (
        <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid #EEEDEA" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#444441", marginBottom: 4 }}>
            {c.nick}
          </div>
          <div style={{ fontSize: 14, color: "#444441", lineHeight: 1.5 }}>{c.text}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 16, fontSize: 12, color: "#888780" }}>
            <span>▲ 업보트</span>
            <span>↩ 답글</span>
          </div>
        </div>
      ))}

      {/* Bottom input/CTA */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #EEEDEA",
          background: "#FAFAF8",
        }}
      >
        {canComment ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div
              style={{
                flex: 1,
                height: 38,
                border: "1px solid #D3D1C7",
                borderRadius: 10,
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                fontSize: 13,
                color: "#B4B2A9",
                background: "#fff",
              }}
            >
              댓글을 입력하세요...
            </div>
            <div
              style={{
                padding: "8px 14px",
                background: "#534AB7",
                color: "#fff",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              작성
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "#888780", marginBottom: 8 }}>
              댓글은 멤버만 작성할 수 있습니다
            </div>
            <div
              style={{
                display: "inline-block",
                padding: "9px 20px",
                background: "#534AB7",
                color: "#fff",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              이 룸 구독하러 가기
            </div>
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
        <div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>
          마이페이지
        </div>
        <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #EEEDEA" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#534AB7", fontWeight: 600 }}>
            K
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>@닉네임</div>
            <div style={{ fontSize: 12, color: "#888780" }}>소개 한 줄</div>
          </div>
        </div>
        <div style={{ padding: "60px 24px", textAlign: "center", color: "#888780", fontSize: 14 }}>
          아직 구독한 룸이 없습니다
        </div>
      </div>
    );
  return (
    <div>
      <div style={{ padding: "14px 16px 8px", fontSize: 20, fontWeight: 700, color: "#2C2C2A" }}>
        마이페이지
      </div>
      {/* Profile */}
      <div style={{ padding: "16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #EEEDEA" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#534AB7", fontWeight: 600 }}>
          K
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#2C2C2A" }}>@김해석</div>
          <div style={{ fontSize: 12, color: "#888780" }}>콘텐츠를 맥락으로 읽는 사람</div>
        </div>
      </div>
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "2px solid #EEEDEA" }}>
        {["룸", "이슈", "댓글"].map((t, i) => (
          <div
            key={t}
            style={{
              flex: 1,
              padding: "12px 0",
              textAlign: "center",
              fontSize: 14,
              fontWeight: i === 0 ? 600 : 400,
              color: i === 0 ? "#534AB7" : "#888780",
              borderBottom: i === 0 ? "2px solid #534AB7" : "none",
              marginBottom: -2,
            }}
          >
            {t}
          </div>
        ))}
      </div>
      {/* Room list */}
      <SectionHeader>구독 중인 룸</SectionHeader>
      {["나는 솔로 해석 룸", "리벨북스 비문학 스터디"].map((r) => (
        <div key={r} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1EFE8" }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#EEEDFE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#534AB7" }}>
            ◈
          </div>
          <span style={{ fontSize: 14, color: "#2C2C2A" }}>{r}</span>
        </div>
      ))}
      <SectionHeader>참여 중인 룸</SectionHeader>
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1EFE8" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E1F5EE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#0F6E56" }}>
          ◈
        </div>
        <span style={{ fontSize: 14, color: "#2C2C2A" }}>흑백요리사 해석 룸</span>
      </div>
      <SectionHeader>운영 중인 룸</SectionHeader>
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #F1EFE8" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FAEEDA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#854F0B" }}>
          ★
        </div>
        <span style={{ fontSize: 14, color: "#2C2C2A", flex: 1 }}>테슬라 한국 실사용자 룸</span>
        <span
          style={{
            padding: "4px 10px",
            background: "#F1EFE8",
            borderRadius: 6,
            fontSize: 12,
            color: "#5F5E5A",
            fontWeight: 600,
          }}
        >
          운영하기
        </span>
      </div>
    </div>
  );
}

function LoginScreen({ state }) {
  const isSignup = state === "회원가입";
  return (
    <div style={{ padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#534AB7", marginBottom: 4 }}>
        ◈
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: "#2C2C2A", marginBottom: 6 }}>
        {isSignup ? "시작하기" : "다시 오셨군요"}
      </div>
      <div style={{ fontSize: 13, color: "#888780", marginBottom: 32, lineHeight: 1.5 }}>
        결 맞는 룸의 이슈와 반응을
        <br />
        내 피드로 모아보세요
      </div>
      {/* Social logins */}
      {[
        { bg: "#FEE500", color: "#1A1A1A", label: "카카오로 계속하기" },
        { bg: "#03C75A", color: "#fff", label: "네이버로 계속하기" },
        { bg: "#fff", color: "#444441", label: "이메일로 계속하기", border: true },
      ].map((btn, i) => (
        <div
          key={i}
          style={{
            padding: "13px 0",
            background: btn.bg,
            color: btn.color,
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            marginBottom: 10,
            border: btn.border ? "1px solid #D3D1C7" : "none",
          }}
        >
          {btn.label}
        </div>
      ))}
      {isSignup && (
        <div style={{ marginTop: 24, fontSize: 12, color: "#888780", lineHeight: 1.5 }}>
          가입 시 이용약관 및 개인정보처리방침에 동의합니다
        </div>
      )}
      <div style={{ marginTop: 20, fontSize: 13, color: "#888780" }}>
        {isSignup ? "이미 계정이 있나요?" : "처음이신가요?"}{" "}
        <span style={{ color: "#534AB7", fontWeight: 600 }}>
          {isSignup ? "로그인" : "가입하기"}
        </span>
      </div>
    </div>
  );
}

function RoomSettingsScreen() {
  return (
    <div>
      <div
        style={{
          padding: "14px 16px 8px",
          fontSize: 18,
          fontWeight: 700,
          color: "#2C2C2A",
          borderBottom: "1px solid #EEEDEA",
        }}
      >
        운영자 › 룸 설정
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { label: "룸 이름", val: "테슬라 한국 실사용자 룸" },
          { label: "한 줄 설명", val: "루머보다 해석, 드립보다 이유" },
          { label: "상세 설명", val: "실사용/가격/정책 관점의 반응을 모읍니다", multi: true },
        ].map((f) => (
          <div key={f.label}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>
              {f.label}
            </div>
            <div
              style={{
                padding: f.multi ? "10px 12px" : "9px 12px",
                border: "1px solid #D3D1C7",
                borderRadius: 10,
                fontSize: 14,
                color: "#2C2C2A",
                background: "#fff",
                minHeight: f.multi ? 60 : "auto",
              }}
            >
              {f.val}
            </div>
          </div>
        ))}
        {/* Room type */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>
            룸 유형
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["쇼케이스형", "확장형"].map((t, i) => (
              <div
                key={t}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: i === 0 ? "2px solid #534AB7" : "1px solid #D3D1C7",
                  borderRadius: 10,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  color: i === 0 ? "#534AB7" : "#888780",
                  background: i === 0 ? "#F3F2FC" : "#fff",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
        {/* Publish status */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>
            공개 상태
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["비공개", "공개"].map((t, i) => (
              <div
                key={t}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  border: i === 1 ? "2px solid #0F6E56" : "1px solid #D3D1C7",
                  borderRadius: 10,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  color: i === 1 ? "#0F6E56" : "#888780",
                  background: i === 1 ? "#E1F5EE" : "#fff",
                }}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
        {/* Members */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>
            멤버 관리
          </div>
          {["@userA", "@userB"].map((u) => (
            <div
              key={u}
              style={{
                padding: "10px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #F1EFE8",
              }}
            >
              <span style={{ fontSize: 14, color: "#2C2C2A" }}>{u}</span>
              <span style={{ fontSize: 12, color: "#993C1D", fontWeight: 500 }}>제거</span>
            </div>
          ))}
          <div
            style={{
              marginTop: 8,
              padding: "9px 12px",
              border: "1px dashed #D3D1C7",
              borderRadius: 10,
              fontSize: 13,
              color: "#888780",
              textAlign: "center",
            }}
          >
            + 사용자 검색 후 추가
          </div>
        </div>
        <div
          style={{
            padding: "12px 0",
            background: "#534AB7",
            color: "#fff",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          저장
        </div>
      </div>
    </div>
  );
}

function IssuePublishScreen({ state }) {
  const isEdit = state === "이슈 수정";
  return (
    <div>
      <div
        style={{
          padding: "14px 16px 8px",
          fontSize: 18,
          fontWeight: 700,
          color: "#2C2C2A",
          borderBottom: "1px solid #EEEDEA",
        }}
      >
        운영자 › {isEdit ? "이슈 수정" : "새 이슈 발행"}
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          { label: "제목", val: isEdit ? "FSD 한국 도입, 올해 안 가능할까?" : "", ph: "이슈 제목을 입력하세요" },
          { label: "운영자 한 줄", val: isEdit ? "일정보다 가격/체감이 핵심" : "", ph: "이 이슈를 어떤 관점으로 볼지" },
          { label: "질문 (선택)", val: "", ph: "댓글을 끌어낼 질문" },
          { label: "본문", val: isEdit ? "이번 FSD 도입 논의에서..." : "", ph: "본문을 입력하세요", multi: true },
        ].map((f) => (
          <div key={f.label}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 6 }}>
              {f.label}
            </div>
            <div
              style={{
                padding: f.multi ? "10px 12px" : "9px 12px",
                border: "1px solid #D3D1C7",
                borderRadius: 10,
                fontSize: 14,
                color: f.val ? "#2C2C2A" : "#B4B2A9",
                background: "#fff",
                minHeight: f.multi ? 80 : "auto",
              }}
            >
              {f.val || f.ph}
            </div>
          </div>
        ))}
        {/* Attachment */}
        <div
          style={{
            padding: 20,
            border: "1px dashed #D3D1C7",
            borderRadius: 10,
            textAlign: "center",
            color: "#888780",
            fontSize: 13,
          }}
        >
          이미지 / 링크 / 유튜브 첨부
        </div>
        {/* Status */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>
            이슈 상태
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {["예정", "진행 중", "종료"].map((s, i) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  border: i === 1 ? "2px solid #0F6E56" : "1px solid #D3D1C7",
                  borderRadius: 8,
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color: i === 1 ? "#0F6E56" : "#888780",
                  background: i === 1 ? "#E1F5EE" : "#fff",
                }}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
        {/* Featured */}
        <div
          style={{
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#F9F9F6",
            borderRadius: 10,
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              border: "2px solid #D3D1C7",
              borderRadius: 4,
            }}
          />
          <span style={{ fontSize: 13, color: "#5F5E5A" }}>대표 이슈로 설정</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <div
            style={{
              flex: 1,
              padding: "12px 0",
              background: "#534AB7",
              color: "#fff",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {isEdit ? "수정" : "발행"}
          </div>
          {isEdit && (
            <div
              style={{
                padding: "12px 16px",
                background: "#FAECE7",
                color: "#993C1D",
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              삭제
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RepCommentScreen() {
  return (
    <div>
      <div
        style={{
          padding: "14px 16px 8px",
          fontSize: 18,
          fontWeight: 700,
          color: "#2C2C2A",
          borderBottom: "1px solid #EEEDEA",
        }}
      >
        운영자 › 대표 댓글 지정
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>
          이슈
        </div>
        <div
          style={{
            padding: "10px 12px",
            border: "1px solid #D3D1C7",
            borderRadius: 10,
            fontSize: 14,
            color: "#2C2C2A",
            background: "#fff",
            marginBottom: 16,
          }}
        >
          FSD 한국 도입, 올해 안 가능할까?
        </div>
      </div>
      {/* Current rep */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#888780", marginBottom: 8 }}>
          현재 대표 댓글
        </div>
        <div
          style={{
            padding: "12px 14px",
            background: "#F3F2FC",
            borderRadius: 10,
            borderLeft: "3px solid #7F77DD",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#534AB7", marginBottom: 4 }}>
              @닉A
            </div>
            <div style={{ fontSize: 13, color: "#2C2C2A", lineHeight: 1.45 }}>
              도입보다 과금 구조가 더 관건이라는 이야기가...
            </div>
          </div>
          <span
            style={{
              padding: "4px 10px",
              background: "#FAECE7",
              color: "#993C1D",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            해제
          </span>
        </div>
      </div>
      {/* All comments */}
      <SectionHeader>전체 댓글</SectionHeader>
      {[
        { nick: "@닉B", text: "이번 건은 일정 자체보다 인프라 준비가..." },
        { nick: "@닉C", text: "오히려 OTA 체감이 더 중요한 포인트라고..." },
        { nick: "@닉D", text: "국내 가격 포지셔닝이 결국 핵심일 것..." },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #EEEDEA",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#444441", marginBottom: 4 }}>
              {c.nick}
            </div>
            <div style={{ fontSize: 13, color: "#444441", lineHeight: 1.45 }}>{c.text}</div>
          </div>
          <span
            style={{
              padding: "4px 10px",
              background: "#EEEDFE",
              color: "#534AB7",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 600,
              flexShrink: 0,
              marginLeft: 8,
            }}
          >
            지정
          </span>
        </div>
      ))}
    </div>
  );
}

function AdminScreen() {
  return (
    <div>
      <div
        style={{
          padding: "14px 16px 8px",
          fontSize: 18,
          fontWeight: 700,
          color: "#2C2C2A",
          borderBottom: "1px solid #EEEDEA",
        }}
      >
        어드민 › 룸 관리
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            padding: "12px 0",
            background: "#534AB7",
            color: "#fff",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          + 새 룸 생성
        </div>
        <SectionHeader>기존 룸 목록</SectionHeader>
        {[
          { name: "테슬라 한국 실사용자 룸", op: "@운영자A", status: "공개" },
          { name: "나는 솔로 해석 룸", op: "@운영자B", status: "공개" },
          { name: "리벨북스 비문학 스터디", op: "@운영자C", status: "비공개" },
        ].map((r) => (
          <div
            key={r.name}
            style={{
              padding: "14px",
              border: "1px solid #EEEDEA",
              borderRadius: 12,
              background: "#fff",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#2C2C2A" }}>{r.name}</span>
              <StatusBadge
                text={r.status}
                color={r.status === "공개" ? "green" : "gray"}
              />
            </div>
            <div style={{ fontSize: 12, color: "#888780" }}>
              운영자: {r.op}
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 600 }}>설정</span>
              <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 600 }}>운영자 변경</span>
              <span style={{ fontSize: 12, color: "#534AB7", fontWeight: 600 }}>공개 전환</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========= SCREEN INFO PANEL =========

const SCREEN_INFO = {
  feed: {
    route: "/feed",
    purpose: "구독한 룸들의 최신 이슈를 한 번에 소비하는 메인 화면",
    data: ["구독 Room 목록", "각 Room의 최신 Issue", "각 Issue의 대표 댓글"],
    cta: ["이슈 읽기", "룸 보기"],
    notes: "Visitor 접근 시 로그인 유도. 구독 룸이 없으면 Empty 상태.",
  },
  issues: {
    route: "/issues",
    purpose: "공개된 룸들이 발행한 최신 이슈 전체를 보는 목록 화면",
    data: ["공개 Room의 공개 Issue 리스트", "룸명/제목/운영자 한 줄/대표 댓글/상태"],
    cta: ["이슈 읽기", "룸 보기"],
    notes: "Visitor도 열람 가능. 비로그인 사용자의 진입점 역할.",
  },
  room: {
    route: "/rooms/:slug",
    purpose: "룸의 정체성을 이해하고 구독 여부를 결정하게 만드는 페이지",
    data: ["룸 이름/설명", "대표 이슈", "최신 이슈 목록", "구독 상태"],
    cta: ["구독하기/구독 중/구독 해제", "이슈 읽기", "운영하기(Operator)"],
    notes: "확장형 룸은 P1에서 '참여 문의/가입 문의/관심 보내기' CTA 추가 가능.",
  },
  issue: {
    route: "/rooms/:slug/issues/:id",
    purpose: "이슈 본문과 대표 댓글, 전체 댓글을 소비하는 핵심 화면",
    data: ["이슈 제목/질문/본문/첨부", "대표 댓글", "전체 댓글"],
    cta: ["구독하러 가기(Visitor/Sub)", "댓글 작성(Member/Op)", "업보트/답글"],
    notes: "Visitor/Subscriber는 댓글 불가, Member/Operator만 입력창 노출.",
  },
  mypage: {
    route: "/me",
    purpose: "사용자의 개인 활동과 룸 관계를 한 번에 보여주는 허브",
    data: ["프로필", "구독/참여/운영 중인 룸", "업보트 이슈", "작성/업보트 댓글"],
    cta: ["룸 보기", "운영하기(운영 중인 룸)"],
    notes: "로그인 사용자만 접근 가능. 탭으로 룸/이슈/댓글 분리.",
  },
  login: {
    route: "/login, /signup",
    purpose: "Visitor가 구독 CTA 등을 클릭 시 진입하는 인증 화면 (문서에 누락, 추가)",
    data: ["소셜 로그인 옵션", "이메일 로그인"],
    cta: ["카카오/네이버/이메일 로그인", "회원가입 전환"],
    notes: "구독 CTA → 로그인 유도 흐름에서 필수. 원문 명세에 없어 추가함.",
  },
  "room-settings": {
    route: "/operator/rooms/:id/settings",
    purpose: "운영자가 룸의 정체성/공개 상태/멤버를 관리하는 화면",
    data: ["룸 이름/설명", "룸 유형(쇼케이스/확장)", "공개 상태", "멤버 목록"],
    cta: ["저장", "멤버 추가/제거"],
    notes: "Operator/Admin만 접근 가능. room_type은 운영 화면에 노출 가능.",
  },
  "issue-publish": {
    route: "/operator/rooms/:id/issues/new, /edit",
    purpose: "운영자가 룸의 대화를 이슈 단위로 발행하는 입력 화면",
    data: ["제목/운영자 한 줄/질문/본문/첨부", "이슈 상태", "대표 이슈 여부"],
    cta: ["발행", "수정", "삭제", "대표 이슈 설정"],
    notes: "Operator/Admin만 접근 가능.",
  },
  "rep-comment": {
    route: "/operator/issues/:id/comments",
    purpose: "운영자가 이슈별 대표 댓글을 지정하는 화면",
    data: ["이슈 정보", "전체 댓글 목록", "현재 대표 댓글"],
    cta: ["대표 댓글 지정", "대표 댓글 해제"],
    notes: "Operator/Admin만 접근 가능. 대표 댓글은 1개만 가능.",
  },
  admin: {
    route: "기존 admin route 재사용",
    purpose: "어드민이 룸을 생성하고 운영자를 지정하는 관리 화면",
    data: ["룸 이름/slug/설명", "운영자 지정", "공개 상태"],
    cta: ["룸 생성", "운영자 지정", "공개 전환"],
    notes: "사용자 대면 화면이 아닌 관리 도구.",
  },
};

function InfoPanel({ screenId }) {
  const info = SCREEN_INFO[screenId];
  if (!info) return null;
  return (
    <div
      style={{
        padding: "16px 20px",
        background: "#FAFAF8",
        borderRadius: 12,
        border: "1px solid #EEEDEA",
        fontSize: 13,
        color: "#444441",
        lineHeight: 1.6,
        maxWidth: 380,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 2 }}>
        Route
      </div>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          color: "#534AB7",
          background: "#F3F2FC",
          padding: "4px 8px",
          borderRadius: 6,
          display: "inline-block",
          marginBottom: 12,
        }}
      >
        {info.route}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>
        목적
      </div>
      <div style={{ marginBottom: 12 }}>{info.purpose}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>
        핵심 데이터
      </div>
      <div style={{ marginBottom: 12 }}>
        {info.data.map((d, i) => (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 2 }}>
            <span style={{ color: "#AFA9EC" }}>•</span> {d}
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>
        주요 CTA
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
        {info.cta.map((c, i) => (
          <StatusBadge key={i} text={c} color="purple" />
        ))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 4 }}>
        비고
      </div>
      <div style={{ fontSize: 12, color: "#5F5E5A" }}>{info.notes}</div>
    </div>
  );
}

// ========= MAIN APP =========

export default function WireframeViewer() {
  const [activeScreen, setActiveScreen] = useState("feed");
  const [activeState, setActiveState] = useState(0);

  const currentStates = STATES[activeScreen] || ["기본"];
  const currentStateName = currentStates[activeState] || currentStates[0];

  const handleScreenChange = (id) => {
    setActiveScreen(id);
    setActiveState(0);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case "feed":
        return <FeedScreen state={currentStateName} />;
      case "issues":
        return <IssueListScreen state={currentStateName} />;
      case "room":
        return <RoomScreen state={currentStateName} />;
      case "issue":
        return <IssueDetailScreen state={currentStateName} />;
      case "mypage":
        return <MyPageScreen state={currentStateName} />;
      case "login":
        return <LoginScreen state={currentStateName} />;
      case "room-settings":
        return <RoomSettingsScreen />;
      case "issue-publish":
        return <IssuePublishScreen state={currentStateName} />;
      case "rep-comment":
        return <RepCommentScreen />;
      case "admin":
        return <AdminScreen />;
      default:
        return null;
    }
  };

  const groups = [
    { key: "user", label: "사용자 화면" },
    { key: "operator", label: "운영자 화면" },
    { key: "admin", label: "관리자 화면" },
  ];

  return (
    <div style={{ fontFamily: '-apple-system, "Pretendard", sans-serif', maxWidth: 900 }}>
      {/* Screen nav */}
      <div style={{ marginBottom: 20 }}>
        {groups.map((g) => (
          <div key={g.key} style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#888780",
                marginBottom: 6,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {g.label}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SCREENS.filter((s) => s.group === g.key).map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleScreenChange(s.id)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border:
                      activeScreen === s.id
                        ? "1.5px solid #534AB7"
                        : "1px solid #D3D1C7",
                    background: activeScreen === s.id ? "#F3F2FC" : "#fff",
                    color: activeScreen === s.id ? "#534AB7" : "#5F5E5A",
                    fontWeight: activeScreen === s.id ? 600 : 400,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {s.label}
                  {s.id === "login" && (
                    <span
                      style={{
                        marginLeft: 4,
                        fontSize: 9,
                        padding: "1px 5px",
                        background: "#FAEEDA",
                        color: "#854F0B",
                        borderRadius: 4,
                        fontWeight: 600,
                      }}
                    >
                      추가
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* State toggle */}
      {currentStates.length > 1 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#888780", marginBottom: 6 }}>
            상태 전환
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {currentStates.map((s, i) => (
              <button
                key={s}
                onClick={() => setActiveState(i)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border:
                    activeState === i ? "1.5px solid #0F6E56" : "1px solid #D3D1C7",
                  background: activeState === i ? "#E1F5EE" : "#fff",
                  color: activeState === i ? "#0F6E56" : "#888780",
                  fontWeight: activeState === i ? 600 : 400,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main content: Phone + Info */}
      <div
        style={{
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <Phone>{renderScreen()}</Phone>
        <InfoPanel screenId={activeScreen} />
      </div>
    </div>
  );
}
