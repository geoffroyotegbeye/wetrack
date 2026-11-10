export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="wsc-rise flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-[21px] font-bold tracking-tight text-white sm:text-[25px]">{title}</h1>
        {subtitle ? <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}