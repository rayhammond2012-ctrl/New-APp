export async function generateFollowUp(
  leadName: string,
  service: string,
  businessName: string,
  conversationHistory: string[]
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return 'Thanks for your interest! Let us know if you have any questions.'
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful SMS assistant for a home-service business. Write a friendly, concise follow-up text message (under 160 characters) to a potential customer. Do not use emojis. Keep it natural and conversational.',
          },
          {
            role: 'user',
            content: `Write a follow-up SMS to ${leadName} who was interested in ${service} services from ${businessName}. Previous messages: ${conversationHistory.join(', ')}`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, await response.text())
      return 'Thanks for your interest! Let us know if you have any questions.'
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content?.trim() || 'Thanks for your interest! Let us know if you have any questions.'
  } catch (error) {
    console.error('OpenAI API error:', error)
    return 'Thanks for your interest! Let us know if you have any questions.'
  }
}