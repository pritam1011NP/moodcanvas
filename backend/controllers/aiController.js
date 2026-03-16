const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const EMOTION_COLORS = {
  joy: "#F59E0B",
  trust: "#10B981",
  anticipation: "#F97316",
  surprise: "#8B5CF6",
  fear: "#6B7280",
  sadness: "#3B82F6",
  disgust: "#84CC16",
  anger: "#EF4444",
  neutral: "#9CA3AF"
};

async function analyzeJournalEntry(content) {
  const prompt = `You are an expert emotional intelligence analyst. Analyze the following journal entry and respond ONLY with a valid JSON object (no markdown, no explanation, no code fences).

Journal Entry:
"""
${content}
"""

Respond with this exact JSON structure:
{
  "primaryEmotion": "joy|sadness|anger|fear|surprise|disgust|anticipation|trust|neutral",
  "emotionIntensity": <0-100>,
  "sentimentScore": <-1.0 to 1.0>,
  "emotions": {
    "joy": <0-100>,
    "sadness": <0-100>,
    "anger": <0-100>,
    "fear": <0-100>,
    "surprise": <0-100>,
    "disgust": <0-100>,
    "anticipation": <0-100>,
    "trust": <0-100>
  },
  "themes": ["theme1", "theme2", "theme3"],
  "keywords": ["word1", "word2", "word3", "word4", "word5"],
  "summary": "<one sentence summary of the entry>",
  "aiReflection": "<2-3 sentences of empathetic, insightful reflection — supportive and thoughtful>",
  "energyLevel": "very_low|low|medium|high|very_high",
  "moodScore": <1-10>
}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are an emotional intelligence analyst. Always respond with valid JSON only. No markdown, no code fences, just raw JSON." },
      { role: "user", content: prompt }
    ]
  });

  const rawText = response.choices[0].message.content.trim();
  console.log("AI raw response:", rawText.substring(0, 200));
  const analysis = JSON.parse(rawText);

  return {
    analysis,
    canvasColor: EMOTION_COLORS[analysis.primaryEmotion] || EMOTION_COLORS.neutral
  };
}

async function generateWeeklyInsight(entries) {
  if (!entries || entries.length === 0) {
    return { report: "Not enough entries to generate a weekly insight." };
  }

  const entrySummaries = entries
    .map((e, i) => `Day ${i + 1} (${new Date(e.createdAt).toLocaleDateString()}): ${e.analysis?.summary || e.content.substring(0, 100)}... | Mood: ${e.analysis?.primaryEmotion || "unknown"} | Score: ${e.mood}/10`)
    .join("\n");

  const prompt = `You are a compassionate emotional wellness coach. Based on these journal entries from the past week, provide a warm, insightful weekly emotional report. Respond ONLY with a valid JSON object, no markdown, no code fences.

Journal Entries:
${entrySummaries}

Respond with:
{
  "weekSummary": "<2-3 sentence overview of the emotional week>",
  "dominantMood": "<the most prevalent emotion this week>",
  "emotionalTrend": "improving|declining|stable|mixed",
  "highlights": ["<positive moment or strength observed>", "<another highlight>"],
  "challenges": ["<challenge noticed>", "<another challenge if any>"],
  "recurringThemes": ["<theme>", "<theme>"],
  "coachMessage": "<3-4 sentences of warm, personalized coaching advice based on the week's patterns>",
  "actionSuggestion": "<one specific, actionable suggestion for next week>",
  "affirmation": "<a short, personalized affirmation based on what they wrote>"
}`;

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "You are a compassionate emotional wellness coach. Always respond with valid JSON only. No markdown, no code fences." },
      { role: "user", content: prompt }
    ]
  });

  const rawText = response.choices[0].message.content.trim();
  return JSON.parse(rawText);
}

module.exports = { analyzeJournalEntry, generateWeeklyInsight, EMOTION_COLORS };
