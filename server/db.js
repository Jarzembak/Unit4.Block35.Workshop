require("dotenv").config();
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const createTables = async () => {
    const SQL = /*SQL*/ `
    DROP TABLE IF EXISTS favorite;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS product;

    CREATE TABLE product(
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    );

    CREATE TABLE users(
        id UUID PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
    );

    CREATE TABLE favorite(
        id UUID PRIMARY KEY,
        product_id UUID REFERENCES product(id) NOT NULL,
        user_id UUID REFERENCES users(id) NOT NULL,
        CONSTRAINT unique_product_user UNIQUE(product_id, user_id)
    );`;

    await client.query(SQL);
};

const createUser = async (username, password) => {
    const SQL = /*sql*/ `
    INSERT INTO users(id, username, password) VALUES($1, $2, $3) RETURNING *;
    `;
    const response = await client.query(SQL, [
        uuid.v4(),
        username,
        await bcrypt.hash(password, 5),
    ]);
};

const createProduct = async (name) => {
    const SQL = /*sql*/ `
    INSERT INTO product(id, name) VALUES($1, $2) RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), name]);
    return response.rows[0];
};

const seed = async () => {
    const users = [
        { username: "bill", password: "password1" },
        { username: "bob", password: "password2" },
        { username: "jane", password: "password3" },
        { username: "jill", password: "password4" },
    ];
    const products = [
        { name: "shirt" },
        { name: "pants" },
        { name: "shorts" },
        { name: "shoes" },
    ];
    for (let user of users) {
        await createUser(user.username, user.password);
    }
    for (let product of products) {
        await createProduct(product.name);
    }
};

const createFavorite = async (product_id, user_id) => {
    const SQL = /*sql*/ `
    INSERT INTO favorite(id, product_id, user_id) VALUES($1, $2, $3) RETURNING *;
    `;
    const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);
    return response.rows[0];
};

const fetchUsers = async () => {
    return (await client.query("SELECT * FROM users")).rows;
};

const fetchProducts = async () => {
    return (await client.query("SELECT * FROM product")).rows;
};

const fetchFavorites = async (user_id) => {
    const SQL = /*sql*/ `
    SELECT * FROM favorite WHERE user_id = $1;
    `;
    return (await client.query(SQL, [user_id])).rows;
};

const destroyFavorite = async (user_id, id) => {
    const SQL = /*sql*/ `
    DELETE FROM favorite WHERE user_id = $1 AND id = $2;
    `;
    return (await client.query(SQL, [user_id, id])).rows;
};

module.exports = {
    client,
    createTables,
    seed,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite,
};
