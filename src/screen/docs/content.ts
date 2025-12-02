export const docsContent = `# 📚 Hướng Dẫn Sử Dụng Hệ Thống AI Agent - Nonefinity

## 🎯 Giới Thiệu

Nonefinity là một nền tảng AI Agent cho phép bạn xây dựng và tương tác với các AI Agent thông minh. Hệ thống hỗ trợ quản lý dữ liệu, tạo knowledge base, và chat với AI agents một cách dễ dàng.

---

## 🚀 Bắt Đầu

### 1. Đăng Ký / Đăng Nhập

#### Đăng Ký Tài Khoản Mới

1. Truy cập trang chủ của hệ thống
2. Click vào nút **"Start Building Free"** hoặc **"Sign Up"**
3. Điền thông tin đăng ký:
   - Email
   - Mật khẩu
   - Tên người dùng
4. Xác thực email (nếu yêu cầu)
5. Hoàn tất đăng ký

#### Đăng Nhập

1. Truy cập trang **Sign In**
2. Nhập email và mật khẩu
3. Click **"Sign In"**
4. Sau khi đăng nhập thành công, bạn sẽ được chuyển đến **Dashboard**

---

## 📋 Flow Sử Dụng Chính

Sau khi đăng nhập, bạn sẽ thấy trang **Dashboard** với các tính năng chính. Để sử dụng AI Agent hiệu quả, hãy làm theo các bước sau:

### **Bước 1: Cấu Hình Credentials (API Keys)** 🔑

Đây là bước **QUAN TRỌNG NHẤT** - bạn cần cấu hình API keys của các AI providers để hệ thống có thể sử dụng.

#### Cách thực hiện:

1. **Truy cập trang Credentials**

   - Từ Dashboard, click vào **"Credentials"** trong menu bên trái
   - Hoặc click vào card **"Credentials"** trong Quick Access

2. **Thêm Credential mới**

   - Click nút **"Add Credential"**
   - Điền thông tin:
     - **Credential Name**: Tên để nhận biết (ví dụ: "OpenAI Production")
     - **Provider**: Chọn nhà cung cấp AI (OpenAI, Claude, v.v.)
     - **API Key**: Nhập API key của bạn
     - **Base URL** (tùy chọn): URL tùy chỉnh nếu cần
   - Click **"Add Credential"** để lưu

3. **Quản lý Credentials**
   - Xem danh sách credentials đã tạo
   - Bật/tắt credential bằng switch
   - Chỉnh sửa hoặc xóa credential (chỉ xóa được khi không đang sử dụng)

> ⚠️ **Lưu ý**:
>
> - API key sẽ được mã hóa và lưu trữ an toàn
> - Credential đang được sử dụng không thể xóa hoặc thay đổi provider
> - Bạn có thể có nhiều credentials cho cùng một provider

---

### **Bước 2: Upload Files (Tùy Chọn)** 📁

Nếu bạn muốn AI Agent có thể truy cập và phân tích dữ liệu từ files, hãy upload files vào hệ thống.

#### Cách thực hiện:

1. **Truy cập trang Files**

   - Click vào **"Files"** trong menu hoặc Quick Access

2. **Upload Files**

   - Click nút **"Upload"** hoặc kéo thả files vào vùng upload
   - Hỗ trợ nhiều định dạng: PDF, DOCX, TXT, CSV, Excel, JSON, v.v.
   - Có thể upload nhiều files cùng lúc

3. **Quản lý Files**
   - Xem danh sách files đã upload
   - Tìm kiếm files
   - Đổi tên hoặc xóa files
   - Import từ Google Drive (nếu đã kết nối)

---

### **Bước 3: Tạo Knowledge Store** 🗄️

Knowledge Store là kho lưu trữ tri thức của bạn, nơi lưu trữ các embeddings từ files để AI có thể tìm kiếm và sử dụng.

#### Cách thực hiện:

1. **Truy cập trang Knowledge Stores**

   - Click vào **"Knowledge Stores"** trong menu

2. **Tạo Knowledge Store mới**

   - Click nút **"Create Knowledge Store"** hoặc **"Add New"**
   - Điền thông tin:
     - **Name**: Tên knowledge store (ví dụ: "Company Documents")
     - **Description**: Mô tả ngắn gọn
     - **Dimension**: Kích thước vector (thường là 1536 cho OpenAI embeddings)
     - **Distance**: Phương pháp tính khoảng cách (Cosine, Dot, hoặc Euclid)
   - Click **"Create"**

3. **Thêm dữ liệu vào Knowledge Store**
   - Sau khi tạo, click vào knowledge store để xem chi tiết
   - Upload files hoặc chọn files đã có
   - Hệ thống sẽ tự động tạo embeddings và lưu vào knowledge store

> 💡 **Mẹo**:
>
> - Dimension phải khớp với embedding model bạn sẽ sử dụng
> - Cosine distance thường được sử dụng phổ biến nhất

---

### **Bước 4: Cấu Hình Models (Tùy Chọn)** 🧠

Cấu hình các AI models và embedding models để sử dụng trong chat.

#### Cách thực hiện:

1. **Truy cập trang Models**

   - Click vào **"Models"** trong menu
   - Xem danh sách các models có sẵn

2. **Cấu hình Embedding Model**
   - Truy cập trang **"Embedding"**
   - Chọn embedding model phù hợp với knowledge store của bạn
   - Đảm bảo dimension khớp với knowledge store

---

### **Bước 5: Chat với AI Agent** 💬

Đây là bước cuối cùng - bắt đầu chat với AI Agent của bạn!

#### Cách thực hiện:

1. **Truy cập trang Chats**

   - Click vào **"Chats"** trong menu hoặc Quick Access

2. **Tạo Chat Session mới**

   - Click nút **"New Chat"** hoặc **"+"**
   - Đặt tên cho session (tùy chọn)

3. **Cấu hình Chat Settings**

   - Chọn **Model**: AI model để sử dụng (ví dụ: GPT-4, Claude)
   - Chọn **Credential**: API key credential tương ứng
   - Chọn **Knowledge Store** (nếu muốn AI truy cập knowledge base)
   - Chọn **Embedding Model** (nếu sử dụng knowledge store)
   - Cấu hình các settings khác:
     - Temperature
     - Max tokens
     - System prompt

4. **Bắt đầu Chat**

   - Nhập câu hỏi hoặc yêu cầu vào ô chat
   - Nhấn Enter hoặc click nút gửi
   - AI sẽ trả lời dựa trên:
     - Knowledge store (nếu đã cấu hình)
     - Files đã upload (nếu có)
     - Context của cuộc hội thoại

5. **Quản lý Chat Sessions**
   - Xem danh sách các sessions đã tạo
   - Mở lại session cũ để tiếp tục chat
   - Xóa session không cần thiết

---

## 🎨 Các Tính Năng Khác

### **Datasets** 📊

- Tạo và quản lý datasets
- Phân tích dữ liệu với DuckDB
- Chuyển đổi sang Parquet format

### **API Keys** 🔐

- Tạo API keys để tích hợp với ứng dụng bên ngoài
- Quản lý và xóa API keys
- Xem lịch sử sử dụng

### **Integrate** 🔗

- Kết nối với các dịch vụ bên ngoài
- Sử dụng các tools và integrations có sẵn
- Tự động hóa workflows

### **MCP (Model Context Protocol)** 🔌

- Cấu hình MCP servers
- Kết nối với các MCP providers
- Mở rộng khả năng của AI Agent

---

## 📝 Flow Tóm Tắt

\`\`\`
1. Đăng nhập → Dashboard
   ↓
2. Cấu hình Credentials (API Keys) ← BẮT BUỘC
   ↓
3. (Tùy chọn) Upload Files
   ↓
4. (Tùy chọn) Tạo Knowledge Store
   ↓
5. (Tùy chọn) Cấu hình Models
   ↓
6. Tạo Chat Session và bắt đầu chat với AI! 🎉
\`\`\`

---

## 💡 Tips & Best Practices

### ✅ Nên làm:

1. **Luôn cấu hình Credentials trước** - Đây là bước bắt buộc để sử dụng AI
2. **Đặt tên rõ ràng** cho credentials, knowledge stores, và chat sessions
3. **Sử dụng Knowledge Store** để AI có thể truy cập thông tin từ documents của bạn
4. **Kiểm tra dimension** khi tạo knowledge store phải khớp với embedding model
5. **Lưu lại chat sessions** quan trọng để tham khảo sau

### ❌ Nên tránh:

1. **Không xóa credentials đang sử dụng** - Sẽ gây lỗi khi chat
2. **Không tạo knowledge store với dimension sai** - Embeddings sẽ không hoạt động
3. **Không upload quá nhiều files lớn cùng lúc** - Có thể làm chậm hệ thống
4. **Không chia sẻ API keys** - Bảo mật thông tin quan trọng

---

## 🆘 Xử Lý Sự Cố

### Vấn đề: Không thể chat với AI

**Giải pháp:**

- Kiểm tra xem đã cấu hình Credentials chưa
- Đảm bảo credential đang **Active**
- Kiểm tra API key có hợp lệ không
- Xem lại model và credential đã chọn trong chat settings

### Vấn đề: AI không tìm thấy thông tin trong Knowledge Store

**Giải pháp:**

- Kiểm tra xem files đã được thêm vào knowledge store chưa
- Đảm bảo dimension của knowledge store khớp với embedding model
- Kiểm tra embedding model đã được cấu hình trong chat settings

### Vấn đề: Upload file bị lỗi

**Giải pháp:**

- Kiểm tra định dạng file có được hỗ trợ không
- Kiểm tra kích thước file (có thể có giới hạn)
- Thử upload lại hoặc liên hệ support

---

## 📞 Hỗ Trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi:

1. Kiểm tra lại các bước trong hướng dẫn này
2. Xem lại cấu hình của bạn
3. Liên hệ đội ngũ hỗ trợ qua email hoặc chat

---

## 🎉 Chúc Bạn Sử Dụng Thành Công!

Hệ thống AI Agent của Nonefinity được thiết kế để dễ sử dụng và mạnh mẽ. Hãy bắt đầu với việc cấu hình credentials và khám phá các tính năng tuyệt vời!

**Happy Building! 🚀**`;
