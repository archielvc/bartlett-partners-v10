# Enquiry Examples Guide

## Overview
This guide explains how to populate and test the enquiry system with realistic example data across all contact points on the Bartlett & Partners website.

## What Was Implemented

### 1. Updated Type Definitions
- Added `inquiry_type` field to `ContactSubmission` interface in `/types/database.ts`
- Supports four types: `'general' | 'property' | 'valuation' | 'newsletter'`

### 2. Updated Database Utilities
- Modified `/utils/database.ts` to handle `inquiry_type` field
- Updated `createContactSubmission()` to store enquiry type
- Updated `submitContactForm()` to accept and pass through enquiry type

### 3. Created Seed Data Utility
- New file: `/utils/seedEnquiries.ts`
- Contains 15 realistic example enquiries across all types:
  - **3 Newsletter Sign-ups** - Simple subscription requests
  - **3 Valuation Requests** - Detailed property valuation enquiries from sellers
  - **4 Property Enquiries** - Viewing requests for specific properties
  - **5 General Enquiries** - Various contact form submissions

### 4. Added Developer Tools to CMS
- Updated `/components/cms/views/CMSDashboard.tsx`
- Added "Developer Tools" section with two buttons:
  - **Seed Example Enquiries** - Populates localStorage with example data
  - **Clear All Enquiries** - Removes all enquiries from localStorage

## Example Enquiries Breakdown

### Newsletter Sign-ups (3 examples)
- **Sarah Thompson** - New subscription (2 hours ago)
- **James Mitchell** - Closed subscription (1 day ago)
- **Emma Richardson** - Closed subscription (3 days ago)

### Valuation Requests (3 examples)
- **David Anderson** - 4-bed Victorian in Twickenham (New, 5 hours ago)
- **Catherine Williams** - 3-bed townhouse in Richmond (In Progress, 2 days ago)
- **Robert Foster** - 5-bed detached in Kew (Closed, 7 days ago)

### Property Enquiries (4 examples)
- **Sophie Bennett** - Viewing request for "The Riverside Residence" (New, 3 hours ago)
- **Michael Chen** - Viewing request for "Victorian Elegance" (In Progress, 1 day ago)
- **Olivia Harper** - Interest in "Modern Townhouse" (Replied, 4 days ago)
- **Thomas Wright** - Follow-up viewing for "The Riverside Residence" (Closed, 10 days ago)

### General Enquiries (5 examples)
- **Jennifer Martinez** - Market consultation request (New, 1 hour ago)
- **Alexander Hughes** - Property management services enquiry (In Progress, 2 days ago)
- **Hannah Davies** - Off-market opportunities request (Closed, 8 days ago)
- **Christopher Bell** - Downsizing enquiry (New, 8 hours ago)
- **Victoria James** - Preliminary area consultation (In Progress, 3 days ago)

## How to Use

### Step 1: Access the CMS
1. Navigate to `/cms` in your browser
2. Log in with admin credentials
3. Go to the Dashboard

### Step 2: Seed Example Enquiries
1. Scroll down to the "Developer Tools" section
2. Click "Seed Example Enquiries" button
3. A success toast will appear
4. The "New Enquiries" stat will update to show 15 enquiries

### Step 3: View Enquiries
1. Click "Enquiries" in the CMS navigation
2. You'll see all 15 example enquiries
3. Use the filter buttons to view by status:
   - **All** - Shows all 15 enquiries
   - **New** - Shows 5 new enquiries
   - **In Progress** - Shows 4 in-progress enquiries
   - **Closed** - Shows 6 closed enquiries

### Step 4: Test Enquiry Features
- Click status buttons to change enquiry status
- View detailed information including:
  - Contact details (name, email, phone)
  - Enquiry type badge
  - Status badge
  - Timestamp
  - Full message content
  - Associated property (for property enquiries)

### Step 5: Clear Data (Optional)
1. Return to Dashboard
2. Click "Clear All Enquiries" button
3. Confirm you want to remove all test data

## Enquiry Types Display

### In the CMS Enquiries View
Each enquiry displays a colored badge indicating its type:
- **Newsletter** - Not shown as separate badge (part of general system)
- **Valuation Request** - Green badge with FileText icon
- **Property Inquiry** - Purple badge with Home icon
- **General Inquiry** - Grey badge with Mail icon

### Status Indicators
Enquiries can have three statuses:
- **New** - Blue badge, gold left border (requires attention)
- **In Progress** - Yellow badge (being handled)
- **Closed** - Grey badge (resolved)

## Contact Points on Website

The example data represents enquiries from these website locations:

1. **Newsletter Forms**
   - Footer newsletter subscription
   - Insights page newsletter section
   - Properties page newsletter section

2. **Valuation Requests**
   - Contact page with "Sell" reason selected
   - Book Evaluation dialog

3. **Property Enquiries**
   - Property detail page "Enquire" button
   - Property inquiry dialog with viewing request

4. **General Contact Forms**
   - Main contact page
   - General enquiries with various reasons (Buy, Other, etc.)

## Realistic Details

All example enquiries include:
- Realistic UK names
- Example email addresses
- UK mobile phone numbers (07xxx format)
- Detailed, contextual messages
- Appropriate dates and preferences
- Location-specific references (Richmond, Twickenham, Kew, Teddington, Ham)
- Mention of Darren Bartlett and company features (2% + VAT fees, director-led service)

## Technical Notes

### Data Storage
- All enquiries stored in localStorage key: `bartlett_inquiries`
- Data persists until manually cleared
- Can be seeded multiple times (will replace existing data)

### Integration
- Fully integrated with existing CMS enquiries system
- Compatible with status management
- Works with enquiry filtering and display

### Future Supabase Migration
- All fields align with database schema
- Ready for seamless Supabase integration
- No code changes needed when migrating to backend storage

## Console Output

When seeding, the console displays:
```
✅ Successfully seeded 15 example enquiries
Breakdown:
  - Newsletter sign-ups: 3
  - Valuation requests: 3
  - Property enquiries: 4
  - General enquiries: 5
```

When clearing:
```
✅ Successfully cleared all enquiries
```

## Tips for Testing

1. **Test Filtering**: Use status filters to see how enquiries group by status
2. **Test Status Changes**: Click status buttons to move enquiries through workflow
3. **Test Display**: Check how different enquiry types display with their badges
4. **Test Sorting**: Enquiries display newest first by default
5. **Test Search**: Use browser search (Ctrl/Cmd + F) to find specific enquiries
6. **Mobile Testing**: View enquiries panel on mobile to test responsive design

## Maintenance

To modify example enquiries:
1. Edit `/utils/seedEnquiries.ts`
2. Modify the `generateExampleEnquiries()` function
3. Add/remove/edit enquiry objects as needed
4. Re-seed by clicking button in CMS Dashboard

## Support

If you need to add more example types or modify existing data, all enquiry generation logic is in `/utils/seedEnquiries.ts`. The file is well-commented and easy to extend.