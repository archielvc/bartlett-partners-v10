import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Email template for enquiry notifications
function generateEmailHtml(enquiry: {
  name: string;
  email: string;
  phone: string | null;
  message: string;
  inquiry_type: string;
  property_title?: string | null;
  property_id?: number | null;
  seller_postcode?: string | null;
  seller_house_number?: string | null;
  created_at: string;
}, propertyDetails?: { title: string; slug: string; price: string; location: string } | null): string {
  const enquiryTypeLabels: Record<string, string> = {
    general: 'General Enquiry',
    property: 'Property Enquiry',
    valuation: 'Valuation Request',
    newsletter: 'Newsletter Signup',
  };

  const enquiryTypeColors: Record<string, string> = {
    general: '#6B7280',
    property: '#2563EB',
    valuation: '#7C3AED',
    newsletter: '#059669',
  };

  const typeLabel = enquiryTypeLabels[enquiry.inquiry_type] || 'Enquiry';
  const typeColor = enquiryTypeColors[enquiry.inquiry_type] || '#6B7280';
  const formattedDate = new Date(enquiry.created_at).toLocaleString('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const propertySection = propertyDetails ? `
    <tr>
      <td style="padding: 20px 0; border-top: 1px solid #E5E7EB;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Property of Interest</h3>
        <div style="background: #F9FAFB; border-radius: 8px; padding: 16px;">
          <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #1A2551;">${propertyDetails.title}</p>
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #6B7280;">${propertyDetails.location}</p>
          <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #1A2551;">${propertyDetails.price}</p>
          <a href="https://bartlettandpartners.com/properties/${propertyDetails.slug}" style="display: inline-block; font-size: 13px; color: #2563EB; text-decoration: none;">View Property &rarr;</a>
        </div>
      </td>
    </tr>
  ` : '';

  // Section for seller's property (valuation requests)
  const sellerPropertySection = (enquiry.seller_house_number || enquiry.seller_postcode) ? `
    <tr>
      <td style="padding: 20px 0; border-top: 1px solid #E5E7EB;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Property to Sell</h3>
        <div style="background: #F3E8FF; border-radius: 8px; padding: 16px; border-left: 4px solid #7C3AED;">
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1A2551;">${enquiry.seller_house_number}${enquiry.seller_house_number && enquiry.seller_postcode ? ', ' : ''}${enquiry.seller_postcode || ''}</p>
        </div>
      </td>
    </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Enquiry - Bartlett &amp; Partners</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F3F4F6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F3F4F6;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background: #FFFFFF; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #1A2551;">Bartlett &amp; Partners</h1>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 6px 12px; background: ${typeColor}15; color: ${typeColor}; font-size: 12px; font-weight: 600; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">${typeLabel}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #111827;">New enquiry from ${enquiry.name}</h2>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #6B7280;">${formattedDate}</p>

              <!-- Contact Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Contact Details</h3>
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 4px 16px 4px 0; font-size: 14px; color: #6B7280;">Name:</td>
                        <td style="padding: 4px 0; font-size: 14px; color: #111827; font-weight: 500;">${enquiry.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 4px 16px 4px 0; font-size: 14px; color: #6B7280;">Email:</td>
                        <td style="padding: 4px 0; font-size: 14px;"><a href="mailto:${enquiry.email}" style="color: #2563EB; text-decoration: none;">${enquiry.email}</a></td>
                      </tr>
                      ${enquiry.phone ? `
                      <tr>
                        <td style="padding: 4px 16px 4px 0; font-size: 14px; color: #6B7280;">Phone:</td>
                        <td style="padding: 4px 0; font-size: 14px;"><a href="tel:${enquiry.phone}" style="color: #2563EB; text-decoration: none;">${enquiry.phone}</a></td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>

                ${propertySection}

                ${sellerPropertySection}

                <!-- Message -->
                <tr>
                  <td style="padding: 20px 0; border-top: 1px solid #E5E7EB;">
                    <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Message</h3>
                    <div style="background: #F9FAFB; border-radius: 8px; padding: 16px;">
                      <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap;">${enquiry.message || 'No message provided.'}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-top: 24px;">
                    <a href="https://bartlettandpartners.com/admin" style="display: inline-block; padding: 12px 24px; background: #1A2551; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">View in CMS</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background: #F9FAFB; border-top: 1px solid #E5E7EB; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF; text-align: center;">
                This is an automated notification from the Bartlett &amp; Partners website.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Check for Resend API key
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload = await req.json();

    // Handle webhook payload from Supabase Database Webhooks
    // The payload structure is: { type: 'INSERT', table: 'enquiries', record: {...}, ... }
    const enquiry = payload.record || payload;

    if (!enquiry.name || !enquiry.email) {
      return new Response(JSON.stringify({ error: 'Invalid enquiry data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client to fetch settings and property details
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch notification recipients from global_settings
    const { data: settingsData } = await supabase
      .from('global_settings')
      .select('setting_value')
      .eq('setting_key', 'enquiry_notification_emails')
      .single();

    const recipients: string[] = settingsData?.setting_value || [];

    if (recipients.length === 0) {
      console.warn('No notification recipients configured');
      return new Response(JSON.stringify({
        success: false,
        message: 'No notification recipients configured'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch property details if this is a property enquiry
    let propertyDetails = null;
    if (enquiry.property_id) {
      const { data: property } = await supabase
        .from('properties')
        .select('title, slug, price, location')
        .eq('id', enquiry.property_id)
        .single();

      if (property) {
        propertyDetails = property;
      }
    }

    // Generate email subject
    const typeLabels: Record<string, string> = {
      general: 'General',
      property: 'Property',
      valuation: 'Valuation',
      newsletter: 'Newsletter',
    };
    const typeLabel = typeLabels[enquiry.inquiry_type] || 'New';
    const subject = `New ${typeLabel} Enquiry from ${enquiry.name}`;

    // Generate email HTML
    const htmlContent = generateEmailHtml(enquiry, propertyDetails);

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Bartlett & Partners <info@bartlettandpartners.com>',
        to: recipients,
        subject: subject,
        html: htmlContent,
        reply_to: enquiry.email,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('Resend API error:', resendData);
      return new Response(JSON.stringify({
        error: 'Failed to send email',
        details: resendData
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Email sent successfully:', resendData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Notification email sent',
      email_id: resendData.id,
      recipients: recipients.length,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing enquiry notification:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
