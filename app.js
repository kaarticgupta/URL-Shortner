import express from "express";
import morgan from "morgan";
import router from "./routes/urlRoutes.js";

const app = express();

app.use(express.json());
app.use(morgan("short"));

app.get("/test", (req, res) => {
  res.json({ message: "Test route works" });
});

app.use("/", router);

export default app;
