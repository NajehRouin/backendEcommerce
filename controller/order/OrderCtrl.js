let Orders = require("../../models/orderModel");
const addToCartModel = require("../../models/cartProduct");
const userModel = require("../../models/userModel");
const nodemailer = require("nodemailer");

let orderCtlr = {
  placeOnOrder: async (req, res) => {
    try {
      const date = new Date();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      const currentUser = req.userId;

      const findUser = await userModel.findById(req.userId);

      const findProducts = await addToCartModel
        .find({ userId: currentUser })
        .populate("productId");
      let ArrayProduct = [];
      if (findProducts.length != 0) {
        findProducts.map((e) => {
          ArrayProduct.push({
            productId: e?.productId?._id,
            quantity: e?.quantity,
          });
        });
        const totalQty = findProducts.reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.quantity,
          0
        );
        const totalPrice = findProducts.reduce(
          (preve, curr) =>
            preve + curr.quantity * curr?.productId?.sellingPrice,
          0
        );

        let newOrders = new Orders({
          NumberOrder: `${month}/${year}`,
          userId: currentUser,
          products: ArrayProduct,
          totalQty: totalQty,
          totalPrice: totalPrice,
        });
        await newOrders.save();

        const emailResult = await sendToUserMial(
          findUser?.email,
          "order Number " + `${month}/${year}`,

          `
            <h2>Your order has been successfully sent!</h2>
            <p>Your order number is: <strong>${month}/${year}</strong></p>
            <p>Please wait for acceptance from the administration.</p>
            <p>Thank you for your participation, and we hope to earn your trust.</p>
            <p>For more information about your order, please check your account. Click the link below:</p>
            <p><a href="http://localhost:3000/user-panel/my-order">View your order</a></p>
            <p>Cordialement,</p>
          <p>MYZ</p>
          `
        );

        // Vérifiez si l'email a été envoyé avec succès
        if (!emailResult.success) {
          console.error(
            "Erreur lors de l'envoi de l'email: ",
            emailResult.error
          );
          return res.status(500).send("Erreur lors de l'envoi de l'email");
        } else {
          console.log("envoi de l'email à : ", emailResult?.response);
        }

        res.json({
          data: newOrders,
          message: "Order Placed Successfully",
          success: true,
          error: false,
        });
        await addToCartModel.deleteMany({ userId: currentUser });
      }
    } catch (err) {
      res.json({
        message: err?.message || err,
        error: true,
        success: false,
      });
    }
  },


  //get All Order by current User connected 
  getOrderUser: async (req, res) => {
    try {
      const currentUser = req.userId;
  
      // Récupérer les paramètres de requête pour la pagination
      const page = parseInt(req.query.page) || 1; // Page actuelle (par défaut à 1)
      const limit = parseInt(req.query.limit) || 10; // Nombre d'éléments par page (par défaut à 10)
      const skip = (page - 1) * limit; // Calculer le nombre d'éléments à sauter
  
      // Récupérer les commandes de l'utilisateur avec pagination
      const findOrders = await Orders.find({ userId: currentUser })
        .skip(skip)
        .limit(limit)
        .populate("products.productId", "productName price sellingPrice category");
  
      // Compter le nombre total de commandes pour calculer le nombre total de pages
      const totalOrders = await Orders.countDocuments({ userId: currentUser });
  
      res.json({
        data: findOrders,
        success: true,
        error: false,
        pagination: {
          totalOrders, // Nombre total de commandes
          totalPages: Math.ceil(totalOrders / limit), // Nombre total de pages
          currentPage: page, // Page actuelle
        },
      });
    } catch (err) {
      res.json({
        message: err?.message || err,
        error: true,
        success: false,
      });
    }
  },
  




  getAllOrder: async (req, res) => {
    try {
      // Récupérer les paramètres de pagination depuis la requête (page et limit)
    

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      // Récupérer les commandes avec pagination
      let findOrders = await Orders.find()
        .populate("userId")
        .populate(
          "products.productId",
          "productName price sellingPrice category"
        )
        .skip(skip)
        .limit(limit);
  
      // Obtenir le nombre total de commandes pour calculer le nombre de pages
      const totalOrders = await Orders.countDocuments();
  
      res.json({
        data: findOrders,
        success: true,
        error: false,
        page,
        totalPages: Math.ceil(totalOrders / limit),
        totalOrders,
      });
    } catch (err) {
      res.status(400).json({
        message: err?.message || err,
        error: true,
        success: false,
      });
    }
  },
  



  UpdateStateOrder: async (req, res) => {
    try {
      const { orderId, state } = req.body;

      // Récupérer la commande
      const findorder = await Orders.findById(orderId).populate('userId','email');

      if (findorder.etat === "Submitted" && state !== "Validation") {
        throw new Error("choose the validation option");
      }

      if (findorder.etat === "Validation" && state !== "Order Sent") {
        throw new Error("choose the order sent option");
      }

      // Définir les différentes conditions de validation
      const conditions = {
        "Order Sent-Validation": "Order already sent",
        "Order received-Order Sent": "Order already received",
        "Order received-Validation": "Order already received",
        "Order Return-Validation": "Order already validated",
        "Order Return-Order received":
          "If you want to send the order, choose the 'Sent Order' option",
      };

      // Construire la clé pour vérifier les conditions
      const conditionKey = `${findorder.etat}-${state}`;
      if (conditions[conditionKey]) {
        throw new Error(conditions[conditionKey]);
      }


      if(state==="Order Sent"){

        const emailResult = await sendToUserMial(
          findorder?.userId?.email,
          "sent order Number " + findorder?.NumberOrder,

          `
            <h2>Your order has been successfully sent!</h2>
            <p>Your order number is: <strong>${findorder?.NumberOrder}</strong></p>
            <p>Your order has been sent to you and will reach via the delivery person</p>
            <p> <strong>Please you do not turn off your phone so that the delivery person can contact you </strong></p>
            <p>For more information about your order, please check your account. Click the link below:</p>
            <p><a href="http://localhost:3000/user-panel/my-order">View your order</a></p>
            <p>Cordialement,</p>
            <p>MYZ</p>
          `
        );

        // Vérifiez si l'email a été envoyé avec succès
        if (!emailResult.success) {
          console.error(
            "Erreur lors de l'envoi de l'email: ",
            emailResult.error
          );
          return res.status(500).send("Erreur lors de l'envoi de l'email");
        } else {
          console.log("envoi de l'email à : ", emailResult?.response);
        }


      }

      // Mise à jour de la commande si toutes les conditions sont respectées
      const payload = { etat: state };
      const updateOrder = await Orders.findByIdAndUpdate(orderId, payload);

      return res.json({
        data: updateOrder,
        message: "State Order Updated",
        success: true,
        error: false,
      });
    } catch (err) {
      return res.status(302).json({
        message: err.message || err,
        error: true,
        success: false,
      });
    }
  },



  getOrederById: async (req, res) => {
    try {
      const { orderId } = req.body;
      const findOrder = await Orders.findById(orderId)
        .populate(
          "userId",
          "-_id -password -profilePic -createdAt -updatedAt -role -__v"
        )
        .populate(
          "products.productId",
          "productName price sellingPrice category"
        );
      res.json({
        data: findOrder,

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


  // grouped order by month
  ordersByMonth: async (req, res) => {
    try {
      const findOrdes = await Orders.aggregate([
        {
          // Extract month and year from the 'NumberOrder' field
          $group: {
            _id: "$NumberOrder",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by month/year
        },
      ]);

      res.json({
        data: findOrdes,

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


  // number order by month current
  orderbyCurrentMonth: async (req, res) => {
    try {
      const now = new Date();
      const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0"); // "mm"
      const currentYear = now.getFullYear(); // "yyyy"
      const currentMonthYear = `${currentMonth}/${currentYear}`; // "mm/yyyy"

      // Find orders where NumberOrder matches the current month/year
      const orders = await Orders.find({
        NumberOrder: currentMonthYear,
      });
      res.json({
        data: orders.length,

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



  // number order received by month current
  orderReceivedMonthCurrent: async (req, res) => {
    try {
      const now = new Date();
      const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0"); // "mm"
      const currentYear = now.getFullYear(); // "yyyy"
      const currentMonthYear = `${currentMonth}/${currentYear}`; // "mm/yyyy"

      // Find orders where NumberOrder matches the current month/year
      const orders = await Orders.find({
        NumberOrder: currentMonthYear,
        etat: "Order received",
      });
      res.json({
        data: orders.length,

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



  // number order received
  orderReceived: async (req, res) => {
    try {
      const orders = await Orders.find({
        etat: "Order received",
      });
      res.json({
        data: orders.length,

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



  // number order return by month current
  orderReturnMonthCurrent: async (req, res) => {
    try {
      const now = new Date();
      const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0"); // "mm"
      const currentYear = now.getFullYear(); // "yyyy"
      const currentMonthYear = `${currentMonth}/${currentYear}`; // "mm/yyyy"

      // Find orders where NumberOrder matches the current month/year
      const orders = await Orders.find({
        NumberOrder: currentMonthYear,
        etat: "Order Return",
      });
      res.json({
        data: orders.length,

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



  // number order return
  orderReturn: async (req, res) => {
    try {
      const orders = await Orders.find({
        etat: "Order Return",
      });
      res.json({
        data: orders.length,

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


  // number product in order received by month current
  productReceivedMonthCurrent: async (req, res) => {
    try {
      const now = new Date();
      const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0"); // "mm"
      const currentYear = now.getFullYear(); // "yyyy"
      const currentMonthYear = `${currentMonth}/${currentYear}`; // "mm/yyyy"

      let totalProduct = 0;
      // Find orders where NumberOrder matches the current month/year
      const orders = await Orders.find({
        NumberOrder: currentMonthYear,
        etat: "Order received",
      });
      if (orders.length !== 0) {
        for (let i = 0; i < orders.length; i++) {
          totalProduct = totalProduct + orders[i].totalQty;
        }
      } else {
        totalProduct = 0;
      }
      res.json({
        data: totalProduct,

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



  // number product in order received

  productReceived: async (req, res) => {
    try {
      let totalProduct = 0;

      const orders = await Orders.find({
        etat: "Order received",
      });
      if (orders.length !== 0) {
        for (let i = 0; i < orders.length; i++) {
          totalProduct = totalProduct + orders[i].totalQty;
        }
      } else {
        totalProduct = 0;
      }
      res.json({
        data: totalProduct,

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



  // number product in order return
  productReturn: async (req, res) => {
    try {
      let totalProduct = 0;

      const orders = await Orders.find({
        etat: "Order Return",
      });
      if (orders.length !== 0) {
        for (let i = 0; i < orders.length; i++) {
          totalProduct = totalProduct + orders[i].totalQty;
        }
      } else {
        totalProduct = 0;
      }
      res.json({
        data: totalProduct,

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

  // number product in order return  by month current
  productReturnMonthCurrent: async (req, res) => {
    try {
      const now = new Date();
      const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0"); // "mm"
      const currentYear = now.getFullYear(); // "yyyy"
      const currentMonthYear = `${currentMonth}/${currentYear}`; // "mm/yyyy"

      let totalProduct = 0;
      // Find orders where NumberOrder matches the current month/year
      const orders = await Orders.find({
        NumberOrder: currentMonthYear,
        etat: "Order Return",
      });
      if (orders.length !== 0) {
        for (let i = 0; i < orders.length; i++) {
          totalProduct = totalProduct + orders[i].totalQty;
        }
      } else {
        totalProduct = 0;
      }
      res.json({
        data: totalProduct,

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

  //calculate the total for each month

  calculateTotal: async (req, res) => {
    try {
      const findOrdes = await Orders.aggregate([
        {
          $match: {
            etat: "Order received", // Filtrer par état "Order received"
          },
        },
        {
          $group: {
            _id: "$NumberOrder", // Grouper par le champ NumberOrder
            totalPrice: { $sum: "$totalPrice" }, // Somme des totalPrice
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.json({
        data: findOrdes,

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

  calculateProfits: async (req, res) => {
    try {
      const findOrders = await Orders.aggregate([
        {
          $match: {
            etat: "Order received", // Filter by status "Order received"
          },
        },
        {
          $lookup: {
            from: "products", // The name of your products collection
            localField: "products.productId", // Field in the orders documents that matches with product IDs
            foreignField: "_id", // Field in the products documents
            as: "productDetails", // Name of the new field to add the joined documents
          },
        },
        {
          $unwind: {
            path: "$productDetails",
            preserveNullAndEmptyArrays: true, // Keeps the grouping even if there's no product match
          },
        },
        {
          $group: {
            _id: "$NumberOrder", // Group by the NumberOrder field
            Price: { $sum: "$productDetails.price" },
            sellingPrice: { $sum: "$productDetails.sellingPrice" }, // Use $first to get the totalPrice without summing it

            total: {
              $sum: {
                $subtract: [
                  "$productDetails.sellingPrice",
                  "$productDetails.price",
                ],
              },
            },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by NumberOrder
        },
      ]);

      res.json({
        data: findOrders,
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

const sendToUserMial = async (to, subject, text) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.mail,
      pass: process.env.password, // Assurez-vous d'utiliser un mot de passe d'application ici
    },
  });

  let mailOptions = {
    from: process.env.mail,
    to,
    subject,
    html: text,
  };

  try {
    // Envoyer l'email
    let info = await transporter.sendMail(mailOptions);

    return { success: true, response: info.response }; // Retourner le succès
  } catch (error) {
    return { success: false, error: error }; // Retourner l'erreur
  }
};

module.exports = orderCtlr;
