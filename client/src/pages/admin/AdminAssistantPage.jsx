import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Plus,
  Trash2,
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
  Play,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

import { querySmartAssistant, detectLanguage } from '../../services/aiAssistantService';

const DEFAULT_SAMPLE_KNOWLEDGE = `About Md Sakhawat Hossain:
Experienced Senior Creative Graphic Designer with 3+ years of professional track record delivering high-converting ad creatives, distinctive brand identities, and UGC video content for 150+ global brands across Bangladesh, Dubai, and the United States.

Services & Creative Disciplines:
1. Logo & Brand Systems: Custom logo marks, brand guides, color typography hierarchy, Figma/Vector source files (.AI, .EPS, .SVG, .PNG).
2. High-CTR Social Ad Creatives: Facebook, Instagram, TikTok, and Google Ads designed for high conversion, scroll-stopping visual hooks, and low CPA.
3. UGC & Short-Form Video Reels: 9:16 vertical TikTok/Instagram reels, dynamic burned-in kinetic captions, motion cuts, and pacing.
4. Cover & Channel Packaging: Safe-zone calibrated LinkedIn banners, 2560x1440 YouTube headers, and e-commerce storefronts.

Pricing & Turnaround:
- Social Ad Creatives: Starting from $45 (3–5 days standard, 24–48h express rush available).
- Brand Identity & Logo Suite: Starting from $280 (5–7 days with master vector assets).
- Special Discount: 15% off voucher applied for new client partnerships.

Payment & Billing Terms:
- 50% advance upfront before kick-off, remaining 50% upon final approved delivery.
- Accepted Methods: bKash (Personal/Merchant), Nagad, Rocket, Bank Transfer (Bangladesh), Payoneer, Wise, and Stripe.

Contact & Booking:
- WhatsApp / Phone: 01781955355 (+8801781955355)
- Location: Ishurdi, Pabna, Bangladesh (Working Worldwide Remotely)
- Direct Consultation: 1-on-1 strategy call can be booked directly through the website.`;

