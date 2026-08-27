/**
 * AI Assistant Knowledge Search & Multilingual Synthesizer
 * Deeply extracts custom notes, numbers, bank details, rates, and policies
 * Supports Bangla Unicode, English, and Romanized Banglish
 */

export const detectLanguage = (text = '') => {
  if (!text) return 'en';
  const banglaRegex = /[\u0980-\u09FF]/;
  if (banglaRegex.test(text)) return 'bn';
  const banglishTokens = [
    'koto', 'dam', 'amar', 'lagbe', 'chai', 'kivabe', 'korbo', 'ki', 'bhai',
    'apnar', 'shomoy', 'kaj', 'dorkar', 'acha', 'ache', 'korte', 'bhalo',
    'keno', 'kobe', 'urgent', 'taka', 'khoroch', 'design', 'banabo', 'parben',
    'thaken', 'kothay', 'software', 'tools', 'payment', 'advance', 'bkash', 'bikash',
    'nogod', 'nagad', 'experience', 'somoy', 'delivery', 'revision', 'phone',
    'number', 'whatsapp', 'deow', 'dao', 'diyan', 'den', 'bolen', 'koro', 'kichu'
  ];
  const words = text.toLowerCase().split(/[\s,?.!]+/);
  return words.some((w) => banglishTokens.includes(w)) ? 'bn' : 'en';
};

// Synonym and Intent Mapper for cross-lingual understanding
const expandQuerySynonyms = (tokens = []) => {
  const expanded = new Set(tokens);

  const SYNONYM_GROUPS = [
    // Payment / Mobile Banking / Bank
    ['bkash', 'bikash', 'bikas', 'বিকাশ', 'nogod', 'nagad', 'নগদ', 'rocket', 'রকেট', 'upay', 'উপায়', 'bank', 'ব্যাংক', 'account', 'একাউন্ট', 'ac', 'payment', 'pement', 'পেমেন্ট', 'টাকা', 'advance', 'অগ্রিম', 'এডভান্স', 'method', 'পদ্ধতি', 'billing'],
    // Phone / WhatsApp / Contact
    ['phone', 'ফোন', 'whatsapp', 'হোয়াটসঅ্যাপ', 'নাম্বার', 'number', 'num', 'contact', 'যোগাযোগ', 'call', 'কল', 'meet', 'মিটিং', 'booking', 'schedule', 'kotha', 'কথা'],
    // Pricing / Cost
    ['dam', 'দাম', 'koto', 'কত', 'price', 'pricing', 'rate', 'rates', 'cost', 'খরচ', 'budget', 'বাজেট', 'fee', 'taka', 'package', 'প্যাকেজ', 'charge'],
    // Time / Turnaround / Delivery
    ['somoy', 'shomoy', 'সময়', 'kobe', 'কবে', 'delivery', 'ডেলিভারি', 'turnaround', 'time', 'days', 'দিন', 'hour', 'ঘণ্টা', 'urgent', 'জরুরি', 'fast', 'তাড়াতাড়ি', 'rush'],
    // Bio / About
    ['sakhawat', 'সাখাওয়াত', 'who', 'কে', 'bio', 'বায়ো', 'about', 'সম্পর্কে', 'experience', 'অভিজ্ঞতা', 'profile', 'পরিচয়', 'background', 'ব্যাকগ্রাউন্ড'],
    // Services / Scope
    ['logo', 'লোগো', 'branding', 'ব্র্যান্ডিং', 'ad', 'ads', 'অ্যাড', 'বিজ্ঞাপন', 'creative', 'video', 'ভিডিও', 'reel', 'reels', 'রিল', 'ugc', 'thumbnail', 'থাম্বনেইল', 'cover', 'কভার', 'banner', 'ব্যানার', 'packaging', 'প্যাকেজিং'],
    // Action words: give / tell
    ['deow', 'dao', 'den', 'diyan', 'দেও', 'দাও', 'দিন', 'বলো', 'বলেন', 'tell', 'give', 'send', 'show']
  ];

  tokens.forEach((t) => {
    for (const group of SYNONYM_GROUPS) {
      if (group.includes(t)) {
        group.forEach((syn) => expanded.add(syn));
      }
    }
  });

  return Array.from(expanded);
};

// Smart Chunker: Splits raw knowledge into coherent semantic sections
const parseKnowledgeBlocks = (raw = '') => {
  if (!raw || typeof raw !== 'string') return [];

  // Split by double newlines or section headers (e.g. "Section Name:")
  const rawSections = raw.split(/\n\s*\n+/);
  const blocks = [];

  rawSections.forEach((sec) => {
    const trimmed = sec.trim();
    if (!trimmed) return;

    // If section contains sub-blocks (like multiple headers in one big block), split by lines ending with colon
    const subLines = trimmed.split('\n');
    let currentBlock = [];

    for (let i = 0; i < subLines.length; i++) {
      const line = subLines[i];
      const isHeader = /^[A-Z0-9\s&,/-]{3,40}:/i.test(line.trim()) && i > 0 && currentBlock.length > 0;

      if (isHeader) {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock.join('\n').trim());
          currentBlock = [];
        }
      }
      currentBlock.push(line);
    }

    if (currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n').trim());
    }
  });

  return blocks.filter((b) => b.length > 5);
};

