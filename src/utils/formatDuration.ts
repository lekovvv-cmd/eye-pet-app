export const formatDuration = (seconds: number) => {
  if (seconds >= 60) {
    const mins = Math.round(seconds / 60);
    return `${mins} мин`;
  }
  return `${seconds} сек`;
};


