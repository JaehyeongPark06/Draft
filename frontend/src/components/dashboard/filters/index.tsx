import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ArrowDownAZ } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { useRouter } from "next/navigation";

export default function Filters() {
  const router = useRouter();

  return (
    <section className="w-full flex flex-col xl:flex-row gap-4">
      <div className="relative h-9 flex w-full xl:w-1/2 2xl:w-5/12 items-center justify-center">
        <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
        <Input
          onChange={(e) => {
            if (e.target.value === "") {
              router.push(`/dashboard`);
              return;
            }
            router.push(`/dashboard?q=${e.target.value}`);
          }}
          placeholder="Search documents..."
          className="pl-10"
        />
      </div>
      <div className="flex flex-row justify-start items-center gap-2">
        <Select defaultValue="me">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="text-left">
              <SelectItem value="me">Owned by me</SelectItem>
              <SelectItem value="anyone">Owned by anyone</SelectItem>
              <SelectItem value="not-me">Not owned by me</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Toggle aria-label="Toggle alphabetical order">
          <ArrowDownAZ className="h-4 w-4" />
        </Toggle>
      </div>
    </section>
  );
}
