**Prompt:**

আমার website/backend-এ একটি অত্যন্ত গুরুত্বপূর্ণ সমস্যা fix করতে হবে।

আমি backend/admin panel থেকে কোনো content, image, settings বা অন্য কোনো data change/save করার পরে website-এর code বা অন্য কোনো অংশ update করলে **আগের saved data হারিয়ে যাচ্ছে এবং system আবার আগের/default অবস্থায় ফিরে যাচ্ছে।**

এটি আর কখনো হওয়া যাবে না।

আমার requirement হলো:

> **Backend/CMS-এ একবার কোনো data successfully save হলে পরবর্তীতে frontend update, backend code update, নতুন feature add, bug fix, rebuild, restart, redeploy বা deployment-এর কারণে সেই data হারানো যাবে না।**

---

# PRIMARY RULE

সবচেয়ে গুরুত্বপূর্ণ architecture rule:

### CODE এবং USER/CMS DATA আলাদা রাখতে হবে।

অর্থাৎ:

**Code Update**
→ নতুন functionality/change

কিন্তু:

**Database/CMS Content**
→ আগের মতোই থাকবে।

কোনো code deployment-এর কারণে:

- Content reset
- Image reset
- Settings reset
- Portfolio reset
- Service reset
- Pricing reset
- Testimonials reset
- FAQ reset
- Client data reset

হওয়া যাবে না।

---

# 1. FULL ROOT-CAUSE AUDIT

প্রথমে পুরো project audit করো এবং খুঁজে বের করো কেন saved changes বারবার হারিয়ে যাচ্ছে।

বিশেষভাবে investigate করবে:

- Database
- Database connection
- CMS
- API
- Seed data
- Default data
- Migration
- Deployment
- Build process
- Static JSON/data files
- localStorage
- State management
- Environment variables
- File storage
- Image storage
- Upload directory
- Hosting configuration

---

# 2. FIND EVERY RESET / OVERWRITE MECHANISM

পুরো codebase search করবে এবং identify করবে:

- seed scripts
- initialization scripts
- reset scripts
- demo/sample data loaders
- database recreation
- database drop
- database truncate
- default data insertion
- startup overwrite
- static data replacement
- deployment overwrite
- build-time data generation
- post-deployment reset

যে code-এর কারণে existing data overwritten/reset হতে পারে সেটি fix করবে।

---

# 3. DATABASE MUST BE THE SOURCE OF TRUTH

যেসব data admin/backend থেকে update করা হয়:

- Website content
- Text
- Images
- Services
- Pricing
- Portfolio
- Testimonials
- FAQ
- Client brands
- Settings
- Contact information
- SEO settings
- Other CMS data

এসব ideally persistent database/storage-এ থাকবে।

Frontend-এর hardcoded/default data দিয়ে database-এর data overwrite করা যাবে না।

---

# 4. DEFAULT DATA MUST NOT OVERWRITE REAL DATA

যদি default/demo data প্রয়োজন হয়, সেটা শুধু initial setup-এর জন্য ব্যবহার করবে।

Rule:

```text id="jv0jz5"
If database is empty
        ↓
Create initial/default data

If database already has data
        ↓
DO NOT overwrite existing data
```

অর্থাৎ:

**Existing data থাকলে default data আবার insert/update করা যাবে না।**

---

# 5. SAFE DATABASE INITIALIZATION

Application startup বা deployment-এর সময় database initialization থাকলে safe করো।

Startup-এর সময়:

❌ Existing records overwrite করবে না।

❌ Existing content reset করবে না।

❌ Existing images replace করবে না।

❌ Existing settings reset করবে না।

বরং:

✅ শুধু missing required records থাকলে create করবে।

---

# 6. CMS DATA PERSISTENCE

Admin panel থেকে:

### Text Change

Save করলে permanently persist করবে।

### Image Change

Save করলে permanently persist করবে।

