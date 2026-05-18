/* ============================================================
   script.js  —  POS·PDA 사용 매뉴얼 사이트
   구성:
     1. 콘텐츠 데이터베이스 (CONTENT)
     2. 검색 데이터 인덱스 (SEARCH_DATA)
     3. 탭 전환 (switchTab)
     4. 상세 패널 열기/닫기 (openDetail / closeDetail)
     5. 검색 기능 (searchInput 이벤트)
     6. QR 모달 (openQRModal / closeQRModal)
   ============================================================ */


/* ──────────────────────────────────────────────────────────
   1. 콘텐츠 데이터베이스
   각 항목 구조:
     tab      : 'pos' | 'pda'
     icon     : 이모지
     title    : 제목
     subtitle : 부제목
     steps    : [{ text, image, imageAlt }]  — text는 HTML 태그 허용, image/imageAlt는 선택
     notice   : 주의사항 문자열 (선택)
     error    : { title, cases[] } — 즉시 연락 박스 (선택)
     videoUrl : YouTube 영상 URL (선택)
────────────────────────────────────────────────────────── */
const MANUAL_ASSET_DIR = 'pos pda manual/';
const VIDEO_MANUAL_URL = '';
const YOUTUBE_EMBED_ORIGIN = 'https://www.youtube-nocookie.com';

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getManualAssetUrl(path) {
  if (!path) return '';

  const value = String(path).trim().replace(/\\/g, '/');
  const isExternalOrRootPath = /^(?:[a-z][a-z0-9+.-]*:|\/|\.\/|\.\.\/)/i.test(value);
  const isAlreadyManualPath = value.startsWith(MANUAL_ASSET_DIR);

  if (isExternalOrRootPath) return value;

  const assetPath = isAlreadyManualPath ? value : MANUAL_ASSET_DIR + value;
  return assetPath.split('/').map(encodeURIComponent).join('/');
}

function getYouTubeEmbedUrl(url) {
  if (!url) return '';

  try {
    const parsed = new URL(url, window.location.href);
    const host = parsed.hostname.replace(/^www\./, '');
    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (parsed.searchParams.has('v')) {
        videoId = parsed.searchParams.get('v') || '';
      } else if (pathParts[0] === 'embed' || pathParts[0] === 'shorts' || pathParts[0] === 'live') {
        videoId = pathParts[1] || '';
      }
    }

    if (videoId) {
      return `${YOUTUBE_EMBED_ORIGIN}/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1`;
    }

    const playlistId = parsed.searchParams.get('list');
    if (playlistId && (host === 'youtube.com' || host === 'm.youtube.com')) {
      return `${YOUTUBE_EMBED_ORIGIN}/embed/videoseries?list=${encodeURIComponent(playlistId)}`;
    }
  } catch (error) {
    return '';
  }

  return '';
}

function getExternalVideoUrl(url) {
  if (!url) return '';

  try {
    return new URL(url, window.location.href).href;
  } catch (error) {
    return '';
  }
}

