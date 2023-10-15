require('dotenv').config();
const express =require('express');
const expressLayout= require('express-ejs-layouts')
// it will help in put request 
const methodOverride = require('method-override');
// add cookieparser in v9 it will rub get and store cookies in session
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');




const connectDB = require('./server/config/db');

const app =express();
const PORT = 8089;

// Connect to DB call function
connectDB();

// this middleware is used to get data from uel.body, we use it when we get our form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

// app.use(session({
//     secret: 'keyboard cat',
//     resave: false,
//     cookie: { secure: true },
//     saveUninitialized: true,
//     store: MongoStore.create({
//         mongoUrl: process.env.MONGODB_URI
//     }),
//     // cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
//   }));
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'keyboard cat',
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
      }),
      cookie: {
        maxAge: 3600000, // 1 hour in milliseconds
        secure: process.env.NODE_ENV === 'production'
      }
    })
  );


// create static folder
app.use(express.static('public'));

//Templating Engine
app.use(expressLayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

// app.get("",(req,res)=>{
//     res.send("hi");
// })

app.use('/',require('./server/routes/main'));
app.use('/',require('./server/routes/admin'));

app.listen(PORT,()=>{
    console.log(`App is listening http://localhost:${PORT}`)
})