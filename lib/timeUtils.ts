import { parseISO, format, differenceInSeconds, addHours } from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

export const KOREA_TIMEZONE = 'Asia/Seoul';
export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * 사용자의 브라우저 타임존을 감지합니다
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * 한국 시간으로 포맷팅합니다
 */
export function formatKoreaTime(date: Date, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  return formatInTimeZone(date, KOREA_TIMEZONE, formatStr);
}

/**
 * 베트남 시간으로 포맷팅합니다
 */
export function formatVietnamTime(date: Date, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string {
  return formatInTimeZone(date, VIETNAM_TIMEZONE, formatStr);
}

/**
 * ISO 문자열을 Date 객체로 변환합니다
 */
export function parseISOString(isoString: string): Date {
  return parseISO(isoString);
}

/**
 * 두 날짜 사이의 시간 차이를 계산합니다
 */
export function calculateTimeDifference(from: Date, to: Date) {
  const totalSeconds = differenceInSeconds(to, from);

  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalSeconds };
}

/**
 * 날짜와 시간(HH:mm)을 결합하여 Date 객체를 생성합니다
 */
export function combineDateAndTime(dateStr: string, timeStr: string, timezone: string = KOREA_TIMEZONE): Date {
  // dateStr: 'YYYY-MM-DD', timeStr: 'HH:mm'
  const [hours, minutes] = timeStr.split(':').map(Number);
  const dateTimeStr = `${dateStr}T${timeStr}:00`;
  const date = parseISO(dateTimeStr);
  return toZonedTime(date, timezone);
}

/**
 * 사용자가 현재 어느 위치에 있는지 추정합니다 (한국 또는 베트남)
 */
export function estimateUserLocation(currentDate: Date, tripStartDate: Date, tripEndDate: Date): 'korea' | 'vietnam' {
  if (currentDate >= tripStartDate && currentDate <= tripEndDate) {
    return 'vietnam';
  }
  return 'korea';
}

/**
 * 활동의 예상 종료 시간을 계산합니다 (기본 1시간)
 */
export function getActivityEndTime(startDate: Date, durationMinutes: number = 60): Date {
  return addHours(startDate, durationMinutes / 60);
}
