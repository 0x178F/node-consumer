import zlib from 'zlib';

/**
 * Compressing JSON data
 *
 * @param {Array<object>} jsonData - The array of objects representing the JSON data to compress.
 * @returns {Buffer} - The compressed data as a Buffer.
 */
export const compressJSON = (jsonData) => {
  const jsonString = JSON.stringify(jsonData);
  const compressedData = zlib.deflateRawSync(jsonString);
  return compressedData;
};

/**
 * Decompresses compressed data.
 *
 * @param {Buffer} compressedData - The compressed data as a Buffer.
 * @returns {Array<object>} - The decompressed JSON data as an array of objects.
 */
export const decompressJSON = (compressedData) => {
  const decompressedData = zlib.inflateRawSync(compressedData);
  const jsonString = decompressedData.toString();
  const jsonData = JSON.parse(jsonString);
  return jsonData;
};

/**
 * Measures the compression ratio of a JSON data object.
 *
 * @param {Object} jsonData - The JSON data object to measure the size of.
 * @returns {Object} An object containing the original size and compressed size.
 */
export const measureCompression = (jsonData) => {
  const jsonString = JSON.stringify(jsonData);

  const originalSize = Buffer.byteLength(jsonString, 'utf8');

  const compressedData = zlib.deflateRawSync(jsonString);
  const compressedSize = compressedData.length;

  return { originalSize, compressedSize };
};
