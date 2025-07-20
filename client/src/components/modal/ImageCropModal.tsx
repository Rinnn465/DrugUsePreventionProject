import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { X, Crop as CropIcon, Upload } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCropComplete: (croppedImageBlob: Blob) => void;
    imageFile: File | null;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
    isOpen,
    onClose,
    onCropComplete,
    imageFile
}) => {
    const [imgSrc, setImgSrc] = useState<string>('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [aspect, setAspect] = useState<number | undefined>(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const imgRef = useRef<HTMLImageElement>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                const result = reader.result;
                if (typeof result === 'string') {
                    setImgSrc(result);
                }
            });
            reader.readAsDataURL(imageFile);
        }
    }, [imageFile]);

    function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    React.useEffect(() => {
        if (completedCrop && imgRef.current && previewCanvasRef.current) {
            const image = imgRef.current;
            const canvas = previewCanvasRef.current;
            const crop = completedCrop;

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            const ctx = canvas.getContext('2d');

            const pixelRatio = window.devicePixelRatio;

            canvas.width = crop.width * pixelRatio;
            canvas.height = crop.height * pixelRatio;

            ctx!.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            ctx!.imageSmoothingQuality = 'high';

            ctx!.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width,
                crop.height,
            );
        }
    }, [completedCrop, scale, rotate]);

    const getCroppedImg = useCallback(
        (image: HTMLImageElement, crop: PixelCrop, scale: number, rotate: number): Promise<Blob> => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('No 2d context');
            }

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            const pixelRatio = window.devicePixelRatio;

            canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
            canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

            ctx.scale(pixelRatio, pixelRatio);
            ctx.imageSmoothingQuality = 'high';

            const cropX = crop.x * scaleX;
            const cropY = crop.y * scaleY;

            const centerX = image.naturalWidth / 2;
            const centerY = image.naturalHeight / 2;

            ctx.save();

            ctx.translate(-cropX, -cropY);
            ctx.translate(centerX, centerY);
            ctx.rotate((rotate * Math.PI) / 180);
            ctx.scale(scale, scale);
            ctx.translate(-centerX, -centerY);
            ctx.drawImage(
                image,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight,
                0,
                0,
                image.naturalWidth,
                image.naturalHeight,
            );

            ctx.restore();

            return new Promise((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas toBlob failed'));
                        }
                    },
                    'image/jpeg',
                    0.9,
                );
            });
        },
        []
    );

    const handleCropComplete = async () => {
        if (!completedCrop || !imgRef.current) return;

        try {
            setIsProcessing(true);
            const croppedImageBlob = await getCroppedImg(
                imgRef.current,
                completedCrop,
                scale,
                rotate,
            );
            onCropComplete(croppedImageBlob);
            onClose();
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <CropIcon className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Cắt ảnh đại diện</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {imgSrc && (
                        <div className="space-y-4">
                            {/* Crop Area */}
                            <div className="flex justify-center">
                                <ReactCrop
                                    crop={crop}
                                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={aspect}
                                    minWidth={100}
                                    minHeight={100}
                                    circularCrop={true}
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop me"
                                        src={imgSrc}
                                        style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                                        onLoad={onImageLoad}
                                        className="max-w-full max-h-96"
                                    />
                                </ReactCrop>
                            </div>

                            {/* Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-700 mb-2">
                                        Tỷ lệ khung hình
                                    </label>
                                    <select
                                        id="aspect-ratio"
                                        value={aspect || ''}
                                        onChange={(e) => {
                                            setAspect(e.target.value ? Number(e.target.value) : undefined);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Tự do</option>
                                        <option value="1">Vuông (1:1)</option>
                                        <option value="1.3333">4:3</option>
                                        <option value="1.7778">16:9</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="scale-slider" className="block text-sm font-medium text-gray-700 mb-2">
                                        Thu phóng: {Math.round(scale * 100)}%
                                    </label>
                                    <input
                                        id="scale-slider"
                                        type="range"
                                        value={scale}
                                        disabled={!imgSrc}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        min="0.5"
                                        max="3"
                                        step="0.1"
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="rotate-slider" className="block text-sm font-medium text-gray-700 mb-2">
                                        Xoay: {rotate}°
                                    </label>
                                    <input
                                        id="rotate-slider"
                                        type="range"
                                        value={rotate}
                                        disabled={!imgSrc}
                                        onChange={(e) => setRotate(Number(e.target.value))}
                                        min="-180"
                                        max="180"
                                        step="1"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            {completedCrop && (
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Xem trước (150x150px)</p>
                                    <div className="inline-flex items-center justify-center">
                                        <canvas
                                            ref={previewCanvasRef}
                                            className="border border-gray-300 rounded-full"
                                            style={{
                                                width: 150,
                                                height: 150,
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleCropComplete}
                        disabled={!completedCrop || isProcessing}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Upload className="h-4 w-4" />
                        )}
                        <span>{isProcessing ? 'Đang xử lý...' : 'Áp dụng'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
