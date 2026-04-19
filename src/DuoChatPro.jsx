import { useState, useRef, useEffect, useCallback } from "react";

/* ───────────────────── CONSTANTS ───────────────────── */
const LANGUAGES = [
  { code: "ja", name: "Japanese", flag: "🇯🇵", native: "日本語" },
  { code: "es", name: "Spanish", flag: "🇪🇸", native: "Español" },
  { code: "fr", name: "French", flag: "🇫🇷", native: "Français" },
  { code: "de", name: "German", flag: "🇩🇪", native: "Deutsch" },
];
const GOALS_BASE = [
  { id: "career", label: "Career", icon: "💼", desc: "Job interviews, meetings, emails" },
  { id: "relocation", label: "Relocation", icon: "🏠", desc: "Daily life, admin, neighbors" },
  { id: "travel", label: "Travel", icon: "✈️", desc: "Navigation, ordering, small talk" },
];
const EXAM_BY_LANG = {
  ja: { id: "exam", label: "JLPT Prep", icon: "📝", desc: "JLPT N5–N1 exam preparation", examName: "JLPT" },
  es: { id: "exam", label: "DELE Prep", icon: "📝", desc: "DELE A1–C2 exam preparation", examName: "DELE" },
  fr: { id: "exam", label: "DELF/DALF Prep", icon: "📝", desc: "DELF A1–B2 / DALF C1–C2 preparation", examName: "DELF/DALF" },
  de: { id: "exam", label: "Goethe Prep", icon: "📝", desc: "Goethe-Zertifikat A1–C2 preparation", examName: "Goethe-Zertifikat" },
};
function getGoals(langCode) {
  const exam = EXAM_BY_LANG[langCode];
  return exam ? [...GOALS_BASE, exam] : GOALS_BASE;
}
const LEVELS = [
  { id: "beginner", label: "Beginner", cefr: "A1-A2" },
  { id: "intermediate", label: "Intermediate", cefr: "B1-B2" },
  { id: "advanced", label: "Advanced", cefr: "C1-C2" },
];

const GRAMMAR_CAPSULES = {
  ja: [
    { id: "wa-ga", title: "は vs が", subtitle: "Topic vs Subject markers", rule: "は (wa) marks the topic of a sentence — what you're talking about. が (ga) marks the subject — who/what performs the action. Use は for known/general info, が for new/specific info or emphasis.", examples: [
      { target: "私は学生です。", english: "I am a student. (I = topic being discussed)" },
      { target: "誰が来ましたか？", english: "Who came? (が marks unknown subject)" },
      { target: "猫は魚が好きです。", english: "Cats like fish. (cats = topic, fish = subject of liking)" }
    ], quizzes: [
      { question: "Fill in: 田中さん___先生です。(Tanaka is a teacher - introducing)", options: ["は", "が", "を", "に"], answer: 0 },
      { question: "誰___来ましたか？(Who came? - unknown subject)", options: ["は", "が", "を", "に"], answer: 1 },
      { question: "私___日本語を話します。(I speak Japanese - general topic)", options: ["は", "が", "を", "に"], answer: 0 },
    ]},
    { id: "te-form", title: "て-form Verbs", subtitle: "Connecting actions & requests", rule: "て-form is used to connect verbs (and then...), make requests (please do...), and for ongoing states. Formation depends on verb group: う→って, く→いて, す→して, etc.", examples: [
      { target: "食べて寝ました。", english: "I ate and then slept." },
      { target: "ここに座ってください。", english: "Please sit here." },
      { target: "今、本を読んでいます。", english: "I am reading a book now." }
    ], quizzes: [
      { question: "Convert 書く (to write) to て-form:", options: ["書いて", "書って", "書して", "書ちて"], answer: 0 },
      { question: "Convert 飲む (to drink) to て-form:", options: ["飲いて", "飲して", "飲んで", "飲って"], answer: 2 },
      { question: "Convert 話す (to speak) to て-form:", options: ["話って", "話いて", "話んで", "話して"], answer: 3 },
    ]},
    { id: "particles", title: "Core Particles", subtitle: "を・に・で・へ", rule: "を marks the direct object. に marks destination, time, or indirect object. で marks location of action or means. へ marks direction of movement.", examples: [
      { target: "水を飲みます。", english: "I drink water. (を = object)" },
      { target: "学校に行きます。", english: "I go to school. (に = destination)" },
      { target: "図書館で勉強します。", english: "I study at the library. (で = location of action)" }
    ], quizzes: [
      { question: "レストラン___食べます。(I eat at a restaurant)", options: ["で", "に", "を", "は"], answer: 0 },
      { question: "リンゴ___食べます。(I eat an apple - direct object)", options: ["で", "に", "を", "は"], answer: 2 },
      { question: "図書館___本を読みます。(I read a book at the library)", options: ["に", "へ", "を", "で"], answer: 3 },
    ]},
    { id: "keigo", title: "Keigo (Politeness)", subtitle: "Formal speech for work & life", rule: "Japanese has 3 politeness levels: casual (友達), polite/です-ます (standard), and honorific/humble keigo (business). Keigo uses special verb forms to show respect.", examples: [
      { target: "食べる → 食べます → 召し上がる", english: "eat (casual → polite → honorific)" },
      { target: "いる → います → いらっしゃる", english: "exist/be (casual → polite → honorific)" },
      { target: "する → します → なさる", english: "do (casual → polite → honorific)" }
    ], quizzes: [
      { question: "Which is the humble form of 行く (to go)?", options: ["参ります", "いらっしゃいます", "行きます", "おります"], answer: 0 },
      { question: "Which is the honorific form of 食べる (to eat)?", options: ["いただく", "食べます", "召し上がる", "おります"], answer: 2 },
      { question: "Which is the humble form of 食べる (to eat)?", options: ["召し上がる", "食べます", "いただく", "なさる"], answer: 2 },
    ]},
  ],
  es: [
    { id: "ser-estar", title: "Ser vs Estar", subtitle: "Two verbs 'to be'", rule: "Ser = permanent traits, identity, origin, time. Estar = temporary states, location, emotions, conditions. Think: ser = what it IS, estar = how it FEELS or where it IS.", examples: [
      { target: "Ella es profesora.", english: "She is a teacher. (permanent role)" },
      { target: "Ella está cansada.", english: "She is tired. (temporary state)" },
      { target: "La fiesta es en mi casa.", english: "The party is at my house. (event location = ser)" }
    ], quizzes: [
      { question: "La comida ___ deliciosa. (The food tastes delicious right now)", options: ["es", "está", "ser", "estar"], answer: 1 },
      { question: "Madrid ___ en España. (Madrid is in Spain - location)", options: ["es", "está", "ser", "estar"], answer: 1 },
      { question: "Ella ___ médica. (She is a doctor - permanent role)", options: ["está", "estás", "es", "eres"], answer: 2 },
    ]},
    { id: "subjunctive", title: "Subjunctive Mood", subtitle: "Wishes, doubts & emotions", rule: "Use subjunctive after expressions of wish (quiero que), doubt (dudo que), emotion (me alegra que), and impersonal expressions (es importante que). The subjunctive changes verb endings.", examples: [
      { target: "Quiero que vengas.", english: "I want you to come." },
      { target: "Dudo que llueva.", english: "I doubt it will rain." },
      { target: "Es importante que estudies.", english: "It's important that you study." }
    ], quizzes: [
      { question: "Espero que tú ___ bien. (I hope you are well)", options: ["estés", "estás", "eres", "seas"], answer: 0 },
      { question: "Es importante que nosotros ___ (hablar)", options: ["hablamos", "habláis", "hablemos", "hablan"], answer: 2 },
      { question: "Dudo que él ___ la verdad. (I doubt he knows - saber)", options: ["sabe", "sabía", "supo", "sepa"], answer: 3 },
    ]},
    { id: "por-para", title: "Por vs Para", subtitle: "Two words for 'for'", rule: "Por = because of, through, duration, exchange. Para = purpose, destination, deadline, recipient. Mnemonic: Para points forward (goal), Por looks back (cause).", examples: [
      { target: "Gracias por tu ayuda.", english: "Thanks for your help. (cause)" },
      { target: "Este regalo es para ti.", english: "This gift is for you. (recipient)" },
      { target: "Estudié por tres horas.", english: "I studied for three hours. (duration)" }
    ], quizzes: [
      { question: "Trabajo ___ vivir. (I work in order to live - purpose)", options: ["para", "por", "a", "de"], answer: 0 },
      { question: "Pagué 50 euros ___ este libro. (I paid 50 euros for this book - exchange)", options: ["para", "a", "de", "por"], answer: 3 },
      { question: "Te llamo ___ darte las gracias. (I call you to thank you - purpose)", options: ["por", "de", "para", "a"], answer: 2 },
    ]},
  ],
  fr: [
    { id: "passe-compose", title: "Passé Composé", subtitle: "Past tense with avoir/être", rule: "Formed with avoir or être + past participle. Use être with movement/state verbs (aller, venir, naître...) and all reflexive verbs. With être, participle agrees in gender/number.", examples: [
      { target: "J'ai mangé une pomme.", english: "I ate an apple. (avoir + mangé)" },
      { target: "Elle est allée au cinéma.", english: "She went to the cinema. (être + allée, feminine agreement)" },
      { target: "Nous nous sommes levés.", english: "We got up. (reflexive = être)" }
    ], quizzes: [
      { question: "Elle ___ partie hier. (She left yesterday - être verb)", options: ["est", "a", "ai", "ont"], answer: 0 },
      { question: "J'___ mangé une pizza. (I ate a pizza - avoir verb)", options: ["suis", "es", "ai", "est"], answer: 2 },
      { question: "Ils ___ arrivés hier soir. (They arrived last night - être, plural)", options: ["ont", "ai", "est", "sont"], answer: 3 },
    ]},
    { id: "subjonctif", title: "Le Subjonctif", subtitle: "Expressing wishes & doubt", rule: "Used after expressions of desire (vouloir que), emotion (je suis content que), doubt (douter que), and necessity (il faut que). Formed from ils/elles present stem + -e, -es, -e, -ions, -iez, -ent.", examples: [
      { target: "Il faut que tu viennes.", english: "You must come." },
      { target: "Je veux que vous sachiez.", english: "I want you to know." },
      { target: "Je doute qu'il puisse venir.", english: "I doubt he can come." }
    ], quizzes: [
      { question: "Il faut que je ___ (faire)", options: ["fasse", "fais", "fait", "fera"], answer: 0 },
      { question: "Je veux que tu ___ (venir)", options: ["viens", "viendrais", "viennes", "venais"], answer: 2 },
      { question: "Je suis content que vous ___ ici. (être - subjunctive)", options: ["êtes", "serez", "étiez", "soyez"], answer: 3 },
    ]},
  ],
  de: [
    { id: "cases", title: "German Cases", subtitle: "Nominative, Accusative, Dative, Genitive", rule: "Nominative = subject. Accusative = direct object. Dative = indirect object. Genitive = possession. Articles change: der/die/das (nom) → den/die/das (acc) → dem/der/dem (dat).", examples: [
      { target: "Der Mann sieht den Hund.", english: "The man sees the dog. (der→den in accusative)" },
      { target: "Ich gebe dem Kind das Buch.", english: "I give the child the book. (dem = dative)" },
      { target: "Das Auto des Mannes.", english: "The man's car. (des = genitive)" }
    ], quizzes: [
      { question: "Ich helfe ___ Frau. (I help the woman - dative)", options: ["der", "die", "den", "das"], answer: 0 },
      { question: "Ich sehe ___ Mann. (I see the man - accusative)", options: ["der", "des", "dem", "den"], answer: 3 },
      { question: "Das ist das Auto ___ Mannes. (The man's car - genitive)", options: ["der", "den", "des", "dem"], answer: 2 },
    ]},
    { id: "word-order", title: "Word Order (V2 Rule)", subtitle: "Verb always in second position", rule: "In main clauses, the conjugated verb must be in the SECOND position. In subordinate clauses (weil, dass, wenn...), the verb moves to the END.", examples: [
      { target: "Heute gehe ich ins Kino.", english: "Today I go to the cinema. (verb 2nd, subject shifts)" },
      { target: "Ich weiß, dass er kommt.", english: "I know that he is coming. (verb at end in sub-clause)" },
      { target: "Weil ich müde bin, schlafe ich.", english: "Because I'm tired, I sleep. (verb-end, then V2)" }
    ], quizzes: [
      { question: "Morgen ___ wir nach Berlin. (Tomorrow we go to Berlin - V2)", options: ["fahren", "wir fahren", "fahren wir", "gehen"], answer: 0 },
      { question: "Ich weiß, dass er nach Hause ___ (gehen - sub-clause)", options: ["er geht", "gehen", "geht", "gegangen"], answer: 2 },
      { question: "Weil es regnet, ___ ich zu Hause. (V2 after sub-clause)", options: ["ich bleibe", "bleiben", "bleibe ich", "geblieben"], answer: 2 },
    ]},
  ],
};

