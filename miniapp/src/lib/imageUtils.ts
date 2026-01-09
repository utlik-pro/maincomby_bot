/**
 * Image utilities for resizing and optimizing photos before upload
 */

export interface ResizeOptions {
  maxWidth: number
  maxHeight: number
  quality: number // 0-1
  format: 'jpeg' | 'webp'
}

const DEFAULT_RESIZE_OPTIONS: ResizeOptions = {
  maxWidth: 1200,
  maxHeight: 1600, // 3:4 aspect ratio for profile cards
  quality: 0.85,
  format: 'jpeg'
}

/**
 * Resize and optimize an image file for profile upload
 * Returns a new File object with the resized image
 */
export async function resizeImageForProfile(
  file: File,
  options: Partial<ResizeOptions> = {}
): Promise<File> {
  const opts = { ...DEFAULT_RESIZE_OPTIONS, ...options }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img

      // If image is smaller than target, don't upscale
      if (width <= opts.maxWidth && height <= opts.maxHeight) {
        // Still recompress for consistent quality
        canvas.width = width
        canvas.height = height
      } else {
        // Calculate scale factor
        const scaleX = opts.maxWidth / width
        const scaleY = opts.maxHeight / height
        const scale = Math.min(scaleX, scaleY)

        width = Math.round(width * scale)
        height = Math.round(height * scale)

        canvas.width = width
        canvas.height = height
      }

      // Draw with high quality
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to blob
      const mimeType = opts.format === 'webp' ? 'image/webp' : 'image/jpeg'

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'))
            return
          }

          // Create new file with same name but correct extension
          const ext = opts.format === 'webp' ? 'webp' : 'jpg'
          const baseName = file.name.replace(/\.[^/.]+$/, '')
          const newFile = new File([blob], `${baseName}.${ext}`, {
            type: mimeType,
            lastModified: Date.now()
          })

          resolve(newFile)
        },
        mimeType,
        opts.quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Load image from file
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Create a thumbnail from an image file
 * Useful for quick previews in lists
 */
export async function createThumbnail(
  file: File,
  size: number = 200
): Promise<File> {
  return resizeImageForProfile(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'jpeg'
  })
}

/**
 * Get image dimensions without fully loading it
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Check if file is a valid image
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  return validTypes.includes(file.type)
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
