import streamersData from "../teams";

export function getStreamers() {
  return Array.from(new Set(streamersData.flat()));
}
