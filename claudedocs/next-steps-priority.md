# 다음 작업 우선순위

**작성 일시**: 2026-01-10
**여행 출발일**: 2026-01-15 (목) 13:00
**남은 시간**: D-5일

---

## 🔴 Critical (여행 전 필수) - D-5일 이내 완료

### 1. 프로덕션 배포 및 검증 ⚠️ URGENT

**소요 시간**: 30분
**중요도**: ⭐⭐⭐⭐⭐

**작업 내용**:
- [x] 빌드 성공 확인
- [ ] Vercel 프로덕션 배포
- [ ] 배포 후 smoke test (final-validation.spec.ts 재실행)
- [ ] 환경 변수 검증 (OPENWEATHERMAP_API_KEY, Google Maps)
- [ ] Service Worker 등록 확인
- [ ] PWA manifest 로드 확인

**왜 중요한가**:
- 여행 중 앱 사용을 위해 프로덕션 환경 필수
- 환경 변수 문제는 사전 발견 필요 (이전 트러블슈팅 경험)
- 배포 실패 시 대응 시간 필요

**검증 방법**:
```bash
# 1. 빌드
npm run build

# 2. 배포
vercel --prod

# 3. 검증
npx playwright test tests/final-validation.spec.ts --project=chromium-desktop
```

---

### 2. 실제 모바일 기기 테스트 📱

**소요 시간**: 1-2시간
**중요도**: ⭐⭐⭐⭐⭐

**작업 내용**:
- [ ] Android 기기에서 PWA 설치 테스트
- [ ] iOS 기기에서 PWA 설치 테스트
- [ ] 오프라인 모드 실제 테스트 (비행기 모드)
- [ ] GPS 위치 추적 테스트
- [ ] 배터리 소모 측정 (2-3시간 사용)
- [ ] 네트워크 전환 테스트 (Wi-Fi ↔ 모바일 데이터)

**테스트 체크리스트**:

**Android (Chrome)**:
- [ ] 앱 설치 프롬프트 표시
- [ ] 홈 화면 아이콘 추가
- [ ] Standalone 모드 실행
- [ ] Shortcuts 동작 (홈/지도/일정)
- [ ] 오프라인 상태 표시기
- [ ] Service Worker 캐싱
- [ ] 비행기 모드에서 앱 실행
- [ ] Google Maps 로드
- [ ] 날씨 정보 표시
- [ ] GPS 위치 추적 (지도 탭)

**iOS (Safari)**:
- [ ] "홈 화면에 추가" 메뉴
- [ ] Apple touch icon 표시
- [ ] Standalone 모드 실행
- [ ] 상태바 스타일 적용
- [ ] 오프라인 모드 동작
- [ ] Service Worker 등록 (iOS 제한 확인)
- [ ] 나머지 기능 Android와 동일

**왜 중요한가**:
- Playwright 테스트는 시뮬레이션일 뿐
- 실제 기기에서만 발견되는 문제 존재
- 여행 중 사용할 실제 환경 검증

---

### 3. 오프라인 데이터 사전 캐싱 📦

**소요 시간**: 10분
**중요도**: ⭐⭐⭐⭐

**작업 내용**:
- [ ] 여행 출발 전날 Wi-Fi 환경에서 앱 방문
- [ ] 모든 탭 한 번씩 방문 (홈/지도/일정)
- [ ] 날씨 정보 로드 확인
- [ ] Service Worker 캐시 확인 (개발자 도구)
- [ ] localStorage 데이터 확인
- [ ] 비행기 모드로 전환하여 동작 확인

**검증 방법**:
```
1. https://hoonjae-danang-travel.vercel.app 접속
2. 개발자 도구 → Application → Service Workers
   - Status: activated
   - Source: /sw.js
3. Application → Cache Storage
   - danang-travel-cache-v1 존재 확인
   - 캐시된 리소스 목록 확인
4. Application → Local Storage
   - weather_current 존재 확인
5. 비행기 모드 → 앱 새로고침 → 정상 작동 확인
```

