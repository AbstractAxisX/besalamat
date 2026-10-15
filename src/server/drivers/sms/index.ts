/**
 * کارخانهٔ درایور پیامک — «بسلامت»
 * ================================
 * انتخاب درایور با env SMS_DRIVER:
 *   'kavenegar' | 'smsir' | 'mellipayamak' → همان درایور
 *   پیش‌فرض و هر مقدار دیگر            → ConsoleSmsDriver (بدون ارسال واقعی؛ برای توسعه)
 */
import { ConsoleSmsDriver } from './console'
import { KavenegarSmsDriver } from './kavenegar'
import { MelliPayamakSmsDriver } from './mellipayamak'
import { SmsIrSmsDriver } from './smsir'
import type { SmsDriver } from './types'

export function getSmsDriver(): SmsDriver {
  switch ((process.env.SMS_DRIVER ?? '').trim().toLowerCase()) {
    case 'kavenegar':
      return new KavenegarSmsDriver()
    case 'smsir':
      return new SmsIrSmsDriver()
    case 'mellipayamak':
      return new MelliPayamakSmsDriver()
    default:
      return new ConsoleSmsDriver()
  }
}

// صادرات مجدد typeهای types.ts برای راحتی import از '@/server/drivers/sms'
export type { SmsDriver, SmsSendResult } from './types'
