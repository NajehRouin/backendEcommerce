const express = require('express')

const router = express.Router()

const userSignUpController = require("../controller/user/userSignUp")
const userSignInController = require('../controller/user/userSignIn')
const userDetailsController = require('../controller/user/userDetails')
const authToken = require('../middleware/authToken')


const userLogout = require('../controller/user/userLogout')
const allUsers = require('../controller/user/allUsers')
const updateUser = require('../controller/user/updateUser')
const UploadProductController = require('../controller/product/uploadProduct')
const getProductController = require('../controller/product/getProduct')
const updateProductController = require('../controller/product/updateProduct')
const getCategoryProduct = require('../controller/product/getCategoryProductOne')
const getCategoryWiseProduct = require('../controller/product/getCategoryWiseProduct')
const getProductDetails = require('../controller/product/getProductDetails')
const addToCartController = require('../controller/user/addToCartController')
const countAddToCartProduct = require('../controller/user/countAddToCartProduct')
const addToCartViewProduct  = require('../controller/user/addToCartViewProduct')
const updateAddToCartProduct = require('../controller/user/updateAddToCartProduct')
const deleteAddToCartProduct = require('../controller/user/deleteAddToCartProduct')
const searchProduct = require('../controller/product/searchProduct')
const filterProductController = require('../controller/product/filterProduct')
const userByMonth =require('../controller/user/userByMonth')

const OrdersCtrl = require('../controller/order/OrderCtrl')
const categoryCtrl = require('../controller/category/CategorysCtrl')
const updateProfilUser = require('../controller/user/updateProfilUser')
const resetPassword = require('../controller/user/resetPassword')
const updatePassword = require('../controller/user/updatePassword')



router.post("/signup",userSignUpController)
router.post("/signin",userSignInController)
router.get("/user-details",authToken,userDetailsController)
router.get("/userLogout",userLogout)
router.get('/userByMonth',userByMonth)

router.post('/updateProfilUser',authToken,updateProfilUser)

router.post('/resetPassword',resetPassword)
router.post('/updatePassword',authToken,updatePassword)

//admin panel 
router.get("/all-user",authToken,allUsers)
router.post("/update-user",authToken,updateUser)

//category

router.post('/create-category',authToken,categoryCtrl.createCategory)
router.get('/all-category',categoryCtrl.getAllCategorys)
router.get('/category',categoryCtrl.getCategorys)
router.post('/update-category',authToken,categoryCtrl.updateCategory)
//product
router.post("/upload-product",authToken,UploadProductController)
router.get("/get-product",getProductController)
router.post("/update-product",authToken,updateProductController)
router.get("/get-categoryProduct",getCategoryProduct)
router.post("/category-product",getCategoryWiseProduct)
router.post("/product-details",getProductDetails)
router.get("/search",searchProduct)
router.post("/filter-product",filterProductController)







//user add to cart
router.post("/addtocart",authToken,addToCartController)
router.get("/countAddToCartProduct",authToken,countAddToCartProduct)
router.get("/view-card-product",authToken,addToCartViewProduct)
router.post("/update-cart-product",authToken,updateAddToCartProduct)
router.post("/delete-cart-product",authToken,deleteAddToCartProduct)

// user Order

router.post('/order',authToken,OrdersCtrl.placeOnOrder)
router.get('/order-user',authToken,OrdersCtrl.getOrderUser)
router.get('/all-order',OrdersCtrl.getAllOrder)
router.post("/state-order",OrdersCtrl.UpdateStateOrder)
router.post('/order-ById',OrdersCtrl.getOrederById)
router.get('/ordersByMonth',OrdersCtrl.ordersByMonth)
router.get('/ordersByCurrentMonth',OrdersCtrl.orderbyCurrentMonth)
router.get('/orderReceivedMonthCurrent',OrdersCtrl.orderReceivedMonthCurrent)
router.get('/orderReceived',OrdersCtrl.orderReceived)

router.get('/orderReturnMonthCurrent',OrdersCtrl.orderReturnMonthCurrent)
router.get('/orderReturn',OrdersCtrl.orderReturn)


router.get('/productReceivedMonthCurrent',OrdersCtrl.productReceivedMonthCurrent)
router.get('/productReceived',OrdersCtrl.productReceived)
router.get('/productReturn',OrdersCtrl.productReturn)
router.get('/productReturnMonthCurrent',OrdersCtrl.productReturnMonthCurrent)

router.get('/calculateTotal',OrdersCtrl.calculateTotal)
router.get('/calculateProfits',OrdersCtrl.calculateProfits)


module.exports = router