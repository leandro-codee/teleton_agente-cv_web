export const FILE_TYPES = {
    PDF: 'application/pdf',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DOC: 'application/msword',
  } as const
  
  export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  export const MAX_FILES_BATCH = 1000
  
  export const SCORE_THRESHOLDS = {
    EXCELLENT: 0.8,
    GOOD: 0.6,
    FAIR: 0.4,
  } as const
  
  export const DEFAULT_WEIGHTS = {
    PROFESSION: 0.333,
    EXPERIENCE: 0.333,
    SKILLS: 0.334,
  } as const