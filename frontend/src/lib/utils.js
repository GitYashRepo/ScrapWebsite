import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export const fetchWithRetry = async (url, options = {}, retries = 2, delay = 1000) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res;
  } catch (err) {
    if (retries > 0) {
      console.warn(`Retrying fetch (${retries} retries left)...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay);
    } else {
      console.error("Fetch permanently failed:", err.message);
      throw err;
    }
  }
};
