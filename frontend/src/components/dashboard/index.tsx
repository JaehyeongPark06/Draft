"use client";

import Documents from "./documents";
import Filters from "./filters";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <section className="w-full h-full flex flex-col mt-4">
      <div className="w-full flex flex-col gap-4">
        <Filters />
        <Documents />
      </div>
    </section>
  );
}
