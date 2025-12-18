# Supabase Query Timeout Fix

## Error Details

You're seeing error code `57014` from PostgreSQL:
```
Error: canceling statement due to statement timeout
```

This means your Supabase queries are taking too long to execute (default timeout is 8 seconds for free tier, 2 minutes for Pro).

## What I Fixed

### 1. Added Query Limits
- **CMS queries:** Limited to 500 records (you probably don't have that many anyway)
- **Front-end queries:** Limited to 100 published posts (reasonable for display)

### 2. Added Performance Timing
- Now logs how long each query takes (in milliseconds)
- Helps identify slow queries

### 3. Enhanced Error Logging
- Shows full error details (code, message, hint)
- Makes debugging easier

## Why Queries Were Timing Out

**Possible causes:**

1. **Large content field** - Even though we're not selecting it, Postgres might still scan it
2. **No indexes** - Missing indexes on `created_at` or `status` columns
3. **RLS policies** - Row Level Security policies might be doing expensive checks
4. **Many records** - Scanning thousands of rows without a limit

## Test the Fix

Refresh your CMS page and check the console. You should see:

```
🔍 Fetching CMS blog posts from database...
✅ Fetched 10 CMS blog posts from database in 342 ms
💾 Cached 10 CMS blog posts
```

**Good signs:**
- Query completes in < 1000ms (1 second)
- No timeout errors
- Shows exact timing

**Bad signs:**
- Still timing out (> 8000ms on free tier)
- Getting error code 57014
- Duration keeps increasing

## If Still Timing Out

### Quick Fix: Increase Cache TTL

In `src/utils/database.ts`, change:
```typescript
const CACHE_TTL = 30000; // 30 seconds
```

to:
```typescript
const CACHE_TTL = 300000; // 5 minutes
```

This reduces database hits but means changes take longer to appear.

### Proper Fix: Add Database Indexes

Run these SQL commands in Supabase SQL Editor:

```sql
-- Add index on blog_posts.created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at 
ON blog_posts(created_at DESC);

-- Add index on blog_posts.status for faster filtering
CREATE INDEX IF NOT EXISTS idx_blog_posts_status 
ON blog_posts(status);

-- Add composite index for published posts query
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_published_at 
ON blog_posts(status, published_at DESC) 
WHERE status = 'published';

-- Add index on properties.created_at
CREATE INDEX IF NOT EXISTS idx_properties_created_at 
ON properties(created_at DESC);

-- Add index on properties.status
CREATE INDEX IF NOT EXISTS idx_properties_status 
ON properties(status);
```

**Impact:** Queries should go from 8+ seconds to < 500ms.

### Check RLS Policies

In Supabase Dashboard → Authentication → Policies:

1. Check if you have complex policies on `blog_posts` table
2. Policies with JOINs or subqueries can be very slow
3. For read operations, consider simpler policies

**Example of SLOW policy:**
```sql
-- ❌ SLOW - Does a lookup for every row
CREATE POLICY "Anyone can read published posts"
ON blog_posts FOR SELECT
USING (
  status = 'published' 
  AND (SELECT some_value FROM other_table WHERE id = blog_posts.user_id)
);
```

**Example of FAST policy:**
```sql
-- ✅ FAST - Simple column check
CREATE POLICY "Anyone can read published posts"
ON blog_posts FOR SELECT
USING (status = 'published');
```

## Verify Supabase Plan Limits

Free tier limits:
- **Query timeout:** 8 seconds
- **Database size:** 500 MB
- **Bandwidth:** 5 GB/month

Pro tier limits:
- **Query timeout:** 2 minutes
- **Database size:** 8 GB
- **Bandwidth:** 250 GB/month

If you're on free tier and hitting limits regularly, you might need to upgrade.

## Monitor Performance

After the fix, check console logs:

| Query Type | Expected Time | Action if Slower |
|------------|---------------|------------------|
| Cached queries | < 100ms | Check cache logic |
| Fresh queries (with indexes) | < 500ms | Check indexes exist |
| Fresh queries (no indexes) | 1-3 seconds | Add indexes |
| Timing out | > 8 seconds | Check RLS policies |

## Next Steps

1. **Test the current fix** - Queries now have limits
2. **Add indexes** - Run the SQL commands above
3. **Check RLS policies** - Simplify if complex
4. **Monitor timing** - Watch console logs for slow queries

The timeout should be resolved now with the query limits!

