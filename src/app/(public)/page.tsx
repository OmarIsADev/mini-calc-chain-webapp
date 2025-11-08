import Chains from "@/components/home/chains";
import Form from "@/components/home/form";
import { Separator } from "@/components/ui/separator";

export default async function Home() {  
  return (
    <div>
      <main className="container space-y-8 mx-auto max-w-2xl px-8">
        <Form />
        <Separator />
        <div className="flex flex-col-reverse gap-4">
          <Chains />
        </div>
      </main>
    </div>
  );
}