const ROLEPLAY_SCENARIOS = {
  career: [
    { id: "interview", title: "Job Interview", icon: "🤝", desc: "Practice answering interview questions professionally", aiRole: "You are a hiring manager at a tech company conducting a job interview." },
    { id: "meeting", title: "Team Meeting", icon: "📊", desc: "Present ideas and discuss projects with colleagues", aiRole: "You are a colleague in a weekly team meeting discussing project updates." },
    { id: "email-call", title: "Client Call", icon: "📞", desc: "Handle a client inquiry about your services", aiRole: "You are a potential client calling to inquire about services." },
  ],
  relocation: [
    { id: "apartment", title: "Apartment Hunting", icon: "🏠", desc: "Tour an apartment and negotiate with the landlord", aiRole: "You are a landlord showing an apartment to a potential tenant." },
    { id: "city-hall", title: "City Hall Registration", icon: "🏛️", desc: "Register your address at the local municipal office", aiRole: "You are a government clerk helping someone register their address." },
    { id: "doctor", title: "Doctor's Visit", icon: "🏥", desc: "Describe symptoms and understand medical advice", aiRole: "You are a doctor seeing a new patient for the first time." },
  ],
  travel: [
    { id: "restaurant", title: "Restaurant Order", icon: "🍽️", desc: "Order food, ask about the menu, handle dietary needs", aiRole: "You are a waiter at a local restaurant." },
    { id: "directions", title: "Asking Directions", icon: "🗺️", desc: "Navigate a new city and ask locals for help", aiRole: "You are a friendly local giving directions to a tourist." },
    { id: "hotel", title: "Hotel Check-in", icon: "🏨", desc: "Check into a hotel and resolve a booking issue", aiRole: "You are a hotel receptionist handling check-in." },
  ],
  exam: {
    ja: [
      { id: "jlpt-listening", title: "JLPT Listening Practice", icon: "🎧", desc: "Understand conversations and pick the correct response", aiRole: "You are a JLPT listening test simulator. Present a short dialogue scenario in Japanese, then ask the learner what was said or what should be said next." },
      { id: "jlpt-grammar", title: "JLPT Grammar Drill", icon: "📐", desc: "Practice N5–N3 grammar patterns in context", aiRole: "You are a JLPT grammar tutor. Present sentences with blanks and ask the learner to fill in the correct grammar pattern. Start at their level and gradually increase difficulty." },
      { id: "jlpt-reading", title: "JLPT Reading Comprehension", icon: "📄", desc: "Read short passages and answer questions", aiRole: "You are a JLPT reading test simulator. Present a short passage in Japanese (appropriate to learner level) and ask comprehension questions about it." },
    ],
    es: [
      { id: "dele-oral", title: "DELE Oral Exam", icon: "🎓", desc: "Simulated DELE speaking test with picture descriptions", aiRole: "You are a DELE oral examiner. Present a scenario or image description and ask the candidate to describe it, give opinions, and answer follow-up questions in Spanish." },
      { id: "dele-writing", title: "DELE Writing Prompt", icon: "✍️", desc: "Practice formal/informal letter and essay writing", aiRole: "You are a DELE writing tutor. Give the learner a writing prompt (email, letter, or short essay) and evaluate their response for grammar, vocabulary, and structure." },
      { id: "dele-grammar", title: "DELE Grammar Focus", icon: "📐", desc: "Subjunctive, ser/estar, por/para in exam context", aiRole: "You are a DELE grammar tutor. Present contextualized grammar exercises focusing on common DELE exam patterns." },
    ],
    fr: [
      { id: "delf-oral", title: "DELF Oral Production", icon: "🎓", desc: "Simulated DELF speaking tasks with monologue + dialogue", aiRole: "You are a DELF oral examiner. First ask the candidate to introduce themselves, then present a role-play scenario for interactive dialogue practice." },
      { id: "delf-writing", title: "DELF Written Production", icon: "✍️", desc: "Practice writing emails, articles, and formal letters", aiRole: "You are a DELF writing tutor. Present a writing task appropriate to the learner's level and give feedback on their response." },
      { id: "delf-comprehension", title: "DELF Comprehension", icon: "📄", desc: "Read/listen and answer structured questions", aiRole: "You are a DELF comprehension tutor. Present a short text in French and ask comprehension questions about main ideas, details, and vocabulary." },
    ],
    de: [
      { id: "goethe-sprechen", title: "Goethe Sprechen", icon: "🎓", desc: "Simulated Goethe oral exam: presentation + discussion", aiRole: "You are a Goethe-Zertifikat oral examiner. Ask the candidate to present on a topic, then engage in a structured discussion with follow-up questions." },
      { id: "goethe-schreiben", title: "Goethe Schreiben", icon: "✍️", desc: "Practice formal emails, opinions, and structured writing", aiRole: "You are a Goethe writing tutor. Present a writing task (formal email, opinion piece, or structured response) and evaluate the learner's German." },
      { id: "goethe-grammar", title: "Goethe Grammar Focus", icon: "📐", desc: "Cases, word order, Konjunktiv II in exam context", aiRole: "You are a Goethe grammar tutor. Present contextualized grammar exercises focusing on common Goethe exam patterns like cases, word order, and Konjunktiv II." },
    ],
  },
};

