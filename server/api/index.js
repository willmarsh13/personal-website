const router = require("express").Router();

router.use((req, res, next) => {
    console.log(`${req.url}`)
    next();
})

// router.use("/Govee", require("./Govee"))

module.exports = router;