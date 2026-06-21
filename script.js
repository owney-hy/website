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
    title: '영업 개시',
    subtitle: '판매사원 로그인 방법',
    videoUrl: 'https://youtu.be/LzrCEuB1Gc0',
    steps: [
      { text: '<strong>영업개시</strong>를 클릭합니다(단축키 F1).', image: 'pos-login-step1.png' },
      { text: '<strong>사원번호</strong>와 <strong>비밀번호</strong>를 입력하고 <strong>등록</strong>합니다.', image: 'pos-login-step2.png' },
    ],
  },

  'pos-preset': {
    tab: 'pos',
    icon: '⚙️',
    title: 'PRESET 등록',
    subtitle: 'POS에서 자주 쓰는 상품을 빠르게 등록하는 방법',
    videoUrl: 'https://youtu.be/_dYUwspKTuo',
    steps: [
      { text: '<strong>Preset</strong>을 클릭합니다.', image: 'pos-preset-step1.png' },
      { text: '<strong>프리셋 확장</strong>을 클릭합니다.', image: 'pos-preset-step2.png' },
      { text: '<strong>그룹명 변경</strong>을 클릭하여 원하는 그룹명을 입력합니다.', image: 'pos-preset-step3.png' },
      { text: '변경된 내용을 확인한 후 <strong>예</strong>를 클릭합니다.', image: 'pos-preset-step4.png' },
      { text: '등록을 원하는 <strong>그룹을 선택</strong>합니다.', image: 'pos-preset-step5.png' },
      { text: 'PRESET을 등록할 <strong>빈칸을 선택</strong>합니다.', image: 'pos-preset-step6.png' },
      { text: '품번에서 <strong>품번, 세분류, 마진</strong>을 입력합니다.<br>(가격 미입력 시 추후 결제를 진행할 때 입력할 수 있습니다).', image: 'pos-preset-step7.png' },
      { text: '<strong>PRESET을 등록</strong>합니다.', image: 'pos-preset-step8.png' },
    ],
  },

  'pos-cash': {
    tab: 'pos',
    icon: '💵',
    title: '현금 결제',
    subtitle: '현금 결제 및 현금영수증 처리 방법',
    videoUrl: 'https://youtu.be/i6Vg24V_62I',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pos-cash-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>등록</strong>을 클릭합니다.', image: 'pos-cash-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>현금(외환)</strong>을 클릭합니다.', image: 'pos-cash-step3.png' },
      { text: '현금(외환) 종류를 선택, 금액을 입력하고 <strong>등록</strong>을 클릭합니다.', image: 'pos-cash-step4.png' },
      { text: '현금영수증 발행 시 증빙 구분을 선택하고 고객번호 입력 후 <strong>등록</strong>을 클릭합니다.<br>(현금영수증 미발행 시 <strong>취소(자진발급)</strong> 클릭)', image: 'pos-cash-step5.png' },
    ],
  },

  'pos-card': {
    tab: 'pos',
    icon: '💳',
    title: '카드 결제',
    subtitle: '카드 삽입·센싱 결제 방법',
    videoUrl: 'https://youtu.be/lmxwjLcLTec',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pos-card-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>등록</strong>을 클릭합니다.', image: 'pos-card-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>카드결제</strong>를 클릭합니다.', image: 'pos-card-step3.png' },
      { text: '결제 구분에서 <strong>신용카드</strong>를 선택하고 카드리더기에 카드를 <strong>삽입 혹은 센싱</strong>합니다.', image: 'pos-card-step4.png' },
      { text: '에누리 창이 뜨면 원하는 <strong>에누리를 선택</strong>합니다.', image: 'pos-card-step5.png' },
      { text: '<strong>결제 금액</strong> 및 <strong>할부 기간</strong>을 입력합니다.', image: 'pos-card-step6.png' },
      { text: '고객의 <strong>전자서명</strong>을 등록하고 <strong>확인</strong>을 클릭합니다.', image: 'pos-card-step7.png' },
    ],
  },

  'pos-lpay': {
    tab: 'pos',
    icon: '📲',
    title: 'L.PAY 결제',
    subtitle: 'L.PAY 바코드 스캔 결제 방법',
    videoUrl: 'https://youtu.be/yoL0h2PrffI',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pos-lpay-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>등록</strong>을 클릭합니다.', image: 'pos-lpay-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>기타결제</strong>를 클릭합니다.', image: 'pos-lpay-step3.png' },
      { text: '<strong>카드/간편결제</strong>를 클릭하고 <strong>L.pay</strong>를 선택합니다.', image: 'pos-lpay-step4.png' },
      { text: 'L.pay 바코드를 <strong>스캔 혹은 수기입력</strong>합니다.', image: 'pos-lpay-step5.png' },
      { text: '결제할 수단을 선택하고 <strong>결제금액</strong>과 <strong>할부기간</strong>을 입력합니다.', image: 'pos-lpay-step6.png' },
      { text: 'L.POINT 사용시 <strong>L.POINT 결제 금액</strong>을 입력합니다.', image: 'pos-lpay-step7.png' },
      { text: '<strong>결제</strong>를 클릭합니다.', image: 'pos-lpay-step8.png' },
    ],
  },

  'pos-giftcard': {
    tab: 'pos',
    icon: '🎁',
    title: '상품권 결제',
    subtitle: '상품권 결제 및 거스름 처리 방법',
    videoUrl: 'https://youtu.be/e6-F_CMlcrU',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pos-giftcard-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>등록</strong>을 클릭합니다.', image: 'pos-giftcard-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>상품권</strong>을 클릭합니다.', image: 'pos-giftcard-step3.png' },
      { text: '상품권 <strong>구분/종류</strong>를 선택합니다.', image: 'pos-giftcard-step4.png' },
      { text: '상품권을 등록하고 <strong>추가</strong>합니다.<br>(롯데상품권: 상품권 번호 입력, 타사상품권: 금종 및 매수 입력)', image: 'pos-giftcard-step5.png' },
      { text: '상품권 거스름 기준에 따라 현금/상품권으로 자동 구분하여 처리됩니다.', image: 'pos-giftcard-step6.png' },
      { text: '<strong>등록</strong>을 클릭합니다.', image: 'pos-giftcard-step7.png' },
    ],
  },

  'pos-mobile-giftcard': {
    tab: 'pos',
    icon: '📱',
    title: '모바일상품권 결제',
    subtitle: '모바일 상품권 결제 방법',
    videoUrl: 'https://youtu.be/IJcfL0NCx58',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pos-mobile-giftcard-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>등록</strong>을 클릭합니다.', image: 'pos-mobile-giftcard-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>L.POINT</strong>를 클릭합니다.', image: 'pos-mobile-giftcard-step3.png' },
      { text: '<strong>준현금</strong>을 클릭하고 <strong>모바일 상품권</strong>을 선택합니다.', image: 'pos-mobile-giftcard-step4.png' },
      { text: '모바일 상품권 <strong>번호</strong>와 <strong>결제금액</strong>을 입력하고 등록합니다.', image: 'pos-mobile-giftcard-step5.png' },
    ],
  },

  'pos-lpoint': {
    tab: 'pos',
    icon: '⭐',
    title: 'L.POINT 결제',
    subtitle: 'L.POINT 포인트 결제 방법',
    videoUrl: 'https://youtu.be/lf9hDYTFA10',
    steps: [
      { text: '등록할 상품을 클릭합니다.', image: 'pos-lpoint-step1.png' },
      { text: '상품의 금액을 입력하고 <strong>등록</strong>을 클릭합니다.', image: 'pos-lpoint-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>L.POINT</strong>를 클릭합니다.', image: 'pos-lpoint-step3.png' },
      { text: '<strong>카드/번호 입력</strong>을 클릭합니다.', image: 'pos-lpoint-step4.png' },
      { text: '확인창이 뜨면 <strong>예</strong>를 클릭합니다.', image: 'pos-lpoint-step5.png' },
      { text: 'L.POINT <strong>카드/바코드</strong>를 센싱 혹은 번호를 입력합니다.', image: 'pos-lpoint-step6.png' },
      { text: '다시 <strong>L.POINT</strong>를 클릭합니다.', image: 'pos-lpoint-step7.png' },
      { text: '사용할 <strong>포인트</strong>를 입력하고 <strong>등록</strong>을 클릭합니다.', image: 'pos-lpoint-step8.png' },
    ],
  },

  'pos-refund': {
    tab: 'pos',
    icon: '🔄',
    title: '반품',
    subtitle: '반품 처리 방법',
    videoUrl: 'https://youtu.be/28HYmAofN2s',
    steps: [
      { text: '<strong>반품</strong>을 클릭합니다.', image: 'pos-refund-step1.png' },
      { text: '<strong>취소 사유</strong>를 선택합니다.', image: 'pos-refund-step2.png' },
      { text: '영수증 <strong>스캔</strong> 혹은 <strong>수기입력</strong>을 통해 원거래 정보를 입력합니다.', image: 'pos-refund-step3.png' },
      { text: '<strong>등록</strong>을 클릭합니다.', image: 'pos-refund-step4.png' },
      { text: '원하는 항목을 선택하여 <strong>반품 처리</strong>를 완료합니다.', image: 'pos-refund-step5.png' },
    ],
  },


  /* ── PDA ──────────────────────────────────────── */

  'pda-login': {
    tab: 'pda',
    icon: '🔑',
    title: '영업 개시',
    subtitle: '판매사원 로그인 방법',
    videoUrl: 'https://youtu.be/wz7WJtk-Ljc?si=38BfEASuISxHFTHE',
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
    videoUrl: 'https://youtu.be/JRXb8fIPY4M?si=JgEXWFzpyIm7PGlo',
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
    videoUrl: 'https://youtu.be/o3ZvbeeB_C8?si=uqP7DEAiTJhzsx3d',
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
    videoUrl: 'https://youtu.be/8trMxxT__vs?si=ccgdXFFy4UWLWvKC',
    steps: [
      { text: '<strong>등록할 상품</strong>을 클릭합니다.', image: 'pda-card-step1.png' },
      { text: '<strong>상품의 금액</strong>을 입력하고 확인을 클릭합니다.', image: 'pda-card-step2.png' },
      { text: '<strong>등록된 상품</strong>을 확인하고 <strong>결제</strong>를 클릭합니다.', image: 'pda-card-step3.png' },
      { text: '카드를 <strong>삽입 혹은 센싱</strong>합니다.', image: 'pda-card-step4.png' },
      { text: '에누리 적용시 <strong>에누리를 클릭</strong>하고 원하는 에누리를 선택합니다.', image: 'pda-card-step5.png' },
      { text: '<strong>결제 금액 및 할부 기간</strong>을 확인합니다.', image: 'pda-card-step6.png' },
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
    videoUrl: 'https://youtu.be/ZSs3h4c6n9c?si=ks1ZKbGlKsJqUSEI',
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
    videoUrl: 'https://youtu.be/TOwVuTjA_bI?si=QoIlwJ7M4kl7tH8k',
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
    videoUrl: 'https://youtu.be/opRzWw3pyJs?si=_CIJbqoSyI8ms_bc',
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
    videoUrl: 'https://youtu.be/ziocjVaFySU?si=IrNCuy9peaMjbvyh',
    steps: [
      { text: '<strong>등록할 상품</strong>을 클릭합니다.', image: 'pda-lpoint-step1.png' },
      { text: '<strong>상품의 금액</strong>을 입력하고 확인을 클릭합니다.', image: 'pda-lpoint-step2.png' },
      { text: '등록된 상품을 확인하고 <strong>결제</strong>를 클릭합니다.', image: 'pda-lpoint-step3.png' },
      { text: '<strong>L.POINT</strong>를 클릭합니다.', image: 'pda-lpoint-step4.png' },
      { text: '<strong>바코드 센싱, IC카드 삽입, MSR 센싱</strong>을 통해 L.POINT 정보를 등록합니다.', image: 'pda-lpoint-step5.png' },
      { text: '고객정보 확인 후 <strong>기타결제</strong>를 클릭합니다.', image: 'pda-lpoint-step6.png' },
      { text: '<strong>L.POINT</strong>를 선택합니다.', image: 'pda-lpoint-step7.png' },
      { text: '<strong>사용 포인트</strong>를 입력하고 확인을 클릭합니다.', image: 'pda-lpoint-step8.png' },
    ],
  },

  'pda-refund': {
    tab: 'pda',
    icon: '🔄',
    title: '반품',
    subtitle: '영수증 조회 후 반품 처리 방법',
    videoUrl: 'https://youtu.be/TxGKMT99dlA?si=GAqEQFnOIChidsI7',
    steps: [
      { text: '<strong>반품등록</strong>을 클릭합니다.', image: 'pda-refund-step1.png' },
      { text: '<strong>영수증 바코드 스캔</strong> 혹은 원거래 정보를 입력하고 반품등록을 클릭합니다.', image: 'pda-refund-step2.png' },
      { text: '<strong>결제정보</strong>를 확인합니다.', image: 'pda-refund-step3.png' },
      { text: '<strong>반품확정</strong>을 클릭합니다.', image: 'pda-refund-step4.png' },
    ],
  },
};


