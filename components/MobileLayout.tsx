'use client';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 메인 콘텐츠 */}
      <main className="pb-safe">{children}</main>

      {/* 하단 네비게이션은 app/page.tsx에서 관리 */}
    </div>
  );
}
