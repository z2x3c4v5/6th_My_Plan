# What are you going to do? · 나의 계획 말하기

6학년 영어 **9단원 What are you going to do?** 학습용 웹앱입니다.
질문 5개로 계획을 묻고, **I'm going to ___.** 로 나의 계획을 말하며 익힐 수 있도록 만들었습니다.
(5학년 *K_FOOD_INTRODUCTION*, 6학년 *Can you come to the ___?* 와 같은 구성, 🍁 가을 테마)

## 주요 표현

| 역할 | 표현 |
|------|------|
| 묻기 | **What are you going to do** this afternoon / tonight / tomorrow / this weekend / this winter vacation**?** |
| 대답 (초급) | **I'm going to ___.** — I'm going to fly a kite. |
| 대답 (중급) | **I'm going to ___ + 누구와 · 어디서 · 무엇을 보러.** — I'm going to fly a kite on the hill. |

## 기능

- 🎨 **활동 카드 (초급) / (중급)** — 질문을 고르고 할 일 카드를 선택하면 대화가 바로 완성
  - 1️⃣ 질문 5개 버튼(오늘 오후 this afternoon · 오늘 밤 tonight · 내일 tomorrow · 이번 주말 this weekend · 겨울방학 this winter vacation) → 말풍선에 질문
  - 2️⃣ 활동 카드의 ✅ 버튼 → 말풍선 대답이 채워지고 **🎤 연습하기**의 계획표에 바로 담김 (다시 누르면 빼기)
  - 활동 **60개** — 종류마다 12개: 🏠 집·학교 · ⚽ 운동·놀이 · 📍 장소에 가기 · 👨‍👩‍👧 가족과 함께 · ✈️ 가족 여행
    - 📘 **교과서 표현 6개**(별도 필터): stay home · watch a baseball game · go camping · clean my room · study math · visit my grandparents
    - 📍 장소에 가기: PC방, 만화 카페, 코인노래방, 도서관, 서점, 쇼핑몰, 빵집, 방탈출 카페, 트램펄린 파크, 고양이 카페, 미용실, 치과 (`I'm going to go to a PC room.`)
    - 그 밖에 사과 따기, 밤 줍기, 내장산 단풍, 순천만 갈대, 피구, 제주도, 부산, 경주, 전주 한옥마을 …
  - 초급은 `I'm going to go camping.`, 중급은 `I'm going to go camping with my family.` 처럼 조금 긴 문장
  - 📘 교과서 표현 · 종류 필터 · ⭐ 지금 질문에 어울리는 활동만 보기 · 🔊 대화 듣기 · 다음 질문 ▶
- 🎤 **연습하기** — 📝 나의 계획표(My Plans): 질문과 내 대답 5줄, 줄마다 🔊 · 🔊 전체 듣기 · ✕ 빼기 · 이름 쓰기 · 🖨️ 인쇄
- 단어 클릭 시 **뜻 풍선 + 발음**, 말하기 **속도 조절**

## 사진

카드의 사진은 브라우저에서 **위키백과(Wikimedia Commons) 대표 사진**을 불러와 보여 줍니다(인터넷 연결 필요, 7일 동안 브라우저에 저장).
사진을 불러오지 못하면 이모지 그림이 대신 보이고, 상단 **📷 실제 사진** 버튼으로 끌 수도 있습니다.
직접 찍은 사진을 쓰려면 `images/` 폴더에 넣고 `data.js` 의 해당 활동에 `photo: "images/파일.jpg"` 를 추가하세요.

## 사용 방법

`index.html`을 브라우저(크롬 권장)에서 열면 됩니다. 별도 설치가 필요 없습니다.
음성은 브라우저 내장 **Web Speech API**(음성 합성)를 사용하고, 나의 계획표는 브라우저(localStorage)에 저장됩니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 화면 구조(탭·섹션) |
| `style.css`  | 디자인·가을 테마 |
| `data.js`    | 질문 5개, 활동 60개(초급·중급 문장, 사진 키워드, 추천 시기, 📘 교과서 표시), 단어 뜻 |
| `app.js`     | 음성·사진·단어 풍선·활동 카드(초급/중급)·나의 계획표 로직 |
