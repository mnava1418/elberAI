import { OpenAI } from "openai"
import { openaiCfg } from "../config/index.config";
import { ElberAction, ElberEvent, ElberRequest, ElberResponse, ElberUser } from "../models/elber.model";
import { getSystemPrompt } from "../utils/prompt.utils";

const quickChat = async (user: ElberUser, messages: ElberRequest[], ongoingConvo: Map<string, {abort?: (() => void) | undefined;}>, emitMessage: (event: ElberEvent, response: ElberResponse) => void) => {
    const uid = user.uid
    const name = user.name

    let elberResponse: ElberResponse = {
        action: ElberAction.CHAT_TEXT,
        payload: {}
    }
    
    // Clean up any existing conversation
    try { 
        const existing = ongoingConvo.get(uid);
        if (existing?.abort) {
            existing.abort();
        }
    } catch (error) {
        console.warn(`Error aborting previous conversation for ${uid}:`, error);
    }
    
    ongoingConvo.delete(uid);

    // Create AbortController for this conversation
    const abortController = new AbortController();
    
    try {
        const openai = new OpenAI({apiKey: openaiCfg.cred})
        const system_prompt = getSystemPrompt(name)

        // Set up abort function that uses AbortController
        const abortFn = () => {
            console.info(`Aborting conversation for ${uid}`);
            abortController.abort();
        };
        
        ongoingConvo.set(uid, { abort: abortFn });

        // Check if already aborted before starting
        if (abortController.signal.aborted) {
            console.info(`Conversation already aborted for ${uid}`);
            ongoingConvo.delete(uid);
            return;
        }

        const stream = await openai.responses.stream({
            model: 'gpt-4.1-mini',
            input: [
                {role: 'system', content: system_prompt},
                ...messages
            ],
            max_output_tokens: 384,
        });

        let buffer = "";
        let batching = false;
        let isAborted = false;

        // Listen for abort signal
        abortController.signal.addEventListener('abort', () => {
            isAborted = true;
            console.info(`Stream abort signal received for ${uid}`);
            try {
                if (stream && typeof (stream as any).destroy === 'function') {
                    (stream as any).destroy();
                } else if (stream && typeof (stream as any).abort === 'function') {
                    (stream as any).abort();
                }
            } catch (e) {
                console.warn(`Error destroying stream for ${uid}:`, e);
            }
            ongoingConvo.delete(uid);
        });

        const flush = () => {
            if (!buffer || isAborted) return;
            const chunk = buffer;
            buffer = "";
            elberResponse.payload = { delta: chunk }
            emitMessage('elber:stream', elberResponse)
        };

        stream.on("event", (event: any) => {
            if (isAborted) return; // Skip processing if aborted

            if (event.type === "response.output_text.delta") {
                const delta = event.delta || event.output_text?.delta || "";
                if (!delta) return;
                buffer += delta;

                if (!batching) {
                    batching = true;
                    setTimeout(() => {
                        batching = false;
                        flush();
                    }, 100);
                }
            }

            if (event.type === "response.completed") {
                if (isAborted) return;
                flush();
                elberResponse.payload = {
                    final: { text: event.response?.output_text ?? "" },
                    usage: event.response?.usage ?? null,
                }

                emitMessage('elber:response', elberResponse );
                ongoingConvo.delete(uid);
            }

            if (event.type === "response.error") {
                console.log('ERROR')
                if (isAborted) return;
                flush();
                elberResponse.payload = { message: event.error?.message ?? "unknown error" }
                emitMessage('elber:error', elberResponse);
                ongoingConvo.delete(uid);
            }
        });

        stream.on("end", () => {
            if (!isAborted) {
                ongoingConvo.delete(uid);
            }
        });

        stream.on("error", (e: any) => {
            console.log('ERROR')
            // If it's an abort-related error, handle it gracefully
            if (isAborted || e.name === 'APIUserAbortError' || e.constructor.name === 'APIUserAbortError' || e.message?.includes('abort')) {
                console.info(`Stream aborted gracefully for ${uid}`);
                ongoingConvo.delete(uid);
                return;
            }
            
            flush();
            elberResponse.payload = { message: "stream error", detail: String(e) }
            emitMessage('elber:error', elberResponse);
            ongoingConvo.delete(uid);
        });
        
    } catch (err: any) {
        console.log('ERROR')
        elberResponse.payload = { message: err?.message ?? "init error" }
        emitMessage('elber:error', elberResponse);
        ongoingConvo.delete(uid);
    }
}

export default quickChat