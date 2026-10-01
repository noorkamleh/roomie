import type { LucideIcon } from "lucide-react"
interface SummaryCardProps { title: string 
  value: string 
  description: string 
  icon: LucideIcon }
function SummaryCard({ title, value, description, icon: Icon, }: SummaryCardProps) { return ( <div className="group relative overflow-hidden rounded-[26px] border border-white/90 bg-[#F9F8F5] p-5 shadow-[0_18px_45px_rgba(70,72,85,0.16),0_4px_12px_rgba(70,72,85,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(70,72,85,0.20),0_6px_16px_rgba(70,72,85,0.08)]">
  {/* Decorative glow */}

  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#E5D7FF]/60 blur-2xl transition-transform duration-500 group-hover:scale-125" />

  <div className="pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full bg-[#CDEBFF]/60 blur-2xl" />

  <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F9E8ED]/35 blur-3xl" />


  {/* Content */}

  <div className="relative z-10">

    {/* Top */}

    <div className="flex items-start justify-between">

      <div>

        <p className="text-[13px] font-semibold tracking-wide text-[#73747B]">
          {title}
        </p>

        <h2 className="mt-3 text-[31px] font-bold tracking-[-0.03em] text-[#202126]">
          {value}
        </h2>

      </div>


      {/* Icon */}

      <div className="flex h-12 w-12 items-center justify-center rounded-[17px] border border-white bg-gradient-to-br from-[#D9CCFF] via-[#EADDF7] to-[#C9E8FF] shadow-[0_8px_20px_rgba(125,110,170,0.16),inset_0_1px_2px_rgba(255,255,255,0.95)] transition-all duration-300 group-hover:rotate-3 group-hover:scale-105">

        <Icon
          size={21}
          strokeWidth={2}
          className="text-[#373641]"
        />

      </div>

    </div>


    {/* Description */}

    <div className="mt-4 flex items-center gap-2">

      <span className="h-1.5 w-1.5 rounded-full bg-[#A38CFF]" />

      <p className="text-[12px] font-medium text-[#85858C]">
        {description}
      </p>

    </div>

  </div>

</div>
) }
export default SummaryCard