const DEFAULT_CARDS = [
  {
    id: 'card_1',
    title: 'About Sakhawat & Experience (সাখাওয়াত সম্পর্কিত তথ্য)',
    keywords: 'about, bio, experience, who is, sakhawat, profile, ব্যাকগ্রাউন্ড, অভিজ্ঞতা, পরিচয়, কে, সাখাওয়াত কে, কে সাখাওয়াত',
    content: 'Md Sakhawat Hossain is a Senior Creative Graphic Designer with 3+ years of professional experience delivering 150+ high-converting brand identities and ad creatives for clients in USA, Dubai, and BD.',
    content_bn: 'মোঃ সাখাওয়াত হোসেন একজন সিনিয়র ক্রিয়েটিভ গ্রাফিক ডিজাইনার। তিনি ৩+ বছর ধরে যুক্তরাষ্ট্র, দুবাই এবং বাংলাদেশের ১৫০+ ব্র্যান্ডের জন্য হাই-কনভার্টিং বিজ্ঞাপন ও লোগো ব্র্যান্ডিং তৈরি করে আসছেন।',
  },
  {
    id: 'card_2',
    title: 'Pricing & Packages (কাজের দাম ও প্যাকেজ)',
    keywords: 'rate, rates, price, prices, cost, pricing, how much, fee, package, budget, দাম, প্রাইস, খরচ, টাকা, কতো, কত, dam koto, khoroch koto, budget koto',
    content: 'Our design packages start from $45 (approx 5,000 BDT) for ad creatives and $280 for full brand identities. We also have a 15% discount for first-time clients!',
    content_bn: 'আমাদের অ্যাড ডিজাইন প্যাকেজ শুরু মাত্র $৪৫ (প্রায় ৫,০০০ টাকা) থেকে এবং ফুল ব্র্যান্ড আইডেন্টিটি প্যাকেজ $২৮০ থেকে। প্রথম অর্ডারে পাচ্ছেন স্পেশাল ১৫% ডিসকাউন্ট!',
  },
  {
    id: 'card_3',
    title: 'Payment Methods & Advance (পেমেন্ট পদ্ধতি ও শর্ত)',
    keywords: 'payment, bkash, nagad, advance, bank, payoneer, wise, dollar, পেমেন্ট, বিকাশ, নগদ, অগ্রিম, এডভান্স, টাকা দিব কিভাবে, বিকাশ নম্বর',
    content: 'We require a 50% advance before project kick-off. Accepted methods include bKash, Nagad, Bank Transfer (BD), Payoneer, Wise, and Stripe.',
    content_bn: 'প্রজেক্ট শুরুর পূর্বে ৫০% অগ্রিম পেমেন্ট নেওয়া হয় এবং কাজ শেষ হলে বাকি ৫০%। পেমেন্ট দেওয়া যাবে বিকাশ, নগদ, ব্যাংক ট্রান্সফার, পেওনিয়ার অথবা ওয়াইজ-এর মাধ্যমে।',
  },
  {
    id: 'card_4',
    title: 'Turnaround & Rush Delivery (ডেলিভারি সময়)',
    keywords: 'time, days, delivery, fast, rush, urgent, turnaround, সময়, কত দিন, ডেলিভারি, জরুরি, তাড়াতাড়ি, somoy koto lagbe, kobe pabo, urgent ad',
    content: 'Standard ad creative delivery takes 3–5 days. We also offer 24–48h express priority turnaround for time-sensitive marketing campaigns.',
    content_bn: 'সাধারণত অ্যাড ডিজাইনে সময় লাগে ৩-৫ দিন। আর জরুরি ক্যাম্পেইনের জন্য রয়েছে ২৪-৪৮ ঘণ্টার এক্সপ্রেস ডেলিভারি সুবিধা।',
  },
  {
    id: 'card_5',
    title: 'Direct WhatsApp & Meeting (যোগাযোগ ও মিটিং)',
    keywords: 'contact, whatsapp, phone, call, number, meet, booking, schedule, কথা বলব, নাম্বার, ফোন, হোয়াটসঅ্যাপ, মিটিং, কল, kotha bolbo, phone number',
    content: 'You can directly message Sakhawat on WhatsApp at 01781955355 (+8801781955355) or book a free 15-minute 1-on-1 strategy call on our website!',
    content_bn: 'সরাসরি সাখাওয়াতের হোয়াটসঅ্যাপে মেসেজ দিতে পারেন: 01781955355 (+8801781955355) অথবা ওয়েবসাইট থেকে ফ্রি ১৫ মিনিটের মিটিং শিডিউল করে নিতে পারেন!',
  },
];

