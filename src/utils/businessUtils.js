import ExcelJS from 'exceljs';

// Search for businesses based on city and industry using Google Places API
export const searchBusinesses = (city, industry, mapRef, isLoaded, setBusinesses) => {
  if (!isLoaded || !mapRef.current) {
    alert('Google Maps API არ არის ჩატვირთული');
    return;
  }
  
  console.log('ვიწყებთ ბიზნესების ძიებას ქალაქში:', city, 'ინდუსტრია:', industry);
  
  // Use Google Places Service to search for real businesses
  const service = new window.google.maps.places.PlacesService(mapRef.current);
  
  // Get the exact industry keyword from the selected value
  // We'll use the industry value directly for better precision
  const industryKeyword = industry;
  
  // First clear existing results
  setBusinesses([]);
  
  // Create a geocoder to convert city name to coordinates
  const geocoder = new window.google.maps.Geocoder();
  
  // First get the coordinates for the city
  geocoder.geocode({ address: city }, (results, status) => {
    if (status === 'OK' && results[0]) {
      const cityLocation = results[0].geometry.location;
      const cityLat = cityLocation.lat();
      const cityLng = cityLocation.lng();
      
      // Center the map on the city
      mapRef.current.panTo(cityLocation);
      mapRef.current.setZoom(11);  // Set an appropriate zoom level
      
      // Create a grid of search points around San Antonio to get more results
      // Google Places API typically limits to ~60 results (3 pages of 20) per search
      const gridSize = 0.1; // Grid step size in degrees (approx. 11km)
      const gridCount = 4; // Number of grid points in each direction from center
      const searchPoints = [];
      
      // Generate grid of search points
      for (let i = -gridCount; i <= gridCount; i++) {
        for (let j = -gridCount; j <= gridCount; j++) {
          searchPoints.push({
            lat: cityLat + (i * gridSize),
            lng: cityLng + (j * gridSize)
          });
        }
      }
      
      console.log(`Created grid with ${searchPoints.length} search points to find more businesses`);
      
      // Track all found businesses to avoid duplicates
      const foundBusinessIds = new Set();
      let searchPointIndex = 0;
      let totalFound = 0;
      
      // Function to search at a specific point
      const searchAtPoint = (point) => {
        // Map specific industries to Google Places API types for better results
        // Google Places API has specific types that work better than keywords for some categories
        let placeType = '';
        
        // Map common industries to their corresponding Google Places API types
        const typeMapping = {
          'dental': 'dentist',
          'dentist': 'dentist',
          'doctor': 'doctor',
          'hospital': 'hospital',
          'pharmacy': 'pharmacy',
          'restaurant': 'restaurant',
          'cafe': 'cafe',
          'bakery': 'bakery',
          'bar': 'bar',
          'hotel': 'lodging',
          'motel': 'lodging',
          'resort': 'lodging',
          'grocery store': 'grocery_or_supermarket',
          'clothing store': 'clothing_store',
          'electronics store': 'electronics_store',
          'furniture store': 'furniture_store',
          'hair salon': 'hair_care',
          'beauty salon': 'beauty_salon',
          'gym': 'gym',
          'school': 'school',
          'university': 'university',
          'library': 'library',
          'bank': 'bank',
          'gas station': 'gas_station',
          'car dealer': 'car_dealer',
          'car wash': 'car_wash',
          'museum': 'museum',
          'park': 'park',
          'shopping mall': 'shopping_mall',
          'spa': 'spa',
          'movie theater': 'movie_theater',
          'night club': 'night_club',
          'police station': 'police',
          'post office': 'post_office',
        };
        
        // Try to get a specific place type, otherwise use keyword search
        placeType = typeMapping[industryKeyword] || '';
        
        const request = {
          location: point,
          radius: '5000', // 5km radius at each point
          keyword: industryKeyword, // Always include the exact industry term as keyword
        };
        
        // Only add type if we have a specific mapping
        if (placeType) {
          request.type = placeType;
        }
        
        console.log(`Searching for industry: "${industryKeyword}"${placeType ? ` with type: "${placeType}"` : ''}`);
        
        
        // Function to handle pagination and fetch all results for this point
        const fetchAllPlaces = (pageToken = null) => {
          // Update request if there's a page token
          if (pageToken) {
            request.pageToken = pageToken;
          } else if (request.pageToken) {
            delete request.pageToken;
          }
          
          // Perform the search
          service.nearbySearch(request, (results, status, pagination) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              console.log(`Grid point ${searchPointIndex+1}/${searchPoints.length}: Found ${results.length} results ${pageToken ? '(next page)' : ''}`);
              
              // Filter out duplicates and transform results
              const newResults = results.filter(place => !foundBusinessIds.has(place.place_id));
              
              // Add new IDs to set of found businesses
              newResults.forEach(place => foundBusinessIds.add(place.place_id));
              
              // Transform results to our app's data format
              const transformedResults = newResults.map((place, index) => ({
                id: place.place_id || `temp-${Date.now()}-${index}`,
                name: place.name,
                position: {
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng()
                },
                address: place.vicinity,
                rating: place.rating || 'N/A',
                industry: industry,
                // The following fields might not be available in the basic results
                phone: place.formatted_phone_number || 'N/A',
                website: place.website || '#',
                email: 'N/A', // Places API doesn't usually provide email
                city: city
              }));
              
              totalFound += transformedResults.length;
              console.log(`Total unique businesses found so far: ${totalFound}`);
              
              // Update state with the new data (append to existing results)
              setBusinesses(prev => [...prev, ...transformedResults]);
              
              // For each place, get additional details like phone and website
              transformedResults.forEach(business => {
                if (business.id && typeof business.id === 'string' && !business.id.startsWith('temp-')) {
                  // Add a small delay between requests to avoid rate limiting
                  setTimeout(() => {
                    service.getDetails(
                      { placeId: business.id, fields: ['formatted_phone_number', 'website', 'url'] },
                      (place, detailsStatus) => {
                        if (detailsStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                          // First update with basic details
                          const website = place.website || place.url || '#';
                          
                          // Update the business with available details from Google
                          setBusinesses(prev => 
                            prev.map(b => 
                              b.id === business.id 
                                ? { 
                                    ...b, 
                                    phone: place.formatted_phone_number || b.phone,
                                    website: website
                                  }
                                : b
                            )
                          );
                          
                          // If we have a valid website URL, try to scrape it for email addresses
                          if (website && website !== '#') {
                            // Function to scrape a page for emails
                            const scrapePageForEmails = async (url) => {
                              console.log(`Scraping page for emails: ${url}`);
                              try {
                                // Use a proxy service to avoid CORS issues
                                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                                const response = await fetch(proxyUrl);
                                
                                if (!response.ok) {
                                  throw new Error('Network response was not ok');
                                }
                                
                                const html = await response.text();
                                
                                // More comprehensive regex to find email addresses
                                const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                                const foundEmails = html.match(emailRegex);
                                
                                // Look for links to contact pages
                                const parser = new DOMParser();
                                const doc = parser.parseFromString(html, 'text/html');
                                
                                // Return found data
                                return { 
                                  emails: foundEmails || [], 
                                  doc: doc
                                };
                              } catch (error) {
                                console.error(`Error scraping ${url}:`, error);
                                return { emails: [], doc: null };
                              }
                            };
                            
                            // Function to extract contact page links
                            const findContactLinks = (doc, baseUrl) => {
                              if (!doc) return [];
                              
                              const contactLinks = [];
                              const links = doc.querySelectorAll('a');
                              
                              for (const link of links) {
                                const href = link.getAttribute('href');
                                const text = link.textContent.toLowerCase();
                                
                                if (!href) continue;
                                
                                // Look for links that likely lead to contact information
                                if (text.includes('contact') || 
                                    text.includes('about') || 
                                    text.includes('connect') || 
                                    href.includes('contact') || 
                                    href.includes('about')) {
                                    
                                  try {
                                    // Resolve relative URLs
                                    const absoluteUrl = new URL(href, baseUrl).href;
                                    // Only add if it's from the same domain
                                    if (absoluteUrl.includes(new URL(baseUrl).hostname)) {
                                      contactLinks.push(absoluteUrl);
                                    }
                                  } catch (e) {
                                    // URL parsing error
                                    console.log('Error parsing URL:', href);
                                  }
                                }
                              }
                              
                              return [...new Set(contactLinks)]; // Remove duplicates
                            };
                            
                            // Start the scraping process
                            (async () => {
                              // First scrape main page
                              const mainPageResult = await scrapePageForEmails(website);
                              let allEmails = [...mainPageResult.emails];
                              
                              // Find contact page links
                              const contactLinks = findContactLinks(mainPageResult.doc, website);
                              console.log(`Found ${contactLinks.length} potential contact pages on ${website}`);
                              
                              // Scrape up to 3 contact pages (to avoid excessive requests)
                              for (let i = 0; i < Math.min(contactLinks.length, 3); i++) {
                                const contactPageResult = await scrapePageForEmails(contactLinks[i]);
                                allEmails = [...allEmails, ...contactPageResult.emails];
                                // Small delay to avoid overloading servers
                                await new Promise(resolve => setTimeout(resolve, 1000));
                              }
                              
                              // Filter and clean up emails
                              const validEmails = allEmails.filter(email => 
                                email && 
                                !email.includes('example') && 
                                !email.includes('youremail') && 
                                !email.includes('domain.com') &&
                                !email.includes('email@')
                              );
                              
                              // Remove duplicates
                              const uniqueEmails = [...new Set(validEmails)];
                              
                              let bestEmail = 'N/A';
                              
                              if (uniqueEmails.length > 0) {
                                // Prioritize business domain emails
                                try {
                                  const hostname = new URL(website).hostname.replace('www.', '');
                                  const domainEmails = uniqueEmails.filter(email => 
                                    email.endsWith(`@${hostname}`) || 
                                    email.includes(`@${hostname.split('.')[0]}`) // Partial domain match
                                  );
                                  
                                  if (domainEmails.length > 0) {
                                    // Pick shortest domain email (likely info@ or admin@ rather than long personal emails)
                                    bestEmail = domainEmails.sort((a, b) => a.length - b.length)[0];
                                  } else {
                                    // If no domain email, take the first valid email
                                    bestEmail = uniqueEmails[0];
                                  }
                                } catch (e) {
                                  // URL parsing error, just take first email
                                  bestEmail = uniqueEmails[0];
                                }
                                
                                console.log(`Found ${uniqueEmails.length} emails for ${business.name}, using: ${bestEmail}`);
                                console.log('All emails found:', uniqueEmails);
                              } else {
                                // If no emails found, don't create a guess
                                bestEmail = 'N/A';
                                console.log(`No emails found for ${business.name}, using N/A`);
                              }
                              
                              // Update the business with the found email
                              setBusinesses(prev => 
                                prev.map(b => 
                                  b.id === business.id 
                                    ? { ...b, email: bestEmail }
                                    : b
                                )
                              );
                            })().catch(error => {
                              console.error(`Error in scraping process for ${business.name}:`, error);
                              // Don't guess emails, just use N/A
                              setBusinesses(prev => 
                                prev.map(b => 
                                  b.id === business.id 
                                    ? { ...b, email: 'N/A' }
                                    : b
                                )
                              );
                            });
                          }
                        }
                      }
                    );
                  }, 200);
                }
              });
              
              // Check if there are more pages of results
              if (pagination && pagination.hasNextPage) {
                console.log('Loading next page of results...');
                // Wait a bit before requesting the next page to avoid rate limiting
                setTimeout(() => {
                  pagination.nextPage();
                }, 2000);
              } else {
                // Move to the next search point after a delay
                searchPointIndex++;
                if (searchPointIndex < searchPoints.length) {
                  setTimeout(() => {
                    searchAtPoint(searchPoints[searchPointIndex]);
                  }, 2000);
                } else {
                  console.log(`Search completed! Found ${totalFound} unique businesses across all search points.`);
                }
              }
            } else {
              console.log(`No results or API error at grid point ${searchPointIndex+1}/${searchPoints.length}: ${status}`);
              
              // If we hit OVER_QUERY_LIMIT, wait longer before trying next point
              const delayTime = status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT ? 5000 : 2000;
              
              // Move to the next search point after a delay
              searchPointIndex++;
              if (searchPointIndex < searchPoints.length) {
                setTimeout(() => {
                  searchAtPoint(searchPoints[searchPointIndex]);
                }, delayTime);
              } else {
                console.log(`Search completed! Found ${totalFound} unique businesses across all search points.`);
              }
            }
          });
        };
        
        // Start fetching all places for this point
        fetchAllPlaces();
      };
      
      // Start the search with the first point
      if (searchPoints.length > 0) {
        searchAtPoint(searchPoints[0]);
      }
      
    } else {
      console.error('Geocoding error:', status);
      alert(`Could not find coordinates for the city: ${city}`);
    }
  });
};

