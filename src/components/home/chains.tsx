/** biome-ignore-all lint/correctness/useExhaustiveDependencies: no need */
"use client";
import { useEffect, useState } from "react";
import useChainsStore from "@/store/chains";
import Chain from "../chain/chain";
import { Spinner } from "../ui/spinner";

export default function Chains() {
  const { chains, addChain } = useChainsStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (chains.length > 0) return setIsLoading(false);
    const fetchChains = async () => {
      const response = await fetch("/api/chains");

      addChain(await response.json().finally(() => setIsLoading(false)));
    };

    fetchChains();
  }, []);

  if (isLoading)
    return (
      <div className="w-screen h-screen fixed left-0 top-0 bg-white flex justify-center items-center">
        <Spinner className="size-8" />
      </div>
    );

  return chains.map((chain) => <Chain key={chain._id} chain={chain} />);
}
