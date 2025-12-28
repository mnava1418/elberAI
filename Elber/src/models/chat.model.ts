export interface ElberChats {
    chats: { [key: string]: Chat }
}

interface Chat {
    name?: string
    messages: { [key: string]: ChatMessage };
}

interface ChatMessage {
    content:   string;
    createdAt: number;
    id:        string;
    role:      string;
}
