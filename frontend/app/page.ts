import { redirect } from "next/navigation";

import { logger } from "@/logger";

export default function Home() {
  logger.info("Redirecting from home to /chat");
  redirect("/chat");
}
