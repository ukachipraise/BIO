"use client";

import Image from "next/image";
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
import { Camera, Check, RefreshCw, Loader2, Sparkles, X, ThumbsDown, ThumbsUp } from "lucide-react";
import { getPlaceholderImage } from "@/lib/placeholder-images";
import type { CaptureStep, CapturedImage } from "@/lib/types";

interface CaptureViewProps {
  step: CaptureStep;
  progress: { current: number; total: number };
  capturedImage: CapturedImage | undefined;
  onCapture: () => void;
  onAccept: () => void;
  onRecapture: () => void;
}

function ImageQualityCard({ image }: { image: CapturedImage }) {
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

export function CaptureView({
  step,
  progress,
  capturedImage,
  onCapture,
  onAccept,
  onRecapture,
}: CaptureViewProps) {
  const previewUrl = getPlaceholderImage(step.previewId)?.imageUrl ?? "/placeholder.svg";
  const displayUrl = capturedImage?.url ?? previewUrl;

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
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
          <Image
            src={displayUrl}
            alt={capturedImage ? "Captured image" : "Live preview"}
            fill
            className="object-cover"
            data-ai-hint={capturedImage ? "fingerprint photo" : "live feed"}
          />
          {!capturedImage && (
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              Live Preview
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center space-y-4">
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
          <Button onClick={onCapture} size="lg">
            <Camera className="mr-2" /> Capture
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
