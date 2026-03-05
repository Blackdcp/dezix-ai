"use client";

import dynamic from "next/dynamic";

// Lazy-load recharts container components — the library is ~200KB gzipped
export const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
export const AreaChart = dynamic(
  () => import("recharts").then((m) => m.AreaChart),
  { ssr: false }
);
export const BarChart = dynamic(
  () => import("recharts").then((m) => m.BarChart),
  { ssr: false }
);

// Re-export synchronous sub-components (lightweight, no need to lazy-load)
export {
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
