import { generateText } from 'ai';
 
const { text } = await generateText({
  model: 'anthropic/claude-opus-4.5',
  prompt: 'Explain the concept of quantum entanglement.',
  providerOptions: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY!,
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY!,
    },
  }
});