**왜 중요한가**:
- 비행기 안에서 오프라인 사용 필수
- 사전 캐싱 없으면 오프라인 모드 무용지물
- 여행 당일 공항 Wi-Fi가 느릴 수 있음

---

## 🟡 High (여행 중 유용) - 가능하면 완료

### 4. 에러 추적 및 모니터링 설정 📊

**소요 시간**: 1시간
**중요도**: ⭐⭐⭐⭐

**작업 내용**:
- [ ] Vercel Analytics 활성화 (무료)
- [ ] 콘솔 에러 로깅 개선
- [ ] Critical 에러 알림 설정 (선택)
- [ ] 사용자 행동 추적 (페이지뷰, 탭 전환)

**구현 방법**:

**Vercel Analytics**:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**콘솔 에러 수집**:
```typescript
// app/layout.tsx
useEffect(() => {
  window.addEventListener('error', (e) => {
    console.error('[Global Error]', e.error);
    // 선택: 서버로 전송
  });

  window.addEventListener('unhandledrejection', (e) => {
    console.error('[Unhandled Promise]', e.reason);
  });
}, []);
```

**왜 중요한가**:
- 여행 중 문제 발생 시 원인 파악 필요
- 사용자 행동 패턴 이해
- 향후 개선 방향 결정

**우선순위 조정**:
- 시간 부족 시 → 여행 후 구현 가능
- Vercel Analytics만이라도 활성화 권장 (5분)

---

### 5. README.md 사용자 가이드 업데이트 📖

**소요 시간**: 30분
**중요도**: ⭐⭐⭐

**작업 내용**:
- [ ] PWA 설치 방법 안내 추가
- [ ] 오프라인 모드 사용법
- [ ] 여행 전 준비사항
- [ ] 트러블슈팅 가이드
- [ ] 환경 변수 설정 문서화

**추가할 섹션**:
```markdown
## 📱 여행 전 준비사항

### 1. 앱 설치 (권장)
- Android: ...
- iOS: ...

### 2. 오프라인 데이터 캐싱
- 출발 전날 Wi-Fi 환경에서...

### 3. 배터리 절약 팁
- GPS는 지도 탭에서만 사용...

## 🆘 트러블슈팅
- 날씨 정보가 안 나와요 → ...
- 지도가 로드되지 않아요 → ...
```

**왜 중요한가**:
- 다른 사용자도 사용 가능 (공유 시)
- 자신도 나중에 참고 가능
- 문제 발생 시 빠른 해결

---

### 6. 백업 및 복구 전략 💾

**소요 시간**: 30분
**중요도**: ⭐⭐⭐

**작업 내용**:
- [ ] 중요 데이터 식별 (체크인 기록, 일정 변경)
- [ ] localStorage 백업 스크립트
- [ ] 수동 내보내기/가져오기 기능 (JSON)
- [ ] Git commit으로 버전 관리

**구현 방법**:

**수동 백업 (간단)**:
```typescript
// 개발자 도구 콘솔에서 실행
const backup = {
  weather: localStorage.getItem('weather_current'),
  checkins: localStorage.getItem('checkins'),
  settings: localStorage.getItem('app-settings'),
  timestamp: new Date().toISOString()
};
console.log(JSON.stringify(backup));
// 출력된 JSON을 복사하여 저장
```

**복구**:
```typescript
const backup = { /* 저장한 JSON */ };
Object.entries(backup).forEach(([key, value]) => {
  if (key !== 'timestamp') {
    localStorage.setItem(key, value);
  }
});
```

**왜 중요한가**:
- 데이터 손실 방지
- 기기 변경 시 데이터 이동
- 문제 발생 시 복구 가능

**우선순위 조정**:
- 시간 부족 시 → 수동 백업 방법만 메모

---

