import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NewsSection } from "@/components/NewsSection";
import { useLanguage } from "@/contexts/LanguageContext";

export default function News() {
  const { dir } = useLanguage();
  return (
    <div className="min-h-screen flex flex-col bg-background" dir={dir}>
      <Header />
      <main className="flex-1">
        <NewsSection />
      </main>
      <Footer />
    </div>
  );
}