/* ───────────────────── LANGUAGE EXCHANGE DATA ───────────────────── */
const EXCHANGE_USERS = {
  ja: [
    { id: "ja1", name: "Akira", avatar: "👨‍💻", nativeFlag: "🇯🇵", nativeLang: "Japanese", learningFlag: "🇺🇸", learningLang: "English", level: "B1", online: true, bio: "Software dev, love anime & travel!" },
    { id: "ja2", name: "Yuki", avatar: "👩‍🎨", nativeFlag: "🇯🇵", nativeLang: "Japanese", learningFlag: "🇺🇸", learningLang: "English", level: "A2", online: true, bio: "Art student, into music and coffee." },
    { id: "ja3", name: "Kenji", avatar: "👨‍🍳", nativeFlag: "🇯🇵", nativeLang: "Japanese", learningFlag: "🇬🇧", learningLang: "English", level: "B2", online: false, bio: "Chef, want to work abroad someday." },
  ],
  es: [
    { id: "es1", name: "Sofia", avatar: "👩‍🎓", nativeFlag: "🇪🇸", nativeLang: "Spanish", learningFlag: "🇺🇸", learningLang: "English", level: "B1", online: true, bio: "Med student, love salsa dancing!" },
    { id: "es2", name: "Carlos", avatar: "👨‍🏫", nativeFlag: "🇲🇽", nativeLang: "Spanish", learningFlag: "🇺🇸", learningLang: "English", level: "A2", online: true, bio: "Teacher, football fan & foodie." },
    { id: "es3", name: "Valentina", avatar: "👩‍💼", nativeFlag: "🇦🇷", nativeLang: "Spanish", learningFlag: "🇫🇷", learningLang: "French", level: "B2", online: false, bio: "Marketing, loves hiking & yoga." },
  ],
  fr: [
    { id: "fr1", name: "Léa", avatar: "👩‍🎤", nativeFlag: "🇫🇷", nativeLang: "French", learningFlag: "🇺🇸", learningLang: "English", level: "B2", online: true, bio: "Music lover, pastry chef hobbyist." },
    { id: "fr2", name: "Hugo", avatar: "👨‍🔬", nativeFlag: "🇧🇪", nativeLang: "French", learningFlag: "🇺🇸", learningLang: "English", level: "A2", online: false, bio: "PhD student in chemistry, into films." },
  ],
  de: [
    { id: "de1", name: "Mia", avatar: "👩‍🚀", nativeFlag: "🇩🇪", nativeLang: "German", learningFlag: "🇺🇸", learningLang: "English", level: "B1", online: true, bio: "Engineer, love hiking & board games." },
    { id: "de2", name: "Felix", avatar: "👨‍🎸", nativeFlag: "🇦🇹", nativeLang: "German", learningFlag: "🇯🇵", learningLang: "Japanese", level: "A1", online: true, bio: "Musician, obsessed with Japanese culture." },
  ],
};
const EXCHANGE_THEMES = {
  ja: [
    { theme: "🍣 Food & Eating", vocab: ["美味しい (oishii) = delicious", "いただきます (itadakimasu) = let's eat", "おすすめ (osusume) = recommendation"] },
    { theme: "🚆 Transport & Travel", vocab: ["電車 (densha) = train", "乗り換え (norikae) = transfer", "切符 (kippu) = ticket"] },
    { theme: "💼 Work & Study", vocab: ["残業 (zangyou) = overtime", "締め切り (shimekiri) = deadline", "会議 (kaigi) = meeting"] },
  ],
  es: [
    { theme: "🌮 Food & Eating", vocab: ["¿Me puede traer la cuenta? = Can I have the bill?", "Está riquísimo = It's delicious", "Para llevar = To go"] },
    { theme: "🏙️ City Life", vocab: ["¿Dónde está...? = Where is...?", "A la vuelta = Around the corner", "El semáforo = Traffic light"] },
    { theme: "👨‍👩‍👧 Family & Social", vocab: ["¿Cómo te va? = How's it going?", "Me cae bien = I like them", "Hace mucho que no te veo = Long time no see"] },
  ],
  fr: [
    { theme: "☕ Café Culture", vocab: ["Un café allongé = Long black coffee", "L'addition, s'il vous plaît = The bill please", "C'est sympa ici = It's nice here"] },
    { theme: "🗼 City & Tourism", vocab: ["C'est par où? = Which way is it?", "Un aller-retour = Return ticket", "L'entrée est gratuite = Entry is free"] },
  ],
  de: [
    { theme: "🍺 Social & Going Out", vocab: ["Prost! = Cheers!", "Auf dich! = To you!", "Die Runde geht auf mich = This round's on me"] },
    { theme: "🚂 Transport", vocab: ["Der Anschluss = Connection (train)", "Gleis drei = Platform three", "Verspätung = Delay"] },
  ],
};

