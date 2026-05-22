'use client';
// components/Footer.tsx
import Link from "next/link";
import { useState } from "react";
import { usePathname } from 'next/navigation';

export default function Footer() {
  const [emailSubscription, setEmailSubscription] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSubscription) {
      setIsSubscribed(true);
      setEmailSubscription("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return (
    <footer className="relative bg-white text-slate-700 overflow-hidden border-t border-slate-100 shadow-sm">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Top Section - Brand & Newsletter */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 pb-12 border-b border-slate-200">
            <div className="mb-8 lg:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">G</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">
                    GoCart
                  </h2>
                  <p className="text-slate-500 text-sm">Premium Shopping Experience</p>
                </div>
              </div>
              <p className="text-slate-600 max-w-md leading-relaxed">
                Tráº£i nghiá»‡m mua sáº¯m Ä‘á»‰nh cao vá»›i GoCart - nÆ¡i cháº¥t lÆ°á»£ng vÃ  dá»‹ch vá»¥ hoÃ n háº£o há»™i tá»¥.
              </p>
            </div>

            {/* Newsletter Subscription */}
            <div className="w-full lg:w-auto">
              <h3 className="text-xl font-semibold mb-4 text-slate-800">
                ÄÄƒng kÃ½ nháº­n tin tá»©c
              </h3>
              <p className="text-slate-600 mb-4 text-sm">
                Nháº­n thÃ´ng tin khuyáº¿n mÃ£i vÃ  sáº£n pháº©m má»›i nháº¥t
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={emailSubscription}
                    onChange={(e) => setEmailSubscription(e.target.value)}
                    placeholder="Nháº­p email cá»§a báº¡n"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-200 shadow-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 whitespace-nowrap"
                >
                  {isSubscribed ? "âœ“ ÄÃ£ Ä‘Äƒng kÃ½!" : "ÄÄƒng kÃ½"}
                </button>
              </form>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Cá»™t 1 - Vá» GoCart */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-6 relative">
                Vá» GoCart
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/about", text: "Giá»›i thiá»‡u", icon: "ðŸ‘¥" },
                  { href: "/careers", text: "Tuyá»ƒn dá»¥ng", icon: "ðŸ’¼" },
                  { href: "/terms", text: "Äiá»u khoáº£n", icon: "ðŸ“‹" },
                  { href: "/privacy", text: "ChÃ­nh sÃ¡ch báº£o máº­t", icon: "ðŸ”’" }
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={item.href} 
                      className="flex items-center space-x-3 text-slate-600 hover:text-emerald-500 transition-colors duration-200 group"
                    >
                      <span className="group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {item.text}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cá»™t 2 - Há»— trá»£ khÃ¡ch hÃ ng */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-6 relative">
                Há»— trá»£ khÃ¡ch hÃ ng
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></div>
              </h3>
              <ul className="space-y-3">
                {[
                  { href: "/help", text: "Trung tÃ¢m trá»£ giÃºp", icon: "â“" },
                  { href: "/returns", text: "Äá»•i tráº£ hÃ ng", icon: "ðŸ”„" },
                  { href: "/shipping", text: "ChÃ­nh sÃ¡ch váº­n chuyá»ƒn", icon: "ðŸšš" },
                  { href: "/warranty", text: "Báº£o hÃ nh sáº£n pháº©m", icon: "ðŸ›¡ï¸" }
                ].map((item, index) => (
                  <li key={index}>
                    <Link 
                      href={item.href} 
                      className="flex items-center space-x-3 text-slate-600 hover:text-emerald-500 transition-colors duration-200 group"
                    >
                      <span className="group-hover:scale-110 transition-transform duration-200">
                        {item.icon}
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform duration-200">
                        {item.text}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cá»™t 3 - ThÃ´ng tin liÃªn há»‡ */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-6 relative">
                LiÃªn há»‡
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></div>
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-slate-600">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <a href="mailto:support@gocart.vn" className="hover:text-emerald-500 transition-colors duration-200">
                      support@gocart.vn
                    </a>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-slate-600">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Hotline</p>
                    <a href="tel:0766403280" className="hover:text-emerald-500 transition-colors duration-200">
                      0766 403 280
                    </a>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-slate-600">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Äá»‹a chá»‰</p>
                    <p className="leading-relaxed">
                      Háº£i Ã‚u 03, VinHomes OceanPark<br />
                      Gia LÃ¢m, HÃ  Ná»™i
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Cá»™t 4 - Máº¡ng xÃ£ há»™i & App */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-800 mb-6 relative">
                Káº¿t ná»‘i vá»›i chÃºng tÃ´i
                <div className="absolute -bottom-2 left-0 w-12 h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full"></div>
              </h3>
              
              {/* Social Media */}
              <div className="space-y-4">
                <p className="text-slate-500 text-sm">Theo dÃµi chÃºng tÃ´i</p>
                <div className="flex space-x-3">
                  {[
                    { 
                      name: "Facebook", 
                      href: "#", 
                      color: "from-blue-600 to-blue-700",
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      )
                    },
                    { 
                      name: "Instagram", 
                      href: "#", 
                      color: "from-pink-500 to-purple-600",
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.435-3.396-1.182-.948-.748-1.479-1.861-1.479-3.097 0-1.237.531-2.349 1.479-3.097.948-.748 2.099-1.182 3.396-1.182 1.297 0 2.448.434 3.396 1.182.948.748 1.479 1.86 1.479 3.097 0 1.236-.531 2.349-1.479 3.097-.948.747-2.099 1.182-3.396 1.182z"/>
                        </svg>
                      )
                    },
                    { 
                      name: "YouTube", 
                      href: "#", 
                      color: "from-red-500 to-red-600",
                      icon: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      )
                    }
                  ].map((social, index) => (
                    <Link
                      key={index}
                      href={social.href}
                      className={`w-12 h-12 bg-gradient-to-r ${social.color} rounded-xl flex items-center justify-center text-white hover:scale-110 hover:rotate-3 transition-all duration-300 shadow-lg hover:shadow-xl`}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile App Download */}
              <div className="space-y-3 pt-4">
                <p className="text-slate-500 text-sm">Táº£i á»©ng dá»¥ng</p>
                <div className="space-y-2">
                  <Link
                    href="#"
                    className="flex items-center space-x-3 bg-slate-100 rounded-xl p-3 hover:bg-slate-200 transition-colors duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-500">Táº£i trÃªn</p>
                      <p className="text-slate-800 font-semibold group-hover:text-emerald-500 transition-colors duration-200">App Store</p>
                    </div>
                  </Link>
                  
                  <Link
                    href="#"
                    className="flex items-center space-x-3 bg-slate-100 rounded-xl p-3 hover:bg-slate-200 transition-colors duration-200 group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-500">Táº£i trÃªn</p>
                      <p className="text-slate-800 font-semibold group-hover:text-emerald-500 transition-colors duration-200">Google Play</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Awards & Certifications */}
          <div className="border-t border-slate-200 pt-8 mb-8">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Chá»©ng nháº­n vÃ  Giáº£i thÆ°á»Ÿng</h4>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-80">
              {[
                { name: "ISO 9001", desc: "Cháº¥t lÆ°á»£ng" },
                { name: "SSL", desc: "Báº£o máº­t" },
                { name: "Top E-commerce", desc: "2024" },
                { name: "Customer Choice", desc: "Award" }
              ].map((cert, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <span className="text-2xl">ðŸ†</span>
                  </div>
                  <p className="text-xs text-slate-700">{cert.name}</p>
                  <p className="text-xs text-slate-500">{cert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-slate-500">
                <p>&copy; 2024 GoCart. Táº¥t cáº£ quyá»n Ä‘Æ°á»£c báº£o lÆ°u.</p>
                <div className="flex items-center space-x-4">
                  <Link href="/privacy" className="hover:text-emerald-500 transition-colors duration-200">
                    ChÃ­nh sÃ¡ch báº£o máº­t
                  </Link>
                  <span>â€¢</span>
                  <Link href="/terms" className="hover:text-emerald-500 transition-colors duration-200">
                    Äiá»u khoáº£n sá»­ dá»¥ng
                  </Link>
                  <span>â€¢</span>
                  <Link href="/cookies" className="hover:text-emerald-500 transition-colors duration-200">
                    Cookie Policy
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <span>Made with</span>
                <span className="text-red-400 animate-pulse">â¤ï¸</span>
                <span>in Vietnam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

