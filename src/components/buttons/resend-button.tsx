import React from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function getRemainingSeconds(timedOutAt: Date): number {
  const now = new Date()
  const timeDiff = timedOutAt.getTime() - now.getTime()

  if (timeDiff <= 0) {
    return 0
  }
  console.log(Math.ceil(timeDiff / 1000))
  return Math.ceil(timeDiff / 1000) // 返回剩余秒数
}

type ResendButtonProps = ButtonProps & {
  initialLabel?: string
  endLabel?: string
  timedOutAt?: Date | null
  formPending?: boolean
}

const ResendButton = React.forwardRef<HTMLButtonElement, ResendButtonProps>(
  (
    {
      className,
      formPending,
      initialLabel = '发送验证码',
      endLabel = '重新发送',
      timedOutAt,
      ...props
    },
    ref,
  ) => {
    const [timeLeft, setTimeLeft] = React.useState<number | undefined>(
      timedOutAt ? getRemainingSeconds(timedOutAt) : undefined,
    )
    const [isDisable, setIsDisable] = React.useState<boolean | undefined>(undefined)
    const [isPending, setIsPending] = React.useState(false)

    // 倒计时逻辑
    React.useEffect(() => {
      if (timeLeft === undefined || timeLeft === null) return
      if (timeLeft === 0) {
        setIsDisable(false)
        return
      }
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      console.log(timeLeft)
      return () => clearTimeout(timer) // 清理定时器，避免内存泄漏
    }, [timeLeft])

    React.useEffect(() => {
      if (timedOutAt) {
        const newTimeLeft = getRemainingSeconds(timedOutAt)
        setIsPending(false)
        setTimeLeft(newTimeLeft)
        setIsDisable(newTimeLeft > 0)
      }
    }, [timedOutAt])

    React.useEffect(() => {
      if (formPending) {
        setIsPending(true)
      }
    }, [formPending])

    return (
      <Button
        ref={ref}
        className={cn(className, isDisable ? 'cursor-not-allowed opacity-50' : '')}
        isLoading={isPending}
        disabled={isDisable}
        {...props}
      >
        {isDisable === undefined ? initialLabel : !isDisable ? endLabel : `${endLabel} ${timeLeft}`}
      </Button>
    )
  },
)

export default React.memo(ResendButton)