### Service Change

Save করলে persist করবে।

### Pricing Change

Save করলে persist করবে।

### Portfolio Change

Save করলে persist করবে।

### Testimonial Change

Save করলে persist করবে।

### FAQ Change

Save করলে persist করবে।

### Site Setting Change

Save করলে persist করবে।

কোনো পরবর্তী code update-এর কারণে এগুলো ফিরে যাবে না।

---

# 7. IMAGE PERSISTENCE

Image system-এর জন্য বিশেষভাবে:

**Upload → Media Library → Database → Storage → Frontend**

এই complete persistence নিশ্চিত করতে হবে।

যদি backend থেকে image upload করা হয়:

- Image storage-এ থাকবে
- Database reference থাকবে
- Frontend-এ থাকবে
- Refresh-এর পর থাকবে
- Logout/Login-এর পর থাকবে
- Backend restart-এর পর থাকবে
- New deployment-এর পর থাকবে
- Code update-এর পর থাকবে

---

# 8. IMAGE STORAGE MUST BE PERSISTENT

যদি current hosting/deployment system-এর কারণে uploaded images temporary directory-তে থাকে, সেটা identify করবে।

Temporary build directory বা ephemeral storage ব্যবহার করলে production-এর জন্য persistent storage strategy implement করবে।

বিশেষ করে Hostinger environment-এর সঙ্গে compatible solution ব্যবহার করবে।

---

# 9. MEDIA LIBRARY PERSISTENCE

Media Library-এর existing architecture-এর সঙ্গে integrate করবে।

Rule:

> **একবার Media Library-তে image upload হলে code update বা deployment-এর কারণে image হারানো যাবে না।**

এবং:

> **Media Library image reference database-এ persist করতে হবে।**

---

# 10. CENTRALIZED IMAGE SYSTEM

Website-এর image system যেন centralized থাকে:

```text id="ey7pkw"
MEDIA LIBRARY
      ↓
Media Asset ID
      ↓
Database Reference
      ↓
Homepage
Services
Portfolio
Testimonials
Clients
SEO
etc.
```

কোনো module নিজের আলাদা temporary image system ব্যবহার করবে না।

---

# 11. FRONTEND MUST NOT RESET CMS DATA

Frontend rebuild/render-এর সময়:

❌ Hardcoded content দিয়ে backend content overwrite করা যাবে না।

❌ Default images দিয়ে database images replace করা যাবে না।

❌ Demo content automatically inject করা যাবে না।

Frontend শুধু backend/database থেকে current data read করবে।

---

# 12. BACKEND UPDATE SAFETY

Backend code update করার সময়:

**Existing Database**

↓

**Must Remain Intact**

একটি নতুন feature add করার জন্য database recreate/reset করা যাবে না।

---

# 13. API UPDATE SAFETY

API update করার সময় ensure করবে:

- Existing records remain
- Existing IDs remain
- Existing relationships remain
- Existing images remain
- Existing content remains

নতুন API logic যেন existing data silently overwrite না করে।

---

# 14. MIGRATIONS

Database schema change দরকার হলে:

**Migration-based approach** ব্যবহার করবে।

কখনো development-এর convenience-এর জন্য production data destroy করবে না।

বিশেষভাবে check করবে:

- destructive migration
- drop table
- truncate
- recreate table
- reset database

যদি existing data risk থাকে, আগে safe migration strategy তৈরি করবে।

---

# 15. DEPLOYMENT SAFETY

Hostinger-এ deploy করার সময়:

### MUST NOT DELETE

- Database data
- Uploaded images
- Media Library
- CMS content
- Settings
- Portfolio
- Testimonials
- Services
- Pricing

Deployment শুধু application code update করবে।

---

# 16. CODE / DATA SEPARATION

Project structure এমনভাবে manage করবে যেন:

```text
APPLICATION CODE
≠
CMS DATA
≠
USER UPLOADS
```

