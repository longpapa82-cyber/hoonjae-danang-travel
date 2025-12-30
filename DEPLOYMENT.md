# 🚀 배포 가이드

## Vercel로 배포하기 (권장)

### 방법 1: Vercel CLI로 배포 (가장 빠름)

1. **터미널에서 다음 명령어 실행**:
```bash
vercel
```

2. **질문에 답하기**:
   - `Set up and deploy "~/projects/travelPlan"?` → **Y** (Enter)
   - `Which scope do you want to deploy to?` → 계정 선택
   - `Link to existing project?` → **N** (새 프로젝트)
   - `What's your project's name?` → `hoonjae-travel` (원하는 이름)
   - `In which directory is your code located?` → `./` (Enter)
   - `Want to modify these settings?` → **N** (Enter)

3. **환경 변수 설정**:
배포 후 Vercel 대시보드에서 환경 변수를 추가해야 합니다:
```bash
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```
값 입력: `AIzaSyDVn3ur-mABpiRzt4cl2kZdh0GRoqsTe9Y`

4. **재배포** (환경 변수 적용):
```bash
vercel --prod
```

### 방법 2: Vercel 웹사이트로 배포

1. **GitHub에 푸시** (먼저 GitHub 저장소 생성):
```bash
# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/사용자명/저장소명.git
git branch -M main
git push -u origin main
```

2. **Vercel 웹사이트 접속**:
   - https://vercel.com 방문
   - "Import Project" 클릭
   - GitHub 저장소 선택

3. **환경 변수 설정**:
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` = `AIzaSyDVn3ur-mABpiRzt4cl2kZdh0GRoqsTe9Y`

4. **Deploy 클릭**

---

## 배포 후 할 일

### 1. 환경 변수 확인
Vercel 대시보드 → Settings → Environment Variables에서 확인:
- ✅ `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 2. 도메인 확인
배포가 완료되면 다음과 같은 URL을 받게 됩니다:
- **Production**: `https://hoonjae-travel.vercel.app`
- **Preview**: `https://hoonjae-travel-xxx.vercel.app`

### 3. PWA 기능 테스트
- Chrome에서 접속
- 개발자 도구 → Application 탭
- Service Workers 확인
- "홈 화면에 추가" 테스트

### 4. Google Maps API 키 도메인 설정
Google Cloud Console에서 API 키 제한 설정:
1. https://console.cloud.google.com/apis/credentials 접속
2. API 키 선택
3. "애플리케이션 제한사항" → "HTTP 리퍼러"
4. 웹사이트 제한사항에 추가:
   - `https://hoonjae-travel.vercel.app/*`
   - `https://*.vercel.app/*` (프리뷰 배포용)

---

## 공유 방법

### QR 코드 생성
배포된 URL을 QR 코드로 만들어 여행 동료들에게 공유:
```
https://www.qr-code-generator.com/
```

### 카카오톡/문자로 공유
```
🌴 훈재의 여행 계획표
다낭 여행 일정을 실시간으로 확인하세요!

📱 https://hoonjae-travel.vercel.app

✨ 기능:
- 실시간 여행 진행률
- 활동 체크인
- 지도 및 경로 안내
- 오프라인 지원

💡 모바일에서 "홈 화면에 추가"하면 앱처럼 사용할 수 있어요!
```

### 홈 화면에 추가 안내
**Android (Chrome)**:
1. 웹사이트 접속
2. 메뉴(⋮) → "홈 화면에 추가"
3. 이름 확인 → "추가"

**iOS (Safari)**:
1. 웹사이트 접속
2. 공유 버튼 → "홈 화면에 추가"
3. 이름 확인 → "추가"

---

## 업데이트 방법

코드를 수정한 후 다시 배포:

```bash
# 변경사항 커밋
git add -A
git commit -m "업데이트 내용"

# 배포
vercel --prod
```

또는 GitHub에 푸시하면 자동으로 배포됩니다:
```bash
git push
```

---

## 문제 해결

### 지도가 표시되지 않는 경우
1. Vercel 환경 변수 확인
2. Google Maps API 키 도메인 제한 확인
3. API 키 활성화 상태 확인

### 오프라인이 작동하지 않는 경우
1. HTTPS로 접속 확인 (Vercel은 자동 HTTPS)
2. Service Worker 등록 확인 (개발자 도구)
3. 캐시 초기화 후 재시도

### 빌드 에러가 발생하는 경우
```bash
# 로컬에서 빌드 테스트
npm run build

# 에러 확인 후 수정
vercel --prod
```

---

## 비용

- **Vercel**: 개인 프로젝트는 **무료**
- **Google Maps API**: 월 $200 무료 크레딧 (일반 사용 시 충분)

---

## 보안 팁

1. `.env.local`은 절대 Git에 커밋하지 마세요
2. Google Maps API 키는 도메인 제한 설정
3. Vercel 환경 변수로 민감한 정보 관리

---

**🎉 배포 완료 후 여행 동료들에게 공유하세요!**
