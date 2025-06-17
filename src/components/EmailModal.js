import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

function EmailModal({ 
  showEmailModal, 
  setShowEmailModal, 
  emailTemplate, 
  setEmailTemplate, 
  selectedBusinesses, 
  sendEmails, 
  exportToExcel 
}) {
  return (
    <Modal
      show={showEmailModal}
      onHide={() => setShowEmailModal(false)}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Send Email to Selected Businesses</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Email Template</Form.Label>
          <Form.Control
            as="textarea"
            rows={10}
            value={emailTemplate}
            onChange={(e) => setEmailTemplate(e.target.value)}
          />
        </Form.Group>
        <p>
          <strong>Note:</strong> This template will be sent to{" "}
          {selectedBusinesses.length} businesses with each business name
          personalized.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
          Cancel
        </Button>
        <Button variant="success" onClick={() => exportToExcel('selected')} className="me-2">
          Export to Excel
        </Button>
        <Button variant="primary" onClick={sendEmails}>
          Send Emails
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EmailModal;
