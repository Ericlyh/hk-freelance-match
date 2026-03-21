'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import { Search, ChevronDown, MessageSquare, Users, Briefcase, CreditCard, HelpCircle, ArrowRight } from 'lucide-react';

type Category = 'general' | 'freelancer' | 'employer' | 'payment';

interface FAQItem {
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
}

const faqData: Record<Category, FAQItem[]> = {
  general: [
    { question: '香港自由工作者配對平台是什麼？', questionEn: 'What is HK Freelance Match?', answer: '香港自由工作者配對平台是一個連接香港自由工作者與企業家的在地化平台。我們專注於攝影、錄像、平面設計、社交媒體營銷等創意產業領域。', answerEn: 'HK Freelance Match is a localized platform connecting Hong Kong freelancers with businesses. We focus on creative industries like photography, videography, graphic design, and social media marketing.' },
    { question: '平台如何收費？', questionEn: 'How much does the platform cost?', answer: '自由工作者和僱主都可以免費註冊和瀏覽工作機會。我們只在成功配對後收取小額服務費用。', answerEn: 'Both freelancers and employers can register and browse job opportunities for free. We only charge a small service fee after a successful match.' },
    { question: '支援哪些語言？', questionEn: 'What languages are supported?', answer: '平台支援繁體中文（香港）和英文，方便本地及國際客戶使用。', answerEn: 'The platform supports Traditional Chinese (Hong Kong) and English for local and international users.' },
    { question: '如何保障交易安全？', questionEn: 'How is transaction safety ensured?', answer: '所有付款通過 Stripe Connect 處理，資金會在項目完成並確認後才釋放給自由工作者。', answerEn: 'All payments are processed through Stripe Connect. Funds are only released to freelancers after project completion and confirmation.' },
    { question: '可以在手機上使用嗎？', questionEn: 'Can I use it on mobile?', answer: '當然可以！我們的平台是 PWA（漸進式網頁應用），可以在任何設備上流暢使用。', answerEn: 'Absolutely! Our platform is a PWA (Progressive Web App) that works smoothly on any device.' },
    { question: '忘記密碼怎麼辦？', questionEn: 'What if I forgot my password?', answer: '點擊登入頁面的「忘記密碼」連結，輸入你的電郵地址，我們會發送重設密碼的連結給你。', answerEn: 'Click the "Forgot Password" link on the sign-in page, enter your email, and we will send you a password reset link.' },
  ],
  freelancer: [
    { question: '如何開始接案？', questionEn: 'How do I start picking up jobs?', answer: '首先註冊帳戶，然後完成個人檔案（包括技能、作品集和時薪）。之後就可以瀏覽和申請適合自己的工作。', answerEn: 'First register an account, then complete your profile (including skills, portfolio, and hourly rate). Then you can browse and apply for suitable jobs.' },
    { question: '如何提高被僱主選中的機會？', questionEn: 'How do I improve my chances of being hired?', answer: '確保檔案完整、作品集高質量、回覆速度快，並累積正面評價。', answerEn: 'Ensure your profile is complete, portfolio is high quality, responses are fast, and accumulate positive reviews.' },
    { question: '時薪應該如何定價？', questionEn: 'How should I price my hourly rate?', answer: '研究市場行情，考慮你的經驗水平和技能需求程度。剛起步可以定價稍低以累積評價。', answerEn: 'Research market rates, consider your experience level and skill demand. When starting, you can price slightly lower to accumulate reviews.' },
    { question: '可以同時接多個項目嗎？', questionEn: 'Can I take multiple projects at the same time?', answer: '當然可以！平台沒有這個限制。只要你能按時完成每個項目，同時處理多個項目完全沒問題。', answerEn: 'Of course! The platform has no such restrictions. As long as you can complete each project on time, handling multiple projects is completely fine.' },
    { question: '款項什麼時候到帳？', questionEn: 'When will I receive my payment?', answer: '當僱主確認項目完成後，款項會在 2-3 個工作日內釋放到你的帳戶。', answerEn: 'When the employer confirms project completion, funds will be released to your account within 2-3 business days.' },
    { question: '如果僱主拖欠款項怎麼辦？', questionEn: 'What if the employer delays payment?', answer: '可以通過平台訊息功能聯絡僱主。如有爭議，我們的客服團隊可以介入協助調解。', answerEn: 'You can contact the employer through the platform messaging feature. If there is a dispute, our customer service team can intervene to help mediate.' },
  ],
  employer: [
    { question: '如何發佈工作機會？', questionEn: 'How do I post a job?', answer: '註冊並登入後，點擊「發佈工作」按鈕，填寫工作詳情，然後發佈即可。', answerEn: 'After registering and logging in, click the "Post Job" button, fill in the job details, and then publish.' },
    { question: '如何選擇合適的自由工作者？', questionEn: 'How do I choose the right freelancer?', answer: '瀏覽自由工作者的檔案和作品集，查看他們的評價和過往項目。也可以通過訊息功能先溝通了解。', answerEn: 'Browse freelancers profiles and portfolios, check their reviews and past projects. You can also communicate first through the messaging feature.' },
    { question: '預算應該如何訂定？', questionEn: 'How should I set the budget?', answer: '根據項目複雜程度和市場行情訂定。我們提供各類別的參考價格範圍，幫助你做出合理預算。', answerEn: 'Set based on project complexity and market rates. We provide reference price ranges for each category.' },
    { question: '可以修改已發佈的工作嗎？', questionEn: 'Can I edit a published job?', answer: '可以。在「我的工作」頁面找到相關工作，點擊編輯即可修改詳情。', answerEn: 'Yes. Find the relevant job on the "My Jobs" page and click edit to modify the details.' },
    { question: '對工作結果不滿意怎麼辦？', questionEn: 'What if I am not satisfied with the work result?', answer: '首先與自由工作者溝通你所關注的問題。如未能解決，可以聯絡客服，我們會提供調解服務。', answerEn: 'First communicate the issues with the freelancer. If it cannot be resolved, you can contact customer service for mediation.' },
    { question: '需要多久才能找到合適的自由工作者？', questionEn: 'How long does it take to find the right freelancer?', answer: '取決於項目性質和預算，一般來說 24-48 小時內會收到申請，你可以從中挑選合適的人選。', answerEn: 'Depends on the project nature and budget. Generally, you will receive applications within 24-48 hours.' },
  ],
  payment: [
    { question: '支援哪些付款方式？', questionEn: 'What payment methods are supported?', answer: '我們支援信用卡（Visa、Mastercard、American Express）以及 PayPal。', answerEn: 'We support credit cards (Visa, Mastercard, American Express) and PayPal.' },
    { question: '款項會不會被騙？', questionEn: 'Is there any risk of being scammed?', answer: '所有款項由 Stripe Connect 代管，在項目完成並雙方確認前，資金不會釋放給任何一方。', answerEn: 'All funds are held in escrow by Stripe Connect. Funds will not be released until the project is completed and confirmed by both parties.' },
    { question: '如何獲得收據？', questionEn: 'How do I get a receipt?', answer: '每筆交易完成後，系統會自動發送電子收據到你的註冊電郵。', answerEn: 'After each transaction is completed, the system will automatically send an electronic receipt to your registered email.' },
    { question: '可以退款嗎？', questionEn: 'Can I get a refund?', answer: '在項目開始前可以申請取消並退款。項目開始後，退款政策會根據實際情況處理。', answerEn: 'You can apply for cancellation and refund before the project starts. After the project begins, the refund policy will be handled according to the situation.' },
    { question: '平台服務費是多少？', questionEn: 'What is the platform service fee?', answer: '平台向僱主收取項目總金額的 10% 作為服務費用。', answerEn: 'The platform charges employers a 10% service fee on the total project amount.' },
    { question: '外幣付款如何處理？', questionEn: 'How are foreign currency payments handled?', answer: '所有交易以港幣（HKD）結算。如使用其他貨幣付款，Stripe 會自動按匯率轉換。', answerEn: 'All transactions are settled in Hong Kong Dollars (HKD). If paying in other currencies, Stripe will automatically convert at the exchange rate.' },
  ],
};

