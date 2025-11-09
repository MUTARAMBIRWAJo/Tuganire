"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface Advertisement {
  id: string
  title: string
  description: string | null
  media_type: "image" | "video"
  media_url: string
  link_url: string | null
}

export default function AdvertisementMarquee() {
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch("/api/public/advertisements")
        if (!response.ok) throw new Error("Failed to fetch ads")
        const data = await response.json()
        setAds(data.ads || [])
      } catch (error) {
        console.error("Error fetching advertisements:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading ads...</div>
      </div>
    )
  }

  if (ads.length === 0) {
    return null
  }

  // Duplicate ads for seamless loop
  const duplicatedAds = [...ads, ...ads, ...ads]

  const AdContent = ({ ad, index }: { ad: Advertisement; index: number }) => {
    const content = (
      <div className="mb-4 last:mb-0">
        {ad.media_type === "video" ? (
          <video
            src={ad.media_url}
            className="w-full h-auto rounded-lg object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700">
            <Image
              src={ad.media_url}
              alt={ad.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 200px"
            />
          </div>
        )}
        {ad.title && (
          <p className="mt-2 text-xs text-center text-gray-600 dark:text-gray-400 line-clamp-2">
            {ad.title}
          </p>
        )}
      </div>
    )

    if (ad.link_url) {
      return (
        <Link
          href={ad.link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-90 transition-opacity"
          onClick={() => {
            // Track click
            fetch(`/api/public/advertisements/${ad.id}/click`, { method: "POST" }).catch(() => {})
          }}
        >
          {content}
        </Link>
      )
    }

    return content
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Advertisement</h3>
      </div>
      <div className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 flex flex-col"
          style={{
            animation: `scroll-vertical ${ads.length * 3}s linear infinite`,
          }}
        >
          {duplicatedAds.map((ad, index) => (
            <AdContent key={`${ad.id}-${index}`} ad={ad} index={index} />
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll-vertical {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-33.333%);
          }
        }
      `}</style>
    </div>
  )
}

