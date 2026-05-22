import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { PlusCircle, FilePlus2 } from "lucide-react";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { FormsGrid } from "@/components/dashboard/FormsGrid";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch all user's forms and response counts
  const forms = await db.form.findMany({
    where: {
      userId,
    },
    include: {
      _count: {
        select: { responses: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Calculate stats
  const totalForms = forms.length;
  const totalResponses = forms.reduce((sum: number, form: any) => sum + (form._count?.responses || 0), 0);

  // Fetch count of AI analyzed responses
  const aiAnalyzed = await db.response.count({
    where: {
      form: {
        userId,
      },
      status: "analyzed",
    },
  });

  return (
    <div className="space-y-8">
      {/* Header section with modern gradient design */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Welcome back, {session.user.name}. Here is an overview of your forms.
          </p>
        </div>
        <div>
          <Button
            asChild
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-blue-600/10"
          >
            <Link href="/forms/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Form
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards
        totalForms={totalForms}
        totalResponses={totalResponses}
        aiAnalyzed={aiAnalyzed}
      />

      {/* Forms Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-200">Your Forms</h2>

        {totalForms === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={FilePlus2}
              title="No forms found"
              description="Create your first drag-and-drop form to start gathering responses and generating AI insights."
              actionLabel="Create Form"
              href="/forms/new"
            />
          </div>
        ) : (
          <FormsGrid initialForms={forms} />
        )}
      </div>
    </div>
  );
}
