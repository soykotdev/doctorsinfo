import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;
let connectionPromise: Promise<{ client: MongoClient; db: any }> | null = null;

async function connectToDatabase() {
  // If we have a connection promise in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  // If we have a cached connection, verify it's still alive
  if (cachedClient && cachedDb) {
    try {
      // Ping the database to check connection
      await cachedDb.command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.warn('Cached MongoDB connection is no longer valid, creating new connection');
      cachedClient = null;
      cachedDb = null;
    }
  }

  // Create new connection
  connectionPromise = (async () => {
    try {
      const uri = process.env.MONGODB_URI;
      if (!uri) {
        throw new Error('MongoDB URI is not configured');
      }
      
      const client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 5,
        maxIdleTimeMS: 60000,
        serverSelectionTimeoutMS: 5000, // 5 second timeout for server selection
        connectTimeoutMS: 10000, // 10 second timeout for initial connection
        socketTimeoutMS: 15000, // 15 second timeout for operations
      });

      await client.connect();
      const db = client.db("mydata");
      
      // Test the connection
      await db.command({ ping: 1 });
      
      // Cache the connection
      cachedClient = client;
      cachedDb = db;
      
      return { client, db };
    } catch (error) {
      console.error('MongoDB connection error:', error);
      
      // Specific error handling for different MongoDB connection issues
      if (error instanceof Error) {
        if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
          throw new Error('Database server is unreachable. Please try again later.');
        } else if (error.message.includes('Authentication failed')) {
          throw new Error('Database authentication failed. Please contact support.');
        } else if (error.message.includes('topology')) {
          throw new Error('Database connection was interrupted. Please try again.');
        }
      }
      
      throw new Error('Failed to connect to database. Please try again later.');
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
}

interface Doctor {
  "Doctor Name": string;
  "Photo URL": string;
  Degree: string;
  Specialty: string;
  Designation: string;
  Workplace: string;
  About: string;
}

interface PaginatedResponse {
  doctors: Doctor[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const specialty = searchParams.get('specialty');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const skip = (page - 1) * pageSize;

    const { db } = await connectToDatabase();
    const collection = db.collection("doctor_info");
    
    let query: any = {};
    
    if (name) {
      const nameParts = name.split(' ').filter(part => part.length > 0);
      const nameRegex = nameParts.map(part => `(?=.*${part})`).join('');
      query["Doctor Name"] = { 
        $regex: nameRegex,
        $options: 'i'
      };
    }
    
    if (specialty && specialty.toLowerCase() !== 'all') {
      query.Specialty = {
        $regex: specialty,
        $options: 'i'
      };
    }
    
    // Get total count for pagination
    const total = await collection.countDocuments(query);
    
    // Fetch randomized paginated results using aggregation pipeline
    const doctors = await collection
      .aggregate([
        { $match: query },
        { $sample: { size: total } }, // Randomize all matching documents
        { $skip: skip },
        { $limit: pageSize }
      ])
      .toArray() as Doctor[];
    
    if (!doctors || doctors.length === 0) {
      return NextResponse.json(
        { error: 'No doctors found matching your criteria.' },
        { status: 404 }
      );
    }
    
    const response: PaginatedResponse = {
      doctors,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Total-Count': total.toString(),
        'X-Page-Count': Math.ceil(total / pageSize).toString(),
        'X-Current-Page': page.toString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred while fetching doctor information.';

    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || 
          error.message.includes('ETIMEDOUT') ||
          error.message.includes('topology')) {
        statusCode = 503;
        errorMessage = 'The database service is temporarily unavailable. Please try again later.';
      } else if (error.message.includes('Authentication failed')) {
        statusCode = 500;
        errorMessage = 'Internal server error. Our team has been notified.';
      } else {
        errorMessage = `Failed to fetch doctors: ${error.message}`;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
