import type { EntryEventRepository, EntryRepository } from '~/domain/repositories';
import { createElectricEntryEventRepository } from './electric-entry-event-repository';
import { createElectricEntryRepository } from './electric-entry-repository';

/**
 * リポジトリのシングルトンインスタンス
 * アプリケーション全体で同じインスタンスを使用
 */
let entryRepositoryInstance: EntryRepository | null = null;
let entryEventRepositoryInstance: EntryEventRepository | null = null;

/**
 * エントリーリポジトリのインスタンスを取得
 * @returns エントリーリポジトリ
 */
export function getEntryRepository(): EntryRepository {
  if (!entryRepositoryInstance) {
    entryRepositoryInstance = createElectricEntryRepository();
  }
  return entryRepositoryInstance;
}

/**
 * エントリーイベントリポジトリのインスタンスを取得
 * @returns エントリーイベントリポジトリ
 */
export function getEntryEventRepository(): EntryEventRepository {
  if (!entryEventRepositoryInstance) {
    entryEventRepositoryInstance = createElectricEntryEventRepository();
  }
  return entryEventRepositoryInstance;
}
