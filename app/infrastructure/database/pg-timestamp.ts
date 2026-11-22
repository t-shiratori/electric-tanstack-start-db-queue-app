/**
 * PostgreSQL のタイムスタンプ文字列の形式
 * 例: "2026-11-22 10:02:03.625961+00" / "2026-11-22 10:02:03+05:30" / "2026-11-22 10:02:03"
 * - 1: 日付 2: 時刻 3: 小数秒（任意） 4: オフセット（任意）
 */
const PG_TIMESTAMP_PATTERN = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?(Z|[+-]\d{2}(?::?\d{2})?)?$/;

/**
 * オフセット表記を ISO 8601 の形式（±HH:MM）にそろえる
 * @param offset PostgreSQL のオフセット表記（"+00" / "+0530" / "+05:30" / "Z"）。省略時は UTC とみなす
 * @returns ISO 8601 のオフセット表記
 */
function toIsoOffset(offset: string | undefined): string {
  if (!offset || offset === 'Z') {
    return 'Z';
  }
  const sign = offset.slice(0, 1);
  const digits = offset.slice(1).replace(':', '');
  const hours = digits.slice(0, 2);
  const minutes = digits.slice(2, 4) || '00';
  return `${sign}${hours}:${minutes}`;
}

/**
 * PostgreSQL のタイムスタンプ文字列を Date に変換する
 *
 * Electric は timestamptz を "2026-11-22 10:02:03.625961+00" の形式で送るが、
 * これは ISO 8601 ではないためブラウザによっては new Date() で正しく解釈できない。
 * そこで ISO 8601（"2026-11-22T10:02:03.625+00:00"）に整形してから変換する。
 * オフセットのない値（timestamp 型）は UTC として扱う。
 *
 * @param value PostgreSQL のタイムスタンプ文字列
 * @returns 変換した Date
 */
export function parsePgTimestamp(value: string): Date {
  const match = PG_TIMESTAMP_PATTERN.exec(value);
  if (!match) {
    return new Date(value);
  }
  const [, date, time, fraction, offset] = match;
  // ミリ秒（3桁）より細かい桁は切り捨てる
  const milliseconds = fraction ? fraction.slice(0, 4).padEnd(4, '0') : '';
  return new Date(`${date}T${time}${milliseconds}${toIsoOffset(offset)}`);
}
