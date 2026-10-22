import i18n, { getLocale } from '@/i18n'

export const genders = [
  {
    get label() {
      return i18n.t('messages.male')
    },
    value: '1',
  },
  {
    get label() {
      return i18n.t('messages.female')
    },
    value: '2',
  },
] as const

export const genderLabel = (value?: string | null) =>
  genders.find((g) => g.value === value)?.label ?? '—'

/**
 * Giới hạn nhập liệu; mật khẩu đồng bộ với quy tắc 8–20 ký tự của API.
 * Không có `userName` vì field đó không nằm trong form — backend tự sinh.
 */
export const MAX = {
  password: 20,
  fullName: 150,
  email: 150,
  phone: 15,
  address: 255,
  note: 150,
}

/** Hiển thị ngày theo định dạng Việt Nam; chuỗi rỗng/null thành dấu gạch. */
export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString(getLocale()) : '—'
