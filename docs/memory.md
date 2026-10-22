## User

- Giao tiếp tiếng Việt, thay đổi gọn; không thêm test frontend nếu không được yêu cầu.

## Project

- ClinicViet CMS dùng React 19, TypeScript, Vite, TanStack Router/Query và shadcn/ui; API qua `VITE_APP_API_URL`. Tên kỹ thuật và browser storage key dùng `clinicviet`, còn thư mục checkout vẫn là `iclinic-*`; đổi key trực tiếp, không tạo migration. CMS và hai landing dùng chung favicon C–V, đồng bộ với logo chính ClinicViet.

## Architecture

- Tenant subscriptions use ACTIVE/EXPIRED/SUSPENDED with one usage expiry (`subscriptionEndsAt`); creation defaults to ACTIVE and requires an expiry. No TRIAL option or trial date columns. Trial requests/referrals remain separate. Expiry notices use localized plan names without BASIC/PLUS/PRO codes.

- Reuse react-i18next `useTranslation()/t()` in components and the exported `i18n` instance for module-level labels/schema error callbacks. Shared label getters/options must update on language changes; memoized translated content depends on `t`. Vietnamese/English resources live in `src/locales/{vi,en}/translation.json`; Zod defaults and `getLocale()` follow the selected language. Axios sends Accept-Language; language switchers are hidden in Header and AuthLayout. Preserve stored/user-entered values when translating labels.

- `/invoices` is a read-only staff invoice list with a final print action (A4/A5/80mm/58mm), sharing the queue print template (internal payment receipt with clinic name/address, goods/services table and signatures; optional medicine names/quantities; billed totals come from saved invoice amounts, never current catalog prices), using `UrlDataTable` and `DatePickerInput`. Audit columns are hidden by default and can be enabled through desktop column options. Defaults to today's issuance date; reset clears date and all filters. Search covers invoice code/patient name/phone; service type is a single-choice filter. Shows consultation and medicine charges, plus one service-fee group containing the service charge and up to three named extra fees. Desktop shows the combined service-fee total with a popover breakdown; mobile keeps the inline breakdown. Items with no label and zero amount are omitted; mobile hides the group when empty. All list queries are server-paginated and tenant-scoped; there is no creator filter or creator-options API.

- Both account menus link directly to clinic information (`/settings/tenant`, tenant admins only). "Giới thiệu cho bạn bè" opens a name/phone-only referral form for tenant staff; it explains the one-month reward on a successful purchase. Referral leads share the trial requests list with source/referrer details and a source filter. Purchase confirmation and reward extension are handled manually by the owner; no automatic reward workflow.

- Function search opens pages only via the shared Header button or Ctrl/Cmd+K. Search and sidebar share `useNavigationGroups` for role/plan visibility; searchable destinations come from `sidebarData`. Search supports Vietnamese without diacritics and aliases for reports/settings.

- System support handles both tenant tickets and guests from the main landing. SupportRequest.tenant/tenantId are nullable; guest contactName/contactEmail/contactPhone/organization identify the sender. guestReply distinguishes guest messages from deleted staff accounts. Guest replies/status history are visible on the landing; guests revisit using cookies/private links, with no email notifications or grouping by email.
- Trang `/system/users` cho Super Admin đặt lại mật khẩu từng tài khoản bằng hộp thoại riêng; đổi thành công sẽ đăng xuất các phiên hiện tại của tài khoản đó.

