const router = require("express").Router();

router.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`)
    next();
})

// router.use("/Govee", require("./Govee"))
router.use("/features", require("./toggles").router)
router.use("/guestbook", require("./guestbook"))
router.use("/admin", require("./admin"))

router.use((req, res) => res.status(404).json({error: 'Not found.'}));

// JSON errors for the API instead of Express's HTML error page.
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') return res.status(413).json({error: 'Request too large.'});
    if (err.type === 'entity.parse.failed') return res.status(400).json({error: 'Invalid JSON.'});
    console.error('[api] unhandled error:', err);
    res.status(500).json({error: 'Something went wrong.'});
});

module.exports = router;