const CONTENT = {

  /* ── POS ──────────────────────────────────────── */

  'pos-login': {
    tab: 'pos',
    icon: '🔑',
    title: 'POS 로그인 및 초기 화면',
    subtitle: 'POS 단말기를 처음 시작할 때',
    videoUrl: '',
    steps: [
      { text: 'POS 단말기 전원 버튼을 눌러 켭니다.', image: 'pos-login-step1.png' },
      { text: '<strong>로그인 화면</strong>이 나타나면 담당자 <strong>아이디와 비밀번호</strong>를 입력합니다.', image: 'pos-login-step2.png' },
      { text: '로그인 완료 후 <strong>메인 화면</strong>으로 이동합니다.<br>상단에는 날짜/시간, 하단에는 결제·취소·조회 메뉴가 있습니다.', image: 'pos-login-step3.png' },
      { text: '결제를 시작하려면 <strong>[결제]</strong> 버튼을 누릅니다.', image: 'pos-login-step4.png' },
    ],
    notice: '비밀번호 5회 오류 시 계정이 잠깁니다. 관리자에게 초기화 요청하세요.',
  },

  'pos-preset': {
    tab: 'pos',
    icon: '⚙️',
    title: 'PRESET 설정',
    subtitle: '자주 쓰는 상품과 결제 옵션을 빠르게 불러오는 설정',
    videoUrl: '',
    steps: [
      { text: '메인 화면에서 <strong>[설정]</strong> 또는 <strong>[PRESET]</strong> 메뉴로 이동합니다.', image: 'pos-preset-step1.png' },
      { text: '<strong>[신규 등록]</strong>을 누르고 자주 사용하는 상품, 금액, 할인 또는 결제 옵션을 선택합니다.', image: 'pos-preset-step2.png' },
      { text: '직원이 알아보기 쉬운 이름을 입력합니다. 예: 점심 세트, 기본 할인, 단체 결제.', image: 'pos-preset-step3.png' },
      { text: '<strong>[저장]</strong>을 누른 뒤 메인 화면으로 돌아와 PRESET 버튼이 정상 표시되는지 확인합니다.', image: 'pos-preset-step4.png' },
      { text: '잘못 등록한 항목은 PRESET 목록에서 선택 후 <strong>[수정]</strong> 또는 <strong>[삭제]</strong>로 정리합니다.', image: 'pos-preset-step5.png' },
    ],
    notice: 'PRESET 변경은 매장 전체 사용 화면에 반영될 수 있습니다. 운영 중에는 관리자 확인 후 변경하세요.',
  },

  'pos-card': {
    tab: 'pos',
    icon: '💳',
    title: '카드 결제',
    subtitle: '신용카드·체크카드 결제 방법',
    videoUrl: '',
    steps: [
      { text: '메인 화면에서 <strong>[결제]</strong> 버튼을 누릅니다.', image: 'pos-card-step1.png' },
      { text: '상품을 바코드 스캔하거나 수동으로 금액을 입력합니다.', image: 'pos-card-step2.png' },
      { text: '결제 수단 화면에서 <strong>[카드]</strong>를 선택합니다.', image: 'pos-card-step3.png' },
      { text: '고객에게 카드를 <strong>단말기 카드 투입구에 삽입</strong>하거나 갖다 대도록 안내합니다. (IC칩 또는 NFC)', image: 'pos-card-step4.png' },
      { text: '고객이 <strong>비밀번호를 입력</strong>합니다. (체크카드·신용카드 모두 동일)', image: 'pos-card-step5.png' },
      { text: '승인 완료 메시지 확인 후 영수증이 자동 출력됩니다.', image: 'pos-card-step6.png' },
    ],
    notice: '카드 오류 시 카드를 제거한 뒤 다시 삽입하세요. IC칩 방향을 확인해 주세요.',
  },

  'pos-cash': {
    tab: 'pos',
    icon: '💵',
    title: '현금 결제',
    subtitle: '현금 결제 및 현금영수증 처리 방법',
    videoUrl: '',
    steps: [
      { text: '메인 화면에서 <strong>[결제]</strong> 버튼을 누릅니다.', image: 'pos-cash-step1.png' },
      { text: '금액을 입력하거나 상품을 스캔합니다.', image: 'pos-cash-step2.png' },
      { text: '결제 수단에서 <strong>[현금]</strong>을 선택합니다.', image: 'pos-cash-step3.png' },
      { text: '고객이 지불하는 금액을 입력하면 <strong>거스름돈 금액이 화면에 표시</strong>됩니다.', image: 'pos-cash-step4.png' },
      { text: '현금영수증 발급 여부를 고객에게 확인합니다.<br>- 발급: 고객 휴대폰 번호 또는 현금영수증 카드 입력<br>- 미발급: [발급 안함] 선택', image: 'pos-cash-step5.png' },
      { text: '결제 완료 후 영수증 출력.', image: 'pos-cash-step6.png' },
    ],
  },

  'pos-complex': {
    tab: 'pos',
    icon: '🔀',
    title: '복합 결제',
    subtitle: '카드 + 현금 등 혼합 결제 방법',
    videoUrl: '',
    steps: [
      { text: '결제 화면에서 결제 수단을 <strong>[복합결제]</strong>로 선택합니다.', image: 'pos-complex-step1.png' },
      { text: '총 결제 금액 중 <strong>카드로 결제할 금액을 먼저 입력</strong>합니다.', image: 'pos-complex-step2.png' },
      { text: '카드 결제 완료 후, 나머지 금액이 자동 계산됩니다.', image: 'pos-complex-step3.png' },
      { text: '<strong>나머지 금액을 현금으로 수령</strong>하고 거스름돈을 계산합니다.', image: 'pos-complex-step4.png' },
      { text: '전체 결제 완료 후 통합 영수증이 출력됩니다.', image: 'pos-complex-step5.png' },
    ],
    notice: '복합결제 중 카드 결제가 실패하면 이미 처리된 부분은 취소되지 않으므로 주의하세요. 오류 발생 시 관리자에게 문의하세요.',
  },

  'pos-cancel': {
    tab: 'pos',
    icon: '❌',
    title: '결제 취소 (당일)',
    subtitle: '방금 또는 오늘 결제한 건 전액 취소',
    videoUrl: '',
    steps: [
      { text: '메인 화면에서 <strong>[취소]</strong> 또는 <strong>[결제취소]</strong> 버튼을 누릅니다.', image: 'pos-cancel-step1.png' },
      { text: '취소할 결제 건을 조회합니다. 영수증 번호·시간·금액으로 검색 가능합니다.', image: 'pos-cancel-step2.png' },
      { text: '해당 결제 건을 선택하고 <strong>[취소]</strong>를 누릅니다.', image: 'pos-cancel-step3.png' },
      { text: '카드 취소의 경우 <strong>동일 카드를 단말기에 삽입</strong>하거나 갖다 대도록 안내합니다.', image: 'pos-cancel-step4.png' },
      { text: '취소 완료 메시지 확인 후 취소 영수증이 출력됩니다.', image: 'pos-cancel-step5.png' },
    ],
    notice: '취소는 반드시 결제 시 사용한 동일 카드로만 가능합니다. 다른 카드로는 취소가 되지 않습니다.',
  },

  'pos-partial': {
    tab: 'pos',
    icon: '✂️',
    title: '부분 취소',
    subtitle: '결제 금액 중 일부만 취소하는 방법',
    videoUrl: '',
    steps: [
      { text: '메인 화면에서 <strong>[취소]</strong> 메뉴로 이동합니다.', image: 'pos-partial-step1.png' },
      { text: '취소할 결제 건을 조회·선택합니다.', image: 'pos-partial-step2.png' },
      { text: '<strong>[부분취소]</strong>를 선택하고, 취소할 금액을 직접 입력합니다.', image: 'pos-partial-step3.png' },
      { text: '카드를 단말기에 삽입하거나 갖다 대도록 안내합니다.', image: 'pos-partial-step4.png' },
      { text: '부분취소 완료 후 취소 영수증 출력.', image: 'pos-partial-step5.png' },
    ],
    notice: '부분 취소 후 남은 금액이 변경되므로 고객에게 안내하세요. 부분취소가 지원되지 않는 카드사도 있습니다.',
  },

  'pos-refund': {
    tab: 'pos',
    icon: '🔄',
    title: '반품 처리',
    subtitle: '전날 또는 이전 날짜 결제 건 반품',
    videoUrl: '',
    steps: [
      { text: '메인 화면에서 <strong>[반품]</strong> 메뉴를 선택합니다.', image: 'pos-refund-step1.png' },
      { text: '반품할 결제 건의 <strong>영수증 번호</strong>를 조회합니다. (영수증이 없으면 날짜+금액으로 검색)', image: 'pos-refund-step2.png' },
      { text: '해당 결제 건을 선택하고 <strong>[반품 진행]</strong>을 누릅니다.', image: 'pos-refund-step3.png' },
      { text: '결제 수단에 따라 카드 또는 현금으로 환불 처리됩니다.', image: 'pos-refund-step4.png' },
      { text: '반품 완료 후 반품 영수증 출력.', image: 'pos-refund-step5.png' },
    ],
    notice: '카드 반품은 카드사 정책에 따라 최대 1~2일이 걸릴 수 있습니다. 고객에게 안내하세요.',
  },

  'pos-receipt': {
    tab: 'pos',
    icon: '🖨️',
    title: '영수증 재출력',
    subtitle: '이미 발행된 영수증을 다시 출력',
    videoUrl: '',
    steps: [
      { text: '메인 화면에서 <strong>[조회]</strong> 또는 <strong>[영수증]</strong> 메뉴로 이동합니다.', image: 'pos-receipt-step1.png' },
      { text: '영수증 번호, 결제 시간, 금액 중 하나로 검색합니다.', image: 'pos-receipt-step2.png' },
      { text: '해당 결제 건을 선택하고 <strong>[영수증 재출력]</strong>을 누릅니다.', image: 'pos-receipt-step3.png' },
      { text: '영수증이 출력됩니다. "재발행" 도장이 찍혀 나옵니다.', image: 'pos-receipt-step4.png' },
    ],
  },

  'pos-settle': {
    tab: 'pos',
    icon: '📊',
    title: '마감 정산',
    subtitle: '일별 매출 마감 및 정산 방법',
    videoUrl: '',
    steps: [
      { text: '영업 종료 후 메인 화면에서 <strong>[정산]</strong> 메뉴로 이동합니다.', image: 'pos-settle-step1.png' },
      { text: '오늘 날짜가 자동으로 선택됩니다. <strong>[정산 시작]</strong>을 누릅니다.', image: 'pos-settle-step2.png' },
      { text: '카드 결제 합계, 현금 결제 합계, 취소 합계 등이 화면에 표시됩니다.', image: 'pos-settle-step3.png' },
      { text: '내용을 확인 후 <strong>[정산 확정]</strong>을 누릅니다.', image: 'pos-settle-step4.png' },
      { text: '정산 영수증이 출력됩니다. 보관하세요.', image: 'pos-settle-step5.png' },
    ],
    notice: '정산은 하루 1회만 가능합니다. 정산 후에는 당일 데이터를 수정할 수 없으니 신중하게 확인하세요.',
  },

  'pos-error': {
    tab: 'pos',
    icon: '⚠️',
    title: 'POS 장애 대응',
    subtitle: '오류 발생 시 빠른 해결 방법',
    videoUrl: '',
    steps: [
      { text: '<strong>화면이 멈춘 경우</strong>: 화면을 5초간 꾹 누르거나, 전원 버튼을 길게 눌러 재시작합니다.', image: 'pos-error-step1.png' },
      { text: '<strong>네트워크 오류 메시지</strong>: 우선 단말기를 재시작합니다. 해결 안 되면 Wi-Fi 또는 LAN 케이블 연결 상태를 확인합니다.', image: 'pos-error-step2.png' },
      { text: '<strong>프린터 오류</strong>: 프린터 뚜껑을 열어 용지 유무를 확인합니다. 용지가 있다면 꺼냈다 다시 넣고 뚜껑을 닫습니다.', image: 'pos-error-step3.png' },
      { text: '<strong>카드 리더기 오류</strong>: 카드 삽입구 내 이물질을 확인하고 다시 시도합니다. 반복되면 IT 담당자에게 연락합니다.', image: 'pos-error-step4.png' },
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
  },


  /* ── PDA ──────────────────────────────────────── */

  'pda-login': {
    tab: 'pda',
    icon: '🔑',
    title: '영업 개시',
    subtitle: '판매사원 로그인 방법',
    videoUrl: 'https://youtu.be/T47OQJ9s4nY?si=ackShVSGSh2Yr14W',
    steps: [
      { text: '<strong>판매사원 로그인</strong>을 클릭합니다.', image: 'pda-login-step1.png' },
      { text: '<strong>ID와 비밀번호</strong>를 입력하고 <strong>로그인</strong> 버튼을 클릭합니다.', image: 'pda-login-step2.png' },
    ],
  },

  'pda-preset': {
    tab: 'pda',
    icon: '⚙️',
    title: 'PRESET 등록',
    subtitle: 'PDA에서 자주 쓰는 상품을 빠르게 등록하는 방법',
    videoUrl: 'https://youtu.be/T47OQJ9s4nY?si=ackShVSGSh2Yr14W',
    steps: [
      { text: '<strong>PRESET 확장</strong> 버튼을 클릭합니다.', image: 'pda-preset-step1.png' },
      { text: '등록을 원하는 <strong>그룹을 선택</strong>합니다.', image: 'pda-preset-step2.png' },
      { text: 'PRESET을 등록할 <strong>빈칸을 선택</strong>합니다.', image: 'pda-preset-step3.png' },
      { text: '상품조회에서 <strong>품번코드, 세분류, 마진</strong>을 입력합니다.<br>(가격 미입력 시 추후 결제를 진행할 때 입력할 수 있습니다).', image: 'pda-preset-step4.png' },
      { text: '<strong>PRESET을 등록</strong>합니다.', image: 'pda-preset-step5.png' },
    ],
  },

  'pda-cash': {
    tab: 'pda',
    icon: '💵',
    title: '현금 결제',
    subtitle: '현금 결제 및 현금영수증 처리 방법',
    videoUrl: 'https://youtu.be/T47OQJ9s4nY?si=ackShVSGSh2Yr14W',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pda-cash-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>확인</strong>을 클릭합니다.', image: 'pda-cash-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>결제</strong>를 클릭합니다.', image: 'pda-cash-step3.png' },
      { text: '<strong>현금결제</strong>를 클릭합니다.', image: 'pda-cash-step4.png' },
      { text: '결제금액을 입력하고 <strong>추가</strong>를 클릭합니다.<br>(에누리 적용시 결제금액 입력 전 에누리 먼저 적용).', image: 'pda-cash-step5.png' },
      { text: '<strong>결제</strong>를 클릭합니다.', image: 'pda-cash-step6.png' },
      { text: '현금영수증 발행 시 증빙 구분 선택 후 고객번호 입력 후 <strong>확인</strong>을 클릭합니다.<br>(현금영수증 미발행 시 <strong>자진발급</strong> 클릭).', image: 'pda-cash-step7.png' },
      { text: '주차정산 등을 확인 후 <strong>거래완료</strong>를 클릭합니다.', image: 'pda-cash-step8.png' },
    ],
  },

  'pda-card': {
    tab: 'pda',
    icon: '💳',
    title: '카드 결제',
    subtitle: '카드 삽입·센싱 결제 방법',
    videoUrl: 'https://youtu.be/T47OQJ9s4nY?si=ackShVSGSh2Yr14W',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pda-card-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>확인</strong>을 클릭합니다.', image: 'pda-card-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>결제</strong>를 클릭합니다.', image: 'pda-card-step3.png' },
      { text: '카드를 <strong>삽입 혹은 센싱</strong>합니다.', image: 'pda-card-step4.png' },
      { text: '에누리 창이 뜨면 원하는 에누리를 선택합니다.', image: 'pda-card-step5.png' },
      { text: '결제 금액 및 할부 기간을 확인합니다.', image: 'pda-card-step6.png' },
      { text: '<strong>결제</strong>를 클릭합니다.', image: 'pda-card-step7.png' },
      { text: '고객의 <strong>전자서명</strong>을 등록합니다.', image: 'pda-card-step8.png' },
      { text: 'IC 카드 제거 후 <strong>거래완료</strong>를 클릭합니다.', image: 'pda-card-step9.png' },
    ],
  },

  'pda-lpay': {
    tab: 'pda',
    icon: '📲',
    title: 'L.PAY 결제',
    subtitle: 'L.PAY 바코드 스캔 결제 방법',
    videoUrl: 'https://youtu.be/T47OQJ9s4nY?si=ackShVSGSh2Yr14W',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pda-lpay-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>확인</strong>을 클릭합니다.', image: 'pda-lpay-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>결제</strong>를 클릭합니다.', image: 'pda-lpay-step3.png' },
      { text: '<strong>간편결제</strong>를 클릭합니다.', image: 'pda-lpay-step4.png' },
      { text: '<strong>L.pay</strong>를 클릭한 후 바코드를 <strong>스캔 혹은 수기입력</strong>합니다.<br>(에누리 적용시 에누리 클릭 후 적용).', image: 'pda-lpay-step5.png' },
      { text: '결제 금액, 할부 기간, 사용 포인트 확인 후 <strong>결제</strong>를 클릭합니다.', image: 'pda-lpay-step6.png' },
    ],
  },

  'pda-giftcard': {
    tab: 'pda',
    icon: '🎁',
    title: '상품권 결제',
    subtitle: '지류 상품권 결제 및 거스름 처리 방법',
    videoUrl: 'https://youtu.be/T47OQJ9s4nY?si=ackShVSGSh2Yr14W',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pda-giftcard-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>확인</strong>을 클릭합니다.', image: 'pda-giftcard-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>결제</strong>를 클릭합니다.', image: 'pda-giftcard-step3.png' },
      { text: '<strong>지류 상품권</strong>을 클릭합니다.', image: 'pda-giftcard-step4.png' },
      { text: '상품권을 등록하고 <strong>추가</strong>합니다.<br>(롯데상품권: 상품권 번호 입력 혹은 바코드 인식, 타사상품권: 금종 및 매수 입력).', image: 'pda-giftcard-step5.png' },
      { text: '<strong>결제</strong>를 클릭합니다.', image: 'pda-giftcard-step6.png' },
      { text: '거스름을 위해 상품권 여분을 확인합니다.<br>(취소: 이전 화면으로 돌아가기, 확인: 상품권 종류 선택).', image: 'pda-giftcard-step7.png' },
      { text: '거스름을 돌려받을 <strong>상품권 종류를 선택</strong>합니다.', image: 'pda-giftcard-step8.png' },
      { text: '모바일상품권을 선택한 경우, 발행받을 <strong>고객 핸드폰 번호를 입력</strong>하고 고객에게 인증번호를 받아 입력하고 <strong>확인</strong>을 클릭합니다.', image: 'pda-giftcard-step9.png' },
      { text: '지류상품권을 선택한 경우, <strong>상품권 스캔 혹은 번호 입력</strong> 후 <strong>확인</strong>을 클릭합니다.', image: 'pda-giftcard-step10.png' },
    ],
  },

  'pda-mobile-giftcard': {
    tab: 'pda',
    icon: '📱',
    title: '모바일상품권 결제',
    subtitle: '모바일 상품권 스캔 결제 방법',
    videoUrl: 'https://youtu.be/T47OQJ9s4nY?si=ackShVSGSh2Yr14W',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pda-mobile-giftcard-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>확인</strong>을 클릭합니다.', image: 'pda-mobile-giftcard-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>결제</strong>를 클릭합니다.', image: 'pda-mobile-giftcard-step3.png' },
      { text: '<strong>기타결제</strong>를 클릭합니다.', image: 'pda-mobile-giftcard-step4.png' },
      { text: '<strong>모바일 상품권</strong>을 클릭합니다.', image: 'pda-mobile-giftcard-step5.png' },
      { text: '모바일 상품권을 <strong>스캔 혹은 번호 입력</strong>한 후 잔액을 확인합니다.', image: 'pda-mobile-giftcard-step6.png' },
      { text: '결제금액을 입력하고 <strong>결제</strong>를 클릭합니다.', image: 'pda-mobile-giftcard-step7.png' },
    ],
  },

  'pda-lpoint': {
    tab: 'pda',
    icon: '⭐',
    title: 'L.POINT 결제',
    subtitle: 'L.POINT 포인트 결제 방법',
    videoUrl: 'https://youtu.be/T47OQJ9s4nY?si=ackShVSGSh2Yr14W',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pda-lpoint-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>확인</strong>을 클릭합니다.', image: 'pda-lpoint-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>결제</strong>를 클릭합니다.', image: 'pda-lpoint-step3.png' },
      { text: '<strong>L.POINT</strong>를 클릭합니다.', image: 'pda-lpoint-step4.png' },
      { text: '<strong>바코드 센싱, IC카드 삽입, MSR 센싱</strong>을 통해 L.POINT 정보를 등록합니다.', image: 'pda-lpoint-step5.png' },
      { text: '고객정보 확인 후 <strong>기타결제</strong>를 클릭합니다.', image: 'pda-lpoint-step6.png' },
      { text: '<strong>L.POINT</strong>를 선택합니다.', image: 'pda-lpoint-step7.png' },
      { text: '사용 포인트를 입력하고 <strong>확인</strong>을 클릭합니다.', image: 'pda-lpoint-step8.png' },
    ],
  },

  'pda-refund': {
    tab: 'pda',
    icon: '🔄',
    title: '반품',
    subtitle: '영수증 조회 후 반품 처리 방법',
    videoUrl: 'https://youtu.be/T47OQJ9s4nY?si=ackShVSGSh2Yr14W',
    steps: [
      { text: '<strong>반품등록</strong>을 클릭합니다.', image: 'pda-refund-step1.png' },
      { text: '<strong>영수증 바코드 스캔</strong> 혹은 원거래 정보를 입력합니다.', image: 'pda-refund-step2.png' },
      { text: '<strong>반품등록</strong>을 클릭합니다.', image: 'pda-refund-step3.png' },
      { text: '결제정보를 확인하고 <strong>반품확정</strong>을 클릭합니다.', image: 'pda-refund-step4.png' },
    ],
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

/** 현재 열린 패널 ID 추적 */
let currentOpenId = null;

function getTabFromHash() {
  const tab = window.location.hash.replace('#', '');
  if (tab === 'pda' || tab === 'tab-pda') return 'pda';
  if (tab === 'pos' || tab === 'tab-pos') return 'pos';
  return null;
}

/**
 * @param {'pos'|'pda'} tab - 전환할 탭 ID
 * @param {HTMLElement}  btn - 클릭된 탭 버튼 요소
 */
function switchTab(tab, btn, updateHash = true) {
  const targetPanel = document.getElementById('tab-' + tab);
  const targetBtn = btn || document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  const targetState = document.getElementById('tab-state-' + tab);
  if (!targetPanel || !targetBtn) return;

  // 탭 패널 / 버튼 비활성화
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });

  // 선택한 탭 활성화
  if (targetState) targetState.checked = true;
  targetPanel.classList.add('active');
  targetBtn.classList.add('active');
  targetBtn.setAttribute('aria-selected', 'true');

  const targetHash = '#tab-' + tab;
  if (updateHash && window.location.hash !== targetHash) {
    history.pushState(null, '', targetHash);
  }

  // 열려 있던 상세 패널 초기화
  document.querySelectorAll('.detail-panel').forEach(p => p.remove());
  clearOpenManualCards();
  currentOpenId = null;
}

