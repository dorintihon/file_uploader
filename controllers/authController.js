function getLogin(req, res) {
    res.render('forms/auth', { title: 'Login', user: req.user, showRegister: false });
}

function getRegister(req, res) {
    res.render('forms/register', { title: 'Register', user: req.user, showRegister: true });
}

function postLogin(req, res) {
    const { username, password } = req.body;
    // Handle login logic
}

function postRegister(req, res) {
    const { username, password } = req.body;
    // Handle registration logic
    

}

export{
    getLogin,
    getRegister,
    postLogin,
    postRegister
};
