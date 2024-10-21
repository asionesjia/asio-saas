'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useSearchParams } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'
import { ActionState } from '@/lib/auth/middleware'
import { SendOtpAction, ValidateOtpAction } from '@/app/(login)/sign-up/actions'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { motion } from 'framer-motion'
import ResendButton from '@/components/buttons/resend-button'
import { Button } from '@/components/ui/button'

type SignUpSmsProps = {}

const SignUpSms = ({}: SignUpSmsProps) => {
  const [otpCode, setOtpCode] = useState<string>('')
  const formRef = useRef<HTMLFormElement>(null)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const inviteId = searchParams.get('inviteId')
  const [sendOtpState, sendOtpFormAction, sendOtpPending] = useActionState<ActionState, FormData>(
    SendOtpAction,
    undefined,
  )
  const [validateOtpState, validateOtpFormAction, validateOtpPending] = useActionState<
    ActionState,
    FormData
  >(ValidateOtpAction, undefined)

  useEffect(() => {
    if (otpCode?.length === 6 && !validateOtpPending) {
      if (formRef.current && validateOtpState?.isOtpValidated === undefined) {
        formRef.current.requestSubmit()
      }
    }
  }, [otpCode])

  console.log(validateOtpState)
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <form
        ref={formRef}
        className="space-y-6"
        action={sendOtpState?.otpToken ? validateOtpFormAction : sendOtpFormAction}
      >
        <input type="hidden" name="redirect" value={redirect || ''} />
        <input type="hidden" name="inviteId" value={inviteId || ''} />
        <input type="hidden" name="otpToken" value={sendOtpState?.otpToken || ''} />
        <input type="hidden" name="isOtpValidated" value={validateOtpState?.isOtpValidated || ''} />
        <div>
          <Label htmlFor="phone">phone</Label>
          <div className="mt-1">
            <Input
              id="phone"
              name="phone"
              type="text"
              autoComplete="phone"
              defaultValue={sendOtpState?.data?.phone}
              required
              maxLength={50}
              placeholder="Enter your phone"
            />
          </div>
        </div>

        {sendOtpState?.error && <div className="text-red-500 text-sm">{sendOtpState.error}</div>}

        <div className="flex justify-between items-end">
          {sendOtpState?.otpToken && (
            <motion.div
              className="flex flex-col"
              initial={{ opacity: 0, width: '0' }}
              animate={{ opacity: 1, width: 'auto' }}
              transition={{ duration: 1 }}
            >
              <Label htmlFor="otpCode" className="text-nowrap mb-1">
                OTP Code
              </Label>
              <InputOTP
                id="otpCode"
                name="otpCode"
                autoComplete="one-time-code"
                maxLength={6}
                value={otpCode}
                onChange={(value) => setOtpCode(value)}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      index={index}
                      key={index}
                      initial={{ opacity: 0, scale: 0, x: 50 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </motion.div>
          )}
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: sendOtpState?.otpToken ? '25%' : '100%', y: 0 }}
            transition={{ duration: 1 }}
          >
            <ResendButton
              formAction={sendOtpFormAction}
              variant={sendOtpState?.otpToken ? 'secondary' : 'default'}
              formPending={sendOtpPending}
              className="w-full"
              initialLabel="发送验证码"
              endLabel="重新发送"
              timedOutAt={sendOtpState?.otpTimedOutAt}
            />
          </motion.div>
        </div>
        {validateOtpState?.error && (
          <div className="text-red-500 text-sm">{validateOtpState.error}</div>
        )}
        {sendOtpState?.otpToken && (
          <Button
            type="submit"
            formAction={validateOtpFormAction}
            className="w-full"
            isLoading={validateOtpPending}
          >
            确定
          </Button>
        )}
      </form>
    </div>
  )
}

export default SignUpSms
