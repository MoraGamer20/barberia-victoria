# Barbería Victoria - Manual de Producción y Despliegue

## 1. Requisitos y Preparación
- Repositorio en GitHub configurado y actualizado.
- Cuenta en Vercel conectada a tu cuenta de GitHub.
- Proyecto de Firebase activo (Firestore Database y Authentication habilitados).
- Archivo `.gitignore` verificado (ya bloquea los archivos `.env`).

## 2. Variables de Entorno
Listado de variables requeridas para el entorno de producción. **Estas deben ser ingresadas exclusivamente en el panel de Vercel (Project Settings > Environment Variables)**. Jamás deben quedar "hardcodeadas" en el código fuente.

| Variable | Descripción | Obligatoria |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Llave pública de Firebase Client SDK | Sí |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación de Firebase | Sí |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto en Firebase | Sí |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | URL del bucket de Firebase Storage | Sí |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| Sender ID para notificaciones push | Sí |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ID de la aplicación web de Firebase | Sí |
| `FIREBASE_PROJECT_ID` | ID del proyecto para el Admin SDK en el servidor | Sí |
| `FIREBASE_CLIENT_EMAIL` | Correo del Service Account (`...@...gserviceaccount.com`) | Sí |
| `FIREBASE_PRIVATE_KEY` | Llave privada del Service Account (Respeta los saltos `\n`) | Sí |

*(Nota: En Vercel, a veces la llave privada pierde sus saltos de línea. Asegúrate de pegarla exactamente como viene en el JSON de GCP o encerrada entre comillas dobles si hay errores de parsing en el servidor).*

## 3. Estructura de Base de Datos (Firestore)

A continuación, la estructura de colecciones y campos operados por el sistema:

### `services`
- `id` (String): ID único del servicio.
- `name` (String): Nombre a mostrar al cliente.
- `area` (String): 'barberia' o 'estetica'.
- `durationMinutes` (Number): Tiempo estimado que bloquea en la agenda.
- `price` (Number): Costo al público.
- `isActive` (Boolean): Si es `false`, no aparecerá en el flujo de reservas.

### `professionals`
- `id` (String): ID único del profesional.
- `name` (String): Nombre a mostrar.
- `area` (String): 'barberia' o 'estetica'.
- `active` (Boolean): Si es `false`, no podrá recibir citas.

### `appointments`
- `id` (String): ID del documento.
- `customerName` (String): Nombre del cliente.
- `customerPhone` (String): Teléfono.
- `customerEmail` (String): Correo (Opcional).
- `notes` (String): Notas de la reserva.
- `date` (String): Fecha de la cita en formato `YYYY-MM-DD`.
- `startTime` (String): Hora de inicio `HH:MM`.
- `endTime` (String): Hora de fin calculada `HH:MM`.
- `serviceId` (String): Referencia al servicio.
- `serviceName` (String): Nombre estático del servicio al momento de reservar.
- `professionalId` (String): Referencia al profesional.
- `area` (String): Área designada.
- `status` (String): Estado actual de la cita ('pending', 'confirmed', 'completed', 'cancelled').
- `createdAt` (Timestamp): Momento de creación.
- `updatedAt` (Timestamp): Última actualización de estado.

### `users`
- `uid` (String): ID generado por Firebase Auth al crear la cuenta.
- `email` (String): Correo del administrador.
- `role` (String): Debe ser estrictamente `"admin"` para permitir el paso al Panel de Administración.

### `business_settings` (Documento único: `default`)
- `openingTime` (String): e.g. "09:00".
- `closingTime` (String): e.g. "20:00".

### `blocked_days` / `blocked_times`
- Se utilizan opcionalmente para indicar ausencias o días festivos que inhabilitan turnos en la lógica transaccional.

## 4. Índices Recomendados en Firestore
Para un óptimo rendimiento en producción, ve a Firestore Database > Índices y crea de forma compuesta:

| Colección | Campo 1 | Campo 2 | Orden |
|---|---|---|---|
| `appointments` | `date` | `startTime` | Ascendente en ambos |
| `appointments` | `professionalId` | `date` | Ascendente en ambos |
| `blocked_times` | `professionalId` | `date` | Ascendente en ambos |

*(Actualmente el sistema soporta ordenamientos en memoria para no fallar si olvidan crearlos, pero en volumen, el índice es crítico).*

## 5. Instrucciones de Despliegue en Vercel
1. Verifica que tu rama `main` en GitHub tenga el commit más reciente.
2. Inicia sesión en **Vercel** y haz click en "Add New Project".
3. Importa el repositorio de Barbería Victoria.
4. El "Framework Preset" se autoconfigurará como `Next.js`.
5. Abre la sección "Environment Variables" y copia/pega todas las llaves detalladas en la Sección 2.
6. Haz click en "Deploy".
7. Al finalizar, Vercel te entregará una URL de producción (e.g. `barberia-victoria.vercel.app`).
8. **Paso crítico:** Ve a Firebase Console > Authentication > Settings > Authorized domains y agrega el nuevo dominio de Vercel para permitir los inicios de sesión.

## 6. Checklist de Go-Live
Antes de anunciar el lanzamiento, ejecuta las siguientes pruebas en tu link de producción:

- [ ] Las variables de entorno de producción no tienen cruces con entornos de desarrollo.
- [ ] Tu usuario existe en Firebase Auth y su documento asociado en Firestore `users` tiene el campo `role: "admin"`.
- [ ] Prueba el **Login Admin** exitosamente en la ruta `/admin/login`.
- [ ] Entra a Servicios y Profesionales, crea y/o activa al menos uno de cada área.
- [ ] Ve a la página principal y realiza una **Reserva de prueba** como cliente.
- [ ] Ingresa al Dashboard y comprueba que las **Métricas y la Agenda** reflejan la cita creada.
- [ ] Confirma y posteriormente **Cancela** la cita de prueba.

## 7. Entrega Final y Recomendaciones

- **Estado del proyecto:** **100%** del MVP completado.
- **Riesgo Pendiente (Seguridad):** Como toda la comunicación segura de la app se hace desde Server Actions y Rutas de API mediante el Admin SDK, las reglas de Firestore en la consola de Firebase deben cerrarse. Configura las Reglas de Firebase (Rules) para `allow read, write: if false;` y tu plataforma de Vercel funcionará sin problemas bloqueando ataques externos directos.
- **Recomendación (Mantenimiento):** Habilita las copias de seguridad automáticas (Backups programados) de tu base de datos en Google Cloud Platform, esto te protegerá contra borrados accidentales desde el panel de administración.
