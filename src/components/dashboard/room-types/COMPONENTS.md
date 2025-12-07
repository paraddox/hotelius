# Room Type Form Components - Phase 7.5

This directory contains specialized form components for managing room types in the hotel dashboard.

## Components Overview

### 1. MultiLanguageInput (`src/components/ui/MultiLanguageInput.tsx`)

A reusable form component for handling internationalized (i18n) content stored as JSONB in the database.

**Features:**
- Tab-based language switching between English and Spanish
- Support for both text input and textarea
- Visual indicators for which languages have content
- Character count for textarea mode
- Full Zod validation support
- Follows design system (Cormorant Garamond + DM Sans, terracotta/charcoal/cream/sage colors)

**Props:**
```typescript
interface MultiLanguageInputProps {
  label: string;
  value: Record<string, string>;  // e.g., { en: "Deluxe Room", es: "Habitación Deluxe" }
  onChange: (value: Record<string, string>) => void;
  error?: string;
  hint?: string;
  type?: 'input' | 'textarea';
  placeholder?: Record<string, string>;
  required?: boolean;
  rows?: number;
  maxLength?: number;
}
```

**Usage Example:**
```tsx
<Controller
  name="name"
  control={control}
  render={({ field }) => (
    <MultiLanguageInput
      label="Room Type Name"
      value={field.value}
      onChange={field.onChange}
      error={errors.name?.message}
      required
      placeholder={{
        en: 'e.g., Deluxe Room',
        es: 'e.g., Habitación Deluxe',
      }}
      hint="Enter the room type name in multiple languages"
    />
  )}
/>
```

**Database Integration:**
The component outputs data in the format expected by JSONB columns:
```sql
-- In database:
name JSONB NOT NULL DEFAULT '{"en": ""}'::jsonb
description JSONB NOT NULL DEFAULT '{"en": ""}'::jsonb
```

---

### 2. PhotoUploader (`src/components/dashboard/room-types/PhotoUploader.tsx`)

Enhanced image uploader with drag-and-drop, progress tracking, and Supabase Storage integration.

**Features:**
- Drag-and-drop file upload with visual feedback
- Multiple file selection
- Automatic image resizing (max 1920x1080) before upload
- File validation (type, size)
- Upload progress tracking with percentage
- Image reordering via drag-and-drop
- Primary photo indicator (first image)
- Error handling and display
- Integration with Supabase Storage

**Props:**
```typescript
interface PhotoUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;        // Default: 6
  label?: string;           // Default: "Room Photos"
  error?: string;
  bucket?: string;          // Supabase Storage bucket
  pathPrefix?: string;      // Path prefix for uploads
}
```

**Usage Example:**
```tsx
<PhotoUploader
  images={images}
  onChange={(newImages) => setValue('images', newImages)}
  maxImages={6}
  label="Room Photos"
  error={errors.images?.message}
  bucket="room-images"
  pathPrefix={`room-types/${hotelId}`}
/>
```

**Upload Flow:**
1. User selects/drops images
2. Client-side validation (type, size)
3. Image resizing for optimization
4. Upload to Supabase Storage with progress tracking
5. Public URLs returned and added to form state

**File Requirements:**
- Formats: JPEG, PNG, WebP
- Max size: 5MB per image
- Auto-resize to max 1920x1080px

---

### 3. OccupancySettings (`src/components/dashboard/room-types/OccupancySettings.tsx`)

Interactive form component for configuring room occupancy limits and pricing.

**Features:**
- Visual increment/decrement controls for adults and children
- Real-time total occupancy calculation
- Advanced settings for base occupancy and extra guest charges
- Pricing example calculator
- Full Zod validation with exported schema
- Accessible controls with proper ARIA labels

**Props:**
```typescript
interface OccupancySettingsProps {
  value: OccupancySettings;
  onChange: (value: OccupancySettings) => void;
  errors?: Partial<Record<keyof OccupancySettings, string>>;
  showAdvanced?: boolean;
}

type OccupancySettings = {
  maxOccupancyAdults: number;      // 1-20
  maxOccupancyChildren: number;    // 0-10
  maxTotalOccupancy?: number;      // Calculated
  baseOccupancy?: number;          // 1-20
  extraGuestCharge?: number;       // cents
};
```

**Validation Schema:**
```typescript
import { occupancySchema } from './OccupancySettings';

const schema = z.object({
  ...occupancySchema.shape,
  // ... other fields
});
```

**Usage Example:**
```tsx
<Controller
  name="maxOccupancyAdults"
  control={control}
  render={({ field }) => (
    <OccupancySettingsComponent
      value={{
        maxOccupancyAdults: watch('maxOccupancyAdults'),
        maxOccupancyChildren: watch('maxOccupancyChildren'),
        baseOccupancy: watch('baseOccupancy'),
        extraGuestCharge: watch('extraGuestCharge'),
      }}
      onChange={(occupancy) => {
        setValue('maxOccupancyAdults', occupancy.maxOccupancyAdults);
        setValue('maxOccupancyChildren', occupancy.maxOccupancyChildren);
        setValue('baseOccupancy', occupancy.baseOccupancy);
        setValue('extraGuestCharge', occupancy.extraGuestCharge);
      }}
      errors={{
        maxOccupancyAdults: errors.maxOccupancyAdults?.message,
        maxOccupancyChildren: errors.maxOccupancyChildren?.message,
      }}
      showAdvanced={true}
    />
  )}
/>
```

