export function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mb-4"></div>
        <p className="text-gray-600 text-lg">
          여행 정보를 불러오는 중...
        </p>
      </div>
    </div>
  );
}
