import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { API_URL } from '@/config'
import i18n from '@/i18n'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { showRequestError } from '@/lib/handle-server-error'
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_TYPES,
  normalizeImageFile,
} from '@/lib/image-upload'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogBody,
  DialogFormContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { uploadImage } from '@/features/examination-queue/api'
import { CreatePost, UpdatePost, type Post, type PostDtoRequest } from '../api'
import { postStatuses } from '../data/data'
import { PostContentEditor } from './post-content-editor'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Post
}
const schema = z.object({
  title: z
    .string()
    .min(1, { error: () => i18n.t('messages.pleaseEnterATitle') }),
  category: z
    .string()
    .min(1, { error: () => i18n.t('messages.pleaseEnterACategory') }),
  excerpt: z
    .string()
    .min(1, { error: () => i18n.t('messages.pleaseEnterAShortDescription') })
    .max(500),
  content: z
    .string()
    .min(1, { error: () => i18n.t('messages.pleaseEnterContent') }),
  thumbnailUrl: z.string(),
  readTime: z.number().int().min(1).max(120),
  isPublished: z.boolean(),
})
type FormValues = z.infer<typeof schema>
const defaults: FormValues = {
  title: '',
  category: '',
  excerpt: '',
  content: '',
  thumbnailUrl: '',
  readTime: 3,
  isPublished: false,
}

const authenticatedImageUrl = (url: string | null | undefined) => {
  if (!url) return ''
  const fileName = url.split('/').pop()
  return fileName ? `${API_URL}/images/${encodeURIComponent(fileName)}` : url
}

export function PostsMutateDialog({ open, onOpenChange, currentRow }: Props) {
  const { t } = useTranslation()

  const queryClient = useQueryClient()
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  })
  useEffect(() => {
    form.reset(
      currentRow
        ? {
            title: currentRow.title,
            category: currentRow.category,
            excerpt: currentRow.excerpt,
            content: currentRow.content,
            thumbnailUrl: currentRow.thumbnailUrl ?? '',
            readTime: currentRow.readTime,
            isPublished: currentRow.isPublished,
          }
        : defaults
    )
    setThumbnailPreview(authenticatedImageUrl(currentRow?.thumbnailUrl))
  }, [currentRow, form, open])

  const uploadThumbnail = async (file: File | undefined) => {
    if (!file) return
    file = normalizeImageFile(file)
    if (!IMAGE_UPLOAD_TYPES.includes(file.type)) {
      toast.error(
        t('messages.fileHasAnUnsupportedFormatOnlyJpgJpegPngWebpH', {
          value0: file.name,
        })
      )
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        t('messages.imageIsMbExceedingThe5MbLimit', {
          value0: file.name,
          value1: (file.size / 1024 / 1024).toFixed(2),
        })
      )
      return
    }
    const localPreview = URL.createObjectURL(file)
    setThumbnailPreview(localPreview)
    setIsUploadingThumbnail(true)
    try {
      const uploaded = await uploadImage(file, 'POST')
      const publicUrl = `${API_URL}/images/thumbnail/${encodeURIComponent(uploaded.fileName)}`
      form.setValue('thumbnailUrl', publicUrl, {
        shouldDirty: true,
        shouldValidate: true,
      })
      toast.success(t('messages.coverImageUploaded'))
    } catch (error) {
      setThumbnailPreview(authenticatedImageUrl(currentRow?.thumbnailUrl))
      showRequestError(error, t('messages.couldNotUploadImage'))
    } finally {
      setIsUploadingThumbnail(false)
    }
  }

  const submit = async (values: FormValues) => {
    const data: PostDtoRequest = {
      ...values,
      thumbnailUrl: values.thumbnailUrl || undefined,
    }
    try {
      if (currentRow) await UpdatePost(currentRow.id, data)
      else await CreatePost(data)
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success(
        currentRow ? t('messages.postUpdated') : t('messages.postCreated')
      )
      onOpenChange(false)
    } catch (error) {
      showRequestError(error, t('messages.couldNotSavePost'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogFormContent
        className='sm:max-w-4xl'
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogBody>
          <DialogHeader className='pe-8 text-start'>
            <DialogTitle>
              {currentRow ? t('messages.updatePost') : t('messages.createPost')}
            </DialogTitle>
            <DialogDescription>
              {t('messages.publishedContentAppearsOnTheClinicWebsite')}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              id='posts-form'
              onSubmit={form.handleSubmit(submit)}
              className='-mx-1 space-y-5 overflow-y-auto px-1'
            >
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('messages.title')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='category'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>{t('messages.category')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='readTime'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {t('messages.readingTimeMinutes')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={1}
                          max={120}
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='excerpt'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {t('messages.shortDescription')}
                    </FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='thumbnailUrl'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('messages.coverImageRecommended1200675Px169')}
                    </FormLabel>
                    <FormControl>
                      <div className='space-y-3'>
                        <label
                          htmlFor='post-thumbnail'
                          className='flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center transition-colors hover:bg-muted/50'
                        >
                          {isUploadingThumbnail ? (
                            <Loader2 className='size-7 animate-spin text-muted-foreground' />
                          ) : (
                            <ImagePlus className='size-7 text-muted-foreground' />
                          )}
                          <span className='text-sm font-medium'>
                            {isUploadingThumbnail
                              ? t('messages.uploadingImage')
                              : t('messages.chooseCoverImage')}
                          </span>
                          <span className='text-xs text-muted-foreground'>
                            {t('messages.jpgPngOrWebpUpTo5Mb')}
                          </span>
                        </label>
                        <Input
                          id='post-thumbnail'
                          type='file'
                          accept={IMAGE_UPLOAD_ACCEPT}
                          className='sr-only'
                          disabled={isUploadingThumbnail}
                          onChange={(event) => {
                            void uploadThumbnail(event.target.files?.[0])
                            event.target.value = ''
                          }}
                        />
                        {thumbnailPreview && (
                          <div className='relative overflow-hidden rounded-lg border bg-muted'>
                            <img
                              src={thumbnailPreview}
                              alt={t('messages.previewCoverImage')}
                              className='aspect-video w-full object-cover'
                            />
                            <Button
                              type='button'
                              variant='destructive'
                              size='icon'
                              className='absolute top-2 right-2 size-8'
                              aria-label={t('messages.removeCoverImage')}
                              onClick={() => {
                                field.onChange('')
                                setThumbnailPreview('')
                              }}
                            >
                              <X />
                            </Button>
                          </div>
                        )}
                        <input type='hidden' {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='content'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('messages.content')}</FormLabel>
                    <FormControl>
                      <PostContentEditor
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='isPublished'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('messages.status')}</FormLabel>
                    <SelectDropdown
                      defaultValue={String(field.value)}
                      onValueChange={(value) =>
                        field.onChange(value === 'true')
                      }
                      items={postStatuses.map((status) => ({
                        label: status.label,
                        value: String(status.value),
                      }))}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </DialogBody>
        <DialogFooter className='border-t pt-4'>
          <DialogClose asChild>
            <Button variant='outline'>{t('messages.close')}</Button>
          </DialogClose>
          <Button
            form='posts-form'
            type='submit'
            disabled={form.formState.isSubmitting || isUploadingThumbnail}
          >
            {form.formState.isSubmitting
              ? t('messages.saving')
              : t('messages.savePost')}
          </Button>
        </DialogFooter>
      </DialogFormContent>
    </Dialog>
  )
}
