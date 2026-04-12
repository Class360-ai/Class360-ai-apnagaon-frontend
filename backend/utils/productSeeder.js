const Product = require("../models/Product");
const { SAMPLE_PRODUCTS, normalizeSeedProduct } = require("./seedProducts");

const buildSeedDocuments = (shopId = null) =>
  SAMPLE_PRODUCTS.map((product) => ({
    ...normalizeSeedProduct(product),
    shopId,
  }));

const seedProductsInDatabase = async ({ shopId = null } = {}) => {
  const documents = buildSeedDocuments(shopId);
  await Product.deleteMany({});
  const inserted = await Product.insertMany(documents);
  return inserted;
};

module.exports = {
  buildSeedDocuments,
  seedProductsInDatabase,
};
