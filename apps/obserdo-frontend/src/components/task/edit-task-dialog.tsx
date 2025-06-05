import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CreateTaskForm } from "./create-task-form";
import type { Table } from "@tanstack/react-table";
import type { Task } from "@/api/todos";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

export function EditTaskDialog({
  text,
  table,
  todoListId,
  parentTaskId,
}: {
  text: string;
  table?: Table<Task>;
  todoListId: string;
  parentTaskId?: string;
}) {
  const [open, setOpen] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Highlight, Typography],
    content: `
    <p>
      Markdown shortcuts make it easy to format the text while typing.
    </p>
    <p>
      To test that, start a new line and type <code>#</code> followed by a space to get a heading. Try <code>#</code>, <code>##</code>, <code>###</code>, <code>####</code>, <code>#####</code>, <code>######</code> for different levels.
    </p>
    <p>
      Those conventions are called input rules in Tiptap. Some of them are enabled by default. Try <code>></code> for blockquotes, <code>*</code>, <code>-</code> or <code>+</code> for bullet lists, or <code>\`foobar\`</code> to highlight code, <code>~~tildes~~</code> to strike text, or <code>==equal signs==</code> to highlight text.
    </p>
    <p>
      You can overwrite existing input rules or add your own to nodes, marks and extensions.
    </p>
    <p>
      For example, we added the <code>Typography</code> extension here. Try typing <code>(c)</code> to see how it’s converted to a proper © character. You can also try <code>-></code>, <code>>></code>, <code>1/2</code>, <code>!=</code>, or <code>--</code>.
    </p>
    `,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="lg">
          {text}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {parentTaskId ? "Create New Sub-task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            Fill in the fields and save to add{" "}
            {parentTaskId ? "a new sub-task." : "a new task."}
          </DialogDescription>
        </DialogHeader>

        <EditorContent editor={editor} />
        <CreateTaskForm
          table={table}
          parentTaskId={parentTaskId}
          todoListId={todoListId}
          onSuccess={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />

        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  );
}
