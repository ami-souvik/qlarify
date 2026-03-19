import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export async function getChannel() {
    if (channel) return channel;

    const connection = await amqp.connect(process.env.RABBITMQ_URL!);
    channel = await connection.createChannel();

    await channel.assertExchange("qlarify.events", "topic", {
        durable: true,
    });

    return channel;
}