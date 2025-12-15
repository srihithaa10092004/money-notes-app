import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  MoreVertical, 
  Pencil, 
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Wallet
} from "lucide-react";
import { format } from "date-fns";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string | null;
  notes: string | null;
  payment_mode: string | null;
  transaction_date: string;
};

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: () => void;
  onDelete: () => void;
}

const paymentModeIcons: Record<string, React.ReactNode> = {
  cash: <Banknote className="h-3 w-3" />,
  card: <CreditCard className="h-3 w-3" />,
  upi: <Smartphone className="h-3 w-3" />,
  bank_transfer: <Building2 className="h-3 w-3" />,
  wallet: <Wallet className="h-3 w-3" />,
  other: <Wallet className="h-3 w-3" />,
};

export function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const isIncome = transaction.type === "income";

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-colors ${
      isIncome ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' : 'bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10'
    }`}>
      {isIncome ? (
        <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      ) : (
        <ArrowDownCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
      )}
      
      <span className="text-xs font-medium truncate max-w-[80px]">
        {transaction.category || (isIncome ? "Income" : "Expense")}
      </span>
      
      <span className={`text-xs font-bold shrink-0 ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
        {isIncome ? '+' : '-'}${Number(transaction.amount).toFixed(0)}
      </span>
      
      <span className="text-[10px] text-muted-foreground shrink-0">
        {format(new Date(transaction.transaction_date), "MMM d")}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 -mr-1">
            <MoreVertical className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}