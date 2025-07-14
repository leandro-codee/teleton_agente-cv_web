import { v4 as uuidv4 } from 'uuid'

const GCS_BUCKET = process.env.NEXT_PUBLIC_GCS_BUCKET || 'your-bucket-name'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export async function generateSignedUrl(fileName: string, contentType: string, folder: string = 'cvs') {
    const token = localStorage.getItem('auth_token')
    const uuid = uuidv4()
    const extension = fileName.split('.').pop()
    const gcsPath = `${folder}/${uuid}-${Date.now()}.${extension}`

    const response = await fetch(`${API_BASE_URL}/generate-signed-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
            fileName: gcsPath,
            contentType,
        }),
    })

    if (!response.ok) {
        throw new Error('Error generating signed URL')
    }

    const { url } = await response.json()
    return { url, gcsPath }
}

export async function uploadToGCS(file: File, signedUrl: string, onProgress?: (progress: number) => void) {
    return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = (event.loaded / event.total) * 100
                onProgress(progress)
            }
        })

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                resolve()
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`))
            }
        })

        xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'))
        })

        xhr.open('PUT', signedUrl)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
    })
}