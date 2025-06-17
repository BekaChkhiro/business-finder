import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Container, Row, Col } from 'react-bootstrap';
import './App.css';

// Import components
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import MapComponent from './components/MapComponent';
import BusinessList from './components/BusinessList';
import EmailModal from './components/EmailModal';

// Import utilities
import { searchBusinesses as searchBusinessesUtil, exportToExcel as exportToExcelUtil } from './utils/businessUtils';

// You'll need to replace with your actual Google Maps API key
const API_KEY = "AIzaSyA3dRZNb_pej6omB-CxEWjqhp6SObNBSpY";

// Map container style - used in MapComponent
const mapContainerStyle = {
  width: '100%',
  height: '500px',
};

// San Antonio center coordinates
const center = {
  lat: 29.4241,
  lng: -98.4936,
};

// Map options
const options = {
  disableDefaultUI: false,
  zoomControl: true,
};

// Industry options for the dropdown
// List of industry options available for selection
// eslint-disable-next-line no-unused-vars
const industries = [
  // Healthcare & Medical
  { value: 'dental', label: 'Dental Clinics' },
  { value: 'dentist', label: 'Dentists' },
  { value: 'doctor', label: 'Doctors' },
  { value: 'hospital', label: 'Hospitals' },
  { value: 'medical clinic', label: 'Medical Clinics' },
  { value: 'veterinarian', label: 'Veterinary Clinics' },
  { value: 'pharmacy', label: 'Pharmacies' },
  { value: 'physical therapy', label: 'Physical Therapy' },
  { value: 'chiropractic', label: 'Chiropractors' },
  { value: 'optometrist', label: 'Optometrists' },
  { value: 'dermatologist', label: 'Dermatologists' },
  { value: 'pediatrician', label: 'Pediatricians' },
  
  // Food & Dining
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'cafe', label: 'Cafes' },
  { value: 'bakery', label: 'Bakeries' },
  { value: 'bar', label: 'Bars & Pubs' },
  { value: 'coffee shop', label: 'Coffee Shops' },
  { value: 'food truck', label: 'Food Trucks' },
  { value: 'pizza', label: 'Pizza Places' },
  { value: 'fast food', label: 'Fast Food' },
  { value: 'steakhouse', label: 'Steakhouses' },
  { value: 'seafood restaurant', label: 'Seafood Restaurants' },
  { value: 'mexican restaurant', label: 'Mexican Restaurants' },
  { value: 'italian restaurant', label: 'Italian Restaurants' },
  
  // Lodging
  { value: 'hotel', label: 'Hotels' },
  { value: 'motel', label: 'Motels' },
  { value: 'resort', label: 'Resorts' },
  { value: 'bed and breakfast', label: 'Bed & Breakfasts' },
  { value: 'vacation rental', label: 'Vacation Rentals' },
  { value: 'hostel', label: 'Hostels' },
  { value: 'inn', label: 'Inns' },
  
  // Retail
  { value: 'retail', label: 'Retail Stores' },
  { value: 'clothing store', label: 'Clothing Stores' },
  { value: 'electronics store', label: 'Electronics Stores' },
  { value: 'furniture store', label: 'Furniture Stores' },
  { value: 'jewelry store', label: 'Jewelry Stores' },
  { value: 'bookstore', label: 'Bookstores' },
  { value: 'grocery store', label: 'Grocery Stores' },
  { value: 'department store', label: 'Department Stores' },
  { value: 'shopping mall', label: 'Shopping Malls' },
  { value: 'toy store', label: 'Toy Stores' },
  { value: 'hardware store', label: 'Hardware Stores' },
  
  // Services
  { value: 'hair salon', label: 'Hair Salons' },
  { value: 'spa', label: 'Spas' },
  { value: 'beauty salon', label: 'Beauty Salons' },
  { value: 'nail salon', label: 'Nail Salons' },
  { value: 'barber shop', label: 'Barber Shops' },
  { value: 'massage', label: 'Massage Therapists' },
  { value: 'dry cleaner', label: 'Dry Cleaners' },
  { value: 'tailor', label: 'Tailors' },
  { value: 'laundromat', label: 'Laundromats' },
  
  // Professional Services
  { value: 'lawyer', label: 'Law Firms' },
  { value: 'accountant', label: 'Accountants' },
  { value: 'insurance', label: 'Insurance Agencies' },
  { value: 'financial advisor', label: 'Financial Advisors' },
  { value: 'real estate', label: 'Real Estate Agencies' },
  { value: 'architect', label: 'Architects' },
  { value: 'consulting firm', label: 'Consulting Firms' },
  { value: 'marketing agency', label: 'Marketing Agencies' },
  { value: 'tax service', label: 'Tax Services' },
  
  // Auto & Transportation
  { value: 'car dealer', label: 'Car Dealerships' },
  { value: 'auto repair', label: 'Auto Repair Shops' },
  { value: 'car wash', label: 'Car Washes' },
  { value: 'auto parts', label: 'Auto Parts Stores' },
  { value: 'gas station', label: 'Gas Stations' },
  { value: 'car rental', label: 'Car Rental Agencies' },
  { value: 'taxi service', label: 'Taxi Services' },
  { value: 'towing', label: 'Towing Companies' },
  
  // Education
  { value: 'school', label: 'Schools' },
  { value: 'university', label: 'Universities' },
  { value: 'college', label: 'Colleges' },
  { value: 'kindergarten', label: 'Kindergartens' },
  { value: 'daycare', label: 'Daycares' },
  { value: 'preschool', label: 'Preschools' },
  { value: 'learning center', label: 'Learning Centers' },
  { value: 'tutoring', label: 'Tutoring Services' },
  { value: 'language school', label: 'Language Schools' },
  
  // Recreation & Fitness
  { value: 'gym', label: 'Gyms' },
  { value: 'fitness center', label: 'Fitness Centers' },
  { value: 'yoga studio', label: 'Yoga Studios' },
  { value: 'swimming pool', label: 'Swimming Pools' },
  { value: 'sports club', label: 'Sports Clubs' },
  { value: 'golf course', label: 'Golf Courses' },
  { value: 'park', label: 'Parks' },
  { value: 'movie theater', label: 'Movie Theaters' },
  { value: 'bowling alley', label: 'Bowling Alleys' },
  { value: 'museum', label: 'Museums' },
  { value: 'art gallery', label: 'Art Galleries' },
  
  // Home Services
  { value: 'plumber', label: 'Plumbers' },
  { value: 'electrician', label: 'Electricians' },
  { value: 'hvac', label: 'HVAC Services' },
  { value: 'locksmith', label: 'Locksmiths' },
  { value: 'painter', label: 'Painters' },
  { value: 'roofer', label: 'Roofers' },
  { value: 'landscaper', label: 'Landscapers' },
  { value: 'home cleaning', label: 'Home Cleaning Services' },
  { value: 'pest control', label: 'Pest Control Services' },
  { value: 'moving company', label: 'Moving Companies' },
  
  // Specialty
  { value: 'wedding venue', label: 'Wedding Venues' },
  { value: 'event planner', label: 'Event Planners' },
  { value: 'photographer', label: 'Photographers' },
  { value: 'florist', label: 'Florists' },
  { value: 'travel agency', label: 'Travel Agencies' },
  { value: 'pet groomer', label: 'Pet Groomers' },
  { value: 'catering', label: 'Catering Services' },
  { value: 'printing service', label: 'Printing Services' },
  { value: 'computer repair', label: 'Computer Repair Services' },
  { value: 'phone repair', label: 'Phone Repair Services' },
  
  // Manufacturing & Construction
  { value: 'manufacturing', label: 'Manufacturing Companies' },
  { value: 'construction', label: 'Construction Companies' },
  { value: 'contractor', label: 'Contractors' },
  { value: 'woodworking', label: 'Woodworking Shops' },
  { value: 'metalworking', label: 'Metalworking Shops' },
  
  // Religious & Nonprofit
  { value: 'church', label: 'Churches' },
  { value: 'mosque', label: 'Mosques' },
  { value: 'synagogue', label: 'Synagogues' },
  { value: 'temple', label: 'Temples' },
  { value: 'nonprofit', label: 'Nonprofit Organizations' },
  { value: 'charity', label: 'Charities' },
  
  // Government & Public Services
  { value: 'post office', label: 'Post Offices' },
  { value: 'library', label: 'Libraries' },
  { value: 'police station', label: 'Police Stations' },
  { value: 'fire station', label: 'Fire Stations' },
  { value: 'courthouse', label: 'Courthouses' },
  { value: 'government office', label: 'Government Offices' },
];