/* ──────────────────────────────────────────────────────────
   2. 검색 인덱스 자동 생성
   — CONTENT 객체에서 텍스트를 추출해 keywords 문자열로 변환
────────────────────────────────────────────────────────── */
function normalizeSearchText(value) {
  return String(value)
    .normalize('NFKC')
    .toLowerCase();
}

function normalizeSearchCompact(value) {
  return normalizeSearchText(value).replace(/[\s._-]+/g, '');
}

const SEARCH_DATA = Object.entries(CONTENT).map(([id, d]) => {
  const keywords = [
    id,
    d.tab,
    d.title,
    d.subtitle,
    d.steps.map(s => s.text).join(' '),
  ].join(' ').replace(/<[^>]+>/g, '');

  return {
    id,
    title: d.title,
    tab: d.tab,
    keywords,
    searchText: normalizeSearchText(keywords),
    searchCompact: normalizeSearchCompact(keywords),
  };
});


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

  const headerHeight = document.querySelector('header')?.offsetHeight ?? 0;
  const scrollTarget = triggerCard ?? panel;
  const targetTop = scrollTarget.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
  window.scrollTo({ top: targetTop, behavior: 'smooth' });
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
  const normalizedQuery = normalizeSearchText(q);
  const compactQuery = normalizeSearchCompact(q);

  if (!q) {
    searchResults.classList.remove('show');
    return;
  }

  // keywords 또는 title에서 검색어 포함 여부 확인
  const matches = SEARCH_DATA.filter(d =>
    d.searchText.includes(normalizedQuery)
    || d.searchCompact.includes(compactQuery)
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

const scrollTopBtn = document.querySelector('.scroll-top-btn');

if (scrollTopBtn) {
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });
}
