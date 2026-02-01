
import React from 'react';

const ExportApp: React.FC = () => {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 pb-32">
      <header className="text-center space-y-2">
        <div className="inline-block p-3 bg-indigo-100 rounded-2xl text-3xl mb-2">📦</div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Cài Đặt Lên Điện Thoại</h2>
        <p className="text-gray-500">Chọn phương thức phù hợp nhất với nhu cầu của bạn</p>
      </header>

      {/* Option 1: PWA - The Instant Way */}
      <section className="bg-white rounded-[2.5rem] border-2 border-indigo-50 p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold">01</div>
          <div>
            <h3 className="text-xl font-black text-gray-800">Cách Nhanh Nhất (PWA)</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Không cần file APK - Chạy ngay trong 30 giây</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-5 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 font-bold">
              <span>🤖</span> Android (Chrome)
            </div>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal ml-4">
              <li>Mở link web bằng <b>Chrome</b>.</li>
              <li>Nhấn <b>dấu 3 chấm (⋮)</b> góc trên.</li>
              <li>Chọn <b>Cài đặt ứng dụng</b>.</li>
            </ol>
          </div>
          <div className="bg-gray-50 p-5 rounded-3xl space-y-3">
            <div className="flex items-center gap-2 text-pink-600 font-bold">
              <span>🍎</span> iPhone (Safari)
            </div>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal ml-4">
              <li>Mở link bằng <b>Safari</b>.</li>
              <li>Nhấn nút <b>Chia sẻ (Share)</b> ở dưới.</li>
              <li>Chọn <b>Thêm vào MH chính</b>.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Option 2: Real APK - The Pro Way */}
      <section className="bg-gray-900 rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10 text-9xl">🤖</div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl font-bold">02</div>
            <div>
              <h3 className="text-xl font-black">Xuất File APK Chính Thức</h3>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Dành cho Android - Đóng gói thành file .apk</p>
            </div>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed">
            Để tạo file APK từ bộ mã nguồn này, bạn cần sử dụng công cụ <b>Capacitor</b>. Đây là quy trình chuẩn mà các lập trình viên thường dùng:
          </p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
              <div>
                <p className="font-bold text-sm">Cài đặt môi trường</p>
                <p className="text-xs text-gray-500">Mở terminal tại thư mục dự án và chạy lệnh:</p>
                <code className="block bg-black/50 p-3 rounded-xl mt-2 font-mono text-[10px] text-emerald-400">
                  npm install @capacitor/core @capacitor/cli @capacitor/android
                </code>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
              <div>
                <p className="font-bold text-sm">Khởi tạo Android</p>
                <code className="block bg-black/50 p-3 rounded-xl mt-2 font-mono text-[10px] text-emerald-400">
                  npx cap init MoneyCare com.moneycare.app --web-dir dist<br/>
                  npx cap add android
                </code>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
              <div>
                <p className="font-bold text-sm">Build & Mở Android Studio</p>
                <code className="block bg-black/50 p-3 rounded-xl mt-2 font-mono text-[10px] text-emerald-400">
                  npm run build<br/>
                  npx cap copy<br/>
                  npx cap open android
                </code>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-xs">4</div>
              <div>
                <p className="font-bold text-sm">Xuất file .apk</p>
                <p className="text-xs text-gray-500">Trong Android Studio: Chọn <b>Build</b> &gt; <b>Build Bundle(s) / APK(s)</b> &gt; <b>Build APK(s)</b>.</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
            <p className="text-xs text-amber-500 font-medium leading-relaxed">
              <b>Lưu ý:</b> Cách này yêu cầu bạn máy tính của bạn phải cài đặt sẵn <b>Node.js</b> và <b>Android Studio</b>. Nếu bạn không phải là coder, hãy sử dụng <b>Cách 1 (PWA)</b> - nó mang lại trải nghiệm giống hệt app thật 100%!
            </p>
          </div>
        </div>
      </section>

      <footer className="text-center py-10">
        <p className="text-gray-400 text-xs">© 2024 MoneyCare Team - Made with ❤️ for your finance</p>
      </footer>
    </div>
  );
};

export default ExportApp;
