import { vi, describe, it, expect, beforeEach } from 'vitest';
import { uploadScan, saveAnalysis } from './supabase';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(() => ({
        storage: {
            from: vi.fn(() => ({
                upload: vi.fn().mockResolvedValue({ data: { path: 'test' }, error: null }),
            })),
        },
        from: vi.fn(() => ({
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
                })),
            })),
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    limit: vi.fn().mockResolvedValue({ data: [], error: null }),
                })),
            })),
        })),
    })),
}));

describe('Supabase Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('uploadScan should upload file and insert metadata', async () => {
        const file = new File([''], 'test.dcm');
        const metadata = {
            name: 'John Doe',
            id: '123',
            birthDate: '19800101',
            sex: 'M',
            modality: 'CT',
            studyDate: '20230101',
            studyDescription: 'Chest CT',
            institution: 'Hospital',
        };

        const result = await uploadScan(file, metadata);
        expect(result).toEqual({ id: '123' });
    });

    it('saveAnalysis should insert analysis record', async () => {
        const analysis = {
            summary: 'Normal scan',
            findings: [],
            anatomicalRegion: 'Brain',
            confidence: 0.95,
        };

        const result = await saveAnalysis('123', analysis);
        expect(result).toEqual({ id: '123' });
    });
});
