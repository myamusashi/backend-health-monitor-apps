CREATE TABLE Pasien (
    id_pasien SERIAL PRIMARY KEY,
    username VARCHAR(75) NOT NULL UNIQUE,
    email VARCHAR(254) NOT NULL UNIQUE,
    tanggal_lahir DATE NOT NULL,
    password TEXT NOT NULL,
    tinggi_badan FLOAT NOT NULL,
    berat_badan FLOAT NOT NULL,
    jenis_kelamin VARCHAR(10) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')) NOT NULL,
    alamat VARCHAR(255),
    nomor_telepon CHAR(20),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Auto update 'updated_at'
CREATE OR REPLACE FUNCTION updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pasien_updated_at
    BEFORE UPDATE ON Pasien
    FOR EACH ROW
    EXECUTE FUNCTION updated_at_column();

