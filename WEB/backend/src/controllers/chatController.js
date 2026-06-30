const db = require('../config/db');

const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

const buildSiteContext = async () => {
  try {
    const [courses] = await db.query(`
      SELECT
        c.id,
        c.title,
        c.description,
        COUNT(l.id) AS lesson_count
      FROM courses c
      LEFT JOIN lessons l ON l.course_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT 20
    `);

    if (courses.length === 0) {
      return 'Current LMS data: There are no courses available yet.';
    }

    const courseIds = courses.map((course) => course.id);
    const [lessons] = await db.query(
      `
        SELECT course_id, title, lesson_order
        FROM lessons
        WHERE course_id IN (?)
        ORDER BY course_id ASC, lesson_order ASC
      `,
      [courseIds]
    );

    const lessonsByCourse = lessons.reduce((acc, lesson) => {
      if (!acc[lesson.course_id]) {
        acc[lesson.course_id] = [];
      }
      acc[lesson.course_id].push(lesson.title);
      return acc;
    }, {});

    const courseLines = courses.map((course) => {
      const lessonTitles = (lessonsByCourse[course.id] || []).slice(0, 5);
      const lessonText = lessonTitles.length > 0
        ? ` Lessons: ${lessonTitles.join('; ')}.`
        : '';

      return `- ${course.title}: ${course.description} (${course.lesson_count} lessons).${lessonText}`;
    });

    return [
      'Current LMS data. Use this data when answering questions about this website, courses, lessons, features, or learning content.',
      `Available courses: ${courses.length}.`,
      ...courseLines,
      'Main website features: register/login, browse courses, view course details, enroll in courses, track learning progress, manage profile, admin course/user management.'
    ].join('\n');
  } catch (error) {
    console.error('Failed to build LMS context for chatbot:', error.message);
    return 'Current LMS data is temporarily unavailable. If asked about website data, explain that the course database could not be read right now.';
  }
};

const buildGeminiContents = (history = [], message) => {
  const historyContents = history.slice(-10).map((item) => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(item.content || '').trim() }],
  }));

  return [
    ...historyContents.filter((item) => item.parts[0].text),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ];
};

const extractGeminiText = (data) => {
  const candidates = Array.isArray(data.candidates) ? data.candidates : [];
  const candidate = candidates[0];
  const parts = candidate?.content?.parts;

  if (Array.isArray(parts)) {
    let text = parts
      .map((part) => part.text)
      .filter(Boolean)
      .join('\n')
      .trim();

    if (text) {
      if (candidate.finishReason === 'MAX_TOKENS') {
        text += '\n\n[Cau tra loi bi cat ngan do gioi han do dai. Ban co the nhan "tiep tuc" de toi noi tiep.]';
      }

      return text;
    }
  }

  return 'Toi da nhan duoc tin nhan, nhung chua tao duoc cau tra loi ro rang.';
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    const trimmedMessage = String(message || '').trim();

    if (!trimmedMessage) {
      const err = new Error('Message is required');
      err.statusCode = 400;
      throw err;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return res.status(200).json({
        success: true,
        reply: 'Gemini AI chua duoc cau hinh. Hay thay GEMINI_API_KEY trong file WEB/backend/.env bang API key that, roi restart server.'
      });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const maxOutputTokens = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 1600);
    const url = `${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${apiKey}`;
    const siteContext = await buildSiteContext();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                `You are a helpful AI learning assistant inside an e-learning LMS. Answer clearly, be concise, and prefer Vietnamese when the student writes Vietnamese.

You can answer questions about this LMS website using the context below. If a user asks what courses, lessons, or features the website has, answer from this context. Do not say you cannot access the website when the answer is present in the context.

${siteContext}`
            }
          ]
        },
        contents: buildGeminiContents(history, trimmedMessage),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const err = new Error(data.error?.message || 'Gemini AI request failed');
      err.statusCode = response.status;
      throw err;
    }

    res.status(200).json({
      success: true,
      reply: extractGeminiText(data)
    });
  } catch (error) {
    next(error);
  }
};
