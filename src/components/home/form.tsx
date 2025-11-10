"use client";

import useAuthStore from "@/store/auth";
import useChainsStore from "@/store/chains";
import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { useState } from "react";

export default function Form() {
  const { isLoggedIn } = useAuthStore();
  const { addChain } = useChainsStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);


    const formData = new FormData();

    formData.append("base", e.currentTarget.base.value);

    const response = await fetch("/api/protected/chain", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      addChain(await response.json());
    }

    setIsSubmitting(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-4 text-center w-full mx-auto py-10">
        <p>Login to create a new chain or interact with an existing one.</p>
        <Button asChild variant="link">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-mono font-medium">setIsReplying(true)
          Start a new chain
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel>Base</FieldLabel>
            <Input
              name="base"
              type="number"
              step="0.01"
              placeholder="Ex.g. 100"
              required
            />
          </Field>
          <Button type="submit" disabled={isSubmitting}>Create</Button>
        </form>
      </CardContent>
    </Card>
  );
}
