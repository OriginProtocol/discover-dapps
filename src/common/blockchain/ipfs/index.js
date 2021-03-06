import * as helpers from './helpers'
import EmbarkJSService from '../services/embark-service/embark-service'

const checkIPFSAvailability = async () => {
  const isAvailable = await EmbarkJSService.Storage.isAvailable()
  if (!isAvailable) {
    throw new Error('IPFS Storage is unavailable')
  }
}

const uploadImage = async base64Image => {
  const imageFile = [
    {
      files: [helpers.base64ToBlob(base64Image)],
    },
  ]

  return EmbarkJSService.Storage.uploadFile(imageFile)
}

const uploadMetadata = async metadata => {
  const hash = await EmbarkJSService.Storage.saveText(metadata)
  return helpers.getBytes32FromIpfsHash(hash)
}

export const uploadDAppMetadata = async metadata => {
  try {
    await checkIPFSAvailability()

    metadata.image = await uploadImage(metadata.image)
    const uploadedMetadataHash = await uploadMetadata(JSON.stringify(metadata))

    return uploadedMetadataHash
  } catch (error) {
    throw new Error(
      `Uploading DApp metadata to IPFS failed. Details: ${error.message}`,
    )
  }
}

const retrieveMetadata = async metadataBytes32 => {
  const metadataHash = helpers.getIpfsHashFromBytes32(metadataBytes32)
  return EmbarkJSService.Storage.get(metadataHash)
}

const retrieveImageUrl = async imageHash => {
  return EmbarkJSService.Storage.getUrl(imageHash)
}

export const retrieveDAppMetadataByHash = async metadataBytes32 => {
  try {
    await checkIPFSAvailability()

    const metadata = JSON.parse(await retrieveMetadata(metadataBytes32))
    metadata.image = await retrieveImageUrl(metadata.image)

    return metadata
  } catch (error) {
    throw new Error(
      `Fetching metadata from IPFS failed. Details: ${error.message}`,
    )
  }
}
