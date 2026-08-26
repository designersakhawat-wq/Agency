import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Plus,
  Trash2,
  Edit2,
  Save,
  MessageSquare,
  Zap,
  CheckCircle,
  HelpCircle,
  Settings,
  Send,
  RefreshCw,
  Sliders,
  Calendar,
  Globe,
  Languages,
  BookOpen,
  FileText,
  Database,
  Layers,
  Check,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// Language detection helper for simulator
const detectLanguage = (text = '') => {
  if (!text) return 'en';
  const banglaRegex = /[\u0980-\u09FF]/;
  if (banglaRegex.test(text)) return 'bn';
  const banglishTokens = [
    'koto', 'dam', 'amar', 'lagbe', 'chai', 'kivabe', 'korbo', 'ki', 'bhai',
    'apnar', 'shomoy', 'kaj', 'dorkar', 'acha', 'ache', 'korte', 'bhalo',
    'keno', 'kobe', 'urgent', 'taka', 'khoroch', 'design', 'banabo', 'parben',
    'thaken', 'kothay', 'software', 'tools', 'payment', 'advance', 'bkash', 'nagad',
    'experience', 'somoy', 'delivery', 'revision', 'phone', 'number', 'whatsapp'
  ];
  const words = text.toLowerCase().split(/[\s,?.!]+/);
  return words.some((w) => banglishTokens.includes(w)) ? 'bn' : 'en';
};