## 🟢 Medium (여행 후 개선) - 여행 후 천천히

### 7. 성능 최적화 ⚡

**소요 시간**: 2-3시간
**중요도**: ⭐⭐⭐

**작업 내용**:
- [ ] Lighthouse 성능 점수 개선 (현재 78 → 목표 90+)
- [ ] 이미지 최적화 (WebP, lazy loading)
- [ ] 코드 스플리팅 개선
- [ ] First Contentful Paint (FCP) 개선
- [ ] Time to Interactive (TTI) 개선

**현재 성능**:
- Performance: 78/100
- Accessibility: 95/100
- Best Practices: 96/100
- SEO: 100/100

**개선 전략**:
1. 큰 이미지 압축 (public/images/)
2. Google Maps lazy loading
3. Framer Motion 최적화
4. Font loading 최적화

**왜 낮은 우선순위인가**:
- 현재 성능도 충분히 사용 가능
- 여행 중 사용에 큰 영향 없음
- 여행 후 천천히 개선 가능

---

### 8. 접근성 개선 (WCAG 2.1 AAA) ♿

**소요 시간**: 2-3시간
**중요도**: ⭐⭐

**작업 내용**:
- [ ] Color contrast 개선 (AAA 기준)
- [ ] Focus indicators 강화
- [ ] Screen reader 최적화
- [ ] 키보드 네비게이션 완전 지원
- [ ] ARIA labels 추가

**현재 상태**:
- WCAG 2.1 AA 준수 (95%)
- 일부 AAA 기준 미달

**왜 낮은 우선순위인가**:
- 개인 사용 앱 (접근성 요구 낮음)
- AA 기준 이미 준수
- 여행과 직접 관련 없음

---

### 9. 추가 UX 개선 🎨

**소요 시간**: 1-2시간
**중요도**: ⭐⭐

**작업 내용**:
- [ ] 오프라인 전용 페이지
- [ ] PWA 설치 후 환영 메시지
- [ ] 네트워크 품질 표시 (slow-2g, 2g, 3g, 4g)
- [ ] 데이터 절약 모드
- [ ] 설치 가이드 튜토리얼

**왜 낮은 우선순위인가**:
- Nice to have 기능
- 현재 UX도 충분
- 여행 후 사용자 피드백 반영하여 개선

---

## 🔵 Low (장기 계획) - 여행 이후

### 10. Push Notifications 🔔

**소요 시간**: 3-4시간
**중요도**: ⭐

**작업 내용**:
- [ ] Push Notification API 구현
- [ ] Service Worker push 이벤트 처리
- [ ] 알림 권한 요청 UI
- [ ] 다음 일정 알림 (출발 30분 전)
- [ ] 날씨 변화 알림

**왜 낮은 우선순위인가**:
- 구현 복잡도 높음
- 서버 인프라 필요 (Push server)
- 여행 기간 짧아서 필요성 낮음

---

### 11. Background Sync 🔄

**소요 시간**: 2-3시간
**중요도**: ⭐

**작업 내용**:
- [ ] Background Sync API 구현
- [ ] 오프라인 중 변경사항 저장
- [ ] 온라인 복구 시 자동 동기화
- [ ] Conflict resolution

**왜 낮은 우선순위인가**:
- 현재 데이터는 읽기 전용 (일정)
- 체크인 기록은 localStorage로 충분
- 복잡도 대비 효용 낮음

---

### 12. Web Share API 📤

**소요 시간**: 1시간
**중요도**: ⭐

**작업 내용**:
- [ ] 여행 진행률 공유 기능
- [ ] 현재 위치 공유
- [ ] 일정 공유 (텍스트/이미지)
- [ ] SNS 공유 버튼

**왜 낮은 우선순위인가**:
- Nice to have 기능
- 개인 사용이 주목적
- 여행 후 추가 가능

---

## 📋 우선순위 요약

