
export interface PatientMetadata {
  name: string;
  id: string;
  birthDate: string;
  sex: string;
  modality: string;
  studyDate: string;
  studyDescription: string;
  institution: string;
}

export interface AnalysisResult {
  summary: string;
  findings: string[];
  anatomicalRegion: string;
  confidence: number;
}

export type ToolType = 'window' | 'zoom' | 'pan' | 'none';

export interface ScanRecord {
  id: string;
  created_at: string;
  file_path: string;
  patient_name: string;
  patient_id: string;
  modality: string;
  study_date: string;
  institution: string;
  analyses?: AnalysisResult[];
}


// Global type augmentation for Cornerstone which is loaded via CDN
declare global {
  interface Window {
    cornerstone: any;
    cornerstoneWADOImageLoader: any;
    dicomParser: any;
  }
}
