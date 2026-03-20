import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface SignOutPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SignOutPage({ params }: SignOutPageProps) {
  const { locale } = await params;
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect(`/${locale}`);
}
