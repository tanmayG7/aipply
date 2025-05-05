export const getRelativeTime = (dateString: string): string => {
  const postedDate = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - postedDate.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const interval in intervals) {
    const intervalInSeconds = intervals[interval];
    const count = Math.floor(diffInSeconds / intervalInSeconds);
    if (count >= 1) {
      return `Posted ${count} ${interval}${count > 1 ? 's' : ''} ago`;
    }
  }

  return 'Posted just now';
};