export const querySmartAssistant = ({
  query,
  rules = [],
  customCards = [],
  rawKnowledge = '',
  generalConfig = {},
  lang = 'auto',
}) => {
  if (!query || typeof query !== 'string' || !query.trim()) return '';

  const detectedLang = lang === 'auto' ? detectLanguage(query) : lang;
  const lowerQuery = query.toLowerCase().trim();
  const rawTokens = lowerQuery.split(/[\s,?.!/:;+=_~`'"()]+/).filter((t) => t.length > 0);
  const expandedTokens = expandQuerySynonyms(rawTokens);

  // =========================================================================
  // LAYER 1: MASTER KNOWLEDGE BASE (HIGHEST PRIORITY FOR CUSTOM NOTES & DATA)
  // =========================================================================
  if (rawKnowledge && typeof rawKnowledge === 'string' && rawKnowledge.trim()) {
    const knowledgeBlocks = parseKnowledgeBlocks(rawKnowledge);
    let bestBlock = '';
    let bestBlockScore = 0;

    for (const block of knowledgeBlocks) {
      const lowerBlock = block.toLowerCase();
      let score = 0;

      // Exact raw token match (highest weight)
      for (const token of rawTokens) {
        if (token.length > 1 && lowerBlock.includes(token)) {
          score += 15;
        }
      }

      // Expanded semantic synonyms match
      for (const syn of expandedTokens) {
        if (syn.length > 1 && lowerBlock.includes(syn)) {
          score += 5;
        }
      }

      // Bonus if block contains specific data terms (phone numbers, account numbers, bank names)
      if (/(\d{8,}|dutch|rajshahi|bkash|nagad|bank|account|017\d+)/i.test(block) && (/payment|bkash|bikash|bank|account|number|পেমেন্ট|বিকাশ|টাকা/i.test(lowerQuery))) {
        score += 25;
      }

      if (score > bestBlockScore) {
        bestBlockScore = score;
        bestBlock = block;
      }
    }

    // If match in Master Knowledge Base, return this exact custom block!
    if (bestBlock && bestBlockScore >= 5) {
      return bestBlock;
    }
  }

  // =========================================================================
  // LAYER 2: TOPIC-WISE CUSTOM KNOWLEDGE CARDS
  // =========================================================================
  if (Array.isArray(customCards) && customCards.length > 0) {
    let bestCard = null;
    let bestCardScore = 0;

    for (const card of customCards) {
      const cardKeywords = (card.keywords || '').toLowerCase();
      const cardTitle = (card.title || '').toLowerCase();
      const cardContent = (card.content || '').toLowerCase();
      const cardContentBn = (card.content_bn || '').toLowerCase();

      let score = 0;

      // Keyword match
      const kws = cardKeywords.split(',').map((k) => k.trim()).filter(Boolean);
      for (const kw of kws) {
        if (kw.length > 1 && lowerQuery.includes(kw)) {
          score += 10;
        }
      }

      // Token matches
      for (const token of rawTokens) {
        if (token.length > 1) {
          if (cardKeywords.includes(token)) score += 6;
          if (cardTitle.includes(token)) score += 4;
          if (cardContent.includes(token) || cardContentBn.includes(token)) score += 2;
        }
      }

      // Synonyms
      for (const syn of expandedTokens) {
        if (syn.length > 1 && cardKeywords.includes(syn)) {
          score += 3;
        }
      }

      if (score > bestCardScore) {
        bestCardScore = score;
        bestCard = card;
      }
    }

    if (bestCard && bestCardScore >= 6) {
      if (detectedLang === 'bn' && bestCard.content_bn) {
        return bestCard.content_bn;
      }
      return bestCard.content || bestCard.content_bn;
    }
  }

  // =========================================================================
  // LAYER 3: STRUCTURED RULES MATCH
  // =========================================================================
  if (Array.isArray(rules) && rules.length > 0) {
    for (const rule of rules) {
      if (!rule.keywords) continue;
      const kws = rule.keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
      if (kws.some((kw) => kw.length > 1 && lowerQuery.includes(kw))) {
        if (detectedLang === 'bn' && rule.response_bn) return rule.response_bn;
        return rule.response || rule.response_bn;
      }
    }
  }

  // =========================================================================
  // LAYER 4: FALLBACK TO GENERAL KNOWLEDGE EXTRACT OR DEFAULT MESSAGE
  // =========================================================================
  if (detectedLang === 'bn') {
    return (
      generalConfig.fallback_bn ||
      'যোগাযোগের জন্য ধন্যবাদ! সাখাওয়াত বর্তমানে নতুন প্রজেক্টের জন্য প্রস্তুত আছেন। সরাসরি ১৫ মিনিটের ফ্রি কনসাল্টেশন কল বুক করতে পারেন অথবা হোয়াটসঅ্যাপে মেসেজ দিন (+8801781955355)।'
    );
  }
  return (
    generalConfig.fallback_en ||
    'Thank you for reaching out! Sakhawat is immediately available for remote creative contracts. Feel free to book a quick 15-min strategy call or message directly on WhatsApp (+8801781955355).'
  );
};
