import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { useOutletContext } from 'react-router';

import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '../lib/constants';

type UploadProps = {
    onComplete: (base64Data: string) => void | Promise<void>;
};

const Upload: React.FC<UploadProps> = ({ onComplete }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { isSignedIn } = useOutletContext<AuthContext>();

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const processFile = (uploadFile: File) => {
        if (!isSignedIn) return;

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        setFile(uploadFile);
        setProgress(0);

        const reader = new FileReader();

        reader.onloadend = () => {
            const result = reader.result;

            if (!result || typeof result !== 'string') return;

            const base64Data = result;

            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    const next = Math.min(prev + PROGRESS_STEP, 100);

                    if (next >= 100) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }

                        setTimeout(() => onComplete(base64Data), REDIRECT_DELAY_MS);
                    }

                    return next;
                });
            }, PROGRESS_INTERVAL_MS);
        };

        reader.onerror = () => {
            setProgress(0);
            setFile(null);
        };

        reader.readAsDataURL(uploadFile);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;

        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(true);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(false);
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        setIsDragging(false);

        if (!isSignedIn) return;

        const droppedFile = event.dataTransfer.files?.[0];

        if (droppedFile) {
            processFile(droppedFile);
        }
    };

  return (
    <div className='upload'>
        {!file ? (
            <div
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className='drop-input'
                    accept='.jpg,.jpeg,.png'
                    disabled={!isSignedIn}
                    onChange={handleFileChange}
                    />

                    <div className='drop-content'>
                        <div className='drop-icon'>
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn ? 'Drag and drop your floor plan here, or click to select a file' : 'Please sign in to upload your floor plans'}
                        </p>
                        <p className='help'>Maximum file size 50 MB.</p>
                    </div>
            </div>
        ) : (
            <div className='upload-status'>
                <div className='status-content'>
                    <div className='status-icon'>
                        {progress === 100 ? (<CheckCircle2 className='check' />
                        ) : (
                            <ImageIcon className='image' />
                        )}
                    </div>

                    <h3>{file.name}</h3>

                    <div className='progress'>
                        <div className='bar' style={{ width: `${progress}%` }} />

                        <p className='status-text'>
                            {progress < 100 ? `Analyzing floor plan... ` : 'Redirecting ...'}
                        </p>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default Upload