import { useEffect, useRef, useState } from "react";

export default function useSocket(onMessage, roomId) {
  const socketRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    const socket = new WebSocket(`ws://localhost:8000/ws/${roomId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsReady(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    socket.onclose = () => {
      console.log("❌ WebSocket disconnected");
      setIsReady(false);
    };

    return () => {
      socket.close();
    };
  }, [roomId]);

  const sendMessage = (data) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    } else {
      console.warn("⚠️ WebSocket not ready, message not sent:", data);
    }
  };

  return { sendMessage, isReady };
}
