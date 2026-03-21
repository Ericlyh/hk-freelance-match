import { SignUpForm } from '@/components/auth/auth-form';

interface SignUpPageProps {
  params: { locale: string };
  searchParams: Promise<{ role?: string }>;
}

export default async function SignUpPage({ params, searchParams }: SignUpPageProps) {
  const { locale } = params;
  const { role } = await searchParams;

  const initialRole = role === 'employer' ? 'employer' : role === 'freelancer' ? 'freelancer' : undefined;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <SignUpForm locale={locale} initialRole={initialRole} />
    </div>
  );
}
