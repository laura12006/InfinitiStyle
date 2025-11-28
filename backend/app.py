from flask import Flask, request, jsonify, send_from_directory, make_response
from flask_cors import CORS
import pymysql
from config import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, SECRET_KEY, JWT_ALGORITHM
from config import SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM
import jwt
import datetime
import bcrypt
import os
import smtplib
import random
import uuid
from werkzeug.utils import secure_filename
from email.message import EmailMessage
import traceback

app = Flask(__name__)
# Configuración CORS mejorada para manejar FormData y archivos
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})
app.config['SECRET_KEY'] = SECRET_KEY
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Crear la carpeta de uploads si no existe
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Manejar peticiones OPTIONS para CORS
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file):
    """Guarda un archivo subido y retorna el nombre del archivo guardado"""
    if not file:
        print("[DEBUG] No se proporcionó archivo")
        return None
    
    print(f"[DEBUG] Procesando archivo: {file.filename}")
    print(f"[DEBUG] Tipo de contenido: {file.content_type}")
    
    if file and allowed_file(file.filename):
        # Generar nombre único para el archivo
        filename = secure_filename(file.filename)
        ext = filename.rsplit('.', 1)[1].lower()
        new_filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        
        print(f"[DEBUG] Guardando archivo en: {file_path}")
        
        try:
            file.save(file_path)
            print(f"[DEBUG] Archivo guardado exitosamente: {new_filename}")
            return new_filename
        except Exception as e:
            print(f"[DEBUG] Error al guardar archivo: {e}")
            return None
    else:
        print(f"[DEBUG] Tipo de archivo no permitido: {file.filename}")
    return None

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


def get_db_connection():
    return pymysql.connect(host=DB_HOST, user=DB_USER, password=DB_PASSWORD, database=DB_NAME, port=DB_PORT, cursorclass=pymysql.cursors.DictCursor)


def ensure_verification_columns():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Añadir columnas si no existen (tolerar errores)
            try:
                cur.execute("ALTER TABLE usuario ADD COLUMN verified BOOLEAN DEFAULT FALSE")
            except Exception:
                pass
            try:
                cur.execute("ALTER TABLE usuario ADD COLUMN verification_code VARCHAR(32) DEFAULT NULL")
            except Exception:
                pass
            try:
                cur.execute("ALTER TABLE usuario ADD COLUMN verification_exp DATETIME DEFAULT NULL")
            except Exception:
                pass
            conn.commit()
    finally:
        conn.close()


