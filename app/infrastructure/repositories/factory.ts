import { ElectricEntryRepository } from './electric-entry-repository'
import { ElectricEntryEventRepository } from './electric-entry-event-repository'

/**
 * リポジトリのシングルトンインスタンス
 * アプリケーション全体で同じインスタンスを使用
 */
let entryRepositoryInstance: ElectricEntryRepository | null = null
let entryEventRepositoryInstance: ElectricEntryEventRepository | null = null

/**
 * エントリーリポジトリのインスタンスを取得
 * @returns エントリーリポジトリ
 */
export function getEntryRepository(): ElectricEntryRepository {
  if (!entryRepositoryInstance) {
    entryRepositoryInstance = new ElectricEntryRepository()
  }
  return entryRepositoryInstance
}

/**
 * エントリーイベントリポジトリのインスタンスを取得
 * @returns エントリーイベントリポジトリ
 */
export function getEntryEventRepository(): ElectricEntryEventRepository {
  if (!entryEventRepositoryInstance) {
    entryEventRepositoryInstance = new ElectricEntryEventRepository()
  }
  return entryEventRepositoryInstance
}
