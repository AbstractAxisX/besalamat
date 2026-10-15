# راهنمای درایورها — پرداخت (ترب) و پیامک (سه‌گانه)

> مسیر کد: `src/server/drivers/` (پرداخت: `payment/` — پیامک: `sms/`)
> ⚠️ این ماژول‌ها فقط سمت سرورند؛ در کامپوننت‌های کلاینت import نشوند.

## قاعدهٔ طلایی همهٔ درایورها

- **هرگز throw نمی‌کنند**؛ خطا در قالبِ خودِ نتیجه برمی‌گردد:
  - پیامک → `{ ok: false, message }`
  - پرداخت → `verify` خروجی `{ status: 'FAILED', reason }` می‌دهد؛ `createPayment` در حالت live با خطا، `authority`/`redirectUrl` **خالی** برمی‌گرداند (فراخواننده باید خالی بودن را بررسی کند).
- همهٔ fetchها با مهلت ۱۰ ثانیه (`AbortSignal.timeout(10_000)`) و داخل try/catch.
- پاسخ خام درگاه‌ها از نوع `unknown` نگه داشته می‌شود — بدون `any`.

## جریان پرداخت: create → callback → verify

1. لایهٔ سفارش، سبد را قطعی می‌کند و `createPayment` را صدا می‌زند:
   `getPaymentDriver().createPayment({ orderNumber, amount, callbackUrl, description?, mobile? })`
2. کاربر به `redirectUrl` هدایت می‌شود (در sandbox: صفحهٔ شبیه‌ساز `/payment/sandbox` — در فاز ۴ ساخته می‌شود).
3. درگاه به `callbackUrl` برمی‌گردد و `authority` را همراه می‌آورد.
4. سرویس callback، `verify({ authority, amount, orderNumber })` را صدا می‌زند:
   - `VERIFIED` → سفارش «پرداخت‌شده» + `refId`/`cardPan` در تراکنش ذخیره می‌شود.
   - `FAILED` → رزرو موجودی آزاد می‌شود و پیام خطا به کاربر نمایش داده می‌شود.

## درایور ترب — حالت sandbox (پیش‌فرض)

`TOROB_MODE` هر چیزی جز `live` باشد → sandbox (بدون هیچ تماس شبکه‌ای).

- create: `authority = 'sbx_' + uuid` و `redirectUrl = /payment/sandbox?authority=…&order=…`
- verify (بدون state):
  - authority شامل `_fail` → `FAILED` با دلیل «پرداخت از سوی شبیه‌ساز لغو شد»
  - وگرنه → `VERIFIED` با `refId = SBX-<base36 انگلیسی>` و `cardPan = 6037-99**-****-1234`

### نحوهٔ تست

- **موفق**: روی شبیه‌ساز «پرداخت موفق» را بزنید → callback با همان authority برمی‌گردد → `verify` → `VERIFIED`.
- **شکست**: شبیه‌ساز با افزودن پسوند `_fail` به authority برمی‌گردد → `verify` → `FAILED` (سناریوی لغو/شکست درگاه).
- بدون UI هم قابل تست است — بخش «تست سریع» پایین.

## درایور ترب — حالت live

| env | پیش‌فرض | توضیح |
| --- | --- | --- |
| `TOROB_MODE=live` | sandbox | فعال‌سازی حالت زنده |
| `TOROB_API_KEY` | — | کلید API درگاه |
| `TOROB_MERCHANT_ID` | — | شناسهٔ پذیرنده |
| `TOROB_CREATE_URL` | `https://api.torob.com/v1/payment/create` | endpoint ساخت پرداخت |
| `TOROB_VERIFY_URL` | `https://api.torob.com/v1/payment/verify` | endpoint تأیید پرداخت |

- قرارداد خطای **create** در live: شبکه قطع یا پاسخِ فاقد `authority`/`redirectUrl` → خروجی `{ authority: '', redirectUrl: '' }` + `console.error`.
- قرارداد خطای **verify** در live: خطای شبکه/تایم‌اوت → `FAILED` با دلیل ثابت «ارتباط با درگاه برقرار نشد»؛ پاسخِ بدونِ علامت موفقیت صریح → `FAILED` (سیاست محافظه‌کارانه).

### چک‌لیست اتصال واقعی ترب (TODOها)

- [ ] `TOROB_API_KEY` و `TOROB_MERCHANT_ID` را از پنل ترب تنظیم کنید
- [ ] آدرس و بدنهٔ دقیق create/verify را طبق مستندات زندهٔ ترب تکمیل کنید (نام فیلدها، واحد مبلغ ریال/تومان)
- [ ] قالب هدر احراز هویت (`Authorization: Bearer` / `X-Merchant-Id`) را با مستندات تطبیق دهید
- [ ] اگر درگاه callbackUrl مطلق می‌خواهد، تبدیل relative→absolute را اضافه کنید
- [ ] فیلدهای `refId`/`cardPan` را از پاسخ واقعی در `mapLiveVerifyResponse` تطبیق دهید
- [ ] یک پرداخت واقعیِ کوچک انجام و verify را با پنل تطبیق دهید، سپس `TOROB_MODE=live` را روشن کنید

## درایورهای پیامک

انتخاب با env `SMS_DRIVER`: `kavenegar` | `smsir` | `mellipayamak` — پیش‌فرض/هر مقدار دیگر: `console`
(کنسول: بدون ارسال واقعی، لاگ `[SMS] to=… text=…`، همیشه `ok:true`).

| درایور | envهای لازم | نمونهٔ پیام «بدون کلید» |
| --- | --- | --- |
| kavenegar | `KAVENEGAR_API_KEY`، `KAVENEGAR_OTP_TEMPLATE` | «کلید کاوه‌نگار تنظیم نشده است» |
| smsir | `SMSIR_API_KEY`، `SMSIR_OTP_TEMPLATE_ID`، `SMSIR_LINE_NUMBER` | «کلید پیام‌رسان تنظیم نشده است» |
| mellipayamak | `MELLIPAYAMAK_USERNAME`، `MELLIPAYAMAK_PASSWORD`، `MELLIPAYAMAK_FROM` | «اطلاعات ملی‌پیامک تنظیم نشده است» |

- TTL کد تأیید در کاوه‌نگار/پیام‌رسان از طریق متنِ قالبِ پنل مدیریت می‌شود؛ در ملی‌پیامک و کنسول داخل متن پیام می‌آید.
- ⚠️ TODO(کلید واقعی): همهٔ کلیدها/قالب‌ها را از پنل هر سرویس تنظیم کنید (شرح کامل در سرآیند هر فایل درایور).

## تست سریع (بدون UI)

```bash
bun -e "
const { getSmsDriver } = await import('./src/server/drivers/sms/index.ts')
const { getPaymentDriver } = await import('./src/server/drivers/payment/index.ts')
const otp = await getSmsDriver().sendOtp('09121234567', '482913', 120)
const p = await getPaymentDriver().createPayment({ orderNumber: 'BS10234', amount: 2450000, callbackUrl: '/api/payment/callback' })
const v = await getPaymentDriver().verify({ authority: p.authority, amount: 2450000, orderNumber: 'BS10234' })
const f = await getPaymentDriver().verify({ authority: p.authority + '_fail', amount: 2450000, orderNumber: 'BS10234' })
console.log(otp, p, v, f)
"
```
