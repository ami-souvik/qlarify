import amqp from "amqplib";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get("session_id");

  if (!session_id) {
    return new Response("Missing session_id", { status: 400 });
  }

  const connection = await amqp.connect(process.env.RABBITMQ_URL!);
  const channel = await connection.createChannel();

  const exchange = "qlarify.events";

  await channel.assertExchange(exchange, "topic", { durable: true });

  // Create exclusive queue per connection
  const q = await channel.assertQueue("", {
    exclusive: true,
  });

  const streamRoutingKey = `chat.stream.${session_id}`;
  const completedRoutingKey = `chat.completed.${session_id}`;

  await channel.bindQueue(q.queue, exchange, streamRoutingKey);
  await channel.bindQueue(q.queue, exchange, completedRoutingKey);

  const stream = new ReadableStream({
    async start(controller) {
      channel.consume(
        q.queue,
        (msg) => {
          if (!msg) return;

          const content = msg.content.toString();

          // Push to browser
          controller.enqueue(`data: ${content}\n\n`);
        },
        { noAck: true }
      );
    },

    cancel() {
      channel.close();
      connection.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}