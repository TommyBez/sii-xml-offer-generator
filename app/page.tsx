import Link from "next/link";
import { FileText, Zap, Shield, Rocket } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="row-start-2 flex flex-col items-center gap-8 text-center">
        <div className="flex items-center gap-3">
          <Zap className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            SII XML Offer Generator
          </h1>
        </div>
        
        <p className="max-w-[600px] text-lg text-muted-foreground">
          Create professional energy offers with SII-compliant XML export. 
          Our intelligent wizard guides you through every step of the process.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/wizard"
            className="flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Rocket className="h-4 w-4" />
            Start Creating Offer
          </Link>
          <Link
            href="/docs"
            className="flex h-12 items-center justify-center rounded-md border border-input px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View Documentation
          </Link>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Multi-Step Wizard</h3>
            <p className="text-sm text-muted-foreground">
              18 comprehensive form sections guide you through creating complete energy offers
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Auto-Save & Recovery</h3>
            <p className="text-sm text-muted-foreground">
              Never lose your work with automatic draft saving and session recovery
            </p>
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">SII Compliant</h3>
            <p className="text-sm text-muted-foreground">
              Generate XML files that meet all Spanish energy sector requirements
            </p>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center gap-[24px]">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
