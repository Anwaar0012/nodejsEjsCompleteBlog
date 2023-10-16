const express =require('express');
const router = express.Router();
const Post = require('../models/Post');


// Routes

// for home end point and make it async with out pagination
// router.get("",async (req,res)=>{
//     // res.send("hi");

//     const locals = {
//         title:"block by taqi",
//         description:"This is the blog created by using nodejs, ejs, and mongodb"
//     }

//     // Fetching Data frm db and send post data into our template
//     try {
//         const data = await Post.find();
//         res.render('index',{locals, data});
        
//     } catch (error) {
//         console.log(error);
//     }



//     res.render('index',{locals});m
// });


// for home end point and make it async with pagination
router.get("",async (req,res)=>{
//     // res.send("hi");

    

    // Fetching Data frm db and send post data into our template
    try {
        const locals = {
            title:"block by taqi",
            description:"This is the blog created by using nodejs, ejs, and mongodb"
        }
        // let perPage=10; // how many posts display per page  
        // let perPage=5; // how many posts display per page  
        let perPage=3; // how many posts display per page  
        let page=req.query.page || 1 // if no of pages set otherwise 1 is default
        const data = await Post.aggregate([{$sort:{createAt:-1}}])
        .skip(perPage*page - perPage)
        .limit(perPage)
        .exec()

        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);
        
        res.render('index', { 
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
          });
        
    } catch (error) {
        console.log(error);
    }



    // res.render('index',{locals});
});


/**
 * GET /
 * Post :id
// */
router.get('/post/:id', async (req, res) => {
    try {
      let slug = req.params.id;
  
      const data = await Post.findById({ _id: slug });
  
      const locals = {
        title: data.title,
        description: "Simple Blog created with NodeJs, Express & MongoDb.",
      }
  
      res.render('post', { 
        locals,
        data,
        currentRoute: `/post/${slug}`
      });
    } catch (error) {
      console.log(error);
    }
  
  });

  
/**
 * POST /
 * Post - searchTerm
// */
router.post('/search', async (req, res) => {
    try {
      const locals = {
        title: "Seach",
        description: "Simple Blog created with NodeJs, Express & MongoDb."
      }
  
      let searchTerm = req.body.searchTerm;
      console.log(searchTerm);
    //   res.send(searchTerm);// to pass this data we can use middleware urlencode in app.js
      const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");// remove special characters
    //   console.log(searchNoSpecialChar)
        // res.send(searchTerm);// to pass this data we can use middleware urlencode in app.js
  
      const data = await Post.find({
        $or: [
          { title: { $regex: new RegExp(searchNoSpecialChar, 'i') }},
          { body: { $regex: new RegExp(searchNoSpecialChar, 'i') }}
        ]
      });
  
      res.render("search", {
        data,
        locals,
        currentRoute: '/'
      });
  
    } catch (error) {
      console.log(error);
    }
  
  });
  


// about endpoint
router.get("/about",(req,res)=>{
    // res.send("hi");
    res.render('about', {
      currentRoute: '/about'
    });
});

// // rougly add some posts into data base make a function
// function insertPostData () {
//   Post.insertMany([
//     {
//       title: "Building APIs with Node.js",
//       body: "Learn how to use Node.js to build RESTful APIs using frameworks like Express.js"
//     },
//     {
//       title: "Deployment of Node.js applications",
//       body: "Understand the different ways to deploy your Node.js applications, including on-premises, cloud, and container environments..."
//     },
//     {
//       title: "Authentication and Authorization in Node.js",
//       body: "Learn how to add authentication and authorization to your Node.js web applications using Passport.js or other authentication libraries."
//     },
//     {
//       title: "Understand how to work with MongoDB and Mongoose",
//       body: "Understand how to work with MongoDB and Mongoose, an Object Data Modeling (ODM) library, in Node.js applications."
//     },
//     {
//       title: "build real-time, event-driven applications in Node.js",
//       body: "Socket.io: Learn how to use Socket.io to build real-time, event-driven applications in Node.js."
//     },
//     {
//       title: "Discover how to use Express.js",
//       body: "Discover how to use Express.js, a popular Node.js web framework, to build web applications."
//     },
//     {
//       title: "Asynchronous Programming with Node.js",
//       body: "Asynchronous Programming with Node.js: Explore the asynchronous nature of Node.js and how it allows for non-blocking I/O operations."
//     },
//     {
//       title: "Learn the basics of Node.js and its architecture",
//       body: "Learn the basics of Node.js and its architecture, how it works, and why it is popular among developers."
//     },
//     {
//       title: "NodeJs Limiting Network Traffic",
//       body: "Learn how to limit netowrk traffic."
//     },
//     {
//       title: "Learn Morgan - HTTP Request logger for NodeJs",
//       body: "Learn Morgan."
//     },
//   ])
// }

// insertPostData();

module.exports = router;