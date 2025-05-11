
import { config } from 'dotenv';
config();

import '@/ai/flows/auto-tag-files.ts';
import '@/ai/flows/summarize-video-audio.ts';
import '@/ai/flows/shariah-compliance-flow.ts'; // Added new flow
