/* =========================================================
 * 6학년 9단원 · What are you going to do? 데이터
 * - 질문 5개 : What are you going to do (this afternoon / tonight /
 *              tomorrow / this weekend / this winter vacation)?
 * - 대답      : I'm going to ___.  (초급)
 *               I'm going to fly a kite on the hill.  (중급: mid 붙이기)
 * - 활동 5종류 × 12개 : 🏠 집·학교 / ⚽ 운동·놀이 / 📍 장소에 가기 / 👨‍👩‍👧 가족과 함께 / ✈️ 가족 여행
 *   📘 교과서 표현 6개 (book: true): stay home · watch a baseball game · go camping ·
 *      clean my room · study math · visit my grandparents
 * - 단어 뜻 사전
 *
 *  ※ 그림: images/활동id.png (Canva로 만든 그림, 예: images/kite.png)
 *    그림이 없으면 이모지로 보여 줘요. 다른 그림을 쓰려면 같은 이름으로 바꾸거나
 *    photo: "images/파일.jpg" 를 추가하세요.
 * - 활동 카드에서 고른 계획(5칸) · 인터뷰 기록 · 연습 기록은 app.js 에서 localStorage 에 저장
 * ========================================================= */

/* ===== 질문 5개 (언제?) ===== */
const TIMES = [
  { key: "afternoon", en: "this afternoon",       ko: "오늘 오후에",     short: "오늘 오후", emoji: "🌤️" },
  { key: "tonight",   en: "tonight",              ko: "오늘 밤에",       short: "오늘 밤",   emoji: "🌙" },
  { key: "tomorrow",  en: "tomorrow",             ko: "내일",            short: "내일",      emoji: "🌅" },
  { key: "weekend",   en: "this weekend",         ko: "이번 주말에",     short: "이번 주말", emoji: "🗓️" },
  { key: "vacation",  en: "this winter vacation", ko: "이번 겨울방학에", short: "겨울방학",  emoji: "🧳" },
];
const questionEn = t => `What are you going to do ${t.en}?`;
const questionKo = t => `너는 ${t.ko} 무엇을 할 거니?`;

/* ===== 활동 종류 ===== */
const ACT_CATS = [
  { key: "home",   label: "🏠 집·학교에서" },
  { key: "sports", label: "⚽ 운동·놀이" },
  { key: "place",  label: "📍 장소에 가기" },
  { key: "family", label: "👨‍👩‍👧 가족과 함께" },
  { key: "trip",   label: "✈️ 가족 여행" },
];

/* ===== 활동 (I'm going to ___.) =====
 * en  : 동사구 (I'm going to 뒤에 오는 말)
 * ko  : "나는 ___ 거야." 의 빈칸
 * mid : 중급 문장에 붙는 말 { en: 뒤에 붙임, ko: 한국어 앞에 붙임 }
 * when: 잘 어울리는 때 (⭐ 추천 표시)
 * book: 📘 교과서 표현 */
