-- Migration: created_at を TIMESTAMP から TIMESTAMPTZ に変更
-- Date: 2026-11-22
--
-- 背景:
--   TIMESTAMP（タイムゾーンなし）は「UTC の時刻」をタイムゾーン情報なしで保存するため、
--   ブラウザがその値をローカル時刻として解釈し、画面の時刻が UTC のまま表示されていた（日本では 9 時間のずれ）。
--   TIMESTAMPTZ にすることで、同期されるデータにオフセット（+00）が付き、正しい時刻として扱える。
--
-- 既存データ:
--   これまでの値は UTC（サーバーの TimeZone = UTC）で保存されているため、UTC として解釈して変換する。
--
-- 冪等性:
--   すでに TIMESTAMPTZ の列は変換しない（001 を新しく実行した環境で流しても何も起きない）。

DO $$
DECLARE
  target_table TEXT;
BEGIN
  FOREACH target_table IN ARRAY ARRAY['queue', 'entry', 'entry_event'] LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = target_table
        AND column_name = 'created_at'
        AND data_type = 'timestamp without time zone'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE ''UTC''',
        target_table
      );
    END IF;
  END LOOP;
END
$$;
