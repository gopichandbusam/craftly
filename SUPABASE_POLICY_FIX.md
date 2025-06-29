# Fix for Supabase Storage Policy Error

The "syntax error at or near CREATE" error usually occurs because:
1. A policy with similar name already exists
2. The SQL editor formatting issue
3. Wrong section for creating storage policies

## ✅ Correct Way to Create Storage Policies

### Step 1: Delete Any Existing Policies
1. Go to **Storage** → **resume-files** → **Policies**
2. If you see any existing policies, delete them first
3. Click the **Delete** button (trash icon) for each policy

### Step 2: Create New Policy Using the UI (Recommended)

Instead of using SQL, use the Supabase UI:

1. In **Storage** → **resume-files** → **Policies**
2. Click **New Policy**
3. Choose **"For full customization"**
4. Fill in the form:

**Policy Name:** `Users can manage their own resume files`

**Allowed Operations:** Check ALL boxes:
- [x] SELECT (read)
- [x] INSERT (upload) 
- [x] UPDATE (modify)
- [x] DELETE (remove)

**Target Roles:** `authenticated`

**USING expression:**
```sql
bucket_id = 'resume-files' AND auth.uid()::text = (storage.foldername(name))[1]
```

**WITH CHECK expression:**
```sql
bucket_id = 'resume-files' AND auth.uid()::text = (storage.foldername(name))[1]
```

5. Click **Review** → **Save Policy**

### Step 3: Alternative - SQL Editor Method

If you prefer SQL, go to **SQL Editor** and run this:

```sql
-- First, make sure no conflicting policies exist
DROP POLICY IF EXISTS "Users can manage their own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own resume files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own resume files" ON storage.objects;  
DROP POLICY IF EXISTS "Users can delete their own resume files" ON storage.objects;

-- Create the comprehensive policy
CREATE POLICY "Users can manage their own resume files"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'resume-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'resume-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 4: Verify the Policy Works

Test the policy by:
1. Going to **Storage** → **resume-files** 
2. You should see the policy listed under **Policies** tab
3. The policy should show:
   - **Operations:** SELECT, INSERT, UPDATE, DELETE
   - **Role:** authenticated
   - **Status:** Enabled ✅

## 🔍 Common Issues & Solutions

### Issue 1: "Policy already exists"
**Solution:** Delete existing policies first, then create the new one

### Issue 2: "Invalid expression" 
**Solution:** Make sure the bucket name is exactly `resume-files` (with hyphen)

### Issue 3: "auth.uid() not found"
**Solution:** Ensure you're creating the policy on `storage.objects`, not on a table

## 🚀 After Policy Creation

Once the policy is created successfully:

1. **Test locally:**
   - Add the Supabase environment variables to your `.env` file
   - Test file upload functionality

2. **Deploy to Netlify:**
   - Add the environment variables to Netlify dashboard
   - Redeploy your site
   - Test the complete flow

## ✅ Verification Steps

The policy is working correctly when:
- ✅ Users can upload files to their own folder
- ✅ Users cannot see other users' files  
- ✅ File downloads work properly
- ✅ No console errors related to permissions

## 🔒 Security Note

This policy ensures:
- Files are stored as: `/resumes/{user_id}/filename.pdf`
- Users can only access files where the folder name matches their auth.uid()
- Anonymous users have no access
- Each user has complete control over their own files only

Try the UI method first - it's usually more reliable than the SQL editor for storage policies!