"use client";

import { Camera, Fingerprint, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Device } from '@/lib/types';

interface DeviceStatusProps {
  devices: Device[];
}

const statusConfig = {
  connected: {
    icon: <CheckCircle2 className="text-green-500" />,
    text: 'Connected',
    color: 'text-green-500',
  },
  disconnected: {
    icon: <XCircle className="text-red-500" />,
    text: 'Disconnected',
    color: 'text-red-500',
  },
  checking: {
    icon: <Loader2 className="animate-spin text-muted-foreground" />,
    text: 'Checking...',
    color: 'text-muted-foreground',
  },
};

const deviceIcons = {
  'Phone Camera': <Camera />,
  'Fingerprint Scanner': <Fingerprint />,
};

export function DeviceStatus({ devices }: DeviceStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Device Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {devices.map((device) => (
            <div key={device.name} className="flex items-center gap-4 rounded-lg border p-4">
              <div className="text-muted-foreground">{deviceIcons[device.name]}</div>
              <div className="flex-grow">
                <p className="font-semibold">{device.name}</p>
                <p className={cn("text-sm", statusConfig[device.status].color)}>
                  {statusConfig[device.status].text}
                </p>
              </div>
              <div className="shrink-0">{statusConfig[device.status].icon}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
