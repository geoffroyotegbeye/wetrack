import React from "react";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { WebCargoLogo } from "@/components/WebCargoMark";
import { Plane } from "lucide-react";

export default function AuthSplitLayout({
  visualSide = "right",
  imageSrc,
  imageAlt = "",
  visualTag,
  visualTitle,
  visualPoints = [],
  title,
  subtitle,
  footer,
  children,
}) {
  const visualRight = visualSide === "right";

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <div
        className={cn(
          "relative h-40 w-full overflow-hidden sm:h-52 lg:h-auto lg:min-h-screen",
          visualRight ? "lg:order-2" : "lg:order-1"
        )}
      >
        <div className="absolute inset-0">
          <Image src={imageSrc} alt={imageAlt} fittingType="fill" className="h-full w-full" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/5 lg:bg-gradient-to-t lg:from-background lg:via-background/25 lg:to-transparent" />

        <div className="absolute inset-0 hidden flex-col justify-between p-10 lg:flex lg:p-12">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-white/75 backdrop-blur-md">
            <Plane className="h-3.5 w-3.5 text-[#FF7A3D]" />
            {visualTag}
          </span>

          <div className="max-w-md rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
            <p className="font-display text-[18px] font-semibold leading-snug text-white">
              {visualTitle}
            </p>
            <ul className="mt-4 space-y-2.5">
              {visualPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-white/70">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#38A6DE]" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-center px-5 pb-12 pt-7 sm:px-8 lg:min-h-screen lg:px-14 lg:py-16",
          visualRight ? "lg:order-1" : "lg:order-2"
        )}
      >
        <div className="w-full max-w-[420px]">
          <WebCargoLogo className="h-16 w-auto" />

          <h1 className="mt-7 font-display text-[25px] font-bold tracking-tight text-white sm:text-[28px]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>
          )}

          <div className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.95)] sm:p-7">
            {children}
          </div>

          {footer && <p className="mt-5 text-center text-[12.5px] text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  );
}