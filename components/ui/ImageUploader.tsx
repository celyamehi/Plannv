'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react'
import { Button } from './button'
import { supabase } from '@/lib/supabase/client'

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void
  maxFiles?: number
  initialImages?: string[]
  folder: string
  isLogo?: boolean
}

export function ImageUploader({ 
  onUpload, 
  maxFiles = 5, 
  initialImages = [],
  folder,
  isLogo = false
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(initialImages)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    setUploading(true)
    setError(null)
    
    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${folder}/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('establishments')
          .upload(filePath, file)
        
        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('establishments')
          .getPublicUrl(filePath)
        
        return publicUrl
      })
      
      const newImageUrls = await Promise.all(uploadPromises)
      const updatedImages = [...images, ...newImageUrls].slice(0, maxFiles)
      
      setImages(updatedImages)
      onUpload(updatedImages)
    } catch (err) {
      console.error('Error uploading images:', err)
      setError('Une erreur est survenue lors du téléchargement des images.')
    } finally {
      setUploading(false)
    }
  }, [folder, images, maxFiles, onUpload])

  const removeImage = async (index: number) => {
    try {
      const imageUrl = images[index]
      const path = imageUrl.split('/').pop()
      
      if (path) {
        await supabase.storage
          .from('establishments')
          .remove([`${folder}/${path}`])
      }
      
      const newImages = images.filter((_, i) => i !== index)
      setImages(newImages)
      onUpload(newImages)
    } catch (err) {
      console.error('Error removing image:', err)
      setError('Une erreur est survenue lors de la suppression de l\'image.')
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles - images.length,
    disabled: images.length >= maxFiles || uploading
  })

  return (
    <div className="space-y-4">
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-8 w-8 text-muted-foreground" />
          )}
          <p className="text-sm text-muted-foreground">
            {isDragActive 
              ? 'Déposez les images ici...' 
              : `Glissez-déposez des images ici, ou cliquez pour sélectionner (max ${maxFiles - images.length} ${maxFiles - images.length > 1 ? 'fichiers' : 'fichier'})`
            }
          </p>
          <p className="text-xs text-muted-foreground">
            {isLogo 
              ? 'Format recommandé : 1:1 (carré)'
              : 'Formats acceptés : .jpg, .jpeg, .png, .webp'
            }
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {(images.length > 0 || uploading) && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">
            {isLogo ? 'Logo actuel' : 'Galerie photos'}
          </h4>
          <div className={`grid ${isLogo ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'} gap-4`}>
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-md overflow-hidden bg-muted">
                  <img
                    src={url}
                    alt={`${isLogo ? 'Logo' : 'Photo de l\'établissement'} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {uploading && (
              <div className="aspect-square rounded-md bg-muted flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
