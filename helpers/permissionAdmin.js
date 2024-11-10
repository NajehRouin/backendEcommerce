const userModel = require("../models/userModel");

const permissionAdmin = async (userId) => {
  try {
    const user = await userModel.findById(userId);

    // Vérifier si l'utilisateur existe
    if (!user) {
      console.error("Please Login...!");
      return false;
    }

    // Vérifier si l'utilisateur a le rôle 'ADMIN'
    return user.role=== 'ADMIN';
  } catch (error) {
    console.error("Permission denied..", error.message);
    return false;
  }
};

module.exports = permissionAdmin;