অর্থাৎ code deployment-এর lifecycle এবং content/data lifecycle আলাদা হবে।

---

# 17. ENVIRONMENT CHECK

Local এবং production environment-এর database আলাদা হতে পারে।

Verify করবে:

**Production backend → Production database**

এবং:

**Local development → Local database**

ভুল করে production deployment-এর সময় empty/default/local database connect হচ্ছে কি না check করবে।

---

# 18. ENVIRONMENT VARIABLES

Check করবে:

- DATABASE_URL
- API URL
- storage path
- upload path
- environment name
- production credentials
- media storage configuration

কোনো deployment-এর সময় ভুল environment variable-এর কারণে empty database connect হলে সেটা prevent করবে।

---

# 19. DATA BACKUP

Production data-এর জন্য safe backup strategy recommend/implement করবে যেখানে appropriate।

Goal:

**Accidental deployment/data overwrite → recoverable**

---

# 20. SAFE UPDATE MODEL

আমি যখন বলব:

> “Website-এর homepage design update করো।”

তখন expected behaviour:

**Homepage code/design update**

কিন্তু:

**Homepage CMS content remains unchanged**

যদি explicitly content change করতে না বলি।

একইভাবে:

> “Backend-এর নতুন feature add করো।”

এর মানে কখনোই existing CMS data reset করা নয়।

---

# 21. EXPLICIT DATA CHANGE ONLY

CMS data পরিবর্তন হবে শুধু যখন:

**Admin/User explicitly edits and saves it**

অন্য কোনো কারণে নয়।

অর্থাৎ:

**Code Change ≠ Data Change**

**Design Change ≠ Data Change**

**Deployment ≠ Data Change**

**Bug Fix ≠ Data Change**

---

# 22. DATA PERSISTENCE TEST

একটি controlled test তৈরি করো।

### Step 1

Backend থেকে:

**Change A**

Save.

### Step 2

Refresh.

Verify A.

### Step 3

Frontend code update.

Verify A.

### Step 4

Backend code update.

Verify A.

### Step 5

Build.

Verify A.

### Step 6

Deploy.

Verify A.

### Step 7

Restart/reload.

Verify A.

Expected:

**A remains everywhere.**

---

# 23. MULTIPLE DATA TEST

Test:

```text id="hwzq2e"
Change A → Save
Change B → Save
Change C → Save
```

তারপর:

- Refresh
- Logout/Login
- Backend restart
- Build
- Deploy

Verify:

```text
A + B + C
```

সব remain করছে কি না।

---

# 24. IMAGE TEST

Test:

```text id="x08q9h"
Upload Image A
↓
Use on Homepage
↓
Use on Portfolio
↓
Deploy new code
↓
Refresh
```

Expected:

**Image A still exists everywhere.**

---

# 25. MEDIA LIBRARY TEST

Test:

**Upload A → Media Library**

↓

Use A in:

- Homepage
- Services
- Portfolio

↓

Deploy code update

↓

Verify:

**A still exists + all references remain.**

---

# 26. DELETE BEHAVIOUR

Media Library থেকে intentionally delete করলে:

**Only then**

image remove/unlink হবে।

কোনো:

- build
- deployment
- restart
- code update

image delete করতে পারবে না।

---

# 27. FRONTEND/BACKEND REGRESSION

Code update-এর পরে verify করবে:

- Existing content
- Existing images
- Existing settings
- Existing CMS records
- Existing portfolio
- Existing services

সব আগের মতো আছে।

---

# 28. LIVE BROWSER TESTING

সব functionality live browser-এ test করবে।

আমি চাই না শুধু code দেখে বলো:

> “Database persistence ঠিক আছে।”

Browser-এ actual flow test করবে:

**Admin Login → Edit → Save → Refresh → Website → Verify**

তারপর code/deployment update simulation/actual deployment-এর পরে আবার verify করবে।

---

