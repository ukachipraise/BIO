"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayCircle } from "lucide-react";

interface WorkflowIdleViewProps {
  onStart: () => void;
}

export function WorkflowIdleView({ onStart }: WorkflowIdleViewProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto text-center">
      <CardHeader>
        <CardTitle>Ready to Capture</CardTitle>
        <CardDescription>All devices are connected and ready. Start a new capture session when the subject is ready.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="lg" onClick={onStart}>
          <PlayCircle className="mr-2" />
          Start New Capture
        </Button>
      </CardContent>
    </Card>
  );
}
