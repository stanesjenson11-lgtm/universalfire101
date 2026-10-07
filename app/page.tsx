import Loader from "@/components/chrome/Loader";
import Hero from "@/components/home/Hero";
import Fire from "@/components/home/Fire";
import ShotStage from "@/components/home/ShotStage";
import Inside from "@/components/home/Inside";
import { About, Products, Specs, Services, Sectors, Equipment, Why, Licence, Contact } from "@/components/home/Sections";
import Details from "@/components/Detail";
import ScrubMarks from "@/components/ui/ScrubMarks";

/** The whole site: one scroll, apple.com rhythm of black and white. */
export default function Home() {
  return (
    <>
      <Loader />
      <Hero />
      <Fire />
      {/* After Fire: it reads whether the fire canvas got WebGL. */}
      <ShotStage />
      <About />
      <Inside />
      <Products />
      <Specs />
      <Services />
      <Sectors />
      <Equipment />
      <Why />
      <Licence />
      <Contact />
      <Details />
      <ScrubMarks />
    </>
  );
}
