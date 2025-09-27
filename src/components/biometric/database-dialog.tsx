
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
import { FolderPlus, Trash2, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '../ui/scroll-area';

interface DatabaseDialogProps {
  onDbSelect: (name: string) => void;
  onCancel: () => void;
  savedDbs: string[];
  onDeleteDb: (name: string) => void;
}

export function DatabaseDialog({ onDbSelect, onCancel, savedDbs, onDeleteDb }: DatabaseDialogProps) {
  const [dbName, setDbName] = useState(`database-${new Date().toISOString().split('T')[0]}`);
  const [activeTab, setActiveTab] = useState(savedDbs.length > 0 ? "resume" : "new");

  const handleCreateAndStart = () => {
    if (dbName.trim()) {
      onDbSelect(dbName.trim());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Database Setup</DialogTitle>
            <DialogDescription>
              Create a new database or resume a previously saved one.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="resume" disabled={savedDbs.length === 0}>Resume Database</TabsTrigger>
              <TabsTrigger value="new">New Database</TabsTrigger>
            </TabsList>
            <TabsContent value="resume" className="mt-4">
              <div className="space-y-2">
                <Label>Select a database to continue</Label>
                {savedDbs.length > 0 ? (
                  <ScrollArea className="h-40 w-full rounded-md border p-2">
                    <div className="space-y-2">
                      {savedDbs.map((name) => (
                        <div key={name} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                          <Button variant="link" className="p-0 h-auto flex-grow text-left justify-start" onClick={() => onDbSelect(name)}>
                            {name}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/70 hover:text-destructive" onClick={(e) => { e.stopPropagation(); onDeleteDb(name); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-40 border rounded-md text-sm text-muted-foreground">
                    No saved databases found.
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="new" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="db-name">New Database Name</Label>
                  <Input
                    id="db-name"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    placeholder="e.g., project-x-data"
                    className="mt-1"
                  />
                </div>
                <Button onClick={handleCreateAndStart} className="w-full" disabled={!dbName.trim()}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create & Start Database
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    