import axios from 'axios';
// const axios = require('axios');

const apiKey = "AIzaSyAMY4ka7D1HbSVzy3Ju-p6UniOoy4Nq1_U";
const placeName = 'dharamshala';  // Example: Coordinates for Delhi, India
const radius = 5000;  // Search within a 5 km radius

const getHotels = async (location) => {
    try {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=hotels+in+${placeName}&radius=${radius}&key=${apiKey}`;
        const response = await axios.get(url);
        const hotels = response.data.results;

        if (hotels.length > 0) {
            hotels.forEach((hotel, index) => {
                console.log(`Hotel ${index + 1}:`);
                console.log(`Name: ${hotel.name}`);
                console.log(`Address: ${hotel.vicinity}`);
                console.log(`Rating: ${hotel.rating || 'No rating available'}`);
                console.log(`Photo URL: ${hotel.photos ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${hotel.photos[0].photo_reference}&key=${apiKey}` : 'No photos available'}`);
                console.log('-------------------');
            });
        } else {
            console.log('No hotels found within the specified radius.');
        }
    } catch (error) {
        console.error('Error fetching hotel data:', error);
    }
};

// Example usage
getHotels(placeName);

/*
const getHotels = asyncHandler(async(req , res , next)=>{
    const {location} = req.body;
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=hotels+in+${location}&key=${MapsApiKey}`;
    const textSearchResponse = await axios.get(textSearchUrl);
    const hotels = textSearchResponse.data.results.slice(0, 15); // Get top 15 hotels

    let hotelDetails = [];

    for (let hotel of hotels) {
        const placeId = hotel.place_id;

        // Step 2: Fetch Hotel Details (Address, Rating, Website, etc.)
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,photos,url,geometry&key=${MapsApiKey}`;
        const detailsResponse = await axios.get(detailsUrl);
        const details = detailsResponse.data.result;

        // Step 3: Fetch Hotel Images (If Available)
        let hotelImages = [];
        if (details.photos) {
            hotelImages = details.photos.slice(0, 2).map(photo => 
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${MapsApiKey}`
            );
        }

        // Step 4: Add Hotel Data to Response
        hotelDetails.push({
            name: details.name,
            rating: details.rating || "No rating available",
            address: details.formatted_address,
            google_map_link: details.url,
            location: details.geometry.location, // { lat, lng }
            images: hotelImages
        });
    }
});
*/