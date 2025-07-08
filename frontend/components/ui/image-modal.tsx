"use client"

import React from "react"
import { X, Download, File, ExternalLink } from "lucide-react"

interface ImageModalProps {
  show: boolean
  imageUrl: string
  alt: string
  onClose: () => void
}

export function ImageModal({ show, imageUrl, alt, onClose }: ImageModalProps) {
  if (!show) return null
  
  // Check if it's an image file
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(alt);
  const isPDF = /\.pdf$/i.test(alt);
  
  // For image URLs from the server, we may need to make them absolute
  const fullImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '')}/storage/${imageUrl}`;
  
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
        
        {/* Download button */}
        <a
          href={fullImageUrl}
          download={alt}
          className="absolute -top-3 -left-3 w-8 h-8 bg-white rounded-full shadow-lg text-green-600 hover:text-green-800 hover:shadow-xl transition-all duration-200 flex items-center justify-center border border-neutral-200/60"
          style={{ zIndex: 100000 }}
          title="Download file"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="h-4 w-4" />
        </a>
        
        {isImage ? (
          // For images
          <img
            src={fullImageUrl}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            draggable={false}
          />
        ) : isPDF ? (
          // For PDFs
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-gray-100 p-4 flex justify-between items-center border-b">
              <div className="flex items-center">
                <File className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-medium truncate max-w-[300px]">{alt}</span>
              </div>
              <a 
                href={fullImageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </a>
            </div>
            <iframe 
              src={fullImageUrl} 
              className="w-full h-[70vh]"
              title={alt}
            />
          </div>
        ) : (
          // For other files
          <div className="bg-white p-6 rounded-lg shadow-2xl text-center max-w-md">
            <File className="h-16 w-16 mx-auto text-blue-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2 break-all">{alt}</h3>
            <p className="text-gray-600 mb-6">This file type cannot be previewed</p>
            <div className="flex justify-center">
              <a
                href={fullImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors mr-3 flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </a>
              <a
                href={fullImageUrl}
                download={alt}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
