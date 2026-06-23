"use client";

import { useState } from "react";

interface ExpandableTitleProps {
  title: string;
}

export default function ExpandableTitle({ title }: ExpandableTitleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Limite de caracteres para mostrar antes de truncar (puedes ajustar este número)
  const MAX_CHARS = 100;
  const isTruncated = !isExpanded && title.length > MAX_CHARS;
  const displayText = isTruncated ? title.slice(0, MAX_CHARS) + "..." : title;

  return (
    <h1 
      className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-4 wrap-break-word cursor-pointer transition-all duration-300"
      title={isExpanded ? "Click para contraer" : "Click para ver completo"}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {displayText}
    </h1>
  );
}
