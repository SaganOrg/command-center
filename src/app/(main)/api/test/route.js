import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    "https://wiwfkcbcplgrbqhjaqbx.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpd2ZrY2JjcGxncmJxaGphcWJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1Njk3NjgsImV4cCI6MjA2MzE0NTc2OH0.WjCMyKNWK8mxsE0W9SWJ8uq6mbcPj9HqE_toFv8_mvg"
);

const client = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

async function generateEmbedding(text) {
    console.log('Generating embedding with model: text-embedding-3-small');
    const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    const embedding = response.data[0].embedding;
    console.log(`Generated embedding length: ${embedding.length}`);
    return embedding;
}

// async function updateCandidateEmbeddings() {
//     const { data: candidates, error } = await supabase
//         .from('documents')
//         .select('*')
//         .is('embedding', null);

//     if (error) {
//         console.error('Error fetching candidates:', error);
//         return;
//     }

//     for (const candidate of candidates) {
//         const profileText = `${candidate.candidate_bio} ${candidate.candidate_job_title} ${candidate.industry} ${candidate.job_roles}`;
//         const embedding = await generateEmbedding(profileText);
//         const { error: updateError } = await supabase
//             .from('documents')
//             .update({ embedding: embedding })
//             .eq('id', candidate.id);
//         if (updateError) {
//             console.error('Error updating embedding:', updateError);
//         } else {
//             console.log(`Updated embedding for ${candidate.persons_name}`);
//         }
//     }
// }


async function updateCandidateEmbeddings() {
    // Fetch rows where embedding is null, selecting all columns
    const { data: candidates, error } = await supabase
        .from('documents')
        .select('*')
        .is('embedding', null);

    if (error) {
        console.error('Error fetching candidates:', error);
        return;
    }

    for (const candidate of candidates) {
        // Construct metadata JSON object from all columns, excluding id and embedding
        const metadata = { ...candidate };
        delete metadata.id;
        delete metadata.embedding;

        // Generate profile text for embedding from specific metadata fields
        const profileText = `${metadata.candidate_bio || ''} ${metadata.candidate_job_title || ''} ${metadata.industry || ''} ${metadata.job_roles || ''} ${metadata.desired_rate}`;

        // Generate embedding
        const embedding = await generateEmbedding(profileText);

        // Update the row with metadata and embedding
        const { error: updateError } = await supabase
            .from('documents')
            .update({
                metadata: metadata,
                embedding: embedding
            })
            .eq('id', candidate.id);

        if (updateError) {
            console.error('Error updating metadata and embedding:', updateError);
        } else {
            console.log(`Updated metadata and embedding for ${metadata.persons_name || 'candidate ID ' + candidate.id}`);
        }
    }
}



export async function POST(request) {
  try {
        updateCandidateEmbeddings();

//       const embeddings = await generateEmbedding("Hiring 1 part-time Review Sales Representative for Roof US $10/review commission, LatAm/CEE, Mon/Wed 2-6 PM, Sat 12-4 PM CST, requires English (50), skills (30), low salary (20), using OpenPhone, Gmail, Google Sheets, seeking friendly, reliable candidate with clear English, customer service experience preferred, 2-4 week recruitment, email intro, review interview recording, prefers sweet personality.  The representatives salary will be more than $3000.")
      
// const { data, error } = await supabase.functions.invoke('bright-action', {
//   body: { query: "Hiring 1 part-time Review Sales Representative for Roof US $10/review commission, LatAm/CEE, Mon/Wed 2-6 PM, Sat 12-4 PM CST, requires English (50), skills (30), low salary (20), using OpenPhone, Gmail, Google Sheets, seeking friendly, reliable candidate with clear English, customer service experience preferred, 2-4 week recruitment, email intro, review interview recording, prefers sweet personality.  The representatives salary will be more than $3000." },
// })
//       return NextResponse.json(
//           //   { error: 'Failed to send invitation.' },
//           data
//     //   { status: 400 }
//     );
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation.' },
    //   { status: 400 }
    );
  }
}