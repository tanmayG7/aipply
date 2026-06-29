import { NextResponse } from 'next/server';
import { connectToMongoDB } from '@/lib/mongo/mongo';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  try {
    console.log('🔍 [Health Check] Testing MongoDB connection...');
    const db = await connectToMongoDB();

    const collections = await db.listCollections().toArray();
    const jobsCount = await db.collection('jobs').estimatedDocumentCount();
    const jobMapCount = await db.collection('jobMap').estimatedDocumentCount();
    const elapsed = Date.now() - startTime;

    const response = {
      status: 'healthy',
      database: 'connected',
      latency: `${elapsed}ms`,
      collections: {
        total: collections.length,
        names: collections.map((c) => c.name),
      },
      counts: {
        jobs: jobsCount,
        jobMap: jobMapCount,
      },
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongodbUri: !!process.env.MONGODB_URI,
        hasMongoUri: !!process.env.MONGO_URI,
      },
    };

    console.log('✅ [Health Check] MongoDB is healthy:', response);
    return NextResponse.json(response);
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    const errorCode = (error as NodeJS.ErrnoException).code;
    const elapsed = Date.now() - startTime;

    const response = {
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      errorCode: errorCode,
      errorName: err.name,
      latency: `${elapsed}ms`,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasMongodbUri: !!process.env.MONGODB_URI,
        hasMongoUri: !!process.env.MONGO_URI,
      },
    };

    console.error('❌ [Health Check] MongoDB is unhealthy:', response);
    return NextResponse.json(response, { status: 503 });
  }
}
