import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly'
import { aws } from '../config/index.config'

const pollyClient = new PollyClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: aws.id,
        secretAccessKey: aws.secret
    }
})

const stripMarkdown = (text: string): string => {
    return text
        .replace(/#{1,6}\s/g, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\[(.+?)\]\(.+?\)/g, '$1')
        .replace(/\p{Emoji}/gu, '')
        .trim()
}

export const splitIntoSentences = (text: string): string[] => {
    const clean = stripMarkdown(text)
    const matches = clean.match(/[^.!?]+(?:[.!?]+|$)/g)

    if (!matches) return [clean]

    return matches.map(s => s.trim()).filter(s => s.length > 3)
}

export const textToSpeech = async (text: string): Promise<Buffer> => {
    const command = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: 'mp3',
        VoiceId: 'Andres',
        Engine: 'generative',
        LanguageCode: 'es-MX'
    })

    const response = await pollyClient.send(command)

    if (!response.AudioStream) {
        throw new Error('No audio stream received from Polly')
    }

    const chunks: Uint8Array[] = []
    for await (const chunk of response.AudioStream as AsyncIterable<Uint8Array>) {
        chunks.push(chunk)
    }

    return Buffer.concat(chunks)
}
