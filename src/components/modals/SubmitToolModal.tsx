import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubmitTool } from "@/lib/api/submissions";
import { TOOL_CATEGORIES, getCategoryTranslation } from "@/lib/schemas/tool.schema";
import { useTranslation } from 'react-i18next';

interface SubmitToolModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Use categories from the shared schema for consistency

const PRICING_TYPES = [
  { value: "Free", labelKey: "free" },
  { value: "Freemium", labelKey: "freemium" },
  { value: "Paid", labelKey: "paid" },
  { value: "Contact for Pricing", labelKey: "contactForPricing" },
  { value: "Enterprise", labelKey: "enterprise" },
];

export function SubmitToolModal({ isOpen, onOpenChange }: SubmitToolModalProps) {
  const { t, i18n } = useTranslation(['forms', 'common']);
  const { toast } = useToast();
  const submitTool = useSubmitTool();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Get form values
    const data = {
      toolName: formData.get('toolName') as string,
      description: formData.get('description') as string,
      websiteUrl: formData.get('websiteUrl') as string,
      logoUrl: formData.get('logoUrl') as string,
      category: formData.get('category') as string,
      pricingType: formData.get('pricingType') as string,
      keyHighlights: (formData.get('keyHighlights') as string)
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
      twitterUrl: formData.get('twitterUrl') as string || undefined,
      githubUrl: formData.get('githubUrl') as string || undefined,
    };

    // Validate required fields
    if (!data.toolName || !data.description || !data.websiteUrl || !data.logoUrl || !data.category || !data.pricingType || !data.keyHighlights.length) {
      setFormError(t('forms:submitTool.fillRequired'));
      return;
    }

    // Validate field lengths
    if (data.toolName.length < 2) {
      setFormError(t('forms:submitTool.toolNameMin'));
      return;
    }

    if (data.description.length < 10) {
      setFormError(t('forms:submitTool.descriptionMin'));
      return;
    }

    // Validate URLs
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(data.websiteUrl)) {
      setFormError(t('forms:validation.invalidUrl'));
      return;
    }

    if (!urlRegex.test(data.logoUrl)) {
      setFormError(t('forms:validation.invalidUrl'));
      return;
    }

    if (data.twitterUrl && !urlRegex.test(data.twitterUrl)) {
      setFormError(t('forms:validation.invalidUrl'));
      return;
    }

    if (data.githubUrl && !urlRegex.test(data.githubUrl)) {
      setFormError(t('forms:validation.invalidUrl'));
      return;
    }

    try {
      console.log('Submitting tool:', data);
      await submitTool.mutateAsync(data);
      
      toast({
        title: t('forms:submitTool.submitSuccess'),
        description: t('forms:messages.createSuccess'),
      });
      
      // Reset form and close modal
      form.reset();
      setFormError(null);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting tool:', error);
      let errorMessage = t('forms:submitTool.submitError');
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message);
          if (Array.isArray(errorData.error)) {
            errorMessage = errorData.error[0].message;
          } else {
            errorMessage = error.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }
      
      setFormError(errorMessage);
      toast({
        title: t('forms:submitTool.submitError'),
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-white border-none shadow-2xl md:rounded-lg mobile-rounded max-w-full mx-auto md:mx-0 h-auto md:h-auto max-h-[90vh] md:max-h-none overflow-hidden">
        <div className="relative overflow-hidden">
          {/* Green gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
          
          <DialogHeader className="space-y-2 p-6 pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold tracking-tight">{t('forms:submitTool.title')}</DialogTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onOpenChange(false)} 
                className="md:hidden -mr-2 h-8 w-8 p-0 rounded-full active-scale"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              {t('forms:submitTool.subtitle')}
            </p>
          </DialogHeader>

          {formError && (
            <div className="mx-6 -mt-2 mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-2 overflow-y-auto mobile-scroll-area" style={{ maxHeight: 'calc(80vh - 120px)' }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="toolName">{t('forms:submitTool.toolNameLabel')} *</Label>
                <Input
                  id="toolName"
                  name="toolName"
                  placeholder={t('forms:toolNamePlaceholder')}
                  required
                  minLength={2}
                  className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 rounded-lg"
                />
                <p className="text-xs text-gray-500">{t('forms:validation.minLength', { min: 2 })}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('forms:submitTool.descriptionLabel')} *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder={t('forms:descriptionPlaceholder')}
                  className="h-32 bg-white border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 rounded-lg"
                  required
                  minLength={10}
                />
                <p className="text-xs text-gray-500">{t('forms:validation.minLength', { min: 10 })}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">{t('forms:submitTool.websiteLabel')} *</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    placeholder={t('forms:websiteUrlPlaceholder')}
                    required
                    className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">{t('forms:submitTool.logoLabel')} *</Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    type="url"
                    placeholder={t('forms:websiteUrlPlaceholder')}
                    required
                    className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">{t('forms:submitTool.categoryLabel')} *</Label>
                  <div className="relative">
                    <Select name="category" required>
                      <SelectTrigger className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 rounded-lg">
                        <SelectValue placeholder={t('forms:selectCategory')} />
                      </SelectTrigger>
                      <SelectContent 
                        position="popper" 
                        className="bg-white border-gray-200 shadow-lg max-h-[300px] overflow-y-auto"
                        style={{ zIndex: 9999 }}
                      >
                        {TOOL_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {getCategoryTranslation(category, i18n.language as 'ko' | 'en')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricingType">{t('forms:submitTool.pricingLabel')} *</Label>
                  <div className="relative">
                    <Select name="pricingType" required>
                      <SelectTrigger className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 rounded-lg">
                        <SelectValue placeholder={t('forms:pricingType')} />
                      </SelectTrigger>
                      <SelectContent 
                        position="popper" 
                        className="bg-white border-gray-200 shadow-lg"
                        style={{ zIndex: 9999 }}
                      >
                        {PRICING_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {t(`forms:${type.labelKey}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keyHighlights">{t('forms:submitTool.highlightsLabel')} *</Label>
                <Input
                  id="keyHighlights"
                  name="keyHighlights"
                  placeholder={t('forms:submitTool.highlightsPlaceholder')}
                  required
                  className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 rounded-lg"
                />
                <p className="text-xs text-gray-500">{t('forms:featuresPlaceholder')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">{t('forms:submitTool.twitterLabel')}</Label>
                  <Input
                    id="twitterUrl"
                    name="twitterUrl"
                    type="url"
                    placeholder="https://twitter.com/..."
                    className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">{t('forms:submitTool.githubLabel')}</Label>
                  <Input
                    id="githubUrl"
                    name="githubUrl"
                    type="url"
                    placeholder="https://github.com/..."
                    className="h-10 bg-white border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-green-500 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormError(null);
                  onOpenChange(false);
                }}
                disabled={submitTool.isPending}
                className="bg-white hover:bg-green-50 text-green-500 border-2 border-green-100 rounded-xl font-medium"
              >
                {t('common:cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={submitTool.isPending}
                className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 rounded-xl font-medium"
              >
                {submitTool.isPending ? t('forms:submitTool.submitting') : t('common:submit')}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
} 