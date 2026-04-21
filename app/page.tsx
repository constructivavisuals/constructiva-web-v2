import { Section0Loader } from "./components/sections/Section0Loader";
import { Section1Hero } from "./components/sections/Section1Hero";
import { Section2TileMosaic } from "./components/sections/Section2TileMosaic";
import { Section3BoschSequence } from "./components/sections/Section3BoschSequence";
import { Section4PortalShowcase } from "./components/sections/Section4PortalShowcase";
import { Section5BigNumber } from "./components/sections/Section5BigNumber";
import { Section6References } from "./components/sections/Section6References";
import { Section7SkyGuard } from "./components/sections/Section7SkyGuard";
import { Section8Footer } from "./components/sections/Section8Footer";

export default function HomePage() {
  return (
    <main>
      <Section0Loader />
      <Section1Hero />
      <Section2TileMosaic />
      <Section3BoschSequence />
      <Section4PortalShowcase />
      <Section5BigNumber />
      <Section6References />
      <Section7SkyGuard />
      <Section8Footer />
    </main>
  );
}
