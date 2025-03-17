"use client";

import { useState } from "react";
import AddRecords from "./AddRecords";

type ViewMode = "record" | "weight-select";

export default function PRPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("record");
  return <>{viewMode === "record" && <AddRecords />}</>;
}
