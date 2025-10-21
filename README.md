# Pokémon Battle App

Una aplicación web interactiva para buscar, guardar y simular batallas entre Pokémon usando la API de PokeAPI.

## Características

- **Búsqueda de Pokémon**: Busca cualquier Pokémon por nombre o ID
- **Gestión de Colección**: Guarda tus Pokémon favoritos en una lista personal
- **Sistema de Invocación**: Invoca Pokémon para prepararlos para batalla
- **Simulador de Batallas**: Simula batallas automáticas entre Pokémon invocados
- **Interfaz Moderna**: Diseño responsivo con CSS moderno

## Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **API**: PokeAPI (https://pokeapi.co/)
- **Almacenamiento**: LocalStorage del navegador
- **Contenedorización**: Docker

## Estructura del Proyecto

```
/
├── main.html          # Página principal
├── css/               # Estilos CSS
│   ├── main.css
│   ├── battle.css
│   ├── pokemon-card.css
│   └── search.css
├── js/                # Lógica JavaScript
│   ├── main.js        # Punto de entrada
│   ├── controller.js  # Controlador principal
│   ├── api.js         # Cliente de la API
│   ├── ui.js          # Manejo de la interfaz
│   └── storage.js     # Gestión del almacenamiento local
├── Dockerfile         # Configuración de Docker
├── docker-compose.yml # Orquestación de contenedores
└── README.md          # Este archivo
```

## Instalación y Uso

### Opción 1: Desarrollo Local

1. Clona el repositorio
2. Abre `main.html` en tu navegador web
3. ¡Disfruta explorando Pokémon!

### Opción 2: Usando Docker

#### Construir y Ejecutar

```bash
# Construir la imagen
docker build -t pokemon-battle-app .

# Ejecutar el contenedor
docker run -p 8080:80 pokemon-battle-app
```

#### Usando Docker Compose

```bash
# Ejecutar con docker-compose
docker-compose up -d

# Detener
docker-compose down
```

La aplicación estará disponible en `http://localhost:8080`

#### Despliegue en Google Cloud Run

```bash
# Construir la imagen
docker build -t gcr.io/[PROJECT-ID]/pokemon-battle-app .

# Subir a Google Container Registry
docker push gcr.io/[PROJECT-ID]/pokemon-battle-app

# Desplegar en Cloud Run
gcloud run deploy pokemon-battle-app \
  --image gcr.io/[PROJECT-ID]/pokemon-battle-app \
  --platform managed \
  --port 8080 \
  --allow-unauthenticated \
  --region us-central1
```

La aplicación estará disponible en la URL proporcionada por Cloud Run.

## Funcionalidades

### Búsqueda
- Busca Pokémon por nombre o número de Pokédex
- Vista previa de resultados antes de agregar

### Colección Personal
- Guarda Pokémon en tu colección personal
- Evita duplicados automáticamente
- Limpia la colección completa si es necesario

### Sistema de Batalla
- Invoca Pokémon desde tu colección para batallas
- Batallas automáticas entre dos Pokémon aleatorios
- Sistema de combate basado en estadísticas reales
- Logs detallados de cada batalla
- Soporte para múltiples invocaciones del mismo Pokémon

### Estadísticas de Combate
- HP (Puntos de Vida)
- ATK (Ataque)
- DEF (Defensa)
- SPD (Velocidad)

## API Utilizada

Esta aplicación consume la [PokeAPI](https://pokeapi.co/), una API REST gratuita que proporciona datos detallados sobre Pokémon, incluyendo:

- Información básica (nombre, ID, tipos)
- Estadísticas de combate
- Imágenes oficiales
- Habilidades y características

## Contribución

Si deseas contribuir a este proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Autor

David Vasquez Mahecha

---

¡Captura, entrena y batalla con tus Pokémon favoritos!