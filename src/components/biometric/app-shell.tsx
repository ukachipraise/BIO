"use client";

import { useState, useEffect } from 'react';
import type { Device, CapturedDataSet, WorkflowStatus, CapturedImage, CaptureStepId } from '@/lib/types';
import { CAPTURE_STEPS, INITIAL_DEVICES } from '@/lib/constants';
import { generateUniqueId, urlToDataUri, exportToSql } from '@/lib/utils';
import { getPlaceholderImage } from '@/lib/placeholder-images';
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

  useEffect(() => {
    setIsClient(true);
    // Simulate device connection check
    setTimeout(() => {
      setDevices([
        { name: 'Phone Camera', status: 'connected' },
        { name: 'Fingerprint Scanner', status: 'connected' },
      ]);
    }, 1500);
  }, []);

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

  const handleImageCapture = async () => {
    if (!currentCaptureData) return;

    const currentStep = CAPTURE_STEPS[currentStepIndex];
    const imageUrl = getPlaceholderImage(currentStep.placeholderId)?.imageUrl;
    if (!imageUrl) return;

    let updatedImages = { ...currentCaptureData.images };
    updatedImages[currentStep.id] = {
      ...updatedImages[currentStep.id],
      feedbackLoading: true,
      url: imageUrl,
      stepId: currentStep.id,
    };
    setCurrentCaptureData({ ...currentCaptureData, images: updatedImages });

    const dataUri = await urlToDataUri(imageUrl);
    let feedback = null;
    if (currentStep.device === 'camera' && dataUri) {
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
    }
    
    updatedImages = { ...currentCaptureData.images }; // Re-fetch in case state changed
    updatedImages[currentStep.id] = {
      stepId: currentStep.id,
      url: imageUrl,
      dataUri,
      qualityFeedback: feedback,
      feedbackLoading: false,
    };
    setCurrentCaptureData({ ...currentCaptureData, images: updatedImages });
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
              onAccept={handleAcceptImage}
              onRecapture={handleRecapture}
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
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Biometric Capture Pro &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