/* ───────────────────── STYLES ───────────────────── */
const FONT = "'Nunito', sans-serif";
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes typingBounce { 0%,60%,100% { transform:translateY(0); } 30% { transform:translateY(-6px); } }
@keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.04); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
input:focus, button:focus, textarea:focus { outline: none; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #3B3B5D; border-radius: 4px; }

/* Force text colors for specific elements */
.language-name { color: #58CC02 !important; }
.chat-header h1 { color: #58CC02 !important; }
.chat-subtitle { color: #89E219 !important; }
`;

/* ───────────────────── HELPERS ───────────────────── */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSystemPrompt(lang, goal, level, mode, extra) {
  const ln = LANGUAGES.find(l => l.code === lang)?.name;
  const gl = getGoals(lang).find(g => g.id === goal);
  const lv = LEVELS.find(l => l.id === level);
  let base = `You are Junior 🦉, a warm and encouraging AI language tutor on Duolingo. User is learning ${ln} at ${lv?.label} (${lv?.cefr}) for ${gl?.label} purposes.
RULES:
- Respond concisely (2-3 sentences max). This is chat, not a lecture.
- When user makes a grammar/vocabulary mistake: acknowledge naturally, then add: [CORRECTION: wrong → correct | Brief English explanation]
- Every 4-5 messages introduce: [NEW WORD: word (reading) = meaning]
- If user is stuck (English, short answers, "I don't know"): simplify, provide the phrase they need, encourage.
- Be warm, use occasional emoji, celebrate attempts. Never break character.`;
  if (level === "beginner") {
    base += `\n- BEGINNER BILINGUAL MODE: After every sentence in ${ln}, immediately add [EN: English translation] on the same line. Example: "今日は！[EN: Hello!] 元気ですか？[EN: How are you?]". Always pair every target-language sentence with its English translation this way.`;
  }
  if (mode === "roleplay" && extra) {
    base += `\n\nROLEPLAY MODE: ${extra.aiRole} Stay in character. Conduct the scenario naturally in ${ln}. Guide the user through the interaction. If they struggle, offer prompts in ${ln} with English hints.`;
  }
  if (mode === "grammar" && extra) {
    base += `\n\nGRAMMAR PRACTICE MODE: The user just studied "${extra.title}". Create a focused conversation that naturally requires using this grammar concept. Gently correct when they use it wrong. Praise when they use it correctly. After 3-4 exchanges, give a mini-challenge: ask them to construct a specific sentence using the grammar rule.`;
  }
  return base;
}

function parseMessage(text) {
  const parts = [];
  let rem = text;
  while (rem.length > 0) {
    const cm = rem.match(/\[CORRECTION:\s*(.+?)\s*→\s*(.+?)\s*\|\s*(.+?)\]/);
    const nm = rem.match(/\[NEW WORD:\s*(.+?)\s*=\s*(.+?)\]/);
    let em = null, et = null;
    if (cm) { em = cm; et = "correction"; }
    if (nm && (!em || rem.indexOf(nm[0]) < rem.indexOf(em[0]))) { em = nm; et = "newword"; }
    if (!em) { if (rem.trim()) parts.push({ type: "text", content: rem.trim() }); break; }
    const idx = rem.indexOf(em[0]);
    const before = rem.substring(0, idx).trim();
    if (before) parts.push({ type: "text", content: before });
    if (et === "correction") parts.push({ type: "correction", wrong: em[1], right: em[2], explanation: em[3] });
    else parts.push({ type: "newword", word: em[1], meaning: em[2] });
    rem = rem.substring(idx + em[0].length);
  }
  return parts;
}

async function callAI(systemPrompt, messages) {
  try {
    // Use the API proxy - either local dev server or Vercel production
    const apiUrl = import.meta.env.DEV ? 'http://localhost:3001/api/chat' : '/api/chat';
    
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemPrompt, messages }),
    });
    const data = await res.json();
    
    if (!res.ok) {
      console.error("API Error:", data);
      throw new Error(data.error || "API request failed");
    }
    
    return data.content || "Let's try again! 🦉";
  } catch (error) {
    console.error("AI call error:", error.message, error);
    return "Oops! Something went wrong. Let's try again! 🦉";
  }
}

/* ───────────────────── TTS ───────────────────── */
const LANG_BCP47 = { ja: "ja-JP", es: "es-ES", fr: "fr-FR", de: "de-DE" };
function speak(text, langCode) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = LANG_BCP47[langCode] || "en-US";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}
function SpeakBtn({ text, langCode }) {
  return (
    <button onClick={() => speak(text, langCode)}
      title="Listen"
      style={{ background: "#FFD700", border: "none", borderRadius: "50%", width: 26, height: 26, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, verticalAlign: "middle" }}>
      🔊
    </button>
  );
}

/* ───────────────────── COMPONENTS ───────────────────── */
function renderBilingual(text) {
  const regex = /\[EN:\s*(.+?)\]/g;
  const result = [];
  let lastIndex = 0, match, key = 0;
  while ((match = regex.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index).trim();
    if (before) result.push(<span key={key++}>{before} <span style={{ color: "#89E219", fontSize: 12, fontStyle: "italic", opacity: 0.85 }}>({match[1]})</span>{" "}</span>);
    lastIndex = match.index + match[0].length;
  }
  const remaining = text.slice(lastIndex).trim();
  if (remaining) result.push(<span key={key++}>{remaining}</span>);
  return result.length > 0 ? result : text;
}

function MsgBubble({ msg, isBeginnerMode, lang }) {
  if (msg.role === "user") return (
    <div style={{ display: "flex", justifyContent: "flex-end", mb: 14 }}>
      <div style={{ background: "#58CC02", color: "#fff", padding: "11px 16px", borderRadius: "18px 18px 4px 18px", maxWidth: "75%", fontSize: 14, lineHeight: 1.5, fontFamily: FONT, fontWeight: 600 }}>{msg.content}</div>
    </div>
  );
  const parts = parseMessage(msg.content);
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "flex-start" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#58CC02,#1CB0F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🦉</div>
      <div style={{ maxWidth: "78%" }}>
        {parts.map((p, i) => {
          if (p.type === "text") return <div key={i} style={{ background: "#232338", color: "#E5E5F0", padding: "11px 16px", borderRadius: i === 0 ? "18px 18px 18px 4px" : "4px 18px 18px 4px", fontSize: 14, lineHeight: 1.7, marginBottom: 5, fontFamily: FONT }}>{isBeginnerMode ? renderBilingual(p.content) : p.content}</div>;
          if (p.type === "correction") return (
            <div key={i} style={{ background: "#1a1a2e", border: "1px solid #FF4B4B", borderLeft: "3px solid #FF4B4B", padding: "10px 14px", borderRadius: 10, marginBottom: 5, fontSize: 13, fontFamily: FONT }}>
              <div style={{ color: "#FF4B4B", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>✏️ Grammar Fix</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: "#FF6B6B", textDecoration: "line-through", opacity: 0.8 }}>{p.wrong}</span>
                <span style={{ color: "#555" }}>→</span>
                <span style={{ color: "#58CC02", fontWeight: 700 }}>{p.right}</span>
                <SpeakBtn text={p.right} langCode={lang} />
              </div>
              <div style={{ color: "#9090B0", fontSize: 12, marginTop: 6, fontStyle: "italic" }}>💡 {p.explanation}</div>
            </div>
          );
          if (p.type === "newword") return (
            <div key={i} style={{ background: "#1a2e1a", border: "1px solid #58CC02", borderLeft: "3px solid #58CC02", padding: "10px 14px", borderRadius: 10, marginBottom: 5, fontSize: 13, fontFamily: FONT }}>
              <div style={{ color: "#58CC02", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🆕 New Word</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#FFD700", fontWeight: 700, fontSize: 15 }}>{p.word}</span>
                <SpeakBtn text={p.word} langCode={lang} />
                <span style={{ color: "#9090B0" }}>= {p.meaning}</span>
              </div>
            </div>
          );
          return null;
        })}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "flex-start" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#58CC02,#1CB0F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🦉</div>
      <div style={{ background: "#232338", padding: "12px 20px", borderRadius: "18px 18px 18px 4px", display: "flex", gap: 4 }}>
        {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#9090B0", animation: `typingBounce 1.4s ease-in-out ${i * 0.2}s infinite` }} />)}
      </div>
    </div>
  );
}

function ChatInput({ input, setInput, onSend, loading, placeholder }) {
  return (
    <div style={{ padding: "10px 14px 14px", background: "#1A1A2E", borderTop: "1px solid #2B2B3D", flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", background: "#232338", borderRadius: 14, padding: "3px 3px 3px 14px" }}>
        <input ref={null} type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && input.trim() && !loading) onSend(); }}
          placeholder={placeholder} disabled={loading}
          style={{ flex: 1, background: "transparent", border: "none", color: "#fff", fontSize: 14, fontFamily: FONT, fontWeight: 600 }} />
        <button onClick={() => { if (input.trim() && !loading) onSend(); }} disabled={!input.trim() || loading}
          style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: input.trim() && !loading ? "#58CC02" : "#3B3B4D", color: "#fff", fontSize: 16, cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>↑</button>
      </div>
    </div>
  );
}

/* ───────────────────── MAIN APP ───────────────────── */
export default function DuoChatPro() {
  const [screen, setScreen] = useState("setup");
  const [lang, setLang] = useState(null);
  const [goal, setGoal] = useState(null);
  const [level, setLevel] = useState(null);
  const [step, setStep] = useState(0);

  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState("free");
  const [chatModeExtra, setChatModeExtra] = useState(null);

  const [quizState, setQuizState] = useState({});
  const [allMistakes, setAllMistakes] = useState([]);
  const [allNewWords, setAllNewWords] = useState([]);
  const [capsulesPracticed, setCapsulesPracticed] = useState([]);
  const [roleplaysDone, setRoleplaysDone] = useState([]);
  const [msgCount, setMsgCount] = useState(0);
  const [learningPlan, setLearningPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [activityLog, setActivityLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem("duochat_activity") || "[]"); } catch { return []; }
  });
  const [sessionStart, setSessionStart] = useState(null);
  const [activityFilter, setActivityFilter] = useState("today");
  const [exchangeView, setExchangeView] = useState("discover");
  const [activeExchangeUser, setActiveExchangeUser] = useState(null);
  const [exchangeChats, setExchangeChats] = useState({});
  const [exchangeInput, setExchangeInput] = useState("");
  const [sentRequests, setSentRequests] = useState([]);
  const [themeIdx, setThemeIdx] = useState(0);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordStartRef = useRef(null);
  const chatEndRef = useRef(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // Extract mistakes & words from messages
  useEffect(() => {
    const m = [], w = [];
    messages.forEach(msg => {
      if (msg.role === "assistant") {
        parseMessage(msg.content).forEach(p => {
          if (p.type === "correction") m.push(p);
          if (p.type === "newword") w.push(p);
        });
      }
    });
    setAllMistakes(m);
    setAllNewWords(w);
  }, [messages]);

  async function sendMessage() {
    const userMsg = input.trim();
    if (!userMsg) return;
    const updated = [...messages, { role: "user", content: userMsg }];
    setMessages(updated);
    setInput("");
    setLoading(true);
    setMsgCount(c => c + 1);
    const sys = buildSystemPrompt(lang, goal, level, chatMode, chatModeExtra);
    const text = await callAI(sys, updated.map(m => ({ role: m.role, content: m.content })));
    setMessages([...updated, { role: "assistant", content: text }]);
    setLoading(false);
    const parsedParts = parseMessage(text);
    const correction = parsedParts.find(p => p.type === "correction");
    const newWord = parsedParts.find(p => p.type === "newword");
    if (correction) speak(correction.right, lang);
    else if (newWord) speak(newWord.word, lang);
  }

  async function startChat(mode, extra, firstMsg) {
    setChatMode(mode);
    setChatModeExtra(extra);
    setMessages([]);
    setMsgCount(0);
    setTab("chat");
    setSessionStart(Date.now());
    setLoading(true);
    const sys = buildSystemPrompt(lang, goal, level, mode, extra);
    const text = await callAI(sys, [{ role: "user", content: firstMsg }]);
    setMessages([{ role: "assistant", content: text }]);
    setLoading(false);
  }

  function exitChat() {
    if (sessionStart && msgCount > 0) {
      const session = {
        id: Date.now(),
        startTime: sessionStart,
        endTime: Date.now(),
        lang, goal, level,
        msgCount,
        wordsLearned: allNewWords.length,
        corrections: allMistakes.length,
        mode: chatMode,
      };
      setActivityLog(prev => {
        const updated = [session, ...prev];
        try { localStorage.setItem("duochat_activity", JSON.stringify(updated)); } catch {}
        return updated;
      });
    }
    setScreen("setup");
    setMessages([]);
    setChatMode("free");
    setChatModeExtra(null);
    setStep(0);
    setSessionStart(null);
    setMsgCount(0);
  }

  function startFreeChat() {
    const ln = LANGUAGES.find(l => l.code === lang)?.name;
    const gl = getGoals(lang).find(g => g.id === goal);
    const lv = LEVELS.find(l => l.id === level);
    startChat("free", null, `Start our first conversation. I'm a ${lv.label} (${lv.cefr}) learner studying ${ln} for ${gl.label} (${gl.desc}). Greet me and start naturally in ${ln}.`);
  }

  function startRoleplay(scenario) {
    const ln = LANGUAGES.find(l => l.code === lang)?.name;
    setRoleplaysDone(r => [...r, scenario.id]);
    startChat("roleplay", scenario, `Start the roleplay scenario: "${scenario.title}" — ${scenario.desc}. You are: ${scenario.aiRole}. Begin the scene naturally in ${ln}. Stay in character.`);
  }

  async function generatePlan() {
    if (planLoading || msgCount === 0) return;
    setPlanLoading(true);
    setLearningPlan(null);
    const langName = LANGUAGES.find(l => l.code === lang)?.name;
    const goalLabel = getGoals(lang).find(g => g.id === goal)?.label;
    const levelInfo = LEVELS.find(l => l.id === level);
    const mistakesSummary = allMistakes.length > 0
      ? allMistakes.map(m => `"${m.wrong}" → "${m.right}" (${m.explanation})`).join('; ')
      : 'none';
    const wordsSummary = allNewWords.length > 0
      ? allNewWords.map(w => `${w.word} = ${w.meaning}`).join(', ')
      : 'none';
    const sessionData = `Language: ${langName} | Goal: ${goalLabel} | Level: ${levelInfo?.label} (${levelInfo?.cefr})
Messages exchanged: ${msgCount}
Grammar corrections: ${mistakesSummary}
New words encountered: ${wordsSummary}
Grammar capsules practiced: ${capsulesPracticed.length > 0 ? capsulesPracticed.join(', ') : 'none'}
Roleplays completed: ${roleplaysDone.length > 0 ? roleplaysDone.join(', ') : 'none'}`;
    const systemPrompt = `You are a language learning coach. Analyze a learner's session and give a short personalized plan. Use plain text with these exact emoji headers, no markdown bold:
💪 Strengths: (1-2 things they did well)
🎯 Focus Areas: (2-3 specific things to improve based on their mistakes)
📅 This Week: (3 concrete action steps for their goal)
⭐ Keep Going: (one short motivating line)
Max 160 words total. Be specific to their actual data.`;
    const result = await callAI(systemPrompt, [{ role: "user", content: `My session:\n${sessionData}` }]);
    setLearningPlan(result);
    setPlanLoading(false);
  }

  function startGrammarPractice(capsule) {
    const ln = LANGUAGES.find(l => l.code === lang)?.name;
    setCapsulesPracticed(c => [...c, capsule.id]);
    startChat("grammar", capsule, `I just studied the grammar concept "${capsule.title}: ${capsule.subtitle}". Start a focused conversation in ${ln} that requires me to use this grammar. Guide me to practice it naturally.`);
  }

  const langInfo = LANGUAGES.find(l => l.code === lang);
  const goals = lang ? getGoals(lang) : GOALS_BASE;
  const goalInfo = goals.find(g => g.id === goal);
  const capsules = GRAMMAR_CAPSULES[lang] || [];
  const scenariosForGoal = goal === "exam" 
    ? (ROLEPLAY_SCENARIOS.exam?.[lang] || []) 
    : (ROLEPLAY_SCENARIOS[goal] || []);

  /* ───── SETUP SCREEN ───── */
  if (screen === "setup") {
    return (
      <div style={{ minHeight: "100vh", background: "#0F0F1A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: FONT }}>
        <style>{CSS}</style>
        <div style={{ maxWidth: 420, width: "100%", animation: "fadeUp 0.4s ease-out" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#58CC02,#1CB0F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 14px", boxShadow: "0 8px 32px rgba(88,204,2,0.35)" }}>🦉</div>
            <h1 style={{ color: "#58CC02", fontSize: 22, fontWeight: 900, marginBottom: 6, fontFamily: FONT }}>DuoChat — AI Text Conversation Partner</h1>
            <p className="chat-subtitle" style={{ fontSize: 13, fontWeight: 600 }}>Chat · Roleplay · Grammar · Progress</p>
          </div>

          {step === 0 && (
            <div style={{ animation: "fadeUp 0.3s ease-out" }}>
              <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 800, textAlign: "center", marginBottom: 16 }}>What are you learning?</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {LANGUAGES.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setStep(1); }}
                    style={{ background: "#1A1A2E", border: "2px solid #2B2B3D", borderRadius: 14, padding: "18px 14px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transition: "border 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = "#58CC02"} onMouseOut={e => e.currentTarget.style.borderColor = "#2B2B3D"}>
                    <span style={{ fontSize: 30, color: "#FFD700" }}>{l.flag}</span>
                    <span className="language-name" style={{ fontWeight: 800, fontSize: 14, fontFamily: FONT }}>{l.name}</span>
                    <span style={{ color: "#8080A0", fontSize: 11, fontFamily: FONT }}>{l.native}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ animation: "fadeUp 0.3s ease-out" }}>
              <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 800, textAlign: "center", marginBottom: 16 }}>What's your goal?</h2>
              {getGoals(lang).map(g => (
                <button key={g.id} onClick={() => { setGoal(g.id); setStep(2); }}
                  style={{ width: "100%", background: "#1A1A2E", border: "2px solid #2B2B3D", borderRadius: 14, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", marginBottom: 8, transition: "border 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.borderColor = "#58CC02"} onMouseOut={e => e.currentTarget.style.borderColor = "#2B2B3D"}>
                  <span style={{ fontSize: 26 }}>{g.icon}</span>
                  <div><div style={{ color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: FONT }}>{g.label}</div><div style={{ color: "#8080A0", fontSize: 11, fontFamily: FONT }}>{g.desc}</div></div>
                </button>
              ))}
              <button onClick={() => setStep(0)} style={{ background: "transparent", border: "none", color: "#8080A0", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: FONT, display: "block", margin: "12px auto 0" }}>← Back</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: "fadeUp 0.3s ease-out" }}>
              <h2 style={{ color: "#fff", fontSize: 17, fontWeight: 800, textAlign: "center", marginBottom: 16 }}>Your level?</h2>
              {LEVELS.map(l => (
                <button key={l.id} onClick={() => setLevel(l.id)}
                  style={{ width: "100%", background: level === l.id ? "#58CC02" : "#1A1A2E", border: `2px solid ${level === l.id ? "#58CC02" : "#2B2B3D"}`, borderRadius: 14, padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 8, transition: "all 0.2s" }}
                  onMouseOver={e => { if (level !== l.id) e.currentTarget.style.borderColor = "#58CC02"; }} onMouseOut={e => { if (level !== l.id) e.currentTarget.style.borderColor = "#2B2B3D"; }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: level === l.id ? "rgba(255,255,255,0.2)" : "#232338", display: "flex", alignItems: "center", justifyContent: "center", color: level === l.id ? "#fff" : "#58CC02", fontWeight: 900, fontSize: 12, fontFamily: FONT }}>{l.cefr}</div>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: FONT }}>{l.label}</div>
                </button>
              ))}
              {level && (
                <button onClick={() => { setScreen("app"); startFreeChat(); }}
                  style={{ width: "100%", marginTop: 16, padding: "14px 0", borderRadius: 14, border: "none", background: "#58CC02", color: "#fff", fontWeight: 900, fontSize: 16, cursor: "pointer", fontFamily: FONT, boxShadow: "0 4px 16px rgba(88,204,2,0.35)", animation: "fadeUp 0.3s ease-out" }}>
                  Start Learning with Junior 🦉
                </button>
              )}
              <button onClick={() => setStep(1)} style={{ background: "transparent", border: "none", color: "#8080A0", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: FONT, display: "block", margin: "12px auto 0" }}>← Back</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ───── MAIN APP ───── */
  const TABS = [
    { id: "chat", icon: "💬", label: "Chat" },
    { id: "roleplay", icon: "🎭", label: "Roleplay" },
    { id: "grammar", icon: "📖", label: "Grammar" },
    { id: "exchange", icon: "🌐", label: "Exchange" },
    { id: "progress", icon: "📊", label: "Progress" },
  ];

  return (
    <div style={{ height: "100vh", background: "#0F0F1A", display: "flex", flexDirection: "column", fontFamily: FONT, position: "relative" }}>
      <style>{CSS}</style>

      {/* ─── HEADER ─── */}
      <div style={{ background: "#1A1A2E", borderBottom: "1px solid #2B2B3D", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#58CC02,#1CB0F6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>🦉</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Junior</div>
            <div style={{ color: "#58CC02", fontSize: 10, fontWeight: 600 }}>{langInfo?.flag} {langInfo?.name} • {goalInfo?.icon} {goalInfo?.label} • {chatMode === "roleplay" ? "🎭 Roleplay" : chatMode === "grammar" ? "📖 Grammar" : "💬 Chat"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {allMistakes.length > 0 && <div style={{ background: "rgba(255,75,75,0.15)", color: "#FF4B4B", padding: "3px 8px", borderRadius: 16, fontSize: 11, fontWeight: 800 }}>✏️{allMistakes.length}</div>}
          {allNewWords.length > 0 && <div style={{ background: "rgba(88,204,2,0.15)", color: "#58CC02", padding: "3px 8px", borderRadius: 16, fontSize: 11, fontWeight: 800 }}>🆕{allNewWords.length}</div>}
        </div>
      </div>

      {/* ─── CONTENT AREA ─── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

        {/* ── CHAT TAB ── */}
        {tab === "chat" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px" }}>
              {chatMode !== "free" && chatModeExtra && (
                <div style={{ textAlign: "center", marginBottom: 14, padding: "8px 14px", background: chatMode === "roleplay" ? "rgba(28,176,246,0.1)" : "rgba(88,204,2,0.1)", border: `1px solid ${chatMode === "roleplay" ? "#1CB0F633" : "#58CC0233"}`, borderRadius: 10, fontSize: 11, fontWeight: 700, color: chatMode === "roleplay" ? "#1CB0F6" : "#58CC02" }}>
                  {chatMode === "roleplay" ? `🎭 ${chatModeExtra.title}` : `📖 Practicing: ${chatModeExtra.title}`}
                  <button onClick={exitChat} style={{ marginLeft: 10, background: "rgba(255,255,255,0.1)", border: "none", color: "#8080A0", padding: "2px 8px", borderRadius: 6, fontSize: 10, cursor: "pointer", fontFamily: FONT }}>✕ Exit</button>
                </div>
              )}
              {chatMode === "free" && (
                <div style={{ textAlign: "center", marginBottom: 14, padding: "8px 14px", background: "rgba(88,204,2,0.1)", border: "1px solid #58CC0233", borderRadius: 10, fontSize: 11, fontWeight: 700, color: "#58CC02", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <span>💬 Free Conversation</span>
                  <button onClick={exitChat} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#8080A0", padding: "2px 8px", borderRadius: 6, fontSize: 10, cursor: "pointer", fontFamily: FONT }}>✕ Exit</button>
                </div>
              )}
              {messages.map((m, i) => <div key={i} style={{ animation: "fadeUp 0.25s ease-out" }}><MsgBubble msg={m} isBeginnerMode={level === "beginner"} lang={lang} /></div>)}
              {loading && <Typing />}
              <div ref={chatEndRef} />
            </div>
            <ChatInput input={input} setInput={setInput} onSend={sendMessage} loading={loading} placeholder={`Type in ${langInfo?.name} (or English if stuck)...`} />
          </div>
        )}

        {/* ── ROLEPLAY TAB ── */}
        {tab === "roleplay" && (
          <div style={{ padding: 16, animation: "fadeUp 0.3s ease-out" }}>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 900, marginBottom: 4 }}>🎭 Roleplay Scenarios</h2>
            <p style={{ color: "#8080A0", fontSize: 12, marginBottom: 16 }}>Practice real-world situations with Junior in character</p>
            {scenariosForGoal.map(s => (
              <button key={s.id} onClick={() => startRoleplay(s)}
                style={{ width: "100%", background: "#1A1A2E", border: roleplaysDone.includes(s.id) ? "2px solid #58CC02" : "2px solid #2B2B3D", borderRadius: 14, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", marginBottom: 10, transition: "border 0.2s" }}
                onMouseOver={e => e.currentTarget.style.borderColor = "#1CB0F6"} onMouseOut={e => e.currentTarget.style.borderColor = roleplaysDone.includes(s.id) ? "#58CC02" : "#2B2B3D"}>
                <div style={{ fontSize: 28, flexShrink: 0 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{s.title}</div>
                  <div style={{ color: "#8080A0", fontSize: 11 }}>{s.desc}</div>
                </div>
                {roleplaysDone.includes(s.id) && <div style={{ color: "#58CC02", fontSize: 11, fontWeight: 800 }}>✓ Done</div>}
              </button>
            ))}
          </div>
        )}

        {/* ── GRAMMAR TAB ── */}
        {tab === "grammar" && (
          <div style={{ padding: 16, animation: "fadeUp 0.3s ease-out" }}>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 900, marginBottom: 4 }}>📖 Grammar Capsules</h2>
            <p style={{ color: "#8080A0", fontSize: 12, marginBottom: 16 }}>Learn the rule → See examples → Quiz yourself → Practice with Junior</p>
            {capsules.map(cap => {
              const qs = quizState[cap.id] || {};
              const isOpen = qs.open;
              const answered = qs.answered;
              const selected = qs.selected;
              const qIdx = qs.qIdx || 0;
              const streak = qs.streak || 0;
              const order = qs.order || cap.quizzes.map((_, i) => i);
              const currentQ = cap.quizzes[order[qIdx % order.length]];
              return (
                <div key={cap.id} style={{ background: "#1A1A2E", border: capsulesPracticed.includes(cap.id) ? "2px solid #58CC02" : "2px solid #2B2B3D", borderRadius: 14, marginBottom: 12, overflow: "hidden", transition: "border 0.2s" }}>
                  {/* Header */}
                  <button onClick={() => setQuizState(s => {
                    const existing = s[cap.id] || {};
                    const newOrder = existing.order || shuffleArray(cap.quizzes.map((_, i) => i));
                    return { ...s, [cap.id]: { ...existing, open: !existing.open, order: newOrder } };
                  })}
                    style={{ width: "100%", background: "transparent", border: "none", padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left" }}>
                    <div>
                      <div style={{ color: "#FFD700", fontWeight: 900, fontSize: 16, fontFamily: FONT }}>{cap.title}</div>
                      <div style={{ color: "#8080A0", fontSize: 11, fontFamily: FONT }}>{cap.subtitle}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {capsulesPracticed.includes(cap.id) && <span style={{ color: "#58CC02", fontSize: 10, fontWeight: 800 }}>✓ Practiced</span>}
                      <span style={{ color: "#8080A0", fontSize: 18, transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>▾</span>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isOpen && (
                    <div style={{ padding: "0 16px 16px", animation: "fadeUp 0.2s ease-out" }}>
                      {/* Rule */}
                      <div style={{ background: "#232338", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                        <div style={{ color: "#1CB0F6", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>📐 Rule</div>
                        <div style={{ color: "#D0D0E8", fontSize: 13, lineHeight: 1.5 }}>{cap.rule}</div>
                      </div>

                      {/* Examples */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ color: "#58CC02", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>📝 Examples</div>
                        {cap.examples.map((ex, i) => (
                          <div key={i} style={{ background: "#232338", borderRadius: 8, padding: "10px 12px", marginBottom: 6 }}>
                            <div style={{ color: "#FFD700", fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{ex.target}</div>
                            <div style={{ color: "#8080A0", fontSize: 12 }}>{ex.english}</div>
                          </div>
                        ))}
                      </div>

                      {/* Quiz */}
                      <div style={{ background: "#1a1a2e", border: "1px solid #3B3B5D", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ color: "#FF9500", fontWeight: 800, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>🧪 Quick Quiz</div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {streak > 0 && <span style={{ color: "#FF9500", fontWeight: 800, fontSize: 11 }}>🔥 {streak} streak</span>}
                            <span style={{ color: "#8080A0", fontSize: 10 }}>Q{(qIdx % order.length) + 1}/{order.length}</span>
                          </div>
                        </div>
                        <div style={{ color: "#D0D0E8", fontSize: 13, marginBottom: 10 }}>{currentQ.question}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                          {currentQ.options.map((opt, i) => {
                            let bg = "#232338", border = "#3B3B5D", col = "#D0D0E8";
                            if (answered) {
                              if (i === currentQ.answer) { bg = "rgba(88,204,2,0.15)"; border = "#58CC02"; col = "#58CC02"; }
                              else if (i === selected && i !== currentQ.answer) { bg = "rgba(255,75,75,0.15)"; border = "#FF4B4B"; col = "#FF4B4B"; }
                            }
                            return (
                              <button key={i} onClick={() => { if (!answered) setQuizState(s => ({ ...s, [cap.id]: { ...s[cap.id], answered: true, selected: i, streak: i === currentQ.answer ? (s[cap.id]?.streak || 0) + 1 : 0 } })); }}
                                style={{ background: bg, border: `2px solid ${border}`, borderRadius: 8, padding: "10px 8px", cursor: answered ? "default" : "pointer", color: col, fontWeight: 700, fontSize: 14, fontFamily: FONT, transition: "all 0.2s" }}>
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {answered && (
                          <div style={{ marginTop: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 12, color: selected === currentQ.answer ? "#58CC02" : "#FF4B4B", fontWeight: 700 }}>
                              {selected === currentQ.answer ? "✅ Correct!" : `❌ Answer: ${currentQ.options[currentQ.answer]}`}
                            </div>
                            <button onClick={() => setQuizState(s => ({ ...s, [cap.id]: { ...s[cap.id], qIdx: (s[cap.id].qIdx || 0) + 1, answered: false, selected: null } }))}
                              style={{ background: "#58CC02", border: "none", borderRadius: 8, padding: "6px 14px", color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: FONT }}>
                              Next →
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Practice with Junior */}
                      <button onClick={() => startGrammarPractice(cap)}
                        style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#1CB0F6,#58CC02)", color: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer", fontFamily: FONT, boxShadow: "0 4px 16px rgba(28,176,246,0.3)" }}>
                        💬 Practice "{cap.title}" with Junior
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── EXCHANGE TAB ── */}
        {tab === "exchange" && (() => {
          const users = EXCHANGE_USERS[lang] || [];
          const themes = EXCHANGE_THEMES[lang] || [];
          const currentTheme = themes[themeIdx % Math.max(themes.length, 1)];

          function sendExchangeMsg() {
            if (!exchangeInput.trim() || !activeExchangeUser) return;
            const msg = { from: "me", type: "text", text: exchangeInput.trim(), time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
            setExchangeChats(c => ({ ...c, [activeExchangeUser.id]: [...(c[activeExchangeUser.id] || []), msg] }));
            setExchangeInput("");
          }

          async function startRecording() {
            if (isRecording) {
              mediaRecorderRef.current?.stop();
              setIsRecording(false);
              return;
            }
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const mr = new MediaRecorder(stream);
              audioChunksRef.current = [];
              recordStartRef.current = Date.now();
              mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
              mr.onstop = () => {
                stream.getTracks().forEach(t => t.stop());
                const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);
                const duration = Math.max(1, Math.round((Date.now() - recordStartRef.current) / 1000));
                const msg = { from: "me", type: "audio", url, duration, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
                setExchangeChats(c => ({ ...c, [activeExchangeUser.id]: [...(c[activeExchangeUser.id] || []), msg] }));
              };
              mr.start();
              mediaRecorderRef.current = mr;
              setIsRecording(true);
            } catch {
              alert("Microphone access denied. Please allow mic permissions.");
            }
          }

          if (exchangeView === "chat" && activeExchangeUser) {
            const msgs = exchangeChats[activeExchangeUser.id] || [];
            return (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", animation: "fadeUp 0.3s ease-out" }}>
                {/* Chat Header */}
                <div style={{ padding: "12px 16px", background: "#1A1A2E", borderBottom: "1px solid #2B2B3D", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => { setExchangeView("discover"); setActiveExchangeUser(null); if (isRecording) { mediaRecorderRef.current?.stop(); setIsRecording(false); } }}
                        style={{ background: "transparent", border: "none", color: "#8080A0", fontSize: 18, cursor: "pointer", padding: 0 }}>←</button>
                      <span style={{ fontSize: 26 }}>{activeExchangeUser.avatar}</span>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{activeExchangeUser.name}</div>
                        <div style={{ color: "#58CC02", fontSize: 10, fontWeight: 700 }}>{activeExchangeUser.nativeFlag} Native · {activeExchangeUser.learningFlag} Learning · {activeExchangeUser.level}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ textAlign: "center" }}>
                        <button style={{ background: "#232338", border: "1px solid #3B3B5D", borderRadius: 8, padding: "6px 10px", color: "#8080A0", cursor: "default", fontSize: 16 }}>📞</button>
                        <div style={{ color: "#8080A0", fontSize: 8, fontWeight: 700, marginTop: 2 }}>Soon</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <button style={{ background: "#232338", border: "1px solid #3B3B5D", borderRadius: 8, padding: "6px 10px", color: "#8080A0", cursor: "default", fontSize: 16 }}>📹</button>
                        <div style={{ color: "#8080A0", fontSize: 8, fontWeight: 700, marginTop: 2 }}>Soon</div>
                      </div>
                    </div>
                  </div>
                  {/* Theme Card */}
                  {currentTheme && (
                    <div style={{ marginTop: 10, background: "rgba(88,204,2,0.08)", border: "1px solid #58CC0240", borderRadius: 10, padding: "8px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ color: "#58CC02", fontWeight: 800, fontSize: 11 }}>Today's Theme: {currentTheme.theme}</span>
                        <button onClick={() => setThemeIdx(i => i + 1)} style={{ background: "transparent", border: "none", color: "#8080A0", fontSize: 10, cursor: "pointer", fontFamily: FONT }}>Next →</button>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {currentTheme.vocab.map((v, i) => (
                          <span key={i} style={{ background: "#1A1A2E", border: "1px solid #2B2B3D", borderRadius: 6, padding: "2px 8px", color: "#D0D0E8", fontSize: 10 }}>{v}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                  {msgs.length === 0 && (
                    <div style={{ textAlign: "center", color: "#8080A0", fontSize: 12, marginTop: 30 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>👋</div>
                      Say hello to {activeExchangeUser.name}! Try using today's theme vocab.
                    </div>
                  )}
                  {msgs.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.from === "me" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                      <div style={{ maxWidth: "76%" }}>
                        {m.type === "audio" ? (
                          <div style={{ background: m.from === "me" ? "#58CC02" : "#232338", padding: "8px 12px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>🎤</span>
                            <audio src={m.url} controls style={{ height: 28, maxWidth: 160 }} />
                            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, whiteSpace: "nowrap" }}>{m.duration}s</span>
                          </div>
                        ) : (
                          <div style={{ background: m.from === "me" ? "#58CC02" : "#232338", color: "#fff", padding: "9px 14px", borderRadius: m.from === "me" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontSize: 13, fontWeight: 600, fontFamily: FONT }}>{m.text}</div>
                        )}
                        <div style={{ color: "#8080A0", fontSize: 10, marginTop: 2, textAlign: m.from === "me" ? "right" : "left" }}>{m.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Input */}
                <div style={{ padding: "10px 14px 14px", background: "#1A1A2E", borderTop: "1px solid #2B2B3D", flexShrink: 0 }}>
                  {isRecording && (
                    <div style={{ textAlign: "center", color: "#FF4B4B", fontWeight: 800, fontSize: 12, marginBottom: 6, animation: "pulse 1s ease-in-out infinite" }}>
                      🔴 Recording… tap mic to send
                    </div>
                  )}
                  <div style={{ background: "#232338", borderRadius: 12, padding: "3px 3px 3px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                    <input value={exchangeInput} onChange={e => setExchangeInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") sendExchangeMsg(); }}
                      placeholder={isRecording ? "Recording in progress…" : "Type a message…"}
                      disabled={isRecording}
                      style={{ flex: 1, background: "transparent", border: "none", color: isRecording ? "#8080A0" : "#fff", fontSize: 14, fontFamily: FONT, fontWeight: 600 }} />
                    <button onClick={startRecording} title={isRecording ? "Stop & send" : "Record voice note"}
                      style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: isRecording ? "#FF4B4B" : "#3B3B4D", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      🎤
                    </button>
                    <button onClick={sendExchangeMsg} disabled={isRecording}
                      style={{ width: 38, height: 38, borderRadius: 10, border: "none", background: exchangeInput.trim() && !isRecording ? "#58CC02" : "#3B3B4D", color: "#fff", fontSize: 16, cursor: exchangeInput.trim() && !isRecording ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>↑</button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div style={{ padding: 16, animation: "fadeUp 0.3s ease-out" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 900 }}>🌐 Language Exchange</h2>
                <span style={{ background: "rgba(255,212,0,0.15)", border: "1px solid #FFD70060", color: "#FFD700", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>🔒 Friends & Followers Only</span>
              </div>
              <p style={{ color: "#8080A0", fontSize: 12, marginBottom: 10 }}>
                Chat with native {LANGUAGES.find(l => l.code === lang)?.name} speakers from your network who are learning your language.
              </p>

              {/* Friends-only notice */}
              <div style={{ background: "rgba(255,212,0,0.06)", border: "1px solid #FFD70030", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                <div style={{ color: "#FFD700", fontWeight: 800, fontSize: 12, marginBottom: 4 }}>👥 How it works</div>
                <div style={{ color: "#B0B0C8", fontSize: 11, lineHeight: 1.6 }}>
                  Only your Duolingo <strong style={{ color: "#fff" }}>friends & followers</strong> appear here. Send a chat request → they accept → start your language exchange. Duolingo monitors chats to keep learning the focus.
                </div>
              </div>

              {/* Guidelines chip */}
              <div style={{ background: "rgba(28,176,246,0.08)", border: "1px solid #1CB0F620", borderRadius: 10, padding: "8px 12px", marginBottom: 16, fontSize: 11, color: "#1CB0F6", fontWeight: 700 }}>
                🛡️ Keep it kind · Stay on topic · Language learning only
              </div>

              {users.length === 0 ? (
                <div style={{ textAlign: "center", color: "#8080A0", fontSize: 13, marginTop: 40 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
                  No friends available for exchange yet. Invite friends on Duolingo!
                </div>
              ) : (
                users.map(u => {
                  const requested = sentRequests.includes(u.id);
                  return (
                    <div key={u.id} style={{ background: "#1A1A2E", border: "2px solid #2B2B3D", borderRadius: 14, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <span style={{ fontSize: 34 }}>{u.avatar}</span>
                        <span style={{ position: "absolute", bottom: 0, right: -2, width: 10, height: 10, borderRadius: "50%", background: u.online ? "#58CC02" : "#555", border: "2px solid #1A1A2E" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{u.name}</span>
                          <span style={{ background: "#232338", color: "#8080A0", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 5 }}>{u.level}</span>
                          <span style={{ background: "rgba(255,212,0,0.12)", color: "#FFD700", fontSize: 9, fontWeight: 800, padding: "1px 6px", borderRadius: 5 }}>👥 Friend</span>
                        </div>
                        <div style={{ color: "#8080A0", fontSize: 11, marginBottom: 4 }}>{u.nativeFlag} speaks {u.nativeLang} · {u.learningFlag} learning {u.learningLang}</div>
                        <div style={{ color: "#D0D0E8", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.bio}</div>
                      </div>
                      <button onClick={() => {
                        if (!requested) { setSentRequests(r => [...r, u.id]); setActiveExchangeUser(u); setExchangeView("chat"); }
                        else { setActiveExchangeUser(u); setExchangeView("chat"); }
                      }}
                        style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 10, border: requested ? "1px solid #58CC02" : "none", background: requested ? "#232338" : "#58CC02", color: requested ? "#58CC02" : "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: FONT }}>
                        {requested ? "Open Chat" : "Chat →"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          );
        })()}

        {/* ── PROGRESS TAB ── */}
        {tab === "progress" && (
          <div style={{ padding: 16, animation: "fadeUp 0.3s ease-out" }}>
            <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 900, marginBottom: 12 }}>📊 Activity</h2>

            {/* Activity Filter Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {["today","week","month","all"].map(f => {
                const labels = { today: "Today", week: "Week", month: "Month", all: "All Time" };
                return (
                  <button key={f} onClick={() => setActivityFilter(f)}
                    style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: activityFilter === f ? "none" : "1px solid #2B2B3D", background: activityFilter === f ? "#58CC02" : "#1A1A2E", color: activityFilter === f ? "#fff" : "#8080A0", fontWeight: 800, fontSize: 11, cursor: "pointer", fontFamily: FONT }}>
                    {labels[f]}
                  </button>
                );
              })}
            </div>

            {/* Filtered Stats */}
            {(() => {
              const now = Date.now();
              const cutoff = { today: now - 86400000, week: now - 604800000, month: now - 2592000000, all: 0 }[activityFilter];
              const filtered = activityLog.filter(s => s.startTime >= cutoff);
              const totalMsgs = filtered.reduce((a, s) => a + s.msgCount, 0);
              const totalWords = filtered.reduce((a, s) => a + s.wordsLearned, 0);
              const totalCorrections = filtered.reduce((a, s) => a + s.corrections, 0);
              const xp = totalMsgs * 5 + totalWords * 10;
              const accuracy = totalMsgs > 0 ? Math.round((1 - totalCorrections / totalMsgs) * 100) : 0;
              return (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                    {[
                      { label: "Messages", value: totalMsgs, color: "#58CC02", icon: "💬" },
                      { label: "Accuracy", value: `${accuracy}%`, color: "#1CB0F6", icon: "🎯" },
                      { label: "New Words", value: totalWords, color: "#FFD700", icon: "🆕" },
                      { label: "XP Gained", value: `+${xp}`, color: "#FF9500", icon: "⭐" },
                    ].map((s, i) => (
                      <div key={i} style={{ background: "#1A1A2E", borderRadius: 14, padding: "14px 12px", textAlign: "center", border: "1px solid #2B2B3D" }}>
                        <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ color: s.color, fontSize: 24, fontWeight: 900 }}>{s.value}</div>
                        <div style={{ color: "#8080A0", fontSize: 11, fontWeight: 700 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Session History */}
                  {filtered.length > 0 ? (
                    <div style={{ marginBottom: 20 }}>
                      <h3 style={{ color: "#8080A0", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Session History</h3>
                      {filtered.map(s => {
                        const langName = LANGUAGES.find(l => l.code === s.lang)?.name || s.lang;
                        const langFlag = LANGUAGES.find(l => l.code === s.lang)?.flag || "";
                        const goalLabel = getGoals(s.lang).find(g => g.id === s.goal)?.label || s.goal;
                        const mins = Math.round((s.endTime - s.startTime) / 60000);
                        const timeAgo = (() => {
                          const diff = Date.now() - s.startTime;
                          if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
                          if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
                          return new Date(s.startTime).toLocaleDateString();
                        })();
                        return (
                          <div key={s.id} style={{ background: "#1A1A2E", borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: "1px solid #2B2B3D", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{langFlag} {langName} · {goalLabel}</div>
                              <div style={{ color: "#8080A0", fontSize: 11, marginTop: 2 }}>
                                {s.msgCount} msgs · {s.wordsLearned} words · {mins > 0 ? `${mins}m` : "<1m"}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div style={{ color: "#FF9500", fontWeight: 800, fontSize: 12 }}>+{s.msgCount * 5 + s.wordsLearned * 10} XP</div>
                              <div style={{ color: "#8080A0", fontSize: 10, marginTop: 2 }}>{timeAgo}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", color: "#8080A0", fontSize: 12, padding: "16px 0" }}>No sessions yet in this period</div>
                  )}
                </>
              );
            })()}

            <div style={{ borderTop: "1px solid #2B2B3D", marginBottom: 20, paddingTop: 20 }}>
            <h3 style={{ color: "#fff", fontSize: 14, fontWeight: 900, marginBottom: 14 }}>📝 Current Session</h3>

            {/* Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Messages", value: msgCount, color: "#58CC02", icon: "💬" },
                { label: "Corrections", value: allMistakes.length, color: "#FF4B4B", icon: "✏️" },
                { label: "New Words", value: allNewWords.length, color: "#FFD700", icon: "🆕" },
                { label: "Grammar Practiced", value: capsulesPracticed.length, color: "#1CB0F6", icon: "📖" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#1A1A2E", borderRadius: 14, padding: "16px 14px", textAlign: "center", border: "1px solid #2B2B3D" }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ color: s.color, fontSize: 28, fontWeight: 900 }}>{s.value}</div>
                  <div style={{ color: "#8080A0", fontSize: 11, fontWeight: 700 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Mistakes List */}
            {allMistakes.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: "#FF4B4B", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>✏️ Your Corrections</h3>
                {allMistakes.map((m, i) => (
                  <div key={i} style={{ background: "#1A1A2E", borderRadius: 10, padding: "10px 14px", marginBottom: 6, fontSize: 13, border: "1px solid #2B2B3D" }}>
                    <span style={{ color: "#FF6B6B", textDecoration: "line-through" }}>{m.wrong}</span>
                    <span style={{ color: "#555", margin: "0 6px" }}>→</span>
                    <span style={{ color: "#58CC02", fontWeight: 700 }}>{m.right}</span>
                    <div style={{ color: "#8080A0", fontSize: 11, marginTop: 4 }}>{m.explanation}</div>
                  </div>
                ))}
              </div>
            )}

            {/* New Words */}
            {allNewWords.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: "#58CC02", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>🆕 Words Learned</h3>
                {allNewWords.map((w, i) => (
                  <div key={i} style={{ background: "#1A1A2E", borderRadius: 10, padding: "10px 14px", marginBottom: 6, fontSize: 13, border: "1px solid #2B2B3D", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#FFD700", fontWeight: 700 }}>{w.word}</span>
                    <span style={{ color: "#8080A0" }}>{w.meaning}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Roleplays Completed */}
            {roleplaysDone.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: "#1CB0F6", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>🎭 Roleplays Completed</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {roleplaysDone.map((id, i) => {
                    const sc = scenariosForGoal.find(s => s.id === id);
                    return sc ? <div key={i} style={{ background: "rgba(28,176,246,0.15)", color: "#1CB0F6", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{sc.icon} {sc.title}</div> : null;
                  })}
                </div>
              </div>
            )}

            {/* Learning Plan */}
            {msgCount > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: "#FFD700", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>🗺️ Your Learning Plan</h3>
                {!learningPlan && !planLoading && (
                  <button onClick={generatePlan}
                    style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#58CC02,#1CB0F6)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: FONT, boxShadow: "0 4px 16px rgba(88,204,2,0.25)" }}>
                    ✨ Generate My Plan
                  </button>
                )}
                {planLoading && (
                  <div style={{ background: "#1A1A2E", borderRadius: 12, padding: "18px 16px", border: "1px solid #2B2B3D", textAlign: "center", color: "#8080A0", fontSize: 13 }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>🦉</div>
                    Analysing your session…
                  </div>
                )}
                {learningPlan && !planLoading && (
                  <div style={{ background: "#1A1A2E", borderRadius: 12, padding: "16px", border: "1px solid #FFD70033" }}>
                    <div style={{ color: "#D0D0E8", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: FONT }}>{learningPlan}</div>
                    <button onClick={generatePlan}
                      style={{ marginTop: 12, background: "transparent", border: "1px solid #2B2B3D", color: "#8080A0", padding: "5px 12px", borderRadius: 8, fontSize: 11, cursor: "pointer", fontFamily: FONT, fontWeight: 700 }}>
                      ↻ Regenerate
                    </button>
                  </div>
                )}
              </div>
            )}

            {allMistakes.length === 0 && allNewWords.length === 0 && msgCount === 0 && (
              <div style={{ textAlign: "center", color: "#8080A0", fontSize: 13, marginTop: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
                Start chatting, practicing grammar, or doing roleplays — your progress will appear here!
              </div>
            )}
            </div>
          </div>
        )}
      </div>

      {/* ─── BOTTOM TAB BAR ─── */}
      <div style={{ display: "flex", background: "#1A1A2E", borderTop: "1px solid #2B2B3D", flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "10px 0 8px", background: "transparent", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, transition: "all 0.2s", opacity: tab === t.id ? 1 : 0.5 }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: tab === t.id ? "#58CC02" : "#8080A0", fontFamily: FONT }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 20, height: 3, borderRadius: 2, background: "#58CC02", marginTop: 2 }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
