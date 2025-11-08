"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("username", e.currentTarget.username.value);
    formData.append("password", e.currentTarget.password.value);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      return router.replace("/");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">Sign up</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  required
                  minLength={3}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input id="password" type="password" required minLength={10} />
              </Field>
              <Field>
                <Button type="submit">Sign up</Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login">Login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
