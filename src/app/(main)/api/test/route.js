import { createClient } from '@supabase/supabase-js';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

const supabaseUrl = 'https://poxmottgdopovdlfcjgt.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBveG1vdHRnZG9wb3ZkbGZjamd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDgyNTAsImV4cCI6MjA2MjQ4NDI1MH0.TEqi7aeGnbm6upaXUD8jTOTWO2Jm22yCaOAikHLsBAA'; // Replace with your Supabase Anon/Public Key
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateEmbedding(text) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}

async function updateCandidateEmbeddings() {
    const { data: candidates, error } = await supabase
        .from('candidates')
        .select('*')
        .is('embedding', null);

    if (error) {
        console.error('Error fetching candidates:', error);
        return;
    }

    for (const candidate of candidates) {
        const profileText = `${candidate.candidate_bio} ${candidate.candidate_job_title} ${candidate.industry} ${candidate.job_roles} ${candidate.english_accent} ${candidate.internal_candidate_notes}`;
        const embedding = await generateEmbedding(profileText);
        console.log(`Embedding length: ${embedding.length}`);
        console.log(embedding);
        const { error: updateError } = await supabase
            .from('candidates')
            .update({ embedding: embedding })
            .eq('id', candidate.id);
        if (updateError) {
            console.error('Error updating embedding:', updateError);
        } else {
            console.log(`Updated embedding for ${candidate.persons_name}`);
        }
    }
}

export async function POST(request) {
  try {
   updateCandidateEmbeddings()
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation.' },
      { status: 400 }
    );
  }
}