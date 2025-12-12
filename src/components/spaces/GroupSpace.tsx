import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, MapPin, Home, Plane, Utensils, ShoppingBag, Briefcase } from "lucide-react";
import { CreateGroupDialog } from "@/components/CreateGroupDialog";

type Group = {
  id: string;
  name: string;
  description: string | null;
  currency: string;
  created_at: string;
};

// Group icons based on common group types
const getGroupIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("trip") || lowerName.includes("travel") || lowerName.includes("vacation")) {
    return Plane;
  }
  if (lowerName.includes("home") || lowerName.includes("flat") || lowerName.includes("apartment") || lowerName.includes("roommate")) {
    return Home;
  }
  if (lowerName.includes("food") || lowerName.includes("dinner") || lowerName.includes("lunch")) {
    return Utensils;
  }
  if (lowerName.includes("shopping") || lowerName.includes("buy")) {
    return ShoppingBag;
  }
  if (lowerName.includes("work") || lowerName.includes("office") || lowerName.includes("team")) {
    return Briefcase;
  }
  return Users;
};

// Gradient colors for cards
const gradients = [
  "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
];

const iconColors = [
  "text-violet-500",
  "text-blue-500",
  "text-emerald-500",
  "text-orange-500",
  "text-pink-500",
  "text-indigo-500",
];

interface GroupSpaceProps {
  groups: Group[];
  onGroupCreated: () => void;
}

export function GroupSpace({ groups, onGroupCreated }: GroupSpaceProps) {
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Groups</h2>
          <p className="text-sm text-muted-foreground">
            {groups.length} {groups.length === 1 ? "group" : "groups"}
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Group
        </Button>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">
            Create your first group to start splitting expenses with friends
          </p>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {groups.map((group, index) => {
            const Icon = getGroupIcon(group.name);
            const gradient = gradients[index % gradients.length];
            const iconColor = iconColors[index % iconColors.length];

            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/group/${group.id}`)}
                className={`
                  relative overflow-hidden rounded-2xl p-4 cursor-pointer
                  bg-gradient-to-br ${gradient} border
                  transition-shadow hover:shadow-lg
                `}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl bg-background/80 backdrop-blur flex items-center justify-center mb-3 ${iconColor}`}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="font-semibold text-sm truncate mb-1">{group.name}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {group.description || group.currency}
                </p>

                {/* Decorative elements */}
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-background/5" />
                <div className="absolute -right-2 -bottom-2 w-12 h-12 rounded-full bg-background/10" />
              </motion.div>
            );
          })}

          {/* Add New Group Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: groups.length * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCreateDialogOpen(true)}
            className="rounded-2xl p-4 cursor-pointer border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[140px]"
          >
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Add Group</span>
          </motion.div>
        </div>
      )}

      <CreateGroupDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onGroupCreated={() => {
          onGroupCreated();
          setCreateDialogOpen(false);
        }}
      />
    </div>
  );
}
