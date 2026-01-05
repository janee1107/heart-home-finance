export const formatMoney = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "0";
  return parseInt(String(amount)).toLocaleString();
};

export const safeInt = (val: string | number | undefined | null): number => {
  if (!val) return 0;
  const num = parseInt(String(val).replace(/,/g, ''));
  return isNaN(num) ? 0 : num;
};
