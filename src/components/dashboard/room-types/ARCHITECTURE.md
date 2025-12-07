# Room Type Form Architecture

## Component Hierarchy

```
RoomTypeForm (Main Form Container)
├── Basic Information Section
│   ├── MultiLanguageInput (name)
│   │   ├── Language Tabs (EN/ES)
│   │   ├── Input Field (per language)
│   │   └── Validation Feedback
│   └── MultiLanguageInput (description)
│       ├── Language Tabs (EN/ES)
│       ├── Textarea (per language)
│       ├── Character Counter
│       └── Validation Feedback
│
├── Pricing Section
│   └── Base Price Input
│       ├── Dollar Sign Icon
│       ├── Cents Conversion Logic
│       └── Validation Feedback
│
├── Occupancy Settings Section
│   └── OccupancySettingsComponent
│       ├── Adults Control
│       │   ├── Decrement Button
│       │   ├── Count Display
│       │   └── Increment Button
│       ├── Children Control
│       │   ├── Decrement Button
│       │   ├── Count Display
│       │   └── Increment Button
│       ├── Total Occupancy Summary
│       └── Advanced Settings (optional)
│           ├── Base Occupancy Input
│           ├── Extra Guest Charge Input
│           └── Pricing Example
│
├── Amenities Section
│   └── AmenitiesSelector
│       ├── Common Amenities Grid
│       │   └── Amenity Button (with icon) x12
│       ├── Custom Amenities
│       │   └── Custom Amenity Tag (removable)
│       └── Add Custom Input
│
├── Photos Section
│   └── PhotoUploader
│       ├── Upload Area
│       │   ├── Drag & Drop Zone
│       │   ├── Browse Button
│       │   └── File Input (hidden)
│       ├── Upload Progress (conditional)
│       │   ├── Progress Bar
│       │   └── Status Text
│       ├── Error Display (conditional)
│       │   └── Error List
│       └── Image Grid
│           └── Image Preview (draggable, removable)
│               ├── Image Element
│               ├── Remove Button (on hover)
│               └── Primary Badge (first image)
│
├── Status Section
│   └── Select (active/inactive)
│
└── Form Actions
    ├── Delete Button (edit mode only)
    │   └── Delete Confirmation Modal
    └── Action Buttons
        ├── Cancel Button
        └── Submit Button (with loading state)
```

---

## Data Flow

### Form State Management (react-hook-form)

```
User Input
    ↓
Component onChange Handler
    ↓
setValue() / Controller
    ↓
Form State (watch/register)
    ↓
Zod Validation
    ↓
Error State or Valid Data
    ↓
onSubmit Handler
    ↓
API Call (create/update)
    ↓
Database (Supabase)
```

### Image Upload Flow

```
User Selects/Drops Files
    ↓
File Validation (client-side)
    ↓
Image Resizing (max 1920x1080)
    ↓
Upload to Supabase Storage
    ↓
Progress Tracking
    ↓
Public URLs Retrieved
    ↓
Form State Updated
    ↓
Form Submission → Database
```

### Multi-language Data Flow

```
User Input in Language Tab
    ↓
MultiLanguageInput State
    { en: "value", es: "valor" }
    ↓
Form State (Controller)
    ↓
Zod Validation (refine)
    ↓
Submit as JSONB
    ↓
Database Column (JSONB)
    name: { "en": "value", "es": "valor" }
```

---

## State Management

### Form Level State (react-hook-form)
```typescript
const {
  register,        // For simple inputs
  handleSubmit,    // Form submission
  setValue,        // Manual value updates
  watch,          // Subscribe to field values
  control,        // Controller for complex components
  formState: { errors }  // Validation errors
} = useForm<RoomTypeFormData>({
  resolver: zodResolver(roomTypeSchema),
  defaultValues: { ... }
});
```

### Component-specific State

**MultiLanguageInput:**
```typescript
const [activeTab, setActiveTab] = useState<string>('en');
// Controls which language is currently being edited
```

**PhotoUploader:**
```typescript
const [isDragging, setIsDragging] = useState(false);
// Visual feedback during drag operations

const [progress, setProgress] = useState<UploadProgress>({
  completed: 0,
  total: 0,
  uploading: false,
  errors: []
});
// Upload progress tracking
```

**OccupancySettings:**
```typescript
// No internal state - controlled component
// All state managed by parent form
```

---

## Validation Strategy

### Three Levels of Validation

1. **Input-level (HTML attributes)**
   ```tsx
   <input type="number" min={1} max={20} required />
   ```

2. **Component-level (Client-side)**
   ```typescript
   const validation = validateImage(file);
   if (!validation.valid) {
     setErrors([validation.error]);
   }
   ```

3. **Form-level (Zod schema)**
   ```typescript
   const schema = z.object({
     name: z.record(z.string()).refine(
       (data) => data.en && data.en.length >= 3
     ),
     // ...
   });
   ```

### Error Display Patterns

**Field Errors:**
```tsx
{errors.fieldName && (
  <p className="text-sm text-[#C45C5C] flex items-center gap-1.5">
    <span className="inline-block w-1 h-1 rounded-full bg-[#C45C5C]" />
    {errors.fieldName.message}
  </p>
)}
```

**Bulk Errors (Upload):**
```tsx
<div className="bg-[#FFF3F3] border border-[#C45C5C] rounded-lg p-4">
  <AlertCircle className="w-5 h-5 text-[#C45C5C]" />
  <ul>
    {errors.map((error, i) => <li key={i}>{error}</li>)}
  </ul>
</div>
```

---

## Integration Points

