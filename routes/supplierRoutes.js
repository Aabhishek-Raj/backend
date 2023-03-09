const express = require('express')
const router = express.Router()
const supplierController = require('../controllers/supplierController')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })
const { supplierProtect } = require('../middleware/authMiddleware')

// const cpUpload = upload.fields([{ name: 'image', maxCount: 1 }, { name: 'foodLicense', maxCount: 1 }])

router.get('/')

router.post('/register',upload.single('license'), supplierController.register)
router.post('/login', supplierController.login)
router.get('/salesreport', supplierProtect, supplierController.getSalesReport)

module.exports = router