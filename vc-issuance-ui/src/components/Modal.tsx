import { Fragment, useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
 
type ModalProps = {
  show: boolean;
  title?: string;
  content?: string;
}

export default function Modal(props: ModalProps) {
  const [open, setOpen] = useState(props.show);
 
  const handleOpen = () => setOpen(!open);
 
  return (
    <Fragment>
      <Dialog
        open={open}
        handler={handleOpen}
        animate={{
          mount: { scale: 1, y: 0 },
          unmount: { scale: 0.9, y: -100 },
        }}
      >
        <DialogHeader>{props.title}</DialogHeader>
        <DialogBody divider>
          {props.content}
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" color="green" onClick={handleOpen}>
            <span>Close</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </Fragment>
  );
}