// Smart Knowledge Base Search & Synthesizer
export const querySmartAssistant = ({
  query,
  rules = [],
  customCards = [],
  rawKnowledge = '',
  generalConfig,
  lang = 'en',
}) => {
  if (!query || typeof query !== 'string') return '';

  const lowerQuery = query.toLowerCase().trim();
  const queryTokens = lowerQuery.split(/[\s,?.!]+/).filter((t) => t.length > 1);

  // 1. Check exact/keyword match in structured rules
  for (const rule of rules) {
    if (!rule.keywords) continue;
    const kws = rule.keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
    if (kws.some((kw) => lowerQuery.includes(kw))) {
      if (lang === 'bn' && rule.response_bn) return rule.response_bn;
      return rule.response || rule.response_bn;
    }
  }

  // 2. Score and search in custom knowledge cards (Document Hub)
  let bestCard = null;
  let bestScore = 0;

  for (const card of customCards) {
    const cardText = `${card.title || ''} ${card.content || ''} ${card.content_bn || ''} ${card.keywords || ''}`.toLowerCase();
    let score = 0;
    for (const token of queryTokens) {
      if (cardText.includes(token)) {
        score += token.length > 3 ? 3 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCard = card;
    }
  }

  if (bestCard && bestScore >= 2) {
    if (lang === 'bn' && bestCard.content_bn) return bestCard.content_bn;
    return bestCard.content || bestCard.content_bn;
  }

  // 3. Search in Master Raw Knowledge Text Area
  if (rawKnowledge && typeof rawKnowledge === 'string') {
    const paragraphs = rawKnowledge.split(/\n\s*\n/).filter((p) => p.trim().length > 10);
    let bestPara = '';
    let bestParaScore = 0;

    for (const para of paragraphs) {
      const lowerPara = para.toLowerCase();
      let score = 0;
      for (const token of queryTokens) {
        if (lowerPara.includes(token)) {
          score += token.length > 3 ? 3 : 1;
        }
      }
      if (score > bestParaScore) {
        bestParaScore = score;
        bestPara = para.trim();
      }
    }

    if (bestPara && bestParaScore >= 2) {
      return bestPara;
    }
  }

  // Fallback response
  return lang === 'bn'
    ? generalConfig?.assistant_fallback_msg_bn || 'যোগাযোগের জন্য ধন্যবাদ! বিস্তারিত জানতে আমাদের সাথে সরাসরি ফ্রি মিটিং বুক করতে পারেন।'
    : generalConfig?.assistant_fallback_msg || 'Thank you for reaching out! You can book a free discovery call or contact Sakhawat directly.';
};

export const AdminAssistantPage = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('custom_data'); // custom_data | knowledge | quick_actions | general | simulator
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [deleteRuleTarget, setDeleteRuleTarget] = useState(null);
  const [deleteActionTarget, setDeleteActionTarget] = useState(null);
  const [deleteCardTarget, setDeleteCardTarget] = useState(null);

  // Master Raw Knowledge Text
  const [rawKnowledgeText, setRawKnowledgeText] = useState(
    `About Md Sakhawat Hossain:
Experienced Creative Director & Brand Identity Specialist with 5+ years of experience helping 120+ international e-commerce, tech, and corporate clients scale their revenue.

Skills & Tools:
Proficient in Figma, Adobe Illustrator, Adobe Photoshop, After Effects, CapCut Pro, Blender 3D, and AI-powered workflow automation.

Payment & Billing Policies:
- 50% advance upfront before project kick-off, remaining 50% upon final delivery.
- Accepted Payment Methods: bKash (Personal/Merchant), Nagad, Rocket, Bank Transfer (Bangladesh), Payoneer, Wise, Stripe, and Crypto (USDT).

Turnaround Time & Revision Policy:
- Express Ad Creatives: 24–48 hours turnaround.
- Brand Identity & UI/UX Design: 5–7 business days.
- Unlimited revisions within the project scope until 100% client satisfaction.

Working Hours & Location:
Based in Dhaka, Bangladesh (Timezone GMT+6). Available for remote global contracts across USA, UK, Canada, Dubai (UAE), Europe, and Australia.`
  );

  // Structured Custom Knowledge Cards (Document Hub)
  const [customCards, setCustomCards] = useState([
    {
      id: 'card_1',
      title: '👤 About Sakhawat & Experience (সাখাওয়াত সম্পর্কিত তথ্য)',
      category: 'Bio & Background',
      keywords: 'about, bio, experience, who is, sakhawat, profile, ব্যাকগ্রাউন্ড, অভিজ্ঞতা, পরিচয়, কে, সাখাওয়াত কে',
      content: 'Md Sakhawat Hossain is a Senior Creative Director & Brand Identity Designer with 5+ years of experience delivering high-converting ad creatives and branding for 120+ global brands.',
      content_bn: 'মোঃ সাখাওয়াত হোসেন একজন সিনিয়র ক্রিয়েটিভ ডিরেক্টর এবং ব্র্যান্ড আইডেন্টিটি ডিজাইনার। তিনি বিগত ৫+ বছর ধরে ১২০+ গ্লোবাল ব্র্যান্ড ও ই-কমার্সের জন্য হাই-কনভার্টিং বিজ্ঞাপন এবং ব্র্যান্ড আইডেন্টিটি ডিজাইন করে আসছেন।',
    },
    {
      id: 'card_2',
      title: '💳 Payment Methods & Advance (পেমেন্ট পদ্ধতি ও শর্ত)',
      category: 'Pricing & Billing',
      keywords: 'payment, bkash, nagad, rocket, bank, payoneer, wise, advance, taka, বিকাশ, নগদ, পেমেন্ট, টাকা দিবো কিভাবে, এডভান্স',
      content: 'We accept bKash, Nagad, Bank Transfer (BD), Wise, Payoneer, and Crypto (USDT). Typically 50% advance is required to secure the project slot, and 50% after final approval.',
      content_bn: 'পেমেন্ট মাধ্যম: বিকাশ (bKash), নগদ (Nagad), ব্যাংক ট্রান্সফার, Payoneer, Wise এবং ক্রিপ্টো (USDT)। প্রজেক্ট শুরুর আগে ৫০% অগ্রিম এবং কাজ সম্পন্ন হওয়ার পর বাকি ৫০% পরিশোধ করতে হয়।',
    },
    {
      id: 'card_3',
      title: '🛠️ Software & Design Tools (ব্যবহৃত সফটওয়্যার ও টুলস)',
      category: 'Workflow & Tools',
      keywords: 'software, tools, figma, illustrator, photoshop, after effects, capcut, সফটওয়্যার, টুলস, কি দিয়ে কাজ করেন',
      content: 'Sakhawat uses industry-standard professional tools including Figma, Adobe Illustrator, Adobe Photoshop, After Effects, and Blender 3D for premium creative assets.',
      content_bn: 'সাখাওয়াত প্রফেশনাল ডিজাইন টুলস যেমন: Figma, Adobe Illustrator, Photoshop, After Effects এবং Blender 3D ব্যবহার করে প্রিমিয়াম কোয়ালিটি ডিজাইন তৈরি করেন।',
    },
    {
      id: 'card_4',
      title: '⏱️ Delivery Time & Rush Orders (ডেলিভারি সময় ও এক্সপ্রেস সার্ভিস)',
      category: 'Delivery & Revisions',
      keywords: 'delivery, time, how long, rush, fast, urgent, kobe pabo, সময়, কতদিন, ডেলিভারি, দ্রুত',
      content: 'Social media ad creatives are delivered within 24–48 hours (Rush 24h delivery available). Full brand identities and UI/UX projects take 5–7 business days.',
      content_bn: 'সোশ্যাল মিডিয়া ও বিজ্ঞাপনের কাজ ২৪-৪৮ ঘণ্টার মধ্যে ডেলিভারি দেওয়া হয় (জরুরি ২৪ ঘণ্টার এক্সপ্রেস সুবিধা রয়েছে)। ফুল ব্র্যান্ড আইডেন্টিটি ও ইউআই/ইউএক্স প্রজেক্টে ৫-৭ দিন সময় লাগে।',
    },
    {
      id: 'card_5',
      title: '🔄 Revision Policy (রিভিশন ও সন্তুষ্টি গ্যারান্টি)',
      category: 'Policies',
      keywords: 'revision, changes, edit, refund, guarantee, রিভিশন, পরিবর্তন, ঠিক করে দিবেন, এডিট',
      content: 'We offer unlimited revisions within the project scope until you are 100% happy with the final creative direction.',
      content_bn: 'আপনার ১০০% সন্তুষ্টি নিশ্চিত করতে প্রজেক্ট স্কোপের ভেতর আনলিমিটেড রিভিশন সুবিধা প্রদান করা হয়।',
    },
  ]);

  // Assistant Configuration States (Bilingual)
  const [generalConfig, setGeneralConfig] = useState({
    assistant_name: 'Sakhawat Design Assistant',
    assistant_status_text: 'Online • Typically replies in seconds',
    assistant_status_text_bn: 'অনলাইনে আছেন • কয়েক সেকেন্ডে উত্তর পাবেন',
    assistant_welcome_msg: "Hi there! 👋 I'm Sakhawat's Creative Assistant. How can we help you upgrade your brand or boost sales today?",
    assistant_welcome_msg_bn: 'হ্যালো! 👋 আমি সাখাওয়াতের এআই ক্রিয়েটিভ অ্যাসিস্ট্যান্ট। আপনার ব্র্যান্ডিং বা বিজ্ঞাপন ডিজাইনে কীভাবে সাহায্য করতে পারি?',
    assistant_fallback_msg: "Thank you for reaching out! Sakhawat is available for remote creative contracts. Click below to book a quick call or request an instant project proposal!",
    assistant_fallback_msg_bn: 'যোগাযোগের জন্য ধন্যবাদ! সাখাওয়াত বর্তমানে নতুন প্রজেক্টের জন্য প্রস্তুত আছেন। নিচের অপশনে ক্লিক করে সরাসরি ফ্রি মিটিং বুক করতে পারেন অথবা প্রজেক্টের বিস্তারিত জানাতে পারেন!',
    assistant_auto_prompt_sec: 4,
  });

  const [knowledgeRules, setKnowledgeRules] = useState([
    {
      id: 'rule_1',
      topic: 'Urgent Ad Creatives',
      keywords: 'urgent, ad, ads, creative, creatives, meta, facebook, instagram, tiktok, 24h, rush, fast, ফেসবুক, অ্যাড, বিজ্ঞাপন, এড, এডস, ad lagbe, urgent ad',
      response: 'Awesome! Sakhawat specializes in scroll-stopping ad creatives (Meta, TikTok, Google) with 24–48h express turnaround. Average client CTR increases by 3x. Would you like to lock in a custom quote or jump on a quick call?',
      response_bn: 'অবশ্যই! সাখাওয়াত ফেসবুক, ইনস্টাগ্রাম ও গুগলের জন্য হাই-কনভার্টিং বিজ্ঞাপন ডিজাইন করেন (২৪-৪৮ ঘণ্টার এক্সপ্রেস ডেলিভারি)। আপনার কি জরুরি বিজ্ঞাপন দরকার নাকি কাস্টম কোটেশন চান?',
      action: 'open_booking',
    },
    {
      id: 'rule_2',
      topic: 'Brand Identity & Logo',
      keywords: 'brand, branding, logo, identity, visual, typography, colors, guideline, brand kit, লোগো, ব্র্যান্ডিং, ব্রান্ড, লগো, logo banabo, logo lagbe',
      response: 'Great choice! Our Brand Identity suite includes custom logo marks, typography pairings, color palettes, vector assets, and full Figma guidelines. Delivered in 5–7 days with unlimited revisions.',
      response_bn: 'দারুণ! আমাদের ব্র্যান্ড আইডেন্টিটি প্যাকেজে পাচ্ছেন কাস্টম লোগো, টাইপোগ্রাফি, কালার প্যালেট, ভেক্টর সোর্স ফাইল এবং ফুল ফিগমা গাইডলাইন (আনলিমিটেড রিভিশনসহ ৫-৭ দিনে ডেলিভারি)।',
      action: 'none',
    },
    {
      id: 'rule_3',
      topic: 'Pricing, Rates & Turnaround',
      keywords: 'rate, rates, price, prices, cost, pricing, how much, fee, package, budget, দাম, প্রাইস, খরচ, টাকা, কতো, কত, dam koto, khoroch koto, price koto',
      response: 'Projects start from $45 for ad creatives and $280 for full brand kits. We currently have a special 15% discount voucher available for first-time clients!',
      response_bn: 'বিজ্ঞাপন ডিজাইন প্যাকেজ শুরু $৪৫ (প্রায় ৫,০০০ টাকা) থেকে এবং সম্পূর্ণ ব্র্যান্ড আইডেন্টিটি $২৮০ থেকে। প্রথম অর্ডারে পাচ্ছেন স্পেশাল ১৫% ছাড় ভাউচার!',
      action: 'open_booking',
    },
    {
      id: 'rule_4',
      topic: 'Booking & Meetings',
      keywords: 'call, meet, meeting, book, schedule, appointment, consult, talk, strategy, কথা, মিটিং, কল, বুক, কন্টাক্ট, kotha bolbo, meeting korbo, call koro',
      response: "Let's get on a call! You can choose any convenient slot directly in our calendar for a free 15-minute creative roadmap.",
      response_bn: 'চলুন একটি মিটিংয়ে কথা বলি! আমাদের ক্যালেন্ডার থেকে আপনার সুবিধাজনক সময়ে সরাসরি ১৫ মিনিটের একটি ফ্রি স্ট্র্যাটেজি মিটিং শিডিউল করে নিন।',
      action: 'open_booking',
    },
  ]);

  const [quickActions, setQuickActions] = useState([
    {
      id: 'qa_1',
      label: '⚡ Urgent Ads (জরুরি অ্যাড)',
      query: 'I need urgent high-converting social media ad creatives.',
      query_bn: 'আমার ফেসবুক ও সোশ্যাল মিডিয়ার জন্য জরুরি হাই-কনভার্টিং অ্যাড ডিজাইন লাগবে।',
    },
    {
      id: 'qa_2',
      label: '🎨 Brand & Logo (লোগো/ব্র্যান্ডিং)',
      query: 'I need a full brand identity, logo, and design system.',
      query_bn: 'আমার ব্র্যান্ডের জন্য নতুন লোগো এবং ফুল ব্র্যান্ড আইডেন্টিটি ডিজাইন করাতে চাই।',
    },
    {
      id: 'qa_3',
      label: '💰 Pricing & Rates (খরচ ও দাম)',
      query: 'What are your rates and typical delivery timelines?',
      query_bn: 'আপনাদের কাজের প্রাইস রেট এবং ডেলিভারি টাইম কত?',
    },
    {
      id: 'qa_4',
      label: '📅 Book Meeting (মিটিং বুকিং)',
      query: 'I want to schedule a 15-minute discovery meeting.',
      query_bn: 'আমি প্রজেক্ট নিয়ে কথা বলতে ১৫ মিনিটের একটি ডিসকভারি মিটিং বুক করতে চাই।',
    },
  ]);

  // Simulator States
  const [testMessages, setTestMessages] = useState([
    { id: 1, sender: 'bot', text: 'Simulator Ready! আপনার নলেজ বেসের যেকোনো তথ্য, বায়ো বা সার্ভিস সম্পর্কে বাংলা/English/Banglish-এ প্রশ্ন লিখে টেস্ট করুন।' },
  ]);
  const [testInput, setTestInput] = useState('');
  const [simLang, setSimLang] = useState('auto');

  // Load from database
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await api.get('/settings');
        if (res.success && res.data) {
          const data = res.data;
          setGeneralConfig({
            assistant_name: data.assistant_name || 'Sakhawat Design Assistant',
            assistant_status_text: data.assistant_status_text || 'Online • Typically replies in seconds',
            assistant_status_text_bn: data.assistant_status_text_bn || 'অনলাইনে আছেন • কয়েক সেকেন্ডে উত্তর পাবেন',
            assistant_welcome_msg: data.assistant_welcome_msg || generalConfig.assistant_welcome_msg,
            assistant_welcome_msg_bn: data.assistant_welcome_msg_bn || generalConfig.assistant_welcome_msg_bn,
            assistant_fallback_msg: data.assistant_fallback_msg || generalConfig.assistant_fallback_msg,
            assistant_fallback_msg_bn: data.assistant_fallback_msg_bn || generalConfig.assistant_fallback_msg_bn,
            assistant_auto_prompt_sec: Number(data.assistant_auto_prompt_sec) || 4,
          });

          if (data.assistant_raw_knowledge) {
            setRawKnowledgeText(data.assistant_raw_knowledge);
          }
          if (data.assistant_custom_cards && Array.isArray(data.assistant_custom_cards)) {
            setCustomCards(data.assistant_custom_cards);
          }
          if (data.assistant_knowledge && Array.isArray(data.assistant_knowledge)) {
            setKnowledgeRules(data.assistant_knowledge);
          }
          if (data.assistant_quick_actions && Array.isArray(data.assistant_quick_actions)) {
            setQuickActions(data.assistant_quick_actions);
          }
        }
      } catch (err) {
        console.error('Failed to load assistant settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSaveAll = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setConfirmSaveOpen(true);
  };

  const executeSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {
        assistant_name: generalConfig.assistant_name,
        assistant_status_text: generalConfig.assistant_status_text,
        assistant_status_text_bn: generalConfig.assistant_status_text_bn,
        assistant_welcome_msg: generalConfig.assistant_welcome_msg,
        assistant_welcome_msg_bn: generalConfig.assistant_welcome_msg_bn,
        assistant_fallback_msg: generalConfig.assistant_fallback_msg,
        assistant_fallback_msg_bn: generalConfig.assistant_fallback_msg_bn,
        assistant_auto_prompt_sec: generalConfig.assistant_auto_prompt_sec,
        assistant_raw_knowledge: rawKnowledgeText,
        assistant_custom_cards: customCards,
        assistant_knowledge: knowledgeRules,
        assistant_quick_actions: quickActions,
      };

      const res = await api.post('/settings/admin/bulk', { settings: payload });
      if (res.success) {
        showToast('All Assistant Knowledge Base, Bio & Data saved successfully!', 'success');
        setConfirmSaveOpen(false);
      } else {
        showToast(res.message || 'Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Error saving assistant settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add new custom knowledge card
  const handleAddCard = () => {
    const newCard = {
      id: `card_${Date.now()}`,
      title: '📌 New Knowledge Topic / Data (নতুন টপিক)',
      category: 'Custom Notes',
      keywords: 'keywords, কিওয়ার্ড, শব্দ',
      content: 'Write your detailed notes, background, or facts in English here.',
      content_bn: 'আপনার প্রয়োজনীয় যেকোনো তথ্য, নিয়মাবলী বা উত্তর এখানে বাংলায় লিখুন।',
    };
    setCustomCards([newCard, ...customCards]);
    showToast('New knowledge card added. Write your info and save!', 'success');
  };

  const executeDeleteCard = () => {
    if (!deleteCardTarget) return;
    setCustomCards(customCards.filter((c) => c.id !== deleteCardTarget.id));
    showToast('Knowledge card removed.', 'info');
    setDeleteCardTarget(null);
  };

  // Add rule
  const handleAddRule = () => {
    const newRule = {
      id: `rule_${Date.now()}`,
      topic: 'New Topic Rule',
      keywords: 'keyword1, keyword2, শব্দ',
      response: 'Provide your English response here.',
      response_bn: 'এখানে আপনার বাংলা অথবা ব্যাংলিশ উত্তরটি লিখুন।',
      action: 'none',
    };
    setKnowledgeRules([newRule, ...knowledgeRules]);
  };

  const executeDeleteRule = () => {
    if (!deleteRuleTarget) return;
    setKnowledgeRules(knowledgeRules.filter((r) => r.id !== deleteRuleTarget.id));
    showToast('Training rule removed', 'info');
    setDeleteRuleTarget(null);
  };

  // Simulator Message Handler
  const handleSimulateMessage = (text) => {
    const query = text || testInput;
    if (!query || !query.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setTestMessages((prev) => [...prev, userMsg]);
    setTestInput('');

    const detected = simLang === 'auto' ? detectLanguage(query) : simLang;

    setTimeout(() => {
      const answer = querySmartAssistant({
        query,
        rules: knowledgeRules,
        customCards,
        rawKnowledge: rawKnowledgeText,
        generalConfig,
        lang: detected,
      });

      setTestMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: answer,
          lang: detected,
        },
      ]);
    }, 300);
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-bold font-mono inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              BILINGUAL AI & KNOWLEDGE HUB (ENGLISH + বাংলা)
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">AI Assistant Training & Knowledge CMS</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            আপনার বায়ো, অভিজ্ঞতা, সার্ভিস, পলিসি ও সমস্ত ডাটা যুক্ত করুন — ভিজিটর প্রশ্ন করলেই স্বয়ংক্রিয়ভাবে উত্তর দিবে।
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          icon={Save}
          isLoading={saving}
          onClick={handleSaveAll}
          className="cursor-pointer font-bold shadow-lg shrink-0"
        >
          Save All Training Changes
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('custom_data')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'custom_data'
              ? 'bg-teal-500 text-black font-bold shadow-lg'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Custom Knowledge Hub & Bio Data ({customCards.length} Cards)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'knowledge'
              ? 'bg-teal-500 text-black font-bold shadow-lg'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Keyword Q&A Rules ({knowledgeRules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quick_actions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'quick_actions'
              ? 'bg-teal-500 text-black font-bold shadow-lg'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Quick Prompt Buttons ({quickActions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-teal-500 text-black font-bold shadow-lg'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Persona & Greetings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'bg-teal-500 text-black font-bold shadow-lg'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Live Simulator (EN + বাংলা)</span>
        </button>
      </div>

      {/* TAB 1: CUSTOM KNOWLEDGE BASE & ALL DATA HUB */}
      {activeTab === 'custom_data' && (
        <div className="space-y-6">
          {/* Master Raw Text Training Box */}
          <div className="p-6 rounded-2xl glass-card border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>Master Knowledge Data & Bio (আপনার সমস্ত তথ্য ও নোট একসাথে)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  এখানে আপনার পুরো বায়ো, কাজের অভিজ্ঞতা, পেমেন্ট ও রিভিশন পলিসি, ফোন নম্বর, ব্যবহৃত সফটওয়্যার বা যেকোনো তথ্য বাংলা অথবা ইংরেজিতে পেস্ট করে রাখুন।
                </p>
              </div>
              <span className="text-[11px] text-teal-400 font-mono">Auto-Trained by AI</span>
            </div>

            <div>
              <textarea
                rows={9}
                value={rawKnowledgeText}
                onChange={(e) => setRawKnowledgeText(e.target.value)}
                placeholder="Paste your biography, skills, software, payment methods, past achievements, working hours, or any custom rules here in English, বাংলা, or Banglish..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-xs text-zinc-200 font-sans leading-relaxed focus:outline-none focus:border-teal-400"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                💡 টিপস: আপনি যেভাবে লিখবেন (বাংলা বা ইংরেজি), কোনো ভিজিটর চ্যাটে তা জানতে চাইলে এআই সেই তথ্যের উপর ভিত্তি করে গুছিয়ে উত্তর দিবে।
              </p>
            </div>
          </div>

          {/* Structured Document Cards */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" />
                  <span>Topic-wise Custom Knowledge Cards (বিষয়ভিত্তিক ডাটা কার্ডসমূহ)</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  নির্দিষ্ট বিষয় (যেমন: অভিজ্ঞতা, বিকাশ/ব্যাংক পেমেন্ট, রিভিশন পলিসি, টুলস) অনুযায়ী আলাদা ডাটা কার্ড যুক্ত করুন।
                </p>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={handleAddCard}
                className="cursor-pointer font-bold shrink-0"
              >
                + Add New Knowledge Card
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {customCards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  className="p-5 rounded-2xl glass-card border border-zinc-800 space-y-4 hover:border-teal-500/40 transition-all relative group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => {
                          const updated = [...customCards];
                          updated[idx].title = e.target.value;
                          setCustomCards(updated);
                        }}
                        placeholder="Card Title (e.g. Payment Methods)"
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteCardTarget(card)}
                      className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                      title="Delete Card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Keywords for Fast Detection */}
                  <div>
                    <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Trigger Keywords (যেকোনো শব্দ লিখুন - কমা দিয়ে আলাদা করুন):
                    </label>
                    <input
                      type="text"
                      value={card.keywords || ''}
                      onChange={(e) => {
                        const updated = [...customCards];
                        updated[idx].keywords = e.target.value;
                        setCustomCards(updated);
                      }}
                      placeholder="e.g. payment, bkash, nagad, বিকাশ, নগদ, টাকা"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  {/* Dual Response (EN + BN) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-teal-400 block mb-1">
                        🇬🇧 English Knowledge & Response:
                      </label>
                      <textarea
                        rows={3}
                        value={card.content}
                        onChange={(e) => {
                          const updated = [...customCards];
                          updated[idx].content = e.target.value;
                          setCustomCards(updated);
                        }}
                        placeholder="Detailed information in English..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                        🇧🇩 বাংলা / Banglish তথ্য ও উত্তর:
                      </label>
                      <textarea
                        rows={3}
                        value={card.content_bn}
                        onChange={(e) => {
                          const updated = [...customCards];
                          updated[idx].content_bn = e.target.value;
                          setCustomCards(updated);
                        }}
                        placeholder="বিস্তারিত তথ্য বাংলায় লিখুন..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KEYWORD Q&A RULES */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              When a visitor asks in English or বাংলা/Banglish, the assistant auto-detects language and delivers the corresponding answer!
            </span>
            <Button type="button" variant="primary" size="sm" icon={Plus} onClick={handleAddRule}>
              + Add New Q&A Rule
            </Button>
          </div>

          <div className="space-y-4">
            {knowledgeRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="p-5 rounded-2xl glass-card border border-zinc-800 space-y-4 hover:border-teal-500/40 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={rule.topic}
                      onChange={(e) => {
                        const updated = [...knowledgeRules];
                        updated[idx].topic = e.target.value;
                        setKnowledgeRules(updated);
                      }}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={rule.action}
                      onChange={(e) => {
                        const updated = [...knowledgeRules];
                        updated[idx].action = e.target.value;
                        setKnowledgeRules(updated);
                      }}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-teal-400 cursor-pointer"
                    >
                      <option value="none">Action: None (Just Reply)</option>
                      <option value="open_booking">Action: Open Booking Calendar Modal</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule)}
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                    TRIGGER KEYWORDS (ENGLISH, বাংলা ও BANGLISH - COMMA SEPARATED):
                  </label>
                  <input
                    type="text"
                    value={rule.keywords}
                    onChange={(e) => {
                      const updated = [...knowledgeRules];
                      updated[idx].keywords = e.target.value;
                      setKnowledgeRules(updated);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-teal-300 font-mono focus:outline-none focus:border-teal-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-teal-400 block mb-1">
                      🇬🇧 ENGLISH RESPONSE:
                    </label>
                    <textarea
                      rows={3}
                      value={rule.response}
                      onChange={(e) => {
                        const updated = [...knowledgeRules];
                        updated[idx].response = e.target.value;
                        setKnowledgeRules(updated);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-teal-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                      🇧🇩 বাংলা / BANGLISH RESPONSE:
                    </label>
                    <textarea
                      rows={3}
                      value={rule.response_bn}
                      onChange={(e) => {
                        const updated = [...knowledgeRules];
                        updated[idx].response_bn = e.target.value;
                        setKnowledgeRules(updated);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: QUICK PROMPT BUTTONS */}
      {activeTab === 'quick_actions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Configure 1-click quick suggestion prompt pills displayed above the chat input.
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() =>
                setQuickActions([
                  ...quickActions,
                  {
                    id: `qa_${Date.now()}`,
                    label: '✨ New Prompt Pill',
                    query: 'My custom question in English',
                    query_bn: 'আমার কাস্টম প্রশ্ন বাংলায়',
                  },
                ])
              }
            >
              + Add Quick Prompt
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((qa, idx) => (
              <div key={qa.id} className="p-4 rounded-xl glass-card border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={qa.label}
                    onChange={(e) => {
                      const updated = [...quickActions];
                      updated[idx].label = e.target.value;
                      setQuickActions(updated);
                    }}
                    placeholder="Button Label"
                    className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold text-white flex-1 mr-2"
                  />
                  <button
                    type="button"
                    onClick={() => setQuickActions(quickActions.filter((q) => q.id !== qa.id))}
                    className="p-1 text-rose-400 hover:text-rose-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">English Auto Query:</label>
                  <input
                    type="text"
                    value={qa.query}
                    onChange={(e) => {
                      const updated = [...quickActions];
                      updated[idx].query = e.target.value;
                      setQuickActions(updated);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-emerald-400 block mb-1">বাংলা Auto Query:</label>
                  <input
                    type="text"
                    value={qa.query_bn}
                    onChange={(e) => {
                      const updated = [...quickActions];
                      updated[idx].query_bn = e.target.value;
                      setQuickActions(updated);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PERSONA & GREETINGS */}
      {activeTab === 'general' && (
        <div className="p-6 rounded-2xl glass-card border border-zinc-800 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Bilingual Persona, Welcome & Fallback Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-300 font-semibold block mb-1">Assistant Name</label>
              <input
                type="text"
                value={generalConfig.assistant_name}
                onChange={(e) => setGeneralConfig({ ...generalConfig, assistant_name: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-semibold block mb-1">Auto Prompt Delay (Seconds)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={generalConfig.assistant_auto_prompt_sec}
                onChange={(e) => setGeneralConfig({ ...generalConfig, assistant_auto_prompt_sec: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-teal-400 font-semibold block mb-1">Welcome Message (English)</label>
              <textarea
                rows={3}
                value={generalConfig.assistant_welcome_msg}
                onChange={(e) => setGeneralConfig({ ...generalConfig, assistant_welcome_msg: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-emerald-400 font-semibold block mb-1">Welcome Message (বাংলা)</label>
              <textarea
                rows={3}
                value={generalConfig.assistant_welcome_msg_bn}
                onChange={(e) => setGeneralConfig({ ...generalConfig, assistant_welcome_msg_bn: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-teal-400 font-semibold block mb-1">Fallback Message (English)</label>
              <textarea
                rows={3}
                value={generalConfig.assistant_fallback_msg}
                onChange={(e) => setGeneralConfig({ ...generalConfig, assistant_fallback_msg: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs text-emerald-400 font-semibold block mb-1">Fallback Message (বাংলা)</label>
              <textarea
                rows={3}
                value={generalConfig.assistant_fallback_msg_bn}
                onChange={(e) => setGeneralConfig({ ...generalConfig, assistant_fallback_msg_bn: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LIVE SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl glass-card border border-zinc-800 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-white">Live Knowledge Base AI Tester</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={RefreshCw}
                onClick={() =>
                  setTestMessages([
                    { id: 1, sender: 'bot', text: 'Simulator reset! Type anything in English or বাংলা to test.' },
                  ])
                }
              >
                Reset
              </Button>
            </div>

            {/* Chat Bubble List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
              {testMessages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      m.sender === 'user'
                        ? 'bg-teal-600 text-white'
                        : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSimulateMessage();
              }}
              className="flex gap-2 pt-2 border-t border-zinc-800"
            >
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Type question: e.g. 'Software ki ki use koren?', 'Bkash e advance kivabe dibo?', 'How long does delivery take?'"
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400"
              />
              <Button type="submit" variant="primary" size="sm" icon={Send}>
                Test
              </Button>
            </form>
          </div>

          {/* Prompt Suggestions */}
          <div className="p-6 rounded-2xl glass-card border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Test Questions</h4>
            <p className="text-[11px] text-zinc-400">
              Click any question below to test how the AI extracts answers from your Custom Knowledge Base:
            </p>
            <div className="space-y-2">
              {[
                'Software ki ki use koren?',
                'Bkash or Nagad e payment kora jabe?',
                'How many years of experience does Sakhawat have?',
                'Urgent ad lagbe 24 hours e',
                'Do you provide unlimited revisions?',
                'Where is Sakhawat located?',
              ].map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSimulateMessage(q)}
                  className="w-full text-left p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer block"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={executeSaveAll}
        title="Save AI Assistant Knowledge Base?"
        message="Are you sure you want to save all custom knowledge documents, raw bio data, and training rules? The live chat assistant will immediately begin answering using this data."
        confirmText="Yes, Save All Changes"
        cancelText="Cancel"
        isLoading={saving}
        variant="primary"
      />

      {/* Delete Rule Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteRuleTarget)}
        onClose={() => setDeleteRuleTarget(null)}
        onConfirm={executeDeleteRule}
        title="Delete Q&A Rule"
        message={`Are you sure you want to remove the rule for "${deleteRuleTarget?.topic}"?`}
        confirmText="Delete Rule"
        variant="danger"
      />

      {/* Delete Card Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteCardTarget)}
        onClose={() => setDeleteCardTarget(null)}
        onConfirm={executeDeleteCard}
        title="Delete Knowledge Card"
        message={`Are you sure you want to delete "${deleteCardTarget?.title}"?`}
        confirmText="Delete Card"
        variant="danger"
      />
    </div>
  );
};

export default AdminAssistantPage;
