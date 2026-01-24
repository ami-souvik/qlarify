
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { rating, comment } = await req.json();
    
    // We'll save to a CSV file in the project root or /tmp depending on environment
    // For local dev, project root is fine.
    const feedbackFile = path.join(process.cwd(), 'feedback.csv');
    const timestamp = new Date().toISOString();
    
    // Simple CSV escaping
    const cleanComment = (comment || '').replace(/"/g, '""');
    const csvLine = `"${timestamp}",${rating},"${cleanComment}"\n`;

    const fileExists = fs.existsSync(feedbackFile);
    
    if (!fileExists) {
        fs.writeFileSync(feedbackFile, 'timestamp,rating,comment\n');
    }

    fs.appendFileSync(feedbackFile, csvLine);

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Feedback Error:", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}
