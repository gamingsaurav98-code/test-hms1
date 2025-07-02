"use client"

import React from "react"

// Define type for icon components
export type IconProps = {
  className?: string;
  size?: number | string;
  color?: string;
  [key: string]: any;
};

// Try-catch for importing lucide-react
let LucideIcons: any = {};
try {
  // Dynamic import to check if module is available
  LucideIcons = require("lucide-react");
} catch (error) {
  console.warn("lucide-react not found, using fallback icons");
  // We'll create fallback icons below
}

// Create individual icon components with fallbacks
export const Upload: React.FC<IconProps> = (props) => {
  if (LucideIcons.Upload) return <LucideIcons.Upload {...props} />;
  return <span className={`inline-block ${props.className || ''}`}>⬆</span>;
};

export const X: React.FC<IconProps> = (props) => {
  if (LucideIcons.X) return <LucideIcons.X {...props} />;
  return <span className={`inline-block ${props.className || ''}`}>✕</span>;
};

export const AlertCircle: React.FC<IconProps> = (props) => {
  if (LucideIcons.AlertCircle) return <LucideIcons.AlertCircle {...props} />;
  return <span className={`inline-block ${props.className || ''}`}>⚠</span>;
};

export const Search: React.FC<IconProps> = (props) => {
  if (LucideIcons.Search) return <LucideIcons.Search {...props} />;
  return <span className={`inline-block ${props.className || ''}`}>🔍</span>;
};

export const Check: React.FC<IconProps> = (props) => {
  if (LucideIcons.Check) return <LucideIcons.Check {...props} />;
  return <span className={`inline-block ${props.className || ''}`}>✓</span>;
};

export const Eye: React.FC<IconProps> = (props) => {
  if (LucideIcons.Eye) return <LucideIcons.Eye {...props} />;
  return <span className={`inline-block ${props.className || ''}`}>👁</span>;
};
