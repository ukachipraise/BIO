import type { ImageQualityFeedbackOutput } from '@/ai/flows/real-time-image-quality-feedback';
import type { NfiqQualityFeedbackOutput } from '@/ai/flows/nfiq2-quality-feedback';

export type CaptureStepId = 'CAMERA_INDEX' | 'CAMERA_THUMB' | 'SCANNER_INDEX' | 'SCANNER_THUMB';

export interface CaptureStep {
  id: CaptureStepId;
  title: string;
  instructions: string;
  device: 'camera' | 'scanner';
  placeholderId: string;
  previewId: string;
}

export type DeviceStatus = 'connected' | 'disconnected' | 'checking';

export interface Device {
  name: 'Phone Camera' | 'Fingerprint Scanner';
  status: DeviceStatus;
}

export type CapturedImage = {
  stepId: CaptureStepId;
  url: string;
  dataUri?: string;
  qualityFeedback?: ImageQualityFeedbackOutput | null;
  nfiqFeedback?: NfiqQualityFeedbackOutput | null;
  feedbackLoading?: boolean;
  device: 'camera' | 'scanner';
  isBinary?: boolean;
  fileName?: string;
};

export type CapturedDataSet = {
  id: string;
  images: Partial<Record<CaptureStepId, CapturedImage>>;
  timestamp: string;
};

export type WorkflowStatus = 'IDLE' | 'CAPTURING' | 'VALIDATING';
