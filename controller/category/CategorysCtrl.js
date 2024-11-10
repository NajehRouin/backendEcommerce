const categorys = require("../../models/categoryModel");

const permissionAdmin = require("../../helpers/permissionAdmin");

let categoryCtrl = {
  createCategory: async (req, res) => {
    try {
      const { label, value } = req.body;
      const sessionUserId = req.userId;

      const hasPermission = await permissionAdmin(sessionUserId);
      if (!hasPermission) {
        throw new Error("Permission denied");
      }

      const existingCategory = await categorys.findOne({
        $or: [{ label }, { value }],
      });

      if (existingCategory) {
        throw new Error("Category already exists.");
      }

      const payload = {
        ...req.body,
      };

      const categoryData = new categorys(payload);
      const saveCategory = await categoryData.save();

      res.status(201).json({
        data: saveCategory,
        success: true,
        error: false,
        message: "Category created Successfully!",
      });
    } catch (err) {
      res.json({
        message: err.message || err,
        error: true,
        success: false,
      });
    }
  },
  getAllCategorys: async (req, res) => {
    try {
      let findCategorys = await categorys.find();

      res.status(201).json({
        data: findCategorys,
        success: true,
        error: false,
      });
    } catch (err) {
      res.json({
        message: err.message || err,
        error: true,
        success: false,
      });
    }
  },

  getCategorys: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const allCategorys = await categorys.find().skip(skip).limit(limit);

      const totalCategorys = await categorys.countDocuments();
      res.json({
        message: "All category",
        success: true,
        error: false,
        data: allCategorys,
        page,
        totalPages: Math.ceil(totalCategorys / limit),
        totalCategorys,
      });
    } catch (err) {
      res.status(400).json({
        message: err.message || err,
        error: true,
        success: false,
      });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const sessionUserId = req.userId;
      const hasPermission = await permissionAdmin(sessionUserId);
      if (!hasPermission) {
        throw new Error("Permission denied");
      }

      const { _id, ...resBody } = req.body;

      const updateCategory = await categorys.findByIdAndUpdate(_id, resBody);

      res.json({
        message: "Category update successfully",
        data: updateCategory,
        success: true,
        error: false,
      });
    } catch (err) {
      res.status(400).json({
        message: err.message || err,
        error: true,
        success: false,
      });
    }
  },
};

module.exports = categoryCtrl;
