import { ApiError } from "../utils/ApiError.js";
import { verifyJWT } from "./auth.middlewares.js";
import { verifyJWTProvider } from "./authProvider.middlewares.js";

const verifyEitherJWT = async (req, res, next) => {
    try {
        // Try verifying as a normal user
        await verifyJWT(req, res, () => {});

        if (req.user) {
            return next(); // If user is authenticated, proceed
        }
    } catch (err) {
        // If user verification fails, continue to provider verification
    }

    try {
        // Try verifying as a provider
        await verifyJWTProvider(req, res, () => {});

        if (req.provider) {
            return next(); // If provider is authenticated, proceed
        }
    } catch (err) {
        // If both verifications fail, return unauthorized
        return res.status(401).json(new ApiError(404 , "Unauthorized access!" ));
    }
};

export { verifyEitherJWT };
