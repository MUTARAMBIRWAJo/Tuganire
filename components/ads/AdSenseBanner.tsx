'use client'

import Script from "next/script"

interface AdSenseBannerProps {
  adSlot: string
  adFormat?: "auto" | "rectangle" | "horizontal" | "vertical"
  className?: string
  fullWidth?: boolean
}

export default function AdSenseBanner({ 
  adSlot, 
  adFormat = "auto", 
  className = "",
  fullWidth = true 
}: AdSenseBannerProps) {
  const adStyle = {
    display: "block",
    width: fullWidth ? "100%" : "300px",
    height: adFormat === "horizontal" ? "90px" : adFormat === "vertical" ? "600px" : "250px"
  }

  return (
    <div className={`w-full flex justify-center ${className}`}>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1524579863977140"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-1524579863977140"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidth ? "true" : "false"}
      />
      <Script id={`adsbygoogle-init-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  )
}
