import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { inputClass } from "@/lib/uiClasses";

// Minuscules sans accents : « Aïcha » se trouve en tapant « aicha ».
const normaliser = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Liste déroulante avec recherche.
//   options : [{ value, label, hint?, keywords? }] — la recherche porte sur label, hint et keywords.
export default function SearchSelect({
  options,
  value,
  onChange,
  placeholder = "Sélectionner…",
  searchPlaceholder = "Rechercher…",
  emptyText = "Aucun résultat.",
  ariaLabel,
  invalid = false,
}) {
  const [open, setOpen] = useState(false);
  const selection = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={ariaLabel}
          className={cn(inputClass, "flex items-center justify-between gap-2 text-left", invalid && "border-[#F87171]/60")}
        >
          <span className={cn("min-w-0 truncate", !selection && "text-white/30")}>
            {selection ? (
              <>
                {selection.label}
                {selection.hint ? <span className="text-white/40"> — {selection.hint}</span> : null}
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-white/40" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] border-white/10 bg-[#1E1F24] p-0 text-white"
      >
        <Command
          filter={(itemValue, search) => (normaliser(itemValue).includes(normaliser(search)) ? 1 : 0)}
          className="bg-transparent text-white"
        >
          <CommandInput placeholder={searchPlaceholder} className="text-base sm:text-[13px]" />
          <CommandList className="max-h-64">
            <CommandEmpty className="py-5 text-center text-[12.5px] text-white/40">{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  // cmdk filtre sur cette chaîne ; l'identifiant est ajouté pour garantir l'unicité.
                  value={`${o.label} ${o.hint || ""} ${o.keywords || ""} ${o.value}`}
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer gap-2 text-[13px] text-white/85 data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-white"
                >
                  <Check className={cn("h-4 w-4 shrink-0 text-[#FF7A3D]", o.value === value ? "opacity-100" : "opacity-0")} />
                  <span className="min-w-0 flex-1 truncate">
                    {o.label}
                    {o.hint ? <span className="text-white/40"> — {o.hint}</span> : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
