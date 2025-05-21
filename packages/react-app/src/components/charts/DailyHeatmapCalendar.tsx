import React from 'react';
import { colors } from '../../styles/design-tokens';

// Mock data for the 30-day heatmap
const generateMockData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const mockData = [];
  
  // Generate 5 weeks of data (35 days)
  for (let week = 0; week < 5; week++) {
    const weekData = days.map((day: string) => {
      // Random value between -3 and +3
      const value = (Math.random() * 6 - 3).toFixed(1);
      return {
        day,
        value: parseFloat(value)
      };
    });
    mockData.push(weekData);
  }
  
  return mockData;
};

interface DailyHeatmapCalendarProps {
  data?: { day: string; value: number }[][];
}

export function DailyHeatmapCalendar({ data }: DailyHeatmapCalendarProps = {}) {
  const heatmapData = data || generateMockData();
  
  // Function to get the color based on value
  // Utility to convert hex color to rgba
  function hexToRgba(hex: string, alpha: number) {
    const h = hex.replace('#', '');
    const bigint = parseInt(h, 16);
    const r = (bigint >> 16) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${b}, ${r}, ${alpha})`;
  }

  const getColor = (value: number) => {
    if (typeof value === 'number' && value > 0) {
      // Positive value - green gradient
      const intensity = Math.min(value / 3, 1);
      return hexToRgba(colors.success, intensity);
    } else if (typeof value === 'number' && value < 0) {
      // Negative value - red gradient
      const intensity = Math.min(Math.abs(value) / 3, 1);
      return hexToRgba(colors.error, intensity);
    }
    // Zero or close to zero - neutral
    return hexToRgba(colors.cardStroke, 0.2);
  };

  
  return (
    <div className="h-full w-full flex flex-col">
      <div className="grid grid-cols-7 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-xs" style={{ color: colors.textSecondary }}>
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-1 grid grid-rows-5 gap-1">
        {heatmapData.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => (
              <div 
                key={`day-${weekIndex}-${dayIndex}`} 
                className="rounded-sm relative hover:ring-1 hover:z-10 transition-all"
                style={{ 
                  backgroundColor: getColor(day.value),
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
                  {day.value > 0 && '+'}
                  {day.value}%
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="mt-3 flex justify-center items-center gap-1">
        <div className="text-xs mr-1" style={{ color: colors.textSecondary }}>Loss</div>
        <div className="w-3 h-3 rounded-sm" style={{ background: hexToRgba(colors.error, 0.3) }}></div>
        <div className="w-3 h-3 rounded-sm" style={{ background: hexToRgba(colors.error, 0.6) }}></div>
        <div className="w-3 h-3 rounded-sm" style={{ background: hexToRgba(colors.error, 0.9) }}></div>
        <div className="mx-1 w-3 h-3 rounded-sm" style={{ background: hexToRgba(colors.cardStroke, 0.7) }}></div>
        <div className="w-3 h-3 rounded-sm" style={{ background: hexToRgba(colors.success, 0.3) }}></div>
        <div className="w-3 h-3 rounded-sm" style={{ background: hexToRgba(colors.success, 0.6) }}></div>
        <div className="w-3 h-3 rounded-sm" style={{ background: hexToRgba(colors.success, 0.9) }}></div>
        <div className="text-xs ml-1" style={{ color: colors.textSecondary }}>Gain</div>
      </div>
    </div>
  );
} 