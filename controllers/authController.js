import bcrypt from 'bcrypt';
import { getUserByUsername, createUser } from '../db/queries.js';
import passport from '../config/passport.js';

function getLogin(req, res) {
    res.render('forms/auth', { title: 'Login', user: req.user, showRegister: false });
}

function getRegister(req, res) {
    res.render('index', { title: 'Register', user: req.user, showRegister: true });
}

async function postRegister(req, res) {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(username, hashedPassword);
        console.log(`User ${username} registered successfully.`);
        res.redirect('/');
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send("Internal Server Error");
    }
}

async function postLogin(req, res) {
    const { username, password } = req.body;
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error("Error during login:", err);
            return res.status(500).send("Internal Server Error");
        }
        if (!user) {
            return res.status(401).send("Invalid username or password");
        }
        req.logIn(user, (err) => {
            if (err) {
                console.error("Error during login:", err);
                return res.status(500).send("Internal Server Error");
            }
            console.log(`User ${username} logged in successfully.`);
            return res.redirect('/');
        });
    })(req, res);
}

async function postLogout(req, res) {
    req.logout((err) => {
        if (err) {
            console.error("Error during logout:", err);
            return res.status(500).send("Internal Server Error");
        }
        console.log("User logged out successfully.");
        res.redirect('/');
    });
}

export {
    getLogin,
    getRegister,
    postLogin,
    postRegister,
    postLogout
};
