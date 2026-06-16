export const LEAVE_ALLOCATIONS = {
  ANNUAL: 14,
  CASUAL: 7,
  MEDICAL: 7,
};

export const LEAVE_TYPE_LABELS = {
  ANNUAL: 'Annual Leave',
  CASUAL: 'Casual Leave',
  MEDICAL: 'Medical Leave',
};

export const LEAVE_TYPE_COLORS = {
  ANNUAL: 'primary',
  CASUAL: 'info',
  MEDICAL: 'secondary',
};

export const calculateLeaveDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  if (end < start) return 0;
  return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

export const formatLeaveDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
