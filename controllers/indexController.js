async function getHomePage(req, res) {
    res.render('index', { title: 'Home', user: req.user, showRegister: false });
    // req.session.count = (req.session.count || 0) + 1;
    // console.log("Session ID:", req.sessionID);
    // console.log("Session:", req.session);
    // console.log("User:", req.user);
    // console.log(`You visited ${req.session.count} times`);

}

export {
    getHomePage
};