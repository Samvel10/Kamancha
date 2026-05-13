import HeroSection from '@/components/sections/HeroSection';
import PopularDishesSection from '@/components/sections/PopularDishesSection';
import StatsSection from '@/components/sections/StatsSection';
import AboutSnippetSection from '@/components/sections/AboutSnippetSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <PopularDishesSection />
      <AboutSnippetSection />
    </>
  );
}
