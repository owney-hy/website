/* ============================================================
   script.js  —  POS·PDA 사용법 안내 사이트
   구성:
     1. 콘텐츠 데이터베이스 (CONTENT)
     2. 검색 데이터 인덱스 (SEARCH_DATA)
     3. 탭 전환 (switchTab)
     4. 상세 패널 열기/닫기 (openDetail / closeDetail)
     5. FAQ 아코디언 (toggleFAQ)
     6. 검색 기능 (searchInput 이벤트)
     7. QR 모달 (openQRModal / closeQRModal)
   ============================================================ */


/* ──────────────────────────────────────────────────────────
   1. 콘텐츠 데이터베이스
   각 항목 구조:
     tab      : 'pos' | 'pda'
     icon     : 이모지
     title    : 제목
     subtitle : 부제목
     steps    : [{ text }]  — HTML 태그 허용
     notice   : 주의사항 문자열 (선택)
     error    : { title, cases[] } — 즉시 연락 박스 (선택)
     faq      : [{ q, a }]
────────────────────────────────────────────────────────── */
const CONTENT = {

  /* ── POS ──────────────────────────────────────── */

  'pos-login': {
    tab: 'pos',
    icon: '🔑',
    title: 'POS 로그인 및 초기 화면',
    subtitle: 'POS 단말기를 처음 시작할 때',
    steps: [
      { text: 'POS 단말기 전원 버튼을 눌러 켭니다.' },
      { text: '<strong>로그인 화면</strong>이 나타나면 담당자 <strong>아이디와 비밀번호</strong>를 입력합니다.' },
      { text: '로그인 완료 후 <strong>메인 화면</strong>으로 이동합니다.<br>상단에는 날짜/시간, 하단에는 결제·취소·조회 메뉴가 있습니다.' },
      { text: '결제를 시작하려면 <strong>[결제]</strong> 버튼을 누릅니다.' },
    ],
    notice: '비밀번호 5회 오류 시 계정이 잠깁니다. 관리자에게 초기화 요청하세요.',
    faq: [
      { q: '화면이 꺼져 있을 때 어떻게 하나요?',
        a: '전원 버튼을 3초간 길게 누르면 켜집니다. 절전 모드인 경우 화면을 한 번 터치하면 활성화됩니다.' },
      { q: '로그인 화면이 나오지 않으면?',
        a: '단말기를 재시작하세요. 화면 상단의 재시작 버튼을 누르거나, 전원을 껐다가 다시 켜세요.' },
    ],
  },

  'pos-card': {
    tab: 'pos',
    icon: '💳',
    title: '카드 결제',
    subtitle: '신용카드·체크카드 결제 방법',
    steps: [
      { text: '메인 화면에서 <strong>[결제]</strong> 버튼을 누릅니다.' },
      { text: '상품을 바코드 스캔하거나 수동으로 금액을 입력합니다.' },
      { text: '결제 수단 화면에서 <strong>[카드]</strong>를 선택합니다.' },
      { text: '고객에게 카드를 <strong>단말기 카드 투입구에 삽입</strong>하거나 갖다 대도록 안내합니다. (IC칩 또는 NFC)' },
      { text: '고객이 <strong>비밀번호를 입력</strong>합니다. (체크카드·신용카드 모두 동일)' },
      { text: '승인 완료 메시지 확인 후 영수증이 자동 출력됩니다.' },
    ],
    notice: '카드 오류 시 카드를 제거한 뒤 다시 삽입하세요. IC칩 방향을 확인해 주세요.',
    faq: [
      { q: '카드 결제가 승인 거절되면?',
        a: '카드사 문제일 수 있습니다. 고객에게 다른 카드 사용 또는 현금 결제 변경을 안내하세요. 단말기 문제가 아닙니다.' },
      { q: '영수증이 안 나오면?',
        a: '프린터 용지 부족 여부를 확인하고 용지를 교체하세요. 그래도 안 되면 영수증 재출력 메뉴를 이용하세요.' },
      { q: '삼성페이·카카오페이도 되나요?',
        a: 'NFC 기능이 지원되는 단말기라면 가능합니다. 카드처럼 단말기에 스마트폰을 갖다 대면 됩니다.' },
    ],
  },

  'pos-cash': {
    tab: 'pos',
    icon: '💵',
    title: '현금 결제',
    subtitle: '현금 결제 및 현금영수증 처리 방법',
    steps: [
      { text: '메인 화면에서 <strong>[결제]</strong> 버튼을 누릅니다.' },
      { text: '금액을 입력하거나 상품을 스캔합니다.' },
      { text: '결제 수단에서 <strong>[현금]</strong>을 선택합니다.' },
      { text: '고객이 지불하는 금액을 입력하면 <strong>거스름돈 금액이 화면에 표시</strong>됩니다.' },
      { text: '현금영수증 발급 여부를 고객에게 확인합니다.<br>- 발급: 고객 휴대폰 번호 또는 현금영수증 카드 입력<br>- 미발급: [발급 안함] 선택' },
      { text: '결제 완료 후 영수증 출력.' },
    ],
    faq: [
      { q: '현금영수증 발급을 나중에 해달라고 하면?',
        a: '현금 결제 완료 후에는 별도의 현금영수증 발급 메뉴에서 처리 가능합니다. 단, 당일 내에 처리하세요.' },
    ],
  },

  'pos-complex': {
    tab: 'pos',
    icon: '🔀',
    title: '복합 결제',
    subtitle: '카드 + 현금 등 혼합 결제 방법',
    steps: [
      { text: '결제 화면에서 결제 수단을 <strong>[복합결제]</strong>로 선택합니다.' },
      { text: '총 결제 금액 중 <strong>카드로 결제할 금액을 먼저 입력</strong>합니다.' },
      { text: '카드 결제 완료 후, 나머지 금액이 자동 계산됩니다.' },
      { text: '<strong>나머지 금액을 현금으로 수령</strong>하고 거스름돈을 계산합니다.' },
      { text: '전체 결제 완료 후 통합 영수증이 출력됩니다.' },
    ],
    notice: '복합결제 중 카드 결제가 실패하면 이미 처리된 부분은 취소되지 않으므로 주의하세요. 오류 발생 시 관리자에게 문의하세요.',
    faq: [],
  },

  'pos-cancel': {
    tab: 'pos',
    icon: '❌',
    title: '결제 취소 (당일)',
    subtitle: '방금 또는 오늘 결제한 건 전액 취소',
    steps: [
      { text: '메인 화면에서 <strong>[취소]</strong> 또는 <strong>[결제취소]</strong> 버튼을 누릅니다.' },
      { text: '취소할 결제 건을 조회합니다. 영수증 번호·시간·금액으로 검색 가능합니다.' },
      { text: '해당 결제 건을 선택하고 <strong>[취소]</strong>를 누릅니다.' },
      { text: '카드 취소의 경우 <strong>동일 카드를 단말기에 삽입</strong>하거나 갖다 대도록 안내합니다.' },
      { text: '취소 완료 메시지 확인 후 취소 영수증이 출력됩니다.' },
    ],
    notice: '취소는 반드시 결제 시 사용한 동일 카드로만 가능합니다. 다른 카드로는 취소가 되지 않습니다.',
    faq: [
      { q: '어제 결제를 취소해야 하면?',
        a: '당일 취소가 아닌 경우 [반품] 메뉴를 이용하세요. 처리 방법이 다릅니다.' },
      { q: '카드사 승인이 이미 된 건도 취소되나요?',
        a: '네, 단말기에서 취소하면 카드사에도 자동으로 취소 신호가 전달됩니다. 3~5 영업일 내에 환불됩니다.' },
    ],
  },

  'pos-partial': {
    tab: 'pos',
    icon: '✂️',
    title: '부분 취소',
    subtitle: '결제 금액 중 일부만 취소하는 방법',
    steps: [
      { text: '메인 화면에서 <strong>[취소]</strong> 메뉴로 이동합니다.' },
      { text: '취소할 결제 건을 조회·선택합니다.' },
      { text: '<strong>[부분취소]</strong>를 선택하고, 취소할 금액을 직접 입력합니다.' },
      { text: '카드를 단말기에 삽입하거나 갖다 대도록 안내합니다.' },
      { text: '부분취소 완료 후 취소 영수증 출력.' },
    ],
    notice: '부분 취소 후 남은 금액이 변경되므로 고객에게 안내하세요. 부분취소가 지원되지 않는 카드사도 있습니다.',
    faq: [],
  },

  'pos-refund': {
    tab: 'pos',
    icon: '🔄',
    title: '반품 처리',
    subtitle: '전날 또는 이전 날짜 결제 건 반품',
    steps: [
      { text: '메인 화면에서 <strong>[반품]</strong> 메뉴를 선택합니다.' },
      { text: '반품할 결제 건의 <strong>영수증 번호</strong>를 조회합니다. (영수증이 없으면 날짜+금액으로 검색)' },
      { text: '해당 결제 건을 선택하고 <strong>[반품 진행]</strong>을 누릅니다.' },
      { text: '결제 수단에 따라 카드 또는 현금으로 환불 처리됩니다.' },
      { text: '반품 완료 후 반품 영수증 출력.' },
    ],
    notice: '카드 반품은 카드사 정책에 따라 최대 1~2일이 걸릴 수 있습니다. 고객에게 안내하세요.',
    faq: [],
  },

  'pos-receipt': {
    tab: 'pos',
    icon: '🖨️',
    title: '영수증 재출력',
    subtitle: '이미 발행된 영수증을 다시 출력',
    steps: [
      { text: '메인 화면에서 <strong>[조회]</strong> 또는 <strong>[영수증]</strong> 메뉴로 이동합니다.' },
      { text: '영수증 번호, 결제 시간, 금액 중 하나로 검색합니다.' },
      { text: '해당 결제 건을 선택하고 <strong>[영수증 재출력]</strong>을 누릅니다.' },
      { text: '영수증이 출력됩니다. "재발행" 도장이 찍혀 나옵니다.' },
    ],
    faq: [
      { q: '전자영수증(문자/카카오)으로 보내려면?',
        a: '영수증 재출력 화면에서 [문자 전송] 또는 [카카오 전송]을 선택한 뒤 고객 전화번호를 입력하세요.' },
    ],
  },

  'pos-settle': {
    tab: 'pos',
    icon: '📊',
    title: '마감 정산',
    subtitle: '일별 매출 마감 및 정산 방법',
    steps: [
      { text: '영업 종료 후 메인 화면에서 <strong>[정산]</strong> 메뉴로 이동합니다.' },
      { text: '오늘 날짜가 자동으로 선택됩니다. <strong>[정산 시작]</strong>을 누릅니다.' },
      { text: '카드 결제 합계, 현금 결제 합계, 취소 합계 등이 화면에 표시됩니다.' },
      { text: '내용을 확인 후 <strong>[정산 확정]</strong>을 누릅니다.' },
      { text: '정산 영수증이 출력됩니다. 보관하세요.' },
    ],
    notice: '정산은 하루 1회만 가능합니다. 정산 후에는 당일 데이터를 수정할 수 없으니 신중하게 확인하세요.',
    faq: [
      { q: '정산을 실수로 눌렀어요. 취소할 수 있나요?',
        a: '정산 확정 전에는 취소 가능합니다. 확정 후에는 취소가 불가능하므로 관리자에게 문의하세요.' },
    ],
  },

  'pos-error': {
    tab: 'pos',
    icon: '⚠️',
    title: 'POS 장애 대응',
    subtitle: '오류 발생 시 빠른 해결 방법',
    steps: [
      { text: '<strong>화면이 멈춘 경우</strong>: 화면을 5초간 꾹 누르거나, 전원 버튼을 길게 눌러 재시작합니다.' },
      { text: '<strong>네트워크 오류 메시지</strong>: 우선 단말기를 재시작합니다. 해결 안 되면 Wi-Fi 또는 LAN 케이블 연결 상태를 확인합니다.' },
      { text: '<strong>프린터 오류</strong>: 프린터 뚜껑을 열어 용지 유무를 확인합니다. 용지가 있다면 꺼냈다 다시 넣고 뚜껑을 닫습니다.' },
      { text: '<strong>카드 리더기 오류</strong>: 카드 삽입구 내 이물질을 확인하고 다시 시도합니다. 반복되면 IT 담당자에게 연락합니다.' },
    ],
    error: {
      title: '즉시 IT 담당자에게 연락해야 하는 경우',
      cases: [
        '재시작 후에도 동일 오류가 반복될 때',
        '결제는 됐는데 승인 내역이 확인 안 될 때',
        '화면이 완전히 꺼지고 켜지지 않을 때',
        '정산 중 오류가 발생했을 때',
      ],
    },
    faq: [],
  },


  /* ── PDA ──────────────────────────────────────── */

  'pda-login': {
    tab: 'pda',
    icon: '🔑',
    title: 'PDA 로그인 및 메인 화면',
    subtitle: 'PDA 기기를 처음 시작할 때',
    steps: [
      { text: 'PDA 기기의 <strong>전원 버튼을 1~2초</strong> 눌러 켭니다.' },
      { text: '화면에 <strong>로그인 창</strong>이 뜨면 담당자 아이디와 비밀번호를 입력합니다.' },
      { text: '로그인 완료 후 메인 메뉴가 나타납니다. 상품조회, 재고, 매출 등의 메뉴가 있습니다.' },
      { text: '화면이 꺼지는 것을 방지하려면 설정에서 <strong>화면 꺼짐 시간을 늘려두는 것</strong>을 권장합니다.' },
    ],
    faq: [
      { q: 'PDA 배터리가 부족할 때?',
        a: '화면 상단에 배터리 아이콘이 빨간색이면 충전기를 연결하세요. 충전 중에도 사용 가능합니다.' },
    ],
  },

  'pda-product': {
    tab: 'pda',
    icon: '🔍',
    title: '상품 조회',
    subtitle: '바코드 스캔 및 상품 정보 검색',
    steps: [
      { text: '메인 메뉴에서 <strong>[상품조회]</strong>를 선택합니다.' },
      { text: 'PDA 측면의 <strong>스캔 버튼을 눌러</strong> 상품 바코드를 스캔합니다. 또는 검색창에 상품명·바코드를 직접 입력합니다.' },
      { text: '상품 정보(이름, 가격, 재고수량, 위치)가 화면에 표시됩니다.' },
      { text: '여러 상품을 연속 조회하려면 스캔 버튼을 계속 누르거나 검색창을 초기화 후 재입력합니다.' },
    ],
    faq: [
      { q: '바코드가 잘 스캔이 안 될 때?',
        a: '바코드 표면이 구겨지거나 빛 반사가 심하면 스캔이 어렵습니다. 각도를 바꿔보거나 바코드 번호를 수동 입력하세요.' },
    ],
  },

  'pda-stock': {
    tab: 'pda',
    icon: '📦',
    title: '재고 확인',
    subtitle: '현재 재고 수량 조회 방법',
    steps: [
      { text: '메인 메뉴에서 <strong>[재고관리]</strong>를 선택합니다.' },
      { text: '상품 바코드를 스캔하거나 상품명으로 검색합니다.' },
      { text: '상품의 <strong>현재 재고 수량, 위치, 최근 입고일</strong> 등이 표시됩니다.' },
      { text: '재고가 0인 경우 화면에 "재고 없음"으로 표시됩니다.' },
    ],
    faq: [
      { q: 'PDA 재고와 실제 재고가 다를 때?',
        a: '입고·출고 처리가 누락된 경우입니다. 관리자에게 재고 조정을 요청하세요.' },
    ],
  },

  'pda-sales': {
    tab: 'pda',
    icon: '📈',
    title: '매출 조회',
    subtitle: '일별·기간별 매출 데이터 확인',
    steps: [
      { text: '메인 메뉴에서 <strong>[매출조회]</strong>를 선택합니다.' },
      { text: '조회할 기간을 설정합니다. 오늘·이번 주·이번 달 또는 직접 날짜를 지정할 수 있습니다.' },
      { text: '<strong>[조회]</strong>를 누르면 총 매출, 건수, 카드·현금 비율 등이 표시됩니다.' },
      { text: '특정 상품의 매출을 보려면 상품 바코드를 스캔하거나 검색합니다.' },
    ],
    faq: [
      { q: '오늘 매출이 반영되어 있지 않으면?',
        a: '매출 데이터는 실시간 또는 일정 시간마다 동기화됩니다. 잠시 기다린 후 다시 조회하거나 화면을 새로고침하세요.' },
    ],
  },

  'pda-order': {
    tab: 'pda',
    icon: '📋',
    title: '주문 조회',
    subtitle: '주문 내역 및 상태 확인 방법',
    steps: [
      { text: '메인 메뉴에서 <strong>[주문조회]</strong>를 선택합니다.' },
      { text: '조회 기간 또는 주문번호를 입력합니다.' },
      { text: '주문 목록이 표시됩니다. 각 주문을 눌러 상세 내역을 확인합니다.' },
      { text: '주문 상태(접수 / 처리중 / 완료 / 취소)를 확인할 수 있습니다.' },
    ],
    faq: [],
  },

  'pda-error': {
    tab: 'pda',
    icon: '⚠️',
    title: 'PDA 오류 대응',
    subtitle: '오류 발생 시 빠른 해결 방법',
    steps: [
      { text: '<strong>화면 멈춤</strong>: 전원 버튼을 8~10초간 길게 눌러 강제 재시작합니다.' },
      { text: '<strong>스캔이 안 될 때</strong>: 앱을 닫고 다시 열거나 PDA를 재시작합니다. 스캔 창을 다시 활성화해보세요.' },
      { text: '<strong>Wi-Fi 끊김</strong>: 설정 → Wi-Fi 에서 자동 연결 네트워크를 확인하고 다시 연결합니다.' },
      { text: '<strong>앱이 실행 안 될 때</strong>: 앱을 종료하고 다시 실행합니다. 반복되면 재시작 후 시도합니다.' },
    ],
    error: {
      title: '즉시 IT 담당자에게 연락해야 하는 경우',
      cases: [
        '재시작 후에도 앱이 실행 안 될 때',
        '데이터 조회가 계속 로딩 중일 때',
        '기기가 완전히 먹통이 될 때',
      ],
    },
    faq: [],
  },
};


