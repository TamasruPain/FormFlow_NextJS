import React from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";
import {
  Sparkles,
  ArrowRight,
  MousePointerClick,
  Layers,
  Code,
  BrainCircuit,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });

  const features = [
    {
      title: "Drag & Drop Builder",
      description:
        "Build complex forms in seconds with our intuitive, smooth visual drag-and-drop builder.",
      icon: MousePointerClick,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Multi-Step Journeys",
      description:
        "Convert more respondents by breaking long forms into beautiful, guided multi-step experiences.",
      icon: Layers,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20",
    },
    {
      title: "Embed Anywhere",
      description:
        "Copy a simple iframe code or share a direct link to publish your form on any website.",
      icon: Code,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "AI Response Insights",
      description:
        "Analyze submissions automatically in the background using serverless AI queue pipeline.",
      icon: BrainCircuit,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-[-10%] left-[10%] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[10%] h-[600px] w-[600px] rounded-full bg-sky-600/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 mx-auto max-w-7xl w-full px-6 h-20 flex items-center justify-between border-b border-zinc-900/50">
        <Logo />
        <div className="flex items-center gap-4">
          {session ? (
            <>
              <span className="text-sm text-zinc-400 hidden sm:inline-block">
                {session.user.email}
              </span>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-sky-600/10 rounded-lg px-4 py-2 border-0"
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-sky-600/10 rounded-lg px-4 py-2 border-0"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 md:py-32 max-w-4xl mx-auto">
        {/* Glowing badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-300 mb-6 shadow-sm shadow-sky-500/5 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>FormFlow SaaS Builder</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Create Smarter Forms
          <span className="block mt-2 bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
            Powered by Serverless AI
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Design beautiful responsive forms with simple drag-and-drop actions.
          Analyze submissions in real time with our background AI insights pipeline.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-sky-600/15 rounded-xl px-8 h-12 text-base font-semibold group border-0"
          >
            {session ? (
              <Link href="/dashboard" className="flex items-center gap-2">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <Link href="/register" className="flex items-center gap-2">
                Create Your Free Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 border-t border-zinc-900/50 bg-zinc-950/40 backdrop-blur-sm">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-100 mb-4">
            Everything you need to gather data
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            FormFlow is packed with enterprise-grade features, all running on a
            completely free, highly responsive serverless infrastructure.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl border border-zinc-900 bg-zinc-900/10 p-6 hover:border-zinc-800 hover:bg-zinc-900/20 transition-all duration-300 hover:translate-y-[-2px]"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${feature.color} mb-4 shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-200 mb-2 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900/50 py-8 text-center text-xs text-zinc-500">
        <p>&copy; {new Date().getFullYear()} FormFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
