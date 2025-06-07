import { cloneElement, useState, type PropsWithChildren } from "react";
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
import { CirclePlus } from "lucide-react";

type DialogChildProps = {
  handleClose?: () => void;
};

type DialogButtonProps = {
  variant: "link" | "ghost";
  size: "lg";
  openText?: string;
  showIcon?: boolean;
  type: DialogButtonType;
};

type DialogButtonType = "create" | "subTask" | "edit";

const dialogButtons: Record<DialogButtonType, DialogButtonProps> = {
  create: {
    variant: "link",
    size: "lg",
    openText: "Create Task",
    showIcon: true,
    type: "create",
  },
  subTask: {
    variant: "ghost",
    size: "lg",
    showIcon: true,
    type: "subTask",
  },
  edit: {
    variant: "link",
    size: "lg",
    openText: "Edit Task",
    type: "edit",
  },
};

const DialogButton = ({ type }: { type: DialogButtonType }) => {
  const { variant, size, openText, showIcon } = dialogButtons[type];

  return (
    <Button variant={variant} size={size}>
      {showIcon && <CirclePlus />}
      {openText}
    </Button>
  );
};

export function TaskDialog({
  dialogType,
  children,
  dialogTitle,
  dialogDescription,
}: PropsWithChildren<{
  dialogType: DialogButtonType;
  openText?: string;
  dialogTitle: string;
  dialogDescription: string;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DialogButton type={dialogType} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {dialogTitle}
          </DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        {cloneElement(children as React.ReactElement<DialogChildProps>, { handleClose: () => setOpen(false) })}
        <DialogClose className="absolute right-4 top-4" />
      </DialogContent>
    </Dialog>
  );
}
