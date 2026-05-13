import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import PopularDishesSection from '@/components/sections/PopularDishesSection';
import AboutSnippetSection from '@/components/sections/AboutSnippetSection';
import MusicSection from '@/components/sections/MusicSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <PopularDishesSection />
      <AboutSnippetSection />
      <MusicSection />
    </>
  );
}
