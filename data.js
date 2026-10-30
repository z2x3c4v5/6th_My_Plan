/* =========================================================
 * 6학년 9단원 · What are you going to do? 데이터
 * - 질문 5개 : What are you going to do (this afternoon / tonight /
 *              tomorrow / this weekend / this winter vacation)?
 * - 대답      : I'm going to ___.
 *   · 기본(초급) : I'm going to fly a kite.
 *   · 도전(고급) : I'm going to fly a kite at the park.   (ext 붙이기)
 * - 활동 4종류 : 🏠 집·학교 / ⚽ 운동·놀이 / 👨‍👩‍👧 가족과 함께 / ✈️ 가족 여행
 * - 맞장구 표현 5개 (Sounds fun! 등)
 * - 단어 뜻 사전
 *
 *  ※ 사진: wiki 항목 = 영어 위키백과 문서 제목.
 *    브라우저에서 위키백과 대표 사진(실제 사진)을 불러오고,
 *    못 불러오면 이모지 그림으로 보여 줘요.
 *    직접 찍은 사진을 쓰려면 images 폴더에 넣고 photo: "images/파일.jpg" 를 추가하세요.
 * - 내 계획표(5칸) · 인터뷰 기록 · 연습 기록은 app.js 에서 localStorage 에 저장
 * ========================================================= */

/* ===== 질문 5개 (언제?) ===== */
const TIMES = [
  { key: "afternoon", en: "this afternoon",       ko: "오늘 오후에",     short: "오늘 오후", emoji: "🌤️", wiki: "Playground" },
  { key: "tonight",   en: "tonight",              ko: "오늘 밤에",       short: "오늘 밤",   emoji: "🌙", wiki: "Night sky" },
  { key: "tomorrow",  en: "tomorrow",             ko: "내일",            short: "내일",      emoji: "🌅", wiki: "Sunrise" },
  { key: "weekend",   en: "this weekend",         ko: "이번 주말에",     short: "이번 주말", emoji: "🗓️", wiki: "Seoul Forest" },
  { key: "vacation",  en: "this winter vacation", ko: "이번 겨울방학에", short: "겨울방학",  emoji: "⛄", wiki: "Snow" },
];
const questionEn = t => `What are you going to do ${t.en}?`;
const questionKo = t => `너는 ${t.ko} 무엇을 할 거니?`;

/* ===== 활동 종류 ===== */
const ACT_CATS = [
  { key: "home",   label: "🏠 집·학교에서" },
  { key: "sports", label: "⚽ 운동·놀이" },
  { key: "family", label: "👨‍👩‍👧 가족과 함께" },
  { key: "trip",   label: "✈️ 가족 여행" },
];

/* ===== 활동 (I'm going to ___.) =====
 * en  : 동사구 (I'm going to 뒤에 오는 말)
 * ko  : "나는 ___ 거야." 의 빈칸
 * ext : 도전 문장에 붙는 말 { en: 뒤에 붙임, ko: 한국어 앞에 붙임 }
 * when: 잘 어울리는 때 (⭐ 추천 표시) */
