import { SignInForm } from '@/components/auth/auth-form';

interface SignInPageProps {
  params: { locale: string };
}

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = params;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <SignInForm locale={locale} />
    </div>
  );
}
