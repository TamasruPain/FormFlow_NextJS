import React, { useState } from "react";
import { FieldDefinition } from "@/types/form";
import { FieldRenderer } from "./FieldRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

interface MultiStepFormProps {
  fields: FieldDefinition[];
  values: Record<string, any>;
  onChange: (fieldId: string, value: any) => void;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function MultiStepForm({
  fields,
  values,
  onChange,
  errors,
  setErrors,
  onSubmit,
  isSubmitting,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for forward

  const currentField = fields[currentStep];

  // Validate the current step's field
  const validateStep = (): boolean => {
    if (!currentField) return true;

    const val = values[currentField.id];
    let stepError = "";

    if (currentField.required) {
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        stepError = `${currentField.label} is required.`;
      }
    }

    if (val && !stepError) {
      if (currentField.type === "email" && typeof val === "string") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          stepError = "Please enter a valid email address.";
        }
      }
      if (currentField.type === "number" && isNaN(Number(val))) {
        stepError = "Please enter a valid number.";
      }
    }

    if (stepError) {
      setErrors((prev) => ({ ...prev, [currentField.id]: stepError }));
      return false;
    }

    // Clear error if valid
    setErrors((prev) => {
      const next = { ...prev };
      delete next[currentField.id];
      return next;
    });
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < fields.length - 1) {
        setDirection(1);
        setCurrentStep((prev) => prev + 1);
      } else {
        onSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Framer Motion variants for slide transition
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  const progressPercent = ((currentStep + 1) / fields.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress indicators */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-500 font-semibold tracking-wider uppercase">
          <span>
            Question {currentStep + 1} of {fields.length}
          </span>
          <span>{Math.round(progressPercent)}% Complete</span>
        </div>
        <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-gradient-to-r from-blue-500 to-sky-500 rounded-full"
          />
        </div>
      </div>

      {/* Slide Container */}
      <div className="relative min-h-[220px] overflow-hidden py-2 px-1">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full"
          >
            {currentField && (
              <FieldRenderer
                field={currentField}
                value={values[currentField.id]}
                onChange={(val) => {
                  onChange(currentField.id, val);
                  // Clear error as the user types
                  if (errors[currentField.id]) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next[currentField.id];
                      return next;
                    });
                  }
                }}
                error={errors[currentField.id]}
                disabled={isSubmitting}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step controls */}
      <div className="flex justify-between items-center pt-4 border-t border-blue-100/60">
        <Button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
          variant="outline"
          className="border-blue-200/80 text-blue-700 hover:text-blue-800 hover:bg-blue-50/40 bg-white/80"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-md shadow-blue-500/10"
        >
          {currentStep === fields.length - 1 ? (
            <>
              {isSubmitting ? "Submitting..." : "Submit Form"}
              <Check className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