document.addEventListener('click', event => {
  const tabBtn = event.target.closest('.tab-btn[data-tab]');
  if (!tabBtn) return;

  event.preventDefault();
  switchTab(tabBtn.dataset.tab, tabBtn);
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;

  const tabBtn = event.target.closest('.tab-btn[data-tab]');
  if (!tabBtn) return;

  event.preventDefault();
  switchTab(tabBtn.dataset.tab, tabBtn);
});

function syncTabFromHash() {
  const tab = getTabFromHash();
  if (tab) switchTab(tab, undefined, false);
}

window.addEventListener('hashchange', syncTabFromHash);
window.addEventListener('popstate', syncTabFromHash);

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

const initialTab = getTabFromHash();
if (initialTab) switchTab(initialTab, undefined, false);

requestAnimationFrame(() => window.scrollTo(0, 0));


/* ──────────────────────────────────────────────────────────
   4. 상세 패널 열기 / 닫기
────────────────────────────────────────────────────────── */

/**
 * 기능 카드 클릭 시 상세 패널을 탭 상단에 삽입합니다.
 * 같은 ID를 다시 클릭하면 패널이 닫힙니다.
 * @param {string} id - CONTENT 객체의 키
 */
function restoreScrollPosition(x, y) {
  window.scrollTo(x, y);
  requestAnimationFrame(() => window.scrollTo(x, y));
}

