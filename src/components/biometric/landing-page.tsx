
"use client";

import { Button } from "@/components/ui/button";
import { Fingerprint, Scan, Database, FileOutput, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "../ui/card";

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: <Scan className="w-6 h-6" />,
    title: "Multi-Device Capture",
    description: "Seamlessly capture images from cameras and data from fingerprint scanners.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "AI-Powered Validation",
    description: "Get real-time feedback on image quality to ensure high-quality data collection.",
  },
  {
    icon: <Database className="w-6 h-6" />,
    title: "Flexible Data Storage",
    description: "Organize captures into distinct database sessions for better project management.",
  },
  {
    icon: <FileOutput className="w-6 h-6" />,
    title: "Multiple Export Formats",
    description: "Export your data to SQL, CSV, or even Jupyter Notebooks for analysis.",
  },
];

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-muted/40">
      <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
         <div className="flex items-center gap-2">
            <Fingerprint className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              Biometric Capture Pro
            </h1>
          </div>
          <Button onClick={onGetStarted}>Get Started</Button>
      </header>
      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 md:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                        The Professional's Tool for Biometric Data Collection
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        An all-in-one solution for capturing, validating, and exporting high-quality biometric data. Streamline your workflow with AI-powered assistance and flexible export options.
                    </p>
                    <div className="flex gap-4 justify-center md:justify-start">
                         <Button size="lg" onClick={onGetStarted}>
                            Start Capturing Now
                        </Button>
                        <Button size="lg" variant="outline" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                            Learn More
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl -z-10"></div>
                    <Fingerprint className="w-full h-auto max-w-sm mx-auto text-primary opacity-20" />
                </div>
            </div>
        </div>
      </main>
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 md:px-8">
            <div className="text-center space-y-4 mb-12">
                <h3 className="text-3xl font-bold tracking-tight">Powerful Features for a Seamless Workflow</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">From initial capture to final analysis, Biometric Capture Pro has you covered.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                    <Card key={index} className="text-center">
                        <CardContent className="p-6">
                            <div className="mx-auto w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mb-4">
                                {feature.icon}
                            </div>
                            <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </section>
      <footer className="text-center p-6 text-sm text-muted-foreground">
        Biometric Capture Pro &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

    