- Tính năng ở `src/features/`, route ở `src/routes/_authenticated/`; API và kiểu dữ liệu nằm trong `api.ts` của feature, gọi qua `src/lib/axios.ts`. Interceptor trả `response.data`, giữ `AxiosError` để nhận diện 401; CSRF lấy từ `/auth/csrf` và gửi cho request ghi.
- Master data cache thuộc BE. Settings, ngày nghỉ, đơn thuốc và template dùng `useQuery` trực tiếp với key `['master-data', tenantId]`, `staleTime: 0`, `gcTime: 0`; refetch khi mount, bỏ dữ liệu không active, giữ focus behavior toàn cục. Mutation invalidate tiền tố `['master-data']`; không tạo hook master data riêng.
- PATCH medical history gửi đủ các danh sách media còn giữ, kể cả mảng rỗng; bỏ trường nghĩa là không đổi. Nhận HLS MIME `application/vnd.apple.mpegurl` là video. Bỏ media cũ chỉ sửa draft đến lúc Save; DELETE và dọn khi đóng dialog chỉ áp dụng upload mới. Giới hạn 5 ảnh, 5 PDF, 1 video.
- PrescriptionDialog dùng chung ba tab EXAMINATION/PHARMACY/VACCINATION; mỗi tab giữ form và chi phí riêng, chỉ gửi tab mở. Nhớ tab gần nhất theo user trong localStorage, không lưu dữ liệu bệnh nhân. Sửa phiếu mở đúng loại đã lưu và khóa hai tab khác; PATCH theo history.id, refresh medical histories. Hồ sơ không có prescription chỉ sửa thông tin hồ sơ, ẩn thuốc và chi phí. Phí khám chỉ áp dụng EXAMINATION.
- Vaccination API dùng trường phẳng; `getVaccinationFields` đổi ngày DB sang `YYYY-MM-DD`. Form hiện dấu hiệu sinh tồn, mũi/liều/đường/vị trí/người tiêm và các ngày; người tiêm từ `/users/staff-options`, mặc định user hiện tại, ngày tiêm mặc định hôm nay local, sửa phiếu giữ dữ liệu cũ.
- Landing config và posts dùng API thật. Ảnh bài viết có thumbnail public, ảnh bệnh nhân cần kiểm soát truy cập. Template đơn thuốc chỉ tải thuốc và tùy chọn hướng dẫn khi mở dialog; landing config chỉ tải bài viết công khai khi mở bộ chọn và vẫn giữ `featuredPostIds` khi đóng. Lập phiếu và template dùng `MedicineInstructionInput`: nhập tự do tối đa 255 ký tự, gợi ý theo buổi dùng, xem trước câu hiển thị; không báo lỗi riêng khi để trống.
- Settings/tenant hiển thị hạn mức lưu trữ chỉ đọc và thanh dung lượng ảnh/PDF/video từ `storage` trong `/tenants/me`; `/system/tenants` cho Super Admin sửa hạn mức GB và ghi chú nội bộ của phòng khám.

## Convention

- Inventory/medicine create requests omit code: BE generates PN/PX/KK/HUY/MED/RX through SnowflakeService. Disposal sends kind=DISPOSAL to /stock-takes with countedQty=0. Keep code fields only in responses and display the persisted code.

- Goods receipt entry treats supplier invoice number and batch number as optional; placeholders explain that blanks are generated by the backend. Keep response numbers required and do not generate these identifiers in CMS.

- PDF uploads are limited to 3 MB per file; keep validation and error/help text aligned across CMS and API.

- Shared toast defaults: top-right on desktop, top-center below 768px, with top safe-area spacing. Keep placement in `src/components/ui/sonner.tsx`.

- CMS bundles Inter/Manrope through `@fontsource-variable` CSS imports in `src/styles/index.css` (including Vietnamese and Inter italic). Font assets must load from the same origin for production CSP; do not add Google Fonts CDN links. Families in `theme.css` use unquoted generic fallbacks. `FontProvider` maps settings to literal Tailwind class names so font utilities are emitted in production builds.

- Video uploads share `src/lib/video-upload.ts` for phone MIME/extension selection and empty/octet-stream normalization. Use `VideoPlayer` for authenticated native HLS/hls.js playback in previews and medical histories.

- Photo uploads share `src/lib/image-upload.ts` for JPG/JPEG, PNG, WebP and HEIC/HEIF MIME/extension selection; normalize empty/octet-stream MIME types before validation and upload. Backend converts photos to WebP; retain the 5 MB upload limit.

