# 📡 Newsqrab Backend

**Newsqrab**의 백엔드 서버는 NestJS 기반으로 구축되었으며, MongoDB를 통해 기사 데이터를 저장·관리하고, OpenAI 및 Puppeteer를 활용해 자동 요약과 영상 콘텐츠 생성을 수행합니다.  
뉴스를 **자동 수집 → 요약(QnA 형식) → 릴스 형태로 제작 → 저장 및 스크랩 제공**하는 end-to-end 서비스 백엔드입니다.

---

## 🛠️ Tech Stack

| 기술 | 설명 |
|------|------|
| **NestJS** | 백엔드 서버 프레임워크로, 모듈화/의존성 주입을 통해 구조적인 코드 작성 가능 |
| **MongoDB** | 비정형 뉴스 데이터를 저장하는 NoSQL 데이터베이스 |
| **Puppeteer** | Naver 뉴스 등에서 기사 데이터를 수집하는 헤드리스 크롤러 |
| **OpenAI (GPT-4o)** | 뉴스 내용을 기반으로 QnA 요약 스크립트를 자동 생성 |
| **FFmpeg / TTS (gTTS or Polly)** | 요약 스크립트를 음성으로 변환하고 릴스 영상 생성 |
| **AWS S3** | 생성된 영상/음성 파일 저장소 |
| **Scheduler (@nestjs/schedule)** | 매일 정해진 시간에 뉴스 크롤링 및 자동 릴스 생성 트리거 |

---

## 🚀 Getting Started

```bash
npm install      # 의존성 설치
npm run start    # 서버 실행
```

환경 변수는 `.env` 파일로 설정하며, MongoDB 연결 주소, OpenAI API 키, AWS 인증 정보 등을 포함합니다.

---

## 🔄 전체 작동 흐름

```text
1. 유저가 뉴스 url입력
2. Puppeteer로 뉴스 기사 URL 크롤링
3. 기사 본문/제목/이미지/작성일 등 추출
4. 중복되지 않은 경우 DB에 저장
5. 저장된 기사 내용으로 OpenAI GPT-4o를 통해 크랩이 & 킹크랩 티키타카 대사 생성
6. 생성된 대사는 MongoDB에 QnA 스크립트 형태로 저장
7. 생성된 대사를 음성으로 변환 (TTS)
8. 배경 영상과 음성, 자막을 FFmpeg로 합쳐 릴스 생성
9. S3에 업로드 및 DB에 저장
```

---

## 📂 Project Structure

```bash
├── README.md
├── .env                          # 환경 변수 설정
├── package.json
├── assets/               셉 (👦 크랩이 & 👴 킹크랩)

뉴스 요약은, 크랩이(질문)와 킹크랩(답변)의 **티키타카 형식**으로 저장됩니다.

```json
"qnaScript": [
  {
    "user1": "어제 싸이 콘서트에서 뭔 일 있었어?",
    "user2": "크랩아~ 콘서트장에서 10대가 불법 촬영하다가 잡혔대."
  },
  {
    "user1": "헉 뭐야... 어떻게 잡힌 거야?",
    "user2": "크랩아~ 한 시민이 신고해서 바로 검거됐대."
  }
]
```
