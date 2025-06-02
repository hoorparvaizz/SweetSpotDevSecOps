import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { BASE_API_URL } from "./constants";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

export function getFullImageUrl(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http")) return imageUrl;
  return imageUrl.startsWith("/") ? BASE_API_URL + imageUrl : BASE_API_URL + "/" + imageUrl;
}
