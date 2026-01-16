/**
 * スマホアクセス用のユニークなトークンを生成
 * 8文字の英数字（大文字・数字のみ、読み間違えやすい文字を除外）
 *
 * @returns 生成されたトークン文字列
 */
export function generateToken(): string {
  // 読み間違えやすい文字を除外（I, O, 0, 1など）
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}
