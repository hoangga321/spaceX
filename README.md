Galaxy Defender 게임 제작 보고서

1. 프로젝트 개요
◆ 게임 제목 : Galaxy Defender
◆ 제작자 : 리슝호앙-202395036
◆ 제작 기간 : 2025/11/10
◆ 사용 언어 : HTML,CSS,JS
◆ 팀 구성 : 개인
◆ 플랫폼 : Web Browser


2. 게임 기획 및 컨셉
◆ 기획 의도 : 어떤 게임을 만들고자 했는가?
간단한 조작으로 “쏘고 피하는” 재미를 극대화한 웹 브라우저 슈팅 게임. 짧은 플레이 세션에도 성취감(보스 격파, 점수 기록, 랭킹)을 주고, 반복 플레이를 통해 난이도·페이스 조절과 패턴 학습의 재미를 제공.
◆ 장르 : 생존, 러너, 퍼즐 등
아케이드 슈팅(Vertical Shoot ’em up) / 생존 회피 + 패턴 공략 / 점수 경쟁.
◆ 핵심 아이디어 : 
1. 세 가지 모드: Arcade(웨이브 진행+미니보스/보스), Boss Rush(연속 보스전), Time Attack(제한 시간·예정).
2. 파워업 드롭: Shield/Heal/Score, 난이도에 따라 드롭률 조정.
3. 보스 패턴 세트: 드레드노트 등 4보스, 페이즈별 탄막/쿨다운/텔레그래프 설계로 “읽고 대응”하는 재미.
4. 경량 웹 구현: HTML/CSS/JS, 로컬 리더보드, 다국어(i18n: KO/VI/EN), 배경 비디오 옵션.
◆ 타겟 유저/플레이 스타일 : 
타겟: 캐주얼부터 슈팅 입문/중수까지(10–35세 권장). 짧은 시간에 성취감을 원하는 유저, 점수 경쟁/보스 공략을 즐기는 유저.
플레이 스타일: 키보드(방향+사격), “보고 피하고 쏘는” 리듬. 실패-학습-재도전을 전제로 한 세션 2~5분 루프.
접근성: 난이도(Easy/Normal/Hard/Insane), 플래시 감소 옵션, BGM/SFX 볼륨 슬라이더, 일시정지/재시작 단축키.


3. 게임 시스템 구조
◆ 게임 진행 방식 : 
초기화: 자원 로드 → i18n 적용 → 패널/HUD 준비 → “시작 키 안내” 오버레이 표시.
시작 입력: Space/Enter/버튼 클릭 시 오디오 컨텍스트 resume, BGM 재생, 게임 루프 시작.
입력/이동: WASD/방향키 이동, 자동/수동 사격, P 일시정지, R 재시작. 포커스는 버튼에서 제거.
스폰/웨이브
Arcade: 웨이브 → 미니보스/보스 체크포인트 → 다음 웨이브. 드롭률은 난이도 기반.
Boss Rush: 보스 연속 출현(직전 보스와 중복 방지), 페이즈별 패턴·쿨다운·텔레그래프.
충돌 규칙: 플레이어↔탄/적/보스/파워업. 히트박스 스케일 조정, “감광(깜빡임 줄이기)” 옵션.
종료/메타: HP 0 또는 클리어 → BGM 정리 → 로컬 리더보드 저장 팝업 → 재시작/홈.
◆ 다이어그램 :


4. 기술적 구현 내용
◆ 주요 스크립트 설명 : 
main.js
게임 루프/상태 머신(대기 → 플레이 → 일시정지 → 게임오버), 렌더러/오디오 초기화, 모드/난이도 파라미터 파싱, 시작 입력 처리(Space/Enter/버튼).
BGM/SFX 채널 관리(메인/보스/효과음), 재시작 시 상태 및 입력/오디오 클린 리셋.
game_panel.js
좌측 패널 UI(일시정지/재시작/홈, 리더보드 팝업, 언어 드롭다운, BGM/SFX 볼륨 슬라이더, 깜빡임 감소 등)와 이벤트 바인딩.
i18n 변경 시 즉시 반영(패널 + 팝업 텍스트 재랜더).
hud.js
스코어·웨이브·HP 라벨 업데이트, 게임오버/랭킹 모달 표시.
랭킹 팝업은 중앙 모달 + ESC/닫기 버튼 포커스 트랩.
spawner.js
Arcade 웨이브 스케줄, Boss Rush의 “보스 목록 순환(직전 중복 방지)” 로직, 난이도별 밀도/쿨다운 스케일.
boss_flow.js / boss_patterns.js
보스 페이즈 전환, 탄막 패턴(쿨다운·텔레그래프), 히트박스 스케일. Boss Rush에서는 격파 시 다음 보스 인덱스 올바르게 갱신.
collider_all.js
플레이어↔탄/적/보스/파워업 충돌, 감광(깜빡임 감소) 옵션 반영, FEVER 게이지 트리거.
i18n.js
다국어 번역 테이블(KO/VI/EN) + t(key) 헬퍼. 페이지/패널/팝업 텍스트 동기 업데이트.
storage.js
로컬 리더보드(top10: 이름/점수/웨이브) 저장·정렬·중복 처리, 팝업 렌더 헬퍼.
index.js
홈(모드/난이도 선택, 비디오 배경 poster/preload="metadata"), Start 클릭 시 오디오 컨텍스트 unblock 준비 및 파라미터 전달.
◆ 클래스/컴포넌트 설명 + 간단한 코드 스냅샷
// main.js — 시작 입력 → 오디오 활성화 + 상태 전환
async function startGame() {
  await audio.resume(); // AudioContext resume (브라우저 자동재생 정책 대응)
  bgm.playLoop('main'); // 모드별 BGM 세팅
  state.set('play'); // idle → play
  loop.start();  // requestAnimationFrame 진입
}
// game_panel.js — 볼륨 슬라이더 → 오디오 채널 반영 + 라벨 갱신
$volBgm.addEventListener('input', e => {
  const v = e.target.value / 100;
  audio.setVolume('bgm', v);
  $volBgmLabel.textContent = `${Math.round(v*100)}%`;
});
// spawner.js — Boss Rush 다음 보스 선택(직전 보스 중복 방지)
function nextBossIndex() {
  const cand = bosses.filter((_, i) => i !== lastIdx);
  const pick = cand[(Math.random()*cand.length)|0];
  lastIdx = bosses.indexOf(pick);
  return lastIdx;
}
// storage.js — Top10 정렬 및 절단
export function saveScore(entry) {
  const list = load(); 
  list.push(entry);
  list.sort((a,b)=> b.score - a.score || b.wave - a.wave);
  store(list.slice(0,10));
}




