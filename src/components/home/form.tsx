"use client";

import useAuthStore from "@/store/auth";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import Link from "next/link";

export default function Form() {
  const { isLoggedIn } = useAuthStore();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-4 text-center max-w-md mx-auto py-10">
        <p>Login to create a new chain or interact with an existing one.</p>
        <Button asChild variant="link">
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          Start a new chain
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel>Base</FieldLabel>
            <Input name="base" type="number" placeholder="Ex.g. 100" required />
          </Field>
          <Button type="submit">Create</Button>
        </form>
      </CardContent>
    </Card>
  );
}
