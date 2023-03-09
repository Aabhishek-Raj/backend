const asyncHandler = require('express-async-handler')
const Food = require('../models/foodSchema')
const { uploadFile } = require('../s3')

// @desc Create new food
// @route POST /create
// @access Private
module.exports.createFood = asyncHandler(async (req, res) => {
    const { name, variety, price, category } = req.body
    const image = req.file

    if (!name || !variety || !image) {
        return res.status(400).json({ message: 'All Fields are required' })
    }

    const result = await uploadFile(image)

    if (!result?.Key) {
        return res.status(400).json({message: "Add another image"})
    }

    const food = await Food.create({ supplierId: req.supplier.supplierId, name, variety, price, image: result.Key })

    if (food) {
        res.status(200).json(food)
    } else {
        res.status(400).json({ message: "Invalid details" })
    }
})

// @desc To get foods
// @route POST /getfoods
// @access Private
module.exports.getFoods = asyncHandler( async (req, res) => {

    const foods = await Food.find({supplierId: req.supplier.supplierId}).lean()

    if(!foods?.length){
        return res.status(400).json({message: 'No Foods are Created'})
    }
    
    res.status(200).json(foods)
})

// @desc Get each supplier food for user
// @route GET /suppliersfood
// @access Private
module.exports.getSupplierFoods = asyncHandler( async (req, res) => {

    const { supplierId } = req.query

    const foods = await Food.find({supplierId}).lean().exec()

    if(!foods?.length){
        return res.status(400).json({message: "No foods are available for this supplier"})
    }

    res.status(200).json(foods)

})

// @desc To delete food
// @route DELETE /deletefood
// @access Private
module.exports.deleteItems = asyncHandler( async (req, res) => {
    const {foodId} = req.query

    if(!foodId){
        return res.status(400).json({message: "Food Id required"})
    }

    const food = await Food.findById(foodId).exec()

    if(!food){
        return res.status(400).json({message: "Food Item not found"})
    }

    const deleted = await food.deleteOne()
     
    console.log(`deleted ${deleted._id} of name ${deleted.name}`)

    res.status(200).json({message: `Food ${deleted.name} has been deleted`, id: foodId})
}) 

//@desc Get foods by searching
//@route GET /foodsearch
//@access Private
module.exports.foodSearch = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ]
    } : {}

    const supplier = await Food.find(keyword)

    res.status(200).json(supplier)
})
