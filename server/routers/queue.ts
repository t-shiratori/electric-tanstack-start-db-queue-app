import { UuidSchema } from '../../shared/schemas';
import { publicProcedure, router } from '../trpc/init';

/**
 * キュー関連のtRPCルーター
 * 待ち行列の情報取得を担当
 */
export const queueRouter = router({
  /**
   * 次の整理券番号取得
   * 指定されたキューの最大番号+1を返す
   */
  getNextTicketNumber: publicProcedure.input(UuidSchema).query(async ({ input: queueId, ctx }) => {
    const result = await ctx.pool.query(
      'SELECT COALESCE(MAX(number), 0) as max_number FROM entry WHERE queue_id = $1',
      [queueId],
    );
    const maxNumber = result.rows[0]?.max_number || 0;
    return { number: maxNumber + 1 };
  }),
});
