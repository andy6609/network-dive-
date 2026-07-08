# 프로젝트 진행 상황 — Network Dive 히어로 영상 & 웹사이트

> Local Proxy 네트워크 트래픽 분석 PoC의 **발표/포트폴리오 웹사이트**. 스크롤에 따라 "네트워크 속으로 파고드는" 시네마틱 히어로 영상이 핵심.
> 프로젝트 개요·기술 배경은 `main.purpose.md` 참고.

최종 수정: 2026-07-07

---

## 1. 확정된 컨셉

| 항목 | 결정 |
|---|---|
| **웹사이트 성격** | 팀 발표용 소개 + 개인 포트폴리오. Apple/Nvidia 제품 런칭 페이지 톤. "이걸 직접 만들었다고?" 임팩트 |
| **히어로 메커니즘** | **스크롤 스크럽 다이브** — 스크롤 위치가 영상 재생 시점(`currentTime`)을 제어. 무한 루프 아님 |
| **비주얼 톤** | 다크 테크 / 실사 렌더. 딥 블랙 배경 + 시안·블루 데이터 글로우, 경고 순간 앰버→레드 |
| **헤드라인 언어** | 영어 |
| **헤드라인 처리** | 영상에 굽지 않고 **웹(HTML/CSS) 오버레이**로 얹음 (수정·가독성·반응형 자유). 장면 일부인 텍스트(`FILE DETECTED`, `BLOCKED`)만 영상에 굽음 |
| **직원 구도** | 어깨너머(뒤통수+실루엣). 익명성 = "누구나, 어떤 직원이든" 보안 메시지 + AI 얼굴 리스크 회피 |
| **모니터 속 화면** | 실제 Claude 사용 느낌의 AI 챗 업로드 UI (로고 대문짝 대신 자연스러운 사용 맥락) |

---

## 2. 스토리보드 (7 키프레임 → 6 전환 클립)

스크롤을 내리면 카메라가 모니터 → 화면 속 → OSI 계층 → 광케이블/라우터 → 프록시 → 탐지 → 차단으로 한 번에 파고든다. 발표 슬라이드와 매핑됨.

| # | 키프레임 장면 | 오버레이 헤드라인 (웹) | 대응 슬라이드 |
|---|---|---|---|
| KF0 | 어두운 사무실, 직원이 AI에 파일 업로드 중인 모니터 | *"What happens when a file leaves your company?"* | S1 어텐션 |
| KF1 | 화면 관통, 파일이 0101 입자로 분해 | *"Every upload becomes bytes."* | S2~3 |
| KF2 | OSI 하강, 의미가 벗겨져 바이트 강으로 | *"7 layers. One byte stream."* | S3 OSI |
| KF3 | 여러 서비스 스트림이 광케이블 거쳐 한 점으로 수렴 | *"Any service. Any file. One choke point."* | S4 |
| KF4 | **두 얼굴 프록시 게이트웨이가 트래픽 스캔 (클라이맥스)** | *"The proxy has two faces."* | S5 |
| KF5 | 매직넘버 검증, `FILE DETECTED` | *"We see the file. Extension can't lie."* | S6 |
| KF6 | 게이트 슬램, `BLOCKED` (미래 예고) | *"Today we watch. Tomorrow we block."* | S7 로드맵 |

**핵심 스토리 축 2개** (반드시 시각적으로 전달):
1. **보편성** — 특정 서비스 해킹이 아니라 네트워크 계층에서 잡으니 Claude/Gemini/ChatGPT 다 걸림 (KF3의 스트림 수렴).
2. **로드맵** — 지금은 식별, 다음은 차단 (KF5 탐지 → KF6 차단).

---

## 3. 완성된 에셋 (프롬프트)

### 이미지 프롬프트 — `prompts/network-dive/` (Nano Banana 2 / Kie.ai용, `generate_kie.py`가 먹는 JSON)
- `kf0_hero.json` · `kf1_dissolve.json` · `kf2_osi_descent.json` · `kf3_convergence.json` · `kf4_proxy.json` · `kf5_detected.json` · `kf6_blocked.json`
- 전부 Dense Narrative Format, 16:9, 2K, 동일 컬러 그레이딩 고정.

### 영상 프롬프트 — `prompts/network-dive/video/` (Seedance image-to-video용, 전환 클립)
- `clip1_kf0-to-kf1.md` … `clip6_kf5-to-kf6.md` (6개)
- 각 클립: 첫 프레임 = KFn, 끝 프레임 = KFn+1. **루프 아님, 일방향 전진.** 카메라 광학·타이밍(%)·모션 물리·연속성 락·스크럽 최적화(등속) 명시.

### 프론트엔드 브리프
- 플랜 모드 + front-end-design 플러그인용 복붙 브리프 작성 완료 (아래 6단계 참고). **정정: 클립은 6개**("6 chained clips connecting 7 keyframes").

