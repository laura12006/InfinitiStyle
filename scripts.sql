DROP DATABASE IF EXISTS StyleInfinite;
CREATE DATABASE IF NOT EXISTS StyleInfinite;
USE StyleInfinite;

CREATE TABLE usuario (
    id_usuario int primary key auto_increment,
    1_nombre varchar(100),
    2_nombre varchar(100),
    1_apellido varchar(100),
    2_apellido varchar(100),
    correo_electronico varchar(100),
    contrasena varchar(255),
    talla varchar(5),
    fecha_nacimiento date,
    foto LONGTEXT,
    rol ENUM("Usuario", "Administrador") DEFAULT "Usuario" ,
    verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10),
    verification_code_expires DATETIME,
    password_reset_code VARCHAR(10),
    password_reset_expires DATETIME
);


create table publicacion (
    id_publicacion int primary key auto_increment,
    descripcion text,
    estado ENUM("Disponible", "No Disponible"),
    tipo_publicacion ENUM("Venta", "Intercambio"),
    fecha_publicacion date,
    id_usuario int,
    foreign key (id_usuario) references usuario(id_usuario)
);

create table prenda (
    id_prenda int primary key auto_increment,
    nombre varchar(100),
    descripcion_prenda text,
    talla varchar(10),
    foto LONGTEXT,
    valor int,
    estado ENUM("Nuevo", "Seminuevo", "Usado") DEFAULT "Usado",
    id_publicacion int,
    FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion)
);


create table mensaje (
    id_mensaje int primary key auto_increment,
    id_emisor int,
    id_receptor int,
    contenido text,
    fecha_envio datetime,
    foreign key (id_emisor) references usuario(id_usuario),
    foreign key (id_receptor) references usuario(id_usuario)
);

create table pago (
    id_pago int primary key auto_increment,
    id_usuario int not null,
    id_publicacion int not null,
    monto int,
    metodo_pago enum("Nequi", "Daviplata", "PSE", "Efecty", "Bancolombia", "Visa", "MasterCard", "Codensa", "Davivienda", "Av Villas"),
    estado_pago enum("PENDIENTE", "PROCESO", "COMPLETADO"),
    fecha_pago datetime,
    foreign key (id_usuario) references usuario(id_usuario),
    foreign key (id_publicacion) references publicacion(id_publicacion)
);

create table valoracion (
    id_valoracion int primary key auto_increment,
    usuario_valorador_id int,
    usuario_valorado_id int,
    puntaje int check (puntaje between 1 and 5),
    fecha_valoracion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foreign key (usuario_valorador_id) references usuario(id_usuario),
    foreign key (usuario_valorado_id) references usuario(id_usuario)
);

-- Tabla para lista de deseos / wishlist
CREATE TABLE lista_deseos (
    id_lista_deseos INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_publicacion INT NOT NULL,
    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion) ON DELETE CASCADE,
    UNIQUE KEY unique_wishlist (id_usuario, id_publicacion)
);

-- =====================================================
-- INSERCIÓN DE USUARIOS
-- =====================================================

-- Usuario Administrador Principal
-- Email: styleInfinite90@gmail.com
-- Contraseña: Admin123!
INSERT INTO usuario (
    1_nombre, 2_nombre, 1_apellido, 2_apellido,
    correo_electronico, contrasena, talla, fecha_nacimiento,
    rol, verified
) VALUES (
    'Admin', 'Style', 'Infinite', 'System',
    'styleInfinite90@gmail.com', 
    '$2b$12$DvonSMZr5Sw7/hnMwU8u3.UrouyEB1ok.6u.VAKGUcuTwnDLbOcby', -- Admin123!
    'M', '1990-01-01',
    'Administrador', TRUE
);

-- Usuarios de prueba
-- Contraseña para todos: Usuario123!

INSERT INTO usuario (
    1_nombre, 2_nombre, 1_apellido, 2_apellido,
    correo_electronico, contrasena, talla, fecha_nacimiento,
    rol, verified
) VALUES 
(
    'María', 'José', 'García', 'López',
    'maria.garcia@email.com',
    '$2b$12$BtrUUZN51eL1Npf.XH3UKOG2Qo7I1fxyfEXGX2ZL3GwyiH0e1dnAO', -- Usuario123!
    'S', '1995-03-15',
    'Usuario', TRUE
),
(
    'Carlos', 'Alberto', 'Rodríguez', 'Martínez',
    'carlos.rodriguez@email.com',
    '$2b$12$BtrUUZN51eL1Npf.XH3UKOG2Qo7I1fxyfEXGX2ZL3GwyiH0e1dnAO', -- Usuario123!
    'L', '1988-07-22',
    'Usuario', TRUE
),
(
    'Ana', 'Sofía', 'Hernández', 'Torres',
    'ana.hernandez@email.com',
    '$2b$12$BtrUUZN51eL1Npf.XH3UKOG2Qo7I1fxyfEXGX2ZL3GwyiH0e1dnAO', -- Usuario123!
    'M', '1992-11-08',
    'Usuario', TRUE
),
(
    'Luis', 'Fernando', 'Jiménez', 'Vargas',
    'luis.jimenez@email.com',
    '$2b$12$BtrUUZN51eL1Npf.XH3UKOG2Qo7I1fxyfEXGX2ZL3GwyiH0e1dnAO', -- Usuario123!
    'XL', '1985-12-03',
    'Usuario', TRUE
),
(
    'Valentina', 'Andrea', 'Morales', 'Castro',
    'valentina.morales@email.com',
    '$2b$12$BtrUUZN51eL1Npf.XH3UKOG2Qo7I1fxyfEXGX2ZL3GwyiH0e1dnAO', -- Usuario123!
    'S', '1998-05-17',
    'Usuario', TRUE
),
(
    'Diego', 'Alejandro', 'Ramírez', 'Sánchez',
    'diego.ramirez@email.com',
    '$2b$12$BtrUUZN51eL1Npf.XH3UKOG2Qo7I1fxyfEXGX2ZL3GwyiH0e1dnAO', -- Usuario123!
    'M', '1990-09-25',
    'Usuario', TRUE
),
(
    'Isabella', 'Camila', 'Flores', 'Mendoza',
    'isabella.flores@email.com',
    '$2b$12$BtrUUZN51eL1Npf.XH3UKOG2Qo7I1fxyfEXGX2ZL3GwyiH0e1dnAO', -- Usuario123!
    'XS', '2000-02-14',
    'Usuario', TRUE
),
(
    'Sebastián', 'David', 'Reyes', 'Gutiérrez',
    'sebastian.reyes@email.com',
    '$2b$12$BtrUUZN51eL1Npf.XH3UKOG2Qo7I1fxyfEXGX2ZL3GwyiH0e1dnAO', -- Usuario123!
    'L', '1987-06-30',
    'Usuario', TRUE
),
(
    'Camila', 'Alejandra', 'Vega', 'Ortiz',
    'camila.vega@email.com',
    '$2b$12$BtrUUZN51eL1Npf.XH3UKOG2Qo7I1fxyfEXGX2ZL3GwyiH0e1dnAO', -- Usuario123!
    'S', '1994-04-12',
    'Usuario', TRUE
),
(
    'Andrés', 'Felipe', 'Cruz', 'Paredes',
    'andres.cruz@email.com',
    '$2b$12$BtrUUZN51eL1Npf.XH3UKOG2Qo7I1fxyfEXGX2ZL3GwyiH0e1dnAO', -- Usuario123!
    'M', '1991-08-18',
    'Usuario', TRUE
);