◆ 문제 해결 경험 :
게임 시작이 안 됨 / 버튼 포커스 문제
	원인: 패널 버튼이 키보드 포커스를 잡아 Space/Enter가 버튼 클릭으로 소	비.
	해결: 시작 시/재시작 시 모든 버튼 blur(), 키 입력은 window 수준에서 리	슨.
보스 러시에서 보스 HP가 줄지 않음
	원인: 러시 모드 전용 HP 스케일/충돌 분기 누락.
	해결: collider_all.js에서 보스 타입/모드 체크 통일, boss_flow.js HP 초기화·	감소 루틴 재사용.
아케이드 모드 BGM이 간헐적으로 무음
	원인: audio.play()가 사용자 제스처 이전 호출 → 브라우저가 대기 상태.
	해결: Start(첫 상호작용)에서 AudioContext.resume() 후 재생, 실패 시 	catch 후 재시도 버튼 노출.
리더보드 팝업 언어가 즉시 안 바뀜
	원인: i18n 변경 시 팝업 DOM을 재생성하지 않음.
	해결: onLanguageChange 훅에서 패널·HUD·팝업 전부 재렌더.
Boss Rush가 사망 후 다음 보스로 넘어감
	원인: 보스 인덱스 증가 위치가 재시작 루프와 충돌.
	해결: “격파 시만 증가, 사망 시 유지”로 분리, reset()에서 인덱스 초기화 확	정.

◆ 구현 중 겪었던 오류/버그, 어떻게 해결했는지 기술
CORS/경로 이슈(배경 비디오, 오디오가 늦게 로드/404)
location.href 기반 상대경로에서 쿼리가 섞여 잘못된 URL 생성 → asset(base, path) 헬퍼로 pathname 기준 URL 생성, poster와 preload="metadata"로 초기 체감 속도 개선.
웹 UI 업로드 실패(파일 수 많을 때)
	원인: GitHub Web UI 배치 제한.
	해결: 폴더/배치 분할 업로드 또는 GitHub Desktop 사용, 대용량 미디어는 	Release로 배포.
화면 번쩍임(명멸) 민감도
	CSS 알파/블렌딩 조정 + “감광” 옵션 도입(히트 시 강한 플래시 제거), 캔버	스 오버레이 투명도 완화.
재시작 시 플레이어가 한쪽으로 자동 이동
	원인: 입력 상태 배열이 남아 있음.
	해결: input.reset()에서 모든 키 상태 초기화 + 브라우저 기본 자동 스크롤/	포커스 제거.