### 웹 빌드 스킬 — `Video-to-website.md` (루트에 확보 완료)
- FFmpeg 프레임 추출 → canvas 렌더 → GSAP/Lenis 스크롤 스크럽. 이게 유튜버가 말한 "핵심" 스킬.
- ⚠️ **중앙 제품형 사이트 전제**라 우리 풀블리드 다이브에 맞게 STEP 5의 4가지 적응 필수. 39번 줄 ffmpeg 경로는 Windows용 → 맥은 `brew install ffmpeg`.
- 이미지 생성만 Kie.ai **API**, 영상 생성은 **웹사이트**(Kling 3.0/Seedance 등, 첫+끝 프레임 지원), 웹 빌드는 이 스킬. 세 경로가 다름.

---

## 4. 다음 스텝 (실행 순서)

> 핵심 의존성: **이미지(KF) → 영상(Clip) → 웹**. 앞 단계 산출물이 있어야 다음이 가능.

### STEP 1 — 이미지 렌더 (KF0 먼저, 룩 검증)
```bash
python scripts/generate_kie.py prompts/network-dive/kf0_hero.json images/network-dive/kf0_hero.jpg "16:9"
```
- ⚠️ 실행 시 Kie.ai 크레딧 소모 (`.env`의 `KIE_API_KEY` 사용).
- KF0 결과로 다크 테크 실사 톤이 의도대로 나오는지 확인. **안 맞으면 여기서 프롬프트 튜닝** (조명/사무실 밝기/UI 등). 룩이 확정돼야 나머지가 일관됨.

### STEP 2 — (룩 확정 후) 연속성 반영 & 나머지 KF 렌더
- KF0 이미지를 KF1~KF6 프롬프트의 `image_input`(URL 배열)에 참조로 넣어 룩을 강제로 이어줌 → 클립 이음새가 매끄러워짐.
  - ※ `image_input`은 URL이어야 함 (로컬 파일 경로 X). 렌더 결과를 접근 가능한 URL로 올린 뒤 넣거나, 스타일 서술만으로 진행.
- KF1~KF6 순차 렌더 (파일명만 교체):
```bash
python scripts/generate_kie.py prompts/network-dive/kf1_dissolve.json images/network-dive/kf1_dissolve.jpg "16:9"
# … kf2 ~ kf6 동일
```
- 각 KF가 **다음 KF의 시작과 자연스럽게 이어지는지** 확인 (특히 색/구도).

### STEP 3 — Seedance 클립 6개 생성
- 각 클립 프롬프트(`video/clipN_*.md`) + 해당 첫/끝 프레임 이미지를 **Seedance image-to-video**에 투입.
  - 첫 프레임 = KFn, 끝 프레임 = KFn+1.
- 4K, 고프레임레이트(스크럽 부드럽게).
- `FILE DETECTED`(Clip5) / `BLOCKED`(Clip6) 텍스트가 뭉개지면 재생성해서 잘 나온 것 선택. 정 안 되면 영상엔 텍스트 빼고 웹 오버레이로 대체.
- 생성 클립은 `images/network-dive/` 또는 별도 `videos/` 폴더에 정리 저장.

### STEP 4 — 클립 6개를 하나로 이어붙이기 (stitch)
- `video-to-website` 스킬은 **영상 1개 입력**을 전제로 함 → 6개 클립을 **순서대로 하나의 영상으로 concat** 해야 함.
- KFn 이음새(클립 경계)에서 점프가 없는지 확인. 필요 시 인접 클립 간 짧은 크로스페이드로 봉합.
- 예 (ffmpeg concat):
```bash
# list.txt 에 clip1.mp4 ~ clip6.mp4 순서대로 기재 후
ffmpeg -f concat -safe 0 -i list.txt -c copy network-dive-full.mp4
```
- 결과물 `network-dive-full.mp4` 가 다음 스텝(프레임 추출)의 입력.

### STEP 5 — 프론트엔드 제작 (`video-to-website` 스킬 + `frontend-design` 스킬)
> 엔진은 `Video-to-website.md` 스킬 그대로 사용 (FFmpeg 프레임 추출 → canvas 렌더 → GSAP/Lenis 스크롤 바인딩). 단, 이 스킬은 **"중앙 제품형" 사이트 전제**라 우리 **풀블리드 다이브 여정**에 맞게 아래 4가지를 반드시 적응시킬 것.

