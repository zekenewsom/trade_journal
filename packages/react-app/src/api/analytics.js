export const getAnalyticsData = async (filters) => {
    if (!window.electronAPI?.getAnalyticsData) {
        throw new Error("getAnalyticsData API not available.");
    }
    const data = await window.electronAPI.getAnalyticsData(filters);
    if ('error' in data) {
        throw new Error(data.error);
    }
    return data;
};