/* ──────────────────────────────────────────────────────────
   2. 검색 인덱스 자동 생성
   — CONTENT 객체에서 텍스트를 추출해 keywords 문자열로 변환
────────────────────────────────────────────────────────── */
const SEARCH_DATA = Object.entries(CONTENT).map(([id, d]) => ({
  id,
  title: d.title,
  tab: d.tab,
  keywords: (d.title + ' ' + d.subtitle + ' ' + d.steps.map(s => s.text).join(' '))
    .replace(/<[^>]+>/g, ''),   // HTML 태그 제거
}));


/* ──────────────────────────────────────────────────────────
   3. 탭 전환
────────────────────────────────────────────────────────── */

/**
 * @param {'pos'|'pda'} tab - 전환할 탭 ID
 * @param {HTMLElement}  btn - 클릭된 탭 버튼 요소
 */
function switchTab(tab, btn) {
  // 탭 패널 / 버튼 비활성화
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  // 선택한 탭 활성화
  document.getElementById('tab-' + tab).classList.add('active');
  btn.classList.add('active');

  // 열려 있던 상세 패널 초기화
  document.querySelectorAll('.detail-panel').forEach(p => p.remove());
  currentOpenId = null;
}


/* ──────────────────────────────────────────────────────────
   4. 상세 패널 열기 / 닫기
────────────────────────────────────────────────────────── */

