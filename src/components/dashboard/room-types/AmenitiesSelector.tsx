'use client';

import { useState } from 'react';
import { X, Plus, Wifi, Tv, Wind, Coffee, Shield, Droplet, Star, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AmenitiesSelectorProps {
  selectedAmenities: string[];
  onChange: (amenities: string[]) => void;
  error?: string;
}

// Common hotel amenities with icons
const COMMON_AMENITIES = [
  { id: 'wifi', label: 'WiFi', icon: Wifi },
  { id: 'tv', label: 'TV', icon: Tv },
  { id: 'ac', label: 'Air Conditioning', icon: Wind },
  { id: 'minibar', label: 'Mini Bar', icon: Utensils },
  { id: 'safe', label: 'Safe', icon: Shield },
  { id: 'coffee', label: 'Coffee Maker', icon: Coffee },
  { id: 'shower', label: 'Rain Shower', icon: Droplet },
  { id: 'balcony', label: 'Balcony', icon: Star },
  { id: 'bathtub', label: 'Bathtub', icon: Droplet },
  { id: 'workspace', label: 'Work Desk', icon: Star },
  { id: 'ironing', label: 'Iron & Board', icon: Star },
  { id: 'hairdryer', label: 'Hair Dryer', icon: Star },
];

export function AmenitiesSelector({ selectedAmenities, onChange, error }: AmenitiesSelectorProps) {
  const [customAmenity, setCustomAmenity] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Separate common and custom amenities
  const commonAmenityIds = COMMON_AMENITIES.map(a => a.id);
  const selectedCommon = selectedAmenities.filter(a => commonAmenityIds.includes(a));
  const selectedCustom = selectedAmenities.filter(a => !commonAmenityIds.includes(a));

  const toggleAmenity = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onChange(selectedAmenities.filter(a => a !== amenityId));
    } else {
      onChange([...selectedAmenities, amenityId]);
    }
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      onChange([...selectedAmenities, customAmenity.trim()]);
      setCustomAmenity('');
      setShowCustomInput(false);
    }
  };

  const removeCustomAmenity = (amenity: string) => {
    onChange(selectedAmenities.filter(a => a !== amenity));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-3">
          Amenities
        </label>
        <p className="text-sm text-[#8B8B8B] mb-4">
          Select the amenities available in this room type
        </p>
      </div>

      {/* Common Amenities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {COMMON_AMENITIES.map((amenity) => {
          const Icon = amenity.icon;
          const isSelected = selectedCommon.includes(amenity.id);

          return (
            <button
              key={amenity.id}
              type="button"
              onClick={() => toggleAmenity(amenity.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all',
                'text-sm font-medium text-left',
                isSelected
                  ? 'bg-[#C4A484]/10 border-[#C4A484] text-[#2C2C2C]'
                  : 'bg-white border-[#E8E0D5] text-[#8B8B8B] hover:border-[#C4A484]/50 hover:bg-[#F0EBE3]'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', isSelected ? 'text-[#C4A484]' : 'text-[#8B8B8B]')} />
              <span className="truncate">{amenity.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Amenities Section */}
      {selectedCustom.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-[0.1em] uppercase text-[#8B8B8B] mb-3">
            Custom Amenities
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCustom.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#A8B5A0]/20 text-sm text-[#2C2C2C] border border-[#A8B5A0]"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeCustomAmenity(amenity)}
                  className="hover:text-[#C45C5C] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Amenity */}
      {showCustomInput ? (
        <div className="flex gap-2">
          <Input
            placeholder="Enter custom amenity"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomAmenity();
              }
              if (e.key === 'Escape') {
                setShowCustomInput(false);
                setCustomAmenity('');
              }
            }}
            autoFocus
          />
          <Button
            type="button"
            variant="accent"
            onClick={addCustomAmenity}
            disabled={!customAmenity.trim()}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setShowCustomInput(false);
              setCustomAmenity('');
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
          className="inline-flex items-center gap-2 text-sm text-[#C4A484] hover:text-[#A67B5B] font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Custom Amenity
        </button>
      )}

      {/* Selected Count */}
      {selectedAmenities.length > 0 && (
        <p className="text-sm text-[#8B8B8B]">
          {selectedAmenities.length} {selectedAmenities.length === 1 ? 'amenity' : 'amenities'} selected
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-[#C45C5C] flex items-center gap-1.5">
          <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
          {error}
        </p>
      )}
    </div>
  );
}