### Database Schema
```sql
CREATE TABLE room_types (
  id UUID PRIMARY KEY,
  hotel_id UUID REFERENCES hotels(id),
  name JSONB NOT NULL,                    -- MultiLanguageInput
  description JSONB NOT NULL,             -- MultiLanguageInput
  base_price INTEGER NOT NULL,            -- Price input (cents)
  max_occupancy_adults INTEGER NOT NULL,  -- OccupancySettings
  max_occupancy_children INTEGER NOT NULL,-- OccupancySettings
  base_occupancy INTEGER,                 -- OccupancySettings (advanced)
  extra_guest_charge INTEGER,             -- OccupancySettings (advanced)
  amenities JSONB NOT NULL,               -- AmenitiesSelector
  images TEXT[],                          -- PhotoUploader (URLs)
  status TEXT NOT NULL,                   -- Select
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints
```typescript
// src/lib/api/room-types.ts

createRoomType(hotelId: string, data: RoomTypeData)
  POST /api/hotels/{hotelId}/room-types

updateRoomType(roomTypeId: string, data: RoomTypeData)
  PATCH /api/room-types/{roomTypeId}

deleteRoomType(roomTypeId: string)
  DELETE /api/room-types/{roomTypeId}
```

### Storage Buckets
```typescript
// Supabase Storage Structure
room-images/
  room-types/
    {hotelId}/
      {timestamp}-{random}-{filename}.jpg
      {timestamp}-{random}-{filename}.png
      ...
```

---

## Styling Architecture

### Utility-First Approach (Tailwind CSS)

**Common Patterns:**
```tsx
// Input/Textarea
className="block w-full px-4 py-3
  font-sans text-base text-[#2C2C2C]
  bg-white border rounded
  transition-all duration-150
  border-[#E8E0D5] focus:border-[#C4A484]
  focus:ring-2 focus:ring-[#C4A484]/15"

// Button (Accent)
className="bg-[#C4A484] text-white
  hover:bg-[#A67B5B] hover:-translate-y-0.5
  hover:shadow-[0_4px_12px_rgba(196,164,132,0.25)]
  transition-all duration-250"

// Label
className="block text-xs font-semibold
  tracking-[0.1em] uppercase text-[#8B8B8B] mb-2"

// Section Heading
className="text-lg
  font-['Cormorant_Garamond',Georgia,serif]
  font-medium text-[#2C2C2C]"
```

### Responsive Grid Patterns
```tsx
// Two columns on desktop, one on mobile
className="grid grid-cols-1 md:grid-cols-2 gap-4"

// Three columns for amenities
className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"

// Image gallery
className="grid grid-cols-2 sm:grid-cols-3 gap-4"
```

---

## Performance Considerations

### Image Optimization
1. Client-side resizing before upload (max 1920x1080)
2. JPEG quality set to 90%
3. WebP support for modern browsers
4. Lazy loading for image previews

### State Optimization
```typescript
// Memoized callbacks to prevent re-renders
const handleFileSelect = useCallback(async (files) => {
  // ...
}, [images, maxImages, onChange]);

// Watch specific fields instead of entire form
const amenities = watch('amenities');
const images = watch('images');
```

### Upload Optimization
```typescript
// Upload images in sequence with progress tracking
for (const file of validFiles) {
  const url = await uploadImage(file, bucket, path);
  onProgress?.(completed++, total);
}
```

---

## Accessibility Features

### ARIA Labels
```tsx
<button aria-label="Increase max adults">
  <Plus className="w-5 h-5" />
</button>
```

### Keyboard Navigation
- Tab order follows logical flow
- Enter key submits forms
- Escape key closes modals
- Arrow keys for increment/decrement (optional enhancement)

### Screen Reader Support
- Descriptive labels for all inputs
- Error announcements
- Progress updates
- Status changes

### Focus Management
```tsx
focus:outline-none
focus:border-[#C4A484]
focus:ring-2
focus:ring-[#C4A484]/15
```

---

## Error Handling Strategy

### Client-side Validation
```typescript
// Input validation
const validation = validateImage(file);
if (!validation.valid) {
  setErrors([...errors, validation.error]);
  return;
}
```

### Upload Error Handling
```typescript
try {
  await uploadMultipleImages(files, bucket, pathPrefix);
} catch (error) {
  setProgress({
    ...progress,
    uploading: false,
    errors: ['Upload failed. Please try again.']
  });
}
```

### Form Submission Error Handling
```typescript
try {
  await createRoomType(hotelId, data);
  router.push('/dashboard/room-types');
} catch (error) {
  console.error('Error saving:', error);
  alert('Failed to save. Please try again.');
  setIsLoading(false);
}
```

---

## Testing Strategy

### Unit Testing (Future)
- Test individual component rendering
- Test validation schemas
- Test utility functions (file validation, image resizing)

### Integration Testing (Future)
- Test form submission flow
- Test image upload flow
- Test multi-language input persistence

### E2E Testing (Future)
- Create room type end-to-end
- Edit existing room type
- Delete room type with confirmation
- Upload and reorder images
- Switch languages and verify persistence

---

## Extensibility

### Adding New Languages
```typescript
// In MultiLanguageInput.tsx
const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },  // Add here
  // ...
];
```

### Adding New Amenities
```typescript
// In AmenitiesSelector.tsx
const COMMON_AMENITIES = [
  // ... existing amenities
  { id: 'new_amenity', label: 'New Amenity', icon: IconComponent },
];
```

### Adding Validation Rules
```typescript
// Extend schema
const roomTypeSchema = z.object({
  // ... existing fields
  newField: z.string().min(5).max(100),
});
```

---

This architecture provides a scalable, maintainable, and production-ready foundation for managing room types in the hotel dashboard.
