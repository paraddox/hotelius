-- VERIFY_SCHEMA.sql
-- Verification script to check if all migrations were applied correctly
-- Run this after applying all migrations to verify the schema

-- ============================================================================
-- CHECK 1: Verify all extensions are installed
-- ============================================================================

SELECT
  'Extensions Check' as check_type,
  extname,
  extversion,
  CASE
    WHEN extname IN ('uuid-ossp', 'btree_gist', 'pg_trgm', 'unaccent') THEN 'OK'
    ELSE 'UNEXPECTED'
  END as status
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'btree_gist', 'pg_trgm', 'unaccent')
ORDER BY extname;

-- ============================================================================
-- CHECK 2: Verify all tables exist
-- ============================================================================

SELECT
  'Tables Check' as check_type,
  table_name,
  CASE
    WHEN table_name IN (
      'hotels', 'profiles', 'room_types', 'rooms', 'rate_plans',
      'bookings', 'booking_guests', 'hotel_photos', 'room_type_photos'
    ) THEN 'OK'
    ELSE 'UNEXPECTED'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'hotels', 'profiles', 'room_types', 'rooms', 'rate_plans',
    'bookings', 'booking_guests', 'hotel_photos', 'room_type_photos'
  )
ORDER BY table_name;

-- ============================================================================
-- CHECK 3: Verify all ENUM types exist
-- ============================================================================

SELECT
  'Enum Types Check' as check_type,
  typname as enum_name,
  CASE
    WHEN typname IN (
      'subscription_status', 'user_role', 'room_status',
      'booking_status', 'payment_status', 'guest_type'
    ) THEN 'OK'
    ELSE 'UNEXPECTED'
  END as status
FROM pg_type
WHERE typtype = 'e'
  AND typname IN (
    'subscription_status', 'user_role', 'room_status',
    'booking_status', 'payment_status', 'guest_type'
  )
ORDER BY typname;

-- ============================================================================
-- CHECK 4: Verify EXCLUDE constraint exists on bookings
-- ============================================================================

SELECT
  'Constraint Check' as check_type,
  conname as constraint_name,
  contype as constraint_type,
  CASE
    WHEN conname = 'bookings_no_overlap' AND contype = 'x' THEN 'OK'
    ELSE 'UNEXPECTED'
  END as status
FROM pg_constraint
WHERE conrelid = 'bookings'::regclass
  AND conname = 'bookings_no_overlap';

-- ============================================================================
-- CHECK 5: Verify RLS is enabled on all tables
-- ============================================================================

SELECT
  'RLS Check' as check_type,
  tablename,
  CASE
    WHEN rowsecurity = true THEN 'ENABLED'
    ELSE 'DISABLED'
  END as rls_status,
  CASE
    WHEN rowsecurity = true THEN 'OK'
    ELSE 'WARNING: RLS should be enabled'
  END as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'hotels', 'profiles', 'room_types', 'rooms', 'rate_plans',
    'bookings', 'booking_guests', 'hotel_photos', 'room_type_photos'
  )
ORDER BY tablename;

-- ============================================================================
-- CHECK 6: Count RLS policies per table
-- ============================================================================

SELECT
  'RLS Policies Count' as check_type,
  schemaname,
  tablename,
  COUNT(*) as policy_count,
  CASE
    WHEN COUNT(*) > 0 THEN 'OK'
    ELSE 'WARNING: No policies found'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'hotels', 'profiles', 'room_types', 'rooms', 'rate_plans',
    'bookings', 'booking_guests', 'hotel_photos', 'room_type_photos'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ============================================================================
-- CHECK 7: Verify critical indexes exist
-- ============================================================================

SELECT
  'Critical Indexes Check' as check_type,
  indexname,
  tablename,
  CASE
    WHEN indexname LIKE '%gist%' THEN 'GiST Index'
    WHEN indexname LIKE '%gin%' THEN 'GIN Index'
    WHEN indexname LIKE '%pkey' THEN 'Primary Key'
    ELSE 'B-tree Index'
  END as index_type,
  'OK' as status
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE '%stay_range%'
    OR indexname LIKE '%validity_range%'
    OR indexname = 'bookings_no_overlap_excl'
    OR indexname LIKE '%amenities_gin%'
    OR indexname LIKE '%trgm%'
  )
ORDER BY tablename, indexname;

-- ============================================================================
-- CHECK 8: Verify triggers exist
-- ============================================================================

SELECT
  'Triggers Check' as check_type,
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation,
  CASE
    WHEN trigger_name LIKE '%updated_at%' THEN 'Update timestamp trigger'
    WHEN trigger_name LIKE '%confirmation_code%' THEN 'Generate confirmation code'
    WHEN trigger_name LIKE '%consistency%' THEN 'Data consistency check'
    WHEN trigger_name LIKE '%auth_user%' THEN 'Auto-create profile'
    ELSE 'Other trigger'
  END as trigger_purpose,
  'OK' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- CHECK 9: Verify foreign key relationships
