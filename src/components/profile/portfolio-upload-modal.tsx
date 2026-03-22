'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { createBrowserClient } from '@/lib/supabase/client';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { PortfolioItem } from '@/lib/supabase/types';

interface PortfolioUploadModalProps {
  locale: string;
  profileId: string;
  open: boolean;
  onClose: () => void;
  onUploaded?: () => void;
}

export function PortfolioUploadModal({ locale, profileId, open, onClose, onUploaded }: PortfolioUploadModalProps) {
  const t = useTranslations();
  const router = useRouter();
  const supabase = createBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    const newFiles = [...files, ...selected].slice(0, 10); // max 10 at once
    setFiles(newFiles);

    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews(newPreviews);

    // Auto-fill titles from filenames
    setTitles(newFiles.map((f) => f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')));
    setDescriptions(newFiles.map(() => ''));
  }, [files]);

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
    setTitles(titles.filter((_, i) => i !== index));
    setDescriptions(descriptions.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${profileId}/${Date.now()}_${i}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(fileName, file, { upsert: false });

        if (uploadError) {
          // If file already exists, try with unique name
          const uniqueName = `${profileId}/${Date.now()}_${Math.random()}_${i}.${fileExt}`;
          const { error: retryError } = await supabase.storage
            .from('portfolio')
            .upload(uniqueName, file, { upsert: false });

          if (retryError) {
            toast.error(`${locale === 'zh-HK' ? '上傳失敗' : 'Upload failed'}: ${file.name}`);
            continue;
          }

          const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(uniqueName);

          // Insert portfolio item record
          await supabase.from('portfolio_items').insert({
            profile_id: profileId,
            title: titles[i] || file.name,
            title_en: '',
            description: descriptions[i] || null,
            image_url: urlData.publicUrl,
          });
        } else {
          const { data: urlData } = supabase.storage.from('portfolio').getPublicUrl(fileName);

          await supabase.from('portfolio_items').insert({
            profile_id: profileId,
            title: titles[i] || file.name,
            title_en: '',
            description: descriptions[i] || null,
            image_url: urlData.publicUrl,
          });
        }
      }

      toast.success(locale === 'zh-HK' ? '作品已上傳！' : 'Portfolio uploaded!');
      setFiles([]);
      setPreviews([]);
      setTitles([]);
      setDescriptions([]);
      onUploaded?.();
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(locale === 'zh-HK' ? '上傳失敗' : 'Upload failed');
    }

    setUploading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {locale === 'zh-HK' ? '上傳作品' : 'Upload Portfolio'}
          </DialogTitle>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
            if (dropped.length > 0) {
              const newFiles = [...files, ...dropped].slice(0, 10);
              setFiles(newFiles);
              setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
              setTitles(newFiles.map((f) => f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')));
              setDescriptions(newFiles.map(() => ''));
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-medium">
            {locale === 'zh-HK' ? '拖放圖片到這裡，或點擊選擇' : 'Drag images here, or click to select'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {locale === 'zh-HK' ? '支援 JPG, PNG, WebP — 最多10張' : 'Supports JPG, PNG, WebP — max 10 at once'}
          </p>
        </div>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="space-y-4 mt-4">
            {previews.map((src, i) => (
              <div key={i} className="flex gap-4 items-start">
                <img
                  src={src}
                  alt={titles[i] || `Image ${i + 1}`}
                  className="h-24 w-24 rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder={locale === 'zh-HK' ? '作品標題' : 'Title'}
                    value={titles[i] || ''}
                    onChange={(e) => {
                      const newTitles = [...titles];
                      newTitles[i] = e.target.value;
                      setTitles(newTitles);
                    }}
                  />
                  <Textarea
                    placeholder={locale === 'zh-HK' ? '描述（可選）' : 'Description (optional)'}
                    value={descriptions[i] || ''}
                    onChange={(e) => {
                      const newDescs = [...descriptions];
                      newDescs[i] = e.target.value;
                      setDescriptions(newDescs);
                    }}
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => removeFile(i)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            {locale === 'zh-HK' ? '取消' : 'Cancel'}
          </Button>
          <Button onClick={handleUpload} disabled={files.length === 0 || uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {locale === 'zh-HK' ? '上傳中...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {locale === 'zh-HK' ? `上傳 ${files.length} 張作品` : `Upload ${files.length} item${files.length > 1 ? 's' : ''}`}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
