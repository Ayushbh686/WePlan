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
