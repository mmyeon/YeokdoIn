interface StepLabelProps {
  n: string;
  label: string;
}

export function StepLabel({ n, label }: StepLabelProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[14px] font-bold text-yd-primary">{n}</span>
      <span className="text-[12px] font-bold uppercase tracking-[1px] text-yd-text">
        {label}
      </span>
    </div>
  );
}
