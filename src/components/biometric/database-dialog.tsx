
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
import { Database, FolderPlus, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DatabaseDialogProps {
  onDbSelect: (name: string, isNew: boolean) => void;
  onDbSave: (name: string) => void;
  existingDbs: string[];
}

export function DatabaseDialog({ onDbSelect, onDbSave, existingDbs }: DatabaseDialogProps) {
  const [dbName, setDbName] = useState(`session-${new Date().toISOString().split('T')[0]}`);
  const [activeTab, setActiveTab] = useState('new');

  const handleCreateAndStart = () => {
    if (dbName.trim()) {
      onDbSelect(dbName.trim(), true);
    }
  };

  const handleSave = () => {
    if (dbName.trim()) {
      onDbSave(dbName.trim());
      setActiveTab('existing');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Dialog open={true}>
        <DialogContent className="sm:max-w-[480px] grid-rows-[auto_1fr_auto]">
          <DialogHeader>
            <DialogTitle>Database Setup</DialogTitle>
            <DialogDescription>
              Create a new database session or select an existing one to store capture data.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new"><FolderPlus className="mr-2 h-4 w-4"/>New Database</TabsTrigger>
              <TabsTrigger value="existing" disabled={existingDbs.length === 0}><Database className="mr-2 h-4 w-4"/>Existing</TabsTrigger>
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
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleSave} variant="outline" className="w-full" disabled={!dbName.trim()}>
                    <Save className="mr-2 h-4 w-4" /> Save Database
                  </Button>
                  <Button onClick={handleCreateAndStart} className="w-full" disabled={!dbName.trim()}>
                    Create & Save Session
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="existing" className="py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Select a previously created database:</p>
                {existingDbs.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto rounded-md border">
                    {existingDbs.map(db => (
                      <button 
                        key={db}
                        onClick={() => onDbSelect(db, false)}
                        className="w-full text-left p-2 text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                      >
                        {db}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-4">No existing databases found.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
