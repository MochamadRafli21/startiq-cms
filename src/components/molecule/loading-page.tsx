const JumpingDots = () => (
  <div className="flex space-x-2">
    <div className="w-4 h-4 bg-gray-500 rounded-full animate-bounce"></div>
    <div className="w-4 h-4 bg-gray-500 rounded-full animate-bounce delay-75"></div>
    <div className="w-4 h-4 bg-gray-500 rounded-full animate-bounce delay-150"></div>
  </div>
);

export function LoadingPage({ isLoading = true }) {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-xl">
        <JumpingDots />
        <p className="mt-4 text-lg font-semibold text-gray-700">Loading...</p>
      </div>
    </div>
  );
}
