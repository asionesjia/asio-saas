'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useSearchParams } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'
import { ActionState } from '@/lib/auth/middleware'
import { sendOtpAction } from '@/app/(login)/sign-up/actions'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { motion } from 'framer-motion'
import ResendButton from '@/components/buttons/resend-button'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { signUp } from '@/app/(login)/actions'

type SignUpSmsProps = {}

const SignUpSms = ({}: SignUpSmsProps) => {
  const [otpCode, setOtpCode] = useState<string>('')
  const formRef = useRef<HTMLFormElement>(null)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const inviteId = searchParams.get('inviteId')
  const [sendOtpState, sendOtpFormAction, sendOtpPending] = useActionState<ActionState, FormData>(
    sendOtpAction,
    undefined,
  )
  const [signUpState, signUpFormAction, signUpPending] = useActionState<ActionState, FormData>(
    signUp,
    undefined,
  )

  useEffect(() => {
    if (otpCode?.length === 6 && !signUpPending) {
      if (formRef.current && signUpState?.isOtpValidated === '') {
        formRef.current.requestSubmit()
      }
    }
  }, [otpCode])

  console.log(formRef?.current?.elements)

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <form
        ref={formRef}
        className="space-y-6"
        action={sendOtpState?.otpToken ? signUpFormAction : sendOtpFormAction}
      >
        <input type="hidden" name="redirect" value={redirect || ''} />
        <input type="hidden" name="inviteId" value={inviteId || ''} />
        <input type="hidden" name="otpToken" value={sendOtpState?.otpToken || ''} />
        <input type="hidden" name="isOtpValidated" value={signUpState?.isOtpValidated || ''} />
        <div
          className={
            (signUpState?.isOtpValidated || signUpState?.isOtpValidated === undefined) && 'hidden'
          }
        >
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

        <div
          className={cn(
            'flex justify-between items-end',
            (signUpState?.isOtpValidated || signUpState?.isOtpValidated === 'true') && 'hidden',
          )}
        >
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
        {signUpState?.error && <div className="text-red-500 text-sm">{signUpState.error}</div>}
        {(signUpState?.isOtpValidated || signUpState?.isOtpValidated === 'true') && (
          <>
            <motion.div
              initial={{ opacity: 0, x: -100, rotate: -10 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{}}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
            >
              <Label htmlFor="username" className="text-nowrap">
                Username
              </Label>
              <div className="mt-1">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  maxLength={50}
                  placeholder="Enter your Username"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -100, rotate: -10 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{}}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.8, delay: 0.2 }}
            >
              <Label htmlFor="email" className="text-nowrap">
                Email
              </Label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="email"
                  required
                  maxLength={50}
                  placeholder="Enter your Email"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -100, rotate: -10 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{}}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.8, delay: 0.4 }}
            >
              <Label htmlFor="password" className="text-nowrap">
                Password
              </Label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  maxLength={50}
                  placeholder="Enter your password"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -100, rotate: -10 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{}}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.8, delay: 0.6 }}
            >
              <Label htmlFor="passwordConfirmation" className="text-nowrap">
                Password Confirmation
              </Label>
              <div className="mt-1">
                <Input
                  id="passwordConfirmation"
                  name="Password Confirmation"
                  type="password"
                  autoComplete="new-password"
                  required
                  maxLength={50}
                  placeholder="Enter your Username"
                />
              </div>
            </motion.div>
          </>
        )}
        {sendOtpState?.otpToken && (
          <Button
            type="submit"
            formAction={signUpFormAction}
            className="w-full"
            isLoading={signUpPending}
          >
            确定
          </Button>
        )}
      </form>
    </div>
  )
}

export default SignUpSms
