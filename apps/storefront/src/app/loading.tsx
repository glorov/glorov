import React from 'react'
import { Sprout } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-4">
      <div className="h-12 w-12 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 animate-pulse">
        <Sprout className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Nurturing catalog data...
      </p>
    </div>
  )
}
