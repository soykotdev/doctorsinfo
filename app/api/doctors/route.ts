import { NextResponse } from 'next/server';
import fs from 'fs';
import csv from 'csv-parser';

interface Doctor {
  name: string;
  specialty: string;
  // Add more fields as needed
}

export async function GET() {
  const results: Doctor[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/doctor_info.csv')
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => {
        resolve(NextResponse.json(results));
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
