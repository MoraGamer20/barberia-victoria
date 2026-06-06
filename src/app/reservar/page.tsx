import BookingWizard from '@/components/booking/BookingWizard';
import Navbar from '@/components/layout/Navbar';

export default function ReservarPage() {
  return (
    <main className="min-h-screen bg-dark-900 pb-20">
      <Navbar />
      <div className="pt-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <BookingWizard />
      </div>
    </main>
  );
}
