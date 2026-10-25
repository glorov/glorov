import React from 'react'
import Link from 'next/link'
import { Sprout, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="h-16 w-16 rounded-full bg-earth-200 flex items-center justify-center text-botanical-800">
        <Sprout className="h-8 w-8" />
      </div>
      <div className="space-y-1 max-w-md">
        <span className="text-xs uppercase tracking-widest font-bold text-amber-700">
          404 — Page Not Found
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-botanical-950">
          This Specimen Could Not Be Found
        </h1>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The seed or plant variety you are looking for may have been transplanted or the URL may be incorrect.
        </p>
      </div>
      <div className="pt-2">
        <Button asChild variant="botanical" className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Link>
        </Button>
      </div>
    </div>
  )
}
