import type { Metadata } from "next";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Demo from "@/components/landing/Demo";
import Steps from "@/components/landing/Steps";
import Features from "@/components/landing/Features";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Elber — Tu Asistente Personal de IA",
  description:
    "Elber recuerda quién eres, conversa en tiempo real y aprende de ti. Tu asistente con bigote y gafas.",
  openGraph: {
    title: "Elber — Tu Asistente Personal de IA",
    description:
      "Elber recuerda quién eres, conversa en tiempo real y aprende de ti. Tu asistente con bigote y gafas.",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col flex-1 relative overflow-hidden">
      <Nav />
      <Hero />
      <Demo />
      <Steps />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
}
