import React, { useState, useEffect, useRef, useCallback } from 'react';
import { analyzeScan } from './services/gemini';
import { uploadScan, saveAnalysis, getRecentScans } from './services/supabase';
import { PatientMetadata, ToolType, ScanRecord } from './types';

import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import Viewer from './components/Viewer';

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<PatientMetadata | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('window');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    try {
      const scans = await getRecentScans();
      setHistory(scans);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    // Initialize Cornerstone
    if (window.cornerstone && window.cornerstoneWADOImageLoader) {
      console.log("Initializing Cornerstone libraries...");
      window.cornerstoneWADOImageLoader.external.cornerstone = window.cornerstone;
      window.cornerstoneWADOImageLoader.external.dicomParser = window.dicomParser;

      // Register the WADO-URI image loader explicitly
      if (window.cornerstoneWADOImageLoader.wadouri) {
        window.cornerstoneWADOImageLoader.wadouri.external.cornerstone = window.cornerstone;
        window.cornerstoneWADOImageLoader.wadouri.external.dicomParser = window.dicomParser;
        console.log("WADO-URI loader registered.");
      }

      const config = {
        webWorkerPath: 'https://unpkg.com/cornerstone-wado-image-loader@3.1.2/dist/cornerstoneWADOImageLoaderWebWorker.min.js',
        taskConfiguration: {
          decodeTask: {
            codecsPath: 'https://unpkg.com/cornerstone-wado-image-loader@3.1.2/dist/cornerstoneWADOImageLoaderCodecs.min.js'
          }
        }
      };
      window.cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
      setIsReady(true);
      console.log("Cornerstone ready.");
    }
  }, []);

  useEffect(() => {
    const currentViewer = viewerRef.current;
    if (isReady && currentViewer) {
      if (!window.cornerstone.getEnabledElement(currentViewer)) {
        window.cornerstone.enable(currentViewer);
      }

      const handleResize = () => {
        if (currentViewer) {
          window.cornerstone.resize(currentViewer);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (currentViewer) {
          try {
            window.cornerstone.disable(currentViewer);
          } catch (e) {
            console.warn("Cornerstone disable error:", e);
          }
        }
      };
    }
  }, [isReady]);

  const loadDicomFile = async (file: File) => {
    setSelectedFile(file);
    setAnalysisText('');
    setCurrentScanId(null);

    const imageId = window.cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
    console.log("Loading Image ID:", imageId);

    try {
      if (!viewerRef.current) throw new Error("Viewer element not found");

      // Ensure element is enabled
      if (!window.cornerstone.getEnabledElement(viewerRef.current)) {
        console.log("Enabling cornerstone element...");
        window.cornerstone.enable(viewerRef.current);
      }

      const image = await window.cornerstone.loadImage(imageId);
      console.log("Image loaded successfully:", image);

      window.cornerstone.displayImage(viewerRef.current, image);
      console.log("Image displayed. Forcing viewport updates...");

      // Default viewport settings with safety checks
      const viewport = window.cornerstone.getViewport(viewerRef.current);
      if (viewport) {
        viewport.voi.windowWidth = image.windowWidth || 400;
        viewport.voi.windowCenter = image.windowCenter || 40;
        window.cornerstone.setViewport(viewerRef.current, viewport);
      }

      // Reinforce visibility: Resize, Update, Fit
      window.cornerstone.resize(viewerRef.current, true);
      window.cornerstone.fitToWindow(viewerRef.current);
      window.cornerstone.updateImage(viewerRef.current);

      console.log("Rendering pipeline completed with fitToWindow.");
      const ds = image.data;
      const newMetadata = {
        name: ds.string('x00100010') || 'N/A',
        id: ds.string('x00100020') || 'N/A',
        birthDate: ds.string('x00100030') || 'N/A',
        sex: ds.string('x00100040') || 'N/A',
        modality: ds.string('x00080060') || 'N/A',
        studyDate: ds.string('x00080020') || 'N/A',
        studyDescription: ds.string('x00081030') || 'N/A',
        institution: ds.string('x00080080') || 'N/A',
      };
      setMetadata(newMetadata);

      // Upload to Supabase
      uploadScan(file, newMetadata).then((data) => {
        if (data) {
          setCurrentScanId(data.id);
          loadHistory();
        }
      });

      // Default viewport settings
      const viewport = window.cornerstone.getViewport(viewerRef.current);
      viewport.voi.windowWidth = image.windowWidth || 400;
      viewport.voi.windowCenter = image.windowCenter || 40;
      window.cornerstone.setViewport(viewerRef.current, viewport);

      // Force Resize, Update and Fit
      window.cornerstone.updateImage(viewerRef.current);
      window.cornerstone.resize(viewerRef.current, true);
      window.cornerstone.fitToWindow(viewerRef.current);
      console.log("Rendering pipeline completed.");

    } catch (err) {
      console.error("Error loading image:", err);
      alert("Error loading DICOM file. Please ensure it's a valid DICOM.");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await loadDicomFile(file);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!viewerRef.current || activeTool === 'none') return;

    const element = viewerRef.current;
    let lastX = e.pageX;
    let lastY = e.pageY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.pageX - lastX;
      const deltaY = moveEvent.pageY - lastY;
      lastX = moveEvent.pageX;
      lastY = moveEvent.pageY;

      const viewport = window.cornerstone.getViewport(element);

      if (activeTool === 'window') {
        viewport.voi.windowWidth += deltaX * 2;
        viewport.voi.windowCenter += deltaY * 2;
      } else if (activeTool === 'pan') {
        viewport.translation.x += (deltaX / viewport.scale);
        viewport.translation.y += (deltaY / viewport.scale);
      } else if (activeTool === 'zoom') {
        viewport.scale += (deltaY / 100);
      }

      window.cornerstone.setViewport(element, viewport);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const resetViewport = () => {
    if (viewerRef.current) {
      window.cornerstone.reset(viewerRef.current);
      window.cornerstone.fitToWindow(viewerRef.current);
      window.cornerstone.updateImage(viewerRef.current);
    }
  };

  const runAnalysis = async () => {
    if (!viewerRef.current) return;
    setIsAnalyzing(true);

    try {
      const canvas = viewerRef.current.querySelector('canvas');
      if (!canvas) throw new Error("Canvas not found");

      const base64Image = canvas.toDataURL('image/png');
      const result = await analyzeScan(base64Image);

      const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
      setAnalysisText(resultText);

      if (currentScanId) {
        const analysisData = typeof result === 'string'
          ? { summary: result, findings: [], anatomicalRegion: 'Unknown', confidence: 0 }
          : result;

        await saveAnalysis(currentScanId, analysisData);
        loadHistory();
      }

    } catch (err) {
      setAnalysisText("Analysis failed. Please check your API key or connection.");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-200 font-sans overflow-hidden">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        metadata={metadata}
        history={history}
        isAnalyzing={isAnalyzing}
        analysisText={analysisText}
        onFileSelect={handleFileSelect}
        onRunAnalysis={runAnalysis}
        onHistorySelect={(scan) => {
          console.log("Selected from history:", scan);
          alert("Re-loading from history is currently simulated in this demo.");
        }}
        selectedFile={selectedFile}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onReset={resetViewport}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          isSidebarOpen={isSidebarOpen}
          fileName={selectedFile?.name || null}
        />

        <Viewer
          viewerRef={viewerRef}
          selectedFile={selectedFile}
          metadata={metadata}
          activeTool={activeTool}
          onMouseDown={handleMouseDown}
        />
      </div>
    </div>
  );
};

export default App;
