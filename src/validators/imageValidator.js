import sharp from 'sharp';

const maxSize = 2 * 1024 * 1024;
const extAcceptable = ['png', 'jpg', 'jpeg', 'webp'];

export const imageValiation = async (file) => {
  if (file.size > maxSize) {
    const resizedImage = await sharp(file.data).resize(1024).toBuffer();
    file.size = resizedImage.length;
    file.data = resizedImage;
  }

  const imgExtension = file.mimetype.split('/')[1];

  if (!extAcceptable.includes(imgExtension)) {
    return {
      status: false,
      message: `Only image with extension '${extAcceptable.join(', ')}' are acceptable!`,
    };
  }

  if (file.size > maxSize) {
    return { status: false, message: 'File size is too much large!' };
  }

  return { status: true, message: 'Image is acceptable', file: file };
};
