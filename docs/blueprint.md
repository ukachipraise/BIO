# **App Name**: Biometric Capture Pro

## Core Features:

- Database Management: Create, select, and manage SQLite database files for data capture sessions.
- Automated ID Generation: Generate unique, non-sequential IDs for each person to link all captured images securely.
- Device Detection and Prompt: Automatically detect connected fingerprint scanner and camera, prompting user to confirm device readiness.
- Guided Capture Workflow: Guide the user through a sequential image capture process with clear on-screen prompts to minimize errors.
- Unified Data Storage: Store all four images (CameraIndex_IMG, CameraThumb_IMG, ScannerIndex_IMG, ScannerThumb_IMG) in a single database row, keyed to the unique ID.
- Data Validation and Export: Display a final preview screen for image verification and enable exporting the dataset into ML-ready formats like CSV.
- On-device Image Quality Assessment Tool: Use an on-device quality assessment tool to provide real-time feedback on image quality, flagging issues like blur or poor lighting.

## Style Guidelines:

- Primary color: Deep purple (#673AB7) to convey security and professionalism.
- Background color: Light gray (#F5F5F5) to provide a clean, neutral backdrop.
- Accent color: Teal (#009688) for interactive elements and highlights.
- Body and headline font: 'Inter', a grotesque-style sans-serif with a modern, machined look; 'Inter' is suitable for both headlines and body text.
- Use minimalist, geometric icons for scanner and camera status indicators.
- Employ a clear, structured layout with dedicated sections for device status, live previews, and capture prompts.
- Use subtle animations to provide feedback during the image capture and export processes.