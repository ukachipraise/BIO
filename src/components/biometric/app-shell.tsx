
"use client";

import { useState, useEffect, useRef } from 'react';
import type { Device, CapturedDataSet, WorkflowStatus, CapturedImage, CaptureStepId } from '@/lib/types';
import { CAPTURE_STEPS, INITIAL_DEVICES } from '@/lib/constants';
import { generateUniqueId, exportToSql, exportToCsv, exportToIpynb } from '@/lib/utils';
import { getImageQualityFeedback } from '@/ai/flows/real-time-image-quality-feedback';
import { useToast } from "@/hooks/use-toast";

import { Header } from './header';
import { DatabaseDialog } from './database-dialog';
import { DeviceStatus } from './device-status';
import { WorkflowIdleView } from './workflow-idle-view';
import { CaptureView } from './capture-view';
import { ValidationView } from './validation-view';
import { LoadingView } from './loading-view';
import { LandingPage } from './landing-page';

type SavedDatabases = Record<string, CapturedDataSet[]>;

export function AppShell() {
  const [isClient, setIsClient] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [databaseName, setDatabaseName] = useState<string | null>(null);
  const [savedDatabases, setSavedDatabases] = useState<SavedDatabases>({});
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [allRecords, setAllRecords] = useState<CapturedDataSet[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('IDLE');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentCaptureData, setCurrentCaptureData] = useState<CapturedDataSet | null>(null);
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setIsClient(true);
    
    // Load saved databases from localStorage
    try {
      const saved = localStorage.getItem('biometric-databases');
      if (saved) {
        setSavedDatabases(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load databases from localStorage", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not load saved sessions.' });
    }

    const initializeApp = async () => {
      let cameraConnected = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setDevices(prev => prev.map(d => d.name === 'Phone Camera' ? { ...d, status: 'connected' } : d));
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        cameraConnected = true;
      } catch (error) {
        console.error('Error accessing camera:', error);
        setDevices(prev => prev.map(d => d.name === 'Phone Camera' ? { ...d, status: 'disconnected' } : d));
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }

      // Simulate fingerprint scanner connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDevices(prev => prev.map(d => d.name === 'Fingerprint Scanner' ? { ...d, status: 'connected' } : d));

      // Hide loading screen after a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsInitializing(false);
    };

    initializeApp();

  }, [toast]);
  
  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const handleDbSelect = (name: string) => {
    setDatabaseName(name);
    // If it's a new DB, allRecords is empty. If existing, load it.
    const existingRecords = savedDatabases[name] || [];
    setAllRecords(existingRecords);
    toast({ title: "Database Ready", description: `Session '${name}' started.` });
  };

  const handleDeleteDb = (name: string) => {
    const newSavedDbs = { ...savedDatabases };
    delete newSavedDbs[name];
    setSavedDatabases(newSavedDbs);
    try {
      localStorage.setItem('biometric-databases', JSON.stringify(newSavedDbs));
      toast({ title: 'Session Deleted', description: `Session '${name}' has been removed.` });
    } catch (error) {
      console.error("Failed to save databases to localStorage", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update saved sessions.' });
    }
  };

  const handleGoBack = () => {
    setDatabaseName(null);
    setAllRecords([]);
    handleResetWorkflow();
  };

  const handleCancelDbSelect = () => {
    setShowLanding(true);
  };

  const handleStartCapture = () => {
    setWorkflowStatus('CAPTURING');
    setCurrentStepIndex(0);
    setCurrentCaptureData({
      id: generateUniqueId(),
      images: {},
      timestamp: new Date().toISOString(),
    });
  };

  const processImage = async (dataUri: string, device: 'camera' | 'scanner', isBinary: boolean = false, fileName?: string) => {
    if (!currentCaptureData) return;
    const currentStep = CAPTURE_STEPS[currentStepIndex];

    let updatedImages = { ...currentCaptureData.images };
    updatedImages[currentStep.id] = {
      stepId: currentStep.id,
      url: dataUri,
      dataUri,
      feedbackLoading: device === 'camera' && !isBinary, // Only show loading for camera images
      device,
      isBinary,
      fileName,
    };
    setCurrentCaptureData({ ...currentCaptureData, images: updatedImages });

    if (device === 'camera' && !isBinary) {
      let feedback = null;
      try {
        feedback = await getImageQualityFeedback({ photoDataUri: dataUri });
      } catch (error) {
        console.error("AI feedback failed:", error);
        toast({
          variant: "destructive",
          title: "AI Analysis Failed",
          description: "Could not get image quality feedback.",
        });
      }
      
      // Re-fetch state in case it changed during async operation
      setCurrentCaptureData(prevData => {
        if (!prevData) return null;
        const freshImages = { ...prevData.images };
        freshImages[currentStep.id] = {
          ...freshImages[currentStep.id],
          qualityFeedback: feedback,
          feedbackLoading: false,
        };
        return { ...prevData, images: freshImages };
      });
    }
  };

  const handleImageCapture = async () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          const dataUri = canvas.toDataURL('image/jpeg');
          processImage(dataUri, 'camera', false);
        }
    }
  };

  const handleFileUpload = (file: File) => {
    const currentStep = CAPTURE_STEPS[currentStepIndex];
    if (!currentCaptureData || !currentStep) return;

    const isBinary = !file.type.startsWith('image/');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        if (dataUri) {
            processImage(dataUri, currentStep.device, isBinary, file.name);
        }
    };
    reader.onerror = () => {
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the selected file.",
        });
    };
    reader.readAsDataURL(file);
  };
  
  const handleAcceptImage = () => {
    if (currentStepIndex < CAPTURE_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setWorkflowStatus('VALIDATING');
    }
  };

  const handleRecapture = () => {
    if (!currentCaptureData) return;
    const currentStepId = CAPTURE_STEPS[currentStepIndex].id;
    const { [currentStepId]: _, ...restImages } = currentCaptureData.images;
    setCurrentCaptureData({ ...currentCaptureData, images: restImages });
  };
  
  const handleSaveRecord = () => {
    if (!currentCaptureData || !databaseName) return;
    
    const updatedRecords = [...allRecords, currentCaptureData];
    setAllRecords(updatedRecords);

    const newSavedDbs = { ...savedDatabases, [databaseName]: updatedRecords };
    setSavedDatabases(newSavedDbs);
    try {
      localStorage.setItem('biometric-databases', JSON.stringify(newSavedDbs));
      toast({
        title: "Record Saved",
        description: `Data for ID ${currentCaptureData.id} has been saved successfully to session '${databaseName}'.`,
      });
    } catch (error) {
      console.error("Failed to save to localStorage", error);
      toast({ variant: 'destructive', title: 'Save Error', description: 'Could not save session to local storage.' });
    }
    
    handleResetWorkflow();
  };

  const handleResetWorkflow = () => {
    setWorkflowStatus('IDLE');
    setCurrentStepIndex(0);
    setCurrentCaptureData(null);
  };
  
  const handleExport = (format: 'sql' | 'csv' | 'ipynb') => {
    if (allRecords.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data to Export",
        description: "Capture some records before exporting.",
      });
      return;
    }

    const fileNameBase = databaseName || 'biometric-data';

    if (format === 'sql') {
      exportToSql(allRecords, `${fileNameBase}.sql`);
      toast({ title: "Export Successful", description: `Data exported to ${fileNameBase}.sql` });
    } else if (format === 'csv') {
      // We need to flatten the data for CSV export
      const flattenedData = allRecords.flatMap(record => 
        Object.values(record.images).map(image => ({
          record_id: record.id,
          timestamp: record.timestamp,
          step_id: image.stepId,
          device: image.device,
          is_binary: image.isBinary,
          file_name: image.fileName,
          quality_score: image.qualityFeedback?.qualityScore,
          blur_level: image.qualityFeedback?.blurLevel,
          lighting_condition: image.qualityFeedback?.lightingCondition,
          feedback: image.qualityFeedback?.feedback,
          // url is too long for CSV, so we omit it or provide a truncated version
          // url: image.url.substring(0, 30) + '...',
        }))
      );
      exportToCsv(flattenedData, `${fileNameBase}.csv`);
      toast({ title: "Export Successful", description: `Data exported to ${fileNameBase}.csv` });
    } else if (format === 'ipynb') {
      exportToIpynb(allRecords, `${fileNameBase}.ipynb`);
      toast({ title: "Export Successful", description: `Data exported to ${fileNameBase}.ipynb` });
    }
  };

  if (!isClient || isInitializing) return <LoadingView />;
  if (showLanding) return <LandingPage onGetStarted={handleGetStarted} />;
  if (!databaseName) {
    return <DatabaseDialog onDbSelect={handleDbSelect} onCancel={handleCancelDbSelect} savedDbs={Object.keys(savedDatabases)} onDeleteDb={handleDeleteDb} />;
  }

  const currentStep = CAPTURE_STEPS[currentStepIndex];
  const capturedImage = currentCaptureData?.images[currentStep?.id as CaptureStepId];

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        databaseName={databaseName} 
        onExport={handleExport} 
        recordCount={allRecords.length} 
        onGoBack={handleGoBack}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid gap-8">
          <DeviceStatus devices={devices} />
          
          {workflowStatus === 'IDLE' && <WorkflowIdleView onStart={handleStartCapture} />}
          
          {workflowStatus === 'CAPTURING' && currentStep && (
            <CaptureView
              step={currentStep}
              progress={{ current: currentStepIndex + 1, total: CAPTURE_STEPS.length }}
              capturedImage={capturedImage}
              onCapture={handleImageCapture}
              onFileUpload={handleFileUpload}
              onAccept={handleAcceptImage}
              onRecapture={handleRecapture}
              videoRef={videoRef}
              hasCameraPermission={hasCameraPermission}
            />
          )}

          {workflowStatus === 'VALIDATING' && currentCaptureData && (
            <ValidationView
              captureData={currentCaptureData}
              onSave={handleSaveRecord}
              onDiscard={handleResetWorkflow}
            />
          )}
        </div>
      </main>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Biometric Capture Pro &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

    