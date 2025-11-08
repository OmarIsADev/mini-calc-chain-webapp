"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div>
      <main>
        <h1>Home</h1>
        <Link href="/login">Login</Link>
        <Link href="/signup">Sign up</Link>
      </main>
    </div>
  );
}
