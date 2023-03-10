"use strict";
const AccessService = require("../services/access.service");

class AccessController {
    signUp = async (req, res, next) => {
        return res.status(201).json(await AccessService.signUp(req.body));
        // try {
        //     console.log(`[P]::signUp::`, req.body);

        // } catch (err) {
        //     next(err);
        // }
    };
}

module.exports = new AccessController();
