const imageAssetCache = new Map()

function createImageAssetRecord(url) {
  const image = new Image()
  const record = {
    error: null,
    promise: null,
    status: 'pending',
    value: null,
  }

  image.decoding = 'async'

  record.promise = new Promise((resolve, reject) => {
    image.onload = () => {
      record.status = 'resolved'
      record.value = image
      resolve(image)
    }

    image.onerror = (error) => {
      record.status = 'rejected'
      record.error = error
      reject(error)
    }
  })

  image.src = url
  return record
}

export function readImageAsset(url) {
  let record = imageAssetCache.get(url)

  if (!record) {
    record = createImageAssetRecord(url)
    imageAssetCache.set(url, record)
  }

  if (record.status === 'rejected') {
    throw record.error
  }

  if (record.status === 'pending') {
    throw record.promise
  }

  return record.value
}
