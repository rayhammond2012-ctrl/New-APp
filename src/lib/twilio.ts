import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID || ''
const authToken = process.env.TWILIO_AUTH_TOKEN || ''
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID || ''

export const twilioClient = twilio(accountSid, authToken)

export async function sendSms(to: string, body: string): Promise<boolean> {
  try {
    await twilioClient.messages.create({
      body,
      to,
      messagingServiceSid,
    })
    return true
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return false
  }
}