def ensure_foto_columns():
    """Asegura que las columnas 'foto' en las tablas usuario y prenda permitan almacenar cadenas largas (LONGTEXT).
    Se ejecuta al inicio para evitar problemas cuando el frontend envía imágenes en base64.
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            try:
                # Cambiar a LONGTEXT para manejar imágenes base64 grandes
                cur.execute("ALTER TABLE usuario MODIFY COLUMN foto LONGTEXT")
                print("Columna foto de usuario actualizada a LONGTEXT")
            except Exception as e:
                print(f"Error actualizando columna foto de usuario: {e}")
            try:
                cur.execute("ALTER TABLE prenda MODIFY COLUMN foto LONGTEXT")
                print("Columna foto de prenda actualizada a LONGTEXT")
            except Exception as e:
                print(f"Error actualizando columna foto de prenda: {e}")
            conn.commit()
    finally:
        conn.close()


def ensure_wishlist_table():
    """Crea la tabla lista_deseos si no existe"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS lista_deseos (
                    id_lista_deseos INT AUTO_INCREMENT PRIMARY KEY,
                    id_usuario INT NOT NULL,
                    id_publicacion INT NOT NULL,
                    fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
                    FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion) ON DELETE CASCADE,
                    UNIQUE KEY unique_wishlist (id_usuario, id_publicacion)
                )
            """)
            conn.commit()
            print("Tabla lista_deseos creada/verificada correctamente")
    except Exception as e:
        print(f"Error creando tabla lista_deseos: {e}")
    finally:
        conn.close()


def generate_code(length=6):
    return ''.join(random.choices('0123456789', k=length))


def send_email(to_address, subject, body):
    # Si no hay configuración SMTP, loggear y devolver False
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
        print(f"SMTP no configurado. Código/email para {to_address}:\n{body}")
        return False
    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = SMTP_FROM
        msg['To'] = to_address
        msg.set_content(body)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print('Error enviando email:', e)
        return False


@app.route('/api/contact', methods=['POST'])
def contact():
    """Endpoint simple para enviar contacto desde el frontend hacia el correo del proyecto."""
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    subject = data.get('subject', 'Contacto desde sitio').strip()
    message = data.get('message', '').strip()

    if not email or not message:
        return jsonify({'error': 'Correo y mensaje son requeridos'}), 400

    body = f"Contacto desde la web:\n\nNombre: {name}\nCorreo: {email}\nAsunto: {subject}\n\nMensaje:\n{message}\n"

    # Destino fijo
    target = 'styleInfinite90@gmail.com'

    sent = send_email(target, subject, body)
    if not sent:
        # Si no se pudo enviar por SMTP, devolver éxito simulando (pero loggear)
        print('[WARN] No se pudo enviar correo de contacto por SMTP. Mensaje:')
        print(body)
        # Devolver 200 para no romper la UX en desarrollo, pero indicar advertencia
        return jsonify({'ok': True, 'warning': 'SMTP no configurado o fallo enviando. El mensaje fue registrado en el servidor.'}), 200

    return jsonify({'ok': True, 'message': 'Mensaje enviado correctamente'}), 200


def send_email_with_attachments(to_address, subject, body, attachments=None):
    """Envía un correo y adjunta archivos. `attachments` es una lista de rutas absolutas a archivos."""
    # Si no hay configuración SMTP, loggear y devolver False
    if not SMTP_HOST or not SMTP_USER or not SMTP_PASSWORD:
        print(f"SMTP no configurado. Email para {to_address}:\n{subject}\n{body}\nAdjuntos: {attachments}")
        return False
    try:
        msg = EmailMessage()
        msg['Subject'] = subject
        msg['From'] = SMTP_FROM
        msg['To'] = to_address
        msg.set_content(body)

        if attachments:
            import mimetypes
            for path in attachments:
                try:
                    ctype, encoding = mimetypes.guess_type(path)
                    if ctype is None:
                        ctype = 'application/octet-stream'
                    maintype, subtype = ctype.split('/', 1)
                    with open(path, 'rb') as f:
                        file_data = f.read()
                        filename = os.path.basename(path)
                        msg.add_attachment(file_data, maintype=maintype, subtype=subtype, filename=filename)
                except Exception as e:
                    print(f"Error adjuntando archivo {path}: {e}")

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        print('Error enviando email con adjuntos:', e)
        return False


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    # Campos requeridos mínimos
    required = ['correo_electronico', 'contrasena', '1_nombre', '1_apellido']
    if not all(k in data for k in required):
        return jsonify({'error': 'Faltan campos requeridos'}), 400

    email = data['correo_electronico']
    password = data['contrasena']
    first_name = data.get('1_nombre', '')
    second_name = data.get('2_nombre', '')
    last_name = data.get('1_apellido', '')
    second_last = data.get('2_apellido', '')
    talla = data.get('talla', '')
    fecha_nacimiento = data.get('fecha_nacimiento') or None
    foto = data.get('foto', '')

    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # verificar si existe
            cur.execute('SELECT id_usuario FROM usuario WHERE correo_electronico=%s', (email,))
            if cur.fetchone():
                return jsonify({'error': 'Usuario ya existe'}), 400
            
            # Generar código de verificación ANTES de insertar
            code = generate_code()
            exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
            
            # Insertar usuario con código de verificación
            sql = (
                "INSERT INTO usuario (`1_nombre`, `2_nombre`, `1_apellido`, `2_apellido`, correo_electronico, contrasena, talla, fecha_nacimiento, foto, verified, verification_code, verification_exp) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            )
            cur.execute(sql, (first_name, second_name, last_name, second_last, email, hashed, talla, fecha_nacimiento, foto, 0, code, exp))
            conn.commit()
            
            # Enviar correo una sola vez
            send_email(email, 'Código de verificación', f'Tu código de verificación es: {code}')
            print(f"[DEBUG] Sent verification code to {email}: {code}")
            return jsonify({
                'message': 'Usuario registrado correctamente. Se ha enviado un código de verificación a tu correo.', 
                'verification_required': True,
                'email': email
            }), 201
    finally:
        conn.close()


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('correo_electronico')
    password = data.get('contrasena')
    if not email or not password:
        return jsonify({'error': 'Credenciales requeridas'}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id_usuario, contrasena, `1_nombre`, `1_apellido`, verification_code, verification_exp, verified FROM usuario WHERE correo_electronico=%s', (email,))
            user = cur.fetchone()
            if not user:
                return jsonify({'error': 'Usuario no encontrado'}), 404
            
            # Manejar el hash de contraseña correctamente
            stored_password = user['contrasena']
            if isinstance(stored_password, str):
                stored_password = stored_password.encode('utf-8')
            
            try:
                # Intentar verificar la contraseña con bcrypt
                if not bcrypt.checkpw(password.encode('utf-8'), stored_password):
                    return jsonify({'error': 'Contraseña inválida'}), 401
            except ValueError as e:
                # Si el hash está corrupto, devolver error específico
                print(f"[ERROR] Hash corrupto para usuario {email}: {e}")
                return jsonify({'error': 'Usuario con datos corruptos. Contacte al administrador.'}), 500
            except Exception as e:
                # Cualquier otro error de bcrypt
                print(f"[ERROR] Error de bcrypt para usuario {email}: {e}")
                return jsonify({'error': 'Error de autenticación'}), 500

            # Si el usuario no está verificado
            if not user.get('verified'):
                # Verificar si ya tiene un código válido
                existing_code = user.get('verification_code')
                existing_exp = user.get('verification_exp')
                
                # Solo generar nuevo código si no existe o ha expirado
                if not existing_code or not existing_exp or existing_exp < datetime.datetime.utcnow():
                    code = generate_code()
                    exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
                    cur.execute('UPDATE usuario SET verification_code=%s, verification_exp=%s WHERE id_usuario=%s', (code, exp, user['id_usuario']))
                    conn.commit()
                    send_email(email, 'Código de verificación', f'Tu código de verificación es: {code}')
                    print(f"[DEBUG] Sent NEW verification code to {email}: {code}")
                else:
                    print(f"[DEBUG] Using existing verification code for {email}")
                
                return jsonify({
                    'verification_required': True, 
                    'message': 'Debes verificar tu cuenta. Se ha enviado un código a tu correo.',
                    'email': email
                }), 200

            # Usuario verificado -> devolver token
            payload = {
                'sub': user['id_usuario'],
                'name': f"{user.get('1_nombre','')} {user.get('1_apellido','')}",
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=12)
            }
            token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm=JWT_ALGORITHM)
            if isinstance(token, bytes):
                token = token.decode('utf-8')
            print(f"[DEBUG] Login token for {email}: {token}")
            return jsonify({'token': token}), 200
    finally:
        conn.close()






@app.route('/api/me')
def me():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'logged_in': False}), 401
    token = auth.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
    except Exception as e:
        return jsonify({'logged_in': False, 'error': str(e)}), 401

    user_id = payload.get('sub')
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id_usuario, `1_nombre`, `2_nombre`, `1_apellido`, `2_apellido`, correo_electronico, rol, talla, fecha_nacimiento, foto FROM usuario WHERE id_usuario=%s', (user_id,))
            user = cur.fetchone()
            if not user:
                return jsonify({'logged_in': False}), 404
            return jsonify({'logged_in': True, 'user': user}), 200
    finally:
        conn.close()


@app.route('/api/profile', methods=['PUT'])
def update_profile():
    # se espera Authorization Bearer <token>
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
    except Exception as e:
        return jsonify({'error': 'Token inválido', 'detail': str(e)}), 401
    user_id = payload.get('sub')
    data = request.json or {}
    # campos editables: 1_nombre, 2_nombre, 1_apellido, 2_apellido, talla, fecha_nacimiento, foto
    fields = ['1_nombre', '2_nombre', '1_apellido', '2_apellido', 'talla', 'fecha_nacimiento', 'foto']
    updates = {}
    
    for k in fields:
        if k in data:
            value = data.get(k)
            # Procesar fecha_nacimiento especialmente
            if k == 'fecha_nacimiento' and value:
                try:
                    # Limpiar formato de fecha - solo queremos YYYY-MM-DD
                    value_str = str(value)
                    
                    # Si contiene 'T' (formato ISO), tomar solo la fecha
                    if 'T' in value_str:
                        value = value_str.split('T')[0]
                    # Si contiene 'GMT' o 'UTC', intentar parsear con datetime
                    elif 'GMT' in value_str or 'UTC' in value_str:
                        try:
                            # Intentar parsear formato GMT
                            dt = datetime.datetime.strptime(value_str, '%a, %d %b %Y %H:%M:%S %Z')
                            value = dt.strftime('%Y-%m-%d')
                        except:
                            try:
                                # Formato alternativo
                                dt = datetime.datetime.strptime(value_str.replace(' GMT', ''), '%a, %d %b %Y %H:%M:%S')
                                value = dt.strftime('%Y-%m-%d')
                            except:
                                print(f"Error parsing GMT date: {value}")
                                continue
                    # Validar que el formato final sea YYYY-MM-DD
                    if len(value.split('-')) != 3:
                        print(f"Invalid date format after processing: {value}")
                        continue
                        
                except Exception as e:
                    print(f"Error processing date {value}: {e}")
                    continue  # Skip this field if date processing fails
            updates[k] = value
    
    if not updates:
        return jsonify({'error': 'No hay campos para actualizar'}), 400
    
    set_clause = ', '.join([f"`{k}`=%s" for k in updates.keys()])
    values = list(updates.values())
    values.append(user_id)
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            sql = f"UPDATE usuario SET {set_clause} WHERE id_usuario=%s"
            print(f"[DEBUG] Updating profile for user {user_id}, fields: {list(updates.keys())}")
            # Para debug, mostrar el tamaño de la foto si se está actualizando
            if 'foto' in updates and updates['foto']:
                print(f"[DEBUG] Photo data length: {len(str(updates['foto']))}")
            cur.execute(sql, values)
            conn.commit()
            print(f"[DEBUG] Profile updated successfully for user {user_id}")
            return jsonify({'message': 'Perfil actualizado'}), 200
    except Exception as e:
        print(f"[ERROR] Error updating profile: {e}")
        raise
    finally:
        conn.close()


@app.route('/api/profile/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    """Obtener el perfil público de un usuario específico"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id_usuario, `1_nombre`, `2_nombre`, `1_apellido`, `2_apellido`, 
                       correo_electronico, talla, fecha_nacimiento, fecha_registro, foto
                FROM usuario 
                WHERE id_usuario = %s
            """, (user_id,))
            
            user = cur.fetchone()
            if not user:
                return jsonify({'error': 'Usuario no encontrado'}), 404
            
            # Convertir fechas a string de forma segura
            fecha_nacimiento = None
            fecha_registro = None
            
            try:
                if user.get('fecha_nacimiento'):
                    fn = user['fecha_nacimiento']
                    if hasattr(fn, 'isoformat'):  # datetime object
                        fecha_nacimiento = fn.isoformat()
                    else:
                        fecha_nacimiento = str(fn) if fn else None
            except Exception as e:
                print(f"[WARN] Error procesando fecha_nacimiento: {e}")
                
            try:
                if user.get('fecha_registro'):
                    fr = user['fecha_registro']
                    if hasattr(fr, 'isoformat'):  # datetime object
                        fecha_registro = fr.isoformat()
                    else:
                        fecha_registro = str(fr) if fr else None
            except Exception as e:
                print(f"[WARN] Error procesando fecha_registro: {e}")
            
            # Construir respuesta
            user_data = {
                'id_usuario': user.get('id_usuario'),
                '1_nombre': user.get('1_nombre'),
                '2_nombre': user.get('2_nombre'),
                '1_apellido': user.get('1_apellido'),
                '2_apellido': user.get('2_apellido'),
                'correo_electronico': user.get('correo_electronico'),
                'talla': user.get('talla'),
                'fecha_nacimiento': fecha_nacimiento,
                'fecha_registro': fecha_registro,
                'foto': user.get('foto')
            }
            
            return jsonify({'ok': True, 'data': user_data}), 200
            
    except Exception as e:
        print(f"[ERROR] Error getting user profile: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Error interno del servidor'}), 500
    finally:
        conn.close()


@app.route('/api/password/change-auth', methods=['POST'])
def password_change_auth():
    # Cambiar contraseña cuando el usuario está autenticado (se espera Authorization header)
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
    except Exception as e:
        return jsonify({'error': 'Token inválido', 'detail': str(e)}), 401
    user_id = payload.get('sub')
    data = request.json or {}
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    if not old_password or not new_password:
        return jsonify({'error': 'Contraseña actual y nueva requeridas'}), 400
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT contrasena FROM usuario WHERE id_usuario=%s', (user_id,))
            user = cur.fetchone()
            if not user:
                return jsonify({'error': 'Usuario no encontrado'}), 404
            if not bcrypt.checkpw(old_password.encode('utf-8'), user['contrasena'].encode('utf-8')):
                return jsonify({'error': 'Contraseña actual incorrecta'}), 401
            hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cur.execute('UPDATE usuario SET contrasena=%s WHERE id_usuario=%s', (hashed, user_id))
            conn.commit()
            return jsonify({'message': 'Contraseña cambiada'}), 200
    finally:
        conn.close()



@app.route('/api/verify', methods=['POST'])
def verify():
    data = request.json
    email = data.get('correo_electronico')
    code = data.get('code')
    if not email or not code:
        return jsonify({'error': 'Email y código requeridos'}), 400
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id_usuario, `1_nombre`, `1_apellido`, verification_code, verification_exp FROM usuario WHERE correo_electronico=%s', (email,))
            user = cur.fetchone()
            if not user:
                return jsonify({'error': 'Usuario no encontrado'}), 404
            if not user.get('verification_code') or str(user.get('verification_code')) != str(code):
                return jsonify({'error': 'Código inválido'}), 400
            if user.get('verification_exp') and user.get('verification_exp') < datetime.datetime.utcnow():
                return jsonify({'error': 'Código expirado'}), 400
            # marcar verificado
            cur.execute('UPDATE usuario SET verified=1, verification_code=NULL, verification_exp=NULL WHERE id_usuario=%s', (user['id_usuario'],))
            conn.commit()
            payload = {
                'sub': user['id_usuario'],
                'name': f"{user.get('1_nombre','')} {user.get('1_apellido','')}",
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=12)
            }
            token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm=JWT_ALGORITHM)
            if isinstance(token, bytes):
                token = token.decode('utf-8')
            print(f"[DEBUG] Verify token for {email}: {token}")
            return jsonify({'token': token, 'verified': True}), 200
    finally:
        conn.close()



@app.route('/api/password/send-code', methods=['POST'])
def password_send_code():
    data = request.json or {}
    correo = data.get('correo_electronico')
    if not correo:
        return jsonify({'error': 'Correo requerido'}), 400
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id_usuario FROM usuario WHERE correo_electronico=%s', (correo,))
            user = cur.fetchone()
            if not user:
                return jsonify({'error': 'Usuario no encontrado'}), 404
            code = generate_code()
            exp = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
            cur.execute('UPDATE usuario SET verification_code=%s, verification_exp=%s WHERE id_usuario=%s', (code, exp, user['id_usuario']))
            conn.commit()
            send_email(correo, 'Código para cambiar contraseña', f'Tu código para cambiar contraseña es: {code}')
            print(f"[DEBUG] Sent password code to {correo}: {code}")
            return jsonify({'message': 'Código enviado'}), 200
    finally:
        conn.close()


@app.route('/api/password/change', methods=['POST'])
def password_change():
    data = request.json or {}
    correo = data.get('correo_electronico')
    code = data.get('code')
    new_password = data.get('new_password')
    if not correo or not code or not new_password:
        return jsonify({'error': 'Correo, código y nueva contraseña son requeridos'}), 400
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id_usuario, verification_code, verification_exp FROM usuario WHERE correo_electronico=%s', (correo,))
            user = cur.fetchone()
            if not user:
                return jsonify({'error': 'Usuario no encontrado'}), 404
            if not user.get('verification_code') or str(user.get('verification_code')) != str(code):
                return jsonify({'error': 'Código inválido'}), 400
            if user.get('verification_exp') and user.get('verification_exp') < datetime.datetime.utcnow():
                return jsonify({'error': 'Código expirado'}), 400
            hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            cur.execute('UPDATE usuario SET contrasena=%s, verification_code=NULL, verification_exp=NULL WHERE id_usuario=%s', (hashed, user['id_usuario']))
            conn.commit()
            return jsonify({'message': 'Contraseña cambiada'}), 200
    finally:
        conn.close()


# Rutas para publicaciones
@app.route('/api/publications', methods=['GET'])
def get_publications():
    filters = request.args.to_dict()
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            query = '''
                SELECT p.*, pr.nombre, pr.descripcion_prenda, pr.talla, pr.foto, pr.valor,
                       u.1_nombre, u.2_nombre, u.1_apellido, u.2_apellido
                FROM publicacion p
                JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
                JOIN usuario u ON p.id_usuario = u.id_usuario
                WHERE 1=1
            '''
            params = []
            
            if 'talla' in filters:
                query += ' AND pr.talla = %s'
                params.append(filters['talla'])
            if 'estado' in filters:
                query += ' AND p.estado = %s'
                params.append(filters['estado'])
            if 'tipo_publicacion' in filters:
                query += ' AND p.tipo_publicacion = %s'
                params.append(filters['tipo_publicacion'])
            if 'valor_min' in filters:
                query += ' AND pr.valor >= %s'
                params.append(float(filters['valor_min']))
            if 'valor_max' in filters:
                query += ' AND pr.valor <= %s'
                params.append(float(filters['valor_max']))
                
            query += ' ORDER BY p.fecha_publicacion DESC'
            
            cur.execute(query, params)
            publications = cur.fetchall()
            return jsonify(publications)
    finally:
        conn.close()

@app.route('/api/publications', methods=['POST'])
def create_publication():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
    except:
        return jsonify({'error': 'Token inválido'}), 401
        
    user_id = payload.get('sub')

    # Verificar si hay archivo de imagen
    if 'foto' not in request.files:
        return jsonify({'error': 'No se proporcionó imagen'}), 400
        
    foto = request.files['foto']
    if foto.filename == '':
        return jsonify({'error': 'No se seleccionó archivo'}), 400
        
    # Guardar imagen
    filename = save_uploaded_file(foto)
    if not filename:
        return jsonify({'error': 'Tipo de archivo no permitido'}), 400
        
    # Obtener resto de datos del form
    data = request.form
    required = ['descripcion', 'tipo_publicacion', 'nombre', 'descripcion_prenda', 'talla', 'valor']
    if not all(k in data for k in required):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Crear publicación
            cur.execute('''
                INSERT INTO publicacion (descripcion, estado, tipo_publicacion, fecha_publicacion, id_usuario)
                VALUES (%s, 'Disponible', %s, NOW(), %s)
            ''', (data['descripcion'], data['tipo_publicacion'], user_id))
            
            publication_id = cur.lastrowid
            
            # Crear prenda con la URL de la imagen
            foto_url = f"/uploads/{filename}"
            cur.execute('''
                INSERT INTO prenda (nombre, descripcion_prenda, talla, foto, valor, id_publicacion)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (data['nombre'], data['descripcion_prenda'], data['talla'], 
                  foto_url, data['valor'], publication_id))
            
            conn.commit()
            return jsonify({
                'message': 'Publicación creada exitosamente',
                'publication_id': publication_id
            })
    finally:
        conn.close()

@app.route('/api/publications/<int:pub_id>', methods=['PUT', 'DELETE'])
def manage_publication(pub_id):
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
    except:
        return jsonify({'error': 'Token inválido'}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Verificar propiedad de la publicación
            cur.execute('SELECT id_usuario FROM publicacion WHERE id_publicacion = %s', (pub_id,))
            pub = cur.fetchone()
            if not pub or pub['id_usuario'] != user_id:
                return jsonify({'error': 'Publicación no encontrada o no autorizada'}), 404
            
            if request.method == 'DELETE':
                cur.execute('DELETE FROM prenda WHERE id_publicacion = %s', (pub_id,))
                cur.execute('DELETE FROM publicacion WHERE id_publicacion = %s', (pub_id,))
                conn.commit()
                return jsonify({'message': 'Publicación eliminada exitosamente'})
            else:
                # Obtener datos del formulario
                data = request.form.to_dict()
                print(f"[DEBUG] Datos del formulario: {data}")
                print(f"[DEBUG] Archivos recibidos: {list(request.files.keys())}")
                
                # Manejar imagen si se proporciona
                foto_url = None
                if 'foto' in request.files:
                    foto = request.files['foto']
                    print(f"[DEBUG] Archivo foto recibido: {foto.filename}")
                    if foto.filename != '':
                        filename = save_uploaded_file(foto)
                        print(f"[DEBUG] Archivo guardado como: {filename}")
                        if filename:
                            foto_url = f"/uploads/{filename}"
                            print(f"[DEBUG] URL de la foto: {foto_url}")
                else:
                    print("[DEBUG] No se encontró archivo 'foto' en request.files")
                
                # Actualizar publicación - solo descripcion y tipo_publicacion
                pub_updates = {}
                for key in ['descripcion', 'tipo_publicacion']:
                    if key in data and data[key].strip() != '':
                        pub_updates[key] = data[key].strip()
                
                if pub_updates:
                    set_clause = ', '.join(f'{k} = %s' for k in pub_updates.keys())
                    values = list(pub_updates.values())
                    values.append(pub_id)
                    cur.execute(f'UPDATE publicacion SET {set_clause} WHERE id_publicacion = %s', values)
                
                # Actualizar prenda - temporalmente sin estado hasta migración SQL
                prenda_updates = {}
                for key in ['nombre', 'descripcion_prenda', 'talla', 'valor']:
                    if key in data and data[key].strip() != '':
                        # Permitir valor 0 para intercambios
                        if key == 'valor':
                            try:
                                prenda_updates[key] = float(data[key])
                            except ValueError:
                                pass
                        else:
                            prenda_updates[key] = data[key].strip()
                
                # TODO: Agregar 'estado' después de ejecutar fix_estado_column.sql
                if 'estado' in data and data['estado'].strip() != '':
                    print(f"[DEBUG] Estado recibido pero columna no existe: {data['estado']}")
                    # prenda_updates['estado'] = data['estado'].strip()
                
                # Agregar foto si se actualizó
                if foto_url:
                    prenda_updates['foto'] = foto_url
                
                if prenda_updates:
                    set_clause = ', '.join(f'{k} = %s' for k in prenda_updates.keys())
                    values = list(prenda_updates.values())
                    values.append(pub_id)
                    cur.execute(f'UPDATE prenda SET {set_clause} WHERE id_publicacion = %s', values)
                
                conn.commit()
                
                # Obtener los datos actualizados para confirmar
                cur.execute('''
                    SELECT p.*, pr.* 
                    FROM publicacion p 
                    JOIN prenda pr ON p.id_publicacion = pr.id_publicacion 
                    WHERE p.id_publicacion = %s
                ''', (pub_id,))
                updated_pub = cur.fetchone()
                
                return jsonify({
                    'message': 'Publicación actualizada exitosamente',
                    'publication': updated_pub
                })
    finally:
        conn.close()

@app.route('/api/valoraciones/<int:user_id>', methods=['POST', 'GET'])
def valoraciones(user_id):
    if request.method == 'GET':
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute('''
                    SELECT v.*, u.`1_nombre` as valorador_nombre, u.`1_apellido` as valorador_apellido
                    FROM valoracion v
                    JOIN usuario u ON v.usuario_valorador_id = u.id_usuario
                    WHERE v.usuario_valorado_id = %s
                    ORDER BY v.fecha_valoracion DESC
                ''', (user_id,))
                valoraciones = cur.fetchall()
                # Devolver directamente la lista de valoraciones (frontend espera un array)
                return jsonify(valoraciones)
        finally:
            conn.close()
    else:
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'No autorizado'}), 401
        token = auth.split(' ', 1)[1]
        
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
            evaluador_id = payload.get('sub')
        except:
            return jsonify({'error': 'Token inválido'}), 401
            
        data = request.json
        if not data or 'puntaje' not in data:
            return jsonify({'error': 'Puntaje requerido'}), 400
            
        puntaje = data['puntaje']
        if not isinstance(puntaje, int) or puntaje < 1 or puntaje > 5:
            return jsonify({'error': 'Puntaje debe ser entre 1 y 5'}), 400
        
        transaction_id = data.get('transaction_id')  # Opcional, para marcar transacción como calificada
            
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                cur.execute('''
                    INSERT INTO valoracion (usuario_valorador_id, usuario_valorado_id, puntaje)
                    VALUES (%s, %s, %s)
                ''', (evaluador_id, user_id, puntaje))
                
                # Si se proporciona transaction_id, marcar como calificada
                if transaction_id:
                    try:
                        cur.execute('''
                            UPDATE transaccion 
                            SET calificado = TRUE 
                            WHERE id_transaccion = %s
                        ''', (transaction_id,))
                    except Exception as e:
                        print(f"[WARN] Error marcando transacción como calificada: {e}")
                
                conn.commit()
                return jsonify({'message': 'Valoración registrada exitosamente'})
        finally:
            conn.close()

# ===== RUTAS PARA LISTA DE DESEOS =====

@app.route('/api/wishlist', methods=['GET'])
def get_wishlist():
    """Obtiene la lista de deseos del usuario autenticado"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute('''
                SELECT ld.id_lista_deseos, ld.fecha_agregado,
                       p.id_publicacion, pr.nombre, pr.descripcion_prenda, pr.valor, pr.foto, pr.talla,
                       p.tipo_publicacion, p.estado,
                       u.id_usuario as vendedor_id, u.1_nombre, u.1_apellido
                FROM lista_deseos ld
                JOIN publicacion p ON ld.id_publicacion = p.id_publicacion
                JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
                JOIN usuario u ON p.id_usuario = u.id_usuario
                WHERE ld.id_usuario = %s
                ORDER BY ld.fecha_agregado DESC
            ''', (user_id,))
            wishlist = cur.fetchall()
            return jsonify(wishlist)
    except Exception as e:
        return jsonify({'error': 'Error de autorización', 'detail': str(e)}), 401
    finally:
        conn.close()

@app.route('/api/wishlist/<int:publication_id>', methods=['POST'])
def add_to_wishlist(publication_id):
    """Agrega una publicación a la lista de deseos"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Verificar que la publicación existe y no es del mismo usuario
            cur.execute('SELECT id_usuario FROM publicacion WHERE id_publicacion = %s', (publication_id,))
            publication = cur.fetchone()
            if not publication:
                return jsonify({'error': 'Publicación no encontrada'}), 404
            
            if publication['id_usuario'] == user_id:
                return jsonify({'error': 'No puedes agregar tu propia publicación a la lista de deseos'}), 400
            
            # Intentar agregar a la lista de deseos
            try:
                cur.execute('''
                    INSERT INTO lista_deseos (id_usuario, id_publicacion) 
                    VALUES (%s, %s)
                ''', (user_id, publication_id))
                conn.commit()
                return jsonify({'message': 'Agregado a la lista de deseos', 'added': True})
            except pymysql.IntegrityError:
                # Ya existe en la lista de deseos
                return jsonify({'error': 'Ya está en tu lista de deseos'}), 400
    except Exception as e:
        return jsonify({'error': 'Error de autorización', 'detail': str(e)}), 401
    finally:
        conn.close()

@app.route('/api/wishlist/<int:publication_id>', methods=['DELETE'])
def remove_from_wishlist(publication_id):
    """Elimina una publicación de la lista de deseos"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute('''
                DELETE FROM lista_deseos 
                WHERE id_usuario = %s AND id_publicacion = %s
            ''', (user_id, publication_id))
            
            if cur.rowcount > 0:
                conn.commit()
                return jsonify({'message': 'Eliminado de la lista de deseos', 'removed': True})
            else:
                return jsonify({'error': 'No se encontró en la lista de deseos'}), 404
    except Exception as e:
        return jsonify({'error': 'Error de autorización', 'detail': str(e)}), 401
    finally:
        conn.close()

@app.route('/api/wishlist/check/<int:publication_id>', methods=['GET'])
def check_wishlist_status(publication_id):
    """Verifica si una publicación está en la lista de deseos del usuario"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'in_wishlist': False})  # Si no está autenticado, no está en wishlist
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            cur.execute('''
                SELECT id_lista_deseos FROM lista_deseos 
                WHERE id_usuario = %s AND id_publicacion = %s
            ''', (user_id, publication_id))
            result = cur.fetchone()
            return jsonify({'in_wishlist': result is not None})
    except Exception:
        return jsonify({'in_wishlist': False})
    finally:
        conn.close()

@app.route('/api/admin/clean-corrupt-users', methods=['POST'])
def clean_corrupt_users():
    """Ruta temporal para limpiar usuarios con hashes corruptos"""
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Obtener todos los usuarios
            cur.execute('SELECT id_usuario, correo_electronico, contrasena FROM usuario')
            users = cur.fetchall()
            
            corrupt_users = []
            
            for user in users:
                try:
                    # Probar el hash
                    password_hash = user['contrasena']
                    if isinstance(password_hash, str):
                        password_hash = password_hash.encode('utf-8')
                    bcrypt.checkpw(b'test_password', password_hash)
                except Exception:
                    corrupt_users.append(user)
            
            # Eliminar usuarios corruptos
            deleted_count = 0
            for user in corrupt_users:
                try:
                    # Eliminar publicaciones del usuario
                    cur.execute('DELETE FROM publicacion WHERE id_usuario = %s', (user['id_usuario'],))
                    # Eliminar wishlist del usuario
                    cur.execute('DELETE FROM lista_deseos WHERE id_usuario = %s', (user['id_usuario'],))
                    # Eliminar el usuario
                    cur.execute('DELETE FROM usuario WHERE id_usuario = %s', (user['id_usuario'],))
                    deleted_count += 1
                except Exception as e:
                    print(f"Error eliminando usuario {user['correo_electronico']}: {e}")
            
            conn.commit()
            
            return jsonify({
                'success': True, 
                'message': f'Eliminados {deleted_count} usuarios corruptos',
                'deleted_users': [user['correo_electronico'] for user in corrupt_users]
            })
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        conn.close()

# =====================================================
# RUTAS DE ADMINISTRACIÓN COMPLETAS - CRUD
# =====================================================

def admin_required(f):
    """Decorador para verificar permisos de administrador"""
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': 'No autorizado'}), 401
        
        token = auth.split(' ', 1)[1]
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
            user_id = payload.get('sub')
            
            # Verificar que el usuario es administrador
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    cur.execute('SELECT rol FROM usuario WHERE id_usuario = %s', (user_id,))
                    user = cur.fetchone()
                    if not user or user['rol'] != 'Administrador':
                        return jsonify({'error': 'Permisos insuficientes'}), 403
            finally:
                conn.close()
                
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token inválido'}), 401
        
        return f(*args, **kwargs)
    decorated.__name__ = f.__name__
    return decorated

# ==================== CRUD USUARIOS ====================

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def admin_get_users():
    """Obtener todos los usuarios con paginación y filtros"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    search = request.args.get('search', '')
    role_filter = request.args.get('role', '')
    verified_filter = request.args.get('verified', '')
    
    offset = (page - 1) * limit
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Construir consulta con filtros
            where_conditions = []
            params = []
            
            if search:
                where_conditions.append("(1_nombre LIKE %s OR 1_apellido LIKE %s OR correo_electronico LIKE %s)")
                search_param = f"%{search}%"
                params.extend([search_param, search_param, search_param])
            
            if role_filter:
                where_conditions.append("rol = %s")
                params.append(role_filter)
                
            if verified_filter != '':
                where_conditions.append("verified = %s")
                params.append(verified_filter == 'true')
            
            where_clause = ""
            if where_conditions:
                where_clause = "WHERE " + " AND ".join(where_conditions)
            
            # Obtener total de registros
            count_query = f"SELECT COUNT(*) as total FROM usuario {where_clause}"
            cur.execute(count_query, params)
            total = cur.fetchone()['total']
            
            # Obtener usuarios paginados
            query = f"""
                SELECT id_usuario, 1_nombre, 2_nombre, 1_apellido, 2_apellido, 
                       correo_electronico, talla, fecha_nacimiento, rol, verified,
                       foto
                FROM usuario {where_clause}
                ORDER BY id_usuario DESC
                LIMIT %s OFFSET %s
            """
            cur.execute(query, params + [limit, offset])
            users = cur.fetchall()
            
            return jsonify({
                'users': users,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            })
    finally:
        conn.close()

@app.route('/api/admin/users', methods=['POST'])
@admin_required
def admin_create_user():
    """Crear nuevo usuario"""
    data = request.json
    required_fields = ['1_nombre', '1_apellido', 'correo_electronico', 'contrasena', 'rol']
    
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Faltan campos requeridos'}), 400
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Verificar si el email ya existe
            cur.execute('SELECT id_usuario FROM usuario WHERE correo_electronico = %s', (data['correo_electronico'],))
            if cur.fetchone():
                return jsonify({'error': 'El email ya está registrado'}), 400
            
            # Hash de contraseña
            hashed_password = bcrypt.hashpw(data['contrasena'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Insertar usuario
            cur.execute('''
                INSERT INTO usuario (1_nombre, 2_nombre, 1_apellido, 2_apellido, correo_electronico, 
                                   contrasena, talla, fecha_nacimiento, foto, rol, verified)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                data['1_nombre'], data.get('2_nombre'), data['1_apellido'], data.get('2_apellido'),
                data['correo_electronico'], hashed_password, data.get('talla'),
                data.get('fecha_nacimiento'), data.get('foto'), data['rol'], 
                data.get('verified', True)
            ))
            
            user_id = cur.lastrowid
            conn.commit()
            
            return jsonify({'message': 'Usuario creado exitosamente', 'user_id': user_id}), 201
    finally:
        conn.close()

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def admin_update_user(user_id):
    """Actualizar usuario existente"""
    data = request.json
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Verificar que el usuario existe
            cur.execute('SELECT id_usuario FROM usuario WHERE id_usuario = %s', (user_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Usuario no encontrado'}), 404
            
            # Construir query de actualización dinámicamente
            update_fields = []
            params = []
            
            allowed_fields = ['1_nombre', '2_nombre', '1_apellido', '2_apellido', 'correo_electronico',
                            'talla', 'fecha_nacimiento', 'foto', 'rol', 'verified']
            
            for field in allowed_fields:
                if field in data:
                    update_fields.append(f"{field} = %s")
                    params.append(data[field])
            
            # Hash de nueva contraseña si se proporciona
            if 'contrasena' in data and data['contrasena']:
                hashed_password = bcrypt.hashpw(data['contrasena'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                update_fields.append("contrasena = %s")
                params.append(hashed_password)
            
            if not update_fields:
                return jsonify({'error': 'No hay campos para actualizar'}), 400
            
            params.append(user_id)
            query = f"UPDATE usuario SET {', '.join(update_fields)} WHERE id_usuario = %s"
            cur.execute(query, params)
            conn.commit()
            
            return jsonify({'message': 'Usuario actualizado exitosamente'})
    finally:
        conn.close()

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def admin_delete_user(user_id):
    """Eliminar usuario"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Verificar que el usuario existe
            cur.execute('SELECT id_usuario, rol FROM usuario WHERE id_usuario = %s', (user_id,))
            user = cur.fetchone()
            if not user:
                return jsonify({'error': 'Usuario no encontrado'}), 404
            
            # No permitir eliminar el último administrador
            if user['rol'] == 'Administrador':
                cur.execute('SELECT COUNT(*) as count FROM usuario WHERE rol = "Administrador"')
                admin_count = cur.fetchone()['count']
                if admin_count <= 1:
                    return jsonify({'error': 'No se puede eliminar el último administrador'}), 400
            
            # Eliminar usuario (las FK con CASCADE se encargan de las dependencias)
            cur.execute('DELETE FROM usuario WHERE id_usuario = %s', (user_id,))
            conn.commit()
            
            return jsonify({'message': 'Usuario eliminado exitosamente'})
    finally:
        conn.close()

# ==================== CRUD PUBLICACIONES ====================

@app.route('/api/admin/publications', methods=['GET'])
@admin_required
def admin_get_publications():
    """Obtener todas las publicaciones con información completa"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    search = request.args.get('search', '')
    tipo_filter = request.args.get('tipo', '')
    estado_filter = request.args.get('estado', '')
    
    offset = (page - 1) * limit
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Construir consulta con filtros
            where_conditions = []
            params = []
            
            if search:
                where_conditions.append("(p.descripcion LIKE %s OR pr.nombre LIKE %s OR u.1_nombre LIKE %s OR u.1_apellido LIKE %s)")
                search_param = f"%{search}%"
                params.extend([search_param, search_param, search_param, search_param])
            
            if tipo_filter:
                where_conditions.append("p.tipo_publicacion = %s")
                params.append(tipo_filter)
                
            if estado_filter:
                where_conditions.append("p.estado = %s")
                params.append(estado_filter)
            
            where_clause = ""
            if where_conditions:
                where_clause = "WHERE " + " AND ".join(where_conditions)
            
            # Obtener total
            count_query = f"""
                SELECT COUNT(*) as total 
                FROM publicacion p 
                JOIN prenda pr ON p.id_publicacion = pr.id_publicacion 
                JOIN usuario u ON p.id_usuario = u.id_usuario 
                {where_clause}
            """
            cur.execute(count_query, params)
            total = cur.fetchone()['total']
            
            # Obtener publicaciones
            query = f"""
                SELECT p.*, pr.*, 
                       u.1_nombre, u.1_apellido, u.correo_electronico
                FROM publicacion p 
                JOIN prenda pr ON p.id_publicacion = pr.id_publicacion 
                JOIN usuario u ON p.id_usuario = u.id_usuario 
                {where_clause}
                ORDER BY p.fecha_publicacion DESC
                LIMIT %s OFFSET %s
            """
            cur.execute(query, params + [limit, offset])
            publications = cur.fetchall()
            
            return jsonify({
                'publications': publications,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            })
    finally:
        conn.close()

@app.route('/api/admin/publications/<int:pub_id>', methods=['DELETE'])
@admin_required
def admin_delete_publication(pub_id):
    """Eliminar publicación"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Verificar que existe
            cur.execute('SELECT id_publicacion FROM publicacion WHERE id_publicacion = %s', (pub_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Publicación no encontrada'}), 404
            
            # Eliminar (CASCADE eliminará la prenda asociada)
            cur.execute('DELETE FROM publicacion WHERE id_publicacion = %s', (pub_id,))
            conn.commit()
            
            return jsonify({'message': 'Publicación eliminada exitosamente'})
    finally:
        conn.close()

# ==================== CRUD PAGOS ====================

@app.route('/api/admin/payments', methods=['GET'])
@admin_required
def admin_get_payments():
    """Obtener todos los pagos"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    estado_filter = request.args.get('estado', '')
    
    offset = (page - 1) * limit
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            where_clause = ""
            params = []
            
            if estado_filter:
                where_clause = "WHERE pag.estado_pago = %s"
                params.append(estado_filter)
            
            # Total
            count_query = f"""
                SELECT COUNT(*) as total 
                FROM pago pag 
                JOIN usuario u ON pag.id_usuario = u.id_usuario 
                JOIN publicacion p ON pag.id_publicacion = p.id_publicacion 
                {where_clause}
            """
            cur.execute(count_query, params)
            total = cur.fetchone()['total']
            
            # Pagos
            query = f"""
                SELECT pag.*, u.1_nombre, u.1_apellido, u.correo_electronico,
                       p.descripcion as descripcion_publicacion
                FROM pago pag 
                JOIN usuario u ON pag.id_usuario = u.id_usuario 
                JOIN publicacion p ON pag.id_publicacion = p.id_publicacion 
                {where_clause}
                ORDER BY pag.fecha_pago DESC
                LIMIT %s OFFSET %s
            """
            cur.execute(query, params + [limit, offset])
            payments = cur.fetchall()
            
            return jsonify({
                'payments': payments,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            })
    finally:
        conn.close()

@app.route('/api/admin/payments/<int:payment_id>', methods=['PUT'])
@admin_required
def admin_update_payment(payment_id):
    """Actualizar estado de pago"""
    data = request.json
    
    if 'estado_pago' not in data:
        return jsonify({'error': 'Estado de pago requerido'}), 400
    
    allowed_states = ['PENDIENTE', 'PROCESO', 'COMPLETADO']
    if data['estado_pago'] not in allowed_states:
        return jsonify({'error': 'Estado inválido'}), 400
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id_pago FROM pago WHERE id_pago = %s', (payment_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Pago no encontrado'}), 404
            
            cur.execute('UPDATE pago SET estado_pago = %s WHERE id_pago = %s', 
                       (data['estado_pago'], payment_id))
            conn.commit()
            
            return jsonify({'message': 'Estado de pago actualizado'})
    finally:
        conn.close()

# ==================== CRUD MENSAJES ====================

@app.route('/api/admin/messages', methods=['GET'])
@admin_required
def admin_get_messages():
    """Obtener todos los mensajes"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    offset = (page - 1) * limit
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Total
            cur.execute('SELECT COUNT(*) as total FROM mensaje')
            total = cur.fetchone()['total']
            
            # Mensajes
            query = """
                SELECT m.*, 
                       u1.1_nombre as emisor_nombre, u1.1_apellido as emisor_apellido,
                       u2.1_nombre as receptor_nombre, u2.1_apellido as receptor_apellido
                FROM mensaje m 
                JOIN usuario u1 ON m.id_emisor = u1.id_usuario 
                JOIN usuario u2 ON m.id_receptor = u2.id_usuario 
                ORDER BY m.fecha_envio DESC
                LIMIT %s OFFSET %s
            """
            cur.execute(query, [limit, offset])
            messages = cur.fetchall()
            
            return jsonify({
                'messages': messages,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            })
    finally:
        conn.close()

@app.route('/api/admin/messages/<int:message_id>', methods=['DELETE'])
@admin_required
def admin_delete_message(message_id):
    """Eliminar mensaje"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id_mensaje FROM mensaje WHERE id_mensaje = %s', (message_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Mensaje no encontrado'}), 404
            
            cur.execute('DELETE FROM mensaje WHERE id_mensaje = %s', (message_id,))
            conn.commit()
            
            return jsonify({'message': 'Mensaje eliminado exitosamente'})
    finally:
        conn.close()

# ==================== ESTADÍSTICAS ADMIN ====================

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def admin_get_stats():
    """Obtener estadísticas generales del sistema"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            stats = {}
            
            # Usuarios
            cur.execute('SELECT COUNT(*) as total FROM usuario')
            stats['total_users'] = cur.fetchone()['total']
            
            cur.execute('SELECT COUNT(*) as total FROM usuario WHERE rol = "Administrador"')
            stats['admin_users'] = cur.fetchone()['total']
            
            cur.execute('SELECT COUNT(*) as total FROM usuario WHERE verified = TRUE')
            stats['verified_users'] = cur.fetchone()['total']
            
            # Publicaciones
            cur.execute('SELECT COUNT(*) as total FROM publicacion')
            stats['total_publications'] = cur.fetchone()['total']
            
            cur.execute('SELECT COUNT(*) as total FROM publicacion WHERE estado = "Disponible"')
            stats['available_publications'] = cur.fetchone()['total']
            
            cur.execute('SELECT COUNT(*) as total FROM publicacion WHERE tipo_publicacion = "Venta"')
            stats['sales_publications'] = cur.fetchone()['total']
            
            cur.execute('SELECT COUNT(*) as total FROM publicacion WHERE tipo_publicacion = "Intercambio"')
            stats['exchange_publications'] = cur.fetchone()['total']
            
            # Pagos
            cur.execute('SELECT COUNT(*) as total FROM pago')
            stats['total_payments'] = cur.fetchone()['total']
            
            cur.execute('SELECT COUNT(*) as total FROM pago WHERE estado_pago = "COMPLETADO"')
            stats['completed_payments'] = cur.fetchone()['total']
            
            cur.execute('SELECT SUM(monto) as total FROM pago WHERE estado_pago = "COMPLETADO"')
            result = cur.fetchone()
            stats['total_revenue'] = result['total'] or 0
            
            # Mensajes
            cur.execute('SELECT COUNT(*) as total FROM mensaje')
            stats['total_messages'] = cur.fetchone()['total']
            
            # Valoraciones
            cur.execute('SELECT COUNT(*) as total FROM valoracion')
            stats['total_ratings'] = cur.fetchone()['total']
            
            cur.execute('SELECT AVG(puntaje) as average FROM valoracion')
            result = cur.fetchone()
            stats['average_rating'] = round(result['average'] or 0, 2)
            
            return jsonify(stats)
    finally:
        conn.close()

# ==================== VALORACIONES ====================

@app.route('/api/admin/ratings', methods=['GET'])
@admin_required
def admin_get_ratings():
    """Obtener todas las valoraciones"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 10))
    
    offset = (page - 1) * limit
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Total
            cur.execute('SELECT COUNT(*) as total FROM valoracion')
            total = cur.fetchone()['total']
            
            # Valoraciones
            query = """
                SELECT v.*, 
                       u1.1_nombre as valorador_nombre, u1.1_apellido as valorador_apellido,
                       u2.1_nombre as valorado_nombre, u2.1_apellido as valorado_apellido
                FROM valoracion v 
                JOIN usuario u1 ON v.usuario_valorador_id = u1.id_usuario 
                JOIN usuario u2 ON v.usuario_valorado_id = u2.id_usuario 
                ORDER BY v.fecha_valoracion DESC
                LIMIT %s OFFSET %s
            """
            cur.execute(query, [limit, offset])
            ratings = cur.fetchall()
            
            return jsonify({
                'ratings': ratings,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            })
    finally:
        conn.close()

# ===== RUTAS DE MENSAJERÍA =====

@app.route('/api/conversations', methods=['GET'])
def get_conversations():
    """Obtener todas las conversaciones del usuario"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Obtener conversaciones con información del último mensaje y mensajes no leídos
            cur.execute('''
                SELECT 
                    other_user_id,
                    other_user_name,
                    last_message_time,
                    last_message,
                    unread_count
                FROM (
                    SELECT 
                        CASE 
                            WHEN m.id_emisor = %s THEN m.id_receptor 
                            ELSE m.id_emisor 
                        END as other_user_id,
                        CASE 
                            WHEN m.id_emisor = %s THEN CONCAT(ur.1_nombre, ' ', ur.1_apellido)
                            ELSE CONCAT(ue.1_nombre, ' ', ue.1_apellido)
                        END as other_user_name,
                        MAX(m.fecha_envio) as last_message_time,
                        '' as last_message,
                        SUM(CASE WHEN m.id_receptor = %s AND m.leido = FALSE THEN 1 ELSE 0 END) as unread_count
                    FROM mensaje m
                    JOIN usuario ue ON m.id_emisor = ue.id_usuario
                    JOIN usuario ur ON m.id_receptor = ur.id_usuario
                    WHERE m.id_emisor = %s OR m.id_receptor = %s
                    GROUP BY other_user_id, other_user_name
                ) conv
                ORDER BY last_message_time DESC
            ''', (user_id, user_id, user_id, user_id, user_id))
            
            conversations = cur.fetchall()
            return jsonify(conversations)
            
    except Exception as e:
        return jsonify({'error': 'Error de autorización', 'detail': str(e)}), 401
    finally:
        conn.close()

@app.route('/api/messages/<int:other_user_id>', methods=['GET'])
def get_messages_with_user(other_user_id):
    """Obtener mensajes entre el usuario actual y otro usuario"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Obtener mensajes entre los dos usuarios
            cur.execute('''
                SELECT m.*, 
                       ue.1_nombre as emisor_nombre, ue.1_apellido as emisor_apellido,
                       ur.1_nombre as receptor_nombre, ur.1_apellido as receptor_apellido
                FROM mensaje m
                JOIN usuario ue ON m.id_emisor = ue.id_usuario
                JOIN usuario ur ON m.id_receptor = ur.id_usuario
                WHERE (m.id_emisor = %s AND m.id_receptor = %s)
                   OR (m.id_emisor = %s AND m.id_receptor = %s)
                ORDER BY m.fecha_envio ASC
            ''', (user_id, other_user_id, other_user_id, user_id))
            
            messages = cur.fetchall()
            return jsonify(messages)
            
    except Exception as e:
        return jsonify({'error': 'Error de autorización', 'detail': str(e)}), 401
    finally:
        conn.close()

@app.route('/api/messages', methods=['POST'])
def send_message():
    """Enviar un mensaje a otro usuario"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        data = request.get_json()
        if not data or 'recipient_id' not in data or 'content' not in data:
            return jsonify({'error': 'Datos incompletos'}), 400
        
        recipient_id = data['recipient_id']
        content = data['content'].strip()
        
        if not content:
            return jsonify({'error': 'El mensaje no puede estar vacío'}), 400
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Verificar que el receptor existe
            cur.execute('SELECT id_usuario FROM usuario WHERE id_usuario = %s', (recipient_id,))
            if not cur.fetchone():
                return jsonify({'error': 'Usuario receptor no encontrado'}), 404
            
            # Insertar mensaje
            cur.execute('''
                INSERT INTO mensaje (id_emisor, id_receptor, contenido, fecha_envio, leido)
                VALUES (%s, %s, %s, NOW(), FALSE)
            ''', (user_id, recipient_id, content))
            
            message_id = cur.lastrowid
            conn.commit()
            
            # Obtener el mensaje completo para devolverlo
            cur.execute('''
                SELECT m.*, 
                       ue.1_nombre as emisor_nombre, ue.1_apellido as emisor_apellido,
                       ur.1_nombre as receptor_nombre, ur.1_apellido as receptor_apellido
                FROM mensaje m
                JOIN usuario ue ON m.id_emisor = ue.id_usuario
                JOIN usuario ur ON m.id_receptor = ur.id_usuario
                WHERE m.id_mensaje = %s
            ''', (message_id,))
            
            message = cur.fetchone()
            return jsonify(message), 201
            
    except Exception as e:
        return jsonify({'error': 'Error al enviar mensaje', 'detail': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/messages/<int:other_user_id>/read', methods=['PUT'])
def mark_messages_as_read(other_user_id):
    """Marcar mensajes como leídos"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Marcar mensajes como leídos
            cur.execute('''
                UPDATE mensaje 
                SET leido = TRUE 
                WHERE id_emisor = %s AND id_receptor = %s AND leido = FALSE
            ''', (other_user_id, user_id))
            
            conn.commit()
            return jsonify({'message': 'Mensajes marcados como leídos'})
            
    except Exception as e:
        return jsonify({'error': 'Error al marcar mensajes', 'detail': str(e)}), 500
    finally:
        conn.close()

# ===== RUTAS DE TRANSACCIONES/COMPRAS =====

@app.route('/api/transactions', methods=['GET'])
def get_my_transactions():
    """Obtener transacciones del usuario (como comprador o vendedor)"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        transaction_type = request.args.get('type', 'all')  # all, buying, selling
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Construcción de la consulta según el tipo
            where_clause = ""
            if transaction_type == 'buying':
                where_clause = "AND t.id_comprador = %s"
            elif transaction_type == 'selling':
                where_clause = "AND p.id_usuario = %s"
            else:  # all
                where_clause = "AND (t.id_comprador = %s OR p.id_usuario = %s)"
            
            query = f'''
                SELECT t.*, p.*, pr.nombre, pr.foto, pr.valor,
                       uc.id_usuario as id_comprador, uc.`1_nombre` as comprador_nombre, uc.`1_apellido` as comprador_apellido,
                       uv.id_usuario as id_usuario, uv.`1_nombre` as vendedor_nombre, uv.`1_apellido` as vendedor_apellido
                FROM transaccion t
                JOIN publicacion p ON t.id_publicacion = p.id_publicacion
                JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
                JOIN usuario uc ON t.id_comprador = uc.id_usuario
                JOIN usuario uv ON p.id_usuario = uv.id_usuario
                WHERE 1=1 {where_clause}
                ORDER BY t.fecha_inicio DESC
            '''
            
            if transaction_type == 'all':
                cur.execute(query, (user_id, user_id))
            else:
                cur.execute(query, (user_id,))
            
            transactions = cur.fetchall()
            return jsonify(transactions)
            
    except Exception as e:
        return jsonify({'error': 'Error al obtener transacciones', 'detail': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/transactions', methods=['POST'])
def initiate_transaction():
    """Iniciar una transacción/compra"""
    print("[DEBUG] Iniciando transacción...")
    
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        print("[DEBUG] Error: No hay token de autorización")
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        print(f"[DEBUG] Usuario autenticado: {user_id}")
        
        data = request.get_json()
        print(f"[DEBUG] Datos recibidos: {data}")
        
        if not data or 'publication_id' not in data:
            print("[DEBUG] Error: ID de publicación faltante")
            return jsonify({'error': 'ID de publicación requerido'}), 400
        
        publication_id = data['publication_id']
        message = data.get('message', '')
        print(f"[DEBUG] publication_id: {publication_id}, message: '{message}'")
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Verificar que la publicación existe y está disponible
            cur.execute('''
                SELECT p.*, pr.valor 
                FROM publicacion p 
                JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
                WHERE p.id_publicacion = %s
            ''', (publication_id,))
            
            publication = cur.fetchone()
            if not publication:
                return jsonify({'error': 'Publicación no encontrada o no disponible'}), 404
            
            # No permitir que el vendedor compre su propia publicación
            if publication['id_usuario'] == user_id:
                return jsonify({'error': 'No puedes comprar tu propia publicación'}), 400
            
            # Crear transacción (paso 1)
            try:
                print("[DEBUG] Intentando INSERT en transaccion...")
                cur.execute('''
                    INSERT INTO transaccion (id_publicacion, id_comprador, mensaje_inicial, fecha_inicio)
                    VALUES (%s, %s, %s, NOW())
                ''', (publication_id, user_id, message))
                print("[DEBUG] INSERT transaccion OK")
            except Exception as insert_err:
                print(f"[ERROR] INSERT transaccion falló: {insert_err}")
                traceback.print_exc()
                raise

            transaction_id = cur.lastrowid

            # NOTA: no actualizamos el estado de la publicación aquí para evitar conflictos
            # con la definición ENUM de la columna `estado` en la tabla `publicacion`.
            # El manejo del estado (reservado/en proceso) puede implementarse a nivel
            # de la capa de aplicación o mediante una migración de esquema en la BD.
            conn.commit()
            
            # Si hay un mensaje inicial, enviarlo
            if message:
                cur.execute('''
                    INSERT INTO mensaje (id_emisor, id_receptor, contenido, fecha_envio, leido)
                    VALUES (%s, %s, %s, NOW(), FALSE)
                ''', (user_id, publication['id_usuario'], f"Mensaje sobre la compra: {message}"))
                conn.commit()
            
            response = jsonify({
                'ok': True,
                'data': {
                    'transaction_id': transaction_id,
                    'message': 'Transacción iniciada exitosamente'
                }
            })
            response.headers['Access-Control-Allow-Origin'] = '*'
            return response, 201
            
    except Exception as e:
        print(f"[ERROR] Error en initiate_transaction: {e}")
        traceback.print_exc()
        response = jsonify({'ok': False, 'error': 'Error al iniciar transacción', 'detail': str(e)})
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 500
    finally:
        conn.close()

@app.route('/api/transactions/<int:transaction_id>/payment-proof', methods=['POST'])
def upload_payment_proof(transaction_id):
    """Subir comprobante de pago"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        if 'proof' not in request.files:
            return jsonify({'error': 'No se encontró archivo de comprobante'}), 400
        
        file = request.files['proof']
        if file.filename == '':
            return jsonify({'error': 'No se seleccionó archivo'}), 400
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Verificar que la transacción existe y el usuario es el comprador
            cur.execute('''
                SELECT * FROM transaccion 
                WHERE id_transaccion = %s AND id_comprador = %s AND estado = 'PENDIENTE_PAGO'
            ''', (transaction_id, user_id))
            
            transaction = cur.fetchone()
            if not transaction:
                return jsonify({'error': 'Transacción no encontrada o no autorizada'}), 404
            
            # Guardar archivo
            filename = secure_filename(file.filename)
            file_extension = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
            unique_filename = f"comprobante_{transaction_id}_{uuid.uuid4().hex}.{file_extension}"

            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)

            # Guardar en la BD la ruta pública consistente con otras tablas (/uploads/..)
            public_path = f"/uploads/{unique_filename}"
            cur.execute('''
                UPDATE transaccion 
                SET estado = 'PAGO_ENVIADO', fecha_pago_enviado = NOW(), comprobante_pago = %s
                WHERE id_transaccion = %s
            ''', (public_path, transaction_id))
            
            conn.commit()
            # Enviar correo al vendedor con el comprobante adjunto
            try:
                # Obtener información del vendedor
                cur.execute('''
                    SELECT u.correo_electronico, u.`1_nombre`, u.`1_apellido`, p.id_publicacion
                    FROM publicacion p
                    JOIN usuario u ON p.id_usuario = u.id_usuario
                    WHERE p.id_publicacion = %s
                ''', (transaction['id_publicacion'],))
                seller = cur.fetchone()
                if seller and seller.get('correo_electronico'):
                    seller_email = seller['correo_electronico']
                    seller_name = f"{seller.get('1_nombre','').strip()} {seller.get('1_apellido','').strip()}".strip()
                    subject = f"Comprobante de pago recibido - Transacción {transaction_id}"
                    body = (
                        f"Hola {seller_name or 'vendedor'},\n\n"
                        f"El comprador ha subido el comprobante de pago para la transacción #{transaction_id}.\n"
                        "El archivo está adjuntado a este correo.\n\n"
                        "Saludos,\nEquipo InfinitiStyle"
                    )
                    sent = send_email_with_attachments(seller_email, subject, body, attachments=[file_path])
                    if not sent:
                        print(f"[WARN] No se pudo enviar correo al vendedor {seller_email}.")
                else:
                    print(f"[WARN] No se encontró correo del vendedor para la publicación {transaction.get('id_publicacion')}")
            except Exception as e:
                print(f"[ERROR] Error enviando correo al vendedor: {e}")
            return jsonify({'message': 'Comprobante subido exitosamente', 'comprobante': public_path})
            
    except Exception as e:
        return jsonify({'error': 'Error al subir comprobante', 'detail': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/transactions/<int:transaction_id>/confirm-payment', methods=['PUT'])
def confirm_payment_received(transaction_id):
    """Confirmar recepción de pago (por vendedor)"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Verificar que la transacción existe y el usuario es el vendedor
            cur.execute('''
                SELECT t.*, p.id_usuario as vendedor_id
                FROM transaccion t
                JOIN publicacion p ON t.id_publicacion = p.id_publicacion
                WHERE t.id_transaccion = %s AND p.id_usuario = %s AND t.estado = 'PAGO_ENVIADO'
            ''', (transaction_id, user_id))
            
            transaction = cur.fetchone()
            if not transaction:
                return jsonify({'error': 'Transacción no encontrada o no autorizada'}), 404
            
            # Actualizar estado
            cur.execute('''
                UPDATE transaccion 
                SET estado = 'PAGO_CONFIRMADO', fecha_pago_confirmado = NOW()
                WHERE id_transaccion = %s
            ''', (transaction_id,))
            
            conn.commit()
            
            return jsonify({'message': 'Pago confirmado exitosamente'})
            
    except Exception as e:
        return jsonify({'error': 'Error al confirmar pago', 'detail': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/transactions/<int:transaction_id>/ship', methods=['PUT'])
def mark_as_shipped(transaction_id):
    """Marcar como enviado (por vendedor)"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        data = request.get_json() or {}
        tracking_info = data.get('tracking_info', '')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Verificar que la transacción existe y el usuario es el vendedor
            cur.execute('''
                SELECT t.*, p.id_usuario as vendedor_id
                FROM transaccion t
                JOIN publicacion p ON t.id_publicacion = p.id_publicacion
                WHERE t.id_transaccion = %s AND p.id_usuario = %s AND t.estado = 'PAGO_CONFIRMADO'
            ''', (transaction_id, user_id))
            
            transaction = cur.fetchone()
            if not transaction:
                return jsonify({'error': 'Transacción no encontrada o no autorizada'}), 404
            
            # Actualizar estado
            cur.execute('''
                UPDATE transaccion 
                SET estado = 'ENVIADO', fecha_envio = NOW(), info_seguimiento = %s
                WHERE id_transaccion = %s
            ''', (tracking_info, transaction_id))
            
            conn.commit()
            
            return jsonify({'message': 'Marcado como enviado exitosamente'})
            
    except Exception as e:
        return jsonify({'error': 'Error al marcar como enviado', 'detail': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/transactions/<int:transaction_id>/delivered', methods=['PUT'])
def confirm_delivery(transaction_id):
    """Confirmar entrega (por comprador)"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Verificar que la transacción existe y el usuario es el comprador
            cur.execute('''
                SELECT t.*, p.id_usuario as id_usuario
                FROM transaccion t
                JOIN publicacion p ON t.id_publicacion = p.id_publicacion
                WHERE t.id_transaccion = %s AND t.id_comprador = %s AND t.estado = 'ENVIADO'
            ''', (transaction_id, user_id))
            
            transaction = cur.fetchone()
            if not transaction:
                return jsonify({'error': 'Transacción no encontrada o no autorizada'}), 404
            
            # Actualizar estado y marcar publicación como no disponible
            cur.execute('''
                UPDATE transaccion 
                SET estado = 'ENTREGADO', fecha_entrega = NOW()
                WHERE id_transaccion = %s
            ''', (transaction_id,))
            
            cur.execute('''
                UPDATE publicacion 
                SET estado = 'No Disponible'
                WHERE id_publicacion = %s
            ''', (transaction['id_publicacion'],))
            
            conn.commit()
            
            return jsonify({'message': 'Entrega confirmada exitosamente', 'transaction': transaction})
            
    except Exception as e:
        return jsonify({'error': 'Error al confirmar entrega', 'detail': str(e)}), 500
    finally:
        conn.close()

@app.route('/api/transactions/<int:transaction_id>', methods=['GET'])
def get_transaction_details(transaction_id):
    """Obtener detalles de una transacción específica"""
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'No autorizado'}), 401
    token = auth.split(' ', 1)[1]
    
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=[JWT_ALGORITHM])
        user_id = payload.get('sub')
        
        conn = get_db_connection()
        with conn.cursor() as cur:
            # Obtener detalles completos de la transacción
            cur.execute('''
                SELECT t.*, p.*, pr.nombre, pr.foto, pr.valor,
                       uc.1_nombre as comprador_nombre, uc.1_apellido as comprador_apellido,
                       uv.1_nombre as vendedor_nombre, uv.1_apellido as vendedor_apellido
                FROM transaccion t
                JOIN publicacion p ON t.id_publicacion = p.id_publicacion
                JOIN prenda pr ON p.id_publicacion = pr.id_publicacion
                JOIN usuario uc ON t.id_comprador = uc.id_usuario
                JOIN usuario uv ON p.id_usuario = uv.id_usuario
                WHERE t.id_transaccion = %s AND (t.id_comprador = %s OR p.id_usuario = %s)
            ''', (transaction_id, user_id, user_id))
            
            transaction = cur.fetchone()
            if not transaction:
                return jsonify({'error': 'Transacción no encontrada'}), 404
            
            return jsonify(transaction)
            
    except Exception as e:
        return jsonify({'error': 'Error al obtener detalles', 'detail': str(e)}), 500
    finally:
        conn.close()

def ensure_transaction_table():
    """Asegurar que existe la tabla de transacciones"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Verificar si la tabla ya existe
            cur.execute("SHOW TABLES LIKE 'transaccion'")
            exists = cur.fetchone()
            
            desired_estado_enum = "ENUM('PENDIENTE_PAGO','PAGO_ENVIADO','PAGO_CONFIRMADO','ENVIADO','ENTREGADO','CANCELADO')"
            if exists:
                # Tabla existe: verificar y actualizar columnas si es necesario (no borrar datos)
                cur.execute("DESCRIBE transaccion")
                columns = cur.fetchall()
                estado_column = None
                for col in columns:
                    if col['Field'] == 'estado':
                        estado_column = col
                        break

                print(f"[DEBUG] Tabla transaccion existe. Columna estado: {estado_column}")

                # Si la columna 'estado' existe pero su definición no incluye todas las opciones, modificarla
                if estado_column:
                    col_type = estado_column.get('Type', '')
                    # Normalizar y comprobar si faltan valores en el enum
                    if 'PAGO_CONFIRMADO' not in col_type or 'PAGO_ENVIADO' not in col_type:
                        try:
                            print("[INFO] Actualizando definición de la columna 'estado' para incluir valores faltantes...")
                            cur.execute(f"ALTER TABLE transaccion MODIFY COLUMN estado {desired_estado_enum} NOT NULL DEFAULT 'PENDIENTE_PAGO'")
                            print("[INFO] Columna 'estado' actualizada")
                        except Exception as e:
                            print(f"[WARN] No se pudo actualizar la columna 'estado': {e}")
                else:
                    print("[WARN] La columna 'estado' no existe en 'transaccion' (se intentará crear tabla si es necesario)")

            else:
                # La tabla no existe: crearla
                print("[INFO] Creando tabla transaccion con definición correcta...")
                cur.execute('''
                    CREATE TABLE transaccion (
                        id_transaccion INT PRIMARY KEY AUTO_INCREMENT,
                        id_publicacion INT NOT NULL,
                        id_comprador INT NOT NULL,
                        estado ENUM('PENDIENTE_PAGO','PAGO_ENVIADO','PAGO_CONFIRMADO','ENVIADO','ENTREGADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE_PAGO',
                        fecha_inicio DATETIME NOT NULL,
                        fecha_pago_enviado DATETIME NULL,
                        fecha_pago_confirmado DATETIME NULL,
                        fecha_envio DATETIME NULL,
                        fecha_entrega DATETIME NULL,
                        comprobante_pago TEXT NULL,
                        info_seguimiento TEXT NULL,
                        mensaje_inicial TEXT NULL,
                        calificado BOOLEAN DEFAULT FALSE,
                        FOREIGN KEY (id_publicacion) REFERENCES publicacion(id_publicacion) ON DELETE CASCADE,
                        FOREIGN KEY (id_comprador) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
                        INDEX idx_comprador (id_comprador),
                        INDEX idx_publicacion (id_publicacion)
                    )
                ''')
                print("[INFO] Tabla transaccion creada exitosamente con ENUM correcto")
                # verificar creación
                cur.execute("DESCRIBE transaccion")
                new_columns = cur.fetchall()
                for col in new_columns:
                    if col['Field'] == 'estado':
                        print(f"[INFO] Nueva columna estado: {col}")
                        break
            
            # Agregar columna leido a mensaje si no existe
            try:
                cur.execute('ALTER TABLE mensaje ADD COLUMN leido BOOLEAN DEFAULT FALSE')
            except Exception as column_error:
                # La columna ya existe, ignorar el error
                if "Duplicate column name" not in str(column_error):
                    raise column_error
            
            # Agregar columna calificado a transaccion si no existe
            try:
                cur.execute('ALTER TABLE transaccion ADD COLUMN calificado BOOLEAN DEFAULT FALSE')
            except Exception as column_error:
                # La columna ya existe, ignorar el error
                if "Duplicate column name" not in str(column_error):
                    raise column_error
            
            conn.commit()
            print("[OK] Tabla de transacciones y columnas aseguradas")
    except Exception as e:
        print(f"[ERROR] Error al crear tabla de transacciones: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    # Asegurar columnas para verificación
    ensure_verification_columns()
    # Asegurar columnas de foto con tamaño apropiado
    ensure_foto_columns()
    # Asegurar tabla de lista de deseos
    ensure_wishlist_table()
    # Asegurar tabla de transacciones
    ensure_transaction_table()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
