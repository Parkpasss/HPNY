"use client"

import { ActivityType } from "@/interface"
import { ReactNode, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { BLUR_DATA_URL } from "@/constants"

export function ActivityItemWithHoverSlider({
  activity,
}: {
  activity: ActivityType
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const images = activity?.images ?? []
  const handleMouseEnter = () => {
    if (images.length > 1 && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
      }, 2000)
    }
  }
  const handleMouseLeave = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setCurrentImageIndex(0)
  }
  return (
    <div
      key={activity.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/activities/${activity.id}`}>
        <div className="h-[320px] md:h-[240px] overflow-hidden relative z-0">
          <Image
            src={images[currentImageIndex] || "/default-image.jpg"}
            alt={activity.title}
            style={{ objectFit: "cover" }}
            fill
            placeholder="blur"
            sizes="(min-width: 640px) 240px, 320px"
            blurDataURL={BLUR_DATA_URL}
            className="rounded-md w-full h-auto object-fit hover:shadow-lg"
          />
        </div>
        <div className="mt-2 font-semibold text-sm">{activity.title}</div>
        <span className="text-xs px-2 py-1 rounded-full bg-black text-white mt-1">
          {activity.category}
        </span>
        <div className="mt-1 text-sm">
          {activity?.price?.toLocaleString()}원{" "}
          <span className="text-gray-500">/ 체험</span>
        </div>
      </Link>
    </div>
  )
}

export function ActivityItem({ activity }: { activity: ActivityType }) {
  return (
    <div key={activity.id}>
      <Link href={`/activities/${activity.id}`}>
        <div className="h-[320px] md:h-[240px] overflow-hidden relative z-0">
          <Image
            src={activity?.images?.[0] || "/default-image.jpg"}
            alt={activity.title}
            style={{ objectFit: "cover" }}
            fill
            placeholder="blur"
            sizes="(min-width: 640px) 240px, 320px"
            blurDataURL={BLUR_DATA_URL}
            className="rounded-md w-full h-auto object-fit hover:shadow-lg"
          />
        </div>
        <div className="mt-2 font-semibold text-sm">{activity.title}</div>
        <span className="text-xs px-2 py-1 rounded-full bg-black text-white mt-1">
          {activity.category}
        </span>
        <div className="mt-1 text-sm">
          {activity?.price?.toLocaleString()}원{" "}
          <span className="text-gray-500">/ 체험</span>
        </div>
      </Link>
    </div>
  )
}

export function GridLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-20 sm:px-4 md:px-8 lg:px-16">
      {children}
    </div>
  )
}
