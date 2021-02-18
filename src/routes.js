const express = require("express");

const UserController = require("./controllers/UserController");
const CategoryController = require("./controllers/CategoryController");
const ProductController = require("./controllers/ProductController");
const ProductSoldController = require("./controllers/ProductSoldController");
const CartController = require("./controllers/CartController");
const SaleController = require("./controllers/SaleController");

const routes = express.Router();

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
routes.delete("/sales/delete/:id", SaleController.destroy);

module.exports = routes;
