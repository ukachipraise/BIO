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
import { Badge } from "@/components/ui/badge";
import { Save, Undo2, CheckCircle, File } from "lucide-react";
import type { CapturedDataSet } from "@/lib/types";
import { CAPTURE_STEPS } from "@/lib/constants";

interface ValidationViewProps {
  captureData: CapturedDataSet;
  onSave: () => void;
  onDiscard: () => void;
}

export function ValidationView({ captureData, onSave, onDiscard }: ValidationViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Validation & Confirmation</CardTitle>
        <CardDescription>
          Please review the captured images below. If they are satisfactory, save the record.
        </CardDescription>
        <div className="flex items-center gap-2 pt-2">
            <span className="text-sm font-medium">Unique ID:</span> 
            <Badge variant="secondary">{captureData.id}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {CAPTURE_STEPS.map(step => {
            const image = captureData.images[step.id];
            const isGoodQuality = image?.device === 'camera' 
              ? (image.qualityFeedback?.qualityScore ?? 0) > 70
              : true;

            return (
              <div key={step.id} className="space-y-2">
                <h3 className="font-medium text-sm text-center">{step.title}</h3>
                <div className="relative aspect-[3/2] w-full overflow-hidden rounded-lg border">
                  {image ? (
                    <>
                      {image.isBinary ? (
                        <div className="flex flex-col items-center justify-center h-full bg-muted text-center p-2">
                          <File className="w-10 h-10 text-muted-foreground mb-2" />
                          <p className="text-xs font-semibold text-foreground truncate w-full px-1">{image.fileName}</p>
                        </div>
                      ) : (
                        <Image
                          src={image.url}
                          alt={`Captured ${step.title}`}
                          fill
                          className="object-cover"
                          data-ai-hint="fingerprint photo"
                        />
                      )}
                      {image.device === 'camera' && !image.isBinary && (
                        <div className={`absolute top-2 right-2 p-1 rounded-full bg-background/80 ${isGoodQuality ? 'text-green-500' : 'text-red-500'}`}>
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-muted text-muted-foreground">
                      Missing
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-3">
        <Button variant="outline" onClick={onDiscard}>
          <Undo2 className="mr-2" /> Discard & Recapture
        </Button>
        <Button onClick={onSave}>
          <Save className="mr-2" /> Save Record
        </Button>
      </CardFooter>
    </Card>
  );
}
