# 🚀 Bartlett & Partners - Database Migration Guide

## ✅ Step-by-Step Setup Instructions

### **Step 1: Run the SQL Schema in Supabase**

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to SQL Editor** (in the left sidebar)
3. **Click "New Query"**
4. **Copy the entire contents** of `/database/schema.sql` from this project
5. **Paste it into the SQL Editor**
6. **Click "Run"** (or press Cmd/Ctrl + Enter)
7. **Verify Success**: You should see a message saying "Success. No rows returned"

### **Step 2: Verify Tables Were Created**

1. **Go to Table Editor** (in the left sidebar)
2. **You should see these new tables:**
   - ✅ `properties`
   - ✅ `insights`
   - ✅ `testimonials`
   - ✅ `inquiries`
   - ✅ `team_members`
   - ✅ `seo_settings`
   - ✅ `global_settings`

3. **Click on `global_settings`** - you should see 3 rows with default settings already inserted:
   - `notifications`
   - `analytics`
   - `structured_data`

### **Step 3: Create Storage Bucket (Optional - Will Auto-Create)**

The storage bucket `bartlett-images` will be created automatically when you upload your first image.

**OR** you can create it manually:
1. Go to **Storage** (in the left sidebar)
2. Click **"New Bucket"**
3. Name: `bartlett-images`
4. **Public bucket**: ✅ Yes (checked)
5. Click **"Create bucket"**

### **Step 4: Test in Figma Make**

Your CMS will now automatically use the new database structure. Test by:

1. **Create a Property**: Go to CMS → Properties → Create Property
2. **Upload an Image**: Use the image upload (it will go to Supabase Storage)
3. **Save**: Click "Save Property"
4. **Verify in Supabase**: 
   - Go to Table Editor → `properties` → You should see your new property!
   - Go to Storage → `bartlett-images` → You should see uploaded images!

### **Step 5: Verify Everything Works**

✅ Create a property - check `properties` table  
✅ Create a blog post - check `insights` table  
✅ Submit a contact inquiry - check `inquiries` table  
✅ Update SEO settings - check `seo_settings` table  
✅ Upload an image - check Storage → `bartlett-images`  

---

## 🔄 What Changed?

### **OLD Structure (KV Store):**
```
kv_store_e2fc9a7e
├── key: "property_1"
└── value: { entire JSON object }
```

### **NEW Structure (Proper Tables):**
```
properties table
├── id, title, slug, price, status, beds, baths...
insights table
├── id, title, slug, content, author...
inquiries table
├── id, name, email, message, status...
```

---

## 🗑️ What About the Old Data?

### **Option A: Leave It (Recommended)**
- The old `kv_store_e2fc9a7e` table will just sit there unused
- No harm in keeping it
- Acts as a backup of your test data

### **Option B: Delete It Later**
Once everything is working perfectly:
1. Go to Table Editor
2. Click on `kv_store_e2fc9a7e`
3. Click the "..." menu → "Delete table"

**DON'T delete it now** - wait until you're confident everything works!

---

## 📦 Deploying to Production (Vercel)

### **Important: Your Database Stays the Same!**

When you deploy to Vercel:
1. ✅ Your code goes to GitHub → Vercel
2. ✅ Your **database stays in Supabase** (doesn't move)
3. ✅ Your **images stay in Supabase Storage** (doesn't move)
4. ✅ All your properties, blogs, inquiries persist

### **Environment Variables in Vercel:**

In your Vercel project settings, add these environment variables:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Get these values from:**
Supabase Dashboard → Project Settings → API

---

## 🛠️ Code Changes Made

### **Files Updated:**
1. ✅ `/database/schema.sql` - NEW: Database schema
2. ✅ `/utils/supabase/client.ts` - Updated: Supabase client
3. ✅ `/supabase/functions/server/index.tsx` - Updated: Removed KV routes, updated bucket name
4. ✅ All CMS components will be updated to use new tables (coming next)

### **Files Deprecated (No Longer Used):**
- ❌ `/utils/supabase/kv_store.tsx` - OLD: Will be removed
- ❌ KV store functions (`get`, `set`, `del`) - No longer needed

---

## 🎯 Next Steps

After running the SQL schema:
1. ✅ I'll update all CMS components to use the new database tables
2. ✅ I'll add proper image upload functionality with Supabase Storage
3. ✅ I'll remove all old KV store references
4. ✅ Everything will work exactly the same in the UI - just better underneath!

---

## ❓ FAQ

**Q: Will I lose my test data?**  
A: Any data in the old KV store will stay there, but won't be used. The new tables start fresh.

**Q: Do I need to delete the old table?**  
A: No, you can leave it there. It won't interfere.

**Q: What if something breaks?**  
A: The old `kv_store_e2fc9a7e` table is still there as a backup. We can revert if needed.

**Q: Will this work on Vercel?**  
A: Yes! Your Vercel deployment will connect to the same Supabase database.

**Q: Can I add more properties/blogs later?**  
A: Yes! Your data persists in Supabase forever, regardless of code changes.

---

## 🎉 You're Ready!

Once you've run the SQL schema, let me know and I'll proceed with updating all the CMS components!
