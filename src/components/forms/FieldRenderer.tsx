import React from "react";
import { FieldDefinition } from "@/types/form";
import { AlertCircle, ChevronDown, Check, Upload, X, FileText } from "lucide-react";

interface FieldRendererProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export function FieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled = false,
}: FieldRendererProps) {
  const { id, type, label, placeholder, required, options = [], helpText } = field;

  // Single Checkbox (Boolean) vs Multiple Checkboxes (Array)
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (options.length === 0) {
      onChange(checked);
    } else {
      const currentValues = Array.isArray(value) ? [...value] : [];
      if (checked) {
        if (!currentValues.includes(optionValue)) {
          onChange([...currentValues, optionValue]);
        }
      } else {
        onChange(currentValues.filter((val) => val !== optionValue));
      }
    }
  };

  const isChecked = (optionValue: string) => {
    if (options.length === 0) {
      return !!value;
    }
    return Array.isArray(value) && value.includes(optionValue);
  };

  const inputId = `field-${id}`;

  return (
    <div className="space-y-2 w-full">
      {/* Label and Required Indicator */}
      <div className="flex justify-between items-baseline">
        <label
          htmlFor={type !== "radio" && options.length > 0 ? undefined : inputId}
          className="text-sm font-semibold text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && <span className="text-rose-500 font-bold">*</span>}
        </label>
      </div>

      {/* Input Elements */}
      <div className="relative">
        {type === "textarea" ? (
          <textarea
            id={inputId}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`block w-full rounded-xl border bg-white/95 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[110px] resize-y ${
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-blue-200/80 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
        ) : type === "select" ? (
          <div className="relative">
            <select
              id={inputId}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={`block w-full rounded-xl border bg-white/95 pl-4 pr-10 py-3 text-sm text-slate-800 placeholder-slate-400 transition duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${
                error
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-blue-200/80 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/20"
              }`}
            >
              <option value="" disabled className="bg-white text-slate-400">
                {placeholder || "Select an option..."}
              </option>
              {options.map((opt) => (
                <option key={opt} value={opt} className="bg-white text-slate-800">
                  {opt}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        ) : type === "checkbox" ? (
          options.length === 0 ? (
            // Single Checkbox
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  id={inputId}
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleCheckboxChange("", e.target.checked)}
                  disabled={disabled}
                  className="peer sr-only"
                />
                <div
                  className={`h-5 w-5 rounded-md border transition duration-200 peer-focus:ring-2 peer-focus:ring-blue-500/20 flex items-center justify-center ${
                    value
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-blue-200 bg-white/95 peer-hover:border-blue-300"
                  } ${error ? "border-rose-500" : ""}`}
                >
                  {value && (
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />
                  )}
                </div>
              </div>
              <span className="text-sm text-slate-600 group-hover:text-slate-800 select-none">
                {placeholder || "Check this box"}
              </span>
            </label>
          ) : (
            // Multiple Checkboxes
            <div className="grid gap-3 sm:grid-cols-2 mt-1">
              {options.map((opt) => {
                const optChecked = isChecked(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-blue-100/60 bg-white/60 hover:bg-blue-50/40 hover:border-blue-200/80 transition duration-200"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={optChecked}
                        onChange={(e) => handleCheckboxChange(opt, e.target.checked)}
                        disabled={disabled}
                        className="peer sr-only"
                      />
                      <div
                        className={`h-5 w-5 rounded-md border transition duration-200 peer-focus:ring-2 peer-focus:ring-blue-500/20 flex items-center justify-center ${
                          optChecked
                            ? "border-blue-500 bg-blue-600 text-white"
                            : "border-blue-200 bg-white peer-hover:border-blue-300"
                        }`}
                      >
                        {optChecked && (
                          <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} />
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-800 select-none">
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
          )
        ) : type === "radio" ? (
          <div className="grid gap-3 sm:grid-cols-2 mt-1">
            {options.map((opt) => {
              const isSelected = value === opt;
              return (
                <label
                  key={opt}
                  className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl border border-blue-100/60 bg-white/60 hover:bg-blue-50/40 hover:border-blue-200/80 transition duration-200"
                >
                  <div className="relative flex items-center">
                    <input
                      type="radio"
                      name={inputId}
                      checked={isSelected}
                      onChange={() => onChange(opt)}
                      disabled={disabled}
                      className="peer sr-only"
                    />
                    <div
                      className={`h-5 w-5 rounded-full border transition duration-200 peer-focus:ring-2 peer-focus:ring-blue-500/20 flex items-center justify-center ${
                        isSelected
                          ? "border-blue-500 bg-blue-600"
                          : "border-blue-200 bg-white peer-hover:border-blue-300"
                      }`}
                    >
                      {isSelected && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-600 group-hover:text-slate-800 select-none">
                    {opt}
                  </span>
                </label>
              );
            })}
          </div>
        ) : type === "file" ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                id={inputId}
                type="file"
                accept="application/pdf"
                disabled={disabled}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) {
                    onChange(null);
                    return;
                  }

                  if (file.size > 5 * 1024 * 1024) {
                    alert("File is too large. Maximum size allowed is 5MB.");
                    e.target.value = "";
                    onChange(null);
                    return;
                  }

                  const reader = new FileReader();
                  reader.onloadend = () => {
                    onChange({
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      base64: reader.result as string,
                    });
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
              <label
                htmlFor={inputId}
                className={`flex items-center gap-2 cursor-pointer rounded-xl border bg-white/95 px-4 py-3 text-sm text-slate-800 transition duration-200 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 select-none ${
                  error ? "border-rose-500" : "border-blue-200/80 hover:border-blue-300"
                }`}
              >
                <Upload className="h-4 w-4 text-slate-500" />
                <span>{value && typeof value === "object" ? "Change PDF File" : placeholder || "Choose PDF File"}</span>
              </label>

              {value && typeof value === "object" && (
                <button
                  type="button"
                  onClick={() => {
                    const inputEl = document.getElementById(inputId) as HTMLInputElement;
                    if (inputEl) inputEl.value = "";
                    onChange(null);
                  }}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all cursor-pointer animate-in fade-in duration-200"
                  title="Remove selected file"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {value && typeof value === "object" && value.name && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/60 p-2.5 rounded-xl w-fit animate-in slide-in-from-top-1 duration-200">
                <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="font-semibold max-w-[200px] truncate">{value.name}</span>
                <span className="text-slate-400">({(value.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>
        ) : (
          // Default: text, email, number, date
          <input
            id={inputId}
            type={type}
            value={value || ""}
            onChange={(e) => {
              const val = e.target.value;
              onChange(type === "number" ? (val === "" ? "" : Number(val)) : val);
            }}
            placeholder={placeholder}
            disabled={disabled}
            className={`block w-full rounded-xl border bg-white/95 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              error
                ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                : "border-blue-200/80 hover:border-blue-300 focus:border-blue-500 focus:ring-blue-500/20"
            }`}
          />
        )}
      </div>

      {/* Error Message and Help Text */}
      {error ? (
        <p className="text-xs text-rose-500 flex items-center gap-1.5 animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      ) : (
        helpText && <p className="text-xs text-slate-500">{helpText}</p>
      )}
    </div>
  );
}
