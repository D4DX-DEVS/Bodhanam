"use client";

import { useEffect, useRef, useState } from "react";
import Select from "@/app/_components/Select";

interface CategorySelectProps {
  categories: string[];
  initial: string;
}

// "all" is a sentinel — Radix Select.Item forbids an empty-string value —
// translated back to "" on the hidden input so the URL omits ?cat= entirely.
export default function CategorySelect({ categories, initial }: CategorySelectProps) {
  const [value, setValue] = useState(initial || "all");
  const submit = useRef(false);
  const markerRef = useRef<HTMLSpanElement>(null);
  const options = [
    { value: "all", label: "All categories" },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  useEffect(() => {
    if (!submit.current) return;
    submit.current = false;
    markerRef.current?.closest("form")?.requestSubmit();
  }, [value]);

  const handleChange = (v: string) => {
    submit.current = true;
    setValue(v);
  };

  return (
    <>
      <span ref={markerRef} className="hidden" />
      <input type="hidden" name="cat" value={value === "all" ? "" : value} />
      <Select
        ariaLabel="Filter by category"
        value={value}
        onValueChange={handleChange}
        options={options}
        className="min-w-[160px]"
      />
    </>
  );
}
