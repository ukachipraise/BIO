import type { CaptureStep, Device } from '@/lib/types';

export const CAPTURE_STEPS: CaptureStep[] = [
  { id: 'CAMERA_INDEX', title: 'Capture Index Finger Photo', instructions: 'Position the subject\'s RIGHT INDEX finger in front of the phone camera.', device: 'camera', placeholderId: 'camera-index-capture', previewId: 'camera-preview' },
  { id: 'CAMERA_THUMB', title: 'Capture Thumb Photo', instructions: 'Position the subject\'s RIGHT THUMB in front of the phone camera.', device: 'camera', placeholderId: 'camera-thumb-capture', previewId: 'camera-preview' },
  { id: 'SCANNER_INDEX', title: 'Scan Index Finger', instructions: 'Place the subject\'s RIGHT INDEX finger on the fingerprint scanner.', device: 'scanner', placeholderId: 'scanner-index-capture', previewId: 'scanner-preview' },
  { id: 'SCANNER_THUMB', title: 'Scan Thumb', instructions: 'Place the subject\'s RIGHT THUMB on the fingerprint scanner.', device: 'scanner', placeholderId: 'scanner-thumb-capture', previewId: 'scanner-preview' },
];

export const INITIAL_DEVICES: Device[] = [
  { name: 'Phone Camera', status: 'checking' },
  { name: 'Fingerprint Scanner', status: 'checking' },
];
