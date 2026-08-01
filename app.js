import express from "express";

import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import prisma from "./db/prisma.js";

import passport from "./config/passport.js";

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },

    secret: process.env.SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

app.get("/test", (req, res) => {
    console.log(req.user);
    console.log(req.isAuthenticated?.());
    res.send("OK");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} link: http://localhost:${PORT}`);
}); 



