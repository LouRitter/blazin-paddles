import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content (Hero Section) */}
      <main className="flex-grow flex items-center justify-center hero-bg pt-20">
        <div className="container mx-auto px-6 text-center">
          <div className="py-24 md:py-32">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-tight text-shadow-lime">
              Your Court is Waiting.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mt-4 max-w-3xl mx-auto">
              The fastest, easiest way to find and book premium pickleball courts near you. Stop searching, start playing.
            </p>
            <div className="mt-8">
              <Link 
                href="/booking" 
                className="bg-lime-500 text-black font-bold py-4 px-10 rounded-lg text-lg hover:bg-lime-400 transition-all duration-300 transform hover:scale-105 inline-block shadow-lg shadow-lime-500/20"
              >
                Book a Court Now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
