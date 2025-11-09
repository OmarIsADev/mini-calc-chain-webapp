import Auth from "@/components/auth/auth";
import Navbar from "@/components/core/navbar";

export default function Layout({ children }: React.ComponentProps<"div">) {
  return (
    <div className="container mx-auto space-y-8 min-h-screen">
      <Navbar />
      {children}
      <Auth />
    </div>
  );
}
