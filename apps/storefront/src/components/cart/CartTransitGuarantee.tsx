'use client'

import React from 'react'
import { GlorovCustomIcons } from '../common/GlorovIcons'

/**
 * GLOROV Safe Botanical Transit & Care Guarantee Strip
 * 100% matched with Flutter `_buildTransitGuaranteeCard`:
 * 3 botanical trust pillars (100% Safe Transit, Live Plant Guarantee, Eco Packaging)
 * with mint background and subtle green separators.
 */
export const CartTransitGuarantee: React.FC = () => {
  return (
    <div className="w-full px-2.5 py-2.5 rounded-[16px] bg-[#F2FAF5] border border-[#C7EBD8] flex items-center justify-center">
      <div className="flex items-center justify-center gap-2 flex-wrap text-center select-none">
        <div className="flex items-center gap-1">
          <GlorovCustomIcons.shield size={13} className="text-[#0A4C36]" />
          <span className="text-[10px] font-bold text-[#0A4C36]">
            100% Safe Transit
          </span>
        </div>

        <span className="text-[#A7F3D0]">•</span>

        <div className="flex items-center gap-1">
          <GlorovCustomIcons.eco size={13} className="text-[#0A4C36]" />
          <span className="text-[10px] font-bold text-[#0A4C36]">
            Live Plant Guarantee
          </span>
        </div>

        <span className="text-[#A7F3D0]">•</span>

        <div className="flex items-center gap-1">
          <GlorovCustomIcons.recycle size={13} className="text-[#0A4C36]" />
          <span className="text-[10px] font-bold text-[#0A4C36]">
            Eco Packaging
          </span>
        </div>
      </div>
    </div>
  )
}
