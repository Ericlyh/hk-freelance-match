'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createBrowserClient } from '@/lib/supabase/client';
import { SKILLS, type Skill } from '@/lib/categories';
import { ArrowLeft, ArrowRight, Check, Upload, X } from 'lucide-react';

interface OnboardingWizardProps {
  locale: string;
  userId: string;
  role: 'freelancer' | 'employer';
}

export function OnboardingWizard({ locale, userId, role }: OnboardingWizardProps) {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Freelancer fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [willingToTravel, setWillingToTravel] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Employer fields
  const [companyName, setCompanyName] = useState('');
  const [companyBio, setCompanyBio] = useState('');
  const [website, setWebsite] = useState('');
  const [contactName, setContactName] = useState('');
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);

  const totalSteps = role === 'freelancer' ? 3 : 2;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompanyLogo(file);
      const reader = new FileReader();
      reader.onload = () => setCompanyLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleSkill = (skill: Skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatar) return null;

    const fileExt = avatar.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatar, { upsert: true });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const uploadCompanyLogo = async (userId: string): Promise<string | null> => {
    if (!companyLogo) return null;

    const fileExt = companyLogo.name.split('.').pop();
    const fileName = `${userId}/company-logo.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(fileName, companyLogo, { upsert: true });

    if (uploadError) {
      console.error('Company logo upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('company-logos').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate step 1
      if (role === 'freelancer' && !name.trim()) {
        toast.error(locale === 'zh-HK' ? '請輸入姓名' : 'Please enter your name');
        return;
      }
      if (role === 'employer' && !companyName.trim()) {
        toast.error(locale === 'zh-HK' ? '請輸入公司名稱' : 'Please enter your company name');
        return;
      }
    }

    if (step === 2 && role === 'freelancer') {
      // Validate step 2
      if (selectedSkills.length === 0) {
        toast.error(locale === 'zh-HK' ? '請選擇至少一項技能' : 'Please select at least one skill');
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      let avatarUrl: string | null = null;
      let companyLogoUrl: string | null = null;

      if (role === 'freelancer') {
        avatarUrl = await uploadAvatar(userId);
      } else {
        companyLogoUrl = await uploadCompanyLogo(userId);
      }

      // Update profile
      const profileData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (role === 'freelancer') {
        profileData.name = name;
        profileData.bio = bio;
        profileData.bio_en = bio; // TODO: Add English bio field
        profileData.skills = selectedSkills;
        profileData.hourly_rate = hourlyRate ? parseInt(hourlyRate) : null;
        profileData.willing_to_travel = willingToTravel;
        if (avatarUrl) profileData.avatar_url = avatarUrl;
      } else {
        profileData.company_name = companyName;
        profileData.company_bio = companyBio;
        profileData.website = website;
        profileData.contact_name = contactName;
        if (companyLogoUrl) profileData.company_logo = companyLogoUrl;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
        toast.error(updateError.message);
        setIsLoading(false);
        return;
      }

      toast.success(locale === 'zh-HK' ? '設定完成！' : 'Setup complete!');
      router.push(`/${locale}/dashboard`);
      router.refresh();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error(locale === 'zh-HK' ? '發生錯誤' : 'An error occurred');
    }

    setIsLoading(false);
  };

  const renderFreelancerStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('onboarding.freelancer.name')}</Label>
              <Input
                id="name"
                placeholder={t('onboarding.freelancer.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">{t('onboarding.freelancer.bio')}</Label>
              <Textarea
                id="bio"
                placeholder={t('onboarding.freelancer.bioPlaceholder')}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>{locale === 'zh-HK' ? '頭像' : 'Avatar'}</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback>
                    {name?.charAt(0) || locale === 'zh-HK' ? '用' : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Label htmlFor="avatar-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {locale === 'zh-HK' ? '上傳頭像' : 'Upload Avatar'}
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>{t('onboarding.freelancer.skills')}</Label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map((skill) => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill)}
                  >
                    {selectedSkills.includes(skill) && <Check className="mr-1 h-3 w-3" />}
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">{t('onboarding.freelancer.hourlyRate')}</Label>
              <Input
                id="hourlyRate"
                type="number"
                placeholder={t('onboarding.freelancer.hourlyRatePlaceholder')}
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="willingToTravel"
                checked={willingToTravel}
                onCheckedChange={(checked) => setWillingToTravel(checked as boolean)}
              />
              <Label htmlFor="willingToTravel" className="cursor-pointer">
                {t('onboarding.freelancer.willingToTravel')}
              </Label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="mb-4 font-semibold">
                {locale === 'zh-HK' ? '預覽你的檔案' : 'Preview your profile'}
              </h3>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarPreview || undefined} />
                  <AvatarFallback>{name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">{name || locale === 'zh-HK' ? '你的名字' : 'Your name'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {bio || locale === 'zh-HK' ? '你的簡介' : 'Your bio'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedSkills.slice(0, 5).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {selectedSkills.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{selectedSkills.length - 5}
                      </Badge>
                    )}
                  </div>
                  {hourlyRate && (
                    <p className="mt-2 text-sm font-medium">
                      {hourlyRate} HKD/{locale === 'zh-HK' ? '小時' : 'hr'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {locale === 'zh-HK'
                ? '確認後你的檔案將對其他用戶可見'
                : 'Your profile will be visible to other users after confirmation'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const renderEmployerStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="companyName">{t('onboarding.employer.companyName')}</Label>
              <Input
                id="companyName"
                placeholder={t('onboarding.employer.companyNamePlaceholder')}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactName">{t('onboarding.employer.contactName')}</Label>
              <Input
                id="contactName"
                placeholder={t('onboarding.employer.contactNamePlaceholder')}
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyBio">{t('onboarding.employer.bio')}</Label>
              <Textarea
                id="companyBio"
                placeholder={t('onboarding.employer.bioPlaceholder')}
                value={companyBio}
                onChange={(e) => setCompanyBio(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">{t('onboarding.employer.website')}</Label>
              <Input
                id="website"
                type="url"
                placeholder={t('onboarding.employer.websitePlaceholder')}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{locale === 'zh-HK' ? '公司標誌' : 'Company Logo'}</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={companyLogoPreview || undefined} />
                  <AvatarFallback>
                    {companyName?.charAt(0) || locale === 'zh-HK' ? '公' : 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleCompanyLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="mr-2 h-4 w-4" />
                        {locale === 'zh-HK' ? '上傳標誌' : 'Upload Logo'}
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="rounded-lg border bg-muted/50 p-6">
              <h3 className="mb-4 font-semibold">
                {locale === 'zh-HK' ? '預覽你的公司檔案' : 'Preview your company profile'}
              </h3>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={companyLogoPreview || undefined} />
                  <AvatarFallback>{companyName?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium">
                    {companyName || locale === 'zh-HK' ? '你的公司' : 'Your company'}
                  </h4>
                  {contactName && (
                    <p className="text-sm text-muted-foreground">{contactName}</p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    {companyBio || locale === 'zh-HK' ? '公司簡介' : 'Company bio'}
                  </p>
                  {website && (
                    <p className="mt-2 text-sm text-primary">{website}</p>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {locale === 'zh-HK'
                ? '確認後你可以開始發佈工作'
                : 'You can start posting jobs after confirmation'}
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">
              {role === 'freelancer' ? t('onboarding.freelancerTitle') : t('onboarding.employerTitle')}
            </CardTitle>
            <CardDescription>
              {role === 'freelancer' ? t('onboarding.freelancerSubtitle') : t('onboarding.employerSubtitle')}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {t('onboarding.step', { current: step, total: totalSteps })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {role === 'freelancer' ? renderFreelancerStep() : renderEmployerStep()}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={step === 1}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.previous')}
        </Button>

        {step < totalSteps ? (
          <Button onClick={handleNext}>
            {t('common.next')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? t('common.loading') : t('common.done')}
            <Check className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
