'use client'

import { Product, User } from '@/types/database'
import Image from 'next/image'
import { useState } from 'react'
import LotteryModal from './LotteryModal'

interface ProductCardProps {
  product: Product
  user: User | null
}

export default function ProductCard({ product, user }: ProductCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const activeRound = product.active_rounds?.[0]

  const getProductName = (names: Record<string, string>) => {
    // 根据用户语言偏好选择名称
    if (typeof window !== 'undefined') {
      const userLang = localStorage.getItem('userLang') || 'en'
      return names[userLang] || names['en'] || names['zh'] || Object.values(names)[0] || 'Unknown'
    }
    return names['en'] || names['zh'] || Object.values(names)[0] || 'Unknown'
  }

  const getProductDescription = (descriptions: Record<string, string>) => {
    // 根据用户语言偏好选择描述
    if (typeof window !== 'undefined') {
      const userLang = localStorage.getItem('userLang') || 'en'
      return descriptions[userLang] || descriptions['en'] || descriptions['zh'] || Object.values(descriptions)[0] || ''
    }
    return descriptions['en'] || descriptions['zh'] || Object.values(descriptions)[0] || ''
  }

  const handleImageLoad = () => {
    setImageLoading(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
        onClick={() => activeRound && setShowModal(true)}
      >
        <div className="relative h-48 bg-gray-200">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-pulse bg-gray-300 w-full h-full"></div>
            </div>
          )}
          
          {!imageError ? (
            <Image
              src={product.image_url}
              alt={getProductName(product.name)}
              fill
              className="object-cover transition-opacity duration-300"
              onLoad={handleImageLoad}
              onError={handleImageError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-gray-400 text-center">
                <div className="text-4xl mb-2">📦</div>
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2 line-clamp-2">{getProductName(product.name)}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {getProductDescription(product.description)}
          </p>
          
          {activeRound ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Per Share:</span>
                <span className="font-bold text-blue-600">${activeRound.price_per_share}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((activeRound.sold_shares / activeRound.total_shares) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-600">
                <span>{activeRound.sold_shares}/{activeRound.total_shares} Sold</span>
                <span className={`font-semibold ${
                  activeRound.status === 'active' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {activeRound.status === 'active' ? 'Active' : 'Ready to Draw'}
                </span>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowModal(true)
                }}
                className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={activeRound.status !== 'active'}
              >
                {activeRound.status === 'active' ? 'Participate Now' : 'View Details'}
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-2">
              No active lottery
            </div>
          )}
        </div>
      </div>

      {showModal && activeRound && (
        <LotteryModal
          product={product}
          lotteryRound={activeRound}
          user={user}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
