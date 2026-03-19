import { useEffect, useState, useRef } from "react";

export function useChatStream(sessionId: string, onCompleted?: () => void) {
  const [messages, setMessages] = useState("");
  const onCompletedRef = useRef(onCompleted);

  useEffect(() => {
    onCompletedRef.current = onCompleted;
  }, [onCompleted]);

  useEffect(() => {
    if (!sessionId) return;
    
    const eventSource = new EventSource(
      `/api/stream?session_id=${sessionId}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const eventName = data.event || "";
        const { payload } = data;

        if (eventName.startsWith("chat.stream")) {
          if (payload?.delta) {
            setMessages((prev) => prev + payload.delta);
          }
        } else if (eventName.startsWith("chat.completed")) {
          setMessages("");
          if (onCompletedRef.current) {
            onCompletedRef.current();
          }
        } else {
          // Fallback if event name is not explicit
          if (payload?.delta) {
            setMessages((prev) => prev + payload.delta);
          }
          if (payload?.done && onCompletedRef.current) {
            setMessages("");
            onCompletedRef.current();
          }
        }
      } catch (err) {
        console.error("Error parsing stream message", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource error:", err);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [sessionId]);

  return messages;
}