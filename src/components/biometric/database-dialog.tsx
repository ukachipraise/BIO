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
import { Database, FolderPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DatabaseDialogProps {
  onDbSelect: (name: string) => void;
}

export function DatabaseDialog({ onDbSelect }: DatabaseDialogProps) {
  const [dbName, setDbName] = useState(`session-${new Date().toISOString().split('T')[0]}`);
  const existingDbs = ['previous-session-1', 'project-alpha-data', 'test-run-007'];

  const handleCreate = () => {
    if (dbName.trim()) {
      onDbSelect(dbName.trim());
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[480px] grid-rows-[auto_1fr_auto]">
        <DialogHeader>
          <DialogTitle>Database Setup</DialogTitle>
          <DialogDescription>
            Create a new database session or select an existing one to store capture data.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new"><FolderPlus className="mr-2 h-4 w-4"/>New Database</TabsTrigger>
            <TabsTrigger value="existing"><Database className="mr-2 h-4 w-4"/>Existing</TabsTrigger>
          </TabsList>
          <TabsContent value="new" className="py-4">
            <div className="space-y-4">
              <Label htmlFor="db-name">New Database Name</Label>
              <Input
                id="db-name"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="e.g., project-x-data"
              />
              <Button onClick={handleCreate} className="w-full" disabled={!dbName.trim()}>
                Start New Session
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="existing" className="py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Select a simulated existing database:</p>
              <div className="max-h-48 overflow-y-auto rounded-md border">
                {existingDbs.map(db => (
                  <button 
                    key={db}
                    onClick={() => onDbSelect(db)}
                    className="w-full text-left p-2 text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                  >
                    {db}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
