#!/usr/bin/env python3
"""
실제 앱의 DOM을 검사하여 테스트가 찾는 요소들이 존재하는지 확인
"""
from playwright.sync_api import sync_playwright
import time

def inspect_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("🔍 앱 로딩 중...")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        print("\n📸 스크린샷 저장...")
        page.screenshot(path='/tmp/app-home.png', full_page=True)

        print("\n=== 홈 화면 분석 ===")

        # 여행 진척도 관련
        print("\n1️⃣ 여행 진척도 요소:")
        countdown_elements = page.locator('text=/여행까지|D-|진행|%|Day/i').all()
        print(f"   - 카운트다운/진행률 요소: {len(countdown_elements)}개")
        for i, elem in enumerate(countdown_elements[:3]):
            try:
                text = elem.text_content()
                print(f"     [{i+1}] {text[:50]}")
            except:
                pass

        # 활동 관련
        print("\n2️⃣ 활동 표시 요소:")
        activity_keywords = ['공항', '출발', '도착', '호텔', '마사지', '호이안']
        for keyword in activity_keywords:
            count = page.locator(f'text=/{keyword}/i').count()
            print(f"   - '{keyword}': {count}개")

        # 지도 관련
        print("\n3️⃣ 지도 요소:")
        map_iframe = page.locator('iframe[src*="google.com/maps"]').count()
        map_canvas = page.locator('canvas').count()
        map_aria = page.locator('[aria-label*="Map"]').count()
        print(f"   - Google Maps iframe: {map_iframe}개")
        print(f"   - Canvas 요소: {map_canvas}개")
        print(f"   - Map ARIA 레이블: {map_aria}개")

        # 탭 네비게이션
        print("\n4️⃣ 탭 네비게이션:")
        tabs = page.locator('[role="tab"]').all()
        print(f"   - 탭 개수: {len(tabs)}개")
        for i, tab in enumerate(tabs):
            try:
                label = tab.get_attribute('aria-label')
                print(f"     [{i+1}] {label}")
            except:
                pass

        print("\n=== 일정 탭 분석 ===")
        # 일정 탭 클릭
        schedule_tab = page.locator('[role="tab"]').filter(has_text='일정').first()
        if schedule_tab.is_visible():
            schedule_tab.click()
            time.sleep(1)
            page.screenshot(path='/tmp/app-schedule.png', full_page=True)

            print("\n5️⃣ 일정 데이터:")
            # 날짜 확인
            for day in range(1, 6):
                day_text = page.locator(f'text=/^{day}일차/i').count()
                print(f"   - {day}일차: {day_text}개")

            # 시간 표시
            times = ['09:00', '10:00', '13:00', '15:00', '18:30']
            for time_str in times:
                count = page.locator(f'text={time_str}').count()
                print(f"   - {time_str}: {count}개")

            # 상태 속성
            completed = page.locator('[data-status="completed"]').count()
            in_progress = page.locator('[data-status="in_progress"]').count()
            upcoming = page.locator('[data-status="upcoming"]').count()
            print(f"   - data-status='completed': {completed}개")
            print(f"   - data-status='in_progress': {in_progress}개")
            print(f"   - data-status='upcoming': {upcoming}개")

            # 이미지
            images = page.locator('img[src*="image"], img[src*=".png"]').count()
            print(f"   - 이미지: {images}개")

        print("\n=== 지도 탭 분석 ===")
        # 지도 탭 클릭
        map_tab = page.locator('[role="tab"]').filter(has_text='지도').first()
        if map_tab.is_visible():
            map_tab.click()
            time.sleep(2)
            page.screenshot(path='/tmp/app-map.png', full_page=True)

            print("\n6️⃣ 지도 탭:")
            map_elements = page.locator('iframe[src*="google.com/maps"], canvas').count()
            print(f"   - 지도 요소: {map_elements}개")

            route_info = page.locator('text=/경로|거리|소요|목적지/i').count()
            print(f"   - 경로 정보: {route_info}개")

        print("\n=== 설정 탭 분석 ===")
        # 설정 탭 클릭
        settings_tab = page.locator('[role="tab"]').filter(has_text='설정').first()
        if settings_tab.is_visible():
            settings_tab.click()
            time.sleep(1)
            page.screenshot(path='/tmp/app-settings.png', full_page=True)

            print("\n7️⃣ 설정 탭:")
            theme_toggle = page.locator('text=/다크.*모드|테마|Dark/i').count()
            print(f"   - 테마 토글 요소: {theme_toggle}개")

            theme_buttons = page.locator('button:has-text("다크"), button:has-text("Dark"), button:has-text("테마")').count()
            print(f"   - 테마 버튼: {theme_buttons}개")

            # HTML 클래스 확인
            html_class = page.locator('html').get_attribute('class')
            print(f"   - HTML 클래스: {html_class}")

        print("\n✅ 검사 완료!")
        print(f"📸 스크린샷 저장 위치:")
        print(f"   - /tmp/app-home.png")
        print(f"   - /tmp/app-schedule.png")
        print(f"   - /tmp/app-map.png")
        print(f"   - /tmp/app-settings.png")

        browser.close()

if __name__ == "__main__":
    inspect_app()
