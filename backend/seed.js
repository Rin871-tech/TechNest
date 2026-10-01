const mongoose = require("mongoose");
require("dotenv").config();

const Product = require("./models/Product");

const products = [
  {
    name: "MacBook Air M4",
    price: 99999,
    category: "Laptops",
    brand: "Apple",
    image:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8",
    description:
      "Powerful and lightweight laptop designed for work, creativity and everyday performance.",
    stock: 10
  },
  {
    name: "Sony WH-1000XM5",
    price: 29999,
    category: "Audio",
    brand: "Sony",
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
    description:
      "Premium wireless headphones with industry-leading noise cancellation.",
    stock: 15
  },
  {
    name: "Keychron K2 Mechanical Keyboard",
    price: 8499,
    category: "Keyboards",
    brand: "Keychron",
    image:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
    description:
      "Compact wireless mechanical keyboard built for productivity and enthusiasts.",
    stock: 20
  },
  {
    name: "Logitech MX Master 3S",
    price: 7999,
    category: "Mice",
    brand: "Logitech",
    image:
      "https://images.unsplash.com/photo-1527814050087-3793815479db",
    description:
      "Advanced wireless mouse designed for precision and productivity.",
    stock: 25
  },
  {
    name: "Dell UltraSharp 27",
    price: 32999,
    category: "Monitors",
    brand: "Dell",
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
    description:
      "27-inch professional monitor with exceptional clarity and color accuracy.",
    stock: 8
  },
  {
    name: "Samsung T7 Portable SSD",
    price: 9499,
    category: "Storage",
    brand: "Samsung",
    image:
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b",
    description:
      "Fast and compact portable SSD for storing your important files.",
    stock: 18
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected ✅");

    await Product.deleteMany();

    await Product.insertMany(products);

    console.log("Products inserted successfully 🎉");

    await mongoose.connection.close();

    console.log("Database connection closed.");
  } catch (error) {
    console.error("Seeding failed ❌");
    console.error(error.message);

    process.exit(1);
  }
};

seedDatabase();