export const AdminAssistantPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('brain');

  // Assistant Configuration State
  const [botName, setBotName] = useState('Sakhawat Design Assistant');
  const [welcomeMsgEn, setWelcomeMsgEn] = useState(
    "Hi there! 👋 I'm Sakhawat's Creative Assistant. How can we help you upgrade your brand or boost sales today?"
  );
  const [welcomeMsgBn, setWelcomeMsgBn] = useState(
    'হ্যালো! 👋 আমি সাখাওয়াতের এআই ক্রিয়েটিভ অ্যাসিস্ট্যান্ট। আপনার ব্র্যান্ডিং বা বিজ্ঞাপন ডিজাইনে কীভাবে সাহায্য করতে পারি?'
  );
  const [fallbackMsgEn, setFallbackMsgEn] = useState(
    'Thank you for reaching out! Sakhawat is immediately available for remote creative contracts. Feel free to book a quick 15-min strategy call or message directly on WhatsApp (+8801781955355).'
  );
  const [fallbackMsgBn, setFallbackMsgBn] = useState(
    'যোগাযোগের জন্য ধন্যবাদ! সাখাওয়াত বর্তমানে নতুন প্রজেক্টের জন্য প্রস্তুত আছেন। সরাসরি ১৫ মিনিটের ফ্রি কনসাল্টেশন কল বুক করতে পারেন অথবা হোয়াটসঅ্যাপে মেসেজ দিন (+8801781955355)।'
  );

  // Master Knowledge Base (Raw Text Area)
  const [rawKnowledge, setRawKnowledge] = useState(DEFAULT_SAMPLE_KNOWLEDGE);

  // Topic-wise Custom Cards
  const [customCards, setCustomCards] = useState(DEFAULT_CARDS);

  // Live Simulator State
  const [testMessages, setTestMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'হ্যালো! 👋 আমি সাখাওয়াতের এআই অ্যাসিস্ট্যান্ট। আপনি বাংলা বা ইংরেজিতে যেকোনো প্রশ্ন করে টেস্ট করতে পারেন!',
    },
  ]);
  const [testInput, setTestInput] = useState('');
  const [isSimTyping, setIsSimTyping] = useState(false);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    fetchAssistantSettings();
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [testMessages, isSimTyping]);

  const fetchAssistantSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.success && res.data) {
        const d = res.data;
        if (d.assistant_name) setBotName(d.assistant_name);
        if (d.assistant_welcome_msg) setWelcomeMsgEn(d.assistant_welcome_msg);
        if (d.assistant_welcome_msg_bn) setWelcomeMsgBn(d.assistant_welcome_msg_bn);
        if (d.assistant_fallback_msg) setFallbackMsgEn(d.assistant_fallback_msg);
        if (d.assistant_fallback_msg_bn) setFallbackMsgBn(d.assistant_fallback_msg_bn);
        if (d.assistant_master_knowledge) setRawKnowledge(d.assistant_master_knowledge);

        if (Array.isArray(d.assistant_custom_cards) && d.assistant_custom_cards.length > 0) {
          setCustomCards(d.assistant_custom_cards);
        }
      }
    } catch (err) {
      addToast('Failed to load AI Assistant settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      const payload = {
        assistant_name: botName,
        assistant_welcome_msg: welcomeMsgEn,
        assistant_welcome_msg_bn: welcomeMsgBn,
        assistant_fallback_msg: fallbackMsgEn,
        assistant_fallback_msg_bn: fallbackMsgBn,
        assistant_master_knowledge: rawKnowledge,
        assistant_custom_cards: customCards,
      };

      const res = await api.post('/admin/settings/bulk', { settings: payload });
      if (res.success) {
        addToast('AI Assistant knowledge & training saved successfully!', 'success');
        localStorage.removeItem('sakhawat_cached_settings');
      } else {
        addToast(res.message || 'Failed to save assistant settings', 'error');
      }
    } catch (err) {
      addToast(err.message || 'Error saving assistant settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Card Management
  const addCard = () => {
    const newCard = {
      id: `card_${Date.now()}`,
      title: 'New Knowledge Topic (নতুন বিষয়)',
      keywords: 'keyword1, keyword2, শব্দ১, শব্দ২',
      content: 'Write the accurate answer in English here.',
      content_bn: 'এখানে বাংলায় সঠিক উত্তরটি লিখুন।',
    };
    setCustomCards([newCard, ...customCards]);
  };

  const updateCard = (idx, field, val) => {
    const updated = [...customCards];
    updated[idx][field] = val;
    setCustomCards(updated);
  };

  const removeCard = (idx) => {
    setCustomCards(customCards.filter((_, i) => i !== idx));
  };

  // Simulator Query Execution
  const handleSimSend = (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : testInput;
    if (!query || !query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query.trim(),
    };

    setTestMessages((prev) => [...prev, userMsg]);
    setTestInput('');
    setIsSimTyping(true);

    setTimeout(() => {
      const response = querySmartAssistant({
        query: query.trim(),
        customCards,
        rawKnowledge,
        generalConfig: {
          fallback_en: fallbackMsgEn,
          fallback_bn: fallbackMsgBn,
        },
      });

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response,
      };

      setTestMessages((prev) => [...prev, botMsg]);
      setIsSimTyping(false);
    }, 450);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold uppercase tracking-wider">
            <Bot className="w-3.5 h-3.5" />
            <span>Multilingual Smart AI Trainer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            AI Assistant Training Studio
          </h1>
          <p className="text-xs text-zinc-400">
            Feed custom notes, FAQs, and pricing data. The AI deeply understands and answers in Bangla, English, or Banglish.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRawKnowledge(DEFAULT_SAMPLE_KNOWLEDGE)}
            className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-bold hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
            title="Load sample high-converting design knowledge"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Template</span>
          </button>

          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={handleSaveAll}
            disabled={saving}
            className="font-black px-6 shadow-lg shadow-teal-950/40"
          >
            {saving ? 'Saving AI...' : 'Save AI Knowledge'}
          </Button>
        </div>
      </div>

      {/* Main Studio Grid: Knowledge Center (Left 7 cols) & Live Simulator (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            LEFT COLUMN: KNOWLEDGE MANAGEMENT
            ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('brain')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'brain'
                  ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>1. Master Knowledge Brain</span>
            </button>

            <button
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'topics'
                  ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Custom Topic Cards ({customCards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-teal-500 text-zinc-950 shadow-md shadow-teal-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>3. Greetings & Persona</span>
            </button>
          </div>

          {/* TAB 1: MASTER KNOWLEDGE BRAIN (Freeform Text / Notes) */}
          {activeTab === 'brain' && (
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-teal-400" />
                    <span>Master Knowledge Base & Custom Notes</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    এখানে আপনার অভিজ্ঞতা, কাজের দাম, পেমেন্ট পদ্ধতি, ডেলিভারি টাইম, ফোন নম্বর ইত্যাদি যেকোনো ভাষায় লিখে রাখুন। এআই স্বয়ংক্রিয়ভাবে তা শিখে নেবে!
                  </p>
                </div>

                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Auto-Trained by AI
                </span>
              </div>

              <div className="relative">
                <textarea
                  rows={15}
                  value={rawKnowledge}
                  onChange={(e) => setRawKnowledge(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-200 text-xs font-mono leading-relaxed focus:border-teal-500 outline-none resize-y"
                  placeholder="Paste or write any notes here in Bangla, English, or Banglish..."
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/70 text-[11px] text-zinc-400 space-y-1">
                <p className="font-bold text-teal-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>টিপস: আপনি কীভাবে তথ্য রাখবেন?</span>
                </p>
                <p className="leading-relaxed">
                  প্যারাগ্রাফ আকারে সুন্দর করে লিখুন। যেমন: <em>"লোগো ডিজাইন প্যাকেজ $২৮০ এবং ডেলিভারি ৭ দিন।"</em> অথবা <em>"পেমেন্ট বিকাশ বা ব্যাংকে নেওয়া হয়।"</em> ক্লায়েন্ট যে ভাষাতেই প্রশ্ন করুক না কেন, এআই এই নোটগুলো থেকে নিখুঁত উত্তর বের করে নেবে।
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TOPIC-WISE KNOWLEDGE CARDS */}
          {activeTab === 'topics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Topic-Wise Custom Cards</h3>
                  <p className="text-xs text-zinc-400">
                    নির্দিষ্ট বিষয়ভিত্তিক কি-ওয়ার্ড দিয়ে সুনির্দিষ্ট বাংলা ও ইংরেজি উত্তর সেট করুন।
                  </p>
                </div>

                <Button variant="secondary" size="sm" icon={Plus} onClick={addCard}>
                  Add Topic Card
                </Button>
              </div>

              <div className="space-y-4">
                {customCards.map((card, idx) => (
                  <div
                    key={card.id || idx}
                    className="p-5 rounded-3xl bg-zinc-950/90 border border-zinc-800/80 space-y-4 relative group hover:border-teal-500/40 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => updateCard(idx, 'title', e.target.value)}
                          className="font-bold text-sm text-white bg-transparent border-b border-transparent hover:border-zinc-700 focus:border-teal-500 outline-none px-1"
                        />
                      </div>

                      <button
                        onClick={() => removeCard(idx)}
                        className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">
                        Trigger Keywords (যেকোনো শব্দ লিখুন - কমা দিয়ে আলাদা করুন):
                      </label>
                      <input
                        type="text"
                        value={card.keywords}
                        onChange={(e) => updateCard(idx, 'keywords', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-teal-300 font-mono text-xs focus:border-teal-500 outline-none"
                        placeholder="e.g. দাম, কত, price, cost, rates"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">English Response:</label>
                        <textarea
                          rows={3}
                          value={card.content}
                          onChange={(e) => updateCard(idx, 'content', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-300">বাংলা / Banglish উত্তর:</label>
                        <textarea
                          rows={3}
                          value={card.content_bn}
                          onChange={(e) => updateCard(idx, 'content_bn', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GREETINGS & PERSONA */}
          {activeTab === 'settings' && (
            <div className="p-6 rounded-3xl bg-zinc-950/80 border border-zinc-800/80 space-y-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-teal-400" />
                <span>Assistant Persona & Welcome Greetings</span>
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Assistant Name</label>
                  <input
                    type="text"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Welcome Message (English)</label>
                    <textarea
                      rows={3}
                      value={welcomeMsgEn}
                      onChange={(e) => setWelcomeMsgEn(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">স্বাগতম মেসেজ (বাংলা)</label>
                    <textarea
                      rows={3}
                      value={welcomeMsgBn}
                      onChange={(e) => setWelcomeMsgBn(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Fallback Message (English)</label>
                    <textarea
                      rows={3}
                      value={fallbackMsgEn}
                      onChange={(e) => setFallbackMsgEn(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">ফলব্যাক মেসেজ (বাংলা)</label>
                    <textarea
                      rows={3}
                      value={fallbackMsgBn}
                      onChange={(e) => setFallbackMsgBn(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            RIGHT COLUMN: LIVE INTERACTIVE SIMULATOR (Side-by-side)
            ========================================================================= */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="rounded-3xl bg-zinc-950/95 border-2 border-teal-500/40 overflow-hidden shadow-2xl flex flex-col h-[640px]">
            {/* Simulator Header */}
            <div className="p-4 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-zinc-950 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{botName}</h4>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Testing Simulator</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  setTestMessages([
                    {
                      id: Date.now(),
                      sender: 'bot',
                      text: 'টেস্টার রিসেট করা হয়েছে। যেকোনো প্রশ্ন লিখে এআই-এর উত্তর টেস্ট করুন!',
                    },
                  ])
                }
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Reset Simulator Chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Test Chips */}
            <div className="p-2.5 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <button
                onClick={() => handleSimSend('আপনার কাজের দাম কত?')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-teal-500/20 text-zinc-300 hover:text-teal-300 border border-zinc-700 transition-all shrink-0 cursor-pointer"
              >
                💰 দাম কত?
              </button>
              <button
                onClick={() => handleSimSend('লোগো ডিজাইন করতে কত দিন সময় লাগে?')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-teal-500/20 text-zinc-300 hover:text-teal-300 border border-zinc-700 transition-all shrink-0 cursor-pointer"
              >
                ⏱️ ডেলিভারি সময়?
              </button>
              <button
                onClick={() => handleSimSend('পেমেন্ট কীভাবে নিবেন?')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-teal-500/20 text-zinc-300 hover:text-teal-300 border border-zinc-700 transition-all shrink-0 cursor-pointer"
              >
                💳 পেমেন্ট পদ্ধতি?
              </button>
              <button
                onClick={() => handleSimSend('Who is Md Sakhawat Hossain?')}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-teal-500/20 text-zinc-300 hover:text-teal-300 border border-zinc-700 transition-all shrink-0 cursor-pointer"
              >
                👤 Who is Sakhawat?
              </button>
            </div>

            {/* Messages Scroll View */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar text-xs"
            >
              {testMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-zinc-950 font-semibold rounded-br-none shadow-md'
                        : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isSimTyping && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center gap-1 text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSimSend();
              }}
              className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Type in Bangla or English to test AI..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:border-teal-500 outline-none"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-teal-500 text-zinc-950 font-bold hover:bg-teal-400 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssistantPage;
