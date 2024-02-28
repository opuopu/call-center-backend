const fs = require("fs");
const util = require("util");
const unlinkSync = util.promisify(fs.unlink);
// async function unlinkImage(imagePath) {
//   console.log("imagePath", imagePath);
//   try {
//     await fs.promises.unlink(imagePath);
//     console.log(`File ${imagePath} deleted successfully`);
//   } catch (err) {
//     console.error(`Error deleting the file ${imagePath}:`, err);
//   }
// }
const unlinkImage = async (path) => {
  const modifiedPath = `./public/${path}`;
  try {
    if (fs.existsSync(modifiedPath)) {
      console.log("path found ");
      await unlinkSync(modifiedPath);
    }
  } catch (err) {
    throw new Error(`Error deleting file: ${err.message}`);
  }
};

module.exports = unlinkImage;
