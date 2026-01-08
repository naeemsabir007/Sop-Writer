import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Gemini API endpoint
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const SYSTEM_PROMPT = `You are a helpful support assistant for SOPWriter, a service that generates professional Statement of Purpose (SOP) documents for student visa applications. 

About SOPWriter:
- We help students create compelling SOPs for their visa applications
- We support visa applications to Italy, UK, Germany, USA, Australia, Canada, France, Netherlands, Sweden, New Zealand, Ireland, and Austria
- Our AI generates personalized, embassy-compliant documents
- The process takes just 2 minutes: Enter your profile, AI calibrates the tone, download your PDF
- We have a premium tier that provides full access to download and edit documents

Pricing:
- Premium access unlocks full document downloads and editing capabilities
- We accept secure online payments

Support Topics:
- Document generation process
- Supported countries and universities
- Payment and premium features
- Technical issues with the platform

Be concise, helpful, and friendly. If you don't know something specific, direct users to email support@sopwriter.pk`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require authentication to prevent external abuse
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the user token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const messages = body?.messages;

    // Validate messages input
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("AI service is not configured. Please add GEMINI_API_KEY to Supabase secrets.");
    }

    // Convert OpenAI-style messages to Gemini format
    // Gemini uses "user" and "model" roles, and doesn't have a system role in the same way
    // We'll prepend the system prompt to the first user message
    const geminiContents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    let isFirstUserMessage = true;
    for (const msg of messages) {
      const role = msg.role === "assistant" ? "model" : "user";
      let text = msg.content;

      // Prepend system prompt to first user message
      if (role === "user" && isFirstUserMessage) {
        text = `[System Instructions: ${SYSTEM_PROMPT}]\n\nUser message: ${text}`;
        isFirstUserMessage = false;
      }

      geminiContents.push({
        role,
        parts: [{ text }]
      });
    }

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 403) {
        return new Response(JSON.stringify({ error: "API key invalid or quota exceeded." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to get AI response" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const assistantContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";

    // Return response in SSE format to be compatible with existing frontend
    // The frontend expects streaming, so we'll simulate it with a single chunk
    const sseData = `data: ${JSON.stringify({
      choices: [{
        delta: { content: assistantContent },
        finish_reason: "stop"
      }]
    })}\n\ndata: [DONE]\n\n`;

    return new Response(sseData, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });
  } catch (error) {
    console.error("AI support chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
