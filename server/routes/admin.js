const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET||"MySecretBlog";

/**
 * 
 * Check Login middleware
*/
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;

  if(!token) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}

/** step 1
 * GET /
 * Admin - Login Page get request
*/
router.get('/admin', async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJs, Express & MongoDb."
    }

    res.render('admin/index', { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
    
  }
});

/**
 * POST 1st demo purpose/ post request
 * Admin - Check Login 1 not needed now first time demo
*/

// router.post('/admin', async (req, res) => {
//   try {
//     const { username, password } = req.body;
    // console.log(req.body)
    // res.redirect('/admin')

    // simple query this is basic idea to verify username and password
//     if(req.body.username === 'admin' && req.body.password === 'password') {
//       res.send('You are logged in.')
//     } else {
//       res.send('Wrong username or password');
//     }

//   } catch (error) {
//     console.log(error);
//   }
// });



/**
 * POST  2nd modified/ post request
 * Admin - Check Login no 2 modified
*/
router.post('/admin', async (req, res) => {
  try {
    const { username, password } = req.body;

    // now we get username from database and verify it 
    const user = await User.findOne( { username } );
    // console.log(user)
    // if we donot get use
    if(!user) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }
    // now we compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid) {
      return res.status(401).json( { message: 'Invalid credentials' } );
    }

    const token = jwt.sign({ userId: user._id}, jwtSecret );
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
  }
});


// dashboard
/** step 1 to understand
 * GET /
 * Admin Dashboard
*/
// for tesing

// router.get('/dashboard',authMiddleware,  (req, res) => {
//   res.render('admin/dashboard')

// });


// dashboard
/** step 2 modified
 * GET /
 * Admin Dashboard
*/

// dashboard page is like home/index page
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Dashboard',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    // console.log(data)
    res.render('admin/dashboard', {
      locals,
      data,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});

// ADD NEW POST GET METHOD
/**
 * GET /
 * Admin - Create New Post GET ROUTE FOR OPENING ADD POST PAGE
*/
router.get('/add-post', authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: 'Add Post',
      description: 'Simple Blog created with NodeJs, Express & MongoDb.'
    }

    const data = await Post.find();
    res.render('admin/add-post', {
      locals,
      layout: adminLayout
    });

  } catch (error) {
    console.log(error);
  }

});

// ADD NEW POST POST METHOD
/**
 * POST /
 * Admin - Create New Post or add new post
*/
router.post('/add-post', authMiddleware, async (req, res) => {
  // console.log(req.body)
  try {
    try {
      const newPost = new Post({
        title: req.body.title,
        body: req.body.body
      });

      await Post.create(newPost);
      res.redirect('/dashboard');
    } catch (error) {
      console.log(error);
    }

  } catch (error) {
    console.log(error);
  }
});

/**
 * GET /
 * Admin - Create New Post
*/
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };

    const data = await Post.findOne({ _id: req.params.id });

    res.render('admin/edit-post', {
      locals,
      data,
      layout: adminLayout
    })

  } catch (error) {
    console.log(error);
  }

});


/**
 * PUT /
 * Admin - Create New Post edited post
*/
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
  try {

    await Post.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now()
    });

    res.redirect(`/edit-post/${req.params.id}`);//redirect to same post

  } catch (error) {
    console.log(error);
  }

});




/**
 * POST /
 * Admin - Register
*/
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password:hashedPassword });
      res.status(201).json({ message: 'User Created', user });
    } catch (error) {
      if(error.code === 11000) {
        res.status(409).json({ message: 'User already in use'});
      }
      res.status(500).json({ message: 'Internal server error'})
    }

  } catch (error) {
    console.log(error);
  }
});

/**
 * DELETE /
 * Admin - Delete Post
*/
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {

  try {
    await Post.deleteOne( { _id: req.params.id } );
    res.json({message:"logout successfull"})
    // res.redirect('/dashboard');
  } catch (error) {
    console.log(error);
  }

});

/**
 * GET /
 * Admin Logout
*/
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  //res.json({ message: 'Logout successful.'});
  res.redirect('/');
});


module.exports = router;