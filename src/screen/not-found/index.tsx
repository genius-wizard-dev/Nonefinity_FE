import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Footer, Header } from "../home/components";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />
      <main className="pt-16 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* 404 Number */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                className="mb-8"
              >
                <h1 className="text-9xl sm:text-[12rem] font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  404
                </h1>
              </motion.div>

              {/* Error Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Trang không tìm thấy
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-2">
                  Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Có thể URL đã thay đổi hoặc trang đã bị xóa.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Link to="/">
                    <Home className="mr-2 h-5 w-5" />
                    Về Trang Chủ
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Quay Lại
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                >
                  <Link to="/docs">
                    <Search className="mr-2 h-5 w-5" />
                    Xem Tài Liệu
                  </Link>
                </Button>
              </motion.div>

              {/* Helpful Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800"
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Có thể bạn đang tìm:
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    to="/docs"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Hướng Dẫn Sử Dụng
                  </Link>
                  <Link
                    to="/features"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Tính Năng
                  </Link>
                  <Link
                    to="/sign-in"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Đăng Nhập
                  </Link>
                  <Link
                    to="/sign-up"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Đăng Ký
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

