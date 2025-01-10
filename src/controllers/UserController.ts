import { Request, Response } from "express";

const userService = require('../services/UserService');

// Controller to create a user
async function createUserRoute(req: Request, res: Response) {
    try {
        const userData = req.body;
        const result = await userService.createUser(userData);
        res.status(201).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Controller to get all users
async function getUsersRoute(req: Request, res: Response) {
    try {
        const result = await userService.getUsers();
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({  });
    }
}

module.exports = {
    createUserRoute,
    getUsersRoute,
};