const ACTIVITIES = [
  // 🏠 집·학교에서
  { id: "stayhome",  cat: "home", en: "stay home",          ko: "집에 있을",          emoji: "🏠", when: ["afternoon", "tonight", "tomorrow", "weekend", "vacation"], mid: { en: "with my family", ko: "가족과 함께" }, book: true },
  { id: "math",      cat: "home", en: "study math",         ko: "수학 공부를 할",     emoji: "🔢", when: ["afternoon", "tonight", "tomorrow"], mid: { en: "for the test", ko: "시험을 위해" }, book: true },
  { id: "homework",  cat: "home", en: "do my homework",     ko: "숙제를 할",          emoji: "📝", when: ["afternoon", "tonight", "tomorrow"], mid: { en: "with my friend", ko: "친구와 함께" } },
  { id: "book",      cat: "home", en: "read a book",        ko: "책을 읽을",          emoji: "📖", when: ["afternoon", "tonight", "weekend", "vacation"], mid: { en: "in my room", ko: "내 방에서" } },
  { id: "movie",     cat: "home", en: "watch a movie",      ko: "영화를 볼",          emoji: "🎬", when: ["tonight", "weekend", "vacation"], mid: { en: "with my family", ko: "가족과 함께" } },
  { id: "piano",     cat: "home", en: "play the piano",     ko: "피아노를 칠",        emoji: "🎹", when: ["afternoon", "tonight", "tomorrow"], mid: { en: "for my mom", ko: "엄마를 위해" } },
  { id: "clean",     cat: "home", en: "clean my room",      ko: "내 방을 청소할",     emoji: "🧹", when: ["afternoon", "tomorrow", "weekend"], mid: { en: "after school", ko: "방과 후에" }, book: true },
  { id: "draw",      cat: "home", en: "draw pictures",      ko: "그림을 그릴",        emoji: "🖍️", when: ["afternoon", "tonight", "weekend"], mid: { en: "in my sketchbook", ko: "스케치북에" } },
  { id: "cookies",   cat: "home", en: "bake cookies",       ko: "쿠키를 구울",        emoji: "🍪", when: ["weekend", "vacation"], mid: { en: "with my dad", ko: "아빠와 함께" } },
  { id: "boardgame", cat: "home", en: "play board games",   ko: "보드게임을 할",      emoji: "🎲", when: ["tonight", "weekend", "vacation"], mid: { en: "with my brother", ko: "형(오빠)과 함께" } },

  // ⚽ 운동·놀이
  { id: "soccer",    cat: "sports", en: "play soccer",       ko: "축구를 할",          emoji: "⚽", when: ["afternoon", "tomorrow", "weekend"], mid: { en: "with my friends", ko: "친구들과 함께" } },
  { id: "basketball",cat: "sports", en: "play basketball",   ko: "농구를 할",          emoji: "🏀", when: ["afternoon", "tomorrow", "weekend"], mid: { en: "at the park", ko: "공원에서" } },
  { id: "bike",      cat: "sports", en: "ride my bike",      ko: "자전거를 탈",        emoji: "🚲", when: ["afternoon", "tomorrow", "weekend"], mid: { en: "along the river", ko: "강을 따라" } },
  { id: "swim",      cat: "sports", en: "go swimming",       ko: "수영하러 갈",        emoji: "🏊", when: ["afternoon", "tomorrow", "weekend", "vacation"], mid: { en: "with my sister", ko: "언니(누나)와 함께" } },
  { id: "kite",      cat: "sports", en: "fly a kite",        ko: "연을 날릴",          emoji: "🪁", when: ["afternoon", "weekend"], mid: { en: "on the hill", ko: "언덕에서" } },
  { id: "badminton", cat: "sports", en: "play badminton",    ko: "배드민턴을 칠",      emoji: "🏸", when: ["afternoon", "tomorrow", "weekend"], mid: { en: "with my dad", ko: "아빠와 함께" } },
  { id: "rope",      cat: "sports", en: "jump rope",         ko: "줄넘기를 할",        emoji: "🪢", when: ["afternoon", "tomorrow"], mid: { en: "on the playground", ko: "운동장에서" } },
  { id: "taekwondo", cat: "sports", en: "practice taekwondo",ko: "태권도를 연습할",    emoji: "🥋", when: ["afternoon", "tomorrow"], mid: { en: "after school", ko: "방과 후에" } },
  { id: "apples",    cat: "family", en: "pick apples",        ko: "사과를 딸",          emoji: "🍎", when: ["weekend"], mid: { en: "at the farm", ko: "농장에서" } },
  { id: "leaves",    cat: "trip", en: "see autumn leaves",  ko: "단풍을 구경할",      emoji: "🍁", when: ["weekend", "vacation"], mid: { en: "at Naejangsan", ko: "내장산에서" } },
  { id: "chestnuts", cat: "family", en: "gather chestnuts",   ko: "밤을 주울",          emoji: "🌰", when: ["weekend"], mid: { en: "on the mountain", ko: "산에서" } },
  { id: "roller",    cat: "sports", en: "go roller skating",  ko: "롤러스케이트를 타러 갈", emoji: "🛼", when: ["afternoon", "tomorrow", "weekend"], mid: { en: "at the park", ko: "공원에서" } },

  // 📍 장소에 가기
  { id: "pcroom",    cat: "place", en: "go to a PC room",       ko: "PC방에 갈",           emoji: "💻", when: ["afternoon", "tomorrow", "weekend"], mid: { en: "with my friends", ko: "친구들과 함께" } },
  { id: "cartoon",   cat: "place", en: "go to a cartoon café",  ko: "만화 카페에 갈",      emoji: "🗯️", when: ["afternoon", "weekend", "vacation"], mid: { en: "to read comics", ko: "만화책을 읽으러" } },
  { id: "karaoke",   cat: "place", en: "go to a coin karaoke",  ko: "코인노래방에 갈",     emoji: "🎤", when: ["afternoon", "weekend"], mid: { en: "to sing K-pop songs", ko: "케이팝 노래를 부르러" } },
  { id: "library",   cat: "place", en: "go to the library",     ko: "도서관에 갈",         emoji: "📚", when: ["afternoon", "tomorrow", "weekend", "vacation"], mid: { en: "to borrow books", ko: "책을 빌리러" } },
  { id: "bookstore", cat: "place", en: "go to the bookstore",   ko: "서점에 갈",           emoji: "📗", when: ["afternoon", "weekend"], mid: { en: "to buy a new book", ko: "새 책을 사러" } },
  { id: "mall",      cat: "place", en: "go to the shopping mall", ko: "쇼핑몰에 갈",       emoji: "🛍️", when: ["weekend", "vacation"], mid: { en: "with my mom", ko: "엄마와 함께" } },
  { id: "bakery",    cat: "place", en: "go to the bakery",      ko: "빵집에 갈",           emoji: "🥐", when: ["afternoon", "tomorrow"], mid: { en: "to buy bread", ko: "빵을 사러" } },
  { id: "escape",    cat: "place", en: "go to an escape room",  ko: "방탈출 카페에 갈",    emoji: "🔐", when: ["weekend", "vacation"], mid: { en: "with my cousins", ko: "사촌들과 함께" } },
  { id: "trampoline",cat: "place", en: "go to a trampoline park", ko: "트램펄린 파크에 갈", emoji: "🤸", when: ["afternoon", "weekend", "vacation"], mid: { en: "with my brother", ko: "형(오빠)과 함께" } },
  { id: "catcafe",   cat: "place", en: "go to a cat café",      ko: "고양이 카페에 갈",    emoji: "🐱", when: ["weekend", "vacation"], mid: { en: "to play with cats", ko: "고양이와 놀러" } },
  { id: "salon",     cat: "place", en: "go to the hair salon",  ko: "미용실에 갈",         emoji: "💇", when: ["afternoon", "tomorrow", "weekend"], mid: { en: "to get a haircut", ko: "머리를 자르러" } },
  { id: "dentist",   cat: "place", en: "go to the dentist",     ko: "치과에 갈",           emoji: "🦷", when: ["afternoon", "tomorrow"], mid: { en: "with my dad", ko: "아빠와 함께" } },

  // 👨‍👩‍👧 가족과 함께
  { id: "grandparents", cat: "family", en: "visit my grandparents", ko: "할머니 할아버지 댁에 갈", emoji: "👵", when: ["weekend", "vacation"], mid: { en: "in the countryside", ko: "시골에 계신" }, book: true },
  { id: "camping",   cat: "family", en: "go camping",            ko: "캠핑하러 갈",        emoji: "🏕️", when: ["weekend", "vacation"], mid: { en: "with my family", ko: "가족과 함께" }, book: true },
  { id: "zoo",       cat: "family", en: "go to the zoo",         ko: "동물원에 갈",        emoji: "🦒", when: ["weekend", "vacation"], mid: { en: "to see pandas", ko: "판다를 보러" } },
  { id: "amusement", cat: "family", en: "go to an amusement park", ko: "놀이공원에 갈",    emoji: "🎢", when: ["weekend", "vacation"], mid: { en: "with my cousins", ko: "사촌들과 함께" } },
  { id: "picnic",    cat: "family", en: "have a picnic",         ko: "소풍을 갈",          emoji: "🧺", when: ["weekend"], mid: { en: "at the Han River", ko: "한강으로" } },
  { id: "fishing",   cat: "family", en: "go fishing",            ko: "낚시하러 갈",        emoji: "🎣", when: ["weekend", "vacation"], mid: { en: "with my grandpa", ko: "할아버지와 함께" } },
  { id: "aquarium",  cat: "family", en: "go to the aquarium",    ko: "아쿠아리움에 갈",    emoji: "🐠", when: ["weekend", "vacation"], mid: { en: "to see sharks", ko: "상어를 보러" } },
  { id: "hiking",    cat: "family", en: "go hiking",             ko: "등산하러 갈",        emoji: "🥾", when: ["weekend", "vacation"], mid: { en: "with my parents", ko: "부모님과 함께" } },
  { id: "museum",    cat: "family", en: "go to a museum",        ko: "박물관에 갈",        emoji: "🏺", when: ["weekend", "vacation"], mid: { en: "with my mom", ko: "엄마와 함께" } },
  { id: "waterpark", cat: "family", en: "go to a water park",    ko: "워터파크에 갈",      emoji: "💦", when: ["weekend", "vacation"], mid: { en: "with my uncle", ko: "삼촌과 함께" } },

  // ✈️ 가족 여행
  { id: "jeju",      cat: "trip", en: "go to Jeju Island",       ko: "제주도에 갈",        emoji: "🍊", when: ["weekend", "vacation"], mid: { en: "by plane", ko: "비행기를 타고" } },
  { id: "busan",     cat: "trip", en: "visit Busan",             ko: "부산에 놀러 갈",     emoji: "🏖️", when: ["weekend", "vacation"], mid: { en: "by KTX", ko: "KTX를 타고" } },
  { id: "gyeongju",  cat: "trip", en: "go to Gyeongju",          ko: "경주에 갈",          emoji: "🏯", when: ["weekend", "vacation"], mid: { en: "to see Bulguksa", ko: "불국사를 보러" } },
  { id: "seoraksan", cat: "trip", en: "climb Seoraksan",         ko: "설악산에 오를",      emoji: "⛰️", when: ["weekend", "vacation"], mid: { en: "with my dad", ko: "아빠와 함께" } },
  { id: "jeonju",    cat: "trip", en: "visit Jeonju Hanok Village", ko: "전주 한옥마을에 놀러 갈", emoji: "🏘️", when: ["weekend", "vacation"], mid: { en: "with my grandma", ko: "할머니와 함께" } },
  { id: "seoultower",cat: "trip", en: "go to N Seoul Tower",     ko: "N서울타워에 갈",     emoji: "🗼", when: ["tonight", "weekend", "vacation"], mid: { en: "to see the night view", ko: "야경을 보러" } },
  { id: "gangneung", cat: "trip", en: "go to Gangneung",         ko: "강릉에 갈",          emoji: "🌊", when: ["weekend", "vacation"], mid: { en: "to see the sunrise", ko: "해돋이를 보러" } },
  { id: "baseball",  cat: "sports", en: "watch a baseball game", ko: "야구 경기를 볼",  emoji: "⚾", when: ["tonight", "weekend"], mid: { en: "at the stadium", ko: "야구장에서" }, book: true },
  { id: "train",     cat: "trip", en: "take a train trip",       ko: "기차 여행을 할",     emoji: "🚄", when: ["weekend", "vacation"], mid: { en: "to Yeosu", ko: "여수로" } },
  { id: "japan",     cat: "trip", en: "travel to Japan",         ko: "일본으로 여행을 갈", emoji: "🗻", when: ["vacation"], mid: { en: "with my family", ko: "가족과 함께" } },
  { id: "australia", cat: "trip", en: "travel to Australia",     ko: "호주로 여행을 갈",   emoji: "🦘", when: ["vacation"], mid: { en: "to see kangaroos", ko: "캥거루를 보러" } },

  { id: "dishes",    cat: "home", en: "wash the dishes",    ko: "설거지를 할",        emoji: "🍽️", when: ["tonight", "tomorrow", "weekend"], mid: { en: "after dinner", ko: "저녁을 먹은 후에" } },
  { id: "music",     cat: "home", en: "listen to music",    ko: "음악을 들을",        emoji: "🎧", when: ["afternoon", "tonight", "weekend", "vacation"], mid: { en: "with my sister", ko: "언니(누나)와 함께" } },
  { id: "tennis",    cat: "sports", en: "play tennis",      ko: "테니스를 칠",        emoji: "🎾", when: ["afternoon", "tomorrow", "weekend"], mid: { en: "with my mom", ko: "엄마와 함께" } },
  { id: "dodgeball", cat: "sports", en: "play dodgeball",   ko: "피구를 할",          emoji: "🔴", when: ["afternoon", "tomorrow"], mid: { en: "with my classmates", ko: "반 친구들과 함께" } },
  { id: "suncheon",  cat: "trip", en: "go to Suncheon Bay", ko: "순천만에 갈",        emoji: "🌾", when: ["weekend", "vacation"], mid: { en: "to see the reeds", ko: "갈대를 보러" } },
];

