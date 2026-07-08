/* ============================================================
   Network Dive — 히어로 인터랙션 (영상 되는 데까지)
   상태기계: SCRUB1 → GATE(클릭) → AUTOANIM(핀 재생) → SCRUB2 → END
   스크럽 구간 = canvas 프레임, 자동애니 = <video>. 매뉴얼 스크롤 매핑.
   ============================================================ */

const pad = n => String(n).padStart(4, '0');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---- 에셋 정의 ---- */
const SCRUB1 = { base: '../frames/scrub_KF0-0.3', count: 121 };
const SCRUB2_DIRS = [
  { base: '../frames/scrub_KF2-1-2-21', count: 145 },
  { base: '../frames/scrub_KF2-21-2-22', count: 145 },
];
const buildUrls = dirs => {
  const out = [];
  dirs.forEach(d => { for (let i = 1; i <= d.count; i++) out.push(`${d.base}/frame_${pad(i)}.jpg`); });
  return out;
};
const scrub1Urls = buildUrls([SCRUB1]);
const scrub2Urls = buildUrls(SCRUB2_DIRS);

/* ---- DOM ---- */
const canvas = document.getElementById('scrub-canvas');
const ctx = canvas.getContext('2d');
const stage = document.getElementById('video-stage');
const vids = [document.getElementById('v1'), document.getElementById('v2'), document.getElementById('v3')];
const gate = document.getElementById('gate');
const uploadBtn = document.getElementById('upload-btn');
const scrollCue = document.getElementById('scroll-cue');
const endStub = document.getElementById('end-stub');
const spacer = document.getElementById('spacer');
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const loaderPct = document.getElementById('loader-pct');
const hl = {
  hero: document.querySelector('[data-hl="hero"]'),
  bytes: document.querySelector('[data-hl="bytes"]'),
  osi: document.querySelector('[data-hl="osi"]'),
};

/* ---- 상태 ---- */
let state = 'SCRUB1';          // SCRUB1 | GATE | AUTOANIM | SCRUB2 | END
let committed = false;         // 클릭 후 true (게이트/자동애니 재실행 방지)
let scrub1Imgs = [], scrub2Imgs = null;
let lenis, lastDrawn = -1;
let S1_RANGE = 0, S2_RANGE = 0, END_RANGE = 0, gateY = 0;

/* ---- 스크롤 거리 계산 ---- */
function computeRanges() {
  const vh = window.innerHeight;
  S1_RANGE = 2.2 * vh;   // scrub1 스크롤 거리
  S2_RANGE = 3.4 * vh;   // scrub2 스크롤 거리 (290프레임)
  END_RANGE = 1.0 * vh;
  gateY = S1_RANGE;
  setSpacer();
}
function setSpacer() {
  const vh = window.innerHeight;
  const h = committed ? (gateY + S2_RANGE + END_RANGE + vh) : (gateY + vh);
  spacer.style.height = h + 'px';
}

/* ---- canvas ---- */
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  lastDrawn = -1; // 강제 재렌더
}
function drawFrame(img) {
  if (!img || !img.complete || !img.naturalWidth) return;
  const cw = canvas.width, ch = canvas.height;
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const scale = Math.max(cw / iw, ch / ih); // 풀 커버 (풀블리드 다이브)
  const dw = iw * scale, dh = ih * scale;
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
}
function showCanvas() { canvas.style.opacity = 1; }
function drawScrubFrame(imgs, p) {
  if (!imgs || !imgs.length) return;
  const idx = Math.round(clamp(p, 0, 1) * (imgs.length - 1));
  if (idx === lastDrawn) return;
  lastDrawn = idx;
  drawFrame(imgs[idx]);
}

/* ---- 헤드라인 ---- */
function setHl(el, v) { el.style.opacity = v.toFixed(3); }
function updateHeadlines(phase, p) {
  let hero = 0, bytes = 0, osi = 0;
  if (phase === 'SCRUB1') hero = clamp(1 - p * 1.7, 0, 1);
  else if (phase === 'SCRUB2') {
    bytes = p < 0.42 ? clamp(1 - Math.abs(p - 0.12) / 0.16, 0, 1) : 0;   // peak ~12%
    osi = p > 0.35 ? clamp(1 - Math.abs(p - 0.68) / 0.28, 0, 1) : 0;     // peak ~68%
  }
  setHl(hl.hero, hero); setHl(hl.bytes, bytes); setHl(hl.osi, osi);
}

/* ---- 게이트 ---- */
function showGate(on) { gate.classList.toggle('show', on); }

