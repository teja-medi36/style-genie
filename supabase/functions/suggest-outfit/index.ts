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
    const { profile, wardrobe, occasion } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const wardrobeDescription = wardrobe && wardrobe.length > 0 
      ? wardrobe.map((item: any) => `${item.color} ${item.category} (${item.name})`).join(', ')
      : 'No items in wardrobe yet';

    const profileDescription = profile 
      ? `Body type: ${profile.body_type || 'not specified'}, Skin tone: ${profile.skin_tone || 'not specified'}, Hair color: ${profile.hair_color || 'not specified'}, Hair style: ${profile.hair_style || 'not specified'}, Style preference: ${profile.style_preference || 'not specified'}, Preferred colors: ${profile.preferred_colors?.join(', ') || 'not specified'}`
      : 'No profile information available';

    const systemPrompt = `You are StyleAI, an expert fashion stylist AI. Your role is to suggest perfect outfit combinations based on the user's profile, wardrobe, and occasion. Be specific, creative, and explain why each piece works together.

Always respond with a JSON object in this exact format:
{
  "outfit": {
    "top": "description of top/shirt suggestion",
    "bottom": "description of pants/skirt suggestion", 
    "outerwear": "description of jacket/coat if needed, or null",
    "shoes": "description of shoe suggestion",
    "accessories": "description of accessories if any, or null"
  },
  "explanation": "A brief, friendly explanation of why this outfit works for the occasion and the person's style",
  "styling_tips": ["tip 1", "tip 2", "tip 3"],
  "color_harmony": "explanation of how the colors complement each other and the person's features",
  "alternatives": {
    "top": "alternative top option",
    "bottom": "alternative bottom option"
  }
}`;

    const userPrompt = `Please suggest an outfit for the following:

OCCASION: ${occasion || 'casual everyday'}

USER PROFILE:
${profileDescription}

AVAILABLE WARDROBE ITEMS:
${wardrobeDescription}

${wardrobe && wardrobe.length > 0 
  ? 'Please prioritize items from my wardrobe when possible, but also suggest items I might want to add.'
  : 'Since my wardrobe is empty, please suggest items I should consider purchasing.'}

Provide a complete outfit suggestion with explanations.`;

    console.log('Calling AI gateway for outfit suggestion...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response received:', content?.substring(0, 200));

    // Parse the JSON response
    let suggestion;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      suggestion = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return a structured fallback based on the text response
      suggestion = {
        outfit: {
          top: "Classic white button-down shirt",
          bottom: "Navy blue chinos",
          outerwear: null,
          shoes: "Brown leather loafers",
          accessories: "Simple leather watch"
        },
        explanation: content || "A timeless combination that works for most occasions.",
        styling_tips: ["Keep accessories minimal", "Ensure proper fit", "Iron clothes for a crisp look"],
        color_harmony: "Navy and white is a classic pairing that suits most skin tones.",
        alternatives: {
          top: "Light blue oxford shirt",
          bottom: "Dark gray trousers"
        }
      };
    }

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-outfit function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
