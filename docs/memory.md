## User

- Giao tiếp tiếng Việt; ưu tiên thay đổi gọn. Không thêm test frontend nếu không được yêu cầu.

## Project

- CMS React 19/TypeScript/Vite/TanStack Router+Query, shadcn/ui; dùng pnpm. API backend qua `VITE_APP_API_URL`.

## Architecture

- Trang lịch sử khám có action cập nhật trong menu ba chấm ở cột cuối cho PRESCRIBER_ROLES, dùng chung PrescriptionDialog 3 tab. Khi cập nhật khóa 2 tab khác loại phiếu đã lưu. Lưu PATCH theo history.id, làm mới query medical-histories; hồ sơ không có prescription chỉ sửa thông tin hồ sơ, ẩn thuốc/chi phí.

- Vaccination API fields are flat on MedicalHistory. getVaccinationFields maps database date responses to YYYY-MM-DD for the form; no vaccination JSON object.

- Form tiêm hiện nhiệt độ (°C), huyết áp (mmHg), mũi số, liều, đường/vị trí tiêm, người tiêm, hạn dùng, ngày tiêm và hẹn mũi tiếp theo. Người tiêm lấy từ `/users/staff-options`, mặc định user hiện tại; ngày tiêm mặc định ngày local hiện tại. Mở phiếu cũ giữ giá trị đã lưu.

- Phiếu dịch vụ có 3 tab EXAMINATION/PHARMACY/VACCINATION, mỗi tab giữ form và chi phí riêng; chỉ gửi tab đang mở. localStorage nhớ tab gần nhất theo user, không lưu dữ liệu bệnh nhân; sửa phiếu mở đúng loại đã lưu. Phí khám chỉ áp dụng EXAMINATION.

- Feature ở `src/features`, route ở `src/routes/_authenticated`; `UrlDataTable` dùng chung toolbar, bộ lọc/phan trang đồng bộ URL và thẻ mobile. Axios interceptor trả `response.data`, giữ `AxiosError` để nhận diện 401.
- CMS lấy CSRF qua `/auth/csrf` rồi gửi header cho request ghi. `SUPER_ADMIN` có toàn quyền; tenant admin bị giới hạn theo vai trò/gói.
- Landing config và posts dùng API thật; ảnh POST có thumbnail public, ảnh bệnh nhân giữ kiểm soát truy cập.

## Convention

- Đặt màn hình theo tính năng trong `src/features/<feature>/`, khai báo route trong `src/routes/_authenticated/`; gọi API qua `src/lib/axios.ts` và gom hàm/kiểu API tại `api.ts` của feature.
- Trang danh sách dùng `UrlDataTable`: cột action luôn đặt cuối, khai báo `mobileLabels`/`getSearchText`; filter đặt trong toolbar, `columnId` khớp cột, `searchKey`/schema route khớp URL, dùng `radio` cho lựa chọn đơn và `checkbox` cho đa chọn. Giữ tìm kiếm, lọc, sort/phân trang đồng bộ URL và thẻ mobile.
- Form dùng các component UI hiện có; chọn ngày dùng `DatePickerInput`. Giữ phân quyền vai trò/gói nhất quán với BE; không cho sửa vai trò `PATIENT`/`USER` qua form quản lý nhân sự. CMS không tự sinh mã phòng khám: BE sinh khi tạo tenant, duyệt trial chỉ nhập mã.
- Dùng TanStack Query cho dữ liệu từ API và invalidate query liên quan sau mutation; giữ `AxiosError` để nhận diện 401. Chạy `pnpm build` để kiểm tra type/build; không thêm test frontend nếu không được yêu cầu.
