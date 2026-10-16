'use client'

import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Image as ImageIcon, Upload, X, Loader2, User } from 'lucide-react'
import { Button } from './button'
import { supabase } from '@/lib/supabase/client'

interface ImageUploaderProps {
  onUpload: (urls: string[]) => void
  maxFiles?: number
  initialImages?: string[]
  folder: string
  isLogo?: boolean
  isAvatar?: boolean
}

export function ImageUploader({ 
  onUpload, 
  maxFiles = 5, 
  initialImages = [],
  folder,
  isLogo = false,
  isAvatar = false
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<string[]>(initialImages)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages)
    } else {
      setImages([])
    }
  }, [JSON.stringify(initialImages)])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    setUploading(true)
    setError(null)
    
    try {
      const cleanFolder = (folder || 'gallery').replace(/^\/+|\/+$/g, '')

      const uploadPromises = acceptedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `${cleanFolder}/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('establishments')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
          })
        
        if (uploadError) {
          console.error('Détail erreur upload Supabase:', uploadError)
          throw uploadError
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('establishments')
          .getPublicUrl(filePath)
        
        return publicUrl
      })
      
      const newImageUrls = await Promise.all(uploadPromises)
      const updatedImages = [...images, ...newImageUrls].slice(0, maxFiles)
      
      setImages(updatedImages)
      onUpload(updatedImages)
    } catch (err: any) {
      console.error('Error uploading images:', err)
      const message = err?.message || err?.error || ''
      if (message.includes('row-level security') || message.includes('violates')) {
        setError('Accès refusé par Supabase (RLS). Veuillez exécuter le script fix_storage_rls_establishments.sql dans votre Dashboard Supabase.')
      } else {
        setError('Une erreur est survenue lors du téléchargement des images.')
      }
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
      {isAvatar && images.length > 0 ? (
        <div className="flex items-center gap-6 p-4 bg-nude-50/60 rounded-2xl border border-nude-100">
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-nude-300 shadow-md bg-white">
              <img
                src={images[0]}
                alt="Photo de profil"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeImage(0)
              }}
              title="Supprimer la photo"
              className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Photo de profil actuelle</h4>
            <p className="text-xs text-gray-500">
              Cette photo s'affiche sur votre espace professionnel et votre profil.
            </p>
            <div {...getRootProps()} className="inline-block cursor-pointer">
              <input {...getInputProps()} />
              <Button type="button" variant="outline" size="sm" className="text-xs h-8 border-nude-200 hover:bg-nude-100 text-nude-800" disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Changer la photo
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragActive 
              ? 'border-nude-500 bg-nude-50/70' 
              : 'border-nude-200 hover:border-nude-400 hover:bg-nude-50/30'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-nude-600" />
            ) : isAvatar ? (
              <div className="w-12 h-12 rounded-full bg-nude-100 flex items-center justify-center text-nude-600">
                <User className="h-6 w-6" />
              </div>
            ) : (
              <Upload className="h-8 w-8 text-nude-600" />
            )}
            <p className="text-sm font-medium text-gray-700">
              {isDragActive 
                ? 'Déposez votre photo ici...' 
                : isAvatar
                  ? 'Glissez votre photo de profil ou cliquez pour parcourir'
                  : `Glissez vos photos ici ou cliquez pour sélectionner (max ${maxFiles - images.length} ${maxFiles - images.length > 1 ? 'fichiers' : 'fichier'})`
              }
            </p>
            <p className="text-xs text-gray-500">
              {isAvatar 
                ? 'Format carré recommandé (1:1), max 10 Mo (.jpg, .png, .webp)'
                : isLogo 
                  ? 'Format carré recommandé (1:1)' 
                  : 'Formats acceptés : .jpg, .jpeg, .png, .webp'
              }
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {!isAvatar && (images.length > 0 || uploading) && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2 text-gray-700">
            {isLogo ? 'Logo actuel' : 'Galerie photos'}
          </h4>
          <div className={`grid ${isLogo ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'} gap-4`}>
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-gray-100 shadow-xs">
                  <img
                    src={url}
                    alt={`${isLogo ? 'Logo' : 'Photo de la galerie'} ${index + 1}`}
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
              <div className="aspect-square rounded-xl bg-nude-50 border border-nude-200 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-nude-600" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
