import {
  IconBellRinging,
  IconBell,
  IconFileCheck,
  IconMessageCircle,
} from "@tabler/icons-react";

const notifications = [
  {
    title: "Inbound call transcript ready",
    body: "Agent Nova captured and transcribed the latest inbound session.",
    time: "5 minutes ago",
    icon: IconFileCheck,
  },
  {
    title: "Credit milestone reached",
    body: "You’ve used 75% of this month’s credits. Review billing to top up early.",
    time: "1 hour ago",
    icon: IconBell,
  },
  {
    title: "New message routed",
    body: "An SMS bridge delivered a response to your outbound campaign.",
    time: "Yesterday",
    icon: IconMessageCircle,
  },
];

export default function NotificationsPage() {
  return (
    <div className="relative flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Notifications
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Activity center
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            This is where you will see everything that matters — alerts, automations, or updates about your call agents and credits.
          </p>
        </div>

        <section className="relative rounded-[30px] border border-border/80 bg-white/70 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Incoming updates
            </p>
            <div className="space-y-4">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <article
                    key={notification.title}
                    className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background/80 p-4 text-sm text-muted-foreground transition hover:border-foreground hover:text-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted/30 p-2 text-muted-foreground">
                        <Icon size={18} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold text-foreground">{notification.title}</p>
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed">{notification.body}</p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="absolute right-6 top-6 hidden w-72 rounded-2xl border border-black/10 bg-white/95 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.12)] md:flex md:flex-col md:gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white">
                <IconBellRinging size={20} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Live alert
                </p>
                <p className="text-sm font-semibold text-foreground">
                  New notification
                </p>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              We’ll let you know when sensitive automation events or credits hits arrive so you can react immediately.
            </p>
            <button
              type="button"
              className="rounded-full border border-black/40 px-4 py-2 text-[11px] uppercase tracking-[0.4em] text-foreground transition hover:bg-black/5"
            >
              View latest
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
