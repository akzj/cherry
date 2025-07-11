import { describe, it, expect, beforeEach } from 'vitest';
import { sendMessage, loadMessages, setMockUserId } from './api';
import { db, resetDb } from './data/db';

const conversationId = 'conv1';

beforeEach(() => {
    setMockUserId('test-user');
});


describe('mock/api', () => {
    beforeEach(async () => {
        await resetDb();
        db.data.messagesMap[conversationId] = [];
    });

    it('should send a message and store it in messagesMap', async () => {
        await sendMessage(conversationId, 'hello', 'text', undefined);
        expect(db.data.messagesMap[conversationId].length).toBe(1);
        const msg = db.data.messagesMap[conversationId][0];
        expect(msg.content).toBe('hello');
        expect(msg.type_).toBe('text');
        expect(msg.conversation_id).toBe(conversationId);
    });

    it('should load messages backward (older)', async () => {
        // 先插入3条消息
        for (let i = 0; i < 3; i++) {
            await sendMessage(conversationId, `msg${i}`, 'text', undefined);
        }
        const all = db.data.messagesMap[conversationId];
        const lastId = all[2].id;
        const result = await loadMessages(conversationId, lastId, 'backward', 2);
        expect(result).not.toBeNull();
        if (result) {
            expect(result.length).toBe(2);
            expect(result[0].content).toBe('msg0');
            expect(result[1].content).toBe('msg1');
        }
    });

    it('should load messages forward (newer)', async () => {
        for (let i = 0; i < 3; i++) {
            await sendMessage(conversationId, `msg${i}`, 'text', undefined);
        }
        const all = db.data.messagesMap[conversationId];
        const firstId = all[0].id;
        const result = await loadMessages(conversationId, firstId, 'forward', 2);
        expect(result).not.toBeNull();
        if (result) {
            expect(result.length).toBe(2);
            expect(result[0].content).toBe('msg1');
            expect(result[1].content).toBe('msg2');
        }
    });

    it('should return null if no messages found', async () => {
        const result = await loadMessages('not_exist', 123, 'backward', 2);
        expect(result).toBeNull();
    });
}); 