function App() {
  const [city, setCity] = useState("San Antonio");
  const [industry, setIndustry] = useState("dental");
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedBusinesses, setSelectedBusinesses] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState("");
  const mapRef = useRef();

  // Load the Google Maps script with Places library
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: API_KEY,
    libraries: ["places"],
  });
  
  // დებაგინგისთვის - შევამოწმოთ API ჩატვირთვის სტატუსი
  useEffect(() => {
    console.log('Google Maps API ჩატვირთვის სტატუსი:', { isLoaded, loadError });
  }, [isLoaded, loadError]);

  // Store the map instance when it loads
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // We'll use real data from the Google Places API instead of mock data

  // Search for businesses based on city and industry using Google Places API
  const searchBusinesses = () => {
    searchBusinessesUtil(city, industry, mapRef, isLoaded, setBusinesses);
  };


  // Toggle business selection for email - used in BusinessList component
  // eslint-disable-next-line no-unused-vars
  const toggleBusinessSelection = (business) => {
    setSelectedBusinesses((prev) => {
      if (prev.some((b) => b.id === business.id)) {
        return prev.filter((b) => b.id !== business.id);
      } else {
        return [...prev, business];
      }
    });
  };

  // Open email modal
  const openEmailModal = () => {
    if (selectedBusinesses.length > 0) {
      const template = `Dear [Business Name],

I hope this email finds you well. I am writing to you regarding a business opportunity that I believe would be of interest to your dental clinic in San Antonio.

[Your offer details here]

I would appreciate the opportunity to discuss this further. Please feel free to contact me at your convenience.

Best regards,
[Your Name]
[Your Contact Information]`;
      
      setEmailTemplate(template);
      setShowEmailModal(true);
    }
  };

  // Send emails (in a real app, this would connect to a backend email service)
  const sendEmails = () => {
    // Here you would typically make an API call to your backend
    alert(`Emails would be sent to ${selectedBusinesses.length} businesses`);
    setShowEmailModal(false);
    setSelectedBusinesses([]);
  };
  
  // Export business data to Excel
  const exportToExcel = (exportType = 'all') => {
    exportToExcelUtil(businesses, selectedBusinesses, exportType);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <Container fluid className="app-container">
      <Header />

      <SearchForm 
        city={city} 
        setCity={setCity} 
        industry={industry} 
        setIndustry={setIndustry} 
        searchBusinesses={searchBusinesses} 
      />

      <Row>
        <Col md={6}>
          <MapComponent
            mapRef={mapRef}
            onLoad={onMapLoad}
            center={center}
            options={options}
            businesses={businesses}
            selectedBusiness={selectedBusiness}
            setSelectedBusiness={setSelectedBusiness}
          />
        </Col>

        <Col md={6}>
          <BusinessList
            businesses={businesses}
            selectedBusinesses={selectedBusinesses}
            exportToExcel={exportToExcel}
            openEmailModal={openEmailModal}
            setSelectedBusiness={setSelectedBusiness}
            mapRef={mapRef}
          />
        </Col>
      </Row>

      <EmailModal
        showEmailModal={showEmailModal}
        setShowEmailModal={setShowEmailModal}
        emailTemplate={emailTemplate}
        setEmailTemplate={setEmailTemplate}
        selectedBusinesses={selectedBusinesses}
        sendEmails={sendEmails}
        exportToExcel={exportToExcel}
      />
    </Container>
  );
}

export default App;
