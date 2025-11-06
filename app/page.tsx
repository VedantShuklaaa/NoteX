import GradientBackground from "@/components/ui/background";
import Hero from "./ui/hero/hero";
import Hero2 from "./ui/hero2/hero2";

export default function Home() {

  return (
    <div className="h-[250vh] md:h-[225vh] lg:h-[220vh] xl:h-[200vh] w-full flex flex-col justify-center bg-[var(--background)] font-[roboto_Condensed]">
      <GradientBackground />
      <Hero/>
      <Hero2/>
    </div >
  );
}
