import Hero from '@/components/ui/Hero';
import FeaturedFurniture from '@/components/ui/FeaturedFurniture';
import HowItWorks from '@/components/ui/HowItWorks';
import PlatformCapabilities from '@/components/ui/PlatformCapabilities';
import AiShowcase from '@/components/ui/AiShowcase';
import RetailerCta from '@/components/ui/RetailerCta';

export default function Home() {
  return (
    <div className="w-full flex flex-col">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Featured Furniture Section */}
      <FeaturedFurniture />

      {/* 3. How It Works Section */}
      <HowItWorks />

      {/* 4. Platform Capabilities Section */}
      <PlatformCapabilities />

      {/* 5. AI Showcase Section */}
      <AiShowcase />

      {/* 6. Retailer Call-to-Action Section */}
      <RetailerCta />
    </div>
  );
}
