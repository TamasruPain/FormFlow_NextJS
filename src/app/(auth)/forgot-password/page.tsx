"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/shared/Logo";
import { 
  Loader2, 
  Mail, 
  ShieldCheck, 
  Lock, 
  Key, 
  Clock, 
  ChevronLeft 
} from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (resetError) {
        setError(resetError.message || "Failed to send reset link. Please check your email.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
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

        {/* Mock Security Panel */}
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
                <Lock className="h-4 w-4 text-sky-400" />
                <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                  Access Recovery Portal
                </span>
              </div>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              </span>
            </div>

            {/* Recovery Visual Card */}
            <div className="space-y-3 bg-zinc-950/60 rounded-xl p-4 border border-zinc-900/80">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
                  <Key className="h-4 w-4 text-sky-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">One-Time Recovery Link</h4>
                  <p className="text-[9px] text-zinc-500">Cryptographically signed tokens</p>
                </div>
              </div>
              
              <div className="pt-2 border-t border-zinc-900/60 flex items-center justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  Expires in 15 minutes
                </span>
                <span className="text-zinc-500">AES-256 Hashing</span>
              </div>
            </div>

            {/* Flow instructions */}
            <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
              <div className="flex gap-2">
                <span className="h-5 w-5 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-300 font-bold border border-zinc-800 shrink-0">1</span>
                <span>Enter your registered email address and submit the form request.</span>
              </div>
              <div className="flex gap-2">
                <span className="h-5 w-5 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-300 font-bold border border-zinc-800 shrink-0">2</span>
                <span>Open your inbox and click the secure password recovery link.</span>
              </div>
              <div className="flex gap-2">
                <span className="h-5 w-5 rounded bg-zinc-900 flex items-center justify-center font-mono text-[10px] text-zinc-300 font-bold border border-zinc-800 shrink-0">3</span>
                <span>Choose a new password and sign back in to access your builder.</span>
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
                Forgot password?
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
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

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-400 font-medium space-y-1.5"
              >
                <div className="font-bold">Reset link sent!</div>
                <p className="leading-relaxed opacity-90">Please check your inbox. If the email doesn't arrive within 2 minutes, check your spam folder.</p>
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
                    disabled={loading || success}
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-gradient-to-r from-blue-600 via-sky-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-blue-600/10 rounded-xl h-11 transition-all duration-300 font-semibold hover:shadow-blue-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </motion.div>

              {/* Redirect to Login */}
              <motion.div variants={itemVariants} className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
