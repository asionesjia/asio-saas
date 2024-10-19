'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { ActionState } from '@/lib/auth/middleware'
import { SendOtpAction } from '@/app/(login)/sign-up/actions'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { AnimatePresence, motion } from 'framer-motion'

type SignUpSmsProps = {}

const SignUpSms = ({}: SignUpSmsProps) => {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const inviteId = searchParams.get('inviteId')
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    SendOtpAction,
    undefined,
  )
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <form className="space-y-6" action={formAction}>
        <input type="hidden" name="redirect" value={redirect || ''} />
        <input type="hidden" name="inviteId" value={inviteId || ''} />
        <div>
          <Label htmlFor="phone">phone</Label>
          <div className="mt-1">
            <Input
              id="phone"
              name="phone"
              type="text"
              autoComplete="phone"
              required
              maxLength={50}
              placeholder="Enter your phone"
            />
          </div>
        </div>

        {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}

        <div className="flex justify-between items-center">
          <AnimatePresence>
            {state && (
              <motion.div
                className="flex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <InputOTP maxLength={6}>
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -10 }} // 初始状态
                        animate={{ opacity: 1, y: 0 }} // 结束状态
                        transition={{ duration: 0.3, delay: index * 0.1 }} // 延迟动画
                      >
                        <InputOTPSlot index={index} />
                      </motion.div>
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div className={`transition-all ${state ? 'w-1/4' : 'w-full'}`}>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Loading...
                </>
              ) : (
                '发送验证码'
              )}
            </Button>
          </motion.div>
        </div>
      </form>
    </div>
  )
}

export default SignUpSms
