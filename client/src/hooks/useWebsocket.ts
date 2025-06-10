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
						const { userId: otherUserId, relativeX, relativeY } = data.payload;
						if (otherUserId === userIdRef.current) return;

						// Always use document.body as the target element
						const targetElement = document.body;
						const rect = targetElement.getBoundingClientRect();

						const absoluteX = Math.max(
							0,
							Math.min(window.innerWidth, rect.left + relativeX * rect.width),
						);
						const absoluteY = Math.max(
							0,
							Math.min(window.innerHeight, rect.top + relativeY * rect.height),
						);

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
								opacity: 0.8;
							`;
							document.body.appendChild(cursor);
						}

						cursor.style.left = `${absoluteX}px`;
						cursor.style.top = `${absoluteY}px`;
					} else {
						queryClient.invalidateQueries({
							queryKey: ["todo", todoIdRef.current],
						});
					}
				};

				ws.onerror = (error) => {
					console.error("WebSocket error:", error);
				};

				ws.onclose = (event) => {
					console.log("WebSocket closed:", event.code, event.reason);
					const cursors = document.querySelectorAll('[id^="cursor-"]');
					for (const cursor of cursors) {
						cursor.remove();
					}
					setTimeout(connect, 1000);
				};
			} catch (error) {
				console.error("Failed to create WebSocket:", error);
				setTimeout(connect, 1000);
			}
		};

		connect();

		return () => {
			const cursors = document.querySelectorAll('[id^="cursor-"]');
			for (const cursor of cursors) {
				cursor.remove();
			}
			if (ws) {
				ws.close();
			}
		};
	}, []);

	const sendCursorPosition = (x: number, y: number) => {
		const ws = wsRef.current;
		if (!ws || !userIdRef.current || ws.readyState !== WebSocket.OPEN) return;

		// Always use document.body as the target element
		const targetElement = document.body;
		const rect = targetElement.getBoundingClientRect();

		// Convert absolute coordinates to relative coordinates (0-1 range)
		const relativeX = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
		const relativeY = Math.max(0, Math.min(1, (y - rect.top) / rect.height));

		ws.send(
			JSON.stringify({
				type: "cursor_update",
				payload: {
					userId: userIdRef.current,
					relativeX,
					relativeY,
				},
			}),
		);
	};

	return { sendCursorPosition };
};
