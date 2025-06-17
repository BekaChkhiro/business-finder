import React from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';

const MapComponent = ({ 
  mapRef, 
  onLoad, 
  center, 
  options, 
  businesses, 
  selectedBusiness, 
  setSelectedBusiness
}) => {
  return (
    <GoogleMap
      mapContainerStyle={{
        width: '100%',
        height: '500px',
      }}
      zoom={12}
      center={center}
      options={options}
      onLoad={onLoad}
      ref={mapRef}
    >
      {businesses.map((business) => (
        <Marker
          key={business.id}
          position={business.position}
          onClick={() => {
            setSelectedBusiness(business);
          }}
        />
      ))}

      {selectedBusiness && (
        <InfoWindow
          position={selectedBusiness.position}
          onCloseClick={() => {
            setSelectedBusiness(null);
          }}
        >
          <div>
            <h5>{selectedBusiness.name}</h5>
            <p>{selectedBusiness.address}</p>
            <p>Rating: {selectedBusiness.rating} ⭐</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default MapComponent;
