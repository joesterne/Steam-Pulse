import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel: string;
  accent?: boolean;
}

export function StatCard({ label, value, sublabel, accent = true }: StatCardProps) {
  return (
    <div className="bento-card col-span-1 row-span-1 items-center justify-center text-center">
      <span className="card-label">{label}</span>
      <div className={`text-3xl font-extrabold ${accent ? 'text-accent' : 'text-text-main'}`}>{value}</div>
      <div className="text-[10px] text-text-dim mt-1 uppercase tracking-wider">{sublabel}</div>
    </div>
  );
}
