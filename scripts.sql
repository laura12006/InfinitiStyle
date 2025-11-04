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

-- =====================================================
-- INSERCIÓN DE PUBLICACIONES Y PRENDAS
-- =====================================================

-- Publicaciones de María García (id_usuario = 2)
INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario) VALUES
('Hermosa chaqueta de cuero negra, muy poco uso. Perfecta para el clima frío. Marca reconocida y de excelente calidad.', 'Disponible', 'Venta', '2024-10-15', 2),
('Vestido elegante color azul marino, ideal para eventos especiales. Talla S, usado solo una vez.', 'Disponible', 'Venta', '2024-10-20', 2),
('Busco intercambiar mis jeans por una falda o vestido casual. Los jeans están en perfecto estado.', 'Disponible', 'Intercambio', '2024-10-25', 2);

-- Publicaciones de Carlos Rodríguez (id_usuario = 3)
INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario) VALUES
('Camisa formal blanca, perfecta para oficina o eventos formales. Talla L, como nueva.', 'Disponible', 'Venta', '2024-10-18', 3),
('Zapatos deportivos Nike, talla 42, color negro con detalles blancos. Muy cómodos para ejercicio.', 'Disponible', 'Venta', '2024-10-22', 3),
('Intercambio chaqueta deportiva por suéter de lana. Ambas prendas en excelente estado.', 'Disponible', 'Intercambio', '2024-10-28', 3);

-- Publicaciones de Ana Hernández (id_usuario = 4)
INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario) VALUES
('Blusa floreada muy fresca y cómoda, perfecta para primavera/verano. Talla M, excelente estado.', 'Disponible', 'Venta', '2024-10-12', 4),
('Pantalones elegantes negros, ideales para trabajo o reuniones. Talla M, poco uso.', 'Disponible', 'Venta', '2024-10-26', 4);

-- Publicaciones de Luis Jiménez (id_usuario = 5)
INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario) VALUES
('Suéter de lana gris, perfecto para invierno. Talla XL, muy abrigador y cómodo.', 'Disponible', 'Venta', '2024-10-14', 5),
('Intercambio gorra deportiva por cinturón de cuero. Ambos accesorios en buen estado.', 'Disponible', 'Intercambio', '2024-10-30', 5);

-- Publicaciones de Valentina Morales (id_usuario = 6)
INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario) VALUES
('Top crop rosa pastel, muy trendy y juvenil. Talla S, perfecto para combinar con jeans.', 'Disponible', 'Venta', '2024-10-16', 6),
('Falda plisada color beige, muy elegante. Talla S, ideal para looks formales o casuales.', 'Disponible', 'Venta', '2024-10-24', 6);

-- Publicaciones de Diego Ramírez (id_usuario = 7)
INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario) VALUES
('Polo manga larga color verde militar. Talla M, perfecto para looks casuales.', 'Disponible', 'Venta', '2024-10-19', 7),
('Busco intercambiar mis shorts por pantalón largo. Los shorts están nuevos, sin estrenar.', 'Disponible', 'Intercambio', '2024-11-01', 7);

-- Publicaciones de Isabella Flores (id_usuario = 8)
INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario) VALUES
('Vestido corto estampado, muy juvenil y moderno. Talla XS, perfecto para fiestas.', 'Disponible', 'Venta', '2024-10-21', 8),
('Chaqueta jean clásica, nunca pasa de moda. Talla XS, en excelente estado.', 'Disponible', 'Venta', '2024-10-27', 8);

-- Publicaciones de Sebastián Reyes (id_usuario = 9)
INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario) VALUES
('Camiseta vintage band tee, muy cool. Talla L, para amantes del rock clásico.', 'Disponible', 'Venta', '2024-10-23', 9),
('Pantalón cargo color khaki, muy cómodo y con muchos bolsillos. Talla L.', 'Disponible', 'Venta', '2024-10-29', 9);

-- Publicaciones de Camila Vega (id_usuario = 10)
INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario) VALUES
('Blazer elegante color crema, perfecto para oficina. Talla S, muy profesional.', 'Disponible', 'Venta', '2024-10-17', 10),
('Intercambio bolso pequeño por mochila. El bolso es de cuero sintético, muy bonito.', 'Disponible', 'Intercambio', '2024-11-02', 10);

-- PRENDAS CORRESPONDIENTES A LAS PUBLICACIONES

-- Prendas de María García
INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, valor, estado, id_publicacion) VALUES
('Chaqueta de Cuero Negra', 'Chaqueta de cuero genuino color negro, con cierre frontal y bolsillos laterales. Forro interior suave.', 'S', '/uploads/chaqueta_cuero_negra.jpg', 150000, 'Seminuevo', 1),
('Vestido Azul Marino Elegante', 'Vestido midi color azul marino, corte A, manga 3/4, perfecto para ocasiones especiales.', 'S', '/uploads/vestido_azul_marino.jpg', 80000, 'Nuevo', 2),
('Jeans Clásicos', 'Jeans azul clásico, corte recto, cintura media, muy cómodos y versátiles.', 'S', '/uploads/jeans_clasicos.jpg', 0, 'Usado', 3);

