'use strict';

const lessons = [
  { id: 2, title: 'Vibe Coding 개념과 회사 내 AI Coding 활용 실습', short: 'Vibe Coding', description: '프롬프트에서 자율 에이전트까지, AI 개발 도구와 활용 전략.' },
  { id: 3, title: 'IT 프레임워크의 이해', short: 'IT 프레임워크의 이해', description: '프레임워크의 본질부터 Java 생태계의 진화까지. 조회 요청 한 건을 따라가며 이해합니다.', video: 'assets/lesson-03.mp4', duration: 902.1 },
  { id: 4, title: 'KB손해보험 대내·대외 연계 구조의 이해', short: '대내·대외 연계 구조의 이해', description: '우리 시스템을 잇는 연계 솔루션과 기술 스택을 알아봅니다.' },
  { id: 5, title: 'KB손해보험 주요 솔루션 아키텍처 및 활용 이해 ①', short: '주요 솔루션 아키텍처 ①', description: '우리 회사 업무를 움직이는 주요 솔루션을 이해합니다.' },
  { id: 6, title: 'KB손해보험 주요 솔루션 아키텍처 및 활용 이해 ②', short: '주요 솔루션 아키텍처 ②', description: '연계·데이터·이벤트·형상관리·발송을 담당하는 기반 솔루션을 살펴봅니다.' },
  { id: 7, title: '시스템 환경구성의 이해', short: '시스템 환경구성의 이해', description: '하드웨어부터 OS, 웹 서버, WAS, 컨테이너까지 이어지는 시스템의 구조.' },
  { id: 8, title: 'KB손해보험 클라우드 환경 구성 이해', short: '클라우드 환경 구성 이해', description: '베어메탈, 가상화에서 클라우드 네이티브까지 살펴봅니다.' },
  { id: 9, title: 'KB손해보험 데이터베이스 아키텍처 이해', short: '데이터베이스 아키텍처 이해', description: '기간계·조회계·스냅샷·퓨어스케일·SQL 플랜을 알아봅니다.' },
  { id: 10, title: '개발자를 위한 네트워크 기초', short: '개발자를 위한 네트워크 기초', description: '내 코드가 보낸 요청은 어디를 거쳐 서버까지 갈까요?' },
];

const chapterData = [
  [0, '조회 버튼 뒤의 세계'], [58, '프레임워크를 쓰는 네 가지 이유'],
  [113, '누가 누구를 부르는가'], [175, '도구의 이름보다 제어권'],
  [237, 'Servlet에서 Spring Boot까지'], [303, '객체를 연결하는 DI'],
  [365, '흩어진 로그가 한곳으로'], [431, 'AOP가 실행되는 세 가지 시점'],
  [495, 'Spring에서 Spring Boot로'], [564, '설정에서 관례로, 실행의 시작점'],
  [626, '요리로 다시 떠올리는 세 가지 방식'], [695, '스물다섯 줄에서 한 줄로'],
  [756, '다시, 조회 요청 한 건'], [832, '원본의 비교와 다음 실습'],
];
const $ = (id) => document.getElementById(id);
const video = $('video');
const storageKey = 'studyan-preview-lesson3-v1';
let currentLesson;
let playbackStarted = false;
let pendingSeek = null;
let saved = readProgress();
let lastSaveAt = 0;
let toastTimer;
let selectedLocationSearch = null;

function readProgress() {
  try {
    const record = JSON.parse(localStorage.getItem(storageKey));
    if (record && Number.isFinite(record.time) && record.time >= 0 && record.time <= 902.1) {
      return { time: record.time, completed: record.completed === true };
    }
  } catch { /* Playback remains available when browser storage is unavailable. */ }
  return { time: 0, completed: false };
}

function formatTime(seconds) {
  const whole = Math.floor(seconds);
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
}

function showToast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.add('visible');
  toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4000);
}

