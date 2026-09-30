## User

- Giao tiếp tiếng Việt; ưu tiên thay đổi gọn. Không thêm test frontend nếu không được yêu cầu.

## Project

- CMS React 19/TypeScript/Vite/TanStack Router+Query, shadcn/ui; dùng pnpm. API backend qua `VITE_APP_API_URL`.

## Architecture

- Feature ở `src/features`, route ở `src/routes/_authenticated`; `UrlDataTable` dùng chung toolbar, bộ lọc/phan trang đồng bộ URL và thẻ mobile. Axios interceptor trả `response.data`, giữ `AxiosError` để nhận diện 401.
- CMS lấy CSRF qua `/auth/csrf` rồi gửi header cho request ghi. `SUPER_ADMIN` có toàn quyền; tenant admin bị giới hạn theo vai trò/gói.
- Landing config và posts dùng API thật; ảnh POST có thumbnail public, ảnh bệnh nhân giữ kiểm soát truy cập.

## Convention

- Đặt màn hình theo tính năng trong `src/features/<feature>/`, khai báo route trong `src/routes/_authenticated/`; gọi API qua `src/lib/axios.ts` và gom hàm/kiểu API tại `api.ts` của feature.
- Trang danh sách dùng `UrlDataTable`: cột action luôn đặt cuối, khai báo `mobileLabels`/`getSearchText`; filter đặt trong toolbar, `columnId` khớp cột, `searchKey`/schema route khớp URL, dùng `radio` cho lựa chọn đơn và `checkbox` cho đa chọn. Giữ tìm kiếm, lọc, sort/phân trang đồng bộ URL và thẻ mobile.
- Form dùng các component UI hiện có, giữ phân quyền vai trò/gói nhất quán với BE; không cho sửa vai trò `PATIENT`/`USER` qua form quản lý nhân sự. CMS không tự sinh mã phòng khám: BE sinh khi tạo tenant, duyệt trial chỉ nhập mã.
- Dùng TanStack Query cho dữ liệu từ API và invalidate query liên quan sau mutation; giữ `AxiosError` để nhận diện 401. Chạy `pnpm build` để kiểm tra type/build; không thêm test frontend nếu không được yêu cầu.
