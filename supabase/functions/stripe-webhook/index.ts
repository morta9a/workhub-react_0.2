import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature provided', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string
    
    // Verify the webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any
      const userId = session.client_reference_id
      
      // Determine the plan based on the product or amount
      // This is a placeholder logic. You should map Stripe Product IDs to your plans
      let targetPlan = 'pro'
      if (session.amount_total > 3000) {
        targetPlan = 'enterprise'
      }

      if (userId) {
        // Initialize Supabase admin client to bypass RLS
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Update user plan in metadata safely from server
        // Fetch current user metadata first
        const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
        
        if (user && !userError) {
          const newMetadata = { ...user.app_metadata, ...user.user_metadata, plan: targetPlan }
          
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: newMetadata
          })
          
          console.log(`Successfully upgraded user ${userId} to ${targetPlan}`)
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})
