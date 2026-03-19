import { randomUUID } from "crypto";
import { getChannel } from "./rabbitmq";

export async function publishEvent({
  event,
  payload,
  system_id,
  user_id,
  session_id
}: {
  event: string;
  payload: any;
  system_id: string;
  user_id: string;
  session_id: string;
}) {
    const channel = await getChannel();

    const message = {
        event,
        version: "1.0",
        timestamp: new Date().toISOString(),
        correlation_id: `corr_${randomUUID()}`,
        user_id,
        system_id,
        session_id,
        producer: "frontend.nextjs.api",
        payload,
    };

    channel.publish(
        "qlarify.events",
        event, // routing key
        Buffer.from(JSON.stringify(message)),
        {
            persistent: true, // 🔥 important for durability
            contentType: "application/json",
        }
    );
}