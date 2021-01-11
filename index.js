const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const connection = require("./database/database.js");

const categoriesController = require("./categories/categoriesController.js");
const articlesController = require("./articles/articlesController.js");
const usersController = require("./users/usersController.js");

const Article = require("./articles/Article.js");
const Category = require("./categories/Category.js");
const User = require("./users/User.js");

app.set("view engine", "ejs");

app.use(session({
    secret: "q1w2e3r4t5",
    cookie: {maxAge: 1800000}
}));

app.use(express.static("public"));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

connection
    .authenticate()
    .then(() => {
        console.log("Conexão estabelecida!");
    }).catch((error) => {
        console.log(error);
    });

app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);

app.get("/", (req,res) => {
    Article.findAll({
        order: [
            ["id", "DESC"]
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index.ejs", {articles: articles, categories: categories});
        });
    });
});

app.get("/:slug", (req,res) => {
    let slug = req.params.slug;
    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("article", {article: article, categories: categories});
            });
        }else{
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/");
    });
});

app.get("/category/:slug", (req,res) => {
    let slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then(category => {
        if(category != undefined){
            Category.findAll().then(categories => {
                res.render("index", {articles: Category.articles, categories: categories});
            });
        }else{
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/");
    });
});

app.listen(8080, () => {
    console.log("Servidor On!");
});