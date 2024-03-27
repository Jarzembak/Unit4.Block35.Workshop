require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const {
    client,
    createTables,
    seed,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite,
} = require("./db");
const app = express();
const router = require("express").Router();


app.use(express.json());
app.use(morgan("combined"));
app.use("/api", router);

const init = async () => {
    await client.connect();
    console.log("Connected to the database");
    await createTables();
    console.log("tables created");
    seed();

    const PORT = process.env.PORT;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

router.get("/users", async (req, res, next) => {
    try {
        const users = await fetchUsers();
        res.send(users);
    } catch (error) {
        next(error);
    }
});

router.get("/products", async (req, res, next) => {
    try {
        const products = await fetchProducts();
        res.send(products);
    } catch (error) {
        next(error);
    }
});

router.get("/users/:id/favorites", async (req, res, next) => {
    try {
        const favorites = await fetchFavorites(req.params.id);
        res.send(favorites);
    } catch (error) {
        next(error);
    }
});

router.post("/users/:id/favorites", async (req, res, next) => {
    try {
        const favorite = await createFavorite(req.body.product_id, req.params.id);
        res.send(favorite);
    } catch (error) {
        next(error);
    }
});

router.delete("/users/:userId/favorites/:id", async (req, res, next) => {
    try {
        await destroyFavorite(req.params.userId, req.params.id);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

init();
