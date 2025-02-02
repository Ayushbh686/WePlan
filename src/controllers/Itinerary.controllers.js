import {GoogleGenerativeAI} from "@google/generative-ai";
import { asyncHandler } from "../utils/asyncHandler.js";

const genAI = new GoogleGenerativeAI("AIzaSyAnu_TXvnTH5WN04vZ9b8nq4eclNyjUQuA");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    const response = await result.response.text(); // Extract text from response object
    res.json({ itinerary: response });
});


export {getItinerary};


// import {GoogleGenerativeAI} from "@google/generative-ai";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import axios from "axios";

// const genAI = new GoogleGenerativeAI("AIzaSyAnu_TXvnTH5WN04vZ9b8nq4eclNyjUQuA");
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// const getHotelsData = async (location, budget) => {
//     const hotels = []; // This will hold the hotel data
//     // Call Google Places API or any other API to get hotels data
//     try {
//         const response = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
//             params: {
//                 query: `hotels in ${location}`,
//                 key: process.env.GOOGLE_MAPS_API,
//             },
//         });
//         // console.log(response);
//         // Filter hotels based on budget and availability (simplified)
//         response.data.results.forEach((hotel) => {
//             if (hotel.price_level <= budget) {
//                 hotels.push({
//                     name: hotel.name,
//                     address: hotel.formatted_address,
//                     price: hotel.price_level ? hotel.price_level * 1000 : 'N/A', // Example of price calculation
//                     rating: hotel.rating,
//                     availability: hotel.opening_hours ? hotel.opening_hours.open_now : 'N/A', // Availability based on opening hours
//                     photo: hotel.photos ? hotel.photos[0].photo_reference : null,
//                     bookingLink: `https://www.booking.com/searchresults.html?label=yourLabel&aid=yourAffiliateCode&city=${hotel.name}`,
//                 });
//             }
//         });
//     } catch (error) {
//         console.error('Error fetching hotel data:', error);
//     }
//     return hotels;
// };

// const getItinerary = asyncHandler(async (req, res, next) => {
//     const { location, days, budget, travelers, preferences } = req.body;

//     const prompt = `
//         You are a professional AI travel planner. Your job is to generate a **detailed** day-wise itinerary for a trip based on the user's inputs:  

//         **User Inputs:**  
//         - Destination: ${location}  
//         - Trip Duration: ${days} days  
//         - Budget: ${budget} INR per traveler  
//         - Number of Travelers: ${travelers}  
//         - Preferences: ${preferences} (e.g., adventure, sightseeing, relaxation, food, culture)  

//         ### **Response Format (Follow this structure for each day of the trip):**  
//         #### **Day X: Morning Activities**  
//         - **Transportation:** Suggest the best **budget-friendly** travel option (bus, train, flight, rental car) with approximate costs.  
//         - **Check-in:** Suggest **hotels or stays** within budget and provide a **brief description** (e.g., "Zostel McLeod Ganj – Budget dorm stay for solo travelers, ₹500/night").  
//         - **Breakfast:** Recommend **local food spots** with price range (e.g., "Moonpeak Espresso – Budget breakfast ₹150-200").  

//         #### **Afternoon Activities**  
//         - **Sightseeing:** Recommend **top attractions** with entry fees (if any) and estimated time required.  
//         - **Lunch:** Suggest budget-friendly places for lunch with prices (e.g., "Tibet Kitchen – Tibetan cuisine, ₹200-300 per person").  

//         #### **Evening Activities**  
//         - **Markets & Shopping:** If applicable, suggest **local markets** with special items (e.g., "McLeod Ganj Market for Tibetan handicrafts").  
//         - **Dinner:** Recommend a **budget-friendly restaurant** with price details.  
//         - **Night Stay:** Mention if the user stays at the same hotel or suggest alternatives.  

//         ### **Also provide available hotels and stays within budget with links**  
//         - Include **direct hotel booking links** if possible (e.g., "Zostel McLeod Ganj – [Book here](https://zostel.com)").  
//         - Include special food recommendations unique to the location.  

//         ### **Important Notes:**  
//         - Stick to the **budget** provided by the user and calculate **daily expenses** (Accommodation, Food, Transport).  
//         - If a user has a higher budget, suggest **premium options** but mention cost differences.  
//         - If a location is known for something (e.g., adventure, beaches, temples), include **must-visit** places.  
//         - If it’s a long trip (5+ days), recommend **day trips or excursions** nearby.  
//         - Keep responses **detailed and structured** but easy to read.
//     `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response.text(); // Extract text from response object

//     // Fetch hotel details for the location and budget
//     const hotels = await getHotelsData(location, budget);

//     // Parse the itinerary response into structured data (could be further parsed into a JSON object)
//     const itinerary = {
//         location,
//         days,
//         budget,
//         travelers,
//         preferences,
//         dailyItinerary: response,
//         hotels,
//     };

//     // Return the structured itinerary
//     res.json({ itinerary });
// });

// export { getItinerary };

