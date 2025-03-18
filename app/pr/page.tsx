"use client";

import { useState } from "react";
import AddRecords from "./AddRecords";
import WeightSelect from "./WeightSelect";

type ViewMode = "record" | "weight-select";

export default function PRPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("record");
  return (
    <>
      {viewMode === "record" && (
        <AddRecords changeViewMode={() => setViewMode("weight-select")} />
      )}

      {viewMode === "weight-select" && <WeightSelect />}
    </>
  );
}
