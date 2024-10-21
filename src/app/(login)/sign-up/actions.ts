'use server'

import { validatedAction } from '@/lib/auth/middleware'
import { z } from 'zod'
import { decryptData, sendOtp } from '@/lib/otp/utils'

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
    const { token } = await sendOtp(phone)
    const timedOutAt = new Date(Date.now() + 60000)
    return { data: data, otpToken: token, otpTimedOutAt: timedOutAt, error: null }
  } catch (error) {
    return { data: data, otpToken: null, otpTimedOutAt: null, error: '发送失败。' }
  }
})

const validateOtpSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/),
  otpCode: z
    .string()
    .regex(/^\d{6}$/)
    .optional(),
  otpToken: z.string().optional(),
})
export const ValidateOtpAction = validatedAction(validateOtpSchema, async (data, formData) => {
  const { phone, otpCode, otpToken } = data

  console.log(data)
  try {
    if (otpCode && otpToken) {
      const dataStore = decryptData(otpToken)
      if (dataStore.phone === phone && dataStore.otp === otpCode) {
        if (dataStore.expiredAt < new Date(Date.now())) {
          return {
            data: data,
            isOtpValidated: false,
            error: '验证码已过期，请重新申请。',
          }
        }
        return { data: data, isOtpValidated: true, error: null }
      }
      return {
        data: data,
        isOtpValidated: false,
        error: '验证码错误。',
      }
    }
    return { data: data, isOtpValidated: false, error: '请检查手机号或验证码是否正确。' }
  } catch (error) {
    return { data: data, isOtpValidated: false, error: '校验失败，请稍后重试。' }
  }
})
