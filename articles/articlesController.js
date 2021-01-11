const express = require("express");
const router = express.Router();
const Category = require("../categories/Category.js");
const Article = require("./Article.js");
const slugify = require("slugify");
const adminAuth = require("../middlewares/AdminAuth.js")

router.get("/admin/articles", adminAuth, (req, res) => {
    Article.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index.js", {articles: articles});
    });
});

router.get("/admin/articles/new", adminAuth, (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories});
    });
});

router.post("/admin/articles/save", adminAuth, (req,res) => {
    let title = req.body.title;
    let body = req.body.body;
    let category = req.body.category;
    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category
    }).then(() => {
        res.redirect("/admin/articles");
    });
});

router.get("/admin/articles/delete", adminAuth, (req,res) => {
    let id = req.body.id;
    if(id != undefined){
        if(!isNaN(id)){
            Article.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/articles");
            });
        }
        else{
            res.redirect("/admin/articles");
        }
    }
    else {
        res.redirect("/admin/articles");
    };
});

router.get("/admin/articles/edit/:id", adminAuth, (req,res) => {
    let id = req.params.id;
    Article.findByPk(id).then(article => {
        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {categories: categories})
            });
        }
        else{
            res.redirect("/");
        }
    }).catch(error => {
        res.redirect("/");
    });
});

router.post("/article/update", (req,res) => {
    let id = req.body.id;
    let title = req.body.title;
    let body = req.body.body;
    let category = req.body.category

    Article.update({
        title : title,
        body : body,
        categoryId : category,
        slug: slugify(title)
    }, 
    {
        where: {
            id: id
        }
    }).then(() => {
        res.redirect("/admin/articles");
    }).catch(error => {
        res.redirect("/");
    });
});

router.get("/articles/page/:num", (req,res) => {
    let page = req.params.num;
    if(isNaN(page) || page == 1){
        offset = 0;
    }else{
        offset = (parseInt(page) - 1) * 4;
    }
    Article.findAndCountAll({
        limit: 4,
        offset: offset,
        order: [
            ["id", "DESC"]
        ]
    }).then(articles => {
        let next;
        if(offset + 4 >= articles.count){
            next = false;
        }
        else{
            next = true;
        }

        let result = {
            page: parseInt(page),
            next: next,
            articles: articles
        }

        Category.findAll().then(categories => {
            res.render("admin/articles/page",{result: result, categories: categories});
        });

        
    });
});

module.exports = router;