/** 현재 열린 패널 ID 추적 */
let currentOpenId = null;

/**
 * 기능 카드 클릭 시 상세 패널을 빠른 바로가기 아래에 삽입합니다.
 * 같은 ID를 다시 클릭하면 패널이 닫힙니다.
 * @param {string} id - CONTENT 객체의 키
 */
function openDetail(id) {
  const data = CONTENT[id];
  if (!data) return;

  const container = document.getElementById('detail-container-' + data.tab);

  // 기존 패널 제거
  const existing = container.querySelector('.detail-panel');
  if (existing) existing.remove();

  // 같은 항목 재클릭 → 닫기
  if (currentOpenId === id) {
    currentOpenId = null;
    return;
  }
  currentOpenId = id;

  // PDA 여부에 따른 스타일 변수
  const isPDA    = data.tab === 'pda';
  const stepCls  = isPDA ? 'pda-step' : '';
  const numColor = isPDA ? 'var(--pda-color)' : 'var(--primary)';
  const iconBg   = isPDA ? 'var(--pda-light)' : 'var(--primary-light)';

  /* ── HTML 조각 빌더 ─────────────────────────── */

  // 단계별 가이드
  const stepsHTML = data.steps.map((s, i) => `
    <div class="step ${stepCls}">
      <div class="step-num" style="background:${numColor}">${i + 1}</div>
      <div class="step-text">${s.text}</div>
    </div>
  `).join('');

  // 주의사항 박스 (선택)
  const noticeHTML = data.notice ? `
    <div class="notice-box">
      <span class="notice-icon">⚠️</span>
      <span>${data.notice}</span>
    </div>` : '';

  // 즉시 연락 박스 (선택)
  const errorHTML = data.error ? `
    <div class="error-box">
      <div class="error-title">🚨 ${data.error.title}</div>
      <ul class="error-cases">
        ${data.error.cases.map(c => `<li>${c}</li>`).join('')}
      </ul>
    </div>` : '';

  // FAQ 아코디언 (선택)
  const faqHTML = data.faq && data.faq.length ? `
    <div class="faq-section">
      <div class="faq-title">💬 자주 묻는 질문</div>
      <div class="faq-list">
        ${data.faq.map((f, i) => `
          <div class="faq-item" id="faq-${id}-${i}">
            <div class="faq-q" onclick="toggleFAQ('faq-${id}-${i}')">
              <span>Q. ${f.q}</span>
              <span class="faq-arrow">▼</span>
            </div>
            <div class="faq-a">A. ${f.a}</div>
          </div>
        `).join('')}
      </div>
    </div>` : '';

  /* ── 패널 DOM 생성 ──────────────────────────── */
  const panel = document.createElement('div');
  panel.className = 'detail-panel open';
  panel.innerHTML = `
    <div class="detail-header">
      <div class="detail-icon" style="background:${iconBg}">${data.icon}</div>
      <div>
        <div class="detail-title">${data.title}</div>
        <div class="detail-subtitle">${data.subtitle}</div>
      </div>
      <button class="close-btn" onclick="closeDetail('${id}')">✕</button>
    </div>
    <div class="steps">${stepsHTML}</div>
    ${noticeHTML}
    ${errorHTML}
    ${faqHTML}
  `;

  container.appendChild(panel);
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * 상세 패널을 닫습니다.
 * @param {string} id - 닫을 패널의 CONTENT 키
 */
function closeDetail(id) {
  const data = CONTENT[id];
  if (!data) return;

  const container = document.getElementById('detail-container-' + data.tab);
  const panel     = container.querySelector('.detail-panel');
  if (panel) panel.remove();
  currentOpenId = null;
}


/* ──────────────────────────────────────────────────────────
   5. FAQ 아코디언 토글
────────────────────────────────────────────────────────── */

/**
 * FAQ 항목을 열거나 닫습니다.
 * @param {string} itemId - faq-item 요소의 id
 */
function toggleFAQ(itemId) {
  const item = document.getElementById(itemId);
  if (item) item.classList.toggle('open');
}


/* ──────────────────────────────────────────────────────────
   6. 검색 기능
────────────────────────────────────────────────────────── */

const searchInput   = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

/** 입력값 변화 시 검색 결과 갱신 */
searchInput.addEventListener('input', function () {
  const q = this.value.trim();

  if (!q) {
    searchResults.classList.remove('show');
    return;
  }

  // keywords 또는 title에서 검색어 포함 여부 확인
  const matches = SEARCH_DATA.filter(d =>
    d.keywords.includes(q) || d.title.includes(q)
  ).slice(0, 8);

  if (!matches.length) {
    searchResults.innerHTML = '<div class="search-no-result">검색 결과가 없습니다. 다른 키워드를 입력해보세요.</div>';
  } else {
    searchResults.innerHTML = matches.map(m => `
      <div class="search-result-item" onclick="goToResult('${m.id}', '${m.tab}')">
        <span class="tag ${m.tab}">${m.tab.toUpperCase()}</span>
        ${m.title}
      </div>
    `).join('');
  }

  searchResults.classList.add('show');
});

/**
 * 검색 결과 클릭 시 해당 탭으로 이동 후 상세 패널을 엽니다.
 * @param {string} id  - CONTENT 키
 * @param {'pos'|'pda'} tab - 이동할 탭
 */
function goToResult(id, tab) {
  searchResults.classList.remove('show');
  searchInput.value = '';

  // 탭 버튼 찾기
  const tabBtn = document.querySelector(
    tab === 'pda' ? '.tab-btn.pda-tab' : '.tab-btn:not(.pda-tab)'
  );
  switchTab(tab, tabBtn);

  // DOM 전환 후 패널 오픈 (약간의 지연)
  setTimeout(() => openDetail(id), 100);
}

/** 검색창 외부 클릭 시 드롭다운 닫기 */
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrap')) {
    searchResults.classList.remove('show');
  }
});


/* ──────────────────────────────────────────────────────────
   7. QR 모달
────────────────────────────────────────────────────────── */

/** QR 모달 열기 */
function openQRModal() {
  document.getElementById('qrModal').classList.add('show');
}

/** QR 모달 닫기 */
function closeQRModal() {
  document.getElementById('qrModal').classList.remove('show');
}
