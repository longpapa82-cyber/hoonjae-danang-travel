# GPS 좌표 수동 확인 가이드

생성일: 2026-01-09

## 개요
다음 6개 카페의 GPS 좌표를 Google Maps에서 수동으로 확인이 필요합니다.

---

## 확인이 필요한 카페 목록

### 1. Zi Coffee & Roastery (Z! 커피 로스터리)
- **현재 좌표**: 16.0490, 108.2470 (근사치)
- **주소**: 109 Hoàng Kế Viêm, Bắc Mỹ Phú, Ngũ Hành Sơn, Da Nang
- **Google Maps 검색어**: `Zi Coffee & Roastery 109 Hoàng Kế Viêm Da Nang`
- **파일 위치**: `lib/amenities.ts:322-323`

### 2. SIX ON SIX CAFE (식스 온 식스 카페)
- **현재 좌표**: 16.0478, 108.2458 (근사치)
- **주소**: 64 Bà Huyện Thanh Quan, Phường Mỹ An, Ngũ Hành Sơn, Da Nang
- **Google Maps 검색어**: `SIX ON SIX CAFE 64 Bà Huyện Thanh Quan Da Nang`
- **전화**: +84 946 114 967
- **파일 위치**: `lib/amenities.ts:350-351`

### 3. Passion Café (패션 카페)
- **현재 좌표**: 16.0470, 108.2200 (근사치)
- **주소**: Da Nang City Center (구체적 주소 미확인)
- **Google Maps 검색어**: `Passion Café Da Nang specialty coffee`
- **파일 위치**: `lib/amenities.ts:365-366`
- **⚠️ 주의**: 웹 검색에서 존재 확인 안 됨. 카페가 폐업했거나 이름이 변경되었을 가능성

### 4. The Cups Coffee Roastery (더 컵스 커피 로스터리)
- **현재 좌표**: 16.0470, 108.2215 (근사치)
- **주소**: Lô B20, 22 Đường 2 Tháng 9, Hòa Thuận Đông, Hải Châu, Da Nang
- **Google Maps 검색어**: `The Cups Coffee Roastery Lô B20 22 Đường 2 Tháng 9 Da Nang`
- **파일 위치**: `lib/amenities.ts:379-380`

### 5. Starbucks Bach Dang (스타벅스 바흐당)
- **현재 좌표**: 16.0700, 108.2240 (근사치)
- **주소**: 50 Bach Dang, Hoa Thuan Dong, Hai Chau, Da Nang (Hilton Complex)
- **Google Maps 검색어**: `Starbucks 50 Bach Dang Hilton Da Nang`
- **파일 위치**: `lib/amenities.ts:395-396`
- **참고**: Hilton Da Nang 호텔 내부 또는 인근

### 6. Starbucks Trần Hưng Đạo (스타벅스 쩐훙다오)
- **현재 좌표**: 16.0705, 108.2255 (근사치)
- **주소**: 218 Trần Hưng Đạo, Quận Sơn Trà, Da Nang
- **Google Maps 검색어**: `Starbucks 218 Trần Hưng Đạo Da Nang`
- **영업시간**: 07:00-22:00
- **파일 위치**: `lib/amenities.ts:423-424`
- **참고**: 2023년 11월 오픈

---

## 좌표 확인 방법

### 방법 1: Google Maps 웹사이트 사용

1. **Google Maps 접속**
   - https://www.google.com/maps 방문

2. **주소 또는 카페 이름 검색**
   - 위 검색어를 복사하여 검색창에 입력
   - 예: `Zi Coffee & Roastery 109 Hoàng Kế Viêm Da Nang`

3. **마커 위치 확인**
   - 검색 결과에서 정확한 위치를 지도에서 확인
   - 마커가 여러 개 있다면 주소를 확인하여 정확한 위치 선택

