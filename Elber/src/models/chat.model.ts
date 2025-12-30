export type ElberMessage = {
    id: string,
    createdAt: number,
    role: 'user' | 'assistant',
    content: string
}

export type ElberChat = {
    name: string
    id: number
    messages: ElberMessage[]
}
