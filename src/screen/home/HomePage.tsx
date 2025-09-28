import { Features, Footer, Header, Hero, Showcase } from "@/components/home";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Showcase />
      </main>
      <Footer />
    </div>
  );
}
