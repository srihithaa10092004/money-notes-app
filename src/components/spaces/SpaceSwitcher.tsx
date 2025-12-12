import { motion } from "framer-motion";
import { Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

type Space = "groups" | "personal";

interface SpaceSwitcherProps {
  activeSpace: Space;
  onSpaceChange: (space: Space) => void;
}

export function SpaceSwitcher({ activeSpace, onSpaceChange }: SpaceSwitcherProps) {
  return (
    <div className="relative flex bg-muted/50 rounded-2xl p-1.5">
      {/* Sliding background indicator */}
      <motion.div
        className="absolute top-1.5 bottom-1.5 rounded-xl bg-background shadow-md"
        initial={false}
        animate={{
          left: activeSpace === "groups" ? "6px" : "calc(50% + 2px)",
          right: activeSpace === "groups" ? "calc(50% + 2px)" : "6px",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />

      <button
        onClick={() => onSpaceChange("groups")}
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors",
          activeSpace === "groups" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Users className="h-4 w-4" />
        <span className="font-medium text-sm">Group Space</span>
      </button>

      <button
        onClick={() => onSpaceChange("personal")}
        className={cn(
          "relative z-10 flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-colors",
          activeSpace === "personal" ? "text-foreground" : "text-muted-foreground"
        )}
      >
        <Wallet className="h-4 w-4" />
        <span className="font-medium text-sm">Personal Space</span>
      </button>
    </div>
  );
}
