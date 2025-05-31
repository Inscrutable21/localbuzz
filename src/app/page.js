import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-8 items-center sm:items-start max-w-6xl mx-auto mt-24">
        <h1 className="text-4xl md:text-6xl font-bold text-center sm:text-left">
          LocalBuzzAgency
        </h1>
        <h2 className="text-xl md:text-2xl text-center sm:text-left">
          Digital Marketing Services for Local Businesses
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-12">
          <div className="bg-black/[.05] dark:bg-white/[.06] p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Branding & Identity</h3>
            <p>Professional logo design, brand guidelines, and visual identity services.</p>
          </div>
          
          <div className="bg-black/[.05] dark:bg-white/[.06] p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Web Development</h3>
            <p>Custom websites optimized for performance and conversions.</p>
          </div>
          
          <div className="bg-black/[.05] dark:bg-white/[.06] p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Digital Marketing</h3>
            <p>SEO, social media management, and paid advertising campaigns.</p>
          </div>
        </div>
        
        <a
          className="mt-12 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-base h-12 px-5"
          href="/packages"
        >
          View Our Packages
        </a>
      </main>
    </div>
  );
}

