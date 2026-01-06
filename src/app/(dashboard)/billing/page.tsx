import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const usageStats = [
  { label: "Usage (hrs)", value: "0.0", detail: "last 30 days" },
  { label: "Calls handled", value: "0", detail: "inbound + outbound" },
  { label: "Average call length", value: "0m 0s", detail: "across all agents" },
  { label: "Credits used", value: "0", detail: "from current bundle" },
];

const usagePattern = [
  { label: "Week 1", value: 0 },
  { label: "Week 2", value: 0 },
  { label: "Week 3", value: 0 },
  { label: "Week 4", value: 0 },
];

export default function BillingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="space-y-3">
          <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">
            Billing
          </p>
          <h1 className="text-3xl font-semibold leading-snug tracking-tight text-foreground">
            Usage & credits
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Track how much AI power you are spending, see how many credits remain, and update payment information without leaving the dashboard.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {usageStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/70 bg-background/70 p-4 shadow-sm shadow-muted-foreground/10"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-[1.5fr,1fr]">
          <section className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm shadow-muted-foreground/10">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium uppercase tracking-[0.4em] text-muted-foreground">
                Current usage pattern
              </p>
              <span className="text-xs text-muted-foreground">hours</span>
            </div>
            <div className="mt-5 grid grid-cols-4 items-end gap-4">
              {usagePattern.map((step) => (
                <div key={step.label} className="space-y-2 text-center text-xs text-muted-foreground">
                  <div className="mx-auto h-24 w-6 rounded-full bg-muted/40">
                    <div
                      className="mx-auto h-full w-full rounded-full bg-foreground transition-all"
                      style={{ height: `${step.value}%` }}
                    />
                  </div>
                  <p className="text-[11px] uppercase tracking-widest">{step.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Usage rises toward the end of the month — you can switch to an auto replenish plan if you want smoother coverage.
            </p>
          </section>

          <section className="rounded-2xl border border-border/70 bg-background/80 p-5 shadow-sm shadow-muted-foreground/10">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Credits remaining
            </p>
            <p className="mt-3 text-5xl font-semibold text-foreground">2,000</p>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              of 2,000 allocated for this cycle
            </p>
            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p>Next reset: Aug 1</p>
              <p>Auto top-up threshold: 300 credits</p>
            </div>
          </section>
        </div>

        <section className="rounded-2xl border border-border/70 bg-background/80 p-6 shadow-sm shadow-muted-foreground/10">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Payment method
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              Change how you pay
            </h2>
          </div>

          <form className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Card number
              <Input type="text" name="card" placeholder="•••• •••• •••• 4242" />
            </label>
            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Expiry & CVC
              <div className="grid grid-cols-2 gap-3">
                <Input type="text" name="expiry" placeholder="MM / YY" />
                <Input type="text" name="cvc" placeholder="CVC" />
              </div>
            </label>
            <label className="flex flex-col gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground md:col-span-2">
              Cardholder name
              <Input type="text" name="cardholder" placeholder="Jamie O. / SpitchLabs" />
            </label>
          </form>

          <div className="mt-5 flex justify-end">
            <Button
              variant="secondary"
              className="border-black/60 bg-black text-white hover:bg-black/80 focus-visible:ring-black/50"
              type="button"
            >
              Update payment method
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
