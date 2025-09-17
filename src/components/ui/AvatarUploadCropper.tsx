import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider'; // Make sure you have this component
import { getCroppedImg } from '@/lib/utils';
import { ZoomIn, ZoomOut } from 'lucide-react';

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

  // Define min/max zoom as constants for consistency
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 3;

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
        setZoom(MIN_ZOOM); // Reset zoom when a new image is loaded
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
          {/* Cropper Component */}
          <div className="relative w-full h-64 bg-gray-900 rounded-md">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom} // Updates state from mouse wheel, which updates the slider
              onCropComplete={onCropComplete}
              minZoom={MIN_ZOOM}
              maxZoom={MAX_ZOOM}
              zoomSpeed={0.1} // Slower, more precise mouse wheel zoom
            />
          </div>
          
          {/* Zoom Slider Controls */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ZoomOut className="h-4 w-4 text-gray-400" />
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])} // Updates state from slider, which updates the cropper
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.05} // Smaller step for smoother slider control
                className="w-full"
              />
              <ZoomIn className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <Button onClick={handleCrop} disabled={cropping} className="w-full">
            {cropping ? 'Cropping...' : 'Crop and Apply'}
          </Button>
        </div>
      )}
    </div>
  );
}