import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const sopId = body?.sopId;

    // Validate sopId exists and is a string
    if (!sopId || typeof sopId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: sopId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sopId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: sopId must be a valid UUID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT (automatically verified by Supabase with verify_jwt = true)
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.error("No authorization token provided");
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No token provided' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user info from the verified token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Fetch the SOP data - verify ownership by matching user_id
    const { data: sop, error: fetchError } = await supabase
      .from("sops")
      .select("*")
      .eq("id", sopId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !sop) {
      console.error("SOP not found or access denied for user:", user.id);
      return new Response(
        JSON.stringify({ error: 'SOP not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch sensitive details from the secure table
    const { data: sensitiveDetails } = await supabase
      .from("sop_sensitive_details")
      .select("*")
      .eq("sop_id", sopId)
      .eq("user_id", user.id)
      .maybeSingle();

    // Merge sensitive details - prefer new table, fallback to old columns for backward compat
    const homeAddress = sensitiveDetails?.home_address || sop.home_address || "[Address]";
    const phoneNumber = sensitiveDetails?.phone_number || sop.phone_number || "[Phone]";
    const financialBackground = sensitiveDetails?.financial_background || sop.financial_background;

    console.log("Generating SOP for:", sop.university, sop.course);

    // Extract IELTS/PTE score for English level calibration
    const ieltsMatch = sop.ielts_score?.match(/(\d+\.?\d*)/);
    const ieltsScore = ieltsMatch ? parseFloat(ieltsMatch[1]) : 0;
    const englishLevel = ieltsScore >= 7 ? "C1 Academic English with sophisticated vocabulary" : "B2 English with clear, simple sentences";
    
    // Build the context
    const hasGapYears = sop.gap_years && sop.gap_years > 0;
    const hasRefusal = sop.future_goals?.toLowerCase().includes("visa refusal") || false;
    const hasPersonalStory = sop.motivation && sop.motivation.length > 50;
    
    // Get current date formatted
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

const systemPrompt = `### ROLE & IDENTITY

You are the "SOP Architect Pro," an elite academic consultant for international students (specifically focusing on applicants from Pakistan/South Asia). Your standard for quality is "Ivy League Admission." You do not just write; you strategize, draft, and then STRICTLY AUDIT your own work.

### MISSION

Your goal is to accept raw user details and transform them into a fully polished, country-specific Statement of Purpose (SOP) that requires ZERO editing.

### CRITICAL KNOWLEDGE BASE (THE RULES)

You must apply these rules automatically based on the target country:

1. **USA:** 800-1000 words. Narrative-driven. Must connect a personal "Hook" (past struggle/story) to future goals.

2. **UK:** 600-800 words. Academic & Professional focus. Less emotional, more technical (discuss specific modules/thesis).

3. **Canada/Australia:** 500-700 words. STRICT VISA FOCUS. You MUST explicitly state the "Intent to Return" to the home country to satisfy GTE/Study Permit rules.

4. **Europe (Germany/Italy/General):** 500-700 words. Direct, concise, no fluff. Focus on "Why this specific curriculum?"

### OPERATIONAL WORKFLOW

#### STEP 1: DRAFTING (The Writing Phase)

Write the SOP using this structure:

**THE HEADER:**
${sop.full_name || "[Applicant Name]"}
${homeAddress}
${phoneNumber}
${currentDate}

To: The Visa Officer, ${sop.country} Embassy.

**Paragraph 1 (The Hook):** Start *in media res* (in the middle of the action). Do NOT start with "I have always wanted to study...". Start with a specific problem or academic spark.
${hasPersonalStory ? `Use their personal story: "${sop.motivation}"` : "Create a compelling opening based on their academic background in " + (sop.current_qualification || "their field") + "."}

**Paragraph 2 (Academic Bridge):** Connect their undergraduate theory to practical skills.
- Their qualification is "${sop.current_qualification}". Mention it explicitly.
- Academic Score: ${sop.academic_score || "Not specified"}
${hasGapYears ? `- They have a ${sop.gap_years} year gap. Explain it professionally: "During this period, I upskilled in..." or use their reason: "${sop.motivation || 'relevant professional development'}"` : ""}

**Paragraph 3 (Professional Proof):** Detail their work experience/academic projects. If they mention any projects or skills, quantify results where possible (e.g., "Improved efficiency by 20%").

**Paragraph 4 (The Fit - "Why This Course"):** 
- Mention ${sop.university} by name at least 3 times throughout the SOP.
- Mention specific modules or research areas suitable for a ${sop.degree_level} level in ${sop.course}.
- Reference the ${sop.country}'s tech/industry landscape.
- Do NOT use vague phrases like "broaden my horizons". Use specific phrases like "The module on [Specific Subject] aligns with my goal to..."

**Paragraph 5 (Financial & Return - The Visa Winner):**
- Mention the sponsor: "My ${financialBackground === "Self" ? "personal savings" : financialBackground === "Father" ? "father" : financialBackground === "Mother" ? "mother" : financialBackground === "Loan" ? "education loan" : financialBackground?.toLowerCase() || "family"} supports me financially..."
- Mention the Return Plan: "After graduation, I intend to return to Pakistan to join the growing [Industry Name] sector. Companies like [Company A] and [Company B] are actively hiring..."
- This proves they will not stay illegally.

${hasRefusal ? `**Paragraph 6 (Visa Refusal - Handle Carefully):**
- They have a previous visa refusal. Address it positively by explaining changed circumstances and stronger documentation.
- Details: ${sop.future_goals?.split("|")[1]?.replace("Visa Refusal:", "").trim() || "Previous refusal"}` : ""}

#### STEP 2: THE AUTOMATED QUALITY ASSURANCE (The "Double Check")

CRITICAL: Before finalizing the SOP, perform this internal checklist. If any answer is "NO", rewrite that section immediately.

1. **Cliché Check:** Did I use words like "delve," "realm," "tapestry," "passionate about," "burgeoning," "unwavering," "embark," "journey," "firstly," "secondly," "in conclusion"? -> *Action: Replace with stronger verbs.*

2. **University Check:** Did I mention ${sop.university} at least 3 times? -> *Action: Insert if missing.*

3. **Visa Check:** (If Canada/Australia/UK) Did I say "I will return to Pakistan"? -> *Action: Add sentence if missing.*

4. **Flow Check:** Is the transition between paragraphs smooth? No bullet points - use flowing academic prose.

5. **Word Count Check:** Does the SOP meet the country-specific word count requirement?

### TONE RULES

- NO AI words: Delete 'delve', 'tapestry', 'realm', 'unwavering', 'embark', 'journey', 'passionate', 'firstly', 'secondly', 'in conclusion', 'burgeoning'.
- NO Bullet points in the final SOP. Use flowing academic prose.
- Write in ${englishLevel}.

### OUTPUT FORMAT

Present the result in this EXACT format:

**[INTERNAL QUALITY REPORT]**
* **Target:** ${sop.country} Style Applied
* **Word Count Status:** [State if ideal range met]
* **Visa Safe:** [Yes/No - Return intent included]
* **University Mentions:** [Count of ${sop.university} mentions]
* **Plagiarism Risk:** Low - Unique story integrated

---

**[FINAL STATEMENT OF PURPOSE]**

(The full, polished SOP text goes here, starting with the header)`;

    const userPrompt = `Generate the complete Statement of Purpose now using these EXACT details:

APPLICANT CONTACT:
- Full Name: ${sop.full_name || "Not provided"}
- Address: ${homeAddress}
- Phone: ${phoneNumber}
- Email: ${sop.email || "Not provided"}

TARGET:
- Country: ${sop.country}
- University: ${sop.university}
- Program: ${sop.course} (${sop.degree_level})

ACADEMIC PROFILE:
- Last Qualification: ${sop.current_qualification || "Not specified"}
- Academic Score: ${sop.academic_score || "Not specified"}
- English Score: ${sop.ielts_score || "Not specified"}
${hasGapYears ? `- Gap Years: ${sop.gap_years}` : ""}
${hasGapYears && sop.motivation ? `- Gap Reason/Story: ${sop.motivation}` : ""}
${!hasGapYears && hasPersonalStory ? `- Personal Story/Motivation: ${sop.motivation}` : ""}

FINANCIAL & FUTURE:
- Sponsor: ${financialBackground || "Family"}
- Future Plan: ${sop.future_goals?.split("|")[0]?.trim() || "Return to Pakistan and contribute to local industry"}
${hasRefusal ? `- Previous Refusal: ${sop.future_goals?.split("|")[1]?.replace("Visa Refusal:", "").trim()}` : ""}

Generate the SOP now. Include both the [INTERNAL QUALITY REPORT] and [FINAL STATEMENT OF PURPOSE] sections.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Failed to generate SOP");
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated");
    }

    console.log("SOP generated successfully, updating database...");

    // Update the SOP with generated content
    const { error: updateError } = await supabase
      .from("sops")
      .update({
        generated_content: generatedContent,
        status: "ready",
        updated_at: new Date().toISOString(),
      })
      .eq("id", sopId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw new Error("Failed to save generated SOP");
    }

    return new Response(
      JSON.stringify({ success: true, content: generatedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-sop function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
