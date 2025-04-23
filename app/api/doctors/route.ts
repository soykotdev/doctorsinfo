import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

interface Doctor {
  "Doctor Name": string;
  "Photo URL": string;
  Designation: string;
  Specialty: string;
}

export async function GET() {
  const uri = "mongodb+srv://myuser:zR7kozHGoJPYQbqg@cluster0.obbqv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"; // Replace with your MongoDB connection string
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("mydata"); // Replace with your database name
    const collection = database.collection("doctor_info"); // Replace with your collection name

    const doctors = await collection.find<Doctor>({}).toArray();

    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors from MongoDB' }, { status: 500 });
  } finally {
    await client.close();
  }
}