const categoryLabels: Record<Category, { zh: string; en: string }> = {
  general: { zh: '一般問題', en: 'General' },
  freelancer: { zh: '自由工作者', en: 'For Freelancers' },
  employer: { zh: '僱主', en: 'For Employers' },
  payment: { zh: '付款相關', en: 'Payments' },
};

const categoryIcons: Record<Category, React.ReactNode> = {
  general: <HelpCircle className="h-4 w-4" />,
  freelancer: <Users className="h-4 w-4" />,
  employer: <Briefcase className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
};

function FAQItem({ item, locale }: { item: FAQItem; locale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const isZh = locale === 'zh-HK';

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-left transition-colors hover:text-primary"
      >
        <span className="pr-4 font-medium">{isZh ? item.question : item.questionEn}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pb-4 text-muted-foreground">{isZh ? item.answer : item.answerEn}</div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const params = useParams();
  const locale = params.locale as string;
  const isZh = locale === 'zh-HK';
  const [activeCategory, setActiveCategory] = useState<Category>('general');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = faqData[activeCategory].filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.question.toLowerCase().includes(q) ||
      item.questionEn.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.answerEn.toLowerCase().includes(q)
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">{isZh ? '常見問題' : 'FAQ'}</h1>
        <p className="text-muted-foreground">
          {isZh ? '尋找你問題的答案？如果找不到，可以聯絡我們。' : 'Find answers to your questions? Contact us if you cannot find what you need.'}
        </p>
      </div>

      {/* Search */}
      <div className="mx-auto mb-8 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder={isZh ? '搜尋問題...' : 'Search questions...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {(Object.keys(faqData) as Category[]).map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {categoryIcons[cat]}
            {isZh ? categoryLabels[cat].zh : categoryLabels[cat].en}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {categoryIcons[activeCategory]}
            {isZh ? categoryLabels[activeCategory].zh : categoryLabels[activeCategory].en}
            <Badge variant="secondary" className="ml-auto">{filteredFAQs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          {filteredFAQs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Search className="mx-auto mb-2 h-8 w-8" />
              <p>{isZh ? '沒有找到相關問題' : 'No related questions found'}</p>
            </div>
          ) : (
            filteredFAQs.map((item, index) => (
              <FAQItem key={index} item={item} locale={locale} />
            ))
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Card className="mx-auto max-w-2xl bg-muted/50">
          <CardContent className="flex flex-col items-center py-8">
            <MessageSquare className="mb-4 h-12 w-12 text-primary" />
            <h3 className="mb-2 text-lg font-semibold">{isZh ? '还有其他问题？' : 'Still have questions?'}</h3>
            <p className="mb-4 text-center text-muted-foreground">
              {isZh ? '我們的團隊隨時準備幫助你。' : 'Our team is ready to help you anytime.'}
            </p>
            <Button asChild>
              <Link href={`/${locale}/contact`}>
                {isZh ? '聯絡我們' : 'Contact Us'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
