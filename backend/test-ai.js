require("dotenv").config();
const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  console.log("🔑 Groq Key loaded:", process.env.GROQ_API_KEY ? "YES (" + process.env.GROQ_API_KEY.substring(0, 10) + "...)" : "NO - MISSING!");

  const testContent = "Today was really exhausting. I had a huge argument with my colleague and it left me feeling frustrated and drained. I couldn't focus on anything after that. I just want things to go back to normal.";

  console.log("\n📝 Testing Groq AI analysis...\n");

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 512,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are an emotional intelligence analyst. Always respond with valid JSON only." },
        { role: "user", content: `Analyze this journal entry and return JSON with: primaryEmotion (joy/sadness/anger/fear/surprise/disgust/anticipation/trust/neutral), moodScore (1-10), sentimentScore (-1 to 1), aiReflection (2-3 empathetic sentences). Entry: "${testContent}"` }
      ]
    });

    const result = JSON.parse(response.choices[0].message.content);
    console.log("✅ Groq works! It's FREE!");
    console.log("🎭 Primary Emotion:", result.primaryEmotion);
    console.log("📊 Mood Score:", result.moodScore);
    console.log("💬 Reflection:", result.aiReflection);
    console.log("\n🎉 Now:");
    console.log("1. Restart backend:  npm run dev");
    console.log("2. Run reanalyze command in a new terminal");
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    if (err.status === 401) console.log("→ Invalid Groq API key. Check your .env file.");
    if (err.status === 429) console.log("→ Rate limit hit. Wait a moment and try again.");
  }
}

test();
