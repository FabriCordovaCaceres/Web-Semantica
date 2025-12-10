# 🔬 Sistema de Búsqueda Semántica Oncológica

Sistema web de búsqueda semántica especializado en oncología, que combina consultas a DBpedia con una ontología local personalizada. Ofrece tres modos de búsqueda y soporte multiidioma.

## ✨ Características

- 🌐 **Tres modos de búsqueda**:
  - **Online**: Consultas SPARQL en tiempo real a DBpedia
  - **Offline**: Búsqueda en caché local (500 enfermedades precargadas)
  - **Combinado**: Búsqueda paralela en ontología local + caché DBpedia

- 🌍 **Soporte Multiidioma**: Español, Inglés, Francés, Portugués
- ⚡ **Optimización de Rendimiento**: Cache de búsquedas y sin traducciones automáticas
- 🎨 **UI/UX Moderna**: Diseño premium con gradientes, animaciones y glassmorphism
- 🔍 **NLP Integrado**: Procesamiento con spaCy para búsquedas inteligentes

## 🛠️ Tecnologías

### Backend
- **Flask** - Framework web
- **SPARQLWrapper** - Consultas a DBpedia
- **Owlready2** - Manejo de ontologías OWL
- **spaCy** - Procesamiento de lenguaje natural
- **RapidFuzz** - Búsqueda difusa

### Frontend
- **React 18** - Librería UI
- **Vite** - Build tool
- **React Router** - Navegación
- **Bootstrap + CSS** - Diseño responsivo
- **React Intl** - Internacionalización

## 📦 Instalación

### Prerrequisitos
- Python 3.12+
- Node.js 18+
- npm o yarn

### Backend (Flask)

```bash
cd Flask

# Crear entorno virtual
python -m venv .venv

# Activar entorno virtual
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

# Instalar dependencias
pip install flask flask-cors owlready2 SPARQLWrapper rdflib spacy rapidfuzz mtranslate

# Descargar modelo de spaCy en español
python -m spacy download es_core_news_sm
```

### Frontend (React)

```bash
cd Frontend

# Instalar dependencias
npm install
```

## 🚀 Uso

### Iniciar Backend

```bash
cd Flask
python api/OntologyAPI.py
```

El servidor estará disponible en: `http://localhost:5000`

### Iniciar Frontend

```bash
cd Frontend
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 📂 Estructura del Proyecto

```
Web-Semantica/
├── Flask/
│   ├── api/
│   │   ├── OntologyAPI.py       # API principal
│   │   ├── dbpedia.py           # Consultas DBpedia
│   │   ├── ontology.py          # Manejo de ontología local
│   │   ├── preprocess.py        # Preprocesamiento NLP
│   │   ├── restructure.py       # Formato de resultados
│   │   └── translator.py        # Traducción
│   └── firstcode.py             # Servidor simple
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Search.jsx       # Búsqueda principal
│   │   │   ├── Result.jsx       # Tarjetas de resultados
│   │   │   └── Result.css       # Estilos premium
│   │   ├── translations/        # i18n (es, en, fr, pt)
│   │   └── service/
│   │       └── ontologyService.js
│   └── package.json
├── resourse/
│   └── ontology.owx             # Ontología oncológica
└── README.md
```

## 🎯 Endpoints de la API

### `/search` - Búsqueda Combinada
```http
GET /search?query=cancer&lang=es
```

### `/searchOnline` - Búsqueda Online (DBpedia SPARQL)
```http
GET /searchOnline?query=cancer&lang=fr
```

### `/searchOffline` - Búsqueda Offline (Cache Local)
```http
GET /searchOffline?query=tumor&lang=pt
```

### `/searchClass` - Buscar por Clase
```http
GET /searchClass?query=Cancer&lang=en
```

## 🎨 Paleta de Colores

- **Púrpura a Violeta**: `#667eea → #764ba2` (Default)
- **Rosa a Rojo**: `#f093fb → #f5576c` (DBPedia)
- **Azul Cielo**: `#4facfe → #00f2fe` (Ontología)

## 📝 Ejemplos de Consultas DL

```dls
# Tratamientos para cáncer de páncreas
Tratamiento_Medico that combate some (Cancer and cancer_nombre value "Cancer de pancreas")

# Órganos afectados por cáncer de próstata
Organo that esAfectadoPor some (Cancer and cancer_nombre value "Cancer de prostata")

# Alimentos permitidos que combaten el cáncer
Alimento_Permitido that combate some Cancer

# Centros médicos que ofrecen tratamiento
Centro_medico that ofreceTratamiento some (Tratamiento_Medico that combate some Cancer)
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- **Fabri Cordova Caceres** - [GitHub](https://github.com/FabriCordovaCaceres)

---

🤖 Desarrollado con [Claude Code](https://claude.com/claude-code)
