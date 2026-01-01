-- Migration: Create tables for queue management app
-- Date: 2026-01-01

-- Queue table (店舗/窓口の管理)
CREATE TABLE IF NOT EXISTS queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Entry table (受付情報、状態は持たない)
CREATE TABLE IF NOT EXISTS entry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id UUID NOT NULL REFERENCES queue(id) ON DELETE CASCADE,
  number INT NOT NULL,
  party_size INT NOT NULL DEFAULT 1,
  public_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(queue_id, number)
);

-- Entry Event table (イベントログ - 唯一の正のデータ)
CREATE TABLE IF NOT EXISTS entry_event (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES entry(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('created', 'called', 'done', 'skipped', 'cancelled')),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  device_id TEXT,
  actor TEXT DEFAULT 'staff'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entry_queue ON entry(queue_id);
CREATE INDEX IF NOT EXISTS idx_entry_number ON entry(queue_id, number);
CREATE INDEX IF NOT EXISTS idx_entry_public_token ON entry(public_token);
CREATE INDEX IF NOT EXISTS idx_entry_event_entry ON entry_event(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_event_created_at ON entry_event(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entry_event_type ON entry_event(type);

-- Insert a default queue for testing
INSERT INTO queue (id, name, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'デフォルト店舗', 'open')
ON CONFLICT DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE queue IS '順番待ちの列（店舗・窓口など）';
COMMENT ON TABLE entry IS '受付エンティティ（1組の受付単位）。状態は持たず、entry_eventから派生';
COMMENT ON TABLE entry_event IS '状態変化の履歴（append-only）。これが唯一の正のデータ';

COMMENT ON COLUMN entry.number IS '店舗内の受付番号（表示用）';
COMMENT ON COLUMN entry.party_size IS '人数';
COMMENT ON COLUMN entry.public_token IS 'スマホ参照用のアクセストークン';

COMMENT ON COLUMN entry_event.type IS 'イベント種別: created(受付), called(呼び出し), done(完了), skipped(スキップ), cancelled(キャンセル)';
COMMENT ON COLUMN entry_event.device_id IS '操作端末の識別子';
COMMENT ON COLUMN entry_event.actor IS '操作者: staff, system, user';
