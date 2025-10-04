import {
  DataFlowVisualization,
  Features,
  Footer,
  Header,
  Hero,
  Showcase,
} from "./components";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-gray-50">
      <Header />
      <main className="pt-16">
        <Hero />
        <DataFlowVisualization />
        <Features />
        <Showcase />
      </main>
      <Footer />
    </div>
  );
}
