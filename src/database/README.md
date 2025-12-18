# Bartlett & Partners - Production Database Setup

## 📋 Quick Start

### **What You Need to Do RIGHT NOW:**

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy/Paste** the contents of `/database/schema.sql`
3. **Run it** (click "Run" button)
4. **Done!** ✅ Your database is ready

---

## 📊 Database Structure

### **Tables Created:**

| Table Name | Purpose | Key Fields |
|-----------|---------|-----------|
| **properties** | All property listings | title, price, beds, baths, images, status |
| **insights** | Blog posts/articles | title, content, author, category |
| **testimonials** | Client reviews | client_name, rating, testimonial |
| **inquiries** | Contact form submissions | name, email, message, status |
| **team_members** | CMS user access | name, email, role (admin/agent) |
| **seo_settings** | Page-specific SEO | page_path, meta_title, meta_description |
| **global_settings** | Site-wide config | notifications, analytics, structured_data |

### **Storage:**
- **Bucket Name:** `bartlett-images`
- **Type:** Public bucket (auto-created on first upload)
- **Stores:** Property images, blog featured images, floor plans, etc.

---

## 🔄 How It Works

### **Before (KV Store):**
```
Everything in one table with key-value pairs
❌ Inefficient
❌ Hard to query
❌ Not production-ready
```

### **After (Proper Tables):**
```
Each entity in its own table
✅ Fast queries
✅ Proper relationships
✅ Production-ready
✅ Industry standard
```

---

## 🚀 Production Deployment

Your data flow:
```
┌─────────────────┐
│  Figma Make     │  ← Develop here
└────────┬────────┘
         │ git push
         ▼
┌─────────────────┐
│   GitHub        │  ← Code repository
└────────┬────────┘
         │ auto deploy
         ▼
┌─────────────────┐
│   Vercel        │  ← Production site
└────────┬────────┘
         │
         │ Both connect to same database ↓
         │
┌─────────────────────────────────┐
│      Supabase Database          │
│  ┌───────────────────────────┐  │
│  │ Tables (Postgres)         │  │
│  │ - properties              │  │
│  │ - insights                │  │
│  │ - inquiries               │  │
│  │ - etc...                  │  │
│  └───────────────────────────┘  │
│                                  │
│  ┌───────────────────────────┐  │
│  │ Storage                   │  │
│  │ - bartlett-images/        │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Key Point:** Your data persists in Supabase. When you push code changes to Vercel, the data doesn't move or change!

---

## ✅ Checklist

- [ ] Run `/database/schema.sql` in Supabase SQL Editor
- [ ] Verify tables created (check Table Editor)
- [ ] Test creating a property in CMS
- [ ] Test uploading an image
- [ ] Verify data appears in Supabase tables
- [ ] Ready for production deployment! 🎉

---

## 📁 Files in This Directory

- **`schema.sql`** - Complete database schema (run this in Supabase)
- **`MIGRATION_GUIDE.md`** - Detailed step-by-step instructions
- **`README.md`** - This file (overview)

---

## 🆘 Need Help?

If something goes wrong:
1. Check the Supabase SQL Editor for error messages
2. Verify your Supabase project is active
3. The old `kv_store_e2fc9a7e` table is still there as backup
4. Contact support if needed

---

**Ready?** Go run that SQL schema now! 🚀
