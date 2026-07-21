import Header from "@/app/_components/Header";
import Footer from "@/app/_components/Footer";
import BackToTop from "@/app/_components/BackToTop";
import { getColumns } from "@/lib/data";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const topics = await getColumns();

  return (
    <>
      <Header topics={topics} />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <BackToTop />
    </>
  );
}
