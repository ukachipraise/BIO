"use client";

import { useState, useEffect, useRef } from 'react';
import type { Device, CapturedDataSet, WorkflowStatus, CapturedImage, CaptureStepId } from '@/lib/types';
import { CAPTURE_STEPS, INITIAL_DEVICES } from '@/lib/constants';
import { generateUniqueId, exportToSql } from '@/lib/utils';
import { getImageQualityFeedback } from '@/ai/flows/real-time-image-quality-feedback';
import { useToast } from "@/hooks/use-toast";

import { Header } from './header';
import { DatabaseDialog } from './database-dialog';
import { DeviceStatus } from './device-status';
import { WorkflowIdleView } from './workflow-idle-view';
import { CaptureView } from './capture-view';
import { ValidationView } from './validation-view';

export function AppShell() {
  const [isClient, setIsClient] = useState(false);
  const [databaseName, setDatabaseName] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [allRecords, setAllRecords] = useState<CapturedDataSet[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('IDLE');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentCaptureData, setCurrentCaptureData] = useState<CapturedDataSet | null>(null);
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setIsClient(true);
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setDevices(prev => prev.map(d => d.name === 'Phone Camera' ? { ...d, status: 'connected' } : d));
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
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
    };
    getCameraPermission();

    // Simulate fingerprint scanner connection
    setTimeout(() => {
      setDevices(prev => prev.map(d => d.name === 'Fingerprint Scanner' ? { ...d, status: 'connected' } : d));
    }, 1500);

  }, [toast]);

  const handleDbSelect = (name: string) => {
    setDatabaseName(name);
    toast({ title: "Database Ready", description: `Connected to ${name}.` });
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

  const processImage = async (dataUri: string, device: 'camera' | 'scanner') => {
    if (!currentCaptureData) return;
    const currentStep = CAPTURE_STEPS[currentStepIndex];

    let updatedImages = { ...currentCaptureData.images };
    updatedImages[currentStep.id] = {
      stepId: currentStep.id,
      url: dataUri,
      dataUri,
      feedbackLoading: device === 'camera', // Only show loading for camera
      device,
    };
    setCurrentCaptureData({ ...currentCaptureData, images: updatedImages });

    if (device === 'camera') {
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
          processImage(dataUri, 'camera');
        }
    }
  };

  const handleFileUpload = (file: File) => {
    const currentStep = CAPTURE_STEPS[currentStepIndex];
    if (!currentCaptureData || !currentStep) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        if (dataUri) {
          processImage(dataUri, currentStep.device);
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
    if (!currentCaptureData) return;
    setAllRecords(prev => [...prev, currentCaptureData]);
    toast({
      title: "Record Saved",
      description: `Data for ID ${currentCaptureData.id} has been saved successfully.`,
    });
    handleResetWorkflow();
  };

  const handleResetWorkflow = () => {
    setWorkflowStatus('IDLE');
    setCurrentStepIndex(0);
    setCurrentCaptureData(null);
  };
  
  const handleExport = () => {
    if (allRecords.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data to Export",
        description: "Capture some records before exporting.",
      });
      return;
    }

    exportToSql(allRecords, `${databaseName || 'biometric-data'}.sql`);
    toast({ title: "Export Successful", description: `Data exported to ${databaseName || 'biometric-data'}.sql` });
  };

  if (!isClient) return null;
  if (!databaseName) return <DatabaseDialog onDbSelect={handleDbSelect} />;

  const currentStep = CAPTURE_STEPS[currentStepIndex];
  const capturedImage = currentCaptureData?.images[currentStep?.id as CaptureStepId];

  return (
    <div className="flex flex-col min-h-screen">
      <Header databaseName={databaseName} onExport={handleExport} recordCount={allRecords.length} />
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
