"use client"

import React, { useState, useRef } from "react"
// Try-catch for importing lucide-react
let LucideIcons: any = {}
try {
  // Dynamic import to check if module is available
  LucideIcons = require("lucide-react")
} catch (error) {
  console.warn("lucide-react not found, using fallback icons")
  // Fallback icons as React components
  LucideIcons = {
    Upload: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
    X: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    AlertCircle: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    Search: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    Check: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    Eye: (props: any) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
}

// Extract the icons we need
const { Upload, X, AlertCircle, Search, Check, Eye } = LucideIcons

// ===============================
// BUTTON COMPONENTS
// ===============================

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  className?: string
  title?: string
}

export function Button({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
  title
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    primary: "bg-neutral-900 text-white hover:bg-neutral-800",
    secondary: "border border-neutral-200 text-neutral-700 hover:bg-neutral-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "text-neutral-700 hover:bg-neutral-100"
  }
  
  const sizes = {
    sm: "px-3 py-2 text-xs rounded-lg h-8 space-x-1.5",
    md: "px-4 py-2.5 text-xs rounded-lg h-9 space-x-2",
    lg: "px-6 py-3 text-sm rounded-lg h-10 space-x-2"
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      title={title}
    >
      {loading ? (
        <>
          <div className="w-3.5 h-3.5 border border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && icon}
          <span>{children}</span>
        </>
      )}
    </button>
  )
}

// Specialized Button Components
interface SubmitButtonProps {
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
  icon?: React.ReactNode
}

export function SubmitButton({ loading, loadingText = "Saving...", children, icon }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="primary"
      loading={loading}
      icon={icon}
    >
      {loading ? loadingText : children}
    </Button>
  )
}

interface CancelButtonProps {
  onClick: () => void
  children?: React.ReactNode
  icon?: React.ReactNode
}

export function CancelButton({ onClick, children = "Cancel", icon }: CancelButtonProps) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      icon={icon}
    >
      {children}
    </Button>
  )
}

// ===============================
// FORM COMPONENTS
// ===============================

interface FormFieldProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  placeholder?: string
  type?: 'text' | 'textarea'
  rows?: number
  required?: boolean
}

export function FormField({ 
  label, 
  name, 
  value, 
  onChange, 
  error, 
  placeholder, 
  type = 'text', 
  rows = 4,
  required = false 
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-neutral-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-4 py-4 border border-neutral-200/60 rounded-lg text-sm text-neutral-600 placeholder:text-sm placeholder:text-neutral-400 placeholder:font-normal placeholder:leading-normal focus:border-neutral-400 focus:ring-0 outline-none transition-all duration-200 resize-none min-h-[120px]"
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-4 border border-neutral-200/60 rounded-lg text-sm text-neutral-600 placeholder:text-sm placeholder:text-neutral-400 placeholder:font-normal placeholder:leading-normal focus:border-neutral-400 focus:ring-0 outline-none transition-all duration-200"
        />
      )}
      {error && (
        <div className="flex items-center mt-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 mr-2" />
          {error}
        </div>
      )}
    </div>
  )
}

// ===============================
// IMAGE MODAL COMPONENT (Reusable)
// ===============================

interface ImageModalProps {
  show: boolean
  imageUrl: string
  alt: string
  onClose: () => void
}

export function ImageModal({ show, imageUrl, alt, onClose }: ImageModalProps) {
  if (!show) return null

  return (
    <div 
      className="fixed inset-0 bg-black/75 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
        {/* Consistent close button design */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg text-neutral-600 hover:text-neutral-900 hover:shadow-xl transition-all duration-200 flex items-center justify-center border border-neutral-200/60"
          style={{ zIndex: 100000 }}
          title="Close preview"
        >
          <X className="h-4 w-4" />
        </button>
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          draggable={false}
        />
      </div>
    </div>
  )
}

// ===============================
// IMAGE UPLOAD COMPONENT
// ===============================

interface ImageUploadProps {
  imagePreview: string | null
  existingImageUrl?: string | null
  onFileSelect: (file: File) => void
  onRemove: () => void
  error?: string
  label?: string
  // Modal handlers passed from parent
  onImageClick: (imageUrl: string, alt: string) => void
}

export function ImageUpload({ 
  imagePreview, 
  existingImageUrl,
  onFileSelect, 
  onRemove, 
  error, 
  label = "Image",
  onImageClick
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  const handleImageClick = (url: string, alt: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onImageClick(url, alt)
  }

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onRemove()
  }

  const handleUploadAreaClick = (e: React.MouseEvent) => {
    // Only trigger file input if clicking on the upload area, not the images
    if ((e.target as HTMLElement).tagName === 'IMG') {
      return // Don't trigger file input when clicking on images
    }
    fileInputRef.current?.click()
  }

  const hasExistingImage = existingImageUrl && !imagePreview
  const hasNewImage = imagePreview
  const hasBothImages = existingImageUrl && imagePreview

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-neutral-900">
        {label}
      </label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive
            ? "border-neutral-300 bg-neutral-50/50"
            : error
              ? "border-red-300 bg-red-50/50"
              : "border-neutral-200/60 hover:border-neutral-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleUploadAreaClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!hasExistingImage && !hasNewImage ? (
          // No images - show upload prompt
          <div className="space-y-3 cursor-pointer">
            <div className="mx-auto w-12 h-12 bg-neutral-100 rounded-lg border border-neutral-200/60 flex items-center justify-center">
              <Upload className="h-6 w-6 text-neutral-400" />
            </div>
            <div>
              <p className="text-sm text-neutral-600 font-medium">
                Drop image here or <span className="font-semibold underline">browse files</span>
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        ) : hasBothImages ? (
          // Both existing and new images - show comparison
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Current Image */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-neutral-700 uppercase tracking-wide">Current</p>
                <div className="relative inline-block group">
                  <img
                    src={existingImageUrl!}
                    alt="Current image"
                    className="w-full max-h-32 object-cover rounded-lg border border-neutral-200/60 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    onClick={handleImageClick(existingImageUrl!, "Current image")}
                  />
                  <div className="absolute inset-0 rounded-lg bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Eye className="h-4 w-4 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>

              {/* New Image */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">New</p>
                <div className="relative inline-block group">
                  <img
                    src={imagePreview!}
                    alt="New image"
                    className="w-full max-h-32 object-cover rounded-lg border border-green-200 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                    onClick={handleImageClick(imagePreview!, "New image")}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveClick}
                    className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-sm"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute inset-0 rounded-lg bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Eye className="h-4 w-4 text-white drop-shadow-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-500">Click images to preview • Click area to replace • The new image will be saved</p>
          </div>
        ) : hasNewImage ? (
          // Only new image
          <div className="space-y-3">
            <div className="relative inline-block group">
              <img
                src={imagePreview!}
                alt="New image"
                className="max-w-56 max-h-40 rounded-lg border border-neutral-200/60 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                onClick={handleImageClick(imagePreview!, "New image")}
              />
              <button
                type="button"
                onClick={handleRemoveClick}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="absolute inset-0 rounded-lg bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Eye className="h-5 w-5 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-500">Click image to preview • Click area to replace</p>
          </div>
        ) : (
          // Only existing image
          <div className="space-y-3">
            <div className="relative inline-block group">
              <img
                src={existingImageUrl!}
                alt="Current image"
                className="max-w-56 max-h-40 rounded-lg border border-neutral-200/60 cursor-pointer hover:opacity-90 transition-opacity duration-200"
                onClick={handleImageClick(existingImageUrl!, "Current image")}
              />
              <div className="absolute inset-0 rounded-lg bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Eye className="h-5 w-5 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-500">Click image to preview • Click area to replace</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center mt-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 mr-2" />
          {error}
        </div>
      )}
    </div>
  )
}

