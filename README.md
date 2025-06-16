# 📡 Newsqrab Backend

**Newsqrab**의 백엔드 서버는 NestJS 기반으로 구축되었으며, MongoDB를 통해 기사 데이터를 저장·관리하고, OpenAI 및 Puppeteer를 활용해 자동 요약과 영상 콘텐츠 생성을 수행합니다.  
뉴스를 **자동 수집 → 친근한 대사형식 요약 생성(QnA 형식 + TTS) → 릴스 형태로 제작 (ASS형식의 자막)  → 저장 및 제공**하는 end-to-end 서비스 백엔드입니다.

![image](https://github.com/user-attachments/assets/a413e1d6-4e21-42c5-aaa4-c0f8ce310a8b)


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

## 🔧 배포 환경

| 구성 요소                               | 설명                                                                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Docker & docker-compose**         | NestJS 백어드 서버는 Dockerfile과 docker-compose로 커테이너화되어 AWS EC2에서 실행됩니다. 포트 바인딩, 환경 변수 주입이 자동화되어 있습니다.                       |
| **AWS EC2 (Ubuntu 22.04)**          | EC2 인스턴스에서 백어드 및 RAG 서버를 각각 실행하며, `tmux`, `nohup`을 통해 서버 재시작 시에도 지속 실행됩니다.                                              |
| **Nginx + Certbot (Let's Encrypt)** | SSL 인증서를 발급받아 HTTPS로 통신하며, 443 포트로 프론트에드와 안전히 연동됩니다. 인증서는 자동 갑시정설까지 완료되어 있습니다.                                          |
| **도메인 연결**                          | `뉴스크래프.서버.한국` 도메인을 자체 등록하여 https 기반으로 서비스에 접근할 수 있습니다. (Punycode: `https://xn--vg1bu2h64kh0n.xn--hk3b17f.xn--3e0b707e`) |

## 🤖 RAG 서버 (FastAPI + LangChain)

| 항목                         | 설명                                                                       |
| -------------------------- | ------------------------------------------------------------------------ |
| **LangChain 기반 RAG 파이프라인** | 나무위키 및 가학 문서를 FAISS로 벡터화하여 기사 요약 정확도를 높입니다.                              |
| **FastAPI 서버 구성**          | `/rag` POST API로 기사와 기전 스크립트를 받아 건설된 QnA 스크립트를 생성합니다.                    |
| **동반 커테이너 실행**             | RAG는 가상화로 EC2 내에서 uvicorn으로 실행됩니다 |
| **연동 방식**                  | 백엔드에서는 `.env`의 `RAG_SERVER_URL` 환경변수를 통해 RAG 서버에 통신합니다.                  |

---

## 🔐 인증 및 보안

| 항목                    | 설명                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------ |
| **JWT 인증 시스템**        | 사용자는 로그인 시 JWT를 발급받아 API 요청 시 `Authorization` 헤더에 포함합니다.                                   |
| **비밀번호 암호화 (bcrypt)** | 사용자 비밀번호는 해시 처리되어 MongoDB에 저장되며, 복호화 불가능한 구조입니다.                                           |

| **환경변수 보호 (.env)**    | API 키, DB 연결 주소 등 모든 무료정보는 `.env` 파일을 통해 관리됩니다. Docker 커테이너 내에서도 `.env` 주입을 통해 보안성을 유지합니다. |

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
9. S3에 업로드 및 DB에 저장 (예시는 아래 링크에서 확인 가능)
https://newsqrab.kr.object.ncloudstorage.com/reels/c92fd32d-36c9-4d44-91e0-95df9567747c.mp4
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
    "crab": "헐 어제 싸이 콘서트에서 뭔 일 있었어?",
    "starfish": "크랩아~ 콘서트장에서 10대가 불법 촬영하다가 잡혔대."
  },
  {
    "crab": "헉 뭐야... 어떻게 잡힌 거야?",
    "starfish": "웅웅 한 시민이 신고해서 바로 검거됐대."
  }
]
```
## 👾 API Document & Demo
API문서: https://xn--vg1bu2h64kh0n.xn--hk3b17f.xn--3e0b707e/api#/

프론트엔드 DEMO링크: https://news-qrab-front.vercel.app/
