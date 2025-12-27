
/**
 * Compresses an image file using the browser's Canvas API.
 * Resizes the image if it exceeds max dimensions and reduces quality to reduce file size.
 */
export async function compressImage(
    file: File,
    options: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
        maxSizeMB?: number;
    } = {}
): Promise<File> {
    // Default options
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.7,
        maxSizeMB = 10, // Target size (soft limit for initial compression check)
    } = options;

    // If file is already small enough and not an image we want to convert/resize, return it
    // But usually if this is called, we assume we want to try to compress it.
    // Although, the caller might only call this if file.size > Limit.

    if (!file.type.startsWith('image/')) {
        throw new Error('File is not an image');
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                // Better quality scaling
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob
                // We force JPEG for better compression if it's a photo, unless it needs transparency.
                // But for consistency and size, JPEG 0.7 is usually good for photos.
                // If the original was PNG with transparency, this turns black.
                // Let's stick to 'image/jpeg' for max compression as requested, but maybe check type.
                // If the user wants to "minimise file size", JPEG is best.
                // If we want to preserve transparency, we might need 'image/png' but it compresses less.
                // Given real estate context (photos), JPEG is standard.

                const outputType = 'image/jpeg';

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob conversion failed'));
                            return;
                        }

                        // Create a new File object
                        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: outputType,
                            lastModified: Date.now(),
                        });

                        resolve(newFile);
                    },
                    outputType,
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
