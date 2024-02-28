const createFileDetails = (folderName, filename) => {
  return `/uploads/${folderName}/${filename}`;
};
module.exports = { createFileDetails };
