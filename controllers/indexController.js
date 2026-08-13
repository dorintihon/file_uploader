async function getHomePage(req, res) {
    res.render('index', { title: 'Home', user: req.user, showRegister: false });
}

export {
    getHomePage
};