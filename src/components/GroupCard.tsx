import { Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Group = {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  created_at: string;
};

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="flex items-center justify-between px-3 py-3 rounded-lg bg-card border active:scale-[0.99] transition-all cursor-pointer"
      onClick={() => navigate(`/group/${group.id}`)}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-sm truncate">{group.name}</h3>
          <p className="text-xs text-muted-foreground">{group.currency}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
    </div>
  );
}