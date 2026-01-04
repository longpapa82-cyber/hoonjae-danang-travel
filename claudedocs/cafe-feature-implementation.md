# 카페 기능 구현 완료

## 구현 일시
2026-01-04

## 개요
다낭 여행 중 쉽게 찾아갈 수 있도록 호텔 주변 12개 카페 정보를 "편의시설 보기" 기능에 추가했습니다.

## 추가된 카페 목록

### 스페셜티 커피 (7개)
1. **XLIII Specialty Coffee** (43 스페셜티 커피)
   - 주소: Lot 422 Ngo Thi Si, My An
   - GPS: 16.0480106, 108.2460812 ✅
   - 영업: 07:00-21:30
   - 특징: 43 Factory Coffee Roaster 본점, 자체 로스팅

2. **Puna Specialty Coffee & Eatery** (푸나 스페셜티 커피)
   - 주소: 132 Lê Quang Đạo, Bắc Mỹ An
   - GPS: 16.0485, 108.2465 ⚠️ TODO
   - 영업: 07:00-22:00
   - 특징: 스페셜티 커피 & 브런치

3. **Zi Coffee & Roastery** (Z! 커피 로스터리)
   - 주소: 109 Hoàng Kế Viêm, Bắc Mỹ Phú
   - GPS: 16.0490, 108.2470 ⚠️ TODO
   - 영업: 07:00-22:00
   - 특징: 자체 로스팅 커피 & 호스텔

4. **Roost Coffee Roasters** (루스트 커피 로스터스)
   - 주소: 57 Bà Huyện Thanh Quan, Bắc Mỹ An
   - GPS: 16.0475, 108.2455 ⚠️ TODO
   - 영업: 07:00-21:30
   - 특징: 자가 농장 보유, 로스팅 전문

5. **SIX ON SIX CAFE** (식스 온 식스 카페)
   - 주소: 64 Bà Huyện Thanh Quan, Phường Mỹ An
   - GPS: 16.0478, 108.2458 ⚠️ TODO
   - 영업: 07:30-22:00
   - 전화: +84 946 114 967
   - 특징: 100% 아라비카 스페셜티 커피 & 브런치

6. **Passion Café** (패션 카페)
   - 주소: Da Nang City Center
   - GPS: 16.0470, 108.2200 ⚠️ TODO
   - 영업: 08:00-22:00
   - 특징: 조용한 분위기

7. **The Cups Coffee Roastery** (더 컵스 커피 로스터리)
   - 주소: Lô B20, 22 Đường 2 Tháng 9, Hòa Thuận Đông
   - GPS: 16.0470, 108.2215 ⚠️ TODO
   - 영업: 07:00-23:00
   - 특징: 다낭 로컬 체인, 용다리 & 한강 근처

### 스타벅스 (5개)
8. **Starbucks Bach Dang** (스타벅스 바흐당)
   - 주소: 50 Bach Dang (Hilton Complex)
   - GPS: 16.0700, 108.2240 ⚠️ TODO
   - 영업: 07:00-22:00
   - 특징: 2018년 다낭 첫 오픈

9. **Starbucks Vincom Ngo Quyen** (스타벅스 빈컴 응오꾸옌)
   - 주소: 910A Ngo Quyen, Son Tra (Vincom Center L1)
   - GPS: 16.071857, 108.23042 ✅
   - 영업: 07:00-22:00
   - 특징: Vincom Plaza 내 위치

10. **Starbucks Trần Hưng Đạo** (스타벅스 쩐훙다오)
    - 주소: 218 Trần Hưng Đạo, Quận Sơn Trà
    - GPS: 16.0705, 108.2255 ⚠️ TODO
    - 영업: 07:00-22:00
    - 특징: 2023년 11월 오픈

11. **Starbucks Nesta Hotel** (스타벅스 네스타 호텔)
    - 주소: 268 Vo Nguyen Giap, Ngu Hanh Son (Nesta Hotel)
    - GPS: 16.040422, 108.25163 ✅
    - 영업: 07:00-22:00
    - 특징: 미케 비치 뷰, 2023년 7월 오픈

12. **Starbucks Lotte Đà Nẵng** (스타벅스 롯데 다낭)
    - 주소: 6 Nai Nam, Hoa Cuong Bac (Lotte Mart 2F)
    - GPS: 16.03423, 108.22931 ✅
    - 영업: 08:00-22:00
    - 특징: 롯데마트 2층

## 기술 구현 내용

### 1. 타입 정의 확장 (`types/amenity.ts`)
- `AmenityCategory`에 'CAFE' 추가
- `CafeSubType` 추가: SPECIALTY, CHAIN, BRUNCH, ROASTERY
- `Amenity` 인터페이스에 `subType?: CafeSubType` 추가
- `AmenityCategoryInfo`에 `color?: string` 추가

### 2. 데이터 추가 (`lib/amenities.ts`)
- 12개 카페 데이터 추가 (4개 정확한 GPS, 8개 TODO 표시)
- AMENITY_CATEGORIES에 카페 카테고리 추가 (☕, 주황색 #F59E0B)

### 3. UI 업데이트
#### MapView.tsx
- 카페 마커 색상: 주황색 (#F59E0B)
- InfoWindow에 카페 이모지 (☕) 추가
- 범례에 카페 항목 추가

#### AmenitiesBottomSheet.tsx
- AMENITY_CATEGORIES 배열 사용으로 자동으로 카페 탭 추가됨

## 사용 방법
1. 지도 페이지에서 "편의시설 보기" 버튼 클릭
2. 카테고리 탭에서 "☕ 카페" 선택
3. 호텔로부터 가까운 순서로 정렬된 카페 목록 확인
4. 원하는 카페 선택 후 "길찾기" 버튼으로 네비게이션 앱 연결

## TODO: GPS 좌표 확인 필요
다음 8개 카페는 근사치 좌표를 사용하고 있으며, 정확한 좌표 확인이 필요합니다:

1. Puna Specialty Coffee (132 Lê Quang Đạo)
2. Zi Coffee & Roastery (109 Hoàng Kế Viêm)
3. Roost Coffee Roasters (57 Bà Huyện Thanh Quan)
4. SIX ON SIX CAFE (64 Bà Huyện Thanh Quan)
5. Passion Café (주소 미확인)
6. The Cups Coffee Roastery (Lô B20, 22 Đường 2 Tháng 9)
7. Starbucks Bach Dang (50 Bach Dang)
8. Starbucks Trần Hưng Đạo (218 Trần Hưng Đạo)

**좌표 확인 방법:**
1. Google Maps에서 주소 검색
2. 마커 우클릭 → "이곳이 궁금한가요?" 선택
3. 표시된 좌표를 `lib/amenities.ts`에 업데이트

## 파일 변경 사항
- `types/amenity.ts` - 타입 정의 확장
- `lib/amenities.ts` - 카페 데이터 및 카테고리 추가
- `components/MapView.tsx` - 카페 마커 및 범례 추가
- `components/AmenitiesBottomSheet.tsx` - 변경사항 없음 (자동 적용)

## 테스트 상태
✅ TypeScript 컴파일 성공
✅ Next.js 개발 서버 실행 확인
⏳ 실제 지도에서 카페 마커 표시 확인 필요
⏳ 카페 탭 동작 확인 필요
⏳ 길찾기 기능 테스트 필요
