/** biome-ignore-all lint/correctness/useExhaustiveDependencies: no need */
"use client";
import { useEffect } from "react";
import useChainsStore from "@/store/chains";
import Chain from "../chain/chain";

export default function Chains() {
  const { chains, addChain } = useChainsStore();

  useEffect(() => {
    if (chains.length > 0) return;
    const fetchChains = async () => {
      const response = await fetch("/api/chains");

      addChain(await response.json());
    };

    fetchChains();
  }, []);

  return chains.map((chain) => <Chain key={chain._id} chain={chain} />);
}