/* ---- 자동애니 체인 ---- */
function hideAllVideos() { vids.forEach(v => v.classList.remove('show')); }
function startAutoAnim() {
  if (committed) return;
  committed = true;
  state = 'AUTOANIM';
  showGate(false);
  scrollCue.style.opacity = 0;
  lenis.stop();                 // 스크롤 잠금 (핀)
  let i = 0;
  const playNext = () => {
    if (i >= vids.length) { finishAutoAnim(); return; }
    const v = vids[i++];
    hideAllVideos();
    v.classList.add('show');    // 이전 클립 끝프레임 = 다음 시작프레임 → 스왑 안 보임
    v.currentTime = 0;
    const pr = v.play();
    if (pr && pr.catch) pr.catch(() => { v.onended && v.onended(); }); // 재생 실패 시 스킵
    v.onended = playNext;
  };
  playNext();
}
function finishAutoAnim() {
  state = 'SCRUB2';
  setSpacer();                  // 스페이서 확장 (scrub2 스크롤 거리 열림)
  drawScrubFrame(scrub2Imgs, 0);// KF2-1 프레임
  hideAllVideos();              // canvas 다시 노출 (video 위에서 사라짐)
  lenis.scrollTo(gateY, { immediate: true });
  lenis.start();
}

/* ---- 메인 프레임 루프 ---- */
function onFrame() {
  if (state === 'AUTOANIM') return; // 영상이 화면 담당
  const y = lenis.animatedScroll ?? lenis.scroll ?? window.scrollY;

  if (!committed) {
    const p1 = clamp(y / S1_RANGE, 0, 1);
    drawScrubFrame(scrub1Imgs, p1);
    if (p1 >= 0.999) {
      if (state !== 'GATE') { state = 'GATE'; showGate(true); }
    } else {
      if (state !== 'SCRUB1') { state = 'SCRUB1'; showGate(false); }
    }
    scrollCue.style.opacity = p1 < 0.05 ? 1 : 0;
    updateHeadlines('SCRUB1', p1);
    endStub.style.opacity = 0;
  } else {
    // 커밋 후: gateY 아래로 못 올라감 (자동애니 비가역)
    if (y < gateY - 1) { lenis.scrollTo(gateY, { immediate: true }); }
    const p2 = clamp((y - gateY) / S2_RANGE, 0, 1);
    drawScrubFrame(scrub2Imgs, p2);
    state = p2 >= 0.999 ? 'END' : 'SCRUB2';
    updateHeadlines('SCRUB2', p2);
    endStub.style.opacity = p2 >= 0.985 ? 1 : 0;
  }
}

/* ---- 프리로드 ---- */
function loadImages(urls, onProg) {
  return new Promise(resolve => {
    const imgs = new Array(urls.length);
    let done = 0;
    urls.forEach((u, i) => {
      const im = new Image();
      im.onload = im.onerror = () => {
        done++; onProg && onProg(done / urls.length);
        if (done === urls.length) resolve(imgs);
      };
      im.src = u; imgs[i] = im;
    });
  });
}

/* ---- 부트 ---- */
async function boot() {
  computeRanges();
  resizeCanvas();

  // 1차: scrub1 프레임 로드 (로더 표시)
  scrub1Imgs = await loadImages(scrub1Urls, p => {
    const pct = Math.round(p * 100);
    loaderFill.style.width = pct + '%';
    loaderPct.textContent = pct + '%';
  });

  // Lenis 스무스 스크롤
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9 });
  window.lenis = lenis; // 디버그/테스트용 훅
  function raf(t) { lenis.raf(t); onFrame(); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // 초기 페인트
  showCanvas();
  drawScrubFrame(scrub1Imgs, 0);
  setHl(hl.hero, 1);

  // 로더 숨김
  loader.classList.add('hide');

  // 2차: scrub2 프레임 백그라운드 로드 (자동애니 도는 ~10초 동안 준비됨)
  loadImages(scrub2Urls).then(imgs => { scrub2Imgs = imgs; });

  // 이벤트
  uploadBtn.addEventListener('click', startAutoAnim);
  window.addEventListener('resize', () => {
    computeRanges(); resizeCanvas();
    // 현재 프레임 재렌더
    if (committed) drawScrubFrame(scrub2Imgs, clamp(((lenis.animatedScroll ?? 0) - gateY) / S2_RANGE, 0, 1));
    else drawScrubFrame(scrub1Imgs, clamp((lenis.animatedScroll ?? 0) / S1_RANGE, 0, 1));
  });
}

boot();
