const userModel = require("../../models/userModel")

async function allUsers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1; // Page par défaut 1
        const limit = parseInt(req.query.limit) || 10; // Limite par défaut 10
        const skip = (page - 1) * limit; // Calculer le nombre d'utilisateurs à ignorer

        // Trouver tous les utilisateurs avec pagination
        const allUsers = await userModel.find({ role: "GENERAL" })
            .skip(skip)
            .limit(limit);

        // Compter le nombre total d'utilisateurs pour la pagination
        const totalUsers = await userModel.countDocuments({ role: "GENERAL" });
        const totalPages = Math.ceil(totalUsers / limit); // Calculer le nombre total de pages

        res.json({
            message: "All Users",
            data: allUsers,
            success: true,
            error: false,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalUsers: totalUsers,
                limit: limit,
            },
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false,
        });
    }
}

module.exports = allUsers