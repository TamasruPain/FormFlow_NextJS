"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { 
  Loader2, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  Sparkles, 
  LayoutTemplate, 
  PlusCircle, 
  CheckCircle2, 
  ArrowRight 
} from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await signUp.email(
        {
          email,
          password,
          name,
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
            setError(ctx.error.message || "Something went wrong during sign up");
          },
        }
      );
    } catch {
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

        {/* Mock Builder Interface */}
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
                <LayoutTemplate className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Form Builder Canvas
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-zinc-500 font-mono">Autosaved</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                </span>
              </div>
            </div>

            {/* Mock Form Fields list with drag indicators */}
            <div className="space-y-3">
              {/* Field 1 (Draggable element) */}
              <div className="flex items-center justify-between bg-zinc-950/60 rounded-xl p-3 border border-zinc-900/80">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Full Name</h4>
                    <p className="text-[9px] text-zinc-500">Text input field</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-800">Required</span>
                </div>
              </div>

              {/* Field 2 (Draggable element - active/being edited) */}
              <motion.div 
                animate={{ 
                  borderColor: ["rgba(59, 130, 246, 0.2)", "rgba(14, 165, 233, 0.4)", "rgba(59, 130, 246, 0.2)"]
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="flex items-center justify-between bg-zinc-950/80 rounded-xl p-3 border border-sky-500/30 shadow-md shadow-sky-500/5 relative"
              >
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded bg-sky-600/10 flex items-center justify-center border border-sky-500/20 text-sky-400">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">Email Address</h4>
                    <p className="text-[9px] text-sky-400">Email input field</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] bg-sky-950/60 px-1.5 py-0.5 rounded text-sky-300 font-semibold border border-sky-500/20">Active</span>
                </div>
              </motion.div>

              {/* Field 3 (Add new field button visual) */}
              <div className="flex items-center justify-center gap-2 bg-zinc-950/30 hover:bg-zinc-950/50 rounded-xl p-2.5 border border-dashed border-zinc-800 cursor-pointer transition-colors group">
                <PlusCircle className="h-3.5 w-3.5 text-zinc-500 group-hover:text-sky-400 transition-colors" />
                <span className="text-[11px] font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">Add Custom Field</span>
              </div>
            </div>

            {/* Workflow steps indicator */}
            <div className="pt-2 border-t border-zinc-800/40 space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Deployment Progress</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-950/50 rounded-lg p-2 border border-zinc-900 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mb-1" />
                  <span className="text-[9px] font-bold text-zinc-300">1. Design</span>
                </div>
                <div className="bg-zinc-950/50 rounded-lg p-2 border border-blue-500/20 flex flex-col items-center justify-center text-center relative">
                  <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                  </span>
                  <div className="h-3.5 w-3.5 rounded-full border border-blue-400/30 flex items-center justify-center mb-1 bg-blue-600/10">
                    <ArrowRight className="h-2 w-2 text-blue-400" />
                  </div>
                  <span className="text-[9px] font-bold text-blue-300">2. Publish</span>
                </div>
                <div className="bg-zinc-950/20 rounded-lg p-2 border border-zinc-900/60 flex flex-col items-center justify-center text-center opacity-50">
                  <Sparkles className="h-3.5 w-3.5 text-zinc-600 mb-1" />
                  <span className="text-[9px] font-bold text-zinc-500">3. AI Insights</span>
                </div>
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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] lg:hidden pointer-events-none" />
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
                Create your account
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Sign up to start building and embedding forms with AI insights.
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
              {/* Full Name */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Full Name
                </Label>
                <div className="relative group">
                  <User className="absolute top-3 left-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 pl-10 border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus-visible:border-blue-500/60 focus-visible:ring-blue-500/10 rounded-xl transition-all duration-300"
                    disabled={loading}
                  />
                </div>
              </motion.div>

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
                <Label htmlFor="password" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Password
                </Label>
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

              {/* Confirm Password */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute top-3 left-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </motion.div>

              {/* Redirect to Login */}
              <motion.div variants={itemVariants} className="text-center pt-2">
                <p className="text-sm text-zinc-400">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            </form>
          </motion.div>
          
          {/* Footer signature */}
          <div className="mt-8 text-center text-xs text-zinc-500">
            Handcrafted with ❤️ by{" "}
            <a
              href="https://github.com/TamasruPain"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#71717A] hover:text-[#E5A320] transition-colors duration-200 font-semibold"
            >
              @TamasruPain
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

