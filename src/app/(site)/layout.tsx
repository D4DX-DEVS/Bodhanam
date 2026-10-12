import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import BackToTop from "@/app/_components/BackToTop";
import MobileBottomNav from "@/app/_components/MobileBottomNav";
import ImageShimmer from "@/app/_components/ImageShimmer";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1 w-full">{children}</main>
      {/* Footer pads its own bottom to clear the floating mobile tab bar */}
      <Footer />
      <BackToTop />
      <MobileBottomNav />
      <ImageShimmer />
    </>
  );
}
