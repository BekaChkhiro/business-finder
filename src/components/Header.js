import React from 'react';
import { Row, Col } from 'react-bootstrap';

function Header() {
  return (
    <Row className="header mb-4">
      <Col>
        <h1>Business Finder</h1>
        <p>Find and contact businesses in your area</p>
      </Col>
    </Row>
  );
}

export default Header;