- Form popups use `DialogFormContent` with `DialogBody` containing the header and a sibling `DialogFooter`: fullscreen on mobile, constrained width on desktop. Mobile scrolls the entire popup, including header and actions; desktop pins only the footer actions while header and body scroll together. Keep submit buttons associated through `form`/`id`. Use CSS classes only, without viewport resize effects. Master-data retains Sheet with the same responsive layout.

- List toolbars share `DataTableToolbar`: full-width search inputs on mobile, 32px controls, wrapping filters/dates, and desktop-only column visibility (`sm` and up). Use Vietnamese `Xóa bộ lọc`, shown only for a non-empty search/filter, including an active date. Custom date and multi-search pages use toolbar children/searchFields plus hasExtraFilters/onReset; clear pending debounced search when resetting.

- Mật khẩu mới (nhân viên, bệnh nhân, system user) dài 8–20 ký tự, không ép chữ/số; đăng nhập và kiểm tra mật khẩu cũ vẫn hỗ trợ tài khoản cũ. `SUPER_ADMIN` có toàn quyền; tenant admin theo vai trò và gói. Không sửa vai trò PATIENT/USER qua form nhân sự.
- Trang lỗi đầy đủ 401/403/404/500/503 chỉ có nút sign-in dùng chung: xóa auth CMS, hủy query/clear cache rồi tới `/sign-in`, không logout API session; lỗi nhúng giữ layout gọn. API error do interceptor toast một lần; `showRequestError(error, fallback)` chỉ hiện fallback khi API không có message; lỗi nhập liệu toast tại chỗ.
- Danh sách dùng `UrlDataTable`: toolbar chứa filter, tìm kiếm/lọc/sort/phân trang theo URL, action column luôn cuối, desktop/mobile chung visibility; `columnId` khớp cột và `searchKey`/schema khớp URL. Dùng radio cho chọn một, checkbox cho nhiều, `mobileLabels` khi nhãn theo ngữ cảnh khác. Nút filter chọn một là nút icon tròn. Resource page giữ layout ở `index.tsx`, table/columns/actions/dialog/forms trong `components/`, state form phức tạp trong `hooks/`; settings form đặt cạnh entry point.
- Audit dùng `withAuditColumns` và `DataTableViewOptions`; createdAt/createdBy/updatedAt/updatedBy mặc định ẩn qua `defaultAuditVisibility`, kể cả bảng mobile và prescription/invoice chi tiết. API trả creator/updater với fullName; giữ quan hệ, actor UUID và audit của template khi map dữ liệu, inventory có fallback creator.userName.
- Input bắt buộc dùng `Label required`/`FormLabel required`; điều kiện phụ thuộc mode/gói. Form tenant chỉ hiện subdomain cho PRO; chuyển sang PLUS xóa trường trên form, còn PLUS đã có subdomain không bị xóa bởi sửa đổi khác. CMS không sinh mã phòng khám: BE sinh khi tạo tenant; duyệt trial nhập mã. Nhãn plan/subscription/role ở `src/config/`, trạng thái trial ở feature `data.ts`.
- Ngày lọc medical history mặc định hôm nay chỉ khi URL thiếu date; `date=''` và Reset xóa lọc, không gửi date lên API. Form ngày dùng `DatePickerInput`; `Calendar` mặc định `fixedWeeks=true` để giữ chiều cao popup khi chuyển tháng. Hàm dùng chung ở `src/lib/utils.ts`; dashboard dùng `formatNumber` và các pattern kỳ thống kê tại đây. Dùng TanStack Query/invalidate sau mutation; chạy `pnpm build` để kiểm tra.
- Trang lịch sử khám đặt action cập nhật trong menu ba chấm cột cuối cho `PRESCRIBER_ROLES`; prescription giữ tab coordination ở `index.tsx`, logic form ở `hooks/use-service-prescription-form.ts`, UI trong `components/`, kiểu/hằng số ở `types.ts` và `data/`.
- Dev port 5173 với strictPort; khi API loopback, `API_URL` đổi thành `/api` qua Vite proxy để request cùng origin, production giữ URL API cấu hình.
