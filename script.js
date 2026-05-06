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
    steps: [
      { text: 'POS 단말기 전원 버튼을 눌러 켭니다.' },
      { text: '<strong>로그인 화면</strong>이 나타나면 담당자 <strong>아이디와 비밀번호</strong>를 입력합니다.' },
      { text: '로그인 완료 후 <strong>메인 화면</strong>으로 이동합니다.<br>상단에는 날짜/시간, 하단에는 결제·취소·조회 메뉴가 있습니다.' },
      { text: '결제를 시작하려면 <strong>[결제]</strong> 버튼을 누릅니다.' },
    ],
    notice: '비밀번호 5회 오류 시 계정이 잠깁니다. 관리자에게 초기화 요청하세요.',
  },

  'pos-preset': {
    tab: 'pos',
    icon: '⚙️',
    title: 'PRESET 설정',
    subtitle: '자주 쓰는 상품과 결제 옵션을 빠르게 불러오는 설정',
    steps: [
      { text: '메인 화면에서 <strong>[설정]</strong> 또는 <strong>[PRESET]</strong> 메뉴로 이동합니다.' },
      { text: '<strong>[신규 등록]</strong>을 누르고 자주 사용하는 상품, 금액, 할인 또는 결제 옵션을 선택합니다.' },
      { text: '직원이 알아보기 쉬운 이름을 입력합니다. 예: 점심 세트, 기본 할인, 단체 결제.' },
      { text: '<strong>[저장]</strong>을 누른 뒤 메인 화면으로 돌아와 PRESET 버튼이 정상 표시되는지 확인합니다.' },
      { text: '잘못 등록한 항목은 PRESET 목록에서 선택 후 <strong>[수정]</strong> 또는 <strong>[삭제]</strong>로 정리합니다.' },
    ],
    notice: 'PRESET 변경은 매장 전체 사용 화면에 반영될 수 있습니다. 운영 중에는 관리자 확인 후 변경하세요.',
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
  },


  /* ── PDA ──────────────────────────────────────── */

  'pda-login': {
    tab: 'pda',
    icon: '🔑',
    title: 'PDA 로그인 및 메인 화면',
    subtitle: 'PDA 기기를 처음 시작할 때',
    videoUrl: 'https://www.youtube.com/watch?v=h9NXl8o-4HU',
    steps: [
      { text: 'PDA 기기의 <strong>전원 버튼을 1~2초</strong> 눌러 켭니다.' },
      { text: '화면에 <strong>로그인 창</strong>이 뜨면 담당자 아이디와 비밀번호를 입력합니다.' },
      { text: '로그인 완료 후 메인 메뉴가 나타납니다. 결제, 취소, 영수증, 정산, PRESET 메뉴가 있습니다.' },
      { text: '화면이 꺼지는 것을 방지하려면 설정에서 <strong>화면 꺼짐 시간을 늘려두는 것</strong>을 권장합니다.' },
    ],
  },

  'pda-preset': {
    tab: 'pda',
    icon: '⚙️',
    title: 'PRESET 설정',
    subtitle: 'PDA에서 자주 쓰는 작업을 빠르게 실행하는 설정',
    steps: [
      { text: 'PDA 메인 화면에서 <strong>[설정]</strong> 또는 <strong>[PRESET]</strong> 메뉴를 선택합니다.' },
      { text: '<strong>[신규 등록]</strong>을 눌러 자주 사용하는 상품, 조회 조건, 결제 옵션을 선택합니다.' },
      { text: '직원이 구분하기 쉬운 이름을 입력합니다. 예: 자주 판매, 재고 확인, 빠른 결제.' },
      { text: '<strong>[저장]</strong> 후 메인 화면에서 PRESET 버튼이 보이는지 확인합니다.' },
      { text: '필요 없는 항목은 PRESET 목록에서 선택 후 <strong>[수정]</strong> 또는 <strong>[삭제]</strong>합니다.' },
    ],
    notice: 'PDA PRESET은 단말기 또는 계정 권한에 따라 표시 항목이 다를 수 있습니다.',
  },

  'pda-card': {
    tab: 'pda',
    icon: '💳',
    title: '카드 결제',
    subtitle: 'PDA 단말기에서 카드 결제 처리',
    steps: [
      { text: '메인 화면에서 <strong>[결제]</strong> 버튼을 누릅니다.' },
      { text: '상품을 바코드 스캔하거나 금액을 직접 입력합니다.' },
      { text: '결제 수단에서 <strong>[카드]</strong>를 선택합니다.' },
      { text: '고객에게 카드를 PDA 리더기에 삽입하거나 갖다 대도록 안내합니다.' },
      { text: '승인 완료 메시지를 확인한 뒤 영수증 출력 또는 전송 여부를 선택합니다.' },
    ],
    notice: '카드 인식이 안 되면 IC칩 방향과 리더기 접촉 상태를 확인한 뒤 다시 시도하세요.',
  },

  'pda-cash': {
    tab: 'pda',
    icon: '💵',
    title: '현금 결제',
    subtitle: 'PDA 단말기에서 현금 결제와 현금영수증 처리',
    steps: [
      { text: '메인 화면에서 <strong>[결제]</strong> 버튼을 누릅니다.' },
      { text: '상품을 스캔하거나 결제 금액을 입력합니다.' },
      { text: '결제 수단에서 <strong>[현금]</strong>을 선택합니다.' },
      { text: '받은 금액을 입력하고 화면에 표시되는 거스름돈을 확인합니다.' },
      { text: '현금영수증 발급 여부를 선택한 뒤 결제를 완료합니다.' },
    ],
  },

  'pda-complex': {
    tab: 'pda',
    icon: '🔀',
    title: '복합 결제',
    subtitle: '카드와 현금 등 여러 결제 수단을 함께 처리',
    steps: [
      { text: '결제 화면에서 결제 수단을 <strong>[복합결제]</strong>로 선택합니다.' },
      { text: '먼저 처리할 결제 수단과 금액을 입력합니다.' },
      { text: '첫 결제가 승인되면 남은 금액이 자동으로 표시됩니다.' },
      { text: '남은 금액을 카드 또는 현금으로 추가 결제합니다.' },
      { text: '전체 결제 금액이 맞는지 확인한 뒤 영수증을 출력하거나 전송합니다.' },
    ],
    notice: '복합 결제 중 일부 결제가 실패하면 완료된 결제 내역을 확인한 뒤 취소 또는 재시도하세요.',
  },

  'pda-cancel': {
    tab: 'pda',
    icon: '❌',
    title: '결제 취소 (당일)',
    subtitle: 'PDA에서 오늘 결제한 건을 전액 취소',
    steps: [
      { text: '메인 화면에서 <strong>[취소]</strong> 또는 <strong>[결제취소]</strong> 메뉴를 선택합니다.' },
      { text: '영수증 번호, 결제 시간, 금액으로 취소할 결제 건을 조회합니다.' },
      { text: '해당 결제 건을 선택하고 <strong>[취소]</strong>를 누릅니다.' },
      { text: '카드 결제 취소는 결제 시 사용한 동일 카드를 PDA에 삽입하거나 갖다 대도록 안내합니다.' },
      { text: '취소 완료 메시지와 취소 영수증을 확인합니다.' },
    ],
    notice: '카드 결제 취소는 반드시 결제에 사용한 동일 카드로 처리해야 합니다.',
  },

  'pda-partial': {
    tab: 'pda',
    icon: '✂️',
    title: '부분 취소',
    subtitle: 'PDA에서 결제 금액 일부만 취소',
    steps: [
      { text: '메인 화면에서 <strong>[취소]</strong> 메뉴로 이동합니다.' },
      { text: '취소할 결제 건을 조회한 뒤 선택합니다.' },
      { text: '<strong>[부분취소]</strong>를 선택하고 취소할 금액을 입력합니다.' },
      { text: '카드 취소인 경우 동일 카드를 PDA에 삽입하거나 갖다 대도록 안내합니다.' },
      { text: '부분취소 완료 후 남은 결제 금액을 고객에게 안내합니다.' },
    ],
    notice: '일부 카드사 또는 결제 방식은 부분 취소가 제한될 수 있습니다.',
  },

  'pda-refund': {
    tab: 'pda',
    icon: '🔄',
    title: '반품 처리',
    subtitle: '전날 또는 이전 날짜 결제 건 반품',
    steps: [
      { text: '메인 화면에서 <strong>[반품]</strong> 메뉴를 선택합니다.' },
      { text: '영수증 번호 또는 날짜와 금액으로 반품할 결제 건을 조회합니다.' },
      { text: '해당 결제 건을 선택하고 <strong>[반품 진행]</strong>을 누릅니다.' },
      { text: '결제 수단에 따라 카드 또는 현금으로 환불 처리합니다.' },
      { text: '반품 완료 메시지와 반품 영수증을 확인합니다.' },
    ],
    notice: '카드 반품은 카드사 정책에 따라 환불 반영까지 시간이 걸릴 수 있습니다.',
  },

  'pda-receipt': {
    tab: 'pda',
    icon: '🖨️',
    title: '영수증 재출력',
    subtitle: 'PDA에서 이미 발행된 영수증을 다시 출력',
    steps: [
      { text: '메인 화면에서 <strong>[조회]</strong> 또는 <strong>[영수증]</strong> 메뉴로 이동합니다.' },
      { text: '영수증 번호, 결제 시간, 금액 중 하나로 결제 건을 검색합니다.' },
      { text: '해당 결제 건을 선택하고 <strong>[영수증 재출력]</strong>을 누릅니다.' },
      { text: '연결된 프린터 또는 전자영수증 전송 방식을 선택합니다.' },
      { text: '출력 또는 전송 완료 여부를 확인합니다.' },
    ],
  },

  'pda-settle': {
    tab: 'pda',
    icon: '📊',
    title: '마감 정산',
    subtitle: 'PDA에서 일별 매출 마감 및 정산',
    steps: [
      { text: '영업 종료 후 메인 화면에서 <strong>[정산]</strong> 메뉴를 선택합니다.' },
      { text: '오늘 날짜와 매장 정보를 확인한 뒤 <strong>[정산 시작]</strong>을 누릅니다.' },
      { text: '카드, 현금, 취소 합계 등 정산 내역을 확인합니다.' },
      { text: '내용이 맞으면 <strong>[정산 확정]</strong>을 누릅니다.' },
      { text: '정산 영수증을 출력하거나 관리자에게 전송합니다.' },
    ],
    notice: '정산 확정 후에는 당일 데이터를 수정하기 어렵습니다. 금액을 반드시 확인하세요.',
  },

  'pda-error': {
    tab: 'pda',
    icon: '⚠️',
    title: 'PDA 오류 대응',
    subtitle: '오류 발생 시 빠른 해결 방법',
    steps: [
      { text: '<strong>화면 멈춤</strong>: 전원 버튼을 8~10초간 길게 눌러 강제 재시작합니다.' },
      { text: '<strong>결제 또는 스캔이 안 될 때</strong>: 앱을 닫고 다시 열거나 PDA를 재시작합니다. 결제 화면을 다시 활성화해보세요.' },
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

const initialTab = getTabFromHash();
if (initialTab) switchTab(initialTab, undefined, false);


/* ──────────────────────────────────────────────────────────
   4. 상세 패널 열기 / 닫기
────────────────────────────────────────────────────────── */

/**
 * 기능 카드 클릭 시 상세 패널을 탭 상단에 삽입합니다.
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
      ${externalVideoUrl ? `
        <a class="manual-video-fallback" href="${escapeAttribute(externalVideoUrl)}" target="_blank" rel="noopener">
          유튜브에서 직접 보기
        </a>` : ''}
    </div>` : '';

  /* ── 패널 DOM 생성 ──────────────────────────── */
  const panel = document.createElement('div');
  panel.className = `detail-panel open ${isPDA ? 'pda-detail' : ''}`;
  panel.innerHTML = `
    <div class="detail-header">
      <div class="detail-icon" style="background:${iconBg}">${data.icon}</div>
      <div>
        <div class="detail-title">${data.title}</div>
        <div class="detail-subtitle">${data.subtitle}</div>
      </div>
      <button class="close-btn" onclick="closeDetail('${id}')">✕</button>
    </div>
    ${manualVideoHTML}
    <div class="steps">${stepsHTML}</div>
    ${noticeHTML}
    ${errorHTML}
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