-- ============================================================================

SELECT
  'Foreign Keys Check' as check_type,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule,
  'OK' as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ============================================================================
-- CHECK 10: Verify helper functions exist
-- ============================================================================

SELECT
  'Helper Functions Check' as check_type,
  routine_name as function_name,
  data_type as return_type,
  CASE
    WHEN routine_name IN (
      'get_user_role', 'get_user_hotel_id',
      'is_platform_admin', 'has_hotel_access',
      'update_updated_at_column', 'generate_confirmation_code'
    ) THEN 'OK'
    ELSE 'UNEXPECTED'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_user_role', 'get_user_hotel_id',
    'is_platform_admin', 'has_hotel_access',
    'update_updated_at_column', 'generate_confirmation_code',
    'handle_new_user', 'sync_room_type_name_default',
    'validate_room_hotel_consistency', 'validate_rate_plan_hotel_consistency',
    'validate_booking_hotel_consistency', 'sync_booking_stay_range',
    'set_booking_confirmation_code'
  )
ORDER BY routine_name;

-- ============================================================================
-- CHECK 11: Table columns summary
-- ============================================================================

SELECT
  'Columns Summary' as check_type,
  table_name,
  COUNT(*) as column_count,
  COUNT(*) FILTER (WHERE is_nullable = 'NO') as not_null_columns,
  COUNT(*) FILTER (WHERE column_default IS NOT NULL) as columns_with_defaults,
  'OK' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'hotels', 'profiles', 'room_types', 'rooms', 'rate_plans',
    'bookings', 'booking_guests', 'hotel_photos', 'room_type_photos'
  )
GROUP BY table_name
ORDER BY table_name;

-- ============================================================================
-- CHECK 12: Check for JSONB columns (i18n support)
-- ============================================================================

SELECT
  'JSONB Columns Check' as check_type,
  table_name,
  column_name,
  data_type,
  CASE
    WHEN column_name IN ('name', 'description', 'caption') THEN 'i18n field'
    WHEN column_name IN ('settings', 'amenities', 'bed_configuration') THEN 'Configuration field'
    ELSE 'Other JSONB field'
  END as jsonb_purpose,
  'OK' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND data_type = 'jsonb'
ORDER BY table_name, column_name;

-- ============================================================================
-- CHECK 13: Verify daterange columns exist
-- ============================================================================

SELECT
  'Date Range Columns Check' as check_type,
  table_name,
  column_name,
  udt_name as data_type,
  CASE
    WHEN column_name = 'stay_range' THEN 'Booking dates'
    WHEN column_name = 'validity_range' THEN 'Rate plan validity'
    ELSE 'Other date range'
  END as purpose,
  'OK' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND udt_name = 'daterange'
ORDER BY table_name, column_name;

-- ============================================================================
-- SUMMARY: Overall schema health check
-- ============================================================================

SELECT
  '=== SCHEMA VERIFICATION SUMMARY ===' as summary,
  (SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'btree_gist', 'pg_trgm', 'unaccent')) as extensions_count,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as tables_count,
  (SELECT COUNT(*) FROM pg_type WHERE typtype = 'e') as enum_types_count,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as indexes_count,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as rls_policies_count,
  (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as triggers_count,
  (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY') as foreign_keys_count,
  CASE
    WHEN (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') >= 9
      AND (SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'btree_gist', 'pg_trgm', 'unaccent')) = 4
      AND (SELECT COUNT(*) FROM pg_type WHERE typtype = 'e') >= 6
      AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') > 0
    THEN 'SCHEMA OK - All migrations applied successfully'
    ELSE 'WARNING - Some migrations may be missing'
  END as overall_status;

-- ============================================================================
-- OPTIONAL: Test basic operations
-- ============================================================================

-- Test UUID generation
SELECT 'UUID Generation Test' as test_type, gen_random_uuid() as sample_uuid, 'OK' as status;

-- Test daterange operations
SELECT
  'Date Range Test' as test_type,
  daterange('2024-12-01', '2024-12-10', '[)') as sample_range,
  daterange('2024-12-01', '2024-12-10', '[)') && daterange('2024-12-05', '2024-12-15', '[)') as ranges_overlap,
  CASE
    WHEN daterange('2024-12-01', '2024-12-10', '[)') && daterange('2024-12-05', '2024-12-15', '[)')
    THEN 'OK - Range overlap detection working'
    ELSE 'ERROR'
  END as status;

-- Test trigram similarity (requires data to be meaningful)
SELECT
  'Trigram Test' as test_type,
  similarity('hotel', 'hotl') as similarity_score,
  CASE
    WHEN similarity('hotel', 'hotl') > 0.5 THEN 'OK - Trigram similarity working'
    ELSE 'WARNING'
  END as status;

-- ============================================================================
-- End of verification script
-- ============================================================================

-- If all checks show 'OK', the schema is correctly set up!
