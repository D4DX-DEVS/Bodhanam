import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import BackToTop from "@/app/_components/BackToTop";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
