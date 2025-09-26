"use client";

import { Fingerprint, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  databaseName: string;
  onExport: (format: 'sql' | 'csv') => void;
  recordCount: number;
}

export function Header({ databaseName, onExport, recordCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Fingerprint className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Biometric Capture Pro
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{databaseName}</p>
            <p className="text-xs text-muted-foreground">{recordCount} records saved</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={recordCount === 0}>
                <Download className="mr-2" />
                Export Data
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('sql')}>
                Export to SQL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('csv')}>
                Export to Excel (.csv)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
