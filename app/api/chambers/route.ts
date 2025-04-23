import { NextResponse } from 'next/server';
import fs from 'fs';
import csv from 'csv-parser';

interface Chamber {
  name: string;
  address: string;
  // Add more fields as needed
}

export async function GET() {
  const results: Chamber[] = [];

  try {
    const results: Chamber[] = await new Promise((resolve, reject) => {
      fs.createReadStream('data/chamber_info.csv')
        .pipe(csv())
        .on('data', (data: any) => results.push(data))
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error reading chamber info:", error);
    return NextResponse.json({ error: "Failed to read chamber info" }, { status: 500 });
  }
}
