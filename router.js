var express = require('express')
var router = express.Router()

// Controllers
const { 
	OAuthController,
	sendToken
} = require('./controllers/OAuthController')

router.get('/authApp/', OAuthController)
router.post('/sendToken', sendToken)

module.exports = router