function saveProgress() {
  if (currentLesson?.id !== 3 || !playbackStarted || video.readyState < 1 || pendingSeek !== null || video.seeking || !Number.isFinite(video.currentTime)) return;
  saved = { time: Math.min(video.currentTime, 902.1), completed: saved.completed || video.ended };
  try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* Same-session progress still works. */ }
  updateProgress();
}

function updateProgress() {
  const percent = saved.completed ? 100 : Math.min(99, Math.floor(saved.time / 902.1 * 100));
  $('progress').value = percent;
  $('progress-label').textContent = saved.completed ? '3강 시청 완료' : saved.time >= 1 ? `3강 · ${formatTime(saved.time)}까지 시청` : '아직 시청 전';
}

function renderPlaylist() {
  const fragment = document.createDocumentFragment();
  lessons.forEach((lesson) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lesson-button';
    button.dataset.lesson = lesson.id;
    button.setAttribute('aria-label', `${lesson.id}강 ${lesson.title}${lesson.video ? ', 15분 02초, 영상 보기' : ', 영상 준비 중'}`);
    const number = document.createElement('span');
    number.className = 'lesson-number';
    number.textContent = String(lesson.id).padStart(2, '0');
    number.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('span');
    copy.className = 'lesson-copy';
    const title = document.createElement('strong');
    title.textContent = lesson.title;
    const meta = document.createElement('small');
    meta.textContent = lesson.video ? '15:02 · 지금 시청 가능' : '영상 준비 중';
    copy.append(title, meta);
    button.append(number, copy);
    button.addEventListener('click', () => selectLesson(lesson.id, { navigate: true, focus: true }));
    item.append(button);
    fragment.append(item);
  });
  $('lessons').replaceChildren(fragment);
}

function renderChapters() {
  chapterData.forEach(([seconds, title]) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.time = seconds;
    button.setAttribute('aria-label', `${formatTime(seconds)}, ${title}, 해당 장면 재생`);
    const time = document.createElement('time');
    time.textContent = formatTime(seconds);
    const text = document.createElement('span');
    text.textContent = title;
    button.append(time, text);
    button.addEventListener('click', () => seekAndPlay(seconds));
    item.append(button);
    $('chapters').append(item);
  });
}