5. 디자인
◆ UI 구성 :  
IA(Information Architecture)
홈(Index)
1. 헤더: 로고, 언어 선택(EN/KR/VI)
2. 히어로: 배경 비디오/포스터, 타이틀/슬로건
3. 액션: Play, How to Play, Leaderboard
4. 모드 카드: Arcade / Boss Rush / Time Attack(예정) + 난이도 선택
게임(Game)
1. 좌측 패널(고정): 빠른동작(일시정지/재시작/홈), 리더보드 팝업, 언어, BGM/SFX 볼륨 슬라이더, 감광(깜빡임 감소) 토글
2. 메인 캔버스: 플레이 영역(16:9), 배경 이미지/비디오
3. HUD(오버레이): 상단 좌측 Score, 중앙 Wave, 우측 HP
4. 상태 오버레이: “시작 안내(Press Enter/Space)”, “PAUSED”, “GAME OVER”
5. 팝업 모달: 리더보드(Top10), How to(키 가이드), Confirm(재시작/홈)
레이아웃 & 가이드
1. 색상: 다크 네이비(#0B132B) 기반, 카드/버튼에 유리(Glass) 효과와 소프트 그림자
2. 폰트: 굵은 타이틀/라벨(가독성), 본문은 라이트/레귤러
3. 버튼: 둥근 모서리(12–16px), 호버/포커스 명확한 상태(테두리+광택)
4. 패널 폭: 280–320px, 모바일에서는 접이식(햄버거)
5. 캔버스: 최대 960×540(또는 1280×720), 중앙 정렬 + 반응형 letterboxing
6. 아이콘: 일시정지/재시작/음량/랭킹/홈 통일된 라인 아이콘=

6. 테스트 및 피드백
◆ 테스트 방법 : 자가 테스트, 친구/학생 대상 테스트 등
자가 테스트
	데스크톱(Edge/Chrome/Firefox), 노트북 iGPU, 윈도우 터치패드/키보드.
	DevTools Throttling(Fast 3G/Slow 4G)로 네트워크 지연 시뮬레이션.
	Lighthouse로 성능/접근성 점검.
동료·친구 테스트 
	모바일(Android Chrome) + 블루투스 키보드, 저사양 폰에서 발열/프레임.
	초보자에게 1분 튜토리얼 없이 플레이 → 진입장벽 확인.
버전 배포 테스트
	GitHub Pages 배포 링크로 원격 로딩 시간 측정(First Paint, Media start).
	캐시 첫 방문/재방문 비교.
◆ 발견된 문제점 및 개선 : 
BGM 자동재생 불가
	원인: 사용자 제스처 이전 audio.play() 호출.
	개선: Start 입력에서 AudioContext.resume() 후 BGM 시작. 실패 시 재시	도.
아케이드에서 BGM 미재생	
	원인: 모드 분기에서 메인 BGM 초기화 누락.
	개선: startGame()에서 mode별 BGM 확정 + 상태 전환 시 중복방지 스위치.
보스러시 보스 HP 감소 안 됨
	원인: 러시 전용 HP/충돌 스케일 분기 누락.
	개선: collider_all 공통 경로로 통일, boss_flow HP 초기화 위치 수정.
죽고 재시작 시 플레이어가 한쪽으로 이동
	원인: 키 입력 상태가 남음.
	개선: input.reset()에서 모든 키/포커스 완전 초기화.


랭킹 팝업 언어 미즉시 반영
	개선: 언어 변경 이벤트에서 팝업 DOM 재렌더.
버튼 포커스에 Space/Enter가 먹힘
	개선: 게임 시작 시 패널 모든 버튼 blur() + window-level key listener.
배경 비디오/오디오 지연
	개선: 비디오 poster + preload="metadata", audio는 첫 상호작용 후 로딩.
CORS/경로 404
	개선: 쿼리 포함 URL 회피, pathname 기반 asset helper로 정규화.
성능 튜닝
	탄막/엔티티 풀링, 스프라이트 압축(WebP), HUD 그리기 배치 최소화.


7. 회고 및 느낀 점
◆ 어떤 점이 가장 어려웠고, 어떤 점에서 성취감을 느꼈는가
모드 완성도: Arcade와 Boss Rush 모두 루프가 안정적으로 동작, 보스 테마/전환이 “한 판의 흐름”을 만들어 줌.
품질-of-life: 볼륨 슬라이더, 감광 옵션, 중앙 모달 랭킹, 다국어(i18n) 즉시 반영 등 유틸리티를 시스템화.
테크 데트 정리: 스포너/보스/충돌 코드를 공통화하여 이후 기능 추가(타임어택, 상점) 여지가 생김.
◆ 다음에 만들고 싶은 게임 아이디어
Time Attack 모드 정식화(3–5분 제한, 미니보스 라인업, 점수 보정).
메타 성장: 라운드 종료 후 임시 업그레이드/상점(연사, 관통, 위성 드론).
패턴 에디터: JSON/PUML 유사한 경량 DSL로 보스 패턴을 시각적 편집 → 디자이너 협업 용이.
모바일 전용 조작: 가상 조이스틱/사격 슬라이더 + 햅틱 피드백.
◆ 학습적으로 어떤 성장을 했는가
상태 모델링(idle/play/pause/gameover, mode sub-state)과 사이드이펙트 제어(오디오/입력/스폰)의 분리를 체득.
렌더·충돌 성능: 풀링, 배치 업데이트, 히트박스 스케일 관리, 깜빡임/가시성 설계.
DX/국제화: i18n 구조화와 UI 재렌더 훅, 접근성(포커스 트랩/키보드 내비게이션) 기본기.
배포/운영 관점: 정적 호스팅 제약, 자산 용량 관리, 초기 로드 최적화와 실제 체감 속도 차이 이해.


8. 스크린샷 및 게임 URL
◆ 주요 장면 스크린샷



◆ 기능별 화면 




◆ URL 주소 : https://hoangga321.github.io/spaceX/


9. 코드
◆ js (파일명 :   )


◆ html (파일명 : index.html, game.html  )
◆ css (파일명 : base.css, landing.css, game.css  )



