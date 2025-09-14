import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/utils';

interface AvatarUploadCropperProps {
  onCropComplete: (croppedFile: File) => void; // returns cropped file without uploading
  initialImage?: string;
}

export function AvatarUploadCropper({ onCropComplete: onCropCompleteCallback, initialImage }: AvatarUploadCropperProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
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

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setCropping(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'avatar.jpg', { type: 'image/jpeg' });
      onCropCompleteCallback(croppedFile);
    } catch (err) {
      setError('Failed to crop image.');
    } finally {
      setCropping(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" accept="image/*" onChange={onFileChange} />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {imageSrc && (
        <div className="space-y-4">
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
          
          {/* Zoom Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0])}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>1x</span>
              <span>3x</span>
            </div>
          </div>
        </div>
      )}
      {imageSrc && (
        <Button onClick={handleCrop} disabled={cropping}>
          {cropping ? 'Cropping...' : 'Crop Image'}
        </Button>
      )}
    </div>
  );
}
