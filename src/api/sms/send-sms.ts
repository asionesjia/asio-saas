import * as crypto from 'crypto'
import { env } from '@/env/server'

// 定义发送短信接口的返回结果
interface SmsResponse {
  ReturnStatus: string
  Message: string
  RemainPoint: number
  TaskID: number
  SuccessCounts: number
}

// 定义发信函数
export async function sendSms(
  mobile: string,
  content: string,
  sendTime: string = '', // 可选，定时发送时间
  extno: string = '', // 可选，扩展子号
): Promise<SmsResponse> {
  // 获取当前时间戳
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14) // 格式化为YYYYMMDDHHMMSS

  // 生成签名：MD5(账号 + 密码 + 时间戳)
  const signString = env.SMS_ACCOUNT + env.SMS_PASSWORD + timestamp
  const sign = crypto.createHash('md5').update(signString).digest('hex')

  // 构造请求体，application/x-www-form-urlencoded 格式
  const params = new URLSearchParams()
  params.append('action', 'send')
  params.append('rt', 'json')
  params.append('userid', env.SMS_USERID)
  params.append('timestamp', timestamp)
  params.append('sign', sign)
  params.append('mobile', mobile)
  params.append('content', content)
  params.append('sendTime', sendTime) // 为空则立即发送
  params.append('extno', extno)

  try {
    // 发送 POST 请求
    const response = await fetch(`${env.SMS_SEND_CLIENT_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('发送短信失败:', error)
    throw error
  }
}