-- Prendas de Carlos Rodríguez
INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, valor, estado, id_publicacion) VALUES
('Camisa Formal Blanca', 'Camisa de vestir blanca, algodón 100%, cuello clásico, perfecta para trajes.', 'L', '/uploads/camisa_blanca_formal.jpg', 45000, 'Nuevo', 4),
('Tenis Nike Negros', 'Zapatillas deportivas Nike Air, color negro con logo blanco, suela de goma.', '42', '/uploads/nike_negros.jpg', 120000, 'Seminuevo', 5),
('Chaqueta Deportiva', 'Chaqueta deportiva con capucha, material sintético resistente al viento.', 'L', '/uploads/chaqueta_deportiva.jpg', 0, 'Usado', 6);

-- Prendas de Ana Hernández
INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, valor, estado, id_publicacion) VALUES
('Blusa Floreada Primaveral', 'Blusa de manga corta con estampado floral, tela ligera y fresca.', 'M', '/uploads/blusa_floreada.jpg', 35000, 'Nuevo', 7),
('Pantalón Negro Elegante', 'Pantalón de vestir negro, corte recto, tela stretch, muy cómodo.', 'M', '/uploads/pantalon_negro_elegante.jpg', 55000, 'Seminuevo', 8);

-- Prendas de Luis Jiménez
INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, valor, estado, id_publicacion) VALUES
('Suéter de Lana Gris', 'Suéter tejido en lana, color gris melange, cuello redondo, muy abrigador.', 'XL', '/uploads/sueter_lana_gris.jpg', 70000, 'Usado', 9),
('Gorra Deportiva', 'Gorra deportiva ajustable, color azul marino con logo bordado.', 'Única', '/uploads/gorra_deportiva.jpg', 0, 'Seminuevo', 10);

-- Prendas de Valentina Morales
INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, valor, estado, id_publicacion) VALUES
('Top Crop Rosa Pastel', 'Top corto color rosa pastel, manga corta, perfecto para looks juveniles.', 'S', '/uploads/top_crop_rosa.jpg', 25000, 'Nuevo', 11),
('Falda Plisada Beige', 'Falda midi plisada color beige, cintura alta, muy elegante y versátil.', 'S', '/uploads/falda_plisada_beige.jpg', 40000, 'Seminuevo', 12);

-- Prendas de Diego Ramírez
INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, valor, estado, id_publicacion) VALUES
('Polo Verde Militar', 'Polo manga larga color verde militar, algodón peinado, cuello clásico.', 'M', '/uploads/polo_verde_militar.jpg', 30000, 'Usado', 13),
('Shorts Denim', 'Shorts de jean azul clásico, cinco bolsillos, perfecto para verano.', 'M', '/uploads/shorts_denim.jpg', 0, 'Nuevo', 14);

-- Prendas de Isabella Flores
INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, valor, estado, id_publicacion) VALUES
('Vestido Corto Estampado', 'Vestido corto con estampado geométrico, manga sisa, muy juvenil.', 'XS', '/uploads/vestido_corto_estampado.jpg', 60000, 'Seminuevo', 15),
('Chaqueta Jean Clásica', 'Chaqueta de jean azul clásico, corte regular, botones frontales.', 'XS', '/uploads/chaqueta_jean_clasica.jpg', 65000, 'Nuevo', 16);

-- Prendas de Sebastián Reyes
INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, valor, estado, id_publicacion) VALUES
('Camiseta Vintage Rock', 'Camiseta vintage con estampado de banda de rock, algodón suave.', 'L', '/uploads/camiseta_vintage_rock.jpg', 35000, 'Usado', 17),
('Pantalón Cargo Khaki', 'Pantalón cargo color khaki, múltiples bolsillos, muy funcional.', 'L', '/uploads/pantalon_cargo_khaki.jpg', 50000, 'Seminuevo', 18);

-- Prendas de Camila Vega
INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, valor, estado, id_publicacion) VALUES
('Blazer Crema Elegante', 'Blazer color crema, corte entallado, solapas clásicas, muy profesional.', 'S', '/uploads/blazer_crema_elegante.jpg', 90000, 'Nuevo', 19),
('Bolso Pequeño de Cuero', 'Bolso pequeño de cuero sintético color café, con correa ajustable.', 'Única', '/uploads/bolso_pequeno_cuero.jpg', 0, 'Seminuevo', 20);

-- =======================================
-- CORRECCIÓN DE TABLA TRANSACCION
-- =======================================

-- Eliminar tabla transaccion existente con ENUM incorrecto
DROP TABLE IF EXISTS transaccion;

-- Recrear tabla transaccion con estructura que coincida con el backend
CREATE TABLE transaccion (
    id_transaccion INT PRIMARY KEY AUTO_INCREMENT,
    id_publicacion INT NOT NULL,
    id_comprador INT NOT NULL,
    estado ENUM('PENDIENTE_PAGO', 'PAGO_ENVIADO', 'PAGO_CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO') DEFAULT 'PENDIENTE_PAGO',
    fecha_inicio DATETIME NOT NULL,
    fecha_pago_enviado DATETIME NULL,
    fecha_pago_confirmado DATETIME NULL,
    fecha_envio DATETIME NULL,
    fecha_entrega DATETIME NULL,
    comprobante_pago TEXT NULL,
    info_seguimiento TEXT NULL,
    mensaje_inicial TEXT NULL,
    FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion) ON DELETE CASCADE,
    FOREIGN KEY (id_comprador) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    INDEX idx_comprador (id_comprador),
    INDEX idx_publicacion (id_publicacion)
);
