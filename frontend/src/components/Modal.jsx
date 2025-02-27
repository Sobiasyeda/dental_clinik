import { useEffect, useRef } from "react";
import Draggable from "react-draggable";

export default function Modal({ children, open, cancel, className }) {
  const dialog = useRef();

  useEffect(() => {
    const modal = dialog.current;
    if (open) {
      modal.showModal();
    }
    return () => modal.close();
  }, [open]);

  return (
    <Draggable cancel={cancel}>
      <dialog ref={dialog}>{children}</dialog>
    </Draggable>
  );
}
