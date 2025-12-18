import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
}));

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Storage Bucket
const BUCKET_NAME = 'bartlett-images';

// Routes
const routePrefix = '/make-server-e2fc9a7e';

app.get(`${routePrefix}/health`, (c) => c.json({ status: 'ok' }));

// Upload Route - Multi-Strategy Handler
app.post(`${routePrefix}/upload`, async (c) => {
  try {
    // Check for Content-Type
    const contentType = c.req.header('Content-Type') || '';
    console.log('Upload request content-type:', contentType);

    let fileBody: any;
    let filePath: string = '';
    let fileType: string = 'application/octet-stream';

    // Strategy 1: Raw Binary Upload (Preferred for stability)
    // Matches "image/png", "image/jpeg", "application/octet-stream" etc.
    if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
       const path = c.req.query('path');
       if (!path) return c.json({ error: 'Missing path query parameter for raw upload' }, 400);
       
       // Read raw body as array buffer
       fileBody = await c.req.arrayBuffer();
       fileType = contentType;
       filePath = path;
       
       console.log('Processing Raw Binary Upload:', filePath);
    }
    // Strategy 2: Multipart Form Data
    else if (contentType.includes('multipart/form-data')) {
      const body = await c.req.parseBody();
      const file = body['file'];
      const path = body['path'] as string;

      if (!file) {
        return c.json({ error: 'No file found in form data' }, 400);
      }

      // In Deno Hono, file is a File object
      if (file instanceof File) {
        fileBody = file;
        fileType = file.type;
        filePath = path || `${Date.now()}_${file.name}`;
      } else {
        console.error('Parsed file is not a File instance:', typeof file);
        return c.json({ error: 'Uploaded item is not a file' }, 400);
      }
    } 
    // Strategy 3: JSON Base64 (Legacy/Fallback)
    else if (contentType.includes('application/json')) {
      const json = await c.req.json();
      const { fileData, path } = json;
      
      if (!fileData || !path) return c.json({ error: 'Missing fileData or path' }, 400);
      
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) return c.json({ error: 'Invalid Base64' }, 400);
      
      fileType = matches[1];
      const binaryStr = atob(matches[2]);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryStr.charCodeAt(i);
      
      fileBody = bytes;
      filePath = path;
    } 
    else {
      return c.json({ error: `Unsupported Content-Type: ${contentType}` }, 400);
    }

    // Ensure bucket exists (Lazy init)
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(b => b.name === BUCKET_NAME)) {
       await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif']
      });
    }

    console.log(`Uploading ${filePath} (${fileType})`);

    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBody, {
        upsert: true,
        contentType: fileType
      });

    if (error) {
      console.error('Supabase Storage Upload Error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return c.json({ url: publicUrl });

  } catch (err: any) {
    console.error('Server Upload Exception:', err);
    return c.json({ error: `Server Error: ${err.message || String(err)}` }, 500);
  }
});

// DELETE Uploaded File
app.delete(`${routePrefix}/upload`, async (c) => {
  try {
    const { path, url } = await c.req.json();

    // Extract path from URL if path not provided
    let storagePath = path;
    if (!storagePath && url) {
      // Format: .../storage/v1/object/public/site-assets/cms/timestamp_name.jpg
      const parts = url.split(`${BUCKET_NAME}/`);
      if (parts.length === 2) {
        storagePath = parts[1];
      }
    }

    if (!storagePath) {
      return c.json({ error: 'Path or URL is required' }, 400);
    }

    console.log(`Deleting file: ${storagePath}`);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([storagePath]);

    if (error) {
      console.error('Supabase Storage Delete Error:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ success: true });

  } catch (err: any) {
     console.error('Server Delete Exception:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Send Email Route (Generic)
app.post(`${routePrefix}/send-email`, async (c) => {
  try {
    const { to, subject, html, text } = await c.req.json();
    
    // NOTE: To enable real emails, add your RESEND_API_KEY to Supabase secrets
    // and uncomment the code below.
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    
    if (!RESEND_API_KEY) {
        console.log('Mock Email Sent:', { to, subject });
        return c.json({ success: true, mock: true });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Bartlett & Partners <onboarding@resend.dev>', // Update this to your verified domain
        to,
        subject,
        html,
        text
      })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    const data = await res.json();
    return c.json({ success: true, data });

  } catch (err: any) {
    console.error('Email Send Error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Newsletter Signup Route (Integration)
app.post(`${routePrefix}/newsletter-signup`, async (c) => {
  try {
    const { email, firstName, lastName, provider, apiKey, listId } = await c.req.json();
    
    console.log(`Newsletter Sync Request: ${email} via ${provider}`);

    // Implementation logic for different providers would go here
    // This is just a mockup/skeleton for the concept
    
    if (provider === 'mailchimp' && apiKey && listId) {
       // Example Mailchimp Sync Code (Commented out as we don't have the SDK)
       /*
       const dc = apiKey.split('-')[1];
       const res = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`, {
           method: 'POST',
           headers: { Authorization: `apikey ${apiKey}` },
           body: JSON.stringify({
               email_address: email,
               status: 'subscribed',
               merge_fields: { FNAME: firstName, LNAME: lastName }
           })
       });
       */
       return c.json({ success: true, provider: 'mailchimp', message: 'Mock sync successful' });
    }
    
    return c.json({ success: true, message: 'Logged sync request' });
  } catch (err: any) {
    console.error('Newsletter Sync Error:', err);
    return c.json({ error: err.message }, 500);
  }
});

// =====================================================
// KV STORE ENDPOINTS
// =====================================================

// Get a single value
app.post(`${routePrefix}/kv/get`, async (c) => {
  try {
    const { key } = await c.req.json();
    if (!key) return c.json({ error: 'Key is required' }, 400);

    const { data, error } = await supabase
      .from('kv_store_e2fc9a7e')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.error('KV Get Error:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ value: data?.value || null });
  } catch (err: any) {
    console.error('KV Get Exception:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Set a value
app.post(`${routePrefix}/kv/set`, async (c) => {
  try {
    const { key, value } = await c.req.json();
    if (!key) return c.json({ error: 'Key is required' }, 400);

    const { error } = await supabase
      .from('kv_store_e2fc9a7e')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) {
      console.error('KV Set Error:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ success: true });
  } catch (err: any) {
    console.error('KV Set Exception:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Get by prefix
app.post(`${routePrefix}/kv/getByPrefix`, async (c) => {
  try {
    const { prefix } = await c.req.json();
    if (!prefix) return c.json({ error: 'Prefix is required' }, 400);

    const { data, error } = await supabase
      .from('kv_store_e2fc9a7e')
      .select('key, value')
      .like('key', `${prefix}%`);

    if (error) {
      console.error('KV GetByPrefix Error:', error);
      return c.json({ error: error.message }, 500);
    }

    const values = data?.map(item => item.value) || [];
    return c.json({ values });
  } catch (err: any) {
    console.error('KV GetByPrefix Exception:', err);
    return c.json({ error: err.message }, 500);
  }
});

// Delete a key
app.post(`${routePrefix}/kv/del`, async (c) => {
  try {
    const { key } = await c.req.json();
    if (!key) return c.json({ error: 'Key is required' }, 400);

    const { error } = await supabase
      .from('kv_store_e2fc9a7e')
      .delete()
      .eq('key', key);

    if (error) {
      console.error('KV Delete Error:', error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({ success: true });
  } catch (err: any) {
    console.error('KV Delete Exception:', err);
    return c.json({ error: err.message }, 500);
  }
});

Deno.serve(app.fetch);