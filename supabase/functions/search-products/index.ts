import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { item } = await req.json();
    
    if (!item || !item.label) {
      throw new Error('No item provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Searching for products matching:', item);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a fashion shopping assistant. Given a clothing item description, generate realistic product search results that would match the item.

Generate 4 products that closely match the described item. Each product should be realistic and from actual popular stores.

For each product provide:
- name: A specific product name that matches the item description (e.g., if item is "Pink Collared Shirt", provide names like "Classic Pink Oxford Shirt", "Blush Rose Button-Down", etc.)
- price: Current sale price (realistic, between $20-$300 depending on item type)
- originalPrice: Higher original price
- store: Real store name (Zara, H&M, Nordstrom, ASOS, Mango, Uniqlo, Massimo Dutti, COS, & Other Stories, Everlane, J.Crew)
- rating: Rating between 4.0 and 5.0
- image: Use one of these Unsplash fashion image URLs based on item type:
  - For shirts/tops: https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop
  - For pants/bottoms: https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=300&h=400&fit=crop
  - For dresses: https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop
  - For jackets/coats: https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=400&fit=crop
  - For shoes: https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=400&fit=crop
  - For accessories: https://images.unsplash.com/photo-1611923134239-b9be5816e23e?w=300&h=400&fit=crop
- url: Use store URL format like https://store.com/product

Return ONLY a valid JSON array. Example:
[
  {"name": "Classic Pink Oxford Shirt", "price": 39.99, "originalPrice": 59.99, "store": "Uniqlo", "rating": 4.5, "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=400&fit=crop", "url": "https://uniqlo.com/product"}
]`
          },
          {
            role: 'user',
            content: `Find products matching this item:
Label: ${item.label}
Category: ${item.category}
Color: ${item.color || 'not specified'}
Style: ${item.style || 'not specified'}

Return only the JSON array with 4 matching products.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response:', content);

    // Parse the JSON from the response
    let products = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]).map((p: any, index: number) => ({
          ...p,
          id: Date.now() + index,
        }));
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      products = [];
    }

    return new Response(JSON.stringify({ products }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in search-products function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
