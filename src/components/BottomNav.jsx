import {
  CalendarDays,
  Home,
  Lightbulb,
  MessagesSquare,
  Mic,
  Users,
} from "lucide-react";

/**
 * Thumb-zone navigation. Six tabs is the most 360px will carry, so the
 * labels are single words — "კალენდარი" rather than "ღონისძიებები", which
 * cannot fit a 60px column at any readable size.
 */
export const TABS = [
  { id: "home", label: "მთავარი", icon: Home },
  { id: "debates", label: "დებატები", icon: MessagesSquare },
  { id: "topics", label: "თემები", icon: Lightbulb },
  { id: "teams", label: "გუნდები", icon: Users },
  { id: "speakers", label: "სპიკერები", icon: Mic },
  { id: "events", label: "კალენდარი", icon: CalendarDays },
];

export default function BottomNav({ view, onChange }) {
  return (
    <nav aria-label="განყოფილებები"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-rule bg-hall-850/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const active = view === tab.id;
          const Icon = tab.icon;
          return (
            <button key={tab.id} type="button" onClick={() => onChange(tab.id)}
              aria-current={active ? "page" : undefined}
              className={`relative flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1 px-0.5 transition-colors ${
                active ? "text-bone" : "text-bone-3 hover:text-bone-2"}`}>
              <Icon size={20} strokeWidth={active ? 2 : 1.6} />
              <span className="text-[10px] leading-none">{tab.label}</span>
              <span aria-hidden="true"
                className={`absolute inset-x-3 top-0 h-[2px] rounded-full bg-gavel transition-[opacity,transform] duration-300 ${
                  active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"}`} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
