'use server'

import { validatedAction } from '@/lib/auth/middleware'
import { z } from 'zod'
import { sendOtp } from '@/lib/otp/utils'

const signInSmsSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  email: z.string().email().min(3).max(255),
  password: z.string().min(4).max(100),
  otp: z.string().regex(/^\d{6}$/),
  name: z.string().max(16),
})
export const SignUpSmsAction = validatedAction(signInSmsSchema, async (data, formData) => {})

const sendOtpSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/),
})
export const SendOtpAction = validatedAction(sendOtpSchema, async (data, formData) => {
  const { phone } = data

  try {
    await sendOtp(phone)
  } catch (error) {
    return { error: '发送失败。' }
  }
})
