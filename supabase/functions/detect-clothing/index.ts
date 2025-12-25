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
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('No image provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Detecting clothing items in image...');

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
            content: `You are a fashion AI that detects clothing items in images. Analyze the image and identify all visible clothing items and accessories.

For each item, provide:
- label: The specific name of the item (e.g., "Navy Blue Blazer", "White Sneakers")
- category: The category (Tops, Bottoms, Outerwear, Shoes, Accessories, Bags, Jewelry)
- x: Horizontal position as percentage (0-100) where the item is centered
- y: Vertical position as percentage (0-100) where the item is centered
- color: Primary color of the item
- style: Style description (casual, formal, sporty, etc.)

Return ONLY a valid JSON array of items. Example:
[
  {"label": "Navy Blue Blazer", "category": "Outerwear", "x": 50, "y": 30, "color": "navy", "style": "formal"},
  {"label": "White T-Shirt", "category": "Tops", "x": 50, "y": 45, "color": "white", "style": "casual"}
]

Be precise with positions - consider where items are actually located in the image.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Detect all clothing items and accessories in this image. Return only the JSON array.'
              },
              {
                type: 'image_url',
                image_url: { url: image }
              }
            ]
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
    let items = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        items = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      items = [];
    }

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in detect-clothing function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
