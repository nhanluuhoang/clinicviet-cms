export function AutomaticFee({
  label,
  value,
  note,
}: {
  label: string
  value: number
  note: string
}) {
  return (
    <div className='rounded-lg border bg-muted/30 p-4'>
      <p className='text-sm text-muted-foreground'>{label}</p>
      <p className='mt-1 text-xl font-semibold tabular-nums'>
        {value.toLocaleString('vi-VN')} ₫
      </p>
      <p className='mt-1 text-xs text-muted-foreground'>{note}</p>
    </div>
  )
}
