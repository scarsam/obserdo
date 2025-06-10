import { wsClient } from "@/api/client";
import { queryClient } from "@/lib/react-query";
import { stringToColor } from "@/lib/utils";
import { useEffect, useRef } from "react";

export const useWebsocket = (todoId: string, userId?: string) => {
	const wsRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		let ws: WebSocket | null = null;

		const connect = async () => {
			try {
				ws = await wsClient.api.ws.$ws({ query: { todoId } });
				wsRef.current = ws;

				ws.onmessage = (event) => {
					const data = JSON.parse(event.data);
					if (data.type === "cursor_update") {
						const { userId: otherUserId, x, y } = data.payload;

						if (otherUserId === userId) return;

						let cursor = document.getElementById(`cursor-${otherUserId}`);
						if (!cursor) {
							cursor = document.createElement("div");
							cursor.id = `cursor-${otherUserId}`;
							const color = stringToColor(otherUserId);
							cursor.style.cssText = `
								position: fixed;
								width: 16px;
								height: 16px;
								background: ${color};
								border: 2px solid white;
								border-radius: 50%;
								box-shadow: 0 0 6px ${color}99; /* semi-transparent shadow */
								pointer-events: none;
								z-index: 9999;
								transform: translate(-50%, -50%);
								transition: left 0.1s ease-out, top 0.1s ease-out;
							`;
							document.body.appendChild(cursor);
						}
						cursor.style.left = `${x}px`;
						cursor.style.top = `${y}px`;
					} else {
						queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
					}
				};

				ws.onclose = () => {
					// Remove all cursors
					const cursors = document.querySelectorAll('[id^="cursor-"]');
					for (const cursor of cursors) {
						cursor.remove();
					}
					setTimeout(connect, 1000);
				};
			} catch (error) {
				console.error("WebSocket error:", error);
				setTimeout(connect, 1000);
			}
		};

		connect();

		return () => {
			const cursors = document.querySelectorAll('[id^="cursor-"]');
			for (const cursor of cursors) {
				cursor.remove();
			}
			ws?.close();
		};
	}, [todoId, userId]);

	const sendCursorPosition = (x: number, y: number) => {
		const ws = wsRef.current;
		if (!ws || !userId || ws.readyState !== WebSocket.OPEN) return;

		ws.send(
			JSON.stringify({
				type: "cursor_update",
				payload: { userId, x, y },
			}),
		);
	};

	return { sendCursorPosition };
};