// ===============================
// SEARCH BAR COMPONENT
// ===============================

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <div className="relative flex-1 sm:max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-3 border border-neutral-200/60 rounded-lg text-sm text-neutral-600 placeholder:text-sm placeholder:text-neutral-400 placeholder:font-normal placeholder:leading-normal focus:border-neutral-400 focus:ring-0 outline-none transition-all duration-200 bg-white"
      />
    </div>
  )
}

// ===============================
// SUCCESS TOAST COMPONENT
// ===============================

interface SuccessToastProps {
  show: boolean
  message: string
  progress: number
  onClose: () => void
}

export function SuccessToast({ show, message, progress, onClose }: SuccessToastProps) {
  if (!show) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 transform transition-all duration-300 ease-in-out">
      <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg border border-green-500 min-w-80 relative overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Check className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button 
            onClick={onClose}
            className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1 bg-green-400 transition-all duration-100 ease-linear"
             style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}

// ===============================
// CONFIRMATION MODAL COMPONENT
// ===============================

interface ConfirmModalProps {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  variant?: 'danger' | 'default'
}

export function ConfirmModal({
  show,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = 'default'
}: ConfirmModalProps) {
  if (!show) return null

  const confirmButtonClass = variant === 'danger' 
    ? "px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
    : "px-4 py-2.5 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="text-sm text-neutral-600">{message}</p>
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={confirmButtonClass}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ===============================
// LOADING SKELETONS
// ===============================

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Table Header - Desktop only */}
      <div className="hidden md:block px-6 py-4 border-b border-neutral-200/60 bg-neutral-50/30">
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-4">
            <div className="h-2.5 bg-neutral-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="col-span-6">
            <div className="h-2.5 bg-neutral-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="col-span-2">
            <div className="h-2.5 bg-neutral-200 rounded w-12 ml-auto animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-neutral-200/60">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-6 py-5 animate-pulse">
            {/* Mobile skeleton */}
            <div className="md:hidden space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-lg flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-neutral-200 rounded w-24"></div>
                  <div className="h-3 bg-neutral-200 rounded w-16"></div>
                  <div className="h-3 bg-neutral-200 rounded w-full"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-3 border-t border-neutral-100">
                <div className="flex-1 h-6 bg-neutral-200 rounded-lg"></div>
                <div className="flex-1 h-6 bg-neutral-200 rounded-lg"></div>
                <div className="w-6 h-6 bg-neutral-200 rounded-lg"></div>
              </div>
            </div>

            {/* Desktop skeleton */}
            <div className="hidden md:grid grid-cols-12 gap-6 items-center">
              <div className="col-span-4 flex items-center space-x-4">
                <div className="w-10 h-10 bg-neutral-200 rounded-lg flex-shrink-0"></div>
                <div className="space-y-2">
                  <div className="h-3.5 bg-neutral-200 rounded w-24"></div>
                  <div className="h-3 bg-neutral-200 rounded w-16"></div>
                </div>
              </div>
              <div className="col-span-6">
                <div className="space-y-2">
                  <div className="h-3 bg-neutral-200 rounded w-full"></div>
                  <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-end space-x-2">
                <div className="w-10 h-6 bg-neutral-200 rounded-lg"></div>
                <div className="w-10 h-6 bg-neutral-200 rounded-lg"></div>
                <div className="w-6 h-6 bg-neutral-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="h-8 bg-neutral-200 rounded-lg flex-1 sm:max-w-md animate-pulse"></div>
      <div className="h-8 bg-neutral-200 rounded-lg w-full sm:w-32 animate-pulse"></div>
    </div>
  )
}