# 29. HOSTINGER TESTING

Hostinger production environment-এ verify করবে:

- Database persistence
- Upload persistence
- Media Library persistence
- CMS persistence
- Environment variables
- Deployment behaviour
- File storage

যেখানে actual production test সম্ভব, সেখানে actual test করবে।

যেখানে সম্ভব নয়:

**Not Verified**

বলবে।

---

# 30. DO NOT HIDE THE PROBLEM

Temporary workaround ব্যবহার করে data persistence problem hide করবে না।

যেমন:

❌ Hardcoded frontend content

❌ localStorage as fake database

❌ Static JSON replacing database

❌ Fake save success

❌ Reset prevention শুধু frontend-এ

Root cause properly fix করবে।

---

# 31. FINAL AUTOMATED SAFETY CHECK

সম্ভব হলে project-এ এমন safeguards তৈরি করো যাতে future developer ভুল করে:

- database reset
- seed overwrite
- upload deletion
- destructive deployment

করলে সেটা সহজে ঘটতে না পারে।

---

# 32. FINAL ACCEPTANCE TEST

এই scenario অবশ্যই pass করতে হবে:

### Test 1

Admin changes text.

✅ Save

✅ Refresh

✅ Text remains

### Test 2

Admin changes image.

✅ Save

✅ Refresh

✅ Image remains

### Test 3

Add new content.

✅ Save

✅ Existing content remains

### Test 4

Update frontend code.

✅ Existing CMS data remains

### Test 5

Update backend code.

✅ Existing CMS data remains

### Test 6

Build/rebuild.

✅ Existing data remains

### Test 7

Deploy to Hostinger.

✅ Existing data remains

### Test 8

Restart/reload.

✅ Existing data remains

### Test 9

Media Library image.

✅ Existing references remain

### Test 10

Explicit Media Library delete.

✅ Image is intentionally removed from linked locations

---

# 33. FINAL AUDIT REPORT

শেষে report দেবে:

## Root Cause

আগের data কেন হারাচ্ছিল।

## Architecture Fix

কীভাবে persistence নিশ্চিত করা হয়েছে।

## Database Fix

কীভাবে data protected হয়েছে।

## Image Fix

কীভাবে uploaded images persistent রাখা হয়েছে।

## Deployment Fix

কীভাবে future deployment safe করা হয়েছে।

## Verified Tests

কী কী actual browser/production test করা হয়েছে।

## Remaining Risks

যদি কিছু fully verify করা সম্ভব না হয়।

---

# FINAL NON-NEGOTIABLE RULE

আমার website/backend-এ:

> **একবার Admin/CMS থেকে কোনো content বা image save হলে সেটি permanent data হিসেবে গণ্য হবে।**

তারপর:

**Website update**

**Frontend update**

**Backend update**

**New feature**

**Bug fix**

**Build**

**Restart**

**Redeploy**

এর কোনোটিই সেই saved data automatically মুছে, reset বা replace করতে পারবে না।

শুধু আমি নিজে Admin/CMS থেকে explicitly change/delete করলে data পরিবর্তিত হবে।

---

# FINAL GOAL

আমার system-এর behaviour হতে হবে:

**Admin Change → Save → Database → Persistent Storage → Frontend**

এবং:

**Future Code Update → Existing Data Untouched**

অর্থাৎ:

> **CODE CAN CHANGE. FEATURES CAN CHANGE. DESIGN CAN CHANGE. BUT SAVED CONTENT, IMAGES AND CMS DATA MUST NOT DISAPPEAR.**

এই persistence architecture implement করার পরে live browser এবং যেখানে সম্ভব production/Hostinger environment-এ complete regression testing করবে।

**যতক্ষণ না তুমি verify করতে পারছো যে নতুন code/update করার পর আগের saved content এবং image system আর হারাচ্ছে না, ততক্ষণ task complete হিসেবে declare করবে না।**