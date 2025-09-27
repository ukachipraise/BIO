
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FolderPlus, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DatabaseDialogProps {
  onDbSelect: (name: string) => void;
  onCancel: () => void;
}

export function DatabaseDialog({ onDbSelect, onCancel }: DatabaseDialogProps) {
  const [dbName, setDbName] = useState(`session-${new Date().toISOString().split('T')[0]}`);

  const handleCreateAndStart = () => {
    if (dbName.trim()) {
      onDbSelect(dbName.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="sm:max-w-[480px] grid-rows-[auto_1fr_auto]">
          <DialogHeader>
            <DialogTitle>Database Setup</DialogTitle>
            <DialogDescription>
              Create a new database session to store capture data.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <Label htmlFor="db-name">New Database Name</Label>
              <Input
                id="db-name"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="e.g., project-x-data"
              />
              <Button onClick={handleCreateAndStart} className="w-full" disabled={!dbName.trim()}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create & Start Session
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
