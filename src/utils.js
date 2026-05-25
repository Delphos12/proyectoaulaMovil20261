import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.locale("es");

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const getTimeago = (date) => {
  if (!date) return "";
  return dayjs(date).fromNow();
};

export const formatDate = (date) => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY");
};

export const formatTime = (date) => {
  if (!date) return "";
  return dayjs(date).format("HH:mm");
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return dayjs(date).format("DD/MM/YYYY HH:mm");
};

export const getDurationHours = (start, end) => {
  if (!start || !end) return 0;
  return dayjs(end).diff(dayjs(start), "hour", true);
};

export const isToday = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), "day");
};

export const isThisWeek = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), "week");
};

export const isThisMonth = (date) => {
  if (!date) return false;
  return dayjs(date).isSame(dayjs(), "month");
};

export const isUpcoming = (date) => {
  if (!date) return false;
  return dayjs(date).isAfter(dayjs());
};
