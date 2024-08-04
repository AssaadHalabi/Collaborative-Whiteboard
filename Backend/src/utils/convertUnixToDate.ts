export const convertUnixToDate = (timestamp: any) => {
    return new Date(timestamp * 1000).toLocaleString();
};