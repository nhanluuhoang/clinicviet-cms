import {
  Globe2,
  Image,
  Newspaper,
  Palette,
  Save,
  Search,
  Stethoscope,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { LandingConfigFormState } from '../hooks/use-landing-config-form'
import { ColorField } from './color-field'
import { Field } from './landing-field'
import { Section } from './landing-section'

export function LandingConfigForm({
  data,
  publishedPosts,
  postsOpen,
  setPostsOpen,
  postsLoading,
  postsError,
  refetchPosts,
  config,
  clinicName,
  setClinicName,
  mutation,
  set,
}: Pick<
  LandingConfigFormState,
  | 'data'
  | 'publishedPosts'
  | 'postsOpen'
  | 'setPostsOpen'
  | 'postsLoading'
  | 'postsError'
  | 'refetchPosts'
  | 'config'
  | 'clinicName'
  | 'setClinicName'
  | 'mutation'
  | 'set'
>) {
  const { t } = useTranslation()

  return (
    <div className='w-full space-y-5'>
      <Section
        icon={Palette}
        title={t('messages.brand')}
        description={t(
          'messages.theClinicNameComesFromClinicInformationTheWebsi'
        )}
      >
        <Field
          label={t('messages.clinicName')}
          required
          value={clinicName}
          onChange={setClinicName}
        />
        <Field
          label={t('messages.shortMessage')}
          value={config.tagline}
          onChange={(value) => set('tagline', value)}
        />
        <Field
          label='URL logo'
          value={config.logoUrl}
          onChange={(value) => set('logoUrl', value)}
        />
        <div className='grid grid-cols-2 gap-3'>
          <ColorField
            label={t('messages.primaryColor')}
            value={config.primaryColor}
            onChange={(value) => set('primaryColor', value)}
          />
          <ColorField
            label={t('messages.accentColor')}
            value={config.accentColor}
            onChange={(value) => set('accentColor', value)}
          />
        </div>
      </Section>

      <Section
        icon={Image}
        title={t('messages.heroSection')}
        description={t('messages.theFirstContentVisitorsSee')}
      >
        <Field
          label={t('messages.title')}
          value={config.heroTitle}
          onChange={(value) => set('heroTitle', value)}
        />
        <Field
          label={t('messages.highlight')}
          value={config.heroHighlightedText}
          onChange={(value) => set('heroHighlightedText', value)}
        />
        <Field
          label={t('messages.heroImageUrl')}
          value={config.heroImageUrl}
          onChange={(value) => set('heroImageUrl', value)}
          wide
        />
        <div className='space-y-2 md:col-span-2'>
          <Label>{t('messages.description')}</Label>
          <Textarea
            value={config.heroDescription}
            onChange={(event) => set('heroDescription', event.target.value)}
          />
        </div>
      </Section>

      <Section
        icon={Stethoscope}
        title={t('messages.doctorInCharge')}
        description={t('messages.suitableForSingleDoctorClinics')}
      >
        <Field
          label={t('messages.doctorSName')}
          value={config.doctorName}
          onChange={(value) => set('doctorName', value)}
        />
        <Field
          label={t('messages.specialty')}
          value={config.doctorSpecialty}
          onChange={(value) => set('doctorSpecialty', value)}
        />
        <Field
          label={t('messages.doctorPhotoUrl')}
          value={config.doctorImageUrl}
          onChange={(value) => set('doctorImageUrl', value)}
          wide
        />
        <div className='space-y-2 md:col-span-2'>
          <Label>{t('messages.introduction')}</Label>
          <Textarea
            value={config.doctorDescription}
            onChange={(event) => set('doctorDescription', event.target.value)}
          />
        </div>
      </Section>

      <Section
        icon={Globe2}
        title={t('messages.servicesAndAppointments')}
        description={t('messages.enterEachServiceOrTimeSlotOnASeparateLine')}
      >
        <div className='space-y-2'>
          <Label>{t('messages.services')}</Label>
          <Textarea
            rows={6}
            value={config.services.join('\n')}
            onChange={(event) =>
              set('services', event.target.value.split('\n'))
            }
          />
        </div>
        <div className='space-y-2'>
          <Label>{t('messages.timeSlots')}</Label>
          <Textarea
            rows={6}
            value={config.bookingSlots.join('\n')}
            onChange={(event) =>
              set('bookingSlots', event.target.value.split('\n'))
            }
          />
        </div>
        <Field
          label={t('messages.openingHours')}
          value={config.bookingWorkingHours}
          onChange={(value) => set('bookingWorkingHours', value)}
          wide
        />
      </Section>

      <Section
        icon={Globe2}
        title={t('messages.contact')}
        description={t(
          'messages.theAddressComesFromClinicInformationTheWebsiteS'
        )}
      >
        <Field
          label={t('messages.phoneNumber')}
          value={config.contactPhone}
          onChange={(value) => set('contactPhone', value)}
        />
        <Field
          label={t('messages.address')}
          value={data?.tenant.address ?? ''}
          readOnly
          hint={t('messages.updateItFromTheAccountMenuClinicInformation')}
        />
        <Field
          label='URL Google Maps'
          value={config.contactMapUrl}
          onChange={(value) => set('contactMapUrl', value)}
          wide
        />
      </Section>

      <Section
        icon={Newspaper}
        title={t('messages.homepagePosts')}
        description={t(
          'messages.selectUpTo3PublishedPostsDisplayedInSelectionO'
        )}
      >
        <div className='space-y-3 md:col-span-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => setPostsOpen(!postsOpen)}
          >
            {postsOpen
              ? t('messages.hidePostList')
              : t('messages.viewAndSelectPosts')}
          </Button>
          {!postsOpen ? (
            <p className='text-sm text-muted-foreground'>
              {t('messages.selected')} {config.featuredPostIds.length}{' '}
              {t('messages.postsAlt2')}
            </p>
          ) : postsLoading ? (
            <p className='text-sm text-muted-foreground'>
              {t('messages.loadingPosts')}
            </p>
          ) : postsError ? (
            <div className='space-y-2'>
              <p className='text-sm text-destructive'>
                {t('messages.couldNotLoadPosts')}
              </p>
              <Button
                type='button'
                variant='outline'
                onClick={() => refetchPosts()}
              >
                {t('messages.tryAgain')}
              </Button>
            </div>
          ) : (publishedPosts?.data.length ?? 0) === 0 ? (
            <p className='text-sm text-muted-foreground'>
              {t('messages.noPublishedPostsPublishAPostBeforeSelectingIt')}
            </p>
          ) : (
            publishedPosts?.data.map((post) => {
              const checked = config.featuredPostIds.includes(post.id)
              const order = config.featuredPostIds.indexOf(post.id) + 1
              const disabled = !checked && config.featuredPostIds.length >= 3
              return (
                <label
                  key={post.id}
                  className='flex cursor-pointer items-start gap-3 rounded-lg border p-3 has-[[data-state=checked]]:border-primary/40 has-[[data-state=checked]]:bg-primary/5'
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(value) => {
                      set(
                        'featuredPostIds',
                        value
                          ? [...config.featuredPostIds, post.id].slice(0, 3)
                          : config.featuredPostIds.filter(
                              (id) => id !== post.id
                            )
                      )
                    }}
                  />
                  <span className='min-w-0 flex-1'>
                    <span className='block font-medium'>{post.title}</span>
                    <span className='text-xs text-muted-foreground'>
                      {post.category}
                    </span>
                  </span>
                  {checked && (
                    <span className='rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground'>
                      {order}
                    </span>
                  )}
                </label>
              )
            })
          )}
          {postsOpen && (
            <p className='text-xs text-muted-foreground'>
              {t('messages.ifNoneAreSelectedTheHomepageShowsThe3LatestPo')}
            </p>
          )}
        </div>
      </Section>

      <Section
        icon={Search}
        title='SEO'
        description={t('messages.informationShownInSearchEngines')}
      >
        <Field
          label={t('messages.seoTitle')}
          value={config.seoTitle}
          onChange={(value) => set('seoTitle', value)}
        />
        <Field
          label={t('messages.seoDescription')}
          value={config.seoDescription}
          onChange={(value) => set('seoDescription', value)}
        />
      </Section>

      <div className='flex justify-end rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur sm:sticky sm:bottom-4'>
        <Button
          disabled={mutation.isPending || !clinicName.trim()}
          onClick={() => {
            if (!clinicName.trim()) {
              toast.error(t('messages.pleaseEnterAClinicName'))
              return
            }
            mutation.mutate({
              ...config,
              services: config.services
                .map((item) => item.trim())
                .filter(Boolean),
              bookingSlots: config.bookingSlots
                .map((item) => item.trim())
                .filter(Boolean),
            })
          }}
        >
          <Save />
          {mutation.isPending
            ? t('messages.saving')
            : t('messages.saveConfiguration')}
        </Button>
      </div>
    </div>
  )
}
