import Modal from "./Modal.jsx";
import { useContext } from "react";
import { ModalContext } from "./ModalContext.jsx";
import Button from "../UI/Button.jsx";

const DocumentsViewModal = ({ viewDocs }) => {
  const modalCtx = useContext(ModalContext);
  const patient_name = Array.from(
    new Set(
      viewDocs.map((item) => `${item.name} ${item.father} ${item.family}`),
    ),
  );
  return (
    <div>
      {viewDocs.length >= 1 && (
        <Modal open={modalCtx.documentViewModal}>
          <div className="name-docs">{patient_name}</div>
          <div className="viewDocsModal">
            {viewDocs
              .sort((a, b) => new Date(b.upload_date) - new Date(a.upload_date))
              .map((item, index) => (
                <div key={index}>
                  <div className="uploaded-docs">
                    <div className="dateUpload">{item.upload_date}</div>
                    <a
                      href={item.file_path}
                      download={item.file_name}
                      className="documentUpload"
                    >
                      {item.file_name}
                    </a>
                  </div>
                </div>
              ))}
          </div>

          <div>
            <Button
              onClick={modalCtx.handleCloseDocumentViewModal}
              className="uploadButton"
            >
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DocumentsViewModal;
