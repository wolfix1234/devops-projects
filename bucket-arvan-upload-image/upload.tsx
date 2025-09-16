"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { FiUploadCloud, FiCheckCircle, FiAlertTriangle, FiImage, FiX } from "react-icons/fi";

interface UploadResult {
  success: boolean;
  url: string;
  message: string;
  displayName: string;
  fileId: string;
}

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showImageTips, setShowImageTips] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>("");

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes

    if (!validTypes.includes(file.type)) {
      toast.error(`${file.name} باید فرمت JPEG، PNG، GIF یا WEBP باشد`, {
        position: "top-right",
        theme: "light",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast.error(`${file.name} باید کمتر از 10 مگابایت باشد`, {
        position: "top-right",
        theme: "light",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) return;

    setLoading(true);
    setUploadStatus("idle");
    setUploadResults([]);
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `file_${Date.now()}_${i}`;
      const displayName = `تصویر ${i + 1}`;
      setUploadProgress(`آپلود ${i + 1} از ${files.length}`);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          results.push({
            success: true,
            url: data.url,
            message: data.message,
            displayName,
            fileId
          });
        } else {
          results.push({
            success: false,
            url: "",
            message: data.error || "Upload failed",
            displayName,
            fileId
          });
        }
      } catch (error) {
        results.push({
          success: false,
          url: "",
          message: "خطا در آپلود فایل",
          displayName,
          fileId
        });
      }
    }

    setUploadResults(results);
    const successCount = results.filter(r => r.success).length;
    
    if (successCount === files.length) {
      setUploadStatus("success");
      toast.success(`همه ${files.length} فایل با موفقیت آپلود شدند`);
    } else if (successCount > 0) {
      setUploadStatus("success");
      toast.success(`${successCount} از ${files.length} فایل آپلود شد`);
    } else {
      setUploadStatus("error");
      toast.error("خطا در آپلود فایلها");
    }

    setFiles([]);
    setUploadProgress("");
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter((file) => validateFile(file));
    setFiles(validFiles);
    setUploadStatus("idle");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <FiUploadCloud className="text-3xl text-white" />
          </motion.div>
          <div className="flex items-center flex-row-reverse justify-center gap-3 relative">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">آپلود تصاویر</h2>
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center cursor-help"
                onMouseEnter={() => setShowImageTips(true)}
                onMouseLeave={() => setShowImageTips(false)}
              >
                <span className="text-blue-600 text-sm font-bold">؟</span>
              </motion.div>
              <AnimatePresence>
                {showImageTips && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    dir="rtl"
                    className="absolute z-20 -left-32 top-8 bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-6 text-sm text-gray-700 w-80"
                  >
                    <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-l border-t border-gray-200 rotate-45"></div>
                    <ul className="text-right space-y-3">
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        حجم هر تصویر باید کمتر از ۱۰ مگابایت باشد
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        فرمتهای JPEG، PNG، GIF و WEBP مجاز است
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        میتوانید چندین تصویر را همزمان انتخاب کنید
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              multiple
              accept=".jpeg,.jpg,.png,.gif,.webp"
              className="hidden"
            />
            <motion.label
              htmlFor="fileUpload"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer group
                ${
                  files.length > 0
                    ? "border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-700"
                    : "border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50"
                }
                transition-all duration-500
              `}
            >
              <div className="flex flex-col items-center gap-4">
                {files.length > 0 ? (
                  <>
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
                      <FiCheckCircle className="text-2xl text-emerald-600" />
                    </div>
                    <div className="text-lg font-semibold">{files.length} فایل انتخاب شده</div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 group-hover:bg-blue-100 rounded-2xl flex items-center justify-center transition-colors">
                      <FiImage className="text-2xl text-gray-500 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="text-lg font-semibold">انتخاب تصاویر</div>
                    <div className="text-sm text-gray-500">یا فایل‌ها را اینجا بکشید</div>
                  </>
                )}
              </div>
            </motion.label>
          </div>

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 bg-gray-50 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">فایل‌های انتخاب شده</span>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </div>
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between bg-white rounded-xl p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiImage className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">تصویر {index + 1}</span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {uploadProgress && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <div className="text-sm font-medium text-blue-700 mb-2">{uploadProgress}</div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={files.length > 0 && !loading ? { scale: 1.02, y: -2 } : {}}
            whileTap={files.length > 0 && !loading ? { scale: 0.98 } : {}}
            type="submit"
            disabled={files.length === 0 || loading}
            className={`
              w-full py-4 rounded-2xl text-white font-bold transition-all duration-500 shadow-lg
              ${
                files.length > 0 && !loading
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-blue-500/25"
                  : "bg-gray-300 cursor-not-allowed shadow-gray-300/25"
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              {loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              )}
              {loading ? "در حال آپلود..." : "آپلود تصاویر"}
            </div>
          </motion.button>
        </form>

        <AnimatePresence>
          {uploadResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="mt-8 space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  نتایج آپلود
                </h3>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mt-2"></div>
              </div>
              <div className="space-y-4">
                {uploadResults.map((result, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`rounded-2xl overflow-hidden shadow-lg border ${
                      result.success
                        ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
                        : "bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
                    }`}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            result.success ? "bg-emerald-100" : "bg-red-100"
                          }`}>
                            {result.success ? (
                              <FiCheckCircle className="text-emerald-600 text-lg" />
                            ) : (
                              <FiAlertTriangle className="text-red-600 text-lg" />
                            )}
                          </div>
                          <span className="font-semibold text-gray-800">
                            {result.displayName}
                          </span>
                        </div>
                      </div>
                      {result.success && result.url && (
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-3 shadow-sm">
                            <img
                              src={result.url}
                              alt={result.displayName}
                              className="w-full h-auto rounded-lg shadow-md max-h-48 object-cover"
                            />
                          </div>
                          <motion.a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.02 }}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-all"
                          >
                            <FiImage className="w-4 h-4" />
                            مشاهده تصویر
                          </motion.a>
                        </div>
                      )}
                      {!result.success && (
                        <div className="bg-white rounded-xl p-3 shadow-sm">
                          <p className="text-red-600 text-sm font-medium">
                            {result.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}