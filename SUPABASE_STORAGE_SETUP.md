# Supabase Storage Setup for Image Uploads

The PinComposer component now supports multiple image uploads. To enable this feature, you need to set up a Supabase Storage bucket.

## Step 1: Create Storage Bucket

1. Go to your **Supabase Dashboard**: https://app.supabase.com/project/YOUR_PROJECT_ID
2. Click on **Storage** in the left sidebar
3. Click **New bucket**
4. Enter bucket details:
   - **Name**: `pins`
   - **Public bucket**: ✅ **Enable** (check this box)
   - **File size limit**: 50 MB (default is fine)
5. Click **Create bucket**

## Step 2: Set Up Storage Policies

After creating the bucket, you need to set up security policies:

### Policy 1: Allow Authenticated Users to Upload (INSERT)

1. In the Storage page, click on the **`pins`** bucket
2. Click the **Policies** tab
3. Click **New Policy**
4. Choose **Custom policy** or use template "Allow upload for authenticated users"
5. Set these values:
   - **Policy name**: `Allow authenticated uploads`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **Policy definition**:
     ```sql
     (bucket_id = 'pins'::text) AND (auth.role() = 'authenticated'::text)
     ```
6. Click **Review** then **Save policy**

### Policy 2: Allow Public Read Access (SELECT)

1. Click **New Policy** again
2. Choose **Custom policy** or use template "Allow public downloads"
3. Set these values:
   - **Policy name**: `Allow public read`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `public`
   - **Policy definition**:
     ```sql
     (bucket_id = 'pins'::text)
     ```
4. Click **Review** then **Save policy**

### Policy 3: Allow Users to Delete Their Own Uploads (DELETE) - Optional

1. Click **New Policy** again
2. Set these values:
   - **Policy name**: `Allow authenticated delete`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **Policy definition**:
     ```sql
     (bucket_id = 'pins'::text) AND (auth.role() = 'authenticated'::text)
     ```
3. Click **Review** then **Save policy**

## Step 3: Verify Setup

1. Pull the latest changes from GitHub:
   ```bash
   git pull origin main
   ```

2. Run your app:
   ```bash
   npm run dev
   ```

3. Try creating a pin with images:
   - Click the "+ Add Photos" button
   - Select one or multiple images
   - Fill in other fields (text, sticker, etc.)
   - Click "💕 Create Pin"

4. Check your Supabase Storage:
   - Go to Storage → `pins` bucket
   - You should see uploaded images in the `pin-images/` folder

## Troubleshooting

### Images not uploading?

- **Check bucket is public**: Go to Storage → pins → Settings, ensure "Public bucket" is enabled
- **Check policies**: Make sure INSERT and SELECT policies are active
- **Check browser console**: Look for error messages (F12 → Console tab)
- **Check Supabase logs**: Go to Logs in dashboard to see detailed errors

### Images uploading but not displaying?

- **Check SELECT policy**: Public read must be enabled
- **Check image URLs**: They should look like: `https://YOUR_PROJECT.supabase.co/storage/v1/object/public/pins/pin-images/123.jpg`
- **Check CORS**: Supabase should handle this automatically for public buckets

### Need help?

Check the Supabase Storage documentation: https://supabase.com/docs/guides/storage

---

✅ **Once setup is complete**, your Memory Pinboard will support beautiful multi-image uploads with polaroid-style previews! 📸💕
