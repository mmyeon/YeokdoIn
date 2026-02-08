# [🏋🏽‍♂️ 역도인 🏋🏽‍♂️](https://yeokdo-in.vercel.app/)


## 프로젝트 소개

역도 훈련 중 반복적으로 발생하는 무게 계산과 원판 조합의 번거로움을 해결하고, AI 기반 동작 분석을 통해 스스로 자세를 개선할 수 있도록 돕는 웹 애플리케이션입니다.

## 주요 기능

1. 스내치, 클린앤저크 최고 기록(PR) 저장 기능 
2. 훈련 퍼센트 입력시 PR 기반 중량 게산 기능

   
   <img width="600" height="592" alt="image" src="https://github.com/user-attachments/assets/ade92e6e-d48d-49fe-87f4-9cd9b62866a8" />

4. 역도 영상 업로드시 MediaPipe로 골격 감지 및 바벨 궤적 시각화

   <img width="600" height="592"  alt="image" src="https://github.com/user-attachments/assets/210f832f-068d-48dd-9911-4a31b9ad021c" />



## 핵심 기술적 구현 사항

MediaPipe 통합 및 메모리 최적화

- GPU 가속 실시간 처리: MediaPipe Tasks Vision을 활용한 자세 감지 및 객체 감지
- 메모리 누수 방지: WebGL2 컨텍스트 및 MediaPipe 모델 리소스의 체계적인 정리
- 세그멘테이션 마스크: 신체 영역 강조를 위한 마스크 오버레이 렌더링
- 바벨 궤적 시각화: 프레임별 바벨 위치 추적 및 시각화




## 로컬 실행 방법

1. Docker Desktop 실행 (필수)

2. 로컬 Supabase 시작
npx supabase start

3. 의존성 설치 및 개발 서버 실행
npm install
npm run dev
