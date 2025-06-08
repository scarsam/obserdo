import { client } from "@/api/todos";
import { queryClient } from "@/lib/react-query";
import { useEffect, useRef } from "react";

export const useWebsocket = (todoId: string) => {
	const wsRef = useRef<WebSocket | null>(null);
	const hasConnected = useRef(false);

	useEffect(() => {
		if (hasConnected.current) return;
		hasConnected.current = true;

		const setupWebSocket = async () => {
			try {
				const websocket = await client.ws.$ws({
					query: { todoId },
				});

				wsRef.current = websocket;

				websocket.onmessage = (_: MessageEvent) => {
					queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
				};
			} catch (error) {
				console.error("Failed to establish WebSocket connection:", error);
			}
		};

		setupWebSocket();

		return () => {
			if (wsRef.current) {
				wsRef.current.close();
				wsRef.current = null;
				hasConnected.current = false;
			}
		};
	}, [todoId]);

	return wsRef.current;
};
