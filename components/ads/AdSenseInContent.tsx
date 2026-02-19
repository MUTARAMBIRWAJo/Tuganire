'use client'

import Script from "next/script"

interface AdSenseInContentProps {
  adSlot: string
  className?: string
  position?: "top" | "middle" | "bottom"
}

export default function AdSenseInContent({ 
  adSlot, 
  className = "",
  position = "middle"
}: AdSenseInContentProps) {
  const getAdStyle = () => {
    switch (position) {
      case "top":
        return { display: "block", width: "100%", height: "90px" }
      case "bottom":
        return { display: "block", width: "100%", height: "250px" }
      default:
        return { display: "block", width: "100%", height: "250px" }
    }
  }

  return (
    <div className={`my-8 ${className}`}>
      <div className="text-center text-xs text-gray-500 mb-2">Advertisement</div>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1524579863977140"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={getAdStyle()}
        data-ad-client="ca-pub-1524579863977140"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      <Script id={`adsbygoogle-init-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  )
}
