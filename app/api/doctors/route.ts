import { NextResponse } from 'next/server';
import fs from 'fs';
import csv from 'csv-parser';

interface Doctor {
  name: string;
  specialty: string;
  // Add more fields as needed
}

export async function GET() {
  try {
    const results: Doctor[] = await new Promise((resolve, reject) => {
      const results: Doctor[] = [];
      fs.createReadStream('data/doctor_info.csv')
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
    console.error("Error reading doctor info:", error);
    return NextResponse.json({ error: "Failed to read doctor info" }, { status: 500 });
  }
}
