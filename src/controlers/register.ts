import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import databaseServices from '../services/databaseServices';
import { generateAccessToken } from '../middleware/jwt';
import { createHttpResponse } from '../helpers/httpResponse';
import type { PasienWithPassword } from '../models/pasien';

type PasienRegistration = Omit<PasienWithPassword, 'is_admin' | 'is_active' | 'created_at' | 'updated_at'>;

export const Registration = async (req: Request<{}, {}, PasienRegistration>, res: Response) => {
	const Res = createHttpResponse(res);

	try {
		const {
			username,
			tanggal_lahir,
			tinggi_badan,
			berat_badan,
			jenis_kelamin,
			email,
			password
		}: PasienRegistration = req.body;


		if (!username || !email || !password) {
			Res.badRequest('Username, email dan password wajib hukumnya untuk diisi');
			return;
		}

		const checkQuery = 'SELECT id_pasien FROM Pasien WHERE username = $1 OR email = $2';
		const checkResult = await databaseServices.query<PasienWithPassword>(checkQuery, [username, email.toLowerCase()]);

		if (checkResult.rows.length > 0) {
			Res.conflict("Username atau Email sudah dipakai");
			return
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			Res.badRequest('Format email tidak valid');
			return;
		}

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		const insertQuery = `
      		INSERT INTO Pasien (
      		  username,
			  tanggal_lahir,
			  tinggi_badan,
			  berat_badan,
			  jenis_kelamin,
      		  email,
      		  password,
      		  is_admin,
      		  is_active,
      		  created_at,
      		  updated_at
      		)
      		VALUES ($1, $2, $3, $4, $5, $6, $7, false, true, NOW(), NOW())
      		RETURNING
      		  id_pasien,
      		  username,
              tanggal_lahir,
			  tinggi_badan,
			  berat_badan,
			  jenis_kelamin,
      		  email,
              password,
      		  is_admin,
      		  is_active,
      		  created_at,
      		  updated_at
		`;

		const insertResult = await databaseServices.query<PasienRegistration>(insertQuery, [
			username,
			tanggal_lahir,
			tinggi_badan,
			berat_badan,
			jenis_kelamin,
			email.toLowerCase(),
			hashedPassword,
		]);

		const newUser: PasienRegistration = insertResult.rows[0];

		const payload = {
			id_pasien: newUser.id_pasien,
			username: newUser.username,
			email: newUser.email,
		};

		const token = generateAccessToken(payload);

		const { password: _, ...PasienWithoutPassword } = newUser;

		Res.ok(
			{
				user: PasienWithoutPassword,
				token,
				expiresIn: '4h'
			},
			"Registrasi berhasil"
		);
		return;

	} catch (error) {
		console.error('Error creating user: ', error);
		createHttpResponse(res).internalServerError('Gagal membuat user');
		return;
	}
};

