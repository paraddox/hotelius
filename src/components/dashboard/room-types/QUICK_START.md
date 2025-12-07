# Room Type Components - Quick Start Guide

## Installation & Setup

### Prerequisites
All dependencies are already included in the project:
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `lucide-react`

### Import Components

```typescript
// Import individual components
import { MultiLanguageInput } from '@/components/ui/MultiLanguageInput';
import { PhotoUploader } from '@/components/dashboard/room-types/PhotoUploader';
import { OccupancySettingsComponent, occupancySchema } from '@/components/dashboard/room-types/OccupancySettings';

// Or import from index
import {
  RoomTypeForm,
  AmenitiesSelector,
  PhotoUploader,
  OccupancySettingsComponent
} from '@/components/dashboard/room-types';
```

---

## Usage Examples

### 1. MultiLanguageInput - Quick Start

**Basic Text Input:**
```tsx
import { Controller } from 'react-hook-form';
import { MultiLanguageInput } from '@/components/ui/MultiLanguageInput';

<Controller
  name="name"
  control={control}
  render={({ field }) => (
    <MultiLanguageInput
      label="Room Type Name"
      value={field.value}
      onChange={field.onChange}
      required
    />
  )}
/>
```

**Textarea with Character Limit:**
```tsx
<Controller
  name="description"
  control={control}
  render={({ field }) => (
    <MultiLanguageInput
      label="Description"
      type="textarea"
      rows={4}
      maxLength={500}
      value={field.value}
      onChange={field.onChange}
      error={errors.description?.message}
    />
  )}
/>
```

**Schema:**
```typescript
const schema = z.object({
  name: z.record(z.string()).refine(
    (data) => data.en && data.en.length >= 3,
    { message: 'English name required (min 3 chars)' }
  )
});
```

---

### 2. PhotoUploader - Quick Start

**Basic Usage:**
```tsx
import { PhotoUploader } from '@/components/dashboard/room-types/PhotoUploader';

const [images, setImages] = useState<string[]>([]);

<PhotoUploader
  images={images}
  onChange={setImages}
  maxImages={6}
  bucket="room-images"
  pathPrefix={`room-types/${hotelId}`}
/>
```

**With React Hook Form:**
```tsx
<PhotoUploader
  images={watch('images') || []}
  onChange={(newImages) => setValue('images', newImages)}
  maxImages={6}
  error={errors.images?.message}
  bucket="room-images"
  pathPrefix={`room-types/${hotelId}`}
/>
```

**Schema:**
```typescript
const schema = z.object({
  images: z.array(z.string()).optional()
});
```

---

### 3. OccupancySettings - Quick Start

**Basic Usage:**
```tsx
import { OccupancySettingsComponent } from '@/components/dashboard/room-types/OccupancySettings';

<Controller
  name="maxOccupancyAdults"
  control={control}
  render={() => (
    <OccupancySettingsComponent
      value={{
        maxOccupancyAdults: watch('maxOccupancyAdults'),
        maxOccupancyChildren: watch('maxOccupancyChildren')
      }}
      onChange={(occupancy) => {
        setValue('maxOccupancyAdults', occupancy.maxOccupancyAdults);
        setValue('maxOccupancyChildren', occupancy.maxOccupancyChildren);
      }}
      errors={{
        maxOccupancyAdults: errors.maxOccupancyAdults?.message,
        maxOccupancyChildren: errors.maxOccupancyChildren?.message
      }}
    />
  )}
/>
```

**With Advanced Settings:**
```tsx
<OccupancySettingsComponent
  value={{
    maxOccupancyAdults: watch('maxOccupancyAdults'),
    maxOccupancyChildren: watch('maxOccupancyChildren'),
    baseOccupancy: watch('baseOccupancy'),
    extraGuestCharge: watch('extraGuestCharge')
  }}
  onChange={(occupancy) => {
    setValue('maxOccupancyAdults', occupancy.maxOccupancyAdults);
    setValue('maxOccupancyChildren', occupancy.maxOccupancyChildren);
    setValue('baseOccupancy', occupancy.baseOccupancy);
    setValue('extraGuestCharge', occupancy.extraGuestCharge);
  }}
  showAdvanced={true}
/>
```

**Schema (use exported schema):**
```typescript
import { occupancySchema } from '@/components/dashboard/room-types/OccupancySettings';

const schema = z.object({
  ...occupancySchema.shape,
  // other fields...
});
```

---

## Complete Form Example

