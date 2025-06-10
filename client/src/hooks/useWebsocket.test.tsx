import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWebsocket } from "./useWebsocket";

// Mock WebSocket
const mockWebSocket = vi.fn();
vi.stubGlobal("WebSocket", mockWebSocket);

describe("useWebsocket", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset DOM
		document.body.innerHTML = "";
	});

	it("should create a WebSocket connection", () => {
		const { result } = renderHook(() => useWebsocket("test-todo-id"));

		expect(mockWebSocket).toHaveBeenCalledWith(
			expect.stringContaining("ws://localhost:3000/ws/test-todo-id"),
			expect.any(Array),
		);
	});

	it("should send cursor position when connected", () => {
		const mockSend = vi.fn();
		mockWebSocket.mockImplementation(() => ({
			send: mockSend,
			close: vi.fn(),
			addEventListener: (
				event: string,
				cb: () => void,
				options?: boolean | AddEventListenerOptions,
			) => {
				if (event === "open") {
					// Simulate connection open
					cb();
				}
			},
		}));

		const { result } = renderHook(() => useWebsocket("test-todo-id"));

		act(() => {
			result.current.sendCursorPosition(100, 200, {});
		});

		expect(mockSend).toHaveBeenCalledWith(
			expect.stringContaining('"type":"cursor"'),
		);
		expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('"x":100'));
		expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('"y":200'));
	});

	it("should create cursor elements when receiving cursor updates", () => {
		const mockOnMessage = vi.fn();
		mockWebSocket.mockImplementation(() => ({
			send: vi.fn(),
			close: vi.fn(),
			addEventListener: (
				event: string,
				cb: (e: MessageEvent) => void,
				options?: boolean | AddEventListenerOptions,
			) => {
				if (event === "message") {
					mockOnMessage(cb);
				}
			},
		}));

		renderHook(() => useWebsocket("test-todo-id"));

		// Simulate receiving a cursor message
		act(() => {
			mockOnMessage.mock.calls[0][0]({
				data: JSON.stringify({
					type: "cursor",
					userId: "test-user",
					x: 150,
					y: 250,
				}),
			} as MessageEvent);
		});

		const cursorElement = document.querySelector(
			"[data-cursor-id='test-user']",
		) as HTMLElement;
		expect(cursorElement).toBeTruthy();
		expect(cursorElement.style.left).toBe("150px");
		expect(cursorElement.style.top).toBe("250px");
	});
});