function getManualCard(id) {
  return Array.from(document.querySelectorAll('.func-card'))
    .find(card => card.getAttribute('onclick') === `openDetail('${id}')`);
}

function clearOpenManualCards() {
  document.querySelectorAll('.func-card.is-open')
    .forEach(card => card.classList.remove('is-open'));
}

function openDetail(id) {
  const data = CONTENT[id];
  if (!data) return;

  const previousScrollX = window.scrollX;
  const previousScrollY = window.scrollY;
  const triggerCard = getManualCard(id);
  const container = triggerCard ? triggerCard.parentElement : document.getElementById('detail-container-' + data.tab);

  // 기존 패널 제거
  document.querySelectorAll('.detail-panel').forEach(panel => panel.remove());
  clearOpenManualCards();

  // 같은 항목 재클릭 → 닫기
  if (currentOpenId === id) {
    currentOpenId = null;
    restoreScrollPosition(previousScrollX, previousScrollY);
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
  const stepsHTML = data.steps.map((s, i) => {
    const stepImage = getManualAssetUrl(s.image || s.imageUrl);
    const stepImageHTML = stepImage ? `
      <div class="step-image-wrap">
        <img
          class="step-image"
          src="${escapeAttribute(stepImage)}"
          alt="${escapeAttribute(s.imageAlt || `${data.title} ${i + 1}단계 이미지`)}"
          loading="lazy"
        >
      </div>` : '';

    return `
      <div class="step ${stepCls}${stepImage ? ' has-step-image' : ''}">
        <div class="step-main">
          <div class="step-num" style="background:${numColor}">${i + 1}</div>
          <div class="step-text">${s.text}</div>
        </div>
        ${stepImageHTML}
      </div>
    `;
  }).join('');

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

  const sourceVideoUrl = data.videoUrl || VIDEO_MANUAL_URL;
  const manualVideoUrl = getYouTubeEmbedUrl(sourceVideoUrl);
  const externalVideoUrl = getExternalVideoUrl(sourceVideoUrl);
  const manualVideoHTML = manualVideoUrl ? `
    <div class="manual-video-block">
      <div class="manual-video-player">
        <iframe
          src="${manualVideoUrl}"
          title="${escapeAttribute(data.title)} 동영상 매뉴얼"
          loading="lazy"
          referrerpolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
    </div>` : '';

  /* ── 패널 DOM 생성 ──────────────────────────── */
  const panel = document.createElement('div');
  panel.className = `detail-panel open ${isPDA ? 'pda-detail' : ''}`;
  panel.innerHTML = `
    ${manualVideoHTML}
    <div class="steps">${stepsHTML}</div>
    ${noticeHTML}
    ${errorHTML}
  `;

  if (triggerCard) {
    triggerCard.classList.add('is-open');
    triggerCard.insertAdjacentElement('afterend', panel);
  } else {
    container.appendChild(panel);
  }
  restoreScrollPosition(previousScrollX, previousScrollY);
}

/**
 * 상세 패널을 닫습니다.
 * @param {string} id - 닫을 패널의 CONTENT 키
 */
function closeDetail(id) {
  const data = CONTENT[id];
  if (!data) return;

  const previousScrollX = window.scrollX;
  const previousScrollY = window.scrollY;
  const panel = document.querySelector('.detail-panel');
  if (panel) panel.remove();
  clearOpenManualCards();
  currentOpenId = null;
  restoreScrollPosition(previousScrollX, previousScrollY);
}


/* ──────────────────────────────────────────────────────────
   5. 검색 기능
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
  const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
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
   6. QR 모달
────────────────────────────────────────────────────────── */

/** QR 모달 열기 */
function openQRModal() {
  document.getElementById('qrModal').classList.add('show');
}

/** QR 모달 닫기 */
function closeQRModal() {
  document.getElementById('qrModal').classList.remove('show');
}
