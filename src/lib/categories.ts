export const JOB_CATEGORIES = [
  'photography',
  'videography',
  'graphicDesign',
  'socialMedia',
  'copywriting',
  'eventPlanning',
  'webDev',
  'branding',
] as const;

export type JobCategory = typeof JOB_CATEGORIES[number];

export const SKILLS = [
  // Photography
  'portrait-photography',
  'product-photography',
  'event-photography',
  'wedding-photography',
  'street-photography',
  'photo-editing',
  'lightroom',
  'photoshop',

  // Videography
  'video-editing',
  'color-grading',
  'motion-graphics',
  'animation',
  'drone-footage',
  'youtube-editing',
  'short-form-video',

  // Graphic Design
  'logo-design',
  'brand-identity',
  'illustration',
  'ui-design',
  'print-design',
  'packaging-design',
  'infographic-design',

  // Social Media
  'social-media-management',
  'content-creation',
  'influencer-marketing',
  'community-management',
  'social-media-analytics',

  // Copywriting
  'content-writing',
  'technical-writing',
  'creative-writing',
  'marketing-copy',
  'seo-writing',
  'ghostwriting',

  // Event Planning
  'corporate-events',
  'wedding-planning',
  'event-coordination',
  'venue-selection',
  'event-marketing',

  // Web Development
  'frontend-development',
  'backend-development',
  'full-stack-development',
  'wordpress',
  'shopify',
  'web-design',
  'mobile-development',
  'api-development',

  // Branding
  'brand-strategy',
  'brand-positioning',
  'brand-naming',
  'brand-guidelines',
  'rebranding',
] as const;

export type Skill = typeof SKILLS[number];

export const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
] as const;

export type TimeSlot = typeof TIME_SLOTS[number];
