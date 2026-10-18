import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TenantData } from './api'

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

export function StorageUsage({ tenant }: { tenant: TenantData }) {
  const { storage } = tenant
  const usedBytes = storage.usedBytes
  const limitBytes = storage.limitBytes
  const scale = Math.max(limitBytes, usedBytes)
  const percentage = Math.round((usedBytes / limitBytes) * 100)
  const groups = [
    { label: 'Ảnh', bytes: storage.imagesBytes, color: 'bg-sky-500' },
    { label: 'PDF', bytes: storage.pdfsBytes, color: 'bg-amber-500' },
    { label: 'Video', bytes: storage.videosBytes, color: 'bg-violet-500' },
  ]

  return (
    <section className='space-y-3 border-t pt-6'>
      <h3 className='font-semibold'>Dung lượng lưu trữ</h3>
      <div className='max-w-xs space-y-2'>
        <Label htmlFor='storage-limit'>Dung lượng tối đa</Label>
        <Input id='storage-limit' value={`${tenant.storageLimitGb} GB`} disabled />
      </div>
      <div className='flex items-center justify-between gap-4 text-sm'>
        <span>Đã dùng {formatBytes(usedBytes)} / {tenant.storageLimitGb} GB</span>
        <span className='text-muted-foreground'>{percentage}%</span>
      </div>
      <div
        role='progressbar'
        aria-label='Dung lượng đã sử dụng'
        aria-valuenow={Math.min(percentage, 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className='flex h-4 w-full overflow-hidden rounded-full bg-muted'
      >
        {groups.map((group) => (
          <div
            key={group.label}
            className={group.color}
            style={{ width: `${(group.bytes / scale) * 100}%` }}
          />
        ))}
      </div>
      <div className='flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground'>
        {groups.map((group) => (
          <span key={group.label} className='inline-flex items-center gap-1.5'>
            <span className={`size-2.5 rounded-sm ${group.color}`} />
            {group.label}: {formatBytes(group.bytes)}
          </span>
        ))}
      </div>
      {usedBytes > limitBytes && (
        <p className='text-sm text-destructive'>Đã vượt hạn mức; không thể tải thêm tệp.</p>
      )}
      {storage.unmeasuredFiles > 0 && (
        <p className='text-sm text-muted-foreground'>
          {storage.unmeasuredFiles} tệp cũ chưa có thông tin dung lượng nên chưa được tính vào thanh này.
        </p>
      )}
    </section>
  )
}
