import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PnLCalendarProps {
  data: Record<string, number>; // Day string -> PnL value
}

export function PnLCalendar({ data }: PnLCalendarProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Calculate value ranges for color mapping
  const values = Object.values(data);
  const maxGain = Math.max(...values.filter(v => v > 0), 0.01);
  const maxLoss = Math.abs(Math.min(...values.filter(v => v < 0), -0.01));
  
  // Get color class based on value
  const getColorClass = (value: number) => {
    if (value === 0) return { background: "hsl(var(--muted))" };

    const intensity = Math.min(Math.abs(value) / (value > 0 ? maxGain : maxLoss), 1);
    const alpha = intensity * 0.8; // Use 80% max opacity for color

    if (value > 0) {
      return { background: "hsl(var(--chart-1))", opacity: alpha };
    } else {
      return { background: "hsl(var(--chart-2))", opacity: alpha };
    }
  };
  
  return (
    <Card className="col-span-3 row-span-2">
      <CardHeader>
        <CardTitle>30 Day P&L Heatmap</CardTitle>
        <CardDescription>Daily profit and loss calendar view</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {days.map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar cells */}
          {Object.entries(data).map(([day, value]) => (
            <div 
              key={day}
              className="h-12 rounded flex flex-col items-center justify-center"
              style={getColorClass(value)}
            >
              <div className="text-xs text-muted-foreground">{day.split('-')[2]}</div>
              <div className={`text-xs ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                {value > 0 ? '+' : value < 0 ? '-' : ''}${Math.abs(value).toFixed(1)}k
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 