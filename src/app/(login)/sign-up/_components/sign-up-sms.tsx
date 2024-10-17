'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'
import { ActionState } from '@/lib/auth/middleware'
import { SendOtpAction } from '@/app/(login)/sign-up/actions'

type SignUpSmsProps = {}

const SignUpSms = ({}: SignUpSmsProps) => {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const inviteId = searchParams.get('inviteId')
  const [state, formAction, pending] = useActionState<ActionState, FormData>(SendOtpAction, {
    error: '',
  })

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <form className="space-y-6" action={formAction}>
        <input type="hidden" name="redirect" value={redirect || ''} />
        <input type="hidden" name="inviteId" value={inviteId || ''} />
        <div>
          <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            phone
          </Label>
          <div className="mt-1">
            <Input
              id="phone"
              name="phone"
              type="text"
              autoComplete="phone"
              required
              maxLength={50}
              className="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
              placeholder="Enter your phone"
            />
          </div>
        </div>

        {state?.error && <div className="text-red-500 text-sm">{state.error}</div>}

        <div>
          <Button
            type="submit"
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            disabled={pending}
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Loading...
              </>
            ) : (
              '发送验证码'
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default SignUpSms
