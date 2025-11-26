"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartProps {
  data: {
    name: string;
    submissions: number;
  }[];
}

export function DashboardChart({ data }: ChartProps) {
  return (
    <Card className="col-span-4 border-primary/20 shadow-sm">
      <CardHeader>
        <CardTitle className="text-primary text-lg">Assignment Submissions Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          {data.length === 0 ? (
             <div className="flex h-full items-center justify-center text-muted-foreground border-2 border-dashed border-muted rounded-lg">
                No data available yet.
             </div>
          ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />
                    <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderRadius: '8px', 
                            border: '1px solid hsl(var(--primary))',
                            color: 'hsl(var(--foreground))'
                        }}
                    />
                    {/* Cột màu Xanh Rêu chủ đạo */}
                    <Bar 
                        dataKey="submissions" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]} 
                        barSize={40}
                    />
                </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}