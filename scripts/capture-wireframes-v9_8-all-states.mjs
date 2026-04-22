import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const BASE_URL = "http://127.0.0.1:3000/wireframes/v9_8/export";
const OUTPUT_DIR = path.resolve(
  "/Users/idamin/dev/interview-board/artifacts/wireframes_v9_8_all_states",
);

const SCREENS = [
  { id: "feed", label: "내 피드(홈)" },
  { id: "issues", label: "이슈 목록" },
  { id: "rooms", label: "룸 목록" },
  { id: "room", label: "룸 상세" },
  { id: "issue", label: "이슈 상세" },
  { id: "mypage", label: "마이페이지" },
  { id: "profile", label: "프로필" },
  { id: "profile-edit", label: "프로필 편집" },
  { id: "invite-landing", label: "초대 랜딩" },
  { id: "aspect-add", label: "Aspect 추가" },
  { id: "join-aspect", label: "룸 참여(Aspect 선택)" },
  { id: "room-settings", label: "룸 설정" },
  { id: "issue-publish", label: "이슈 발행/수정" },
  { id: "rep-comment", label: "대표 댓글 지정" },
  { id: "operator-sign-off", label: "운영 사임/종료 요청" },
];

const STATES = {
  feed: ["기본", "구독 룸 없음(Empty)"],
  issues: ["기본", "정렬: 진행 중", "스포일러 포함 이슈", "이슈 없음(Empty)"],
  rooms: ["Visitor", "Subscriber"],
  room: [
    "모집중-Visitor",
    "모집중-Subscriber(Aspect 없음)",
    "모집중-Subscriber(Aspect 보유)",
    "모집중-Member",
    "모집중-Operator",
    "모집닫힘-Visitor",
    "모집닫힘-Subscriber",
    "모집닫힘-Member",
    "모집닫힘-Operator",
    "archived-Member",
    "archived-Operator",
  ],
  issue: [
    "Visitor",
    "Subscriber(Aspect 없음)",
    "Subscriber(Aspect 보유)",
    "Subscriber(모집 닫힘)",
    "Member/Operator",
    "대표 댓글 없음",
  ],
  mypage: ["룸 탭", "이슈 탭", "댓글 탭", "정체성 탭", "구독 없음(Empty)"],
  profile: ["내 프로필", "다른 사용자 프로필"],
  "profile-edit": ["기본", "닉네임 중복", "저장 중"],
  "invite-landing": ["유효", "만료", "이미 멤버"],
  "aspect-add": ["마이페이지 직접 추가"],
  "join-aspect": ["기본"],
  "room-settings": [
    "draft 상태",
    "public 상태",
    "public 상태(종료 요청 중)",
    "archived 상태",
  ],
  "issue-publish": [
    "새 이슈",
    "초안 편집",
    "공개 이슈 수정",
    "닫힌 이슈 수정",
    "숨긴 이슈 수정",
  ],
  "rep-comment": ["기본"],
  "operator-sign-off": ["사임(이양 요청)", "운영 종료 요청"],
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[()]/g, "")
    .replace(/[/:]/g, "-")
    .replace(/[·]/g, "-")
    .replace(/[^a-z0-9가-힣_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function assertServerReady() {
  const response = await fetch(`${BASE_URL}?screen=feed&state=0`);
  if (!response.ok) {
    throw new Error(`Export page returned ${response.status}`);
  }
}

async function main() {
  await assertServerReady();
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const manifest = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 900, height: 1200 },
    deviceScaleFactor: 2,
  });

  try {
    let captureIndex = 1;

    for (const screen of SCREENS) {
      const states = STATES[screen.id] ?? ["기본"];

      for (let stateIndex = 0; stateIndex < states.length; stateIndex += 1) {
        const stateLabel = states[stateIndex];
        const stateSlug = slugify(stateLabel);
        const fileName = `${String(captureIndex).padStart(2, "0")}-${screen.id}__${String(
          stateIndex,
        ).padStart(2, "0")}-${stateSlug}.png`;
        const filePath = path.join(OUTPUT_DIR, fileName);
        const url = `${BASE_URL}?screen=${encodeURIComponent(
          screen.id,
        )}&state=${stateIndex}`;

        await page.goto(url, { waitUntil: "networkidle" });
        const phone = page.locator("#wireframe-capture-phone");
        await phone.waitFor({ state: "visible" });
        await phone.screenshot({ path: filePath });

        manifest.push({
          index: captureIndex,
          screenId: screen.id,
          screenLabel: screen.label,
          stateIndex,
          stateLabel,
          fileName,
          filePath,
          url,
        });
        captureIndex += 1;
      }
    }
  } finally {
    await browser.close();
  }

  await fs.writeFile(
    path.join(OUTPUT_DIR, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Captured ${manifest.length} screenshots into ${OUTPUT_DIR}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
