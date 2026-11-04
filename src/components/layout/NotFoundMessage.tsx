import { Button } from "@/components/ui/Button";

export function NotFoundMessage() {
  return (
    <div>
      <p className="slate mb-6 text-lime">404 / Missing frame</p>
      <h1 className="display max-w-4xl text-section">This page isn&rsquo;t in the cut.</h1>
      <Button href="/" className="mt-10 min-w-56">
        Back to home
      </Button>
    </div>
  );
}
