// Turning a chosen file into something we can actually store.
//
// There is no upload server, so a photo has to live in the saved state as a
// data URL. A phone photo is 3–8 MB, and localStorage gives us about 5 MB for
// everything, so the file is drawn to a canvas, scaled down and re-encoded
// until it fits a budget. Quality is dropped first, then dimensions.

const MAX_EDGE = 900 // plenty for a 5:4 card at 2x
const BUDGET = 240_000 // ~240 KB of base64 per dish
const QUALITIES = [0.82, 0.7, 0.6, 0.5]

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as an image.'))
    }
    img.src = url
  })
}

function draw(img, edge) {
  const scale = Math.min(1, edge / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  // White underneath, because transparent PNGs go black once flattened to JPEG.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

export async function fileToDataUrl(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file — JPG, PNG or WebP.')
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('That image is over 12 MB. Try a smaller one.')
  }

  const img = await loadImage(file)

  for (const edge of [MAX_EDGE, 700, 540]) {
    const canvas = draw(img, edge)
    for (const quality of QUALITIES) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      if (dataUrl.length <= BUDGET) return dataUrl
    }
  }

  // Nothing got it under budget — return the smallest attempt rather than fail.
  return draw(img, 480).toDataURL('image/jpeg', 0.5)
}

export const isDataUrl = (value = '') => value.startsWith('data:')

export const approxKb = (dataUrl = '') => Math.round((dataUrl.length * 0.75) / 1024)
