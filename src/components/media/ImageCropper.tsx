'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageCropperProps {
  imageUrl: string;
  aspectRatio?: number; // width/height (e.g., 16/9, 4/3)
  onCropComplete?: (cropArea: CropArea, croppedImageBlob: Blob) => void;
  className?: string;
}

const ASPECT_RATIOS = {
  HERO: { ratio: 16 / 9, label: '16:9 (Hero)' },
  THUMBNAIL: { ratio: 4 / 3, label: '4:3 (Thumbnail)' },
  SQUARE: { ratio: 1, label: '1:1 (Square)' },
} as const;

export function ImageCropper({
  imageUrl,
  aspectRatio = ASPECT_RATIOS.HERO.ratio,
  onCropComplete,
  className,
}: ImageCropperProps) {
  const [scale, setScale] = useState(1);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image and calculate initial dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      if (containerRef.current) {
        const container = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: container.width, height: container.height });

        // Calculate initial crop area
        const cropWidth = container.width * 0.8;
        const cropHeight = cropWidth / aspectRatio;

        setCropArea({
          x: (container.width - cropWidth) / 2,
          y: (container.height - cropHeight) / 2,
          width: cropWidth,
          height: cropHeight,
        });
      }
    };
    img.src = imageUrl;
  }, [imageUrl, aspectRatio]);

  // Handle mouse/touch drag
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Zoom controls
  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Generate cropped image
  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!imageRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const image = imageRef.current;

    // Calculate the actual crop area on the original image
    const scaleX = imageDimensions.width / (containerDimensions.width * scale);
    const scaleY = imageDimensions.height / (containerDimensions.height * scale);

    const actualCropX = (cropArea.x - position.x) * scaleX;
    const actualCropY = (cropArea.y - position.y) * scaleY;
    const actualCropWidth = cropArea.width * scaleX;
    const actualCropHeight = cropArea.height * scaleY;

    // Set canvas size to desired output size
    canvas.width = actualCropWidth;
    canvas.height = actualCropHeight;

    // Draw cropped image
    ctx.drawImage(
      image,
      actualCropX,
      actualCropY,
      actualCropWidth,
      actualCropHeight,
      0,
      0,
      actualCropWidth,
      actualCropHeight
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  }, [cropArea, position, scale, imageDimensions, containerDimensions]);

  const handleApplyCrop = async () => {
    const blob = await getCroppedImage();
    if (blob) {
      onCropComplete?.(cropArea, blob);
    }
  };

  const getAspectRatioLabel = () => {
    const entry = Object.entries(ASPECT_RATIOS).find(
      ([_, config]) => Math.abs(config.ratio - aspectRatio) < 0.01
    );
    return entry ? entry[1].label : `${aspectRatio.toFixed(2)}:1`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Crop area */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] bg-[#2C2C2C] rounded-xl overflow-hidden"
      >
        {/* Image */}
        <div
          className="absolute inset-0 flex items-center justify-center cursor-move"
          onMouseDown={handleMouseDown}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s',
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        </div>

        {/* Crop overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dark overlay outside crop area */}
          <svg className="w-full h-full">
            <defs>
              <mask id="crop-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={cropArea.x}
                  y={cropArea.y}
                  width={cropArea.width}
                  height={cropArea.height}
                  fill="black"
                  rx="8"
                />
              </mask>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#crop-mask)" />
          </svg>

          {/* Crop border */}
          <div
            className="absolute border-2 border-white rounded-lg"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height,
            }}
          >
            {/* Corner guides */}
            <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-4 border-l-4 border-white rounded-tl" />
            <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-4 border-r-4 border-white rounded-tr" />
            <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-4 border-l-4 border-white rounded-bl" />
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-4 border-r-4 border-white rounded-br" />
          </div>
        </div>

        {/* Aspect ratio badge */}
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="default" className="bg-white/90 backdrop-blur-sm text-[#2C2C2C]">
            {getAspectRatioLabel()}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F0EBE3] rounded-lg">
            <input
              type="range"
              min="50"
              max="300"
              value={scale * 100}
              onChange={(e) => setScale(Number(e.target.value) / 100)}
              className="w-24 accent-[#C4A484]"
            />
            <span className="text-xs text-[#2C2C2C] font-medium min-w-[3ch]">
              {Math.round(scale * 100)}%
            </span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleZoomIn}
            disabled={scale >= 3}
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <Button size="sm" variant="secondary" onClick={handleReset} title="Reset">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <Button size="sm" variant="accent" onClick={handleApplyCrop}>
          Apply Crop
        </Button>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Instructions */}
      <div className="bg-[#F0EBE3] rounded-lg p-3">
        <p className="text-xs text-[#8B8B8B]">
          Drag the image to position it within the crop area. Use the zoom controls to adjust the size.
        </p>
      </div>
    </div>
  );
}

// Export aspect ratio presets
export { ASPECT_RATIOS };
