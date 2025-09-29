import ProtectedRoute from '../components/ProtectedRoute';

export default function SessionsPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-gray-100 pt-20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">My Sessions</h1>
          
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-300 text-center">
              Your booked sessions will appear here. Book a court to get started!
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
