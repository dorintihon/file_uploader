import express from "express";

import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";

import { prisma } from "./lib/prisma.js";

import passport from "./config/passport.js";
import { indexRouter } from "./routes/indexRouter.js";
import { folderRouter } from "./routes/folderRouter.js";  
import path from "node:path";


const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

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



app.use("/", indexRouter);
app.use("/folders", folderRouter);

app.get("/test-session", (req, res) => {
  req.session.count = (req.session.count || 0) + 1;

  console.log("Session ID:", req.sessionID);
  console.log("Session:", req.session);

  res.send(`You visited ${req.session.count} times`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} link: http://localhost:${PORT}`);
});