function updateChapter() {
  const index = chapterData.findLastIndex(([seconds]) => video.currentTime >= seconds);
  [...$('chapters').querySelectorAll('button')].forEach((button, i) => {
    if (i === index) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
}

async function playVideo() {
  if (!currentLesson?.video) return;
  try { await video.play(); }
  catch (error) {
    if (error.name !== 'AbortError') showToast('재생 버튼을 다시 눌러주세요.');
  }
}

function seekAndPlay(seconds) {
  if (currentLesson?.id !== 3) return;
  const target = Math.max(0, Math.min(seconds, 902.1));
  if (video.readyState >= 1) video.currentTime = target;
  else pendingSeek = target;
  $('resume-notice').hidden = true;
  playVideo();
}

function selectLesson(id, { navigate = false, focus = false, time = null } = {}) {
  const lesson = lessons.find((item) => item.id === id) || lessons[1];
  saveProgress();
  video.pause();
  currentLesson = lesson;
  playbackStarted = false;
  pendingSeek = null;
  const available = Boolean(lesson.video);
  video.hidden = !available;
  $('big-play').hidden = !available;
  $('unavailable').hidden = available;
  $('speed-control').hidden = !available;
  $('chapter-section').hidden = !available;
  $('resource-row').hidden = !available;
  $('lesson-title').textContent = lesson.title;
  $('lesson-description').textContent = lesson.description;
  $('lesson-state').textContent = available ? '3강 · 15분 02초' : `${lesson.id}강 · 영상 준비 중`;
  $('unavailable-title').textContent = lesson.title;
  $('unavailable-number').textContent = String(lesson.id).padStart(2, '0');
  document.title = `${lesson.id}강 ${lesson.title} · 스터디언 강의실`;
  if (available) {
    video.setAttribute('aria-label', `${lesson.id}강 ${lesson.title} 강의 영상`);
    video.src = lesson.video;
    pendingSeek = Number.isFinite(time) && time > 0 ? Math.min(time, 902.1) : null;
    video.load();
    video.playbackRate = Number($('speed').value);
  } else {
    video.removeAttribute('src');
    video.load();
  }
  $('resume-notice').hidden = !available || saved.time < 10 || saved.completed || pendingSeek !== null;
  $('resume-time').textContent = formatTime(saved.time);
  document.querySelectorAll('.lesson-button').forEach((button) => {
    if (Number(button.dataset.lesson) === lesson.id) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
  const index = lessons.indexOf(lesson);
  $('previous').disabled = index === 0;
  $('next').disabled = index === lessons.length - 1;
  $('previous-title').textContent = lessons[index - 1] ? `${lessons[index - 1].id}강 · ${lessons[index - 1].short}` : '첫 번째 강의입니다';
  $('next-title').textContent = lessons[index + 1] ? `${lessons[index + 1].id}강 · ${lessons[index + 1].short}` : '마지막 강의입니다';
  if (navigate) {
    const url = new URL(location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('lesson', lesson.id);
    history.pushState({}, '', url);
    selectedLocationSearch = location.search;
  }
  if (focus) {
    $('player-section').focus({ preventScroll: true });
    $('player-section').scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  updateChapter();
}

function loadFromLocation() {
  // In-page links must not reload the currently playing video.
  if (selectedLocationSearch === location.search) return;
  selectedLocationSearch = location.search;
  const params = new URLSearchParams(location.search);
  const time = Number(params.get('t'));
  selectLesson(Number(params.get('lesson')), { time: Number.isFinite(time) ? time : null });
}

$('big-play').addEventListener('click', playVideo);
$('back-to-video').addEventListener('click', () => selectLesson(3, { navigate: true, focus: true }));
$('resume').addEventListener('click', () => seekAndPlay(saved.time));
$('speed').addEventListener('change', () => { video.playbackRate = Number($('speed').value); });
$('previous').addEventListener('click', () => {
  const previous = lessons[lessons.indexOf(currentLesson) - 1];
  if (previous) selectLesson(previous.id, { navigate: true, focus: true });
});
$('next').addEventListener('click', () => {
  const next = lessons[lessons.indexOf(currentLesson) + 1];
  if (next) selectLesson(next.id, { navigate: true, focus: true });
});
$('share').addEventListener('click', async () => {
  const url = new URL(location.href);
  url.search = '';
  url.hash = '';
  url.searchParams.set('lesson', currentLesson.id);
  try {
    await navigator.clipboard.writeText(url.href);
    showToast('강의 링크를 복사했어요.');
  } catch { showToast('주소창의 강의 링크를 복사해주세요.'); }
});
video.addEventListener('loadedmetadata', () => {
  if (currentLesson?.id !== 3) return;
  if (pendingSeek !== null) { video.currentTime = Math.min(pendingSeek, video.duration); pendingSeek = null; }
  video.playbackRate = Number($('speed').value);
});
video.addEventListener('play', () => {
  if (currentLesson?.id !== 3) return;
  playbackStarted = true;
  $('big-play').hidden = true;
  $('resume-notice').hidden = true;
});
video.addEventListener('timeupdate', () => {
  if (currentLesson?.id !== 3) return;
  updateChapter();
  if (Date.now() - lastSaveAt > 2000) { saveProgress(); lastSaveAt = Date.now(); }
});
video.addEventListener('pause', saveProgress);
video.addEventListener('ended', () => {
  saveProgress();
  showToast('3강 시청을 마쳤어요. 필요한 장면은 목차에서 다시 볼 수 있습니다.');
});
video.addEventListener('error', () => {
  if (currentLesson?.video) showToast('영상을 불러오지 못했어요. 페이지를 새로고침해주세요.');
});
window.addEventListener('pagehide', saveProgress);
window.addEventListener('popstate', loadFromLocation);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveProgress(); });
renderPlaylist();
renderChapters();
updateProgress();
loadFromLocation();
