import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Sanitize user input to prevent prompt injection
function sanitizeInput(input: string | null | undefined, maxLength = 200): string {
  if (!input || typeof input !== 'string') return '';
  // Remove potential prompt injection patterns
  return input
    .replace(/[\r\n]+/g, ' ') // Remove newlines
    .replace(/[<>{}[\]]/g, '') // Remove brackets that could be used for injection
    .replace(/ignore.*previous.*instructions?/gi, '') // Block common injection phrases
    .replace(/system.*prompt/gi, '')
    .replace(/you.*are.*now/gi, '')
    .slice(0, maxLength)
    .trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, wardrobe, occasion } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Service configuration error. Please try again later.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Sanitize occasion input
    const sanitizedOccasion = sanitizeInput(occasion, 50) || 'casual everyday';

    // Sanitize wardrobe items
    const sanitizedWardrobe = (wardrobe || []).slice(0, 50).map((item: any) => ({
      color: sanitizeInput(item?.color, 30),
      category: sanitizeInput(item?.category, 30),
      name: sanitizeInput(item?.name, 50)
    }));

    const wardrobeDescription = sanitizedWardrobe.length > 0 
      ? sanitizedWardrobe.map((item: any) => `${item.color} ${item.category} (${item.name})`).join(', ')
      : 'No items in wardrobe yet';

    // Sanitize profile data
    const sanitizedProfile = profile ? {
      gender: sanitizeInput(profile.gender, 20),
      body_type: sanitizeInput(profile.body_type, 30),
      skin_tone: sanitizeInput(profile.skin_tone, 30),
      hair_color: sanitizeInput(profile.hair_color, 30),
      hair_style: sanitizeInput(profile.hair_style, 30),
      style_preference: sanitizeInput(profile.style_preference, 50),
      preferred_colors: (profile.preferred_colors || []).slice(0, 10).map((c: string) => sanitizeInput(c, 20))
    } : null;

    // Determine gender for appropriate outfit suggestions
    const gender = sanitizedProfile?.gender || 'unspecified';
    const genderContext = gender === 'male' 
      ? "The user is MALE. Suggest masculine clothing items like: men's shirts, trousers, suits, blazers, jeans, t-shirts, polo shirts, chinos, leather jackets, etc. Do NOT suggest dresses, skirts, or feminine items."
      : gender === 'female'
      ? "The user is FEMALE. Suggest feminine clothing items like: dresses, skirts, blouses, women's jeans, heels, flats, cardigans, etc."
      : "Gender not specified. Suggest gender-neutral or versatile clothing items.";

    console.log("User gender:", gender);

    const profileDescription = sanitizedProfile 
      ? `Gender: ${gender}, Body type: ${sanitizedProfile.body_type || 'not specified'}, Skin tone: ${sanitizedProfile.skin_tone || 'not specified'}, Hair color: ${sanitizedProfile.hair_color || 'not specified'}, Hair style: ${sanitizedProfile.hair_style || 'not specified'}, Style preference: ${sanitizedProfile.style_preference || 'not specified'}, Preferred colors: ${sanitizedProfile.preferred_colors?.join(', ') || 'not specified'}`
      : 'No profile information available';

    const systemPrompt = `You are StyleAI, an expert fashion stylist AI. Your role is to suggest perfect outfit combinations based on the user's profile, wardrobe, and occasion.

CRITICAL INSTRUCTION - GENDER-APPROPRIATE OUTFITS:
${genderContext}

Always respond with a JSON object in this exact format:
{
  "outfit": {
    "top": "specific description with color and style",
    "bottom": "specific description with color and style", 
    "outerwear": "description or null if not needed",
    "shoes": "specific description with color and style",
    "accessories": "description or null"
  },
  "explanation": "Brief friendly explanation of why this outfit works",
  "styling_tips": ["tip 1", "tip 2", "tip 3"],
  "color_harmony": "explanation of color coordination",
  "image_prompt": "A detailed fashion photography prompt describing a complete outfit for a ${gender === 'male' ? 'man' : gender === 'female' ? 'woman' : 'person'}: [describe the full outfit with all colors, textures, and style details]"
}

IMPORTANT: Make sure ALL clothing items are appropriate for the user's gender.`;

    const userPrompt = `Please suggest an outfit for: ${sanitizedOccasion}

USER PROFILE: ${profileDescription}
WARDROBE: ${wardrobeDescription}

${sanitizedWardrobe.length > 0 
  ? 'Prioritize items from my wardrobe when possible.'
  : 'Suggest items I should consider purchasing.'}

Remember: Suggest ${gender === 'male' ? "MEN'S" : gender === 'female' ? "WOMEN'S" : "gender-neutral"} clothing items only.`;

    console.log('Calling AI gateway for outfit suggestion...');
    
    // Step 1: Get outfit text suggestion
    const textResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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

    if (!textResponse.ok) {
      const errorText = await textResponse.text();
      console.error('AI gateway error:', textResponse.status, errorText);
      
      if (textResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (textResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'Failed to generate outfit suggestion. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const textData = await textResponse.json();
    const content = textData.choices?.[0]?.message?.content;
    
    console.log('AI text response received');

    // Parse the JSON response
    let suggestion;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      suggestion = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Provide gender-appropriate fallback
      const isMale = gender === 'male';
      suggestion = {
        outfit: {
          top: isMale ? "Classic white button-down shirt" : "Elegant white blouse",
          bottom: isMale ? "Navy blue chinos" : "High-waisted navy trousers",
          outerwear: null,
          shoes: isMale ? "Brown leather loafers" : "Nude pointed-toe heels",
          accessories: isMale ? "Simple leather watch" : "Gold pendant necklace"
        },
        explanation: "A timeless combination that works for most occasions.",
        styling_tips: ["Keep accessories minimal", "Ensure proper fit", "Iron clothes for a crisp look"],
        color_harmony: "Navy and white is a classic pairing that suits most skin tones.",
        image_prompt: `Fashion flat lay photography of a complete ${isMale ? "men's" : "women's"} outfit: ${isMale ? "white button-down shirt, navy blue chinos, brown leather loafers" : "white blouse, navy trousers, nude heels"}, arranged elegantly on a neutral background`
      };
    }

    // Step 2: Generate outfit image
    let outfitImage = null;
    try {
      const genderWord = gender === 'male' ? "men's" : gender === 'female' ? "women's" : "";
      const imagePrompt = suggestion.image_prompt || 
        `Fashion photography flat lay of a complete ${genderWord} ${sanitizedOccasion} outfit: ${suggestion.outfit.top}, ${suggestion.outfit.bottom}, ${suggestion.outfit.shoes}${suggestion.outfit.outerwear ? ', ' + suggestion.outfit.outerwear : ''}${suggestion.outfit.accessories ? ', ' + suggestion.outfit.accessories : ''}, styled professionally on a clean background, high-end fashion editorial style`;

      console.log('Generating outfit image...');
      
      const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            { 
              role: 'user', 
              content: `Generate a high-quality fashion flat lay image: ${imagePrompt}. Make it look like a professional fashion magazine photoshoot with clean styling. This is ${genderWord} clothing.`
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (imageUrl) {
          outfitImage = imageUrl;
          console.log('Outfit image generated successfully');
        }
      } else {
        console.error('Image generation failed:', await imageResponse.text());
      }
    } catch (imageError) {
      console.error('Error generating outfit image:', imageError);
      // Continue without image - not critical
    }

    // Add image to suggestion
    suggestion.outfit_image = outfitImage;

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in suggest-outfit function:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});