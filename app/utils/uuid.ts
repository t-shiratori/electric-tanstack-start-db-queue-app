/**
 * UUID v4を生成する
 *
 * Web Crypto APIのcrypto.randomUUID()を使用してRFC 4122準拠のUUID v4を生成します。
 * HTTPS環境（secure context）で動作します。
 *
 * 注意: この関数はHTTPS環境でのみ動作します。HTTP環境では使用できません。
 *
 * @returns RFC 4122準拠のUUID v4文字列
 */
export function generateUuid(): string {
  return crypto.randomUUID()
}