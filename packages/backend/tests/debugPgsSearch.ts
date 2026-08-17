import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
import { prisma } from '@qrent/shared';
import { PGSearchService } from '../src/services/PGSearchService';

async function debug() {
  const colleges = await prisma.college.findMany();
  console.log('=== COLLEGES IN POSTGRES ===');
  console.table(colleges.map(c => ({ id: c.id, name: c.name })));

  const pgs = await prisma.pGListing.findMany({
    select: { id: true, title: true, collegeId: true, locality: true, status: true, isDemoData: true }
  });
  console.log('=== ALL PG LISTINGS IN POSTGRES ===');
  console.table(pgs);

  for (const c of colleges) {
    const res = await PGSearchService.searchPgs({ collegeId: c.id });
    console.log(`Search result for College ID #${c.id} (${c.name}): ${res.pgs.length} PGs returned`);
  }

  const resAll = await PGSearchService.searchPgs({});
  console.log(`Search result with NO college filter: ${resAll.pgs.length} PGs returned`);
}

debug().catch(console.error);
