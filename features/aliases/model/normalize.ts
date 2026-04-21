/**
 * 별명(alias) 정규화: 앞뒤 공백 제거 후 소문자 변환.
 * DB의 UNIQUE(user_id, lower(alias)) 인덱스와 일치시키기 위함.
 */
export function normalizeAlias(alias: string): string {
  return alias.trim().normalize("NFC").toLowerCase();
}

/**
 * 입력된 별명이 유효한지 검사한다. 빈 문자열과 과도한 길이를 거부한다.
 */
export function isValidAlias(alias: string): boolean {
  const normalized = normalizeAlias(alias);
  return normalized.length > 0 && normalized.length <= 50;
}
