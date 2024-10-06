"use client";
import useSWR from "swr";

const fetchChatResponse = (
  url: string,
  model: string,
  temperature: number,
  message: string
) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": url,
    },
    body: JSON.stringify({ model, temperature, message }),
    cache: "no-cache",
  }).then((res) => res.json());

export default function getChatResponse(
  model: string,
  temperature: number,
  message: string
) {
  const { data } = useSWR(
    ["http://localhost:8000/", model, temperature, message],
    ([_, model, temperature, message]) =>
      fetchChatResponse(_, model, temperature, message)
  );

  return data;
}
