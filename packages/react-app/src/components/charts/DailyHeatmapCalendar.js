import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// Mock data for the 30-day heatmap
const generateMockData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mockData = [];
    // Generate 5 weeks of data (35 days)
    for (let week = 0; week < 5; week++) {
        const weekData = days.map(day => {
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
export function DailyHeatmapCalendar({ data } = {}) {
    const heatmapData = data || generateMockData();
    // Function to get the color based on value
    const getColor = (value) => {
        if (value > 0) {
            // Positive value - green gradient
            const intensity = Math.min(value / 3, 1);
            return `rgba(0, 226, 138, ${intensity})`;
        }
        else if (value < 0) {
            // Negative value - red gradient
            const intensity = Math.min(Math.abs(value) / 3, 1);
            return `rgba(255, 77, 103, ${intensity})`;
        }
        // Zero or close to zero - neutral
        return 'rgba(70, 70, 70, 0.2)';
    };
    return (_jsxs("div", { className: "h-full w-full flex flex-col", children: [_jsx("div", { className: "grid grid-cols-7 mb-2", children: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (_jsx("div", { className: "text-center text-gray-400 text-xs", children: day }, day))) }), _jsx("div", { className: "flex-1 grid grid-rows-5 gap-1", children: heatmapData.map((week, weekIndex) => (_jsx("div", { className: "grid grid-cols-7 gap-1", children: week.map((day, dayIndex) => (_jsx("div", { className: "rounded-sm relative hover:ring-1 hover:ring-primary hover:z-10 transition-all", style: {
                            backgroundColor: getColor(day.value),
                        }, children: _jsxs("div", { className: "absolute inset-0 flex items-center justify-center text-[10px] font-medium", children: [day.value > 0 && '+', day.value, "%"] }) }, `day-${weekIndex}-${dayIndex}`))) }, `week-${weekIndex}`))) }), _jsxs("div", { className: "mt-3 flex justify-center items-center gap-1", children: [_jsx("div", { className: "text-xs text-gray-400 mr-1", children: "Loss" }), _jsx("div", { className: "w-3 h-3 rounded-sm bg-negative/30" }), _jsx("div", { className: "w-3 h-3 rounded-sm bg-negative/60" }), _jsx("div", { className: "w-3 h-3 rounded-sm bg-negative/90" }), _jsx("div", { className: "mx-1 w-3 h-3 rounded-sm bg-dark-800" }), _jsx("div", { className: "w-3 h-3 rounded-sm bg-positive/30" }), _jsx("div", { className: "w-3 h-3 rounded-sm bg-positive/60" }), _jsx("div", { className: "w-3 h-3 rounded-sm bg-positive/90" }), _jsx("div", { className: "text-xs text-gray-400 ml-1", children: "Gain" })] })] }));
}
