import { redirect } from "next/navigation";

import { logger } from "@/logger";

export default function Home() {
  logger.info("Redirecting to /chat");
  redirect("/chat");
}
