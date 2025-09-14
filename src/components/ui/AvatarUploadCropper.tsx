import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCroppedImg } from '@/lib/utils';

interface AvatarUploadCropperProps {
  onUpload: (file: File) => Promise<string>; // returns public URL
  onComplete: (url: string) => void;
}

export function AvatarUploadCropper({ onUpload, onComplete }: AvatarUploadCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [cropping, setCropping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      setError(null);
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCropAndUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setCropping(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
      const url = await onUpload(croppedFile);
      onComplete(url);
    } catch (err) {
      setError('Failed to crop or upload image.');
    } finally {
      setCropping(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={onFileChange} />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {imageSrc && (
        <div className="relative w-full h-64 bg-gray-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
      )}
      {imageSrc && (
        <Button onClick={handleCropAndUpload} disabled={cropping}>
          {cropping ? 'Uploading...' : 'Save Avatar'}
        </Button>
      )}
    </div>
  );
}
