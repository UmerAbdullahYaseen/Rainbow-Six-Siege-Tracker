const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// const request = require('request');
const https = require('https');
const axios = require('axios');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');
const app = express();
const port = 3000;


mongoose.connect('mongodb://127.0.0.1:27017/YamSquadR6', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
app.use(bodyParser.urlencoded({ extended: true })); // Using Body Parser
app.set('view engine', 'ejs'); // setting view engine to EJS 
app.use(express.static('public')); // Telling Express to use Public folder
app.use(expressSanitizer()); // app ko bata rha k corona ha sanitizer use kro
app.use(methodOverride('_method'));

let blogSchema = mongoose.Schema({
    title: String,
    image: {
        type: String,
        default: 'imagePlaceholder.jpg'
    },
    body: String,
    created: {
        type: Date,
        default: Date.now
    }
});

let Blog = mongoose.model('Blog', blogSchema);
app.get('/blogs', (req, res) => {
    //RETRIEVING ALL BLOGS
    Blog.find({}, (error, blogs) => {
        if (error) {
            console.log(error);
        } else {
            res.render('blogs', { blogs: blogs })
        }
    })
})

//NEW ROUTE
app.get('/blogs/new', (req, res) => {
    res.render('new')
})


//CREATE
app.post('/blogs', (req, res) => {
    //create blog
    Blog.create(req.body.blog, (error, newBlog) => {
        if (error) {
            res.render('new')
        } else {
            //redirect to index page
            res.redirect('/blogs')
        }
    })

});

//SHOW ROUTE
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (error, foundBlog) => {
        if (error) {
            res.redirect('/blogs')
        } else {
            res.render('show', { blog: foundBlog })
        }
    })
});

//EDIT
app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (error, foundBlog) => {
        if (error) {
            res.redirect('/blogs')
        } else {
            res.render('edit', { blog: foundBlog })
        }
    })
});

//UPDATE ROUT
app.put('/blogs/:id', (req, res) => {
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (error, updatedBlog) => {
        if (error) {
            res.redirect('/blogs')
        } else {
            res.redirect('/blogs/' + req.params.id)
        }
    })
});

//DELETE ROUTE
app.delete('/blogs/:id', (req, res) => {
    //DESTROY BLOG
    Blog.findByIdAndRemove(req.params.id, (error) => {
        if (error) {
            res.redirect('/blogs')
        } else {
            res.redirect('/blogs')
        }
    })
});
// App.get functions

app.get("/viewstat", function(req, res) {
    res.render("viewstat")
});

app.get('/leaderboard', function(req, res) {
    res.render('leaderboard');
})

app.get('/', function(req, res) {
    res.render('index');
});
app.get('/stats', function(req, res) {
    res.render('stats');
});
app.get('/newsletter', function(req, res) {
    res.render("newsletter");
});
app.get('/posts', function(req, res) {
    res.render("posts");
});
app.get('/contact', function(req, res) {
    res.render("contact");
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});

// Contact Us wali Chawal
app.post('/contact', function(req, res) {
    let name = req.body.name;
    let email = req.body.email;
    let subject = req.body.subject;
    let message = req.body.message;
    console.log(name, email, subject, message);
    res.send("Okay Thanks");
});

// NewsLetter posts

app.post('/newsletter', function(req, res) {
    const firstname = req.body.fname;
    const lastname = req.body.lname;
    const email = req.body.email;

    console.log(firstname, lastname, email);

    const data = {
        members: [{
            email_address: email,
            status: 'subscribed',
            merge_fields: {
                FNAME: firstname,
                LNAME: lastname
            }
        }]
    };

    const JSONdata = JSON.stringify(data);

    const url = '{your MailChimp list url}';

    const option = {
        method: 'POST',
        auth: '{your Auth}'
    }

    const request = https.request(url, option, function(response) {

        if (response.statusCode == 200) {
            res.send('Successfully Subscribed!');
        } else {
            res.send('Failed! try again later or contact developer');
        }

        response.on('data', function(okxd) {
            console.log(JSON.parse(okxd));
        });
    });
    request.write(JSONdata);
    request.end();
});

// Rainbow Six wali chawal
app.post("/stats", function(req, res) {
    var profile = {};

    const API_KEY = '{Your Api key you can obtain it from r6stats.com}'

    const getGenericStats = async({ username, platform }) => {
        const { data } = await axios.get(`https://api2.r6stats.com/public-api/stats/${username}/${platform}/generic`, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        });
        res.render("viewstat", {
            username: data.username,
            uplayimg: data.avatar_url_256,
            generalassists: data.stats.general.assists,
            timeplayed: data.stats.general.playtime,
            generalkill: data.stats.general.kills,
            generalkd: data.stats.general.kd,
            generalwin: data.stats.general.wins,
            generalloss: data.stats.general.losses,
            generalmatches: data.stats.general.games_played,
            generaldeath: data.stats.general.deaths,
            generalheadshot: data.stats.general.headshots,
            generaldraw: data.stats.general.draws,
            rtimeplayed: data.stats.queue.ranked.playtime,
            rdeath: data.stats.queue.ranked.deaths,
            rkill: data.stats.queue.ranked.kills,
            rkd: data.stats.queue.ranked.kd,
            rgameplayed: data.stats.queue.ranked.games_played,
            rdraw: data.stats.queue.ranked.draws,
            rloss: data.stats.queue.ranked.losses,
            rwin: data.stats.queue.ranked.wins,
            rwl: data.stats.queue.ranked.wl
        });
        console.log(data);
        // res.send(data);
    }
    var uplayName = req.body.uplayId;
    var platform = req.body.platform;
    getGenericStats({
        username: uplayName,
        platform: platform,
    });
});