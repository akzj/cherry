// tauri api
import { Message } from "@/types";
import { db } from './data/db'
import { useRef } from "react";

let user_id = "";
// 可根据需要提供设置 user_id 的方法
export function setMockUserId(id: string) {
  user_id = id;
}

export const sendMessage = async (
    conversationId: string,
    content: string,
    messageType?: string,
    replyTo?: number
) => {
    db.data.messagesMap[conversationId].push({
        content: content,
        conversation_id: conversationId,
        type_: (messageType as Message["type_"]) || 'text',
        reply_to: replyTo,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        user_id: user_id || "",
    })
    await db.write()
};

export const loadMessages = async (conversationId: string, messageId: number, direction: 'forward' | 'backward', limit: number) => {
    const messages = db.data.messagesMap[conversationId];
    if (!messages) {
        return null;
    }
    // Find the index of the message with the given messageId
    const idx = messages.findIndex((msg: Message) => msg.id === messageId);

    let result: Message[] = [];
    if (direction === 'backward') {
        // Load older messages (before messageId)
        // If idx === -1, load from the end
        const end = idx === -1 ? messages.length : idx;
        const start = Math.max(0, end - limit);
        result = messages.slice(start, end);
    } else {
        // Load newer messages (after messageId)
        // If idx === -1, load from the start
        const start = idx === -1 ? 0 : idx + 1;
        const end = Math.min(messages.length, start + limit);
        result = messages.slice(start, end);
    }
    return result;
};