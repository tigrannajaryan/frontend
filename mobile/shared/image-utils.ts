/**
 * Converts a base64 string to a file.
 * @param url base64
 * @param filename name of the file
 * @param mimeType mme type of the file
 * @returns Promise with file
 */
export function urlToFile(url: string, filename: string, mimeType?): Promise<File> {
  mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
  return (fetch(url).catch(e => {
    throw e;
  })
    .then(res => res.arrayBuffer())
    .then(buf => new File([buf], filename, {type: mimeType})));
}

/**
 * @param imageUri uri of the original image file
 * @returns uri of downscaled image file
 */
export function downscalePhoto(imageUri: string): Promise<string> {
  return new Promise((resolve: Function, reject: Function) => {
    const maxDimension = 512;
    const downscaleQuality = 0.7;

    // Use canvas to draw downscaled image on it
    const canvas: any = document.createElement('canvas');

    // Load the original image
    const image = new Image();

    image.onload = () => {
      try {
        let width = image.width;
        let height = image.height;

        // Enforce max dimensions
        if (width > height) {
          if (width > maxDimension) {
            height *= maxDimension / width;
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width *= maxDimension / height;
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Draw original image downscaled
        ctx.drawImage(image, 0, 0, width, height);

        // And get the result with required quality
        const dataUri = canvas.toDataURL('image/jpeg', downscaleQuality);

        resolve(dataUri);
      } catch (e) {
        reject(e);
      }
    };
    image.src = imageUri;
  });
}
