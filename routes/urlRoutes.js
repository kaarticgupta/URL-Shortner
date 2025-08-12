import express from "express";
import urlRoutes from "../controllers/urlController.js";

const router = express.Router();

router.post("/shorten", urlRoutes.shortenURL);

router.get("/shorten/:shortCode", urlRoutes.retrieveURL);

router.put("/shorten/:shortCode", urlRoutes.updateURL);

router.delete("/shorten/:shortCode", urlRoutes.deleteURL);

router.get("/shorten/:shortCode/stats", urlRoutes.getStats);

export default router;
