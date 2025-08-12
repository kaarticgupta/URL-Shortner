import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { PrismaClient } from "@prisma/client";
import app from "./app.js";

const prisma = new PrismaClient();

const port = process.env.PORT;

app.listen(port, async () => {
  console.log(`Server starting at port ${port}`);
  try {
    await prisma.$connect();
    console.log("Connected to database");
  } catch (err) {
    console.log("Could not connect to database because ", err);
  }
});
