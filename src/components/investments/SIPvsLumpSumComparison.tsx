import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  Wallet, 
  Calendar, 
  Percent, 
  IndianRupee,
  ArrowRight,
  Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AnimatedCounter } from "./AnimatedCounter";

export function SIPvsLumpSumComparison() {
  const [monthlyAmount, setMonthlyAmount] = useState(10000);
  const [duration, setDuration] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);

  const calculations = useMemo(() => {
    const monthlyRate = expectedReturn / 12 / 100;
    const annualRate = expectedReturn / 100;
    const months = duration * 12;
    
    // SIP calculations
    const sipTotalInvested = monthlyAmount * months;
    const sipFutureValue = monthlyAmount * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    const sipReturns = sipFutureValue - sipTotalInvested;
    
    // Lump Sum calculations (same total invested as SIP)
    const lumpSumPrincipal = sipTotalInvested;
    const lumpSumFutureValue = lumpSumPrincipal * Math.pow(1 + annualRate, duration);
    const lumpSumReturns = lumpSumFutureValue - lumpSumPrincipal;
    
    const difference = lumpSumFutureValue - sipFutureValue;
    const winner = difference > 0 ? 'lumpsum' : 'sip';

    return {
      sip: {
        invested: sipTotalInvested,
        futureValue: Math.round(sipFutureValue),
        returns: Math.round(sipReturns),
        returnPercent: (sipReturns / sipTotalInvested) * 100,
      },
      lumpSum: {
        invested: lumpSumPrincipal,
        futureValue: Math.round(lumpSumFutureValue),
        returns: Math.round(lumpSumReturns),
        returnPercent: (lumpSumReturns / lumpSumPrincipal) * 100,
      },
      difference: Math.abs(Math.round(difference)),
      winner,
    };
  }, [monthlyAmount, duration, expectedReturn]);

  const maxValue = Math.max(calculations.sip.futureValue, calculations.lumpSum.futureValue);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500/20 to-emerald-500/20">
            <Calculator className="h-4 w-4 text-violet-500" />
          </div>
          SIP vs Lump Sum Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Input Controls */}
        <div className="space-y-4">
          {/* Monthly SIP Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-1.5 text-sm">
                <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                Monthly SIP Amount
              </Label>
              <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
                <span className="text-sm text-muted-foreground">₹</span>
                <Input
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(Math.max(500, Number(e.target.value)))}
                  className="w-20 h-7 text-sm border-0 bg-transparent p-0 text-right focus-visible:ring-0"
                />
              </div>
            </div>
            <Slider
              value={[monthlyAmount]}
              onValueChange={(v) => setMonthlyAmount(v[0])}
              min={500}
              max={100000}
              step={500}
              className="py-1"
            />
          </div>

          {/* Duration & Return Rate in Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1 text-xs">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  Period
                </Label>
                <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-0.5">
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, Math.min(40, Number(e.target.value))))}
                    className="w-10 h-6 text-xs border-0 bg-transparent p-0 text-right focus-visible:ring-0"
                  />
                  <span className="text-xs text-muted-foreground">yrs</span>
                </div>
              </div>
              <Slider
                value={[duration]}
                onValueChange={(v) => setDuration(v[0])}
                min={1}
                max={40}
                step={1}
                className="py-1"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1 text-xs">
                  <Percent className="h-3 w-3 text-muted-foreground" />
                  Return
                </Label>
                <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-0.5">
                  <Input
                    type="number"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Math.max(1, Math.min(30, Number(e.target.value))))}
                    className="w-10 h-6 text-xs border-0 bg-transparent p-0 text-right focus-visible:ring-0"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
              <Slider
                value={[expectedReturn]}
                onValueChange={(v) => setExpectedReturn(v[0])}
                min={1}
                max={30}
                step={0.5}
                className="py-1"
              />
            </div>
          </div>
        </div>

        {/* Total Investment Info */}
        <div className="bg-muted/50 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Total Investment (Same for both)</p>
          <p className="text-lg font-semibold">₹{calculations.sip.invested.toLocaleString("en-IN")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            SIP: ₹{monthlyAmount.toLocaleString("en-IN")}/month × {duration * 12} months
          </p>
        </div>

        {/* Comparison Results */}
        <motion.div
          key={`${monthlyAmount}-${duration}-${expectedReturn}`}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Visual Bar Comparison */}
          <div className="space-y-3">
            {/* SIP Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <PiggyBank className="h-4 w-4 text-violet-500" />
                  SIP
                  {calculations.winner === 'sip' && (
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </span>
                <span className="font-semibold">₹{calculations.sip.futureValue.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-8 rounded-lg overflow-hidden bg-muted flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(calculations.sip.invested / maxValue) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-violet-500 flex items-center justify-center"
                >
                  <span className="text-[10px] text-white font-medium px-1">Invested</span>
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(calculations.sip.returns / maxValue) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-violet-400 flex items-center justify-center"
                >
                  <span className="text-[10px] text-white font-medium px-1">+{calculations.sip.returnPercent.toFixed(0)}%</span>
                </motion.div>
              </div>
            </div>

            {/* Lump Sum Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <Wallet className="h-4 w-4 text-emerald-500" />
                  Lump Sum
                  {calculations.winner === 'lumpsum' && (
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                  )}
                </span>
                <span className="font-semibold">₹{calculations.lumpSum.futureValue.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-8 rounded-lg overflow-hidden bg-muted flex">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(calculations.lumpSum.invested / maxValue) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="bg-emerald-500 flex items-center justify-center"
                >
                  <span className="text-[10px] text-white font-medium px-1">Invested</span>
                </motion.div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(calculations.lumpSum.returns / maxValue) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-emerald-400 flex items-center justify-center"
                >
                  <span className="text-[10px] text-white font-medium px-1">+{calculations.lumpSum.returnPercent.toFixed(0)}%</span>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-violet-500/10 rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground mb-0.5">SIP Returns</p>
              <p className="text-sm font-semibold text-violet-600">
                +₹{calculations.sip.returns.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-2.5 flex flex-col items-center justify-center">
              <ArrowRight className="h-4 w-4 text-muted-foreground mb-0.5" />
              <p className="text-[10px] text-muted-foreground">Difference</p>
              <p className="text-xs font-semibold">
                ₹{calculations.difference.toLocaleString("en-IN")}
              </p>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground mb-0.5">Lump Sum Returns</p>
              <p className="text-sm font-semibold text-emerald-600">
                +₹{calculations.lumpSum.returns.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Winner Insight */}
          <div className={`rounded-lg p-3 text-center ${
            calculations.winner === 'lumpsum' 
              ? 'bg-emerald-500/10 border border-emerald-500/20' 
              : 'bg-violet-500/10 border border-violet-500/20'
          }`}>
            <p className="text-sm">
              <span className="font-semibold">
                {calculations.winner === 'lumpsum' ? 'Lump Sum' : 'SIP'}
              </span>
              {' '}gives you{' '}
              <span className="font-semibold">
                ₹{calculations.difference.toLocaleString("en-IN")}
              </span>
              {' '}more returns
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {calculations.winner === 'lumpsum' 
                ? 'Lump sum benefits from compound growth on full amount from day one'
                : 'SIP averages out market volatility with regular investments'
              }
            </p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
