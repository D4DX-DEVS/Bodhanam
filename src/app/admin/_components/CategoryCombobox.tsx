"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}

/**
 * Free-text input with a themed suggestion dropdown (matches the Radix Select
 * look). Radix Select itself can't accept typed values, so this is a light
 * combobox: type anything, or pick a suggestion.
 */
export default function CategoryCombobox({
  value,
  onChange,
  suggestions,
  placeholder,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const q = value.trim().toLowerCase();
  const filtered = q
    ? suggestions.filter((s) => s.toLowerCase().includes(q))
    : suggestions;

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(e) => {
        // Close only when focus leaves the whole combobox
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 pr-10 border border-default rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-ink bg-paper"
      />
      <button
        type="button"
        aria-label="Show category suggestions"
        onClick={() => setOpen((o) => !o)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted"
      >
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && filtered.length > 0 && (
        <div
          className="absolute z-[70] mt-1.5 max-h-64 w-full overflow-y-auto rounded-lg border p-1 shadow-lg"
          style={{
            borderColor: "var(--border)",
            backgroundColor: "var(--paper-elevated)",
          }}
        >
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onChange(s);
                setOpen(false);
              }}
              className="relative flex w-full cursor-pointer select-none items-center rounded px-8 py-2 text-left text-sm text-ink outline-none hover:bg-primary/10 hover:text-primary focus-visible:bg-primary/10 focus-visible:text-primary"
            >
              {s === value && (
                <Check size={15} className="absolute left-2 text-primary" />
              )}
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
