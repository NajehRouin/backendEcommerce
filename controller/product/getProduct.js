const productModel = require("../../models/productModel")

const getProductController = async (req, res) => {
    try {
      // Récupérer les paramètres de pagination depuis la requête (page et limit)
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      // Récupérer les produits avec pagination et tri par date de création
      const allProduct = await productModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      // Obtenir le nombre total de produits pour calculer le nombre de pages
      const totalProducts = await productModel.countDocuments();
  
      res.json({
        message: "All Product",
        success: true,
        error: false,
        data: allProduct,
        page,
        totalPages: Math.ceil(totalProducts / limit),
        totalProducts,
      });
    } catch (err) {
      res.status(400).json({
        message: err.message || err,
        error: true,
        success: false,
      });
    }
  };
  

module.exports = getProductController