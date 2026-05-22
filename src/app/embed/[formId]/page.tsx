import { FormRenderer } from "@/components/forms/FormRenderer";
import { notFound } from "next/navigation";
import { EyeOff } from "lucide-react";
import { Metadata } from "next";
import { getCachedForm } from "@/lib/cache";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    formId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { formId } = await params;
  
  const form = await getCachedForm(formId);

  if (!form) {
    return {
      title: "Form Not Found - FormFlow",
    };
  }

  return {
    title: `${form.title} - FormFlow`,
    description: form.description || "Submit responses securely on FormFlow.",
  };
}

export default async function EmbedPage({ params }: PageProps) {
  const { formId } = await params;

  // Retrieve form by ID or slug (cached)
  const form = await getCachedForm(formId);

  if (!form) {
    return notFound();
  }

  // Not Published Screen
  if (!form.isPublished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-tr from-sky-100 via-blue-50 to-sky-100 px-4 text-center text-slate-800 relative overflow-hidden">
        {/* Subtle ambient lighting details */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-sky-300/30 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="max-w-md p-8 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-2xl shadow-blue-950/5 space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <EyeOff className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Form Not Active</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              This form has not been published or has been temporarily taken offline by its creator.
            </p>
          </div>

          <Link
            href="/"
            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200/40 bg-white/40 backdrop-blur-md text-[11px] text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-white/60 transition-all duration-300 shadow-sm"
          >
            <span>Powered by</span>
            <span className="font-extrabold text-slate-700 group-hover:text-blue-600 transition-colors">
              Form<span className="text-blue-600">Flow</span>
            </span>
          </Link>
        </div>
      </div>
    );
  }

  // Cast JSON schema to FieldDefinition array
  const schema = (form.schema || []) as any;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-100 via-blue-50 to-sky-100 flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Subtle ambient lighting details */}
      <div className="absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-sky-300/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-300/30 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center gap-6">
        <FormRenderer
          form={{
            id: form.id,
            title: form.title,
            description: form.description,
            schema,
            isMultiStep: form.isMultiStep,
            isPublished: form.isPublished,
          }}
        />

        <Link
          href="/"
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200/40 bg-white/40 backdrop-blur-md text-[11px] text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-white/60 transition-all duration-300 shadow-sm"
        >
          <span>Powered by</span>
          <span className="font-extrabold text-slate-700 group-hover:text-blue-600 transition-colors">
            Form<span className="text-blue-600">Flow</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
