import { createFileRoute } from "@tanstack/react-router";
import logo from "../logo.svg";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { baseUrl } from "@/lib/env";
import type { Todo } from "db/types";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const fetchData = async () => {
    const res = await fetch(baseUrl);
    const todos: Todo[] = await res.json();

    console.log("Fetched todos:", todos);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="text-center">
      <header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
        <img
          src={logo}
          className="h-[40vmin] pointer-events-none animate-[spin_20s_linear_infinite]"
          alt="logo"
        />
        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <a
          className="text-[#61dafb] hover:underline"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <a
          className="text-[#61dafb] hover:underline"
          href="https://tanstack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn TanStack
        </a>
        <Button>This is a ShadCN Button</Button>
      </header>
    </div>
  );
}
