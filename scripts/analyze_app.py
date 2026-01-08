"""
애플리케이션 분석 스크립트
모든 화면을 탐색하고 스크린샷을 찍어 테스트 계획 수립에 필요한 정보를 수집합니다.
"""
from playwright.sync_api import sync_playwright
import json
import time

def analyze_application():
    """애플리케이션의 모든 화면을 분석하고 요소를 파악합니다."""

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 720},
            permissions=['geolocation'],
            geolocation={'latitude': 16.0544, 'longitude': 108.2022}  # 다낭 위치
        )
        page = context.new_page()

        # 콘솔 로그 캡처
        console_logs = []
        page.on('console', lambda msg: console_logs.append(f'{msg.type}: {msg.text}'))

        analysis_results = {
            'pages': {},
            'navigation': {},
            'interactive_elements': {}
        }

        print("🚀 애플리케이션 분석 시작...")

        # 1. 홈 페이지 분석
        print("\n📍 홈 페이지 분석 중...")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(2000)

        # 스크린샷
        page.screenshot(path='screenshots/01_home_page.png', full_page=True)

        # 주요 요소 파악
        analysis_results['pages']['home'] = {
            'url': page.url,
            'title': page.title(),
            'h1_elements': [el.text_content() for el in page.locator('h1').all()],
            'buttons': len(page.locator('button').all()),
            'navigation_items': [el.text_content() for el in page.locator('nav button, nav a').all()],
            'cards': len(page.locator('[class*="card"], [class*="Card"]').all()),
        }

        # 2. 네비게이션 바 분석
        print("\n📍 네비게이션 분석 중...")
        nav_buttons = page.locator('nav button, nav a').all()
        nav_items = []
        for btn in nav_buttons:
            nav_items.append({
                'text': btn.text_content().strip(),
                'aria_label': btn.get_attribute('aria-label'),
                'role': btn.get_attribute('role')
            })
        analysis_results['navigation']['items'] = nav_items

        # 3. 지도 페이지 분석
        print("\n📍 지도 페이지 분석 중...")
        map_button = page.locator('nav button, nav a').get_by_text('지도')
        if map_button.count() > 0:
            map_button.click()
            page.wait_for_timeout(3000)
            page.screenshot(path='screenshots/02_map_page.png', full_page=True)

            analysis_results['pages']['map'] = {
                'h1_elements': [el.text_content() for el in page.locator('h1').all()],
                'buttons': [el.text_content().strip() for el in page.locator('button').all() if el.is_visible()],
                'has_google_maps': len(page.locator('[src*="maps.googleapis.com"]').all()) > 0 or len(page.locator('[class*="gm-"]').all()) > 0,
            }

            # 편의시설 버튼 테스트
            amenities_btn = page.get_by_role('button', name='편의시설 보기')
            if amenities_btn.count() > 0:
                print("  ✓ 편의시설 버튼 클릭...")
                amenities_btn.click()
                page.wait_for_timeout(2000)
                page.screenshot(path='screenshots/03_map_amenities.png', full_page=True)

                # 편의시설 탭 분석
                tabs = page.locator('[role="tab"]').all()
                tab_info = [{'text': t.text_content(), 'aria_selected': t.get_attribute('aria-selected')} for t in tabs]
                analysis_results['pages']['map']['amenities_tabs'] = tab_info

        # 4. 일정 페이지 분석
        print("\n📍 일정 페이지 분석 중...")
        schedule_button = page.locator('nav button, nav a').get_by_text('일정')
        if schedule_button.count() > 0:
            schedule_button.click()
            page.wait_for_timeout(2000)
            page.screenshot(path='screenshots/04_schedule_page.png', full_page=True)

            # 일정 항목 파악
            activities = page.locator('[class*="activity"], li').all()
            analysis_results['pages']['schedule'] = {
                'h1_elements': [el.text_content() for el in page.locator('h1').all()],
                'activity_count': len(activities),
                'has_checkin_buttons': len(page.get_by_text('체크인').all()) > 0,
                'status_badges': [el.text_content().strip() for el in page.locator('[class*="badge"]').all()],
            }

        # 5. 설정 페이지 분석
        print("\n📍 설정 페이지 분석 중...")
        settings_button = page.locator('nav button, nav a').get_by_text('설정')
        if settings_button.count() > 0:
            settings_button.click()
            page.wait_for_timeout(2000)
            page.screenshot(path='screenshots/05_settings_page.png', full_page=True)

            analysis_results['pages']['settings'] = {
                'h1_elements': [el.text_content() for el in page.locator('h1').all()],
                'toggle_switches': len(page.locator('button[class*="rounded-full"]').all()),
                'has_theme_options': len(page.get_by_text('라이트').all()) > 0 or len(page.get_by_text('다크').all()) > 0,
            }

        # 6. 모바일 뷰 분석
        print("\n📱 모바일 뷰 분석 중...")
        page.set_viewport_size({'width': 375, 'height': 667})
        page.goto('http://localhost:3000')
        page.wait_for_timeout(2000)
        page.screenshot(path='screenshots/06_mobile_home.png', full_page=True)

        # 7. 다크모드 분석 (설정 페이지에서)
        print("\n🌙 다크모드 분석 중...")
        page.set_viewport_size({'width': 1280, 'height': 720})
        settings_button = page.locator('nav button, nav a').get_by_text('설정')
        if settings_button.count() > 0:
            settings_button.click()
            page.wait_for_timeout(1000)

            # 다크모드 버튼 찾기
            dark_button = page.get_by_text('다크').first()
            if dark_button.count() > 0:
                dark_button.click()
                page.wait_for_timeout(1000)
                page.screenshot(path='screenshots/07_dark_mode.png', full_page=True)

        # 결과 저장
        with open('test-analysis-results.json', 'w', encoding='utf-8') as f:
            json.dump(analysis_results, f, indent=2, ensure_ascii=False)

        print("\n✅ 분석 완료!")
        print(f"📊 결과: test-analysis-results.json")
        print(f"📸 스크린샷: screenshots/ 폴더")

        # 콘솔 로그 저장
        with open('console-logs.txt', 'w', encoding='utf-8') as f:
            f.write('\n'.join(console_logs))

        browser.close()

if __name__ == '__main__':
    analyze_application()
