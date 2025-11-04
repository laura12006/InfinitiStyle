Instrucciones básicas para el backend Flask

1) Crear un archivo .env en el directorio backend con estas variables:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=StyleInfinite
DB_PORT=3306
SECRET_KEY=cambiar_esta_clave

2) Instalar dependencias:

pip install -r requirements.txt

3) Crear la base de datos usando el archivo scripts.sql en la raíz del workspace (ejecutar en MySQL).

4) Ejecutar:

python app.py

La API correrá en http://localhost:5000
