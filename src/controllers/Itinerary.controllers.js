import {GoogleGenerativeAI} from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";

const genAI = new GoogleGenerativeAI("AIzaSyAnu_TXvnTH5WN04vZ9b8nq4eclNyjUQuA");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const MapsApiKey = process.env.GOOGLE_MAPS_API;

const getItinerary =  asyncHandler(async(req , res , next)=>{
    const {location , days , budget , travelers , preferences} = req.body;

    const prompt = `
        You are a professional AI travel planner. Your job is to generate a **detailed** day-wise itinerary for a trip based on the user's inputs:  

        **User Inputs:**  
        - Destination: ${location}  
        - Trip Duration: ${days} days  
        - Budget: ${budget} INR per traveler  
        - Number of Travelers: ${travelers}  
        - Preferences: ${preferences} (e.g., adventure, sightseeing, relaxation, food, culture)  

        ### **Response Format (Follow this structure for each day of the trip):**  
        #### **Day X: Morning Activities**  
        - **Transportation:** Suggest the best **budget-friendly** travel option (bus, train, flight, rental car) with approximate costs.  
        - **Check-in:** Suggest **hotels or stays** within budget and provide a **brief description** (e.g., "Zostel McLeod Ganj – Budget dorm stay for solo travelers, ₹500/night").  
        - **Breakfast:** Recommend **local food spots** with price range (e.g., "Moonpeak Espresso – Budget breakfast ₹150-200").  

        #### **Afternoon Activities**  
        - **Sightseeing:** Recommend **top attractions** with entry fees (if any) and estimated time required.  
        - **Lunch:** Suggest budget-friendly places for lunch with prices (e.g., "Tibet Kitchen – Tibetan cuisine, ₹200-300 per person").  

        #### **Evening Activities**  
        - **Markets & Shopping:** If applicable, suggest **local markets** with special items (e.g., "McLeod Ganj Market for Tibetan handicrafts").  
        - **Dinner:** Recommend a **budget-friendly restaurant** with price details.  
        - **Night Stay:** Mention if the user stays at the same hotel or suggest alternatives.  

        ### **Also provide available hotels and stays within budget with links**  
        - Include **direct hotel booking links** if possible (e.g., "Zostel McLeod Ganj – [Book here](https://zostel.com)").  
        - Include special food recommendations unique to the location.  

        ### **Important Notes:**  
        - Stick to the **budget** provided by the user and calculate **daily expenses** (Accommodation, Food, Transport).  
        - If a user has a higher budget, suggest **premium options** but mention cost differences.  
        - If a location is known for something (e.g., adventure, beaches, temples), include **must-visit** places.  
        - If it’s a long trip (5+ days), recommend **day trips or excursions** nearby.  
        - Keep responses **detailed and structured** but easy to read.
        `;

    const result = await model.generateContent(prompt);
    const ItineraryResponse = await result.response.text(); // Extract text from response object

    
    res.json({ itinerary: ItineraryResponse });
});

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
    res.json({hotels : hotelDetails});
});

export {getItinerary , getHotels};



