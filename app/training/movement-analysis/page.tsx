"use client";

import React from "react";
import VideoAnalysis from "./VideoAnalysis";

const MovementAnalysisPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">동작 분석</h1>

        <div className="bg-card rounded-lg p-6 shadow-sm">
          <VideoAnalysis />
        </div>
      </div>
    </div>
  );
};

export default MovementAnalysisPage;
