# Vercel 환경 변수 문제 해결 보고서

**작성 일시**: 2026-01-10
**문제 기간**: 약 2시간
**해결 상태**: ✅ 완료

---

## 📋 문제 요약

Vercel Production 환경에서 `OPENWEATHERMAP_API_KEY` 환경 변수가 런타임에 전달되지 않아 날씨 API가 500 에러를 반환하는 문제 발생.

### 증상
- API 응답: `{"success": false, "error": "Weather API key not configured"}`
- 진단 결과: `process.env.OPENWEATHERMAP_API_KEY === undefined`
- 영향: 날씨 카드가 "날씨 정보를 불러올 수 없습니다" 에러 표시

---

## 🔍 근본 원인 분석

### 발견된 원인
**중복 Vercel 프로젝트 문제**

사용자 계정에 동일한 코드베이스를 배포하는 **두 개의 Vercel 프로젝트**가 존재:

1. **`danang-travel-tracker`**
   - URL: https://danang-travel-tracker.vercel.app
   - 환경 변수: ✅ 설정됨
   - 상태: 정상 작동

2. **`hoonjae-danang-travel`**
   - URL: https://hoonjae-danang-travel.vercel.app
   - 환경 변수: ❌ 미설정
   - 상태: 500 에러

### 왜 문제가 발생했는가?

1. 환경 변수를 `danang-travel-tracker` 프로젝트에만 설정
2. 테스트는 `hoonjae-danang-travel.vercel.app` URL로 수행
3. 결과: 환경 변수가 없는 프로젝트를 테스트하여 계속 실패

---

## 🛠️ 해결 과정

### 1단계: 초기 진단
- ✅ Vercel CLI로 환경 변수 추가 시도 → 실패 (대화형 프롬프트 문제)
- ✅ Vercel 대시보드에서 수동 설정 → 여전히 실패
- ✅ 여러 번 재배포 시도 → 문제 지속

### 2단계: 심화 진단
- ✅ 진단 API 엔드포인트 생성 (`/api/debug/env`)
- ✅ Weather API에 진단 정보 추가
- 🎯 **핵심 발견**: Production 환경에서 모든 환경 변수가 비어있음
  ```json
  {
    "debug": {
      "env": "production",
      "hasPublicLat": false,
      "hasPublicLon": false,
      "allWeatherKeys": []
    }
  }
  ```

### 3단계: 근본 원인 식별
- ✅ `vercel project ls` 실행
- 🎯 **발견**: 두 개의 프로젝트가 존재
- ✅ `danang-travel-tracker.vercel.app`에서 테스트 → **성공!**
  ```json
  {
    "success": true,
    "data": {
      "temp": 21,
      "condition": "튼구름"
    }
  }
  ```

### 4단계: 최종 해결
1. `hoonjae-danang-travel` 프로젝트에 환경 변수 추가:
   - `OPENWEATHERMAP_API_KEY`: `4b1827e7a5ea3c62a98a7884840c6ecf`
   - `NEXT_PUBLIC_DANANG_LAT`: `16.0544`
   - `NEXT_PUBLIC_DANANG_LON`: `108.2022`

2. Redeploy 실행

3. 검증:
   ```bash
   curl https://hoonjae-danang-travel.vercel.app/api/weather/current
   # → {"success": true, "data": {...}}
   ```

---

## ✅ 최종 검증 결과

### Playwright 테스트 (final-validation.spec.ts)

**전체 결과**: 19/19 테스트 통과 (100%)

#### 프로덕션 환경 검증
- ✅ 프로덕션 사이트 접근 (200 OK)
- ✅ 페이지 타이틀 확인
- ✅ 필수 메타 태그 존재

#### 핵심 사용자 시나리오
- ✅ 시나리오 1: 여행 정보 확인 (홈 → 날씨 → 일정)
- ✅ 시나리오 2: 지도 확인
- ✅ 시나리오 3: 다크모드 전환
- ✅ 시나리오 4: 모바일 사용자 경험

#### 크리티컬 패스
- ✅ 날씨 API 응답 (200 OK)
- ✅ 하단 네비게이션 동작
- ✅ 치명적 에러 없음

#### 성능 기준
- ✅ 페이지 로딩: 2.17초 (< 10초)
- ✅ 주요 콘텐츠 표시: 149ms (< 5초)
- ✅ 탭 전환 응답: 147ms (< 1초)

#### 배포 승인 체크리스트
- ✅ [1/5] 홈페이지 로드 성공
- ✅ [2/5] 날씨 기능 작동
- ✅ [3/5] 탭 네비게이션 작동
- ✅ [4/5] 모바일 반응형 작동
- ✅ [5/5] 접근성 기본 준수

### 🎉 배포 승인: APPROVED ✅
**모든 검증 항목 통과 (100%)**

---

## 📚 교훈 및 권장 사항

### 배운 점
1. **프로젝트 중복 확인**: 같은 코드베이스를 여러 Vercel 프로젝트에 배포하면 혼란 발생
2. **환경 변수 전파**: `NEXT_PUBLIC_*` 변수는 빌드 타임에 코드에 삽입되므로, 환경 변수 설정 후 반드시 재배포 필요
3. **진단 도구의 중요성**: 런타임 환경 변수 상태를 확인할 수 있는 진단 API가 문제 해결에 결정적 도움

### 권장 사항

#### 프로젝트 관리
- [ ] 중복 프로젝트 정리 (선택: `danang-travel-tracker` 또는 `hoonjae-danang-travel`)
- [ ] 사용하지 않는 프로젝트 삭제
- [ ] 프로젝트 이름 표준화

#### 환경 변수 관리
- [ ] 모든 Vercel 프로젝트에 일관된 환경 변수 설정
- [ ] 환경 변수 변경 시 자동 재배포 워크플로우 구축
- [ ] `.env.example` 파일 업데이트하여 필수 환경 변수 문서화

#### 모니터링
- [ ] Vercel Analytics 활성화
- [ ] 에러 추적 도구 연동 (예: Sentry)
- [ ] 환경 변수 누락 시 알림 설정

---

## 📊 타임라인

| 시간 | 활동 | 결과 |
|------|------|------|
| 17:00 | 문제 발견 | 날씨 API 500 에러 |
| 17:10 | 환경 변수 설정 (danang-travel-tracker) | 여전히 실패 |
| 17:30 | Vercel CLI로 재시도 | 실패 |
| 18:00 | 진단 API 생성 | 환경 변수 비어있음 확인 |
| 18:30 | 프로젝트 중복 발견 | 근본 원인 식별 |
| 18:40 | hoonjae-danang-travel에 환경 변수 추가 | 성공! |
| 18:50 | 최종 검증 테스트 | 19/19 통과 (100%) |

**총 소요 시간**: 약 2시간
**핵심 해결 시간**: 프로젝트 중복 발견 후 10분

---

## 🔗 관련 파일

- **테스트 계획**: `claudedocs/final-qa-plan.md`
- **테스트 결과**: `claudedocs/test-results-summary.md`
- **Weather API**: `app/api/weather/current/route.ts`
- **Weather Hook**: `hooks/useWeather.tsx`
- **Weather Types**: `types/weather.ts`

---

**문서 버전**: 1.0
**최종 업데이트**: 2026-01-10
**작성자**: Claude Code (SuperClaude)
**상태**: ✅ 해결 완료
