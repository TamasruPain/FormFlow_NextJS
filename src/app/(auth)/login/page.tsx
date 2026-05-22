"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { Loader2, Lock, Mail, BrainCircuit, Sparkles, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn.email(
        {
          email,
          password,
        },
        {
          onRequest: () => {
            setLoading(true);
          },
          onResponse: () => {
            setLoading(false);
          },
          onSuccess: () => {
            router.push("/");
            router.refresh();
          },
          onError: (ctx) => {
            setError(ctx.error.message || "Invalid email or password");
          },
        }
      );
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-zinc-950 text-zinc-100 relative overflow-hidden font-sans">
      {/* LEFT SIDE: Beautiful Interactive Showcase Panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden border-r border-zinc-900/60 bg-zinc-950">
        {/* Background grids and glowing meshes */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-sky-600/10 blur-[100px] pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10">
          <Logo />
        </div>

        {/* Mock Analytics Interface */}
        <div className="relative z-10 w-full max-w-md mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="border border-zinc-800 bg-zinc-900/30 backdrop-blur-xl rounded-2xl p-6 shadow-2xl space-y-4"
          >
            {/* Mock Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  AI Response Processor
                </span>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              </span>
            </div>

            {/* Mock Submission Card */}
            <div className="space-y-2 bg-zinc-950/60 rounded-xl p-4 border border-zinc-900/80">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Feedback Form</h4>
                  <p className="text-[10px] text-zinc-500">alex@design.io</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] text-emerald-400 font-semibold shadow-sm">
                  Positive
                </span>
              </div>
              <p className="text-xs text-zinc-300 italic leading-relaxed">
                "The drag-and-drop builder is super smooth. Creating multi-step forms
                feels fluid, and the responses load instantly. Definitely five stars!"
              </p>
            </div>

            {/* Mock AI Agent Report Card */}
            <div className="space-y-3 bg-zinc-950/60 rounded-xl p-4 border border-zinc-900/80">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-sky-400 animate-pulse" />
                <span className="text-xs font-bold text-zinc-200">FormFlow Intelligence</span>
              </div>
              <div className="space-y-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "95%" }}
                  transition={{ delay: 0.5, duration: 1.2 }}
                  className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded"
                />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "60%" }}
                  transition={{ delay: 1.1, duration: 0.8 }}
                  className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded"
                />
              </div>
              <div className="pt-2 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                <span>Sentiment Score: 98%</span>
                <span>Latency: 120ms</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center gap-2 text-zinc-500 text-xs">
          <ShieldCheck className="h-4 w-4 text-blue-500/70" />
          <span>SSL Secured Connection &bull; GDPR Compliant Data Hashing</span>
        </div>
      </div>

      {/* RIGHT SIDE: Elegant Form Interface */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 relative bg-zinc-950">
        {/* Mobile Background Gradients */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] lg:hidden pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-blue-600/5 blur-[80px] lg:hidden pointer-events-none" />

        {/* Mobile Logo Header */}
        <div className="lg:hidden flex justify-center mb-8 relative z-10">
          <Logo />
        </div>

        {/* Center Container */}
        <div className="relative z-10 w-full max-w-md mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl space-y-6 relative overflow-hidden"
          >
            {/* Top Glow Bar */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

            {/* Header Content */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                Welcome back
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Enter your credentials to access your FormFlow dashboard.
              </p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400 font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute top-3 left-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus-visible:border-blue-500/60 focus-visible:ring-blue-500/10 rounded-xl transition-all duration-300"
                    disabled={loading}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute top-3 left-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus-visible:border-blue-500/60 focus-visible:ring-blue-500/10 rounded-xl transition-all duration-300"
                    disabled={loading}
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-sky-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-blue-600/10 rounded-xl h-11 transition-all duration-300 font-semibold hover:shadow-blue-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Sign in with Email"
                  )}
                </Button>
              </motion.div>

              {/* Redirect to Register */}
              <motion.div variants={itemVariants} className="text-center pt-2">
                <p className="text-sm text-zinc-400">
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

