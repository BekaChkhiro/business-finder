import React, { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';

// Industry options for the dropdown
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

function SearchForm({ city, setCity, industry, setIndustry, searchBusinesses }) {
  const [industrySearch, setIndustrySearch] = useState('');
  
  // Filter industries based on search query
  const filteredIndustries = industries.filter(ind => 
    ind.label.toLowerCase().includes(industrySearch.toLowerCase()) || 
    ind.value.toLowerCase().includes(industrySearch.toLowerCase())
  );
  
  // Handle industry search input change
  const handleIndustrySearch = (e) => {
    const searchTerm = e.target.value;
    setIndustrySearch(searchTerm);
    
    if (searchTerm) {
      // Find exact matches first
      const exactMatch = industries.find(ind => 
        ind.label.toLowerCase() === searchTerm.toLowerCase() || 
        ind.value.toLowerCase() === searchTerm.toLowerCase()
      );
      
      // If there's an exact match, select it
      if (exactMatch) {
        setIndustry(exactMatch.value);
        return;
      }
      
      // If searchTerm contains at least 3 characters and we have filtered results, select the first one
      if (searchTerm.length >= 3) {
        const matches = industries.filter(ind => 
          ind.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
          ind.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (matches.length === 1) {
          // If there's only one match, select it automatically
          setIndustry(matches[0].value);
        }
      }
    }
  };
  return (
    <Row className="mb-4">
      <Col md={4}>
        <Form.Group className="mb-3">
          <Form.Label>City</Form.Label>
          <Form.Control
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </Form.Group>
      </Col>
      <Col md={4}>
        <Form.Group className="mb-3">
          <Form.Label>Industry</Form.Label>
          <div className="mb-2">
            <Form.Control
              type="text"
              placeholder="Search industries..."
              value={industrySearch}
              onChange={handleIndustrySearch}
            />
            {industrySearch && filteredIndustries.length > 0 && (
              <div className="search-hint p-1 small text-primary">
                <strong>{filteredIndustries[0].label}</strong> will be selected
              </div>
            )}
          </div>
          <Form.Select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            style={{ height: 'auto', maxHeight: '300px', overflowY: 'auto' }}
          >
            {filteredIndustries.length > 0 ? (
              filteredIndustries.map((ind) => (
                <option key={ind.value} value={ind.value}>
                  {ind.label}
                </option>
              ))
            ) : (
              <option disabled>No matches found</option>
            )}
          </Form.Select>
          {industrySearch && (
            <div className="mt-1">
              <small className="text-muted">
                Showing {filteredIndustries.length} of {industries.length} industries
              </small>
            </div>
          )}
        </Form.Group>
      </Col>
      <Col md={4} className="d-flex align-items-end">
        <Button variant="primary" onClick={searchBusinesses} className="mb-3 w-100">
          Search
        </Button>
      </Col>
    </Row>
  );
}

export default SearchForm;
