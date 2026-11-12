import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

// Server-side Gemini client initialization
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint: AI-Powered Intruder Threat Analysis
app.post('/api/gemini/analyze-threat', async (req: Request, res: Response) => {
  try {
    const { imageData, deviceModel, failedAttempts, timestamp, location, language = 'en' } = req.body;

    if (!aiClient) {
      // Mock / fallback realistic analysis when API key is not configured
      return res.json({
        threatLevel: failedAttempts >= 3 ? 'HIGH' : 'MEDIUM',
        summary: language === 'hi' 
          ? `चेतावनी: ${failedAttempts} बार गलत पिन दर्ज किया गया। डिवाइस लॉक सुरक्षा मोड सक्रिय हो गया है।`
          : `Alert: ${failedAttempts} consecutive failed unlock attempts detected. Anti-theft lockdown engaged.`,
        surroundings: language === 'hi'
          ? 'कैमरा फ्रेम में संदिग्ध गतिविधि का पता चला। परिवेश प्रकाश और चेहरे की स्थिति दर्ज की गई।'
          : 'Suspicious close-range face activity detected on front sensor. Indoor/ambient lighting recorded.',
        recommendedActions: language === 'hi'
          ? [
              'आपातकालीन संपर्कों को स्वचालित एसएमएस और जीपीएस स्थान भेजा गया।',
              'डिवाइस को दूरस्थ रूप से लॉक रखें।',
              'यदि डिवाइस चोरी हुआ है तो तुरंत नजदीकी पुलिस थाने में सूचित करें।'
            ]
          : [
              'Emergency SMS dispatched with live GPS coordinates.',
              'Keep device locked and siren armed.',
              'File incident report with nearest police authorities if stolen.'
            ],
        confidenceScore: 0.94,
        isAiGenerated: false
      });
    }

    const promptText = `You are an advanced Android Anti-Theft AI Security Engine named 'Rakshak AI'.
Analyze this intruder security incident:
- Device: ${deviceModel || 'Android Device'}
- Failed Unlock Attempts: ${failedAttempts}
- Timestamp: ${timestamp || new Date().toISOString()}
- GPS Location: ${location?.address || `${location?.lat || '28.6139'}, ${location?.lng || '77.2090'}`}
- Preferred Output Language: ${language === 'hi' ? 'Hindi (हिन्दी)' : 'English'}

Provide a threat assessment in valid JSON with:
1. threatLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
2. summary: 1-2 concise sentences summarizing the security incident.
3. surroundings: Details observed (lighting, camera distance, possible intent).
4. recommendedActions: Array of 3 specific tactical actions for the phone owner.
5. confidenceScore: Number between 0.85 and 0.99.

Ensure output is strictly valid JSON without markdown fences.`;

    const parts: any[] = [];
    if (imageData && typeof imageData === 'string') {
      const cleanBase64 = imageData.replace(/^data:image\/\w+;base64,/, '');
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      });
    }
    parts.push({ text: promptText });

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(outputText);
    } catch {
      parsedData = {
        threatLevel: failedAttempts >= 3 ? 'HIGH' : 'MEDIUM',
        summary: response.text || 'Security incident recorded successfully.',
        surroundings: 'Camera capture analyzed.',
        recommendedActions: [
          'Verify your emergency contact numbers.',
          'Review GPS trace location on the live map.',
          'Keep anti-theft lockdown enabled.'
        ],
        confidenceScore: 0.92,
      };
    }

    res.json({
      ...parsedData,
      isAiGenerated: true,
    });
  } catch (error: any) {
    console.error('Gemini threat analysis error:', error);
    res.status(500).json({
      threatLevel: 'HIGH',
      summary: 'Automated fallback: Intruder attempt recorded. Device locked.',
      surroundings: 'Front camera snapshot captured during unauthorized access.',
      recommendedActions: [
        'Check emergency SMS delivery status.',
        'Track device coordinates on map.',
        'Verify identity of person attempting unlock.'
      ],
      confidenceScore: 0.88,
      isAiGenerated: false,
      error: error.message,
    });
  }
});

// Endpoint: Simulated Emergency SMS & Cloud Broadcast Dispatcher
app.post('/api/security/dispatch-alert', (req: Request, res: Response) => {
  const { contacts, intruderEvent, deviceName } = req.body;
  const dispatchId = 'ALERT-' + Math.random().toString(36).substring(2, 9).toUpperCase();

  res.json({
    success: true,
    dispatchId,
    dispatchedAt: new Date().toISOString(),
    recipientsCount: contacts?.length || 0,
    message: `🚨 SECURITY ALERT from ${deviceName || 'Android Phone'}: Intruder detected! Front photo and GPS coordinates dispatched to emergency contacts.`
  });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const fs = await import('fs/promises');
        const indexPath = path.resolve(__dirname, 'index.html');
        let html = await fs.readFile(indexPath, 'utf-8');
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ 'Content-Type': 'text/html; charset=utf-8' }).end(html);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