4. **좌표 추출**
   - **방법 A**: 마커를 우클릭 → "이곳이 궁금한가요?" 선택
   - **방법 B**: URL에서 좌표 확인 (예: `@16.0434661,108.2439784`)
   - **방법 C**: 정보 패널에서 좌표 복사

5. **좌표 형식 확인**
   - 형식: `위도(latitude), 경도(longitude)`
   - 예: `16.0477441, 108.2432242`
   - 다낭 지역 범위: 위도 16.0~16.1, 경도 108.1~108.3

### 방법 2: Google Maps 모바일 앱 사용

1. **앱에서 카페 검색**
2. **위치 마커를 길게 누르기**
3. **화면 하단에 나타나는 좌표 복사**

---

## 좌표 업데이트 방법

### 1. 파일 열기
```bash
# VS Code 또는 텍스트 에디터로 열기
code lib/amenities.ts
```

### 2. 해당 카페 찾기
- Cmd+F (Mac) 또는 Ctrl+F (Windows)로 카페 이름 검색
- 예: "Zi Coffee"

### 3. 좌표 수정
```typescript
// 수정 전
location: {
  latitude: 16.0490, // TODO: 정확한 좌표 확인 필요
  longitude: 108.2470,
  address: '109 Hoàng Kế Viêm, Bắc Mỹ Phú, Ngũ Hành Sơn, Da Nang',
},

// 수정 후 (예시)
location: {
  latitude: 16.0489123, // ✅ Google Maps에서 확인한 정확한 좌표
  longitude: 108.2471456,
  address: '109 Hoàng Kế Viêm, Bắc Mỹ Phú, Ngũ Hành Sơn, Da Nang',
},
```

### 4. TODO 주석 제거
- `// TODO: 정확한 좌표 확인 필요` 주석 제거
- 또는 `// ✅ Google Maps에서 확인한 정확한 좌표`로 변경

---

## 검증 방법

### 1. 빌드 테스트
```bash
npm run build
```

### 2. 개발 서버에서 확인
```bash
npm run dev
# http://localhost:3000 접속
# 지도 탭 → 편의시설 보기 → 카페 탭에서 위치 확인
```

### 3. 거리 순서 확인
- 카페 목록이 호텔(16.0583, 108.2226)로부터 가까운 순서로 정렬되는지 확인
- 거리 정보가 합리적인지 확인 (예: 1-5km 범위)

---

## 주의사항

### ⚠️ Passion Café
- 웹 검색에서 존재를 확인할 수 없었음
- Google Maps에서도 찾을 수 없다면:
  1. 카페가 폐업했을 가능성
  2. 이름이 변경되었을 가능성
  3. 데이터에서 제거 고려

### 📍 좌표 정확도
- 소수점 6-7자리까지 입력 (미터 단위 정확도)
- 예: 16.0477441 (Good), 16.04 (Too rough)

### 🔄 일관성 유지
- 롯데마트와 스타벅스 롯데는 같은 건물이므로 동일한 좌표 사용
- 같은 건물에 여러 시설이 있다면 좌표 통일

---

## 완료 체크리스트

- [ ] Zi Coffee & Roastery 좌표 확인 및 업데이트
- [ ] SIX ON SIX CAFE 좌표 확인 및 업데이트
- [ ] Passion Café 존재 확인 또는 삭제 결정
- [ ] The Cups Coffee Roastery 좌표 확인 및 업데이트
- [ ] Starbucks Bach Dang 좌표 확인 및 업데이트
- [ ] Starbucks Trần Hưng Đạo 좌표 확인 및 업데이트
- [ ] `npm run build` 성공 확인
- [ ] 개발 서버에서 지도 표시 확인
- [ ] Git 커밋 및 푸시
- [ ] Vercel 프로덕션 배포 확인

---

## 참고 링크

- [Google Maps](https://www.google.com/maps)
- [Lat Long Finder](https://www.latlong.net/)
- [GPS Coordinates](https://gps-coordinates.org/)

---

**생성 도구**: Claude Code
**마지막 업데이트**: 2026-01-09