**Pricing Logic:**
- Base occupancy: Number of guests included in base price
- Extra guest charge: Additional fee per guest beyond base occupancy
- Example: Base occupancy = 2, extra charge = $25/night
  - 2 guests = base price
  - 3 guests = base price + $25
  - 4 guests = base price + $50

---

### 4. AmenitiesSelector (Existing)

Grid-based amenity selector with common amenities and custom options.

**Features:**
- Predefined common amenities with icons
- Custom amenity input
- Visual selection states
- Removal of custom amenities

See `AmenitiesSelector.tsx` for full documentation.

---

## Updated RoomTypeForm

The main `RoomTypeForm` component has been updated to use all new components:

**Changes:**
1. ✅ Uses `MultiLanguageInput` for name and description
2. ✅ Uses `PhotoUploader` for image uploads
3. ✅ Uses `OccupancySettingsComponent` for occupancy configuration
4. ✅ Updated Zod schema to validate JSONB fields
5. ✅ Integrated with react-hook-form's `Controller` for complex components

**New Schema:**
```typescript
const roomTypeSchema = z.object({
  name: z.record(z.string().min(1)).refine(
    (data) => data.en && data.en.length >= 3,
    { message: 'English name must be at least 3 characters' }
  ),
  description: z.record(z.string().min(1)).refine(
    (data) => data.en && data.en.length >= 10,
    { message: 'English description must be at least 10 characters' }
  ),
  basePrice: z.number().min(1000).max(100000000),
  maxOccupancyAdults: z.number().min(1).max(20),
  maxOccupancyChildren: z.number().min(0).max(10),
  baseOccupancy: z.number().min(1).max(20).optional(),
  extraGuestCharge: z.number().min(0).max(100000).optional(),
  amenities: z.array(z.string()).min(1),
  images: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive']),
});
```

---

## Design System Compliance

All components follow the Hotelius design system:

**Colors:**
- Terracotta: `#C4A484` (primary accent)
- Charcoal: `#2C2C2C` (text)
- Cream: `#FAF7F2` (backgrounds)
- Sage: `#A8B5A0` (secondary accent)
- Neutral Gray: `#8B8B8B` (labels, hints)
- Error Red: `#C45C5C`

**Typography:**
- Headings: `font-['Cormorant_Garamond',Georgia,serif]`
- Body: `font-sans` (DM Sans/system fonts)
- Labels: Uppercase, tracked, semibold

**Spacing & Layout:**
- Consistent padding/margins using Tailwind scale
- Rounded corners: `rounded-lg` (8px)
- Focus rings: 2px with 15-20% opacity

**Interactions:**
- Smooth transitions (150-300ms)
- Hover states with subtle color shifts
- Focus-visible outlines for accessibility
- Disabled states with reduced opacity

---

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── MultiLanguageInput.tsx  ← New i18n input component
│   │   ├── Input.tsx
│   │   ├── Button.tsx
│   │   └── index.ts               ← Updated with MultiLanguageInput export
│   └── dashboard/
│       └── room-types/
│           ├── RoomTypeForm.tsx    ← Updated to use new components
│           ├── AmenitiesSelector.tsx
│           ├── PhotoUploader.tsx   ← New enhanced uploader
│           ├── OccupancySettings.tsx ← New occupancy component
│           ├── index.ts           ← Exports all room type components
│           └── COMPONENTS.md      ← This file
└── lib/
    └── storage/
        └── upload.ts              ← Image upload utilities
```

---

## Testing Checklist

When testing these components:

- [ ] Multi-language input switches between languages correctly
- [ ] Character counter updates in real-time
- [ ] Drag-and-drop file upload works
- [ ] Image validation prevents invalid files
- [ ] Upload progress displays correctly
- [ ] Images can be reordered via drag-and-drop
- [ ] Primary photo badge appears on first image
- [ ] Occupancy increment/decrement respects min/max
- [ ] Total occupancy calculates correctly
- [ ] Extra guest charge displays in dollars
- [ ] Form validation catches all errors
- [ ] All components render correctly on mobile
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen readers can access all content

---

## Future Enhancements

Potential improvements for future phases:

1. **MultiLanguageInput:**
   - Add more languages (French, German, Italian, etc.)
   - Rich text editor mode for descriptions
   - Translation API integration

2. **PhotoUploader:**
   - Image cropping/editing
   - Bulk upload optimization
   - CDN integration
   - Thumbnail generation
   - Alt text for accessibility

3. **OccupancySettings:**
   - Age-based pricing tiers
   - Seasonal occupancy rules
   - Group booking discounts
   - Child age range definitions

4. **General:**
   - Autosave drafts
   - Form progress indicator
   - Undo/redo functionality
   - Duplicate room type feature

---

## Support

For questions or issues with these components, refer to:
- Design system documentation: `/docs/design-system.md`
- Database schema: `/supabase/migrations/004_room_types.sql`
- Storage setup: `/supabase/migrations/009_media.sql`
