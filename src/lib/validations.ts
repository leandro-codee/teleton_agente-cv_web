import { z } from 'zod'

export const cvUploadSchema = z.object({
    filename: z.string().min(1, 'Filename is required'),
    gcs_path: z.string().min(1, 'GCS path is required'),
})

export const ddcUploadSchema = z.object({
    filename: z.string().min(1, 'Filename is required'),
    gcs_path: z.string().min(1, 'GCS path is required'),
})

export const processingParamsSchema = z.object({
    profession_weight: z.number().min(0).max(1),
    experience_weight: z.number().min(0).max(1),
    skills_weight: z.number().min(0).max(1),
}).refine((data) => {
    const total = data.profession_weight + data.experience_weight + data.skills_weight
    return Math.abs(total - 1) < 0.01
}, {
    message: 'Weights must sum to 1.0',
})

export const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})