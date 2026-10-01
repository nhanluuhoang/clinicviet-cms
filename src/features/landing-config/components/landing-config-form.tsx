import {
  Globe2,
  Image,
  Newspaper,
  Palette,
  Save,
  Search,
  Stethoscope,
} from 'lucide-react'
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
  config,
  clinicName,
  setClinicName,
  mutation,
  set,
}: Pick<
  LandingConfigFormState,
  | 'data'
  | 'publishedPosts'
  | 'config'
  | 'clinicName'
  | 'setClinicName'
  | 'mutation'
  | 'set'
>) {
  return (
    <div className='w-full space-y-5'>
      <Section
        icon={Palette}
        title='Thương hiệu'
        description='Tên phòng khám dùng trực tiếp từ thông tin tenant; landing chỉ lưu nội dung hiển thị riêng.'
      >
        <Field
          label='Tên phòng khám'
          value={clinicName}
          onChange={setClinicName}
        />
        <Field
          label='Thông điệp ngắn'
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
            label='Màu chính'
            value={config.primaryColor}
            onChange={(value) => set('primaryColor', value)}
          />
          <ColorField
            label='Màu nhấn'
            value={config.accentColor}
            onChange={(value) => set('accentColor', value)}
          />
        </div>
      </Section>

      <Section
        icon={Image}
        title='Phần giới thiệu đầu trang'
        description='Nội dung đầu tiên khách hàng nhìn thấy.'
      >
        <Field
          label='Tiêu đề'
          value={config.heroTitle}
          onChange={(value) => set('heroTitle', value)}
        />
        <Field
          label='Dòng nổi bật'
          value={config.heroHighlightedText}
          onChange={(value) => set('heroHighlightedText', value)}
        />
        <Field
          label='URL ảnh đầu trang'
          value={config.heroImageUrl}
          onChange={(value) => set('heroImageUrl', value)}
          wide
        />
        <div className='space-y-2 md:col-span-2'>
          <Label>Mô tả</Label>
          <Textarea
            value={config.heroDescription}
            onChange={(event) => set('heroDescription', event.target.value)}
          />
        </div>
      </Section>

      <Section
        icon={Stethoscope}
        title='Bác sĩ phụ trách'
        description='Phù hợp cho phòng khám có một bác sĩ.'
      >
        <Field
          label='Tên bác sĩ'
          value={config.doctorName}
          onChange={(value) => set('doctorName', value)}
        />
        <Field
          label='Chuyên khoa'
          value={config.doctorSpecialty}
          onChange={(value) => set('doctorSpecialty', value)}
        />
        <Field
          label='URL ảnh bác sĩ'
          value={config.doctorImageUrl}
          onChange={(value) => set('doctorImageUrl', value)}
          wide
        />
        <div className='space-y-2 md:col-span-2'>
          <Label>Giới thiệu</Label>
          <Textarea
            value={config.doctorDescription}
            onChange={(event) => set('doctorDescription', event.target.value)}
          />
        </div>
      </Section>

      <Section
        icon={Globe2}
        title='Dịch vụ và đặt lịch'
        description='Mỗi dịch vụ hoặc khung giờ nằm trên một dòng.'
      >
        <div className='space-y-2'>
          <Label>Dịch vụ</Label>
          <Textarea
            rows={6}
            value={config.services.join('\n')}
            onChange={(event) =>
              set('services', event.target.value.split('\n'))
            }
          />
        </div>
        <div className='space-y-2'>
          <Label>Khung giờ</Label>
          <Textarea
            rows={6}
            value={config.bookingSlots.join('\n')}
            onChange={(event) =>
              set('bookingSlots', event.target.value.split('\n'))
            }
          />
        </div>
        <Field
          label='Giờ làm việc'
          value={config.bookingWorkingHours}
          onChange={(value) => set('bookingWorkingHours', value)}
          wide
        />
      </Section>

      <Section
        icon={Globe2}
        title='Liên hệ'
        description='Địa chỉ dùng từ thông tin tenant; landing chỉ lưu thông tin liên hệ bổ sung.'
      >
        <Field
          label='Số điện thoại'
          value={config.contactPhone}
          onChange={(value) => set('contactPhone', value)}
        />
        <Field
          label='Địa chỉ'
          value={data?.tenant.address ?? ''}
          readOnly
          hint='Cập nhật tại Hồ sơ cá nhân → Thông tin phòng khám.'
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
        title='Bài viết trên trang chủ'
        description='Chọn tối đa 3 bài viết đã công khai và sắp xếp theo thứ tự chọn.'
      >
        <div className='space-y-3 md:col-span-2'>
          {(publishedPosts?.data.length ?? 0) === 0 ? (
            <p className='text-sm text-muted-foreground'>
              Chưa có bài viết công khai. Hãy công khai bài viết trước khi chọn.
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
          <p className='text-xs text-muted-foreground'>
            Nếu không chọn bài nào, trang chủ sẽ tự hiển thị 3 bài mới nhất.
          </p>
        </div>
      </Section>

      <Section
        icon={Search}
        title='SEO'
        description='Thông tin hiển thị trên công cụ tìm kiếm.'
      >
        <Field
          label='Tiêu đề SEO'
          value={config.seoTitle}
          onChange={(value) => set('seoTitle', value)}
        />
        <Field
          label='Mô tả SEO'
          value={config.seoDescription}
          onChange={(value) => set('seoDescription', value)}
        />
      </Section>

      <div className='sticky bottom-4 flex justify-end rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur'>
        <Button
          disabled={mutation.isPending || !clinicName.trim()}
          onClick={() => {
            if (!clinicName.trim()) {
              toast.error('Vui lòng nhập tên phòng khám')
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
          {mutation.isPending ? 'Đang lưu...' : 'Lưu cấu hình'}
        </Button>
      </div>
    </div>
  )
}
