import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const result = {
  id: true,
  url: true,
  shortCode: true,
  createdAt: true,
  updatedAt: true,
};

const isValidUrl = (u) => {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
};

const generateUniqueShortCode = async (length = 6) => {
  while (true) {
    const code = Math.random()
      .toString(36)
      .substring(2, 2 + length);
    const exists = await prisma.shortURL.findUnique({
      where: { shortCode: code },
    });
    if (!exists) return code;
  }
};

const shortenURL = async (req, res) => {
  try {
    const { url } = req.body;
    if (!url)
      return res.status(400).json({ message: "Missing 'url' in request body" });
    if (!isValidUrl(url))
      return res.status(400).json({ message: "Invalid URL" });

    const existing = await prisma.shortURL.findFirst({ where: { url } });
    if (existing) {
      return res
        .status(409)
        .json({ message: "URL already exists", data: existing });
    }
    const shortCode = await generateUniqueShortCode(6);

    let stat = await prisma.shortURL.create({
      data: { url, shortCode },
      select: result,
    });

    return res.status(200).json(stat);
  } catch (err) {
    if (err?.code === "P2025") {
      return res.status(500).json({ message: "Internal server error" });
    }
    return res.status(500).json({ message: err.message || "Unknown error" });
  }
};

const retrieveURL = async (req, res) => {
  try {
    const short = req.params.shortCode;
    if (!short) {
      return res.status(404).json({ message: "Enter Valid Short code" });
    }

    const orignalUrl = await prisma.shortURL.findUnique({
      where: { shortCode: short },
      select: result,
    });

    await prisma.shortURL.update({
      where: { shortCode: short },
      data: { accessCount: { increment: 1 } },
    });

    if (orignalUrl) {
      return res.status(200).json(orignalUrl);
    } else {
      return res.status(404).json({ message: "did not find URL" });
    }
  } catch (err) {
    // Prisma throws P2025 when the record isn't found
    if (err?.code === "P2025") {
      return res.status(404).json({ message: "Short code not found" });
    }
    console.error("retrieveURL error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateURL = async (req, res) => {
  try {
    const short = req.params.shortCode;
    if (!short) {
      return res.sendStatus(400).json({ message: "Enter Valid Short code" });
    }

    const updatedUrl = req.body.url;
    if (!updatedUrl)
      return res.status(400).json({ message: "Missing 'url' in request body" });
    if (!isValidUrl(updatedUrl))
      return res.status(400).json({ message: "Invalid URL" });

    const update = await prisma.shortURL.update({
      where: { shortCode: short },
      data: { url: updatedUrl },
      select: result,
    });
    if (update) {
      return res.sendStatus(200).json(update);
    } else {
      return res.sendStatus(500).json({ mmessage: "Could not update URL" });
    }
  } catch (err) {
    if (err?.code === "P2025") {
      return res.status(404).json({ message: "Short code not found" });
    }
    console.error("deleteURL error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const deleteURL = async (req, res) => {
  try {
    const short = req.params.shortCode;
    if (!short) {
      return res.sendStatus(404).json({ message: "Enter Valid Short code" });
    }

    await prisma.shortURL.delete({
      where: { shortCode: short },
    });

    return res.sendStatus(204).send();
  } catch (err) {
    if (err?.code === "P2025") {
      return res.status(404).json({ message: "Short code not found" });
    }
    console.error("deleteURL error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getStats = async (req, res) => {
  try {
    const short = req.params.shortCode;
    if (!short) {
      return res.status(404).json({ message: "Enter Valid Short code" });
    }

    const stat = await prisma.shortURL.findUnique({
      where: { shortCode: short },
    });

    if (stat) {
      return res.status(200).json({ stat });
    } else {
      return res.status(404).json({ message: "Couold not find the URL" });
    }
  } catch (err) {
    if (err?.code === "P2025") {
      return res.status(404).json({ message: "Short code not found" });
    }
    console.error("deleteURL error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  shortenURL,
  retrieveURL,
  updateURL,
  deleteURL,
  getStats,
};
