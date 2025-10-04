import type { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createHttpResponse } from "../helpers/httpResponse";
import type { PasienWithPassword } from "../models/pasien";
import databaseServices from "../services/databaseServices";
import { generateAccessToken } from "../middleware/jwt";

class login {
	private readonly JWT_SECRET: string;
	private readonly JWT_EXPIRES_IN: string;

	constructor() {
		this.JWT_SECRET = process.env.accesTokenSecret || '';
		this.JWT_EXPIRES_IN = "24h";
	}

	async handle(req: Request, res: Response): Promise<Response> {
		const Res = createHttpResponse(res);

		try {
			const { username, email, password } = req.body;

			if (this.isEmpty(password))
				return Res.badRequest("Input password tidak boleh kosong");

			if (this.isEmpty(username) && this.isEmpty(email))
				return Res.badRequest("username, password atau email masih kosong");

			if (!this.isValidEmail(email))
				return Res.badRequest();

			let user;

			if (this.isEmpty(username) && !this.isEmpty(email))
				user = await this.findUserByEmail(email);
			else if (this.isEmpty(email) && !this.isEmpty(username))
				user = await this.findUserByUsername(username);
			else
				return Res.badRequest("Silahkan isi username atau email");

			if (!user)
				return Res.unauthorized("Username atau email tidak valid");

			// if (!user.is_active)
			// 	return Res.forbidden("Akun tidak aktif. Silahkan hubungi administrator");

			const isPasswordValid = await this.verifyPassword(password, user.password);

			if (!isPasswordValid)
				return Res.unauthorized("Email, username atau password tidak valid");

			await this.updateLastLogin(user.id_pasien);

			const token = generateAccessToken(user);
			const { password: _, ...pasienWithoutPassword } = user;

			return Res.ok({
				user: pasienWithoutPassword,
				token
			}, 'Login berhasil');
		} catch (error) {
			console.log('Login Error', error);
			return Res.internalServerError("Terjadi kesalahan saat login", error as Error);

		}
	}

	private isEmpty(value: string): boolean {
		return value === null || value === undefined || value === "";
	}

	private isValidEmail(email: string): boolean {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	private async findUserByUsername(username: string): Promise<PasienWithPassword | null> {
		try {
			const query = `
            SELECT id_pasien, username, email, password, is_active 
            FROM Pasien 
            WHERE username = $1
        `;
			const result = await databaseServices.query<PasienWithPassword>(query, [username]);
			return result.rows.length > 0 ? result.rows[0] : null;
		} catch (error) {
			console.error("Error finding username:", error);
			throw error;
		}
	}

	private async findUserByEmail(email: string): Promise<PasienWithPassword | null> {
		try {
			const query = `
            SELECT id_pasien, username, email, password, is_active 
            FROM Pasien 
            WHERE email = $1
        `;
			const result = await databaseServices.query<PasienWithPassword>(query, [email]);
			return result.rows.length > 0 ? result.rows[0] : null;
		} catch (error) {
			console.error("Error finding email:", error);
			throw error;
		}
	}

	private async verifyPassword(plaintextPassword: string, hashedPassword: string): Promise<boolean> {
		try {
			return await bcrypt.compare(plaintextPassword, hashedPassword);
		} catch (error) {
			console.error('Password verification error:', error);
			return false;
		}
	}

	private async updateLastLogin(userId: number): Promise<void> {
		try {
			const query = `
				UPDATE Pasien 
				SET last_login_at = CURRENT_TIMESTAMP
				WHERE id_pasien = $1
			`;

			await databaseServices.query(query, [userId]);
		} catch (error) {
			console.error('Error updating last login:', error);
		}
	}
}

export const LoginControler = new login();
