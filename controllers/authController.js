import bcrypt from 'bcrypt';
import { getUserByUsername, createUser } from '../db/queries.js';

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

async function postRegister(req, res) {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(username, hashedPassword);
        console.log(`User ${username} registered successfully.`);
        res.redirect('/login');
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).send("Internal Server Error");
    }
}

export {
    getLogin,
    getRegister,
    postLogin,
    postRegister
};
