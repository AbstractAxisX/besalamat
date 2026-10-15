/**
 * کارخانهٔ درایور پرداخت — «بسلامت»
 * =================================
 * فعلاً همیشه TorobPaymentDriver برمی‌گردد.
 * درایورهای آینده با env PAYMENT_DRIVER انتخاب می‌شوند (الگوی getSmsDriver در درایورهای پیامک).
 */
import { TorobPaymentDriver } from './torob'
import type { PaymentDriver } from './types'

export function getPaymentDriver(): PaymentDriver {
  return new TorobPaymentDriver()
}

// صادرات مجدد typeهای types.ts برای راحتی import از '@/server/drivers/payment'
export type {
  CreatePaymentInput,
  CreatePaymentResult,
  PaymentDriver,
  VerifyPaymentInput,
  VerifyPaymentOutcome,
} from './types'
