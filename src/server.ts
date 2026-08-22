import "dotenv/config";
import app from "./app";
import { prisma } from "./lib/prisma";

const port = Number(process.env.PORT) || 5000;

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to DATABASE Successfully");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("An error occurred while starting the server", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

void main();