'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createBrowserClient } from '@/lib/supabase/client';
import { SKILLS, TIME_SLOTS, type Skill } from '@/lib/categories';
import { toast } from 'sonner';
import { Upload, Plus, X, Calendar, MapPin } from 'lucide-react';
import type { Profile, PortfolioItem, Availability } from '@/lib/supabase/types';

interface FreelancerProfileProps {
  locale: string;
  profile: Profile;
  userId: string;
  isOwnProfile: boolean;
  portfolio?: PortfolioItem[];
  availability?: Availability[];
}

export function FreelancerProfile({
  locale,
  profile,
  userId,
  isOwnProfile,
  portfolio = [],
  availability = [],
}: FreelancerProfileProps) {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createBrowserClient();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Edit form state
  const [name, setName] = useState(profile.name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [bioEn, setBioEn] = useState(profile.bio_en || '');
  const [skills, setSkills] = useState<Skill[]>((profile.skills as unknown as Skill[] | undefined) || []);
  const [hourlyRate, setHourlyRate] = useState(profile.hourly_rate?.toString() || '');
  const [willingToTravel, setWillingToTravel] = useState(profile.willing_to_travel || false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const toggleSkill = (skill: Skill) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const avatarUrl = await uploadAvatar();

      const updateData: Record<string, unknown> = {
        name,
        bio,
        bio_en: bioEn,
        skills,
        hourly_rate: hourlyRate ? parseInt(hourlyRate) : null,
        willing_to_travel: willingToTravel,
        updated_at: new Date().toISOString(),
      };

      if (avatarUrl) {
        updateData.avatar_url = avatarUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', userId);

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t('profile.profileUpdated'));
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(locale === 'zh-HK' ? '發生錯誤' : 'An error occurred');
    }

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarPreview || profile.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl">
                    {name?.charAt(0) || profile.name?.charAt(0) || 'F'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute -bottom-2 -right-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button size="icon" variant="secondary" className="rounded-full" asChild>
                        <span>
                          <Upload className="h-4 w-4" />
                        </span>
                      </Button>
                    </Label>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('onboarding.freelancer.name')}</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('onboarding.freelancer.namePlaceholder')}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{locale === 'zh-HK' ? '時薪（HKD）' : 'Hourly Rate (HKD)'}</Label>
                        <Input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          placeholder={t('onboarding.freelancer.hourlyRatePlaceholder')}
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
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
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold">{profile.name || locale === 'zh-HK' ? '自由工作者' : 'Freelancer'}</h1>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                      {profile.hourly_rate && (
                        <Badge variant="outline">
                          {profile.hourly_rate} HKD/{locale === 'zh-HK' ? '小時' : 'hr'}
                        </Badge>
                      )}
                      {profile.willing_to_travel && (
                        <Badge variant="outline">
                          <MapPin className="mr-1 h-3 w-3" />
                          {locale === 'zh-HK' ? '願意出差' : 'Willing to travel'}
                        </Badge>
                      )}
                    </div>
                    {profile.bio && (
                      <p className="mt-4 text-muted-foreground">{profile.bio}</p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/${locale}/messages?user=${userId}`}>
                          {t('jobs.contact')}
                        </Link>
                      </Button>
                      {isOwnProfile && (
                        <Button onClick={() => setIsEditing(true)}>
                          {t('profile.editProfile')}
                        </Button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    {isLoading ? t('common.loading') : t('common.save')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="skills" className="mb-6">
          <TabsList>
            <TabsTrigger value="skills">{t('profile.skills')}</TabsTrigger>
            <TabsTrigger value="portfolio">{t('profile.portfolio')}</TabsTrigger>
            <TabsTrigger value="availability">{t('profile.availability')}</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.skills')}</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {SKILLS.map((skill) => (
                      <Badge
                        key={skill}
                        variant={skills.includes(skill) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    )) || (
                      <p className="text-muted-foreground">
                        {locale === 'zh-HK' ? '暫無技能' : 'No skills added'}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="mt-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('profile.portfolio')}</CardTitle>
                  {isOwnProfile && isEditing && (
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      {t('onboarding.freelancer.addPortfolio')}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {portfolio.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {portfolio.map((item) => (
                      <div key={item.id} className="overflow-hidden rounded-lg border">
                        <img
                          src={item.image_url}
                          alt={locale === 'zh-HK' ? item.title : (item.title_en || item.title)}
                          className="h-40 w-full object-cover"
                        />
                        <div className="p-2">
                          <p className="font-medium">{locale === 'zh-HK' ? item.title : (item.title_en || item.title)}</p>
                          {item.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {locale === 'zh-HK' ? '暫無作品' : 'No portfolio items yet'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.availability')}</CardTitle>
                <CardDescription>
                  {locale === 'zh-HK' ? '顯示你的空檔時間以便預約' : 'Show your availability for booking'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availability.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(
                      availability.reduce((acc, slot) => {
                        if (!acc[slot.date]) acc[slot.date] = [];
                        acc[slot.date].push(slot);
                        return acc;
                      }, {} as Record<string, Availability[]>)
                    ).map(([date, slots]) => (
                      <div key={date}>
                        <h4 className="mb-2 font-medium">
                          {new Date(date).toLocaleDateString()}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot) => (
                            <Badge
                              key={slot.id}
                              variant={slot.is_available ? 'default' : 'outline'}
                            >
                              {slot.time_slot}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {locale === 'zh-HK' ? '暫無空檔時間' : 'No availability set'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
