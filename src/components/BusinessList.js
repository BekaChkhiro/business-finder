import React from 'react';
import { Card, Button } from 'react-bootstrap';

function BusinessList({ 
  businesses, 
  selectedBusinesses, 
  exportToExcel, 
  openEmailModal, 
  setSelectedBusiness, 
  mapRef 
}) {
  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <h3>Search Results <span className="badge bg-info">{businesses.length} businesses found</span></h3>
        <div>
          <Button variant="success" onClick={() => exportToExcel('all')} className="me-2">
            Export All to Excel
          </Button>
          {selectedBusinesses.length > 0 && (
            <>
              <Button variant="outline-success" onClick={() => exportToExcel('selected')} className="me-2">
                Export Selected ({selectedBusinesses.length})
              </Button>
              <Button variant="primary" onClick={openEmailModal}>
                Email Selected ({selectedBusinesses.length})
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="business-list">
        {businesses.map((business) => (
          <Card key={business.id} className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Card.Title>{business.name}</Card.Title>
                <Button
                  variant="primary"
                  size="sm"
                  target="_blank"
                  href={business.website !== '#' ? business.website : `https://www.google.com/search?q=${encodeURIComponent(business.name)}`}
                >
                  {business.website !== '#' ? 'Visit Website' : 'Search on Google'}
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedBusiness(business);
                    mapRef.current.panTo(business.position);
                    mapRef.current.setZoom(15);
                  }}
                >
                  Show on Map
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
        {businesses.length === 0 && (
          <div className="text-center p-4">
            <p>No businesses found. Try searching with different criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessList;
