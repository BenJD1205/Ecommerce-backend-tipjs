"use strict";
const shopModel = require("../models/shop.model");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils/common-function");
const {
    BadRequestError,
    ConflictRequestError,
} = require("../core/error.response");

const RoleShop = {
    SHOP: "SHOP",
    WRITER: "WRITER",
    EDITOR: "EDITOR",
    ADMIN: "ADMIN",
};

class AccessService {
    static signUp = async ({ name, email, password }) => {
        try {
            //check email exists
            const holderShop = await shopModel.findOne({ email }).lean();
            if (holderShop) {
                throw new BadRequestError("Error: Shop already registered!");
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const newShop = await shopModel.create({
                name,
                email,
                password: passwordHash,
                roles: [RoleShop.SHOP],
            });
            if (newShop) {
                // const { privateKey, publicKey } = crypto.generateKeyPairSync(
                //     "rsa",
                //     {
                //         modulusLength: 4096,
                //         publicKeyEncoding: {
                //             type: "pkcs1",
                //             format: "pem",
                //         },
                //         privateKeyEncoding: {
                //             type: "pkcs1",
                //             format: "pem",
                //         },
                //     }
                // );
                const privateKey = crypto.randomBytes(64).toString("hex");
                const publicKey = crypto.randomBytes(64).toString("hex");

                ///Public key CryptoGraphy Standards
                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey,
                });

                if (!keyStore) {
                    return {
                        code: "xxxx",
                        message: "keyStore error",
                    };
                }

                // const publicKeyObject = crypto.createPublicKey(publicKeyString);

                //create token pair
                const tokens = await createTokenPair(
                    {
                        userId: newShop._id,
                        email,
                    },
                    publicKey,
                    privateKey
                );
                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({
                            fields: ["_id", "name", "email"],
                            object: newShop,
                        }),
                        tokens,
                    },
                };
            }
            return {
                code: "xxx",
                metadata: null,
            };
        } catch (err) {
            return {
                code: "xxx",
                message: err.message,
                status: "error",
            };
        }
    };
}

module.exports = AccessService;
