import { vi, describe, it, expect } from 'vitest';
import { analyzeScan } from './gemini';

// Mock GoogleGenAI at the top level
vi.mock('@google/genai', () => {
    const MockGoogleGenAI = vi.fn().mockImplementation(function (this: { models: unknown }) {
        this.models = {
            generateContent: vi.fn().mockResolvedValue({
                text: 'Mocked analysis result',
            }),
        };
    });

    return {
        GoogleGenAI: MockGoogleGenAI,
        Type: {
            OBJECT: 'OBJECT',
            STRING: 'STRING',
            NUMBER: 'NUMBER',
        },
    };
});

describe('Gemini Service', () => {
    it('analyzeScan should return analysis text', async () => {
        const result = await analyzeScan('data:image/png;base64,test');
        expect(result).toBe('Mocked analysis result');
    });
});
