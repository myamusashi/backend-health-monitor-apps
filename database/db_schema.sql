CREATE TABLE Pasien (
    id_pasien INT PRIMARY KEY AUTO_INCREMENT,
	nama_depan VARCHAR(75) NOT NULL,
	nama_belakang VARCHAR(75) NOT NULL,
    username VARCHAR(75) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
	umur DATE NOT NULL,
    password TEXT NOT NULL,
    tinggi_badan FLOAT NOT NULL,
	berat_badan FLOAT NOT NULL,
	jenis_kelamin ENUM('Laki-laki', 'Perempuan'),
	alamat VARCHAR(255),
	nomor_telepon CHAR(20),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Auto update 'update_at'
CREATE OR REPLACE FUNCTION updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.update_at = CURRENT_TIMESTAMP;
	RETURN NEW;
END;
$$ LANGUAGE plpgqsl;

CREATE TRIGGER update_patient_updated_at
	BEFORE UPDATE ON Pasien
	FOR EACH ROW
	EXECUTE FUNCTION updated_at_column();

CREATE TABLE Kondisi_pasien (
	id_kondisi INT PRIMARY KEY AUTO_INCREMENT,
	id_pasien INT,
	waktu_pengukuran DATETIME NOT NULL,
	detak_jantung INT,
	kadar_gula DECIMAL(4, 2),
	temperatur DECIMAL(4, 2),
	FOREIGN KEY(id_pasien) REFERENCES Pasien(id_pasien)
);

CREATE TABLE Catatan_medis (
	id_catatan INT PRIMARY KEY AUTO_INCREMENT,
	id_pasien INT,
	waktu_pencatatan DATE NOT NULL,
	diagnosis TEXT,
	perawatan TEXT,
	catatan TEXT,
	FOREIGN KEY(id_pasien) REFERENCES Pasien(id_pasien)
);

CREATE TABLE Pengobatan (
	id_pengobatan INT PRIMARY KEY AUTO_INCREMENT,
	id_pasien INT,
	nama_pengobatan VARCHAR(150) NOT NULL,
	dosis VARCHAR(50),
	frekuensi VARCHAR(50),
	start_date DATE,
	end_date DATE,
	FOREIGN KEY(id_pasien) REFERENCES Pasien(id_pasien)
);
