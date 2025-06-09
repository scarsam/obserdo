import { client } from "@/api/client";
import { queryClient } from "@/lib/react-query";
import { useEffect, useRef, useState } from "react";

type CursorPosition = {
	userId: string;
	x: number;
	y: number;
};

export const useWebsocket = (todoId: string, userId?: string) => {
	const wsRef = useRef<WebSocket | null>(null);
	const hasConnected = useRef(false);

	const [cursors, setCursors] = useState<
		Record<string, { x: number; y: number }>
	>({});

	// Ref to accumulate incoming cursor updates before batching
	const pendingCursorUpdates = useRef<Record<string, { x: number; y: number }>>(
		{},
	);

	// Ref for requestAnimationFrame ID
	const rafId = useRef<number | null>(null);

	// Function to batch and apply cursor updates once per animation frame
	const processCursorUpdates = () => {
		setCursors((prev) => {
			let changed = false;
			const newCursors = { ...prev };

			for (const userId in pendingCursorUpdates.current) {
				const { x, y } = pendingCursorUpdates.current[userId];
				if (
					!newCursors[userId] ||
					newCursors[userId].x !== x ||
					newCursors[userId].y !== y
				) {
					newCursors[userId] = { x, y };
					changed = true;
				}
			}

			// Clear accumulated updates after processing
			pendingCursorUpdates.current = {};
			rafId.current = null;

			return changed ? newCursors : prev;
		});
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: processCursorUpdatesbiomelint re-renders
	useEffect(() => {
		if (hasConnected.current) return;
		hasConnected.current = true;

		const setupWebSocket = async () => {
			try {
				const websocket = await client.ws.$ws({
					query: { todoId },
				});

				wsRef.current = websocket;

				websocket.onmessage = (event: MessageEvent) => {
					const data = JSON.parse(event.data);

					if (data.type === "cursor-update") {
						const {
							userId: otherUserId,
							x,
							y,
						} = data.payload as CursorPosition;

						// Accumulate cursor positions
						pendingCursorUpdates.current[otherUserId] = { x, y };

						// Schedule batched state update per animation frame
						if (rafId.current === null) {
							rafId.current = requestAnimationFrame(processCursorUpdates);
						}
					}

					if (data.type === "todo-update") {
						queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
					}
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

			// Cancel any pending animation frame on unmount
			if (rafId.current !== null) {
				cancelAnimationFrame(rafId.current);
			}
		};
	}, [todoId]);

	// Send cursor position throttled (optional, combine with throttle if you want)
	const sendCursorPosition = (x: number, y: number) => {
		if (!wsRef.current || !userId) return;

		const message = {
			type: "cursor-update",
			payload: { userId, x, y },
		};
		wsRef.current.send(JSON.stringify(message));
	};

	return {
		ws: wsRef.current,
		cursors,
		sendCursorPosition,
	};
};
