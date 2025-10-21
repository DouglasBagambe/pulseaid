export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1020]">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-[#35D07F]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#35D07F] rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