const ACTIVITIES = [
  // 🏠 집·학교에서
  { id: "homework",  cat: "home", en: "do my homework",     ko: "숙제를 할",          emoji: "📝", wiki: "Homework",          when: ["afternoon", "tonight", "tomorrow"],             ext: { en: "with my friend",      ko: "친구와 함께" } },
  { id: "book",      cat: "home", en: "read a book",        ko: "책을 읽을",          emoji: "📖", wiki: "Book",              when: ["afternoon", "tonight", "weekend", "vacation"], ext: { en: "in my room",          ko: "내 방에서" } },
  { id: "movie",     cat: "home", en: "watch a movie",      ko: "영화를 볼",          emoji: "🎬", wiki: "Movie theater",     when: ["tonight", "weekend", "vacation"],              ext: { en: "with my family",      ko: "가족과 함께" } },
  { id: "piano",     cat: "home", en: "play the piano",     ko: "피아노를 칠",        emoji: "🎹", wiki: "Piano",             when: ["afternoon", "tonight", "tomorrow"],             ext: { en: "for my mom",          ko: "엄마를 위해" } },
  { id: "clean",     cat: "home", en: "clean my room",      ko: "내 방을 청소할",     emoji: "🧹", wiki: "Vacuum cleaner",    when: ["afternoon", "tomorrow", "weekend"],             ext: { en: "after school",        ko: "방과 후에" } },
  { id: "draw",      cat: "home", en: "draw pictures",      ko: "그림을 그릴",        emoji: "🖍️", wiki: "Crayon",            when: ["afternoon", "tonight", "weekend"],              ext: { en: "in my sketchbook",    ko: "스케치북에" } },
  { id: "cookies",   cat: "home", en: "bake cookies",       ko: "쿠키를 구울",        emoji: "🍪", wiki: "Cookie",            when: ["weekend", "vacation"],                         ext: { en: "with my dad",         ko: "아빠와 함께" } },
  { id: "boardgame", cat: "home", en: "play board games",   ko: "보드게임을 할",      emoji: "🎲", wiki: "Board game",        when: ["tonight", "weekend", "vacation"],              ext: { en: "with my family",      ko: "가족과 함께" } },
  { id: "library",   cat: "home", en: "go to the library",  ko: "도서관에 갈",        emoji: "📚", wiki: "Library",           when: ["afternoon", "tomorrow", "weekend"],             ext: { en: "with my friends",     ko: "친구들과 함께" } },
  { id: "bed",       cat: "home", en: "go to bed early",    ko: "일찍 잘",            emoji: "😴", wiki: "Teddy bear",        when: ["tonight"],                                     ext: { en: "with my teddy bear",  ko: "곰 인형과 함께" } },

  // ⚽ 운동·놀이
  { id: "soccer",    cat: "sports", en: "play soccer",       ko: "축구를 할",          emoji: "⚽", wiki: "Association football", when: ["afternoon", "tomorrow", "weekend"],      ext: { en: "with my friends",     ko: "친구들과 함께" } },
  { id: "basketball",cat: "sports", en: "play basketball",   ko: "농구를 할",          emoji: "🏀", wiki: "Basketball",        when: ["afternoon", "tomorrow", "weekend"],             ext: { en: "at the park",         ko: "공원에서" } },
  { id: "bike",      cat: "sports", en: "ride my bike",      ko: "자전거를 탈",        emoji: "🚲", wiki: "Bicycle",           when: ["afternoon", "tomorrow", "weekend"],             ext: { en: "along the river",     ko: "강을 따라" } },
  { id: "swim",      cat: "sports", en: "go swimming",       ko: "수영하러 갈",        emoji: "🏊", wiki: "Swimming pool",     when: ["afternoon", "tomorrow", "weekend", "vacation"], ext: { en: "with my sister",      ko: "언니(누나)와 함께" } },
  { id: "kite",      cat: "sports", en: "fly a kite",        ko: "연을 날릴",          emoji: "🪁", wiki: "Kite",              when: ["afternoon", "weekend"],                        ext: { en: "at the park",         ko: "공원에서" } },
  { id: "badminton", cat: "sports", en: "play badminton",    ko: "배드민턴을 칠",      emoji: "🏸", wiki: "Badminton",         when: ["afternoon", "tomorrow", "weekend"],             ext: { en: "with my dad",         ko: "아빠와 함께" } },
  { id: "rope",      cat: "sports", en: "jump rope",         ko: "줄넘기를 할",        emoji: "🪢", wiki: "Skipping rope",     when: ["afternoon", "tomorrow"],                        ext: { en: "on the playground",   ko: "운동장에서" } },
  { id: "taekwondo", cat: "sports", en: "practice taekwondo",ko: "태권도를 연습할",    emoji: "🥋", wiki: "Taekwondo",         when: ["afternoon", "tomorrow"],                        ext: { en: "after school",        ko: "방과 후에" } },
  { id: "snowman",   cat: "sports", en: "make a snowman",    ko: "눈사람을 만들",      emoji: "⛄", wiki: "Snowman",           when: ["weekend", "vacation"],                         ext: { en: "with my friends",     ko: "친구들과 함께" } },
  { id: "skate",     cat: "sports", en: "go ice skating",    ko: "스케이트를 타러 갈", emoji: "⛸️", wiki: "Ice skating",       when: ["weekend", "vacation"],                         ext: { en: "with my cousin",      ko: "사촌과 함께" } },
  { id: "ski",       cat: "sports", en: "go skiing",         ko: "스키를 타러 갈",     emoji: "🎿", wiki: "Skiing",            when: ["vacation"],                                    ext: { en: "in Pyeongchang",      ko: "평창으로" } },
  { id: "sled",      cat: "sports", en: "go sledding",       ko: "눈썰매를 타러 갈",   emoji: "🛷", wiki: "Sled",              when: ["weekend", "vacation"],                         ext: { en: "with my brother",     ko: "형(오빠)과 함께" } },

  // 👨‍👩‍👧 가족과 함께
  { id: "grandparents", cat: "family", en: "visit my grandparents", ko: "할머니 할아버지 댁에 갈", emoji: "👵", wiki: "Grandparent", when: ["weekend", "vacation"], ext: { en: "in the countryside",  ko: "시골에 계신" } },
  { id: "camping",   cat: "family", en: "go camping",            ko: "캠핑하러 갈",        emoji: "🏕️", wiki: "Camping",           when: ["weekend", "vacation"],                         ext: { en: "with my family",      ko: "가족과 함께" } },
  { id: "zoo",       cat: "family", en: "go to the zoo",         ko: "동물원에 갈",        emoji: "🦒", wiki: "Zoo",               when: ["weekend", "vacation"],                         ext: { en: "to see pandas",       ko: "판다를 보러" } },
  { id: "amusement", cat: "family", en: "go to an amusement park", ko: "놀이공원에 갈",    emoji: "🎢", wiki: "Lotte World",       when: ["weekend", "vacation"],                         ext: { en: "with my cousins",     ko: "사촌들과 함께" } },
  { id: "picnic",    cat: "family", en: "have a picnic",         ko: "소풍을 갈",          emoji: "🧺", wiki: "Picnic",            when: ["weekend"],                                     ext: { en: "at the Han River",    ko: "한강으로" } },
  { id: "fishing",   cat: "family", en: "go fishing",            ko: "낚시하러 갈",        emoji: "🎣", wiki: "Fishing",           when: ["weekend", "vacation"],                         ext: { en: "with my grandpa",     ko: "할아버지와 함께" } },
  { id: "aquarium",  cat: "family", en: "go to the aquarium",    ko: "아쿠아리움에 갈",    emoji: "🐠", wiki: "Public aquarium",   when: ["weekend", "vacation"],                         ext: { en: "to see sharks",       ko: "상어를 보러" } },
  { id: "hiking",    cat: "family", en: "go hiking",             ko: "등산하러 갈",        emoji: "🥾", wiki: "Hiking",            when: ["weekend", "vacation"],                         ext: { en: "with my parents",     ko: "부모님과 함께" } },
  { id: "museum",    cat: "family", en: "go to a museum",        ko: "박물관에 갈",        emoji: "🏺", wiki: "National Museum of Korea", when: ["weekend", "vacation"],                  ext: { en: "with my mom",         ko: "엄마와 함께" } },
  { id: "waterpark", cat: "family", en: "go to a water park",    ko: "워터파크에 갈",      emoji: "💦", wiki: "Water park",        when: ["weekend", "vacation"],                         ext: { en: "with my uncle",       ko: "삼촌과 함께" } },

  // ✈️ 가족 여행
  { id: "jeju",      cat: "trip", en: "go to Jeju Island",       ko: "제주도에 갈",        emoji: "🍊", wiki: "Jeju Island",       when: ["weekend", "vacation"],                         ext: { en: "by plane",            ko: "비행기를 타고" } },
  { id: "busan",     cat: "trip", en: "visit Busan",             ko: "부산에 놀러 갈",     emoji: "🏖️", wiki: "Haeundae Beach",    when: ["weekend", "vacation"],                         ext: { en: "by KTX",              ko: "KTX를 타고" } },
  { id: "gyeongju",  cat: "trip", en: "go to Gyeongju",          ko: "경주에 갈",          emoji: "🏯", wiki: "Bulguksa",          when: ["weekend", "vacation"],                         ext: { en: "to see Bulguksa",     ko: "불국사를 보러" } },
  { id: "seoraksan", cat: "trip", en: "climb Seoraksan",         ko: "설악산에 오를",      emoji: "⛰️", wiki: "Seoraksan",         when: ["weekend", "vacation"],                         ext: { en: "with my dad",         ko: "아빠와 함께" } },
  { id: "jeonju",    cat: "trip", en: "visit Jeonju Hanok Village", ko: "전주 한옥마을에 놀러 갈", emoji: "🏘️", wiki: "Jeonju Hanok Village", when: ["weekend", "vacation"],              ext: { en: "with my grandma",     ko: "할머니와 함께" } },
  { id: "seoultower",cat: "trip", en: "go to N Seoul Tower",     ko: "N서울타워에 갈",     emoji: "🗼", wiki: "N Seoul Tower",     when: ["tonight", "weekend", "vacation"],              ext: { en: "to see the night view", ko: "야경을 보러" } },
  { id: "gangneung", cat: "trip", en: "go to Gangneung",         ko: "강릉에 갈",          emoji: "🌊", wiki: "Gangneung",         when: ["weekend", "vacation"],                         ext: { en: "to see the sunrise",  ko: "해돋이를 보러" } },
  { id: "icefest",   cat: "trip", en: "go to the ice fishing festival", ko: "얼음낚시 축제에 갈", emoji: "❄️", wiki: "Hwacheon Sancheoneo Ice Festival", when: ["weekend", "vacation"], ext: { en: "in Hwacheon",         ko: "화천에서 열리는" } },
  { id: "train",     cat: "trip", en: "take a train trip",       ko: "기차 여행을 할",     emoji: "🚄", wiki: "Korea Train Express", when: ["weekend", "vacation"],                       ext: { en: "to Yeosu",            ko: "여수로" } },
  { id: "japan",     cat: "trip", en: "travel to Japan",         ko: "일본으로 여행을 갈", emoji: "🗻", wiki: "Mount Fuji",        when: ["vacation"],                                    ext: { en: "with my family",      ko: "가족과 함께" } },
  { id: "australia", cat: "trip", en: "travel to Australia",     ko: "호주로 여행을 갈",   emoji: "🦘", wiki: "Sydney Opera House", when: ["vacation"],                                   ext: { en: "to see kangaroos",    ko: "캥거루를 보러" } },
];

/* 문장 만들기: level = "basic" | "plus" */
function answerEn(a, level) {
  return `I'm going to ${a.en}${level === "plus" ? " " + a.ext.en : ""}.`;
}
function answerKo(a, level) {
  return `나는 ${level === "plus" ? a.ext.ko + " " : ""}${a.ko} 거야.`;
}

/* ===== 맞장구 표현 (친구의 계획을 듣고) ===== */
const REACTIONS = [
  { en: "Sounds fun!",        ko: "재미있겠다!",          emoji: "😆" },
  { en: "That's great!",      ko: "멋지다!",              emoji: "👍" },
  { en: "Have fun!",          ko: "재미있게 놀아!",       emoji: "🎉" },
  { en: "Have a good time!",  ko: "좋은 시간 보내!",      emoji: "😊" },
  { en: "Wow, me too!",       ko: "와, 나도야!",          emoji: "🙌" },
];

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
  "snowman": "눈사람", "ice": "얼음", "skating": "스케이트 타기", "skiing": "스키 타기",
  "sledding": "썰매 타기", "visit": "방문하다", "grandparents": "할머니 할아버지",
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
};
