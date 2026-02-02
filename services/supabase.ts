import { createClient } from '@supabase/supabase-js';
import { PatientMetadata, AnalysisResult, ScanRecord } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials missing. Supabase features will be disabled.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export const uploadScan = async (file: File, metadata: PatientMetadata) => {
    if (!supabaseUrl) return null;

    try {
        const timestamp = Date.now();
        const filePath = `scans/${timestamp}_${file.name}`;

        // 1. Upload file to Storage
        const { error: uploadError } = await supabase.storage
            .from('dicom-scans')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        // 2. Insert metadata into DB
        const { data, error: dbError } = await supabase
            .from('scans')
            .insert({
                file_path: filePath,
                patient_name: metadata.name,
                patient_id: metadata.id,
                modality: metadata.modality,
                study_date: metadata.studyDate,
                institution: metadata.institution
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return data;
    } catch (error) {
        console.error('Error uploading scan:', error);
        throw error;
    }
};

export const saveAnalysis = async (scanId: string, analysis: AnalysisResult) => {
    if (!supabaseUrl) return null;

    try {
        const { data, error } = await supabase
            .from('analyses')
            .insert({
                scan_id: scanId,
                summary: analysis.summary,
                findings: analysis.findings,
                anatomical_region: analysis.anatomicalRegion,
                confidence: analysis.confidence
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving analysis:', error);
        throw error;
    }
};

export const getRecentScans = async (): Promise<ScanRecord[]> => {
    if (!supabaseUrl) return [];

    try {
        const { data, error } = await supabase
            .from('scans')
            .select(`
        *,
        analyses (
          summary,
          findings,
          anatomical_region,
          confidence
        )
      `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data as ScanRecord[];
    } catch (error) {
        console.error('Error fetching scans:', error);
        return [];
    }
};