### 여행 전 필수 (D-5일 이내)
```
1. ⚠️  프로덕션 배포 및 검증 (30분) - URGENT
2. 📱 실제 모바일 기기 테스트 (1-2시간)
3. 📦 오프라인 데이터 사전 캐싱 (10분)
```

### 가능하면 완료 (D-3일 이내)
```
4. 📊 에러 추적 및 모니터링 (1시간)
5. 📖 README.md 사용자 가이드 (30분)
6. 💾 백업 및 복구 전략 (30분)
```

### 여행 후 개선
```
7. ⚡ 성능 최적화 (2-3시간)
8. ♿ 접근성 개선 (2-3시간)
9. 🎨 추가 UX 개선 (1-2시간)
```

### 장기 계획
```
10. 🔔 Push Notifications (3-4시간)
11. 🔄 Background Sync (2-3시간)
12. 📤 Web Share API (1시간)
```

---

## 🎯 권장 실행 순서

### Day 1 (오늘, 2026-01-10)
```
✅ 완료: Service Worker, PWA, 오프라인 모드, UX 개선
🔲 남은 작업:
  1. 프로덕션 배포 (30분)
  2. 배포 검증 (10분)
  3. (선택) Vercel Analytics 활성화 (5분)
```

### Day 2 (2026-01-11)
```
1. 실제 모바일 기기 테스트 (1-2시간)
   - Android 기기 테스트
   - iOS 기기 테스트
2. 발견된 문제 수정 (필요 시)
3. README.md 업데이트 (30분)
```

### Day 3 (2026-01-12)
```
1. 에러 추적/모니터링 설정 (1시간)
2. 백업 전략 수립 (30분)
3. 최종 점검
```

### Day 4-5 (2026-01-13 ~ 14)
```
1. 여유 시간 (문제 대응)
2. 출발 전날: 오프라인 데이터 캐싱
3. 앱 설치 (Android/iOS)
```

### 여행 중 (2026-01-15 ~ 19)
```
📱 앱 사용 및 피드백 수집
```

### 여행 후 (2026-01-20 ~)
```
1. 성능 최적화
2. 접근성 개선
3. 추가 UX 개선
4. 장기 계획 검토
```

---

## 🚨 위험 요소 및 대응 방안

### Risk 1: 프로덕션 배포 실패
**확률**: 낮음 (10%)
**영향**: 높음
**대응**:
- 빌드 성공 확인됨
- 이전 배포 성공 이력
- 환경 변수 검증 완료

### Risk 2: 모바일 기기 호환성 문제
**확률**: 중간 (30%)
**영향**: 높음
**대응**:
- 조기 테스트 (D-4일 전)
- 대체 방안: 웹 브라우저 사용
- 핵심 기능만 우선 검증

### Risk 3: 네트워크 환경 차이
**확률**: 높음 (50%)
**영향**: 중간
**대응**:
- 오프라인 모드 완전 구현됨
- 사전 데이터 캐싱
- Service Worker 안정성 검증 완료

### Risk 4: 배터리 소모
**확률**: 중간 (40%)
**영향**: 중간
**대응**:
- GPS 최적화 완료
- Battery Saver 모드 구현
- 보조 배터리 지참

---

## ✅ 최종 체크리스트

### 배포 전
- [ ] 프로덕션 빌드 성공
- [ ] 환경 변수 확인
- [ ] Vercel 배포
- [ ] Smoke test 통과

### 여행 전
- [ ] Android 기기 테스트
- [ ] iOS 기기 테스트
- [ ] 오프라인 모드 검증
- [ ] 앱 설치 완료

### 여행 중
- [ ] 데이터 캐싱 확인
- [ ] GPS 위치 추적 동작
- [ ] 배터리 관리
- [ ] 피드백 수집

---

**문서 버전**: 1.0
**최종 업데이트**: 2026-01-10
**작성자**: Claude Code (SuperClaude)
**다음 액션**: #1 프로덕션 배포 및 검증
