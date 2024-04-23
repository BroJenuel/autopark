import dayjs from "dayjs";
import customParseFormat from "dayjs/esm/plugin/customParseFormat";

dayjs.extend(customParseFormat);

/**
 * Reduces the parking hours data.
 * @param {{ from: string, to: string }} data - The parking hours data.
 * @returns {{ from: Date, to: Date }}
 */
export function reduceParkingHours(data) {
  return {
      from: dayjs(data.from, customTimeFormat).toDate(),
      to: dayjs(data.to, customTimeFormat).toDate(),
  };
}