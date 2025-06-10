import { wsUrl } from "@/lib/env";
import { queryClient } from "@/lib/react-query";
import { stringToColor } from "@/lib/utils";
import { useRef, useEffect } from "react";

export const useWebsocket = (todoId: string, userId?: string) => {
	const wsRef = useRef<WebSocket | null>(null);
	const todoIdRef = useRef(todoId);
	const userIdRef = useRef(userId);

	todoIdRef.current = todoId;
	userIdRef.current = userId;

	useEffect(() => {
		let ws: WebSocket | null = null;

		const connect = () => {
			try {
				ws = new WebSocket(`${wsUrl}/api/ws?todoId=${todoIdRef.current}`);
				wsRef.current = ws;

				ws.onopen = () => {
					console.log("✅ WebSocket connected for todo:", todoIdRef.current);
				};

				ws.onmessage = (event) => {
					const data = JSON.parse(event.data);

					if (data.type === "cursor_update") {
						const { userId: otherUserId, x, y } = data.payload;
						if (otherUserId === userIdRef.current) return;

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
								box-shadow: 0 0 6px ${color}99;
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
						queryClient.invalidateQueries({
							queryKey: ["todo", todoIdRef.current],
						});
						queryClient.invalidateQueries({ queryKey: ["todos"] });
					}
				};
			} catch (error) {
				console.error("Failed to create WebSocket:", error);
				setTimeout(connect, 1000);
			}
		};

		connect();

		return () => {
			if (ws) {
				ws.close();
			}
		};
	}, []);

	const sendCursorPosition = (x: number, y: number) => {
		const ws = wsRef.current;
		if (!ws || !userIdRef.current || ws.readyState !== WebSocket.OPEN) return;

		ws.send(
			JSON.stringify({
				type: "cursor_update",
				payload: { userId: userIdRef.current, x, y },
			}),
		);
	};

	return { sendCursorPosition };
};
