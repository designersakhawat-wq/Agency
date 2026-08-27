import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  CheckCircle,
  Calendar,
  Zap,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { api } from '../../services/api';
import { querySmartAssistant, detectLanguage } from '../../services/aiAssistantService';

export const InteractiveChatWidget = ({ onOpenBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [preferredLang, setPreferredLang] = useState('auto'); // auto | en | bn
  const messagesEndRef = useRef(null);

  // Dynamic bilingual config loaded from backend
  const [assistantConfig, setAssistantConfig] = useState({
    name: 'Sakhawat Design Assistant',
    status_en: 'Online • Typically replies in seconds',
    status_bn: 'অনলাইনে আছেন • কয়েক সেকেন্ডে উত্তর পাবেন',
    welcome_en: "Hi there! 👋 I'm Sakhawat's Creative Assistant. How can we help you upgrade your brand or boost sales today?",
    welcome_bn: 'হ্যালো! 👋 আমি সাখাওয়াতের এআই ক্রিয়েটিভ অ্যাসিস্ট্যান্ট। আপনার ব্র্যান্ডিং বা বিজ্ঞাপন ডিজাইনে কীভাবে সাহায্য করতে পারি?',
    fallback_en: "Thank you for reaching out! Sakhawat is available for remote creative contracts. Click below to book a quick call or request an instant project proposal!",
    fallback_bn: 'যোগাযোগের জন্য ধন্যবাদ! সাখাওয়াত বর্তমানে নতুন প্রজেক্টের জন্য প্রস্তুত আছেন। নিচের অপশনে ক্লিক করে সরাসরি ফ্রি মিটিং বুক করতে পারেন অথবা প্রজেক্টের বিস্তারিত জানাতে পারেন!',
    autoPromptSec: 4,
  });

  const [rawKnowledgeText, setRawKnowledgeText] = useState('');
  const [customKnowledgeCards, setCustomKnowledgeCards] = useState([]);

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
      topic: 'Pricing & Rates',
      keywords: 'rate, rates, price, prices, cost, pricing, how much, fee, package, budget, দাম, প্রাইস, খরচ, টাকা, কতো, কত, dam koto, khoroch koto, price koto',
      response: 'Projects start from $45 for ad creatives and $280 for full brand kits. We currently have a special 15% discount voucher available for first-time clients!',
      response_bn: 'বিজ্ঞাপন ডিজাইন প্যাকেজ শুরু $৪৫ (প্রায় ৫,০০০ টাকা) থেকে এবং সম্পূর্ণ ব্র্যান্ড আইডেন্টিটি $২৮০ থেকে। প্রথম অর্ডারে পাচ্ছেন স্পেশাল ১৫% ছাড় ভাউচার!',
      action: 'open_booking',
    },
    {
      id: 'rule_4',
      topic: 'Strategy Call & Booking',
      keywords: 'call, meet, meeting, book, schedule, appointment, consult, talk, strategy, কথা, মিটিং, কল, বুক, কন্টাক্ট, kotha bolbo, meeting korbo, call koro',
      response: "Let's get on a call! You can choose any convenient slot directly in our calendar for a free 15-minute creative roadmap.",
      response_bn: 'চলুন একটি মিটিংয়ে কথা বলি! আমাদের ক্যালেন্ডার থেকে আপনার সুবিধাজনক সময়ে সরাসরি ১৫ মিনিটের একটি ফ্রি স্ট্র্যাটেজি মিটিং শিডিউল করে নিন।',
      action: 'open_booking',
    },
    {
      id: 'rule_5',
      topic: 'Portfolio & Work Samples',
      keywords: 'portfolio, sample, previous work, work, design dekhbo, kaj dekhbo, স্যাম্পল, পোর্টফোলিও, কাজ দেখতে চাই, কাজ',
      response: 'You can explore Sakhawat\'s selected case studies, brand identities, and high-ROI ad creatives directly on our Portfolio page!',
      response_bn: 'আমাদের পোর্টফোলিও সেকশনে গিয়ে সাখাওয়াতের আগের ক্লায়েন্টদের সফল কেস স্টাডি, ব্র্যান্ডিং ও বিজ্ঞাপন ডিজাইনগুলো দেখতে পারেন!',
      action: 'none',
    },
  ]);

  const [quickActions, setQuickActions] = useState([
    {
      label: '⚡ Urgent Ads (জরুরি অ্যাড)',
      query: 'I need urgent high-converting social media ad creatives.',
      query_bn: 'আমার ফেসবুক ও সোশ্যাল মিডিয়ার জন্য জরুরি হাই-কনভার্টিং অ্যাড ডিজাইন লাগবে।',
    },
    {
      label: '🎨 Brand & Logo (লোগো/ব্র্যান্ডিং)',
      query: 'I need a full brand identity, logo, and design system.',
      query_bn: 'আমার ব্র্যান্ডের জন্য নতুন লোগো এবং ফুল ব্র্যান্ড আইডেন্টিটি ডিজাইন করাতে চাই।',
    },
    {
      label: '💰 Pricing & Rates (খরচ ও দাম)',
      query: 'What are your rates and typical delivery timelines?',
      query_bn: 'আপনাদের কাজের প্রাইস রেট এবং ডেলিভারি টাইম কত?',
    },
    {
      label: '📅 Book Meeting (মিটিং বুকিং)',
      query: 'I want to schedule a 15-minute discovery meeting.',
      query_bn: 'আমি প্রজেক্ট নিয়ে কথা বলতে ১৫ মিনিটের একটি ডিসকভারি মিটিং বুক করতে চাই।',
    },
  ]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hi there! 👋 I'm Sakhawat's Creative Assistant. How can we help you upgrade your brand or boost sales today? (বাংলা এবং English উভয় ভাষায় প্রশ্ন করতে পারেন!)",
      time: 'Just now',
    },
  ]);

  // Load trained settings from Backend API
  useEffect(() => {
    const loadTrainedConfig = async () => {
      try {
        const res = await api.get('/settings');
        if (res.success && res.data) {
          const d = res.data;
          const welcomeEn = d.assistant_welcome_msg || assistantConfig.welcome_en;
          const welcomeBn = d.assistant_welcome_msg_bn || assistantConfig.welcome_bn;

          setAssistantConfig({
            name: d.assistant_name || 'Sakhawat Design Assistant',
            status_en: d.assistant_status_text || 'Online • Typically replies in seconds',
            status_bn: d.assistant_status_text_bn || 'অনলাইনে আছেন • কয়েক সেকেন্ডে উত্তর পাবেন',
            welcome_en: welcomeEn,
            welcome_bn: welcomeBn,
            fallback_en: d.assistant_fallback_msg || assistantConfig.fallback_en,
            fallback_bn: d.assistant_fallback_msg_bn || assistantConfig.fallback_bn,
            autoPromptSec: Number(d.assistant_auto_prompt_sec) || 4,
          });

          // Set initial welcome greeting
          setMessages([
            {
              id: 1,
              sender: 'bot',
              text: `${welcomeEn}\n\n🇧🇩 ${welcomeBn}`,
              time: 'Just now',
            },
          ]);

          if (d.assistant_raw_knowledge) {
            setRawKnowledgeText(d.assistant_raw_knowledge);
          }
          if (d.assistant_custom_cards && Array.isArray(d.assistant_custom_cards)) {
            setCustomKnowledgeCards(d.assistant_custom_cards);
          }
          if (d.assistant_knowledge && Array.isArray(d.assistant_knowledge) && d.assistant_knowledge.length > 0) {
            setKnowledgeRules(d.assistant_knowledge);
          }
          if (d.assistant_quick_actions && Array.isArray(d.assistant_quick_actions) && d.assistant_quick_actions.length > 0) {
            setQuickActions(d.assistant_quick_actions);
          }
        }
      } catch (e) {
        // silent fallback to default rules
      }
    };

    loadTrainedConfig();
  }, []);

  // Auto prompt after configured seconds of browsing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasAutoOpened && !isOpen) {
        setHasAutoOpened(true);
      }
    }, (assistantConfig.autoPromptSec || 4) * 1000);
    return () => clearTimeout(timer);
  }, [hasAutoOpened, isOpen, assistantConfig.autoPromptSec]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend) => {
    const rawText = typeof textToSend === 'string' ? textToSend : inputValue;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) return;

    const text = rawText.trim();

    // User message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Detect language of the query (English vs Bengali/Banglish)
    const detectedLang = preferredLang === 'auto' ? detectLanguage(text) : preferredLang;

    // Multi-Layer Knowledge Synthesis Engine
    setTimeout(() => {
      const botResponse = querySmartAssistant({
        query: text,
        rules: knowledgeRules,
        customCards: customKnowledgeCards,
        rawKnowledge: rawKnowledgeText,
        generalConfig: {
          fallback_en: assistantConfig.fallback_en,
          fallback_bn: assistantConfig.fallback_bn,
        },
        lang: detectedLang,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: botResponse,
          lang: detectedLang,
          time: 'Just now',
        },
      ]);
      setIsTyping(false);
    }, 450);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Teaser Bubble Preview when closed - Compact & Sleek */}
      <AnimatePresence>
        {!isOpen && hasAutoOpened && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-16 right-0 mb-2 w-[220px] sm:w-[240px] p-3 rounded-2xl border border-teal-500/40 shadow-2xl bg-[#09090b]/95 backdrop-blur-xl hover:border-teal-400 transition-all z-50 cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            <div className="flex items-center justify-between gap-1.5 mb-1.5 pb-1.5 border-b border-zinc-800/80">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[11px] font-bold text-white truncate">Creative Assistant</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasAutoOpened(false);
                }}
                className="text-zinc-500 hover:text-white p-0.5 rounded transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 group-hover:text-teal-300 transition-colors leading-snug line-clamp-2">
              👋 Need design help, pricing, or ideas? Let's chat!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Widget Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[340px] sm:w-[380px] h-[520px] max-h-[85vh] rounded-3xl glass-panel border border-teal-500/30 shadow-2xl flex flex-col overflow-hidden bg-[#09090b]/98 backdrop-blur-2xl"
          >
            {/* Widget Header */}
            <div className="p-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#09090b]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{assistantConfig.name}</span>
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {preferredLang === 'bn' ? assistantConfig.status_bn : assistantConfig.status_en}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher Button */}
                <button
                  type="button"
                  onClick={() => setPreferredLang((prev) => (prev === 'bn' ? 'en' : 'bn'))}
                  className="px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-[10px] font-bold text-teal-300 hover:border-teal-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Globe className="w-3 h-3" />
                  <span>{preferredLang === 'bn' ? 'বাংলা' : 'EN'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-none shadow-lg'
                        : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-none shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Pills */}
            <div className="px-3 py-2 bg-zinc-950/60 border-t border-zinc-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {quickActions.map((qa, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(preferredLang === 'bn' && qa.query_bn ? qa.query_bn : qa.query)}
                  className="text-[11px] px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-teal-500/20 text-zinc-300 hover:text-teal-200 border border-zinc-800 hover:border-teal-500/40 transition-all text-left flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>{qa.label}</span>
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleFormSubmit} className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask in English, বাংলা অথবা Banglish..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-teal-400"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Toggle Button */}
      {!isOpen && (
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleOpen}
          className="relative w-14 h-14 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white shadow-xl shadow-teal-950/60 flex items-center justify-center border border-teal-400/30 cursor-pointer group"
        >
          <MessageSquare className="w-6 h-6 group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#09090b] animate-pulse" />
        </motion.button>
      )}
    </div>
  );
};

export default InteractiveChatWidget;
