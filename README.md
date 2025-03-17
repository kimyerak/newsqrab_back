# 📡 Newsqrab Backend

Newsqrab의 백엔드 서버입니다. NestJS와 MongoDB를 사용하여 구축되었으며, REST API를 제공합니다.


## 🛠️ Tech Stack

- **Backend:** NestJS
- **Database:** MongoDB


## 🚀 Getting Started

```bash
npm install  # 의존성 설치
npm run start  # 실행
```


## 💫 API Documentation

Swagger 문서를 제공합니다.
	•	로컬 실행 시: http://localhost:3000/api


## 📂 Project Structure
├── README.md
├── package-lock.json
├── package.json
├── .env
├── assets/              # 앱에 필요한 데이터를 저장하는 로컬 데이터 저장소입니다.
  ├── reels              # 영상과 음성이 합쳐진 영상 데이터 (.mp4)
  ├── tts                # 음성 데이터 (.mp3)
  ├── video              # 카테고리 별 샘플 영상 데이터 (.mp4)
├── src/
  ├── article/           # 기사 관련 (크롤링 등)
  ├── config/            # 환경 변수 설정 (openai, aws)
  ├── opanai/            # openai 관련 (대사 생성)
  ├── reels/             # 릴스 생성 관련 (tts, 병합 등)
  ├── s3/                # 파일 업로드 관련 
  ├── scrap/             # 스크랩 관련 데이터 처리 (스크랩 저장, 핫스크랩)
  ├── user/              # 유저 데이터 관련 
  ├── app.module.ts      # 루트 모듈 (몽고디비 연결 포함)
  ├── main.ts            # 앱 엔트리포인트
