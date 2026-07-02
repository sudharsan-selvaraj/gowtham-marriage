import { supabase } from './supabase'

/**
 * Uploads a file to Cloudflare R2 using a short-lived presigned URL that is
 * minted by the `r2-upload-url` Supabase Edge Function.
 *
 * Flow (keeps R2 secret keys server-side):
 *   1. Ask the Edge Function for a presigned PUT url (requires being logged in).
 *   2. PUT the file straight to R2 from the browser.
 *   3. Return the public URL to store in Postgres.
 *
 * @param {File} file
 * @param {string} folder  e.g. "gallery", "shopping"
 * @param {(pct:number)=>void} [onProgress]
 * @returns {Promise<{publicUrl:string, key:string}>}
 */
export async function uploadToR2(file, folder = 'gallery', onProgress) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'

  const { data, error } = await supabase.functions.invoke('r2-upload-url', {
    body: {
      folder,
      contentType: file.type || 'application/octet-stream',
      ext,
    },
  })

  if (error) throw new Error(`Could not get upload URL: ${error.message}`)
  const { uploadUrl, publicUrl, key } = data

  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`))
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(file)
  })

  return { publicUrl, key }
}
