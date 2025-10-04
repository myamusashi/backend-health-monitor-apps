import type { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import type { Pasien } from "../models/pasien";
import { config } from "../configs/configs";
import { HttpResponse } from "../helpers/httpResponse";

export const generateAccessToken = (payload: object) => {
	const secret = config.accessTokenSecret;

	if (!secret) 
		throw new Error("JWT_SECRET environment variable not defined!");
	

	return jwt.sign(payload, secret, { expiresIn: '4h' });
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
	const httpResponse = new HttpResponse(res);

	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];

	if (!token) {
		httpResponse.unauthorized();
		return;
	}

	jwt.verify(token, config.accessTokenSecret as string, (err, decode) => {
		console.log(err);

		if (err) {
			httpResponse.forbidden();
		}

		const data = <Pick<Pasien, 'username'>>(decode as Pasien);
		req.body.username = data.username;

		next();
	});
}
