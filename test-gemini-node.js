const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        process.env[key] = val;
      }
    });
  }
}

loadEnv();

console.log("=============================================");
console.log("CEREBRO GEMINI API DIAGNOSTIC");
console.log("=============================================");
console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is missing in your .env.local file!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testEmbedding() {
  console.log("\n1. Testing Text Embedding (embedding-001)...");
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent("Test string for vector embedding");
    console.log("✅ SUCCESS: Embedding generated! Dimension:", result.embedding.values.length);
    return true;
  } catch (err) {
    console.error("❌ EMBEDDING FAILED!");
    console.error("Error Status:", err.status);
    console.error("Error Message:", err.message || err);
    if (err.status === 400 || err.message?.includes('key')) {
      console.log("\n💡 SUGGESTION: Your GEMINI_API_KEY appears to be invalid or deactivated. Please get a fresh key from https://aistudio.google.com");
    } else if (err.status === 403 || err.message?.includes('Location')) {
      console.log("\n💡 SUGGESTION: The Gemini API is not supported in your current geographic location/IP. Try using a VPN set to USA or UK.");
    }
    return false;
  }
}

async function testChat() {
  console.log("\n2. Testing Chat Generation (gemini-1.5-flash)...");
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Hello, respond in 3 words.");
    console.log("✅ SUCCESS: Gemini Chat responded:", result.response.text().trim());
    return true;
  } catch (err) {
    console.error("❌ CHAT GENERATION FAILED!");
    console.error("Error Status:", err.status);
    console.error("Error Message:", err.message || err);
    return false;
  }
}

async function run() {
  const embOk = await testEmbedding();
  const chatOk = await testChat();
  console.log("\n=============================================");
  if (embOk && chatOk) {
    console.log("🎉 ALL TESTS PASSED! Your API connection is fully working.");
  } else {
    console.log("❌ DIAGNOSTIC DETECTED AN ISSUE. Please check the suggestions above.");
  }
  console.log("=============================================");
}

run();
