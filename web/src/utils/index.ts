import { isArray, isEmpty, isNil, isObject, pickBy } from "lodash";

export * from "./render";

export function addOpacityToColor(color: string, opacity: number) {
  let red, green, blue;

  if (color.startsWith("#")) {
    red = parseInt(color.slice(1, 3), 16);
    green = parseInt(color.slice(3, 5), 16);
    blue = parseInt(color.slice(5, 7), 16);
  } else if (color.startsWith("rgb")) {
    const matches = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/) as RegExpMatchArray;
    red = parseInt(matches[1], 10);
    green = parseInt(matches[2], 10);
    blue = parseInt(matches[3], 10);
  } else {
    return "";
  }

  const alpha = opacity;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function addCommasToNumber(num: number = 0) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function filterEmpty(obj: Record<string, any>) {
  return pickBy(obj, value => {
    if (isNil(value)) return false;
    if (value === '') return false
    if (isArray(value) && isEmpty(value)) return false;
    if (isObject(value) && isEmpty(value)) return false;
    return true;
  })
}
export const formatByte = (limit: number, decimals = 1) => {
  if (typeof limit !== 'number' || isNaN(limit)) return '-'

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  let size = limit
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(decimals)} ${units[unitIndex]}`
}

export function generatePassword(length = 8) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  const password: string[] = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)]
  ];

  const allChars = lowercase + uppercase + numbers;

  for (let i = 3; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }
  return password.join('');
}

export const isMac = () => typeof navigator !== "undefined" &&
  navigator.platform.toLowerCase().includes("mac")