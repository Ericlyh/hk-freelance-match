/**
 * Seed script for hk-freelance-match
 * Run: npx tsx scripts/seed.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local for INSERT.
 * Without it, runs in read-only mode (shows what would be inserted).
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local manually (simple parser)
const envPath = resolve(__dirname, '..', '.env.local');
let env: Record<string, string> = {};
try {
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const match = line.match(/^([^#][^=]+)=(.*)$/);
    if (match) env[match[1].trim()] = match[2].trim();
  }
} catch {}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || 'https://jskovcdvwfycwklfidje.supabase.co';
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const canWrite = !!(serviceRoleKey && serviceRoleKey !== 'your-service-role-key-here');

if (!canWrite) {
  console.warn('⚠️  No valid SUPABASE_SERVICE_ROLE_KEY — INSERTs will be skipped');
  console.warn('   Get it from: Supabase Dashboard → Settings → API → service_role secret');
}

const supabase = canWrite
  ? createClient(supabaseUrl, serviceRoleKey!, { auth: { persistSession: false } })
  : createClient(supabaseUrl, anonKey);

// Demo user UUIDs (consistent across runs)
const F = {
  chan:   'a1111111-1111-1111-1111-111111111111',
  wong:   'a2222222-2222-2222-2222-222222222222',
  lee:    'a3333333-3333-3333-3333-333333333333',
  cheung: 'a4444444-4444-4444-4444-444444444444',
  wong2:  'a5555555-5555-5555-5555-555555555555',
  lau:    'a6666666-6666-6666-6666-666666666666',
  hui:    'a7777777-7777-7777-7777-777777777777',
  ho:     'a8888888-8888-8888-8888-888888888888',
};

const E = {
  quickcut:   'b1111111-1111-1111-1111-111111111111',
  greenlemon: 'b2222222-2222-2222-2222-222222222222',
  eventpro:   'b3333333-3333-3333-3333-333333333333',
};

async function seed() {
  console.log('🌱 Seeding hk-freelance-match...\n');

  const errors: string[] = [];

  // ── Freelancer profiles ──────────────────────────────────────────────────
  console.log('📋 Freelancer profiles...');
  const freelancerData = [
    { user_id: F.chan,   role: 'freelancer', name: '陳芷欣', bio: '專業婚禮攝影師，8年經驗，服務超過200對新人。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chan', skills: ['photography'], hourly_rate: 700, willing_to_travel: true },
    { user_id: F.wong,   role: 'freelancer', name: '黃浩然', bio: '資深錄像師，專長企業宣傳片及活動紀錄。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wong', skills: ['videography'], hourly_rate: 1000, willing_to_travel: true },
    { user_id: F.lee,    role: 'freelancer', name: '李思琪', bio: '平面設計師，擅長品牌視覺形象設計。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee', skills: ['graphicDesign'], hourly_rate: 500, willing_to_travel: false },
    { user_id: F.cheung, role: 'freelancer', name: '張文偉', bio: '全端網頁開發者，專精 React/Next.js。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cheung', skills: ['webDev'], hourly_rate: 1200, willing_to_travel: false },
    { user_id: F.wong2,  role: 'freelancer', name: '王小明', bio: '社交媒體營銷專員，幫助品牌建立網上影響力。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wong2', skills: ['socialMedia'], hourly_rate: 400, willing_to_travel: true },
    { user_id: F.lau,    role: 'freelancer', name: '劉嘉欣', bio: '專業文案撰寫人，專注市場營銷內容創作。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lau', skills: ['copywriting'], hourly_rate: 450, willing_to_travel: false },
    { user_id: F.hui,    role: 'freelancer', name: '許國強', bio: '活動策劃專家，統籌企業活動及私人派對。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hui', skills: ['eventPlanning'], hourly_rate: 650, willing_to_travel: true },
    { user_id: F.ho,     role: 'freelancer', name: '何佩玲', bio: '品牌策略顧問，協助企業建立獨特品牌形象。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ho', skills: ['branding'], hourly_rate: 750, willing_to_travel: true },
  ];

  for (const p of freelancerData) {
    if (!canWrite) { console.log('   ⏭  ' + p.name + ' (skip)'); continue; }
    const { error } = await supabase.from('profiles').upsert(p, { onConflict: 'user_id', ignoreDuplicates: true });
    if (error) errors.push('freelancer ' + p.name + ': ' + error.message);
    else console.log('   ✅ ' + p.name);
  }

  // ── Employer profiles ────────────────────────────────────────────────────
  console.log('\n🏢 Employer profiles...');
  const employerData = [
    { user_id: E.quickcut,   role: 'employer', name: 'QuickCut Studio', company_name: 'QuickCut Studio', bio: '香港專業影樓，提供婚禮及商業攝影服務。', avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=quickcut' },
    { user_id: E.greenlemon, role: 'employer', name: 'Greenlemon Digital', company_name: 'Greenlemon Digital', bio: '數碼營銷機構，專注社交媒體推廣。', avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=greenlemon' },
    { user_id: E.eventpro,   role: 'employer', name: 'EventPro HK', company_name: 'EventPro HK', bio: '活動策劃公司，舉辦各類企業及私人活動。', avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=eventpro' },
  ];

  for (const p of employerData) {
    if (!canWrite) { console.log('   ⏭  ' + p.name + ' (skip)'); continue; }
    const { error } = await supabase.from('profiles').upsert(p, { onConflict: 'user_id', ignoreDuplicates: true });
    if (error) errors.push('employer ' + p.name + ': ' + error.message);
    else console.log('   ✅ ' + p.name);
  }

  // ── Jobs ─────────────────────────────────────────────────────────────────
  console.log('\n💼 Jobs...');
  const jobData = [
    { employer_id: E.quickcut,   title: '婚禮紀錄攝影',         title_en: 'Wedding Photography',        description: '專業婚禮攝影師，捕捉珍貴時刻，3年以上經驗。', description_en: 'Professional wedding photographer with 3+ years experience.', category: 'photography',    budget_min: 3000,  budget_max: 5000,  status: 'open' },
    { employer_id: E.greenlemon, title: '品牌宣傳片拍攝',       title_en: 'Brand Video Production',     description: '60秒宣傳片，護膚品牌，需要剪輯及調色。',   description_en: '60-second promotional video for skincare brand.', category: 'videography',   budget_min: 8000,  budget_max: 15000, status: 'open' },
    { employer_id: E.eventpro,   title: '周年晚宴視覺設計',     title_en: 'Anniversary Dinner Design',  description: '邀請函、背景板及宣傳物資設計。',          description_en: 'Invitation cards, backdrop and promo materials.', category: 'graphicDesign', budget_min: 5000,  budget_max: 8000,  status: 'open' },
    { employer_id: E.greenlemon, title: '品牌形象網站重設計',   title_en: 'Brand Website Redesign',    description: '全面響應式更新，使用最新技術棧。',        description_en: 'Complete responsive redesign with modern tech stack.', category: 'webDev',       budget_min: 15000, budget_max: 30000, status: 'open' },
    { employer_id: E.quickcut,   title: 'Instagram 推廣活動',   title_en: 'Instagram Campaign',        description: '為婚禮攝影服務策劃一個月推廣活動。',      description_en: 'One-month Instagram campaign for wedding photography.', category: 'socialMedia',  budget_min: 3000,  budget_max: 6000,  status: 'open' },
    { employer_id: E.eventpro,   title: '產品上市新聞稿',       title_en: 'Product Launch Press Release',description: '撰寫中英文新聞稿，介紹全新護膚系列。',    description_en: 'Chinese and English press releases for skincare launch.', category: 'copywriting',  budget_min: 2000,  budget_max: 4000,  status: 'open' },
    { employer_id: E.quickcut,   title: '婚禮統籌服務',         title_en: 'Wedding Planning Service',   description: '協助籌備下月婚禮活動。',                  description_en: 'Help organize upcoming wedding event.', category: 'eventPlanning',budget_min: 8000,  budget_max: 15000, status: 'open' },
    { employer_id: E.greenlemon, title: '品牌策略顧問',         title_en: 'Brand Strategy Consulting', description: '重新定位數碼營銷機構品牌形象。',          description_en: 'Reposition digital marketing agency brand.', category: 'branding',      budget_min: 10000, budget_max: 20000, status: 'open' },
    { employer_id: E.eventpro,   title: '餐廳菜單平面設計',     title_en: 'Restaurant Menu Design',    description: '新開意大利餐廳菜單設計。',                description_en: 'Elegant menu design for new Italian restaurant.', category: 'graphicDesign',budget_min: 2000,  budget_max: 3500,  status: 'open' },
    { employer_id: E.quickcut,   title: '活動紀錄短片製作',     title_en: 'Event Documentary Video',   description: '企業活動紀錄片，約3分鐘。',              description_en: 'Corporate event documentary, approximately 3 minutes.', category: 'videography',  budget_min: 5000,  budget_max: 8000,  status: 'open' },
    { employer_id: E.greenlemon, title: 'Facebook 廣告文案',   title_en: 'Facebook Ad Copywriting',   description: '系列Facebook廣告文案，提高品牌知名度。', description_en: 'Series of Facebook ad copy to increase brand awareness.', category: 'copywriting',  budget_min: 1500,  budget_max: 3000,  status: 'open' },
    { employer_id: E.eventpro,   title: '電子商務網站開發',     title_en: 'E-commerce Website Dev',    description: '小型電子商務網站，銷售活動策劃工具。',    description_en: 'Small e-commerce site for event planning tools.', category: 'webDev',       budget_min: 8000,  budget_max: 12000, status: 'open' },
  ];

  const jobIds: string[] = [];
  for (const job of jobData) {
    if (!canWrite) { console.log('   ⏭  ' + job.title + ' (skip)'); continue; }
    const { data, error } = await supabase.from('jobs').insert(job).select('id').single();
    if (error) errors.push('job ' + job.title + ': ' + error.message);
    else { jobIds.push(data.id); console.log('   ✅ ' + job.title); }
  }

  // ── Applications ─────────────────────────────────────────────────────────
  console.log('\n📝 Applications...');
  const appData = [
    { job_id: jobIds[0],  freelancer_id: F.chan,   proposal: '8年婚禮拍攝經驗，服務超過200對新人，可提供作品集。', status: 'pending' },
    { job_id: jobIds[1],  freelancer_id: F.wong,   proposal: '專精企業宣傳片，多個品牌影片製作經驗。', status: 'pending' },
    { job_id: jobIds[2],  freelancer_id: F.lee,    proposal: '曾為多間餐廳設計視覺形象，作品集豐富。', status: 'accepted' },
    { job_id: jobIds[3],  freelancer_id: F.cheung, proposal: '使用 Next.js + TypeScript，高質量響應式網站。', status: 'pending' },
    { job_id: jobIds[4],  freelancer_id: F.wong2,  proposal: '成功管理多個品牌社交媒體，粉絲增長顯著。', status: 'pending' },
    { job_id: jobIds[5],  freelancer_id: F.lau,    proposal: '專寫美容及護膚相關文案，文字感染力強。', status: 'pending' },
    { job_id: jobIds[6],  freelancer_id: F.hui,    proposal: '曾統籌超過100場婚禮，細節把控到位。', status: 'accepted' },
    { job_id: jobIds[7],  freelancer_id: F.ho,     proposal: '為多間初創公司建立品牌形象，成效顯著。', status: 'pending' },
    { job_id: jobIds[8],  freelancer_id: F.lee,    proposal: '設計風格時尚，適合餐飲行業視覺需求。', status: 'pending' },
    { job_id: jobIds[9],  freelancer_id: F.wong,   proposal: '企業活動拍攝經驗豐富，敘事能力強。', status: 'pending' },
    { job_id: jobIds[10], freelancer_id: F.lau,    proposal: '數碼廣告文案經驗5年，熟悉平台演算法。', status: 'pending' },
    { job_id: jobIds[11], freelancer_id: F.cheung, proposal: '使用 Shopify 開發電子商務網站，速度快品質高。', status: 'pending' },
  ];

  for (const app of appData) {
    if (!canWrite) continue;
    const { error } = await supabase.from('applications').insert(app).select();
    if (error && !error.message.includes('duplicate')) errors.push('application: ' + error.message);
  }
  const appCount = canWrite ? appData.length : appData.length;
  console.log('   ' + (canWrite ? '✅ ' + appCount + ' applications inserted' : '⏭  ' + appCount + ' applications (skip)'));

  // ── Conversations + Messages ─────────────────────────────────────────────
  console.log('\n💬 Conversations...');
  const convData = [
    { id: 'c1111111-1111-1111-1111-111111111111', participant_1: F.chan,   participant_2: E.quickcut },
    { id: 'c2222222-2222-2222-2222-222222222222', participant_1: F.wong,   participant_2: E.greenlemon },
    { id: 'c3333333-3333-3333-3333-333333333333', participant_1: F.lee,    participant_2: E.eventpro },
    { id: 'c4444444-4444-4444-4444-444444444444', participant_1: F.cheung, participant_2: E.greenlemon },
    { id: 'c5555555-5555-5555-5555-555555555555', participant_1: F.wong2,  participant_2: E.quickcut },
    { id: 'c6666666-6666-6666-6666-666666666666', participant_1: F.hui,    participant_2: E.eventpro },
  ];

  for (const c of convData) {
    if (!canWrite) continue;
    await supabase.from('conversations').upsert(c, { onConflict: 'id', ignoreDuplicates: true });
  }

  const msgData = [
    { conversation_id: 'c1111111-1111-1111-1111-111111111111', sender_id: E.quickcut,   content: '你好，見到你對婚禮攝影有興趣，請問你有幾多年經驗？' },
    { conversation_id: 'c1111111-1111-1111-1111-111111111111', sender_id: F.chan,       content: '你好！我有8年婚禮拍攝經驗，曾為超過200對新人服務。' },
    { conversation_id: 'c1111111-1111-1111-1111-111111111111', sender_id: E.quickcut,   content: '很好！請問你使用什麼器材？可以看看你的作品集嗎？' },
    { conversation_id: 'c1111111-1111-1111-1111-111111111111', sender_id: F.chan,       content: '我用Canon R5，已服務500+場婚禮，這是作品集連結。' },
    { conversation_id: 'c2222222-2222-2222-2222-222222222222', sender_id: E.greenlemon, content: '黃先生，我們正在尋找有經驗的錄像師製作宣傳片。' },
    { conversation_id: 'c2222222-2222-2222-2222-222222222222', sender_id: F.wong,       content: '你好！我有多年企業宣傳片經驗，可以提供類似作品參考。' },
    { conversation_id: 'c3333333-3333-3333-3333-333333333333', sender_id: E.eventpro,   content: '李小姐，你的設計風格很適合我們的項目，歡迎報價。' },
    { conversation_id: 'c3333333-3333-3333-3333-333333333333', sender_id: F.lee,        content: '謝謝！我會盡快準備詳細報價單給你參考。' },
    { conversation_id: 'c4444444-4444-4444-4444-444444444444', sender_id: E.greenlemon,  content: '張先生，我們網站項目預算有限，你有什麼建議？' },
    { conversation_id: 'c4444444-4444-4444-4444-444444444444', sender_id: F.cheung,     content: '可以先做落地頁測試市場反應，再逐步擴展功能。' },
    { conversation_id: 'c5555555-5555-5555-5555-555555555555', sender_id: E.quickcut,   content: '王小明，我們需要Instagram增長專家，有相關案例嗎？' },
    { conversation_id: 'c5555555-5555-5555-5555-555555555555', sender_id: F.wong2,       content: '有的！我最近幫婚禮品牌在3個月內增長了2萬粉絲。' },
    { conversation_id: 'c6666666-6666-6666-6666-666666666666', sender_id: E.eventpro,   content: '許先生，婚禮統籌需要即時溝通，你的空檔時間是？' },
    { conversation_id: 'c6666666-6666-6666-6666-666666666666', sender_id: F.hui,        content: '我下個月逢週一至週五都有空，可以安排婚禮統籌會議。' },
  ];

  for (const m of msgData) {
    if (!canWrite) continue;
    await supabase.from('messages').insert(m).select();
  }
  console.log('   ' + (canWrite ? '✅ ' + msgData.length + ' messages in ' + convData.length + ' conversations' : '⏭  ' + msgData.length + ' messages (skip)'));

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════');
  console.log('📊 Seed Summary:');
  console.log('   • 8 freelancer profiles (陳芷欣, 黃浩然, 李思琪, 張文偉, 王小明, 劉嘉欣, 許國強, 何佩玲)');
  console.log('   • 3 employer profiles (QuickCut Studio, Greenlemon Digital, EventPro HK)');
  console.log('   • ' + jobIds.length + ' jobs across all 8 categories');
  console.log('   • ' + appData.length + ' applications');
  console.log('   • ' + convData.length + ' conversations');
  console.log('   • ' + msgData.length + ' messages');
  if (!canWrite) {
    console.log('\n⚠️  READ-ONLY — add SUPABASE_SERVICE_ROLE_KEY to .env.local to insert');
  } else if (errors.length > 0) {
    console.log('\n⚠️  ' + errors.length + ' errors:');
    errors.forEach(function(e: string) { console.log('   • ' + e); });
  } else {
    console.log('\n✅ Seed completed successfully!');
  }
  console.log('══════════════════════════════════════');
}

seed().catch(console.error);
