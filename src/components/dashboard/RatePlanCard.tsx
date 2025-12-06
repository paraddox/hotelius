'use client';

import { Calendar, DollarSign, Layers, Moon, Edit, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { format } from 'date-fns';

interface RatePlan {
  id: string;
  name: string;
  roomType: string;
  roomTypeId: string;
  pricePerNight: number;
  validFrom: string;
  validTo: string;
  priority: number;
  minimumStay: number;
  dayOfWeekRestrictions: number[] | null;
  status: 'active' | 'inactive';
  isDefault?: boolean;
}

interface RatePlanCardProps {
  ratePlan: RatePlan;
}

const daysOfWeekShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function RatePlanCard({ ratePlan }: RatePlanCardProps) {
  const priceInDollars = (ratePlan.pricePerNight / 100).toFixed(2);

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this rate plan?')) {
      // Mock delete - in production this would call an API
      console.log('Deleting rate plan:', ratePlan.id);
    }
  };

  return (
    <Card variant="interactive" className="relative">
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {ratePlan.status === 'active' ? (
          <Badge variant="success" size="sm">Active</Badge>
        ) : (
          <Badge variant="default" size="sm">Inactive</Badge>
        )}
      </div>

      <CardHeader>
        <div className="pr-16">
          <CardTitle className="text-base mb-1">{ratePlan.name}</CardTitle>
          {ratePlan.isDefault && (
            <div className="flex items-center gap-1 text-xs text-[#C4A484] mt-1">
              <AlertCircle className="h-3 w-3" />
              <span className="font-medium">Default Rate</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <DollarSign className="h-5 w-5 text-[#C4A484]" />
          <span className="text-2xl font-['Cormorant_Garamond',Georgia,serif] font-bold text-[#2C2C2C]">
            ${priceInDollars}
          </span>
          <span className="text-sm text-[#8B8B8B]">per night</span>
        </div>

        {/* Validity Period */}
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-[#8B8B8B] mt-0.5" />
          <div className="text-sm">
            <div className="text-[#2C2C2C]">
              {format(new Date(ratePlan.validFrom), 'MMM d, yyyy')} - {format(new Date(ratePlan.validTo), 'MMM d, yyyy')}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E8E0D5]">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#8B8B8B]" />
            <div>
              <div className="text-xs text-[#8B8B8B]">Priority</div>
              <div className="text-sm font-medium text-[#2C2C2C]">{ratePlan.priority}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-[#8B8B8B]" />
            <div>
              <div className="text-xs text-[#8B8B8B]">Min Stay</div>
              <div className="text-sm font-medium text-[#2C2C2C]">
                {ratePlan.minimumStay} {ratePlan.minimumStay === 1 ? 'night' : 'nights'}
              </div>
            </div>
          </div>
        </div>

        {/* Day Restrictions */}
        {ratePlan.dayOfWeekRestrictions && ratePlan.dayOfWeekRestrictions.length > 0 && (
          <div className="pt-3 border-t border-[#E8E0D5]">
            <div className="text-xs text-[#8B8B8B] mb-2">Available Days</div>
            <div className="flex flex-wrap gap-1">
              {daysOfWeekShort.map((day, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded ${
                    ratePlan.dayOfWeekRestrictions?.includes(index)
                      ? 'bg-[#C4A484] text-white'
                      : 'bg-[#F0EBE3] text-[#8B8B8B]'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#E8E0D5]">
          <Link
            href={`/dashboard/rates/${ratePlan.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[#2C2C2C] bg-[#F0EBE3] hover:bg-[#E8E0D5] rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center p-2 text-[#C45C5C] hover:bg-[#FFEBEE] rounded-lg transition-colors"
            title="Delete rate plan"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
