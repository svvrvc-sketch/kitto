'use client';

import React from 'react';

interface RegionRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoting?: () => void;
  userCoordinates?: { lat: number; lng: number } | null;
}

// Region restrictions have been removed; Kitto works across all regions of Uzbekistan.
export const RegionRestrictionModal: React.FC<RegionRestrictionModalProps> = () => {
  return null;
};

export default RegionRestrictionModal;
