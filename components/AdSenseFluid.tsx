'use client'

import Script from "next/script"

interface AdSenseFluidProps {
  adSlot: string
  className?: string
}

export default function AdSenseFluid({ adSlot, className = "" }: AdSenseFluidProps) {
  return (
    <div className={`w-full ${className}`}>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1524579863977140"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        data-ad-layout-key="-h9+13+6n-1g-c5"
        data-ad-client="ca-pub-1524579863977140"
        data-ad-slot={adSlot}
      />
      <Script id={`adsbygoogle-init-${adSlot}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  )
}
