const express = require("express");

const UserController = require("./controllers/UserController");
const CategoryController = require("./controllers/CategoryController");
const ProductController = require("./controllers/ProductController");
const ProductSoldController = require("./controllers/ProductSoldController");
const CartController = require("./controllers/CartController");
const SaleController = require("./controllers/SaleController");
const ExitController = require("./controllers/ExitController");
const EntranceController = require("./controllers/EntranceController");
const EntranceAndExitController = require("./controllers/EntranceAndExitController");
const SessionController = require("./controllers/SessionController");

const middleware = require("./middlewares/session");

const routes = express.Router();

routes.get("/login", SessionController.loginForm);
routes.post("/logout", SessionController.logout);
routes.post("/session", SessionController.store);

routes.use(middleware);

routes.get("/", (req, res) => {
  return res.render("home/index");
});

routes.get("/userslist", UserController.index);
routes.get("/users", UserController.create);
routes.post("/users", UserController.store);
routes.get("/users/edit/:id", UserController.edit);
routes.put("/users/edit/:id", UserController.update);
routes.delete("/users/delete/:id", UserController.destroy);

routes.get("/categoryslist", CategoryController.index);
routes.get("/categorys", CategoryController.create);
routes.post("/categorys", CategoryController.store);
routes.get("/categorys/edit/:id", CategoryController.edit);
routes.put("/categorys/edit/:id", CategoryController.update);
routes.delete("/categorys/delete/:id", CategoryController.destroy);

routes.get("/productslist", ProductController.index);
routes.post("/productslist", ProductController.index);
routes.get("/products", ProductController.create);
routes.post("/products", ProductController.store);
routes.get("/products/edit/:id", ProductController.edit);
routes.put("/products/edit/:id", ProductController.update);
routes.delete("/products/delete/:id", ProductController.destroy);

routes.get("/productssoldslist", ProductSoldController.indexProduct);

routes.get("/cart", CartController.index);
routes.post("/cart", CartController.index);
routes.post("/cart/add-one/:id", CartController.addOne);
routes.post("/cart/remove-one/:id", CartController.removeOne);
routes.post("/cart/delete/:id", CartController.delete);

routes.post("/sales", SaleController.store);
routes.get("/sales", SaleController.index);
routes.post("/salesdates", SaleController.index);
routes.delete("/sales/delete/:id", SaleController.destroy);
routes.delete("/sales/deleteall", SaleController.destroyAll);

routes.get("/exits", ExitController.index);
routes.post("/exitsdates", ExitController.index);
routes.get("/exits", ExitController.index);
routes.post("/exits", ExitController.store);
routes.get("/exits/edit/:id", ExitController.edit);
routes.put("/exits/edit/:id", ExitController.update);
routes.delete("/exits/delete/:id", ExitController.destroy);

routes.get("/entrances", EntranceController.index);
routes.post("/entrancesdate", EntranceController.index);

routes.get("/entrancesandexitsdatails", EntranceAndExitController.index);
routes.post("/entrancesandexitsdatailsdates", EntranceAndExitController.index);
routes.get("/entrancesandexits", (req, res) => {
  return res.render("entranceandexit/list");
});

module.exports = routes;
