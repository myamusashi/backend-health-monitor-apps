enum JenisKelamin {
	"Lakilaki",
	"Perempuan"
}

export type Pasien = {
	id_pasien: number;
	username: string;
	email: string;
	tanggal_lahir: Date;
	tinggi_badan: number;
	berat_badan: number;
	jenis_kelamin: JenisKelamin
	alamat?: string;
	nomor_telepon?: string;
	is_admin: boolean;
	is_active: boolean;
	last_login_at: Date;
	created_at: Date;
}

export type PasienWithPassword = Pasien & {
	password: string;
}
