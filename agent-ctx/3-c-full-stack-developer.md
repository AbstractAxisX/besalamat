# Task 3-c — full-stack-developer — درایورهای پرداخت (ترب) و پیامک (سه‌گانه) — فاز ۲

## خروجی (۱۰ فایل)
- `src/server/drivers/sms/types.ts` — SmsSendResult / SmsDriver (قرارداد ثابت، عین بریف)
- `src/server/drivers/sms/console.ts` — ConsoleSmsDriver: لاگ `[SMS] to=… text=…`، همیشه ok:true؛ sendOtp متن «کد تأیید شما: {code} — اعتبار {ttl} ثانیه»
- `src/server/drivers/sms/kavenegar.ts` — send: sms/send.json | otp: verify/lookup.json (receptor/token/template=KAVENEGAR_OTP_TEMPLATE) | بدون کلید → ok:false «کلید کاوه‌نگار تنظیم نشده است»
- `src/server/drivers/sms/smsir.ts` — send: v1/send/bulk | otp: v1/send/verify (Authorization: Bearer SMSIR_API_KEY، templateId عددی)
- `src/server/drivers/sms/mellipayamak.ts` — rest.payamak-panel.com/api/SendSMS/SendSMS (username/password/from)
- `src/server/drivers/sms/index.ts` — getSmsDriver() بر اساس SMS_DRIVER ('kavenegar'|'smsir'|'mellipayamak')؛ پیش‌فرض/غیره → console
- `src/server/drivers/payment/types.ts` — CreatePaymentInput/Result، VerifyPaymentInput/Outcome، PaymentDriver (عین بریف)
- `src/server/drivers/payment/torob.ts` — sandbox (پیش‌فرض): authority='sbx_'+randomUUID()، redirectUrl=/payment/sandbox?authority=…&order=…، verify: '_fail' → FAILED «پرداخت از سوی شبیه‌ساز لغو شد»، وگرنه VERIFIED با refId=`SBX-<base36 انگلیسی>` و cardPan='6037-99**-****-1234' و raw={sandbox:true} | live: fetch به TOROB_CREATE_URL/TOROB_VERIFY_URL (پیش‌فرض api.torob.com/v1/payment/…) + TODO فارسی؛ خطای شبکه → «ارتباط با درگاه برقرار نشد»؛ خطای create در live → authority/redirectUrl خالی + console.error
- `src/server/drivers/payment/index.ts` — getPaymentDriver() → همیشه TorobPaymentDriver (درایورهای آینده با env PAYMENT_DRIVER)
- `src/server/drivers/payment/README-drivers.md` — راهنمای فارسی: جریان create→callback→verify، envهای همهٔ درایورها، تست sandbox با _fail، چک‌لیست اتصال واقعی ترب

## قواعد رعایت‌شده
- هیچ درایوری throw نمی‌کند؛ همهٔ fetchها try/catch + AbortSignal.timeout(10_000)
- پاسخ خام unknown (بدون any/as any) — پیمایش با type guard محلی در هر فایل
- lint ✅ exit 0 | tsc ✅ (فقط baseline examples/skills) | dev.log پاک
- تست bun -e پاس شد (خروجی کامل در worklog.md — Task ID: 3-c)

## نکته برای ایجنت‌های بعدی
- 3-b همین حالا در حال مصرف درایورهاست (POST /api/auth/otp/request و /verify هر دو 200)
- صفحهٔ شبیه‌ساز `/payment/sandbox` در فاز ۴ ساخته می‌شود — قرارداد کوئری در کامنت torob.ts
- در live، خالی بودن authority بعد از createPayment را قبل از redirect بررسی کنید
- رکورد کامل کارها در /home/z/my-project/worklog.md (Task ID: 3-c)
