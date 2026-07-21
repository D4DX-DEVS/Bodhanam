"use client";

import { useRef, useState } from "react";
import Select from "@/app/_components/Select";

interface YearSelectProps {
  years: string[];
  initial: string;
}

/**
 * Stateful wrapper so the Radix Select works inside the archives GET form.
 * Value is mirrored to a hidden `year` input (inside Select) and the form
 * auto-submits on change — no separate Filter click needed for year.
 */
export default function YearSelect({ years, initial }: YearSelectProps) {
  const [value, setValue] = useState(initial || "all");
  const markerRef = useRef<HTMLSpanElement>(null);
  const options = [
    { value: "all", label: "All years" },
    ...years.map((y) => ({ value: y, label: y })),
  ];

  const handleChange = (v: string) => {
    setValue(v);
    // requestSubmit() fires before React re-renders the hidden input, so
    // write the new value into the form imperatively to avoid a stale submit.
    const form = markerRef.current?.closest("form");
    if (!form) return;
    const input = form.elements.namedItem("year");
    if (input instanceof HTMLInputElement) input.value = v;
    form.requestSubmit();
  };

  return (
    <>
      <span ref={markerRef} className="hidden" />
      <Select
        name="year"
        ariaLabel="Filter by year"
        value={value}
        onValueChange={handleChange}
        options={options}
        className="min-w-[140px]"
      />
    </>
  );
}
