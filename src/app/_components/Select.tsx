"use client";

import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  name?: string;
  ariaLabel?: string;
  className?: string;
}

/**
 * Themed Radix Select — reusable across site + admin. Renders a hidden native
 * input when `name` is set so it still submits inside a plain GET/POST form.
 */
export default function Select({
  value,
  onValueChange,
  options,
  name,
  ariaLabel,
  className = "",
}: SelectProps) {
  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <RadixSelect.Root value={value} onValueChange={onValueChange}>
        <RadixSelect.Trigger
          aria-label={ariaLabel}
          className={`group inline-flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm text-ink outline-none transition-colors focus-visible:border-primary data-[state=open]:border-primary ${className}`}
          style={{ borderColor: "var(--border)", backgroundColor: "var(--paper-elevated)" }}
        >
          <RadixSelect.Value />
          <RadixSelect.Icon>
            <ChevronDown
              size={16}
              className="text-muted transition-transform duration-200 group-data-[state=open]:rotate-180"
            />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={6}
            className="z-[70] overflow-hidden rounded-lg border shadow-lg motion-reduce:animate-none data-[state=open]:animate-[selectContentShow_180ms_ease-out] data-[state=closed]:animate-[selectContentHide_120ms_ease-in]"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--paper-elevated)",
              maxHeight: "var(--radix-select-content-available-height)",
            }}
          >
            <RadixSelect.ScrollUpButton className="flex items-center justify-center py-1 text-muted">
              <ChevronUp size={14} />
            </RadixSelect.ScrollUpButton>
            <RadixSelect.Viewport className="p-1">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex cursor-pointer select-none items-center rounded px-8 py-2 text-sm text-ink outline-none data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute left-2 inline-flex items-center">
                    <Check size={15} className="text-primary" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
            <RadixSelect.ScrollDownButton className="flex items-center justify-center py-1 text-muted">
              <ChevronDown size={14} />
            </RadixSelect.ScrollDownButton>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </>
  );
}