```typescript
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MultiLanguageInput } from '@/components/ui/MultiLanguageInput';
import {
  PhotoUploader,
  OccupancySettingsComponent,
  occupancySchema
} from '@/components/dashboard/room-types';

const formSchema = z.object({
  name: z.record(z.string()).refine(
    (data) => data.en && data.en.length >= 3,
    { message: 'English name required (min 3 chars)' }
  ),
  description: z.record(z.string()).refine(
    (data) => data.en && data.en.length >= 10,
    { message: 'English description required (min 10 chars)' }
  ),
  basePrice: z.number().min(1000),
  ...occupancySchema.shape,
  images: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function MyRoomTypeForm({ hotelId }: { hotelId: string }) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: { en: '', es: '' },
      description: { en: '', es: '' },
      basePrice: 0,
      maxOccupancyAdults: 2,
      maxOccupancyChildren: 0,
      images: [],
    }
  });

  const onSubmit = (data: FormData) => {
    console.log('Form data:', data);
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Multi-language Name */}
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
          />
        )}
      />

      {/* Multi-language Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <MultiLanguageInput
            label="Description"
            type="textarea"
            rows={4}
            value={field.value}
            onChange={field.onChange}
            error={errors.description?.message}
            required
          />
        )}
      />

      {/* Occupancy Settings */}
      <Controller
        name="maxOccupancyAdults"
        control={control}
        render={() => (
          <OccupancySettingsComponent
            value={{
              maxOccupancyAdults: watch('maxOccupancyAdults'),
              maxOccupancyChildren: watch('maxOccupancyChildren'),
            }}
            onChange={(occupancy) => {
              setValue('maxOccupancyAdults', occupancy.maxOccupancyAdults);
              setValue('maxOccupancyChildren', occupancy.maxOccupancyChildren);
            }}
            errors={{
              maxOccupancyAdults: errors.maxOccupancyAdults?.message,
              maxOccupancyChildren: errors.maxOccupancyChildren?.message,
            }}
          />
        )}
      />

      {/* Photo Upload */}
      <PhotoUploader
        images={watch('images') || []}
        onChange={(newImages) => setValue('images', newImages)}
        maxImages={6}
        bucket="room-images"
        pathPrefix={`room-types/${hotelId}`}
        error={errors.images?.message}
      />

      <button type="submit">Save Room Type</button>
    </form>
  );
}
```

---

## Common Patterns

### 1. Default Values

**Load existing data:**
```typescript
const { control } = useForm({
  defaultValues: {
    name: existingData?.name || { en: '', es: '' },
    description: existingData?.description || { en: '', es: '' },
    maxOccupancyAdults: existingData?.maxOccupancyAdults || 2,
    images: existingData?.images || [],
  }
});
```

### 2. Conditional Rendering

**Show advanced settings based on toggle:**
```typescript
const [showAdvanced, setShowAdvanced] = useState(false);

<OccupancySettingsComponent
  value={occupancyData}
  onChange={handleOccupancyChange}
  showAdvanced={showAdvanced}
/>
```

### 3. Custom Validation Messages

```typescript
const schema = z.object({
  name: z.record(z.string()).refine(
    (data) => data.en?.length >= 3,
    { message: 'Room name must be at least 3 characters' }
  ),
  images: z.array(z.string()).min(1, 'At least one image required')
});
```

### 4. Dynamic Path Prefix

```typescript
const pathPrefix = useMemo(() => {
  return `room-types/${hotelId}/${Date.now()}`;
}, [hotelId]);

<PhotoUploader
  pathPrefix={pathPrefix}
  // ...
/>
```

---

## Troubleshooting

### Common Issues

**Issue: "name.en is not defined" error**
```typescript
// ❌ Wrong
defaultValues: {
  name: '',
  description: ''
}

// ✅ Correct
defaultValues: {
  name: { en: '', es: '' },
  description: { en: '', es: '' }
}
```

**Issue: Images not uploading**
```typescript
// Check Supabase Storage bucket exists and has proper policies
// Verify bucket name and pathPrefix are correct
// Check browser console for CORS errors
```

**Issue: Validation not working**
```typescript
// Ensure zodResolver is imported and used
import { zodResolver } from '@hookform/resolvers/zod';

const { control } = useForm({
  resolver: zodResolver(formSchema), // Don't forget this!
});
```

**Issue: Controller not updating form state**
```typescript
// Make sure you're using setValue from react-hook-form
<Controller
  name="name"
  control={control}
  render={({ field }) => (
    <MultiLanguageInput
      value={field.value}          // ✅ Use field.value
      onChange={field.onChange}    // ✅ Use field.onChange
    />
  )}
/>
```

---

## TypeScript Tips

### Type-safe Forms

```typescript
// Define your form data type
type RoomTypeFormData = z.infer<typeof formSchema>;

// Use it in useForm
const { control } = useForm<RoomTypeFormData>({
  resolver: zodResolver(formSchema)
});

// TypeScript will now enforce types
```

### Component Props

```typescript
import type {
  MultiLanguageInputProps,
  OccupancySettings
} from '@/components/dashboard/room-types';

// Use exported types for consistency
```

---

## Performance Tips

### 1. Memoize Callbacks
```typescript
const handleImageChange = useCallback((newImages: string[]) => {
  setValue('images', newImages);
}, [setValue]);

<PhotoUploader onChange={handleImageChange} />
```

### 2. Debounce Character Counter
```typescript
// Already implemented in MultiLanguageInput
// No action needed
```

### 3. Lazy Load Images
```typescript
// Already implemented in PhotoUploader
// Images use object URLs for fast preview
```

---

## Styling Customization

### Override Colors

```tsx
// Change accent color
<div className="border-[#C4A484]">  {/* Default terracotta */}
<div className="border-[#YOUR_COLOR]"> {/* Custom color */}
```

### Override Fonts

```tsx
// Change heading font
<h3 className="font-['Cormorant_Garamond',Georgia,serif]">
<h3 className="font-['Your_Font',serif]">
```

---

## Next Steps

1. **Read Full Documentation:** `COMPONENTS.md`
2. **Understand Architecture:** `ARCHITECTURE.md`
3. **Review Implementation:** `PHASE_7.5_SUMMARY.md`
4. **Test Components:** Use the examples above
5. **Customize:** Adapt to your specific needs

---

## Support

- Component docs: `./COMPONENTS.md`
- Architecture: `./ARCHITECTURE.md`
- Database schema: `/supabase/migrations/004_room_types.sql`
- Storage utilities: `/src/lib/storage/upload.ts`

---

**Happy coding!** 🚀
