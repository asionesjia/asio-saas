'use server'

import { validatedAction } from '@/lib/auth/middleware'
import { z } from 'zod'
import { sendOtp } from '@/lib/otp/utils'

const sendOtpSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/),
})
export const sendOtpAction = validatedAction(sendOtpSchema, async (data, formData) => {
  const { phone } = data

  try {
    const { token } = await sendOtp(phone)
    const timedOutAt = new Date(Date.now() + 60000)
    return { data: data, otpToken: token, otpTimedOutAt: timedOutAt, error: null }
  } catch (error) {
    return { data: data, otpToken: null, otpTimedOutAt: null, error: '发送失败。' }
  }
})
