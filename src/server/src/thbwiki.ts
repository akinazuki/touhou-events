import fs from "node:fs";

const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const endPoint = `https://calendar-serverless.thwiki.cc/api/events/`;

async function fetchSpecificMonth(specifiedDate: Date) {
  console.log(`Fetching ${specifiedDate.getFullYear()}-${paddingMonth(specifiedDate.getMonth() + 1)}`);
  const endOfMonth = formatDateToMonthLastDay(specifiedDate);
  // format: 2024-01-01/2024-01-31
  const dateStr = `${specifiedDate.getFullYear()}-${paddingMonth(specifiedDate.getMonth() + 1)}-01/${endOfMonth}`;
  const url = `${endPoint}${dateStr}`;
  const events = await fetch(url).then(res => res.json()).then(res => res.results);
  console.log(events);
  return events;
}

export async function fetchMonthBetween(startDate: Date, endDate: Date) {
  const startMonth = startDate.getMonth() + 1;
  console.log(`Fetching ${startDate.getFullYear()}-${paddingMonth(startMonth)}`);
  const url = `${endPoint}${formatDateToMonthFirstDay(startDate)}/${formatDateToMonthFirstDay(endDate)}`;
  const events = await fetch(url).then(res => res.json()).then(res => res.results);
  console.log(events);
  return events;
}

function formatDateToMonthFirstDay(date: Date) {
  return `${date.getFullYear()}-${paddingMonth(date.getMonth() + 1)}-01`;
}
function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function formatDateToMonthLastDay(date: Date) {
  let thisMonthDays;
  if (date.getMonth() === 1 && isLeapYear(date.getFullYear()))
    thisMonthDays = 29;
  else
    thisMonthDays = months[date.getMonth()];
  console.log(`Last day of month: ${thisMonthDays}`);

  return `${date.getFullYear()}-${paddingMonth(date.getMonth() + 1)}-${thisMonthDays}`;
}

export function paddingMonth(month: number) {
  return month < 10 ? `0${month}` : month.toString();
}

// const res = await fetchSpecificMonth(new Date());
// console.log(res);

export async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
