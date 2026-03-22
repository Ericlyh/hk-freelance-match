/**
 * Seed script for hk-freelance-match
 * Run: npx tsx scripts/seed.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local for INSERT.
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey!, { auth: { persistSession: false } });
const adminAuth = createClient(supabaseUrl, serviceRoleKey!, { 
  auth: { persistSession: false },
  global: { headers: { 'apikey': serviceRoleKey! } }
});

// Demo user seeds (email, password, name, role)
const freelancerSeeds = [
  { email: 'chan@example.com', password: 'Demo123456!', name: '陳芷欣', bio: '專業婚禮攝影師，8年經驗，服務超過200對新人。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chan', skills: ['photography'], hourly_rate: 700, willing_to_travel: true },
  { email: 'wong@example.com', password: 'Demo123456!', name: '黃浩然', bio: '資深錄像師，專長企業宣傳片及活動紀錄。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wong', skills: ['videography'], hourly_rate: 1000, willing_to_travel: true },
  { email: 'lee@example.com', password: 'Demo123456!', name: '李思琪', bio: '平面設計師，擅長品牌視覺形象設計。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lee', skills: ['graphicDesign'], hourly_rate: 500, willing_to_travel: false },
  { email: 'cheung@example.com', password: 'Demo123456!', name: '張文偉', bio: '全端網頁開發者，專精 React/Next.js。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cheung', skills: ['webDev'], hourly_rate: 1200, willing_to_travel: false },
  { email: 'wong2@example.com', password: 'Demo123456!', name: '王小明', bio: '社交媒體營銷專員，幫助品牌建立網上影響力。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wong2', skills: ['socialMedia'], hourly_rate: 400, willing_to_travel: true },
  { email: 'lau@example.com', password: 'Demo123456!', name: '劉嘉欣', bio: '專業文案撰寫人，專注市場營銷內容創作。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lau', skills: ['copywriting'], hourly_rate: 450, willing_to_travel: false },
  { email: 'hui@example.com', password: 'Demo123456!', name: '許國強', bio: '活動策劃專家，統籌企業活動及私人派對。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hui', skills: ['eventPlanning'], hourly_rate: 650, willing_to_travel: true },
  { email: 'ho@example.com', password: 'Demo123456!', name: '何佩玲', bio: '品牌策略顧問，協助企業建立獨特品牌形象。', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ho', skills: ['branding'], hourly_rate: 750, willing_to_travel: true },
];

const employerSeeds = [
  { email: 'quickcut@example.com', password: 'Demo123456!', name: 'QuickCut Studio', company_name: 'QuickCut Studio', bio: '香港專業影樓，提供婚禮及商業攝影服務。', avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=quickcut' },
  { email: 'greenlemon@example.com', password: 'Demo123456!', name: 'Greenlemon Digital', company_name: 'Greenlemon Digital', bio: '數碼營銷機構，專注社交媒體推廣。', avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=greenlemon' },
  { email: 'eventpro@example.com', password: 'Demo123456!', name: 'EventPro HK', company_name: 'EventPro HK', bio: '活動策劃公司，舉辦各類企業及私人活動。', avatar_url: 'https://api.dicebear.com/7.x/shapes/svg?seed=eventpro' },
];

async function createAuthUser(email: string, password: string, name: string): Promise<string | null> {
  try {
    // Try to create user via Admin API
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey!,
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      }),
    });
    
    if (!response.ok) {
      const existing = await response.json();
      // If user already exists, try to get their ID
      if (existing.msg?.includes('already been registered') || existing.message?.includes('already been registered')) {
        // Try to find by email
        const listResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?filter=email:eq:${email}`, {
          headers: {
            'apikey': serviceRoleKey!,
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
        });
        if (listResponse.ok) {
          const users = await listResponse.json();
          if (users.users && users.users.length > 0) {
            console.log(`   🔄  ${email} (user exists, using existing)`);
            return users.users[0].id;
          }
        }
      }
      console.log(`   ⚠️  ${email}: ${await response.text().then(t => JSON.parse(t).msg || t).catch(() => 'unknown error')}`);
      return null;
    }
    
    const user = await response.json();
    return user.id;
  } catch (e) {
    console.log(`   ⚠️  ${email}: ${e}`);
    return null;
  }
}

async function seed() {
  console.log('🌱 Seeding hk-freelance-match...\n');
  console.log('🔐 Creating auth users (this may take a moment)...\n');

  const errors: string[] = [];

  // Step 1: Create auth users and get their IDs
  const freelancerIds: string[] = [];
  for (const f of freelancerSeeds) {
    if (!canWrite) { freelancerIds.push('skip'); continue; }
    const id = await createAuthUser(f.email, f.password, f.name);
    freelancerIds.push(id!);
    if (id) console.log(`   ✅ ${f.email} → ${id.slice(0, 8)}...`);
  }

  console.log('');
  const employerIds: string[] = [];
  for (const e of employerSeeds) {
    if (!canWrite) { employerIds.push('skip'); continue; }
    const id = await createAuthUser(e.email, e.password, e.name);
    employerIds.push(id!);
    if (id) console.log(`   ✅ ${e.email} → ${id.slice(0, 8)}...`);
  }

  if (!canWrite) {
    console.log('\n⚠️  READ-ONLY — skipping all inserts');
    return;
  }

  // Step 2: Insert freelancer profiles
  console.log('\n📋 Freelancer profiles...');
  for (let i = 0; i < freelancerSeeds.length; i++) {
    const f = freelancerSeeds[i];
    const userId = freelancerIds[i];
    if (!userId) continue;

    const { error } = await supabase.from('profiles').upsert({
      user_id: userId,
      role: 'freelancer',
      name: f.name,
      bio: f.bio,
      avatar_url: f.avatar_url,
      skills: f.skills,
      hourly_rate: f.hourly_rate,
      willing_to_travel: f.willing_to_travel,
    }, { onConflict: 'user_id' });

    if (error) errors.push('freelancer ' + f.name + ': ' + error.message);
    else console.log('   ✅ ' + f.name);
  }

  // Step 3: Insert employer profiles
  console.log('\n🏢 Employer profiles...');
  for (let i = 0; i < employerSeeds.length; i++) {
    const e = employerSeeds[i];
    const userId = employerIds[i];
    if (!userId) continue;

    const { error } = await supabase.from('profiles').upsert({
      user_id: userId,
      role: 'employer',
      name: e.name,
      company_name: e.company_name,
      bio: e.bio,
      avatar_url: e.avatar_url,
    }, { onConflict: 'user_id' });

    if (error) errors.push('employer ' + e.name + ': ' + error.message);
    else console.log('   ✅ ' + e.name);
  }

  // Step 4: Insert jobs
  console.log('\n💼 Jobs...');
  const jobIds: string[] = [];
  const jobData = [
    { employer_idx: 0, title: '婚禮紀錄攝影',         title_en: 'Wedding Photography',        description: '專業婚禮攝影師，捕捉珍貴時刻，3年以上經驗。', description_en: 'Professional wedding photographer with 3+ years experience.', category: 'photography',    budget_min: 3000,  budget_max: 5000,  status: 'open' },
    { employer_idx: 1, title: '品牌宣傳片拍攝',       title_en: 'Brand Video Production',     description: '60秒宣傳片，護膚品牌，需要剪輯及調色。',   description_en: '60-second promotional video for skincare brand.', category: 'videography',   budget_min: 8000,  budget_max: 15000, status: 'open' },
    { employer_idx: 2, title: '周年晚宴視覺設計',     title_en: 'Anniversary Dinner Design',  description: '邀請函、背景板及宣傳物資設計。',          description_en: 'Invitation cards, backdrop and promo materials.', category: 'graphicDesign', budget_min: 5000,  budget_max: 8000,  status: 'open' },
    { employer_idx: 1, title: '品牌形象網站重設計',   title_en: 'Brand Website Redesign',    description: '全面響應式更新，使用最新技術棧。',        description_en: 'Complete responsive redesign with modern tech stack.', category: 'webDev',       budget_min: 15000, budget_max: 30000, status: 'open' },
    { employer_idx: 0, title: 'Instagram 推廣活動',   title_en: 'Instagram Campaign',        description: '為婚禮攝影服務策劃一個月推廣活動。',      description_en: 'One-month Instagram campaign for wedding photography.', category: 'socialMedia',  budget_min: 3000,  budget_max: 6000,  status: 'open' },
    { employer_idx: 2, title: '產品上市新聞稿',       title_en: 'Product Launch Press Release',description: '撰寫中英文新聞稿，介紹全新護膚系列。',    description_en: 'Chinese and English press releases for skincare launch.', category: 'copywriting',  budget_min: 2000,  budget_max: 4000,  status: 'open' },
    { employer_idx: 0, title: '婚禮統籌服務',         title_en: 'Wedding Planning Service',   description: '協助籌備下月婚禮活動。',                  description_en: 'Help organize upcoming wedding event.', category: 'eventPlanning',budget_min: 8000,  budget_max: 15000, status: 'open' },
    { employer_idx: 1, title: '品牌策略顧問',         title_en: 'Brand Strategy Consulting', description: '重新定位數碼營銷機構品牌形象。',          description_en: 'Reposition digital marketing agency brand.', category: 'branding',      budget_min: 10000, budget_max: 20000, status: 'open' },
    { employer_idx: 2, title: '餐廳菜單平面設計',     title_en: 'Restaurant Menu Design',    description: '新開意大利餐廳菜單設計。',                description_en: 'Elegant menu design for new Italian restaurant.', category: 'graphicDesign',budget_min: 2000,  budget_max: 3500,  status: 'open' },
    { employer_idx: 0, title: '活動紀錄短片製作',     title_en: 'Event Documentary Video',   description: '企業活動紀錄片，約3分鐘。',              description_en: 'Corporate event documentary, approximately 3 minutes.', category: 'videography',  budget_min: 5000,  budget_max: 8000,  status: 'open' },
    { employer_idx: 1, title: 'Facebook 廣告文案',   title_en: 'Facebook Ad Copywriting',   description: '系列Facebook廣告文案，提高品牌知名度。', description_en: 'Series of Facebook ad copy to increase brand awareness.', category: 'copywriting',  budget_min: 1500,  budget_max: 3000,  status: 'open' },
    { employer_idx: 2, title: '電子商務網站開發',     title_en: 'E-commerce Website Dev',    description: '小型電子商務網站，銷售活動策劃工具。',    description_en: 'Small e-commerce site for event planning tools.', category: 'webDev',       budget_min: 8000,  budget_max: 12000, status: 'open' },
  ];

  for (const job of jobData) {
    const employerId = employerIds[job.employer_idx];
    if (!employerId) continue;
    const { data, error } = await supabase.from('jobs').insert({
      employer_id: employerId,
      title: job.title,
      title_en: job.title_en,
      description: job.description,
      description_en: job.description_en,
      category: job.category,
      budget_min: job.budget_min,
      budget_max: job.budget_max,
      status: job.status,
    }).select('id').single();
    if (error) errors.push('job ' + job.title + ': ' + error.message);
    else { jobIds.push(data.id); console.log('   ✅ ' + job.title); }
  }

  // Step 5: Applications
  console.log('\n📝 Applications...');
  const appData = [
    { job_idx: 0,  freelancer_idx: 0, proposal: '8年婚禮拍攝經驗，服務超過200對新人，可提供作品集。', status: 'pending' },
    { job_idx: 1,  freelancer_idx: 1, proposal: '專精企業宣傳片，多個品牌影片製作經驗。', status: 'pending' },
    { job_idx: 2,  freelancer_idx: 2, proposal: '曾為多間餐廳設計視覺形象，作品集豐富。', status: 'accepted' },
    { job_idx: 3,  freelancer_idx: 3, proposal: '使用 Next.js + TypeScript，高質量響應式網站。', status: 'pending' },
    { job_idx: 4,  freelancer_idx: 4, proposal: '成功管理多個品牌社交媒體，粉絲增長顯著。', status: 'pending' },
    { job_idx: 5,  freelancer_idx: 5, proposal: '專寫美容及護膚相關文案，文字感染力強。', status: 'pending' },
    { job_idx: 6,  freelancer_idx: 6, proposal: '曾統籌超過100場婚禮，細節把控到位。', status: 'accepted' },
    { job_idx: 7,  freelancer_idx: 7, proposal: '為多間初創公司建立品牌形象，成效顯著。', status: 'pending' },
    { job_idx: 8,  freelancer_idx: 2, proposal: '設計風格時尚，適合餐飲行業視覺需求。', status: 'pending' },
    { job_idx: 9,  freelancer_idx: 1, proposal: '企業活動拍攝經驗豐富，敘事能力強。', status: 'pending' },
    { job_idx: 10, freelancer_idx: 5, proposal: '數碼廣告文案經驗5年，熟悉平台演算法。', status: 'pending' },
    { job_idx: 11, freelancer_idx: 3, proposal: '使用 Shopify 開發電子商務網站，速度快品質高。', status: 'pending' },
  ];

  let appCount = 0;
  for (const app of appData) {
    const jobId = jobIds[app.job_idx];
    const freelancerId = freelancerIds[app.freelancer_idx];
    if (!jobId || !freelancerId) continue;
    const { error } = await supabase.from('applications').insert({
      job_id: jobId,
      freelancer_id: freelancerId,
      proposal: app.proposal,
      status: app.status,
    });
    if (error && !error.message.includes('duplicate')) errors.push('application: ' + error.message);
    else appCount++;
  }
  console.log('   ✅ ' + appCount + ' applications inserted');

  // Step 6: Conversations + Messages
  console.log('\n💬 Conversations...');
  const convData = [
    { p1: freelancerIds[0], p2: employerIds[0] },
    { p1: freelancerIds[1], p2: employerIds[1] },
    { p1: freelancerIds[2], p2: employerIds[2] },
    { p1: freelancerIds[3], p2: employerIds[1] },
    { p1: freelancerIds[4], p2: employerIds[0] },
    { p1: freelancerIds[6], p2: employerIds[2] },
  ];

  const convIds: string[] = [];
  for (const c of convData) {
    if (!c.p1 || !c.p2) continue;
    const { data, error } = await supabase.from('conversations').insert({
      participant_1: c.p1,
      participant_2: c.p2,
    }).select('id').single();
    if (!error && data) { convIds.push(data.id); }
  }
  console.log('   ✅ ' + convIds.length + ' conversations');

  const msgData = [
    { conv_idx: 0, sender_idx: 3, content: '你好，見到你對婚禮攝影有興趣，請問你有幾多年經驗？' },
    { conv_idx: 0, sender_idx: 0, content: '你好！我有8年婚禮拍攝經驗，曾為超過200對新人服務。' },
    { conv_idx: 0, sender_idx: 3, content: '很好！請問你使用什麼器材？可以看看你的作品集嗎？' },
    { conv_idx: 0, sender_idx: 0, content: '我用Canon R5，已服務500+場婚禮，這是作品集連結。' },
    { conv_idx: 1, sender_idx: 4, content: '黃先生，我們正在尋找有經驗的錄像師製作宣傳片。' },
    { conv_idx: 1, sender_idx: 1, content: '你好！我有多年企業宣傳片經驗，可以提供類似作品參考。' },
    { conv_idx: 2, sender_idx: 5, content: '李小姐，你的設計風格很適合我們的項目，歡迎報價。' },
    { conv_idx: 2, sender_idx: 2, content: '謝謝！我會盡快準備詳細報價單給你參考。' },
    { conv_idx: 3, sender_idx: 4, content: '張先生，我們網站項目預算有限，你有什麼建議？' },
    { conv_idx: 3, sender_idx: 3, content: '可以先做落地頁測試市場反應，再逐步擴展功能。' },
    { conv_idx: 4, sender_idx: 3, content: '王小明，我們需要Instagram增長專家，有相關案例嗎？' },
    { conv_idx: 4, sender_idx: 4, content: '有的！我最近幫婚禮品牌在3個月內增長了2萬粉絲。' },
    { conv_idx: 5, sender_idx: 5, content: '許先生，婚禮統籌需要即時溝通，你的空檔時間是？' },
    { conv_idx: 5, sender_idx: 6, content: '我下個月逢週一至週五都有空，可以安排婚禮統籌會議。' },
  ];

  let msgCount = 0;
  for (const m of msgData) {
    const convId = convIds[m.conv_idx];
    const senderId = freelancerIds[m.sender_idx] || employerIds[m.sender_idx - 3];
    if (!convId || !senderId) continue;
    const { error } = await supabase.from('messages').insert({
      conversation_id: convId,
      sender_id: senderId,
      content: m.content,
    });
    if (!error) msgCount++;
  }
  console.log('   ✅ ' + msgCount + ' messages');

  // Summary
  console.log('\n══════════════════════════════════════');
  console.log('📊 Seed Summary:');
  console.log('   • ' + freelancerSeeds.length + ' freelancer accounts created');
  console.log('   • ' + employerSeeds.length + ' employer accounts created');
  console.log('   • ' + jobIds.length + ' jobs across all 8 categories');
  console.log('   • ' + appCount + ' applications');
  console.log('   • ' + convIds.length + ' conversations');
  console.log('   • ' + msgCount + ' messages');
  console.log('\n🔑 Demo login credentials:');
  console.log('   Freelancer: chan@example.com / Demo123456!');
  console.log('   Employer: quickcut@example.com / Demo123456!');
  if (errors.length > 0) {
    console.log('\n⚠️  ' + errors.length + ' errors:');
    errors.forEach(e => console.log('   • ' + e));
  } else {
    console.log('\n✅ Seed completed successfully!');
  }
  console.log('══════════════════════════════════════');
}

seed().catch(console.error);
