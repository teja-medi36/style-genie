import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze image");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("AI response:", content);

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid AI response format");
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    console.log("Parsed analysis:", JSON.stringify(analysis));
    console.log("Detected gender:", analysis.gender);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to analyze image" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});