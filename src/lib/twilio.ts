import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
const authToken = process.env.TWILIO_AUTH_TOKEN || ''
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || ''

export const twilioClient = twilio(accountSid, authToken)

export async function sendSms(to: string, body: string): Promise<boolean> {
  try {
    await twilioClient.messages.create({
      body,
      to,
      from: twilioPhone,
    })
    return true
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return false
  }
}