**전제 — FFmpeg (맥):** 스킬 39번 줄의 `C:\Users\nateh\bin\` 경로는 **원작자 Windows 경로라 무시.** 맥은:
```bash
brew install ffmpeg   # ffprobe 포함, PATH 자동 등록
```

**우리 4가지 적응 (스킬 기본값 → 다이브용 오버라이드):**
1. **텍스트 배치** — 스킬 규칙 12 "양옆 40% 존만, 중앙 금지"는 중앙 제품 전제. 우리는 풀스크린이라 → **"각 클립에서 가장 어둡고 차분한 영역에 헤드라인 배치 + 다크 그라디언트 클리어존"** 으로 대체. KF별로 위치 달라짐.
2. **FRAME_SPEED** — 스킬 기본 `2.0`(55%에서 애니 끝) → **1.0~1.2로 낮춤.** 다이브 자체가 콘텐츠라 여정이 스크롤 전체에 걸쳐 진행, KF6 `BLOCKED`가 거의 끝에 오도록. 7개 헤드라인 `data-enter`/`data-leave` %를 각 클립 구간에 매핑.
3. **IMAGE_SCALE** — 스킬 기본 `0.85`(패딩 커버) → **0.95~1.0** 풀블리드로 (몰입형이라 화면 꽉 채움).
4. **컬러/톤** — 스킬 기본은 라이트 제품 페이지 → **다크 테크**(딥블랙 + 시안/블루, 경고 앰버/레드). `frontend-design` 스킬로 스타일링.

**그대로 활용 (잘 맞음):**
- **Circle-wipe 히어로 리빌**(규칙 13): KF0 정지 프레임 + 헤드라인을 standalone 히어로 → 스크롤 시작 시 다이브 캔버스 원형으로 열림.
- **Stats 섹션 + 다크 오버레이**(규칙 6): "7 OSI layers" / "3-step identification" / 마일스톤 진행률 카운터 → 발표 신뢰감.
- Lenis 스무스 스크롤, 스태거 리빌, 마퀴, CTA persist.

**진행:** 플랜 모드 진입 → 브리프 붙여넣기(+ `network-dive-full.mp4`, KF 이미지들, `main.purpose.md`) → 본문 카피는 `main.purpose.md`에서(제네릭 필러 금지) → 스크롤 섹션 = 발표 슬라이드 흐름 → "질문 다 하고 95% 확신 전엔 플랜 확정 금지".

### STEP 6 — 배포 & 마감
- **배포: GitHub + Vercel.** ⚠️ **프레임 폴더(`frames/`)를 반드시 git에 커밋** — 안 하면 배포 후 애니메이션 안 보임 (수백 장이라 놓치기 쉬운 함정, 유튜버도 여기서 막힘).
- **로컬 테스트는 HTTP로** (`npx serve .` 또는 `python -m http.server`) — `file://` 로 열면 프레임 로딩 실패.
- 반응형: 데스크톱 16:9 기준. **모바일**은 스킬대로 프레임 <150장·1280px로 줄이고 텍스트 센터+다크백드롭, 스크롤 높이 ~550vh.
- 성능: 프레임을 webp(quality 80)로 추출(스킬 기본), 2단계 프리로드(첫 10장 즉시 → 나머지 백그라운드).
- 접근성: 오버레이 텍스트 대비, `prefers-reduced-motion` 시 스크럽 대신 정적 이미지 폴백.

---

## 5. 미결정 / 확인 필요
- [ ] 본문 카피 언어: 헤드라인=영어 확정, **본문=한국어 vs 영어** (발표 청중 기준). 브리프에 반영 필요.
- [ ] `image_input` 연속성: 실제로 쓸지(URL 업로드 필요) vs 스타일 서술만으로 갈지.
- [ ] 영상 생성 툴 확정: Kling 3.0 vs Seedance (둘 다 첫+끝 프레임 지원). 유튜버는 Kling 3.0 사용.
- [ ] 모바일 대응 방식 (세로 크롭 / 별도 영상 / 정적 폴백). 스킬 기본은 프레임 축소+센터 텍스트.
- [ ] Clip 4(클라이맥스) 5초 vs 6초.
- [ ] Stats 섹션 넣을지 + 어떤 수치 (7 OSI layers / 3-step 식별 / 마일스톤 %).
- [ ] 발표용 실물 데모(프록시 로그 등)를 사이트에 넣을지.

---

## 6. 폴더 구조 요약
```
seedance/
├─ main.purpose.md            # 프로젝트 개요·기술 배경·발표 슬라이드 원문
├─ PROJECT_STATUS.md          # (이 문서) 진행 상황 & 다음 스텝
├─ WEBSITE_INTERACTION_SPEC.md # 스크롤/클릭 작동 방식 명세 (구간별 재생 방식)
├─ master_prompt_reference.md # Nano Banana 2 JSON 스키마 가이드
├─ Video-to-website.md        # 웹 빌드 스킬 (프레임 추출→스크롤 스크럽)
├─ gemini.md                  # 폴더 정리 규칙
├─ .env                       # KIE_API_KEY (본인 생성)
├─ scripts/generate_kie.py    # Kie.ai 이미지 생성·다운로드
├─ prompts/network-dive/      # 이미지 프롬프트 (KF0~KF6, JSON)
│  └─ video/                  # 영상 프롬프트 (clip1~6, MD)
└─ images/network-dive/       # 렌더 결과 저장 위치 (아직 비어있음)
```
