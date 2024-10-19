import * as crypto from 'crypto'
import { sendSms } from '@/api/sms/send-sms'
import { env } from '@/env/server'
import { otps } from '@/lib/db/schema'
import { db } from '@/lib/db/drizzle'

function generateExpiredAt(duration: number = 1000 * 60 * 10): Date {
  const currentTime = Date.now()
  return new Date(currentTime + duration)
}

const generateOtp = (limit: number) => {
  const digits = '0123456789'
  let OTP = ''
  for (let i = 0; i < limit; i++) {
    OTP += digits[Math.floor(Math.random() * 10)]
  }
  return OTP
}

function encryptData(data: object): string {
  const iv = crypto.randomBytes(16) // 生成随机的 IV
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    crypto.scryptSync(env.AUTH_SECRET, 'salt', 32),
    iv,
  )

  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
  encrypted += cipher.final('hex')

  return iv.toString('hex') + ':' + encrypted // 返回 IV 和加密后的数据
}

interface DecryptedData {
  phone: string
  otp: string
}

function decryptData(ciphertext: string): DecryptedData {
  const [ivHex, encrypted] = ciphertext.split(':') // 分离 IV 和加密后的数据
  const iv = Buffer.from(ivHex, 'hex') // 将 IV 转为 Buffer
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    crypto.scryptSync(env.AUTH_SECRET, 'salt', 32),
    iv,
  )

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return JSON.parse(decrypted) // 解析解密后的 JSON 数据
}

interface EncryptedData {
  phone: string
  otp: string
  token: string
  expiredAt: Date
}

// 生成校验码并加密手机号和 OTP
function generateOtpAndEncrypt(phone: string): EncryptedData {
  const otp = generateOtp(6) // 生成 6 位 OTP
  const expiredAt = generateExpiredAt(1000 * 60 * 10)
  const data = { phone, otp, expiredAt } // 创建要加密的数据对象

  const token = encryptData(data) // 加密数据

  return {
    phone,
    otp,
    token,
    expiredAt,
  }
}

export async function sendOtp(
  phone: string,
): Promise<{ token: string | null; error: string | null }> {
  const { otp, token, expiredAt } = generateOtpAndEncrypt(phone)

  try {
    const sendResponse = await sendSms(
      phone,
      `验证码：${otp}（10分钟内有效）。您正在注册Asio账户，请勿将验证码告知他人。【时代引力】`,
    )
    console.log(sendResponse)
    if (sendResponse.ReturnStatus === 'Success' && sendResponse.Message === 'ok') {
      await db.insert(otps).values({
        phone: phone,
        otp: otp,
        token: token,
        expiredAt: expiredAt,
      })
      return { token, error: null }
    }
    return { token: null, error: '发送失败！' }
  } catch (error) {
    return { token: null, error: '发送失败！' }
  }
}
