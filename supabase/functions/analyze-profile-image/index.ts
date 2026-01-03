import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate base64 image format
function isValidBase64Image(imageBase64: string): boolean {
  if (!imageBase64 || typeof imageBase64 !== 'string') return false;
  
  // Check for valid data URL format
  const dataUrlMatch = imageBase64.match(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/i);
  if (!dataUrlMatch) return false;
  
  // Check reasonable size (max ~10MB base64 = ~7.5MB image)
  if (imageBase64.length > 10 * 1024 * 1024) return false;
  
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate image format
    if (!isValidBase64Image(imageBase64)) {
      return new Response(
        JSON.stringify({ error: "Invalid image format. Please upload a valid image." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Service configuration error. Please try again later." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Analyzing profile image for physical attributes and gender...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI fashion stylist assistant that analyzes photos to determine physical attributes for fashion recommendations. Your primary task is to accurately identify the person's GENDER and other attributes to provide appropriate fashion recommendations.

CRITICAL: Pay close attention to identifying gender correctly:
- Look for facial features: jawline, facial hair, adam's apple
- Consider hairstyle patterns
- Look at clothing style if visible
- Consider overall body structure

You MUST respond with a valid JSON object with these exact fields:
{
  "gender": "male" | "female" | "unspecified",
  "body_type": "slim" | "athletic" | "average" | "curvy" | "plus",
  "skin_tone": "fair" | "light" | "medium" | "olive" | "tan" | "dark",
  "hair_color": "blonde" | "brown" | "black" | "red" | "gray" | "other",
  "hair_style": "short" | "medium" | "long" | "bald",
  "confidence": number between 0 and 100
}

IMPORTANT NOTES:
- Gender detection is CRUCIAL for appropriate fashion recommendations
- If the person appears to be male, set gender to "male"
- If the person appears to be female, set gender to "female"
- Only use "unspecified" if you truly cannot determine
- Be respectful and inclusive in your analysis
- If you cannot determine an attribute clearly, make your best estimation

Only return the JSON object, no other text.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this photo and determine the person's gender, body type, skin tone, hair color, and hair style for personalized fashion recommendations. Pay special attention to correctly identifying gender."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status, await response.text());
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to analyze image. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content in AI response");
      return new Response(
        JSON.stringify({ error: "Failed to analyze image. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("AI response received");

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Invalid AI response format:", content);
      return new Response(
        JSON.stringify({ error: "Failed to analyze image. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    console.log("Analysis complete, detected gender:", analysis.gender);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing image:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze image. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});