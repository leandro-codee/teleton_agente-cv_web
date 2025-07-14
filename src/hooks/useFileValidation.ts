import { useCallback } from 'react'
import { FILE_TYPES, MAX_FILE_SIZE } from '@/lib/constants'

export function useFileValidation() {
    const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
        // Check file type
        const allowedTypes = Object.values(FILE_TYPES)
        if (!allowedTypes.includes(file.type as any)) {
            return {
                isValid: false,
                error: 'Tipo de archivo no permitido. Solo se aceptan PDF, DOC y DOCX.'
            }
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                isValid: false,
                error: `El archivo es demasiado grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB.`
            }
        }

        return { isValid: true }
    }, [])

    const validateFiles = useCallback((files: File[]): {
        validFiles: File[],
        invalidFiles: Array<{ file: File, error: string }>
    } => {
        const validFiles: File[] = []
        const invalidFiles: Array<{ file: File, error: string }> = []

        files.forEach(file => {
            const validation = validateFile(file)
            if (validation.isValid) {
                validFiles.push(file)
            } else {
                invalidFiles.push({ file, error: validation.error! })
            }
        })

        return { validFiles, invalidFiles }
    }, [validateFile])

    return { validateFile, validateFiles }
}