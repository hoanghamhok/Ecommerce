'use client';
// components/FAQSection.tsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "LÃ m tháº¿ nÃ o Ä‘á»ƒ Ä‘áº·t hÃ ng?",
    a: "Báº¡n chá»‰ cáº§n chá»n sáº£n pháº©m, thÃªm vÃ o giá» hÃ ng vÃ  tiáº¿n hÃ nh thanh toÃ¡n theo hÆ°á»›ng dáº«n.",
  },
  {
    q: "TÃ´i cÃ³ thá»ƒ Ä‘á»•i tráº£ sáº£n pháº©m khÃ´ng?",
    a: "GoCart há»— trá»£ Ä‘á»•i tráº£ trong vÃ²ng 7 ngÃ y vá»›i Ä‘iá»u kiá»‡n sáº£n pháº©m cÃ²n nguyÃªn tem, há»™p.",
  },
  {
    q: "CÃ³ nhá»¯ng hÃ¬nh thá»©c thanh toÃ¡n nÃ o?",
    a: "Báº¡n cÃ³ thá»ƒ thanh toÃ¡n qua tháº», vÃ­ Ä‘iá»‡n tá»­, chuyá»ƒn khoáº£n hoáº·c thanh toÃ¡n khi nháº­n hÃ ng.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="max-w-3xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">CÃ¢u há»i thÆ°á»ng gáº·p</h2>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-5">
            <button
              className="flex items-center justify-between w-full text-left font-semibold text-lg text-blue-700"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              {faq.q}
              <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${open === idx ? "rotate-180" : ""}`} />
            </button>
            {open === idx && (
              <div className="mt-3 text-slate-600 text-base">{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

