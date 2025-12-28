import { z } from 'zod';

export const sourceBookSchema = z.object({
    id: z.string().optional(),
    kitab_name: z.string().min(1, 'Nama kitab harus diisi'),
    details: z.string().optional(),
    order_index: z.number(),
});

export const fiqhEntrySchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, 'Judul harus minimal 3 karakter'),
    question_text: z.string().optional(),
    answer_summary: z.string().optional(),
    ibarat_text: z.string().optional(),
    source_books: z.array(sourceBookSchema).optional(),
    musyawarah_source: z.string().optional(),
    entry_type: z.enum(['rumusan', 'ibarat', 'makalah']),
}).superRefine((data, ctx) => {
    // Validation for Rumusan & Ibarat
    if (data.entry_type === 'rumusan' || data.entry_type === 'ibarat') {
        if (!data.answer_summary || data.answer_summary.length < 10) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ringkasan jawaban harus minimal 10 karakter",
                path: ["answer_summary"]
            });
        }
        if (!data.ibarat_text || data.ibarat_text.length < 5) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Teks ibarat harus diisi",
                path: ["ibarat_text"]
            });
        }
        if (!data.source_books) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Sumber kitab harus valid",
                path: ["source_books"]
            });
        }
    }

    // Validation for Makalah
    if (data.entry_type === 'makalah') {
        if (!data.ibarat_text || data.ibarat_text.length < 5) { // 'Isi' uses ibarat_text
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Isi makalah harus diisi",
                path: ["ibarat_text"]
            });
        }
        // User requested 'sumber' field for makalah. We map it to musyawarah_source.
        // Assuming it's optional unless specified "wajib isi".
    }
});

export type FiqhEntryValues = z.infer<typeof fiqhEntrySchema>;
