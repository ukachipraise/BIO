
"use client";

import Image from "next/image";
import React, { useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, Check, RefreshCw, Loader2, Sparkles, ThumbsDown, ThumbsUp, VideoOff, Upload, File, Fingerprint } from "lucide-react";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import type { CaptureStep, CapturedImage } from "@/lib/types";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";

interface CaptureViewProps {
  step: CaptureStep;
  progress: { current: number; total: number };
  capturedImage: CapturedImage | undefined;
  onCapture: () => void;
  onFileUpload: (file: File) => void;
  onAccept: () => void;
  onRecapture: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  hasCameraPermission: boolean | null;
}

function ImageQualityCard({ image }: { image: CapturedImage }) {
  if (image.isBinary || image.device !== 'camera') return null;

  if (image.feedbackLoading) {
    return (
      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <AlertTitle>Analyzing Image...</AlertTitle>
        <AlertDescription>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Please wait while we assess the image quality.
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!image.qualityFeedback) return null;

  const { qualityScore, blurLevel, lightingCondition, feedback } = image.qualityFeedback;
  const isGoodQuality = qualityScore > 70;

  return (
    <Alert variant={isGoodQuality ? "default" : "destructive"} className={isGoodQuality ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : ""}>
      {isGoodQuality ? <ThumbsUp className="h-4 w-4" /> : <ThumbsDown className="h-4 w-4" />}
      <AlertTitle>{isGoodQuality ? "Good Quality Image" : "Needs Improvement"}</AlertTitle>
      <AlertDescription>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Quality Score:</span>
            <span className="font-bold">{qualityScore}/100</span>
          </div>
          <div className="flex justify-between">
            <span>Blur:</span>
            <span>{blurLevel}</span>
          </div>
          <div className="flex justify-between">
            <span>Lighting:</span>
            <span>{lightingCondition}</span>
          </div>
          <p className="pt-2 border-t mt-2">{feedback}</p>
        </div>
      </AlertDescription>
    </Alert>
  );
}

function CapturePreview({ step, capturedImage, videoRef, hasCameraPermission }: Pick<CaptureViewProps, 'step' | 'capturedImage' | 'videoRef' | 'hasCameraPermission'>) {
    const placeholderUrl = getPlaceholderImage(step.previewId)?.imageUrl ?? "/placeholder.svg";

    if (capturedImage) {
        if (capturedImage.isBinary) {
            return (
                <div className="flex flex-col items-center justify-center h-full bg-muted text-center p-4">
                    <File className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-foreground">File Uploaded</h3>
                    <p className="text-sm text-muted-foreground">{capturedImage.fileName}</p>
                </div>
            );
        }
        return <Image src={capturedImage.url} alt="Captured image" fill className="object-cover" />;
    }

    if (step.device === 'camera') {
        return (
            <>
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white p-4">
                        <VideoOff className="w-12 h-12 mb-4" />
                        <h3 className="text-lg font-semibold">Camera Access Denied</h3>
                        <p className="text-center text-sm">Please enable camera permissions in your browser settings.</p>
                    </div>
                )}
                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    Live Preview
                </div>
            </>
        );
    }
    
    // For scanner
    return (
        <>
            <Image src={placeholderUrl} alt="Scanner placeholder" fill className="object-cover opacity-20" data-ai-hint="fingerprint scan" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <Fingerprint className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="font-semibold text-foreground">Upload Fingerprint Data</p>
                <p className="text-sm text-muted-foreground">Select a file from your device.</p>
            </div>
        </>
    );
}

function FileUpload({ onFileUpload, idPrefix, accept }: { onFileUpload: (file: File) => void, idPrefix: string, accept: string }) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor={`${idPrefix}-upload`}>Upload File</Label>
          <Input id={`${idPrefix}-upload`} type="file" accept={accept} onChange={handleFileChange} ref={inputRef} />
          <p className="text-xs text-muted-foreground">Or upload a file from your device.</p>
        </div>
    );
}

export function CaptureView({
  step,
  progress,
  capturedImage,
  onCapture,
  onFileUpload,
  onAccept,
  onRecapture,
  videoRef,
  hasCameraPermission,
}: CaptureViewProps) {
  const isCameraStep = step.device === 'camera';
  const canCapture = isCameraStep ? hasCameraPermission : true;
  const fileAccept = "*/*";

  return (
    <Card>
      <CardHeader>
        <div className="mb-2">
            <Progress value={(progress.current / progress.total) * 100} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2 text-center">Step {progress.current} of {progress.total}</p>
        </div>
        <CardTitle>{step.title}</CardTitle>
        <CardDescription>{step.instructions}</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <CapturePreview 
                step={step} 
                capturedImage={capturedImage}
                videoRef={videoRef}
                hasCameraPermission={hasCameraPermission}
            />
        </div>
        <div className="flex flex-col justify-center space-y-4">
          {!capturedImage && (
             isCameraStep ? (
                <div className="space-y-4">
                    <Button onClick={onCapture} size="lg" disabled={!canCapture} className="w-full">
                        <Camera className="mr-2" /> Capture from Camera
                    </Button>
                    <div className="flex items-center gap-4">
                        <Separator className="flex-1" />
                        <span className="text-xs text-muted-foreground">OR</span>
                        <Separator className="flex-1" />
                    </div>
                    <FileUpload onFileUpload={onFileUpload} idPrefix="camera" accept={fileAccept} />
                </div>
            ) : (
                <FileUpload onFileUpload={onFileUpload} idPrefix="scanner" accept={fileAccept} />
            )
          )}
          {capturedImage && <ImageQualityCard image={capturedImage} />}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        {capturedImage ? (
          <>
            <Button variant="outline" onClick={onRecapture} disabled={capturedImage.feedbackLoading}>
              <RefreshCw className="mr-2" /> Recapture
            </Button>
            <Button onClick={onAccept} className="bg-accent hover:bg-accent/90" disabled={capturedImage.feedbackLoading}>
              <Check className="mr-2" /> Accept & Continue
            </Button>
          </>
        ) : (
          <Button size="lg" disabled={true}>
            {isCameraStep ? <Camera className="mr-2" /> : <Upload className="mr-2" />}
            Awaiting Input...
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

    