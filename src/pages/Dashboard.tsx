import { WalletCards, ArrowDownLeft, ArrowUpRight, ListChecks, CalendarDays, ArrowRight, CircleDollarSign, ShoppingBasket, } from "lucide-react"
import SummaryCard from "../components/SummaryCard"
function Dashboard() { return ( <div className="space-y-6">
  {/* ================= HEADER ================= */}

  <div className="flex items-end justify-between">

    <div>

      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#85858C]">
        Tuesday · September 29, 2026
      </p>

      <h1 className="mt-2 text-[36px] font-bold tracking-[-0.04em] text-[#202126]">
        Good morning ✦
      </h1>

      <p className="mt-2 text-[14px] font-medium text-[#73747B]">
        Here's what's happening at home today.
      </p>

    </div>


    {/* Date button */}

    <button className="hidden items-center gap-2 rounded-2xl border border-white/90 bg-[#F9F8F5] px-4 py-3 text-sm font-semibold text-[#55565E] shadow-[0_8px_24px_rgba(70,72,85,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(70,72,85,0.12)] md:flex">

      <CalendarDays
        size={17}
        strokeWidth={1.8}
      />

      September 2026

    </button>

  </div>


  {/* ================= SUMMARY CARDS ================= */}

  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

    <SummaryCard
      title="Total Expenses"
      value="$1,240"
      description="Spent this month"
      icon={WalletCards}
    />

    <SummaryCard
      title="You are owed"
      value="$320"
      description="From your roommates"
      icon={ArrowDownLeft}
    />

    <SummaryCard
      title="You owe"
      value="$85"
      description="To your roommates"
      icon={ArrowUpRight}
    />

    <SummaryCard
      title="Pending Tasks"
      value="4"
      description="Tasks need attention"
      icon={ListChecks}
    />

  </div>


  {/* ================= MAIN DASHBOARD GRID ================= */}

  <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">


    {/* ================= SPENDING OVERVIEW ================= */}

    <section className="relative overflow-hidden rounded-[28px] border border-white/90 bg-[#F9F8F5] p-6 shadow-[0_18px_45px_rgba(70,72,85,0.12)]">

      {/* Background glow */}

      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#E5D7FF]/40 blur-3xl" />

      <div className="pointer-events-none absolute bottom-[-60px] left-1/3 h-36 w-36 rounded-full bg-[#CDEBFF]/35 blur-3xl" />


      {/* Header */}

      <div className="relative flex items-start justify-between">

        <div>

          <p className="text-[13px] font-semibold text-[#73747B]">
            Spending Overview
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#202126]">
            Monthly spending
          </h2>

        </div>


        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#D9CCFF] to-[#C9E8FF]">

          <CircleDollarSign
            size={19}
            className="text-[#373641]"
            strokeWidth={1.8}
          />

        </div>

      </div>


      {/* Fake chart for now */}

      <div className="relative mt-8">

        <div className="flex h-44 items-end gap-3">

          {[
            45,
            65,
            52,
            80,
            58,
            92,
            70,
          ].map((height, index) => (
            <div
              key={index}
              className="group flex h-full flex-1 items-end"
            >

              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-[#A38CFF] via-[#C5B8FF] to-[#D9CCFF] transition-all duration-300 group-hover:from-[#8F76F5] group-hover:to-[#C9E8FF]"
                style={{ height: `${height}%` }}
              />

            </div>
          ))}

        </div>


        {/* Days */}

        <div className="mt-3 flex gap-3">

          {[
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
          ].map((day) => (<span
              key={day}
              className="flex-1 text-center text-[10px] font-medium text-[#9A9AA1]"
            >
              {day}
            </span>
          ))}

        </div>

      </div>

    </section>


    {/* ================= UPCOMING BILLS ================= */}

    <section className="relative overflow-hidden rounded-[28px] border border-white/90 bg-[#F9F8F5] p-6 shadow-[0_18px_45px_rgba(70,72,85,0.12)]">

      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#F9E8ED]/55 blur-2xl" />


      {/* Header */}

      <div className="relative flex items-center justify-between">

        <div>

          <p className="text-[13px] font-semibold text-[#73747B]">
            Upcoming Bills
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#202126]">
            Next payments
          </h2>

        </div>


        <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F1E8FF] text-[#806DE0] transition-all duration-300 hover:scale-105">

          <ArrowRight
            size={17}
          />

        </button>

      </div>


      {/* Bills */}

      <div className="relative mt-6 space-y-3">

        {/* Electricity */}

        <div className="flex items-center justify-between rounded-2xl border border-[#EEECEF] bg-white/75 p-3 transition-all duration-300 hover:bg-white hover:shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8DFFF]">

              <WalletCards
                size={18}
                className="text-[#806DE0]"
              />

            </div>

            <div>

              <p className="text-sm font-semibold text-[#303137]">
                Electricity
              </p>

              <p className="mt-0.5 text-[11px] text-[#9999A0]">
                Due Oct 5
              </p>

            </div>

          </div>

          <p className="text-sm font-bold text-[#303137]">
            $240
          </p>

        </div>


        {/* Internet */}

        <div className="flex items-center justify-between rounded-2xl border border-[#EEECEF] bg-white/75 p-3 transition-all duration-300 hover:bg-white hover:shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDF2FF]">

              <CircleDollarSign
                size={18}
                className="text-[#5796C5]"
              />

            </div>

            <div>

              <p className="text-sm font-semibold text-[#303137]">
                Internet
              </p>

              <p className="mt-0.5 text-[11px] text-[#9999A0]">
                Due Oct 8
              </p>

            </div>

          </div>

          <p className="text-sm font-bold text-[#303137]">
            $80
          </p>

        </div>


        {/* Water */}

        <div className="flex items-center justify-between rounded-2xl border border-[#EEECEF] bg-white/75 p-3 transition-all duration-300 hover:bg-white hover:shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FCE1E8]">

              <WalletCards
                size={18}
                className="text-[#C77991]"
              />

            </div>

            <div>

              <p className="text-sm font-semibold text-[#303137]">
                Water
              </p>

              <p className="mt-0.5 text-[11px] text-[#9999A0]">
                Due Oct 12
              </p>

            </div>

          </div>

          <p className="text-sm font-bold text-[#303137]">
            $45
          </p>

        </div>

      </div>

    </section>

  </div>

  

  {/* ================= BOTTOM SECTION ================= */}

  <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">

    {/* ================= RECENT EXPENSES ================= */}

    <section className="relative overflow-hidden rounded-[28px] border border-white/90 bg-[#F9F8F5] p-6 shadow-[0_18px_45px_rgba(70,72,85,0.12)]">

      <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-[#E5D7FF]/40 blur-3xl" />

      <div className="relative flex items-center justify-between">

        <div>
          <p className="text-[13px] font-semibold text-[#73747B]">
            Recent Expenses
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#202126]">
            Latest spending
          </h2>
        </div>

        <button className="flex items-center gap-1 text-[12px] font-semibold text-[#806DE0] transition-all duration-300 hover:translate-x-1">
          View all
          <ArrowRight size={14} />
        </button>

      </div>

      <div className="relative mt-6 space-y-3">

        {/* Groceries */}

        <div className="flex items-center justify-between rounded-2xl border border-[#EEECEF] bg-white/75 p-3.5 transition-all duration-300 hover:bg-white hover:shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8DFFF]">
              <ShoppingBasket
                size={18}
                className="text-[#806DE0]"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#303137]">
                Groceries
              </p>

              <p className="mt-0.5 text-[11px] text-[#9999A0]">
                Noor · Today
              </p>
            </div>

          </div>

          <div className="text-right">
            <p className="text-sm font-bold text-[#303137]">
              $120
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-[#9A9AA1]">
              3 people
            </p>
          </div>

        </div>

        {/* Internet */}

        <div className="flex items-center justify-between rounded-2xl border border-[#EEECEF] bg-white/75 p-3.5 transition-all duration-300 hover:bg-white hover:shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DDF2FF]">
              <CircleDollarSign
                size={18}
                className="text-[#5796C5]"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#303137]">
                Internet
              </p>

              <p className="mt-0.5 text-[11px] text-[#9999A0]">
                Sara · Yesterday
              </p>
            </div>

          </div>

          <div className="text-right">
            <p className="text-sm font-bold text-[#303137]">
              $80
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-[#9A9AA1]">
              2 people
            </p>
          </div>

        </div>

        {/* Household supplies */}

        <div className="flex items-center justify-between rounded-2xl border border-[#EEECEF] bg-white/75 p-3.5 transition-all duration-300 hover:bg-white hover:shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FCE1E8]">
              <WalletCards
                size={18}
                className="text-[#C77991]"
                strokeWidth={1.8}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-[#303137]">
                Household supplies
              </p>

              <p className="mt-0.5 text-[11px] text-[#9999A0]">
                Reem · Sep 27
              </p>
            </div>

          </div>

          <div className="text-right">
            <p className="text-sm font-bold text-[#303137]">
              $65
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-[#9A9AA1]">
              3 people
            </p>
          </div>

        </div>

      </div>

    </section>


    {/* ================= TODAY'S CHORES ================= */}

    <section className="relative overflow-hidden rounded-[28px] border border-white/90 bg-[#F9F8F5] p-6 shadow-[0_18px_45px_rgba(70,72,85,0.12)]">

      <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#CDEBFF]/40 blur-3xl" />

      <div className="relative flex items-center justify-between">

        <div>
          <p className="text-[13px] font-semibold text-[#73747B]">
            Today's Chores
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#202126]">
            Tasks for today
          </h2>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#DDF2FF]">
          <ListChecks
            size={17}
            className="text-[#5796C5]"
          />
        </div>

      </div>

      <div className="relative mt-6 space-y-3">

        {/* Task 1 */}

        <div className="group flex items-center gap-3 rounded-2xl border border-[#EEECEF] bg-white/75 p-3.5 transition-all duration-300 hover:bg-white hover:shadow-sm">

          <button className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#C8C8CF] transition-all duration-300 hover:border-[#A38CFF] hover:bg-[#F1ECFF]">
          </button>

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-semibold text-[#303137]">
              Clean kitchen
            </p>

            <p className="mt-0.5 text-[11px] text-[#9999A0]">
              Assigned to Sara
            </p>

          </div>

          <span className="rounded-full bg-[#FCE1E8] px-2.5 py-1 text-[10px] font-semibold text-[#C77991]">
            Due today
          </span>

        </div>


        {/* Task 2 */}

        <div className="group flex items-center gap-3 rounded-2xl border border-[#EEECEF] bg-white/75 p-3.5 transition-all duration-300 hover:bg-white hover:shadow-sm">

          <button className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#A38CFF] bg-[#F1ECFF] transition-all duration-300 hover:scale-105">
          </button>

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-semibold text-[#303137]">
              Take out trash
            </p>

            <p className="mt-0.5 text-[11px] text-[#9999A0]">
              Assigned to Noor
            </p>

          </div>

          <span className="rounded-full bg-[#E8DFFF] px-2.5 py-1 text-[10px] font-semibold text-[#806DE0]">
            In progress
          </span>

        </div>


        {/* Task 3 */}

        <div className="group flex items-center gap-3 rounded-2xl border border-[#EEECEF] bg-white/75 p-3.5 transition-all duration-300 hover:bg-white hover:shadow-sm">

          <button className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#C8C8CF] transition-all duration-300 hover:border-[#A38CFF] hover:bg-[#F1ECFF]">
          </button>

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-semibold text-[#303137]">
              Clean living room
            </p>

            <p className="mt-0.5 text-[11px] text-[#9999A0]">
              Assigned to Reem
            </p>

          </div>

          <span className="rounded-full bg-[#DDF2FF] px-2.5 py-1 text-[10px] font-semibold text-[#5796C5]">
            Tomorrow
          </span>

        </div>

      </div>

    </section>

  </div>

</div>
) }
export default Dashboard