const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

let submittedBlogs = [];


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
const viewsPath = path.join(__dirname, 'views');
app.set('views', viewsPath);
app.use(express.static(path.join(__dirname, 'public')));

const secretKey = 'your-secret-key';

const validUser = {
    email: 'admin@gmail.com',
    password: 'admin1234'
};


const generateToken = (user) => {
    return jwt.sign(user, secretKey, { expiresIn: '1h' });
};


const verifyToken = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        req.loggedIn = false;
        next();
    } else {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                req.loggedIn = false; 
            } else {
                req.loggedIn = true;
                req.user = decoded;
            }
            next();
        });
    }
};

// Routes for rendering pages
app.get('/index', verifyToken, (req, res) => {
    res.render('index', { loggedIn: req.loggedIn }); 
});

app.get('/features', verifyToken, (req, res) => {
    res.render('features', { loggedIn: req.loggedIn }); 
});

app.get('/about', verifyToken, (req, res) => {
    res.render('about', { loggedIn: req.loggedIn }); 
});

app.get('/signup', verifyToken, (req, res) => {
    res.render('signup', { loggedIn: req.loggedIn }); 
});


app.get('/login', (req, res) => {
    res.render('login', { loggedIn: req.loggedIn });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (email === validUser.email && password === validUser.password) {
        const token = generateToken({ email });
        res.cookie('jwt', token, { httpOnly: true });
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});


app.get('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.redirect('/login');
});


app.get('/create', verifyToken, (req, res) => {
    if (!req.loggedIn) {
        return res.redirect('/login');
    }
    res.render('create', { loggedIn: req.loggedIn });
});

app.post('/submit-blog', verifyToken, (req, res) => {
    const { title, overview, image, content } = req.body;
    const newBlog = {
        id: submittedBlogs.length + 1,
        title,
        overview,
        image,
        content,
        date: new Date()
    };
    
    submittedBlogs.push(newBlog);

    res.status(200).json({ message: 'Blog submitted successfully' });
});


app.get('/blog/:id', verifyToken, (req, res) => {
    const blogId = parseInt(req.params.id);
    const blog = submittedBlogs.find(blog => blog.id === blogId);
    if (blog) {
        res.render('blogDetail', { blog, loggedIn: req.loggedIn });
    } else {
        res.status(404).send('Blog not found');
    }
});


app.delete('/delete-blog/:id', verifyToken, (req, res) => {
    if (!req.loggedIn) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const blogId = parseInt(req.params.id);
    const blogIndex = submittedBlogs.findIndex(blog => blog.id === blogId);

    if (blogIndex !== -1) {
        submittedBlogs.splice(blogIndex, 1);
        res.status(200).json({ message: 'Blog deleted successfully' });
    } else {
        res.status(404).json({ message: 'Blog not found' });
    }
});

app.get('/blogs', verifyToken, (req, res) => {
    res.render('blogs', { blogs: submittedBlogs, loggedIn: req.loggedIn }); 
});

app.get('/nature', verifyToken, (req, res) => {
    res.render('nature', { loggedIn: req.loggedIn }); 
});

app.get('/cars', verifyToken, (req, res) => {
    res.render('cars', { loggedIn: req.loggedIn });
});

app.get('/ai', verifyToken, (req, res) => {
    res.render('ai', { loggedIn: req.loggedIn }); 
});

app.get('/gaming', verifyToken, (req, res) => {
    res.render('gaming', { loggedIn: req.loggedIn }); 
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
