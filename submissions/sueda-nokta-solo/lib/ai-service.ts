import type { SlopResult } from '@/constants/slop-types';

const GROQ_API_KEY = "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";
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 5000;

function normalizeSeverity(severity: string): 'Critical' | 'High' | 'Medium' | 'Low' {
  const candidate = severity.toLowerCase();
  if (candidate === 'critical') return 'Critical';
  if (candidate === 'high') return 'High';
  if (candidate === 'medium') return 'Medium';
  return 'Low';
}

function parseModelJson(rawText: string): SlopResult {
  let payload = rawText.trim();
  
  const match = payload.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (match) {
    payload = match[1].trim();
  } else {
    const firstBrace = payload.indexOf('{');
    const lastBrace = payload.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      payload = payload.substring(firstBrace, lastBrace + 1);
    }
  }

  const parsed = JSON.parse(payload) as Partial<SlopResult>;

  if (
    typeof parsed.slop_score !== 'number' ||
    typeof parsed.is_slop !== 'boolean' ||
    typeof parsed.analysis !== 'string' ||
    !Array.isArray(parsed.flaws) ||
    !Array.isArray(parsed.engineering_questions)
  ) {
    throw new Error('Groq response is not in expected schema.');
  }

  return {
    slop_score: Math.max(0, Math.min(100, Math.round(parsed.slop_score))),
    is_slop: parsed.is_slop,
    analysis: parsed.analysis,
    flaws: parsed.flaws.map((item) => ({
      type: typeof item.type === 'string' ? item.type : 'Belirsiz Kusur',
      description: typeof item.description === 'string' ? item.description : 'Aciklama saglanmadi.',
      severity: normalizeSeverity(typeof item.severity === 'string' ? item.severity : 'Low'),
    })),
    engineering_questions: parsed.engineering_questions.map((item) => ({
      question: typeof item.question === 'string' ? item.question : 'Soru uretilmedi.',
      why_critical:
        typeof item.why_critical === 'string'
          ? item.why_critical
          : 'Bu alan model tarafindan doldurulamadi.',
      severity: normalizeSeverity(typeof item.severity === 'string' ? item.severity : 'Low'),
    })),
  };
}

export async function analyzeIdeaWithAiService(ideaText: string): Promise<SlopResult> {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('Groq API key is missing.');
    }

    const prompt = `
"Sen acımasız ve son derece zeki, Y-Combinator tarzı bir baş mühendissin. Görevin gelen girişim fikirlerindeki 'Slop'u (aşırı mühendislik, uydurma blockchain/AI kelimeleri, gerçek dünya faydasından uzak süslü laflar) tespit etmektir.
1. Fikre meydan oku: 'Blockchain' veya 'AI' gibi buzzword'ler varsa, BUNLARA NEDEN İHTİYAÇ OLDUĞUNU sertçe sorgula. Yoksa direkt puan kır.
2. Spesifik Analiz: Asla genelgeçer hatalar sunma. Örneğin 'Kedi Yüz Tanıma' fikriyse, spesifik olarak kedilerin yüz hatlarının çıkarım zorluğunu ve donanım maliyetini eleştir.
ÇOK ÖNEMLİ: Yanıtlarını kesinlikle kusursuz ve tam Türkçe karakterler (ç, ş, ğ, ü, ö, ı) kullanarak ver. Başka bir dil kullanma."

Beklenen schema:
{
  "slop_score": number (0-100),
  "is_slop": boolean,
  "analysis": string,
  "flaws": [
    { "type": string, "description": string, "severity": "Critical" | "High" | "Medium" | "Low" }
  ],
  "engineering_questions": [
    { "question": string, "why_critical": string, "severity": "Critical" | "High" | "Medium" | "Low" }
  ]
}

Kurallar:
- En az 3 flaw ver.
- En az 2 engineering question ver.
- Dil Turkce olsun.
- KESİNLİKLE Markdown kullanma, obje değerlerinde (örn. description, question) *, ** veya madde işaretleri bulunmamalıdır. Düz metin kullan.

Fikir:
${ideaText}
`.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.3,
          messages: [
            {
              role: 'system',
              content: 'Sen acımasız bir baş mühendissin. Aşırı mühendisliği ve buzzword (AI, Blockchain vb.) kullanımını tespit etmek temel görevin. Yanıtlarında UTF-8 Türkçe karakterler (ç, ş, ğ, ü, ö, ı) kullanmalısın. You must return ONLY a raw, valid JSON object. DO NOT output any Markdown formatting (like * or **), bullet points, conversational text, or code blocks. The response must start with { and end with }.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq request failed (${response.status}): ${errorText}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) {
      throw new Error('Groq response was empty.');
    }

    return parseModelJson(rawText);
  } catch (error) {
    const resolvedError =
      error instanceof Error ? error : new Error('Bilinmeyen bir API hatasi olustu.');

    if (
      resolvedError.name === 'TypeError' &&
      /fetch|network|failed|cors/i.test(resolvedError.message)
    ) {
      console.error('Groq API request error (possible CORS/network issue in browser):', resolvedError);
    } else {
      console.error('Groq API request error:', resolvedError);
    }

    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`API Hatasi: ${resolvedError.message}`);
    }

    throw resolvedError;
  }
}
