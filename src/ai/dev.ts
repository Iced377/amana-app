
import { config } from 'dotenv';
config();

import '@/ai/flows/auto-tag-files.ts';
import '@/ai/flows/summarize-video-audio.ts';
import '@/ai/flows/shariah-compliance-flow.ts'; // Added new flow
import '@/ai/flows/detect-duplicate-file.ts'; // Added duplicate detection flow
import '@/ai/flows/classify-islamic-estate-assets.ts'; // Added Islamic estate asset classification flow

