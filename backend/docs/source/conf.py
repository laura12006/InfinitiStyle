# -- Configuración general del proyecto -------------------------------------
project = 'Manual de Usuario - Style Infinite'
copyright = '©2025, Laura Contreras'
author = 'Laura Contreras'
html_title = "Manual de Usuario - Style Infinite"


# Versión y release
release = '1.0'
version = '1.0.0'

# -- Extensiones de Sphinx --------------------------------------------------

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.todo',
    'sphinx.ext.viewcode',
]

# -- Configuración de rutas -------------------------------------------------

templates_path = ['_templates']
exclude_patterns = []

# -- Opciones para la salida HTML -------------------------------------------

# Tema moderno y agradable
html_theme = 'sphinx_rtd_theme'

# Rutas de archivos estáticos (por ejemplo, imágenes, CSS)
html_static_path = ['_static']

# Configuración adicional del tema
html_theme_options = {
    'logo_only': False,
    'display_version': True,
    'collapse_navigation': False,
    'sticky_navigation': True,
    'navigation_depth': 3,
}

# Agregar un favicon o logo personalizado (si lo tienes en _static)
# html_logo = "_static/logo.png"
# html_favicon = "_static/favicon.ico"

# Mostrar TODOs en la documentación (si usas .. todo::)
todo_include_todos = True
