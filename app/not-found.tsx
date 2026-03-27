import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f0f23] flex flex-col items-center justify-center text-gray-100 p-4">
      <h2 className="text-4xl font-bold text-amber-400 mb-4">404</h2>
      <p className="text-xl text-gray-300 mb-8">ไม่พบหน้าที่คุณต้องการ</p>
      <Link
        href="/"
        className="px-6 py-3 bg-amber-500 text-[#1a1a35] font-bold rounded-lg hover:bg-amber-400 transition-colors"
      >
        กลับสู่หน้าหลัก
      </Link>
    </div>
  );
}