/* 종류 순서대로 정렬 (🏠 → ⚽ → 📍 → 👨‍👩‍👧 → ✈️), 같은 종류 안에서는 📘 교과서 표현을 먼저 */
const catIndex = a => ACT_CATS.findIndex(c => c.key === a.cat);
ACTIVITIES.sort((x, y) => catIndex(x) - catIndex(y) || (y.book ? 1 : 0) - (x.book ? 1 : 0));

/* 문장 만들기: level = "basic"(초급) | "mid"(중급: 누구와·어디서·왜를 붙인 조금 긴 문장) */
const phraseEn = (a, level) => level === "mid" ? `${a.en} ${a.mid.en}` : a.en;
const phraseKo = (a, level) => level === "mid" ? `${a.mid.ko} ${a.ko}` : a.ko;
function answerEn(a, level) { return `I'm going to ${phraseEn(a, level)}.`; }
function answerKo(a, level) { return `나는 ${phraseKo(a, level)} 거야.`; }

/* ===== 단어 뜻 사전 ===== */
const WORD_MEANINGS = {
  // 질문 · 대답 틀
  "what": "무엇", "are": "~이다 (are you going to: ~할 거니?)", "you": "너", "going": "going to: ~할 것이다",
  "to": "~하는 것 / ~로", "do": "하다", "i'm": "나는 ~이다 (I am)", "i": "나", "this": "이번",
  "afternoon": "오후", "tonight": "오늘 밤", "tomorrow": "내일", "weekend": "주말",
  "winter": "겨울", "vacation": "방학", "me": "나", "too": "~도", "how": "어떻게", "about": "~에 대해",
  // 맞장구
  "sounds": "~처럼 들리다", "fun": "재미있는", "that's": "그것은 ~이다", "great": "멋진, 훌륭한",
  "have": "가지다 · 하다", "a": "하나의", "good": "좋은", "time": "시간", "wow": "와!",
  // 활동 동사
  "my": "나의", "homework": "숙제", "read": "읽다", "book": "책", "watch": "보다", "movie": "영화",
  "play": "(운동·악기·놀이를) 하다", "the": "그", "piano": "피아노", "clean": "청소하다", "room": "방",
  "draw": "그리다", "pictures": "그림들", "bake": "(빵·쿠키를) 굽다", "cookies": "쿠키",
  "board": "판", "games": "게임들", "go": "가다", "library": "도서관", "bed": "침대 (go to bed: 자다)",
  "early": "일찍", "soccer": "축구", "basketball": "농구", "ride": "타다", "bike": "자전거",
  "swimming": "수영", "fly": "날리다", "kite": "연", "badminton": "배드민턴", "jump": "뛰다",
  "rope": "줄 (jump rope: 줄넘기하다)", "practice": "연습하다", "taekwondo": "태권도", "make": "만들다",
  "skating": "스케이트 타기", "visit": "방문하다", "grandparents": "할머니 할아버지",
  "camping": "캠핑", "zoo": "동물원", "an": "하나의", "amusement": "즐거움", "park": "공원",
  "picnic": "소풍", "fishing": "낚시", "aquarium": "아쿠아리움, 수족관", "hiking": "등산, 하이킹",
  "museum": "박물관", "water": "물", "jeju": "제주", "island": "섬", "busan": "부산",
  "gyeongju": "경주", "climb": "오르다", "seoraksan": "설악산", "jeonju": "전주", "hanok": "한옥",
  "village": "마을", "n": "N", "seoul": "서울", "tower": "탑, 타워", "gangneung": "강릉",
  "festival": "축제", "take": "(기차·버스 등을) 타다", "train": "기차", "trip": "여행",
  "travel": "여행하다", "japan": "일본", "australia": "호주",
  // 도전 표현
  "with": "~와 함께", "friend": "친구", "friends": "친구들", "in": "~ 안에서", "family": "가족",
  "for": "~를 위해", "mom": "엄마", "after": "~ 후에", "school": "학교", "sketchbook": "스케치북",
  "dad": "아빠", "teddy": "테디 (teddy bear: 곰 인형)", "bear": "곰", "at": "~에서",
  "along": "~을 따라", "river": "강", "sister": "언니, 누나, 여동생", "on": "~ 위에서",
  "playground": "놀이터, 운동장", "cousin": "사촌", "cousins": "사촌들", "pyeongchang": "평창",
  "brother": "형, 오빠, 남동생", "countryside": "시골", "see": "보다", "pandas": "판다들",
  "han": "한 (Han River: 한강)", "grandpa": "할아버지", "sharks": "상어들", "parents": "부모님",
  "uncle": "삼촌", "by": "~를 타고", "plane": "비행기", "ktx": "KTX (고속 열차)",
  "bulguksa": "불국사", "grandma": "할머니", "night": "밤", "view": "경치", "sunrise": "해돋이",
  "hwacheon": "화천", "yeosu": "여수", "kangaroos": "캥거루들",
  "stay": "머무르다 (stay home: 집에 있다)", "home": "집", "study": "공부하다", "math": "수학",
  "pc": "PC (컴퓨터)", "cartoon": "만화", "café": "카페", "coin": "동전", "karaoke": "노래방",
  "bookstore": "서점", "shopping": "쇼핑", "mall": "쇼핑몰", "bakery": "빵집", "escape": "탈출",
  "trampoline": "트램펄린", "cat": "고양이", "cats": "고양이들", "hair": "머리카락", "salon": "미용실",
  "dentist": "치과 (치과 의사)", "comics": "만화책", "sing": "노래하다", "k-pop": "케이팝",
  "songs": "노래들", "borrow": "빌리다", "books": "책들", "buy": "사다", "new": "새로운",
  "bread": "빵", "get": "받다 (get a haircut: 머리를 자르다)", "haircut": "머리 자르기", "test": "시험",
  "wash": "씻다", "dishes": "접시들 (wash the dishes: 설거지하다)", "listen": "듣다", "music": "음악",
  "tennis": "테니스", "dodgeball": "피구", "classmates": "반 친구들", "hill": "언덕", "stadium": "경기장",
  "farm": "농장", "mountain": "산", "suncheon": "순천", "bay": "만 (바다가 육지로 들어온 곳)", "reeds": "갈대들",
  "naejangsan": "내장산", "dinner": "저녁 식사",
  "pick": "따다", "apples": "사과들", "autumn": "가을", "leaves": "잎들 (autumn leaves: 단풍)",
  "gather": "모으다, 줍다", "chestnuts": "밤들", "roller": "롤러", "baseball": "야구", "game": "경기, 게임",
};
