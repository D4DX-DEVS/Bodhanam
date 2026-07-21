"use client";

import { useEffect, useRef, useState } from "react";
import Select from "@/app/_components/Select";

interface IssueFilterSelectProps {
  issues: { id: number; volume: number | null; issueNo: number | null }[];
  initial: string;
}

export default function IssueFilterSelect({ issues, initial }: IssueFilterSelectProps) {
  const [value, setValue] = useState(initial || "all");
  const submit = useRef(false);
  const markerRef = useRef<HTMLSpanElement>(null);
  const options = [
    { value: "all", label: "All Issues" },
    ...issues.map((i) => ({ value: String(i.id), label: `Vol ${i.volume}/${i.issueNo}` })),
  ];

  // Submit AFTER the hidden input re-renders with the new value — submitting
  // inside onValueChange fires with the stale value.
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
      <Select
        name="issue"
        ariaLabel="Filter by issue"
        value={value}
        onValueChange={handleChange}
        options={options}
        className="min-w-[180px]"
      />
    </>
  );
}
