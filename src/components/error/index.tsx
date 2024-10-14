import { Button } from "../ui/button";

export default function Error() {
  return (
    <section className="w-full h-screen flex flex-col justify-center items-center m:gap-4 text-center md:px-14 xl:px-60">
      <h1 className="text-3xl sm:text-4xl md:text-5xl w-full font-bold">
        Something went wrong
      </h1>
      <Button variant="default">Go Home</Button>
    </section>
  );
}
