import { cloneElement, useState, type PropsWithChildren } from "react";
import {
  Dialog as DialogUI,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { CirclePlus, Link, Pencil } from "lucide-react";

type DialogChildProps = {
  handleClose?: () => void;
};

type DialogButtonProps = {
  variant: "link" | "ghost";
  size: "lg";
  openText?: string;
  icon?: React.ReactNode;
  type: DialogButtonType;
};

type DialogButtonType = "create" | "subTask" | "edit" | "editWithIcon" | "share";

const dialogButtons: Record<DialogButtonType, DialogButtonProps> = {
  create: {
    variant: "link",
    size: "lg",
    openText: "Create Task",
    icon: <CirclePlus />,
    type: "create",
  },
  subTask: {
    variant: "ghost",
    size: "lg",
    icon: <CirclePlus />,
    type: "subTask",
  },
  edit: {
    variant: "link",
    size: "lg",
    openText: "Edit Task",
    type: "edit",
  },
  editWithIcon: {
    variant: "ghost",
    size: "lg",
    icon: <Pencil />,
    type: "editWithIcon",
  },
  share: {
    variant: "ghost",
    size: "lg",
    icon: <Link />,
    type: "share",
  }
};

const DialogButton = ({ type, openText, onClick }: { type: DialogButtonType; openText?: string; onClick?: () => void }) => {
  const { variant, size, icon } = dialogButtons[type];
  return (
    <Button variant={variant} size={size} onClick={onClick}>
      {icon}
      {openText || dialogButtons[type].openText}
    </Button>
  );
};

export function Dialog({
  dialogType,
  children,
  dialogTitle,
  dialogDescription,
  openText,
}: PropsWithChildren<{
  dialogType: DialogButtonType;
  openText?: string;
  dialogTitle: string;
  dialogDescription: string;
}>) {
  const [open, setOpen] = useState(false);

  return (
    <DialogUI open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DialogButton type={dialogType} openText={openText} onClick={() => setOpen(true)} />
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
    </DialogUI>
  );
}
