import GradientBackground from "@/components/ui/background";
import Hero from "./ui/hero/hero";
import Hero2 from "./ui/hero2/hero2";

export default function Home() {

  return (
    <div className="h-[200vh] w-full flex flex-col justify-center bg-[var(--background)]">
      <GradientBackground />
      <Hero />
      <GradientBackground />
      <Hero2 />
    </div >
  );
}