// Export business data to Excel
export const exportToExcel = (businesses, selectedBusinesses, exportType = 'all') => {
  // Determine which businesses to export
  const businessesToExport = exportType === 'all' ? businesses : selectedBusinesses;
  
  if (businessesToExport.length === 0) {
    alert('No businesses to export');
    return;
  }
  
  const workbook = new ExcelJS.Workbook();
  const sheetName = exportType === 'all' ? 'All Businesses' : 'Selected Businesses';
  const worksheet = workbook.addWorksheet(sheetName);
  
  // Add headers with email prominently featured
  worksheet.columns = [
    { header: 'Business Name', key: 'name', width: 30 },
    { header: 'Email', key: 'email', width: 35 },  // Made wider to accommodate longer email addresses
    { header: 'Phone', key: 'phone', width: 20 },
    { header: 'Address', key: 'address', width: 40 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'Website', key: 'website', width: 40 },
    { header: 'Industry', key: 'industry', width: 15 },
    { header: 'Rating', key: 'rating', width: 10 }
  ];
  
  // Add data rows with special handling for emails
  businessesToExport.forEach(business => {
    // Use 'N/A' if email is empty/undefined
    const email = business.email && business.email !== '' ? business.email : 'N/A';
    
    worksheet.addRow({
      name: business.name,
      email: email,
      phone: business.phone,
      address: business.address,
      city: business.city,
      website: business.website,
      industry: business.industry,
      rating: business.rating
    });
  });
  
  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  
  // Style the email column to highlight it
  const emailColumn = worksheet.getColumn(2);
  emailColumn.font = { color: { argb: '000000' } };
  emailColumn.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFCE5CD' }  // Light orange background
  };
  
  // Add statistics at the bottom
  const statsRowIndex = businessesToExport.length + 3;
  worksheet.addRow([]);
  worksheet.addRow(['Statistics:']);
  worksheet.addRow(['Total Businesses:', businessesToExport.length]);
  
  // Count businesses with emails
  const businessesWithEmails = businessesToExport.filter(b => b.email && b.email !== 'N/A').length;
  worksheet.addRow(['Businesses with Emails:', businessesWithEmails]);
  worksheet.addRow(['Email Coverage:', `${Math.round((businessesWithEmails / businessesToExport.length) * 100)}%`]);
  
  // Make statistics bold
  for (let i = statsRowIndex; i < statsRowIndex + 4; i++) {
    worksheet.getRow(i).font = { bold: true };
  }
  
  // Generate and download Excel file
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileCount = businessesToExport.length;
    link.download = `San_Antonio_${exportType === 'all' ? 'All' : 'Selected'}_Businesses_${fileCount}_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }).catch(error => {
    console.error('Error creating Excel file:', error);
    alert('Error creating Excel file. Please try again.');
  });
};
