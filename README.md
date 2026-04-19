# ParkSmart

Aplicación móvil para la gestión inteligente de parqueaderos, desarrollada con React Native y Firebase.

## Descripción

ParkSmart permite a los usuarios consultar zonas de parqueadero, ver la disponibilidad de cupos en tiempo real y realizar reservas con fecha y hora. La app cuenta con autenticación de usuarios y un panel de reservas activas.

## Tecnologías

- **React Native** con Expo
- **Firebase** (Authentication + Firestore)
- **Redux Toolkit** para manejo de estado
- **React Navigation** para navegación con tabs y stacks
- **dayjs** para manejo de fechas

## Funcionalidades

- Registro e inicio de sesión con correo y contraseña
- Consulta de zonas de parqueadero con estadísticas
- Visualización de cupos disponibles por zona
- Detalle de cada cupo con información y ubicación
- Reserva de cupos con selección de fecha y hora
- Historial de reservas con estados (activa, completada, cancelada)
- Cancelación de reservas activas

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno en `.env.local` (ver `.env.example`)
4. **Importante: Deployer Firestore Security Rules**

   El proyecto incluye reglas de seguridad en `firestore.rules`. Para desplegar:

   a. Instalar Firebase CLI (si no está instalado):

   ```bash
   npm install -g firebase-tools
   ```

   b. Autenticarse con Firebase:

   ```bash
   firebase login
   ```

   c. Desplegar las reglas:

   ```bash
   firebase deploy --only firestore:rules
   ```

5. Iniciar la app:
   ```bash
   npx expo start
   ```

## Estructura del proyecto

```
src/
  components/    - Componentes reutilizables (Button, Card, Input)
  config/        - Configuración de Firebase
  constants/     - Colores y constantes
  hooks/         - Hooks personalizados (useAuth, useParking, useReservation)
  navigation/    - Navegación (tabs + stacks)
  redux/         - Store, slices y thunks
  screens/       - Pantallas de la aplicación
  services/      - Servicios de Firebase (auth, parking, reservations)
  utils/         - Funciones utilitarias (fechas, moneda)
```

---

Segundo Entregable - "Mis Reservas" con Filtros y Cancelación

Funcionalidades Implementadas

1. Módulo "Mis Reservas" Mejorado
   Visualización de reservas activas e históricas del usuario
   Separación clara entre reservas pendientes (Activas) y completadas/canceladas (Históricas)
   Tab "Todas" para visualizar el historial completo
   Búsqueda en tiempo real por nombre de zona
   Ordenamiento automático por fecha/estado

2. Cancelación de Reserva con Reglas de Negocio
   Cancelación de reservas únicamente en estado **"Reservado"**
   Validación: impide cancelar reservas en uso, finalizadas o ya canceladas
   Mensaje de error descriptivo cuando no es posible cancelar
   Liberación automática del cupo en Firestore
   Confirmación de seguridad antes de cancelar

3. Estados de Reserva Completamente Implementados
   | Estado | Color | Descripción | Cancelable |
   |--------|-------|---|---|
   | **Reservado** | Verde Primario | Cupo pendiente de usar | Sí |
   | **En Uso** | Verde Éxito | Usuario está usando el cupo | No |
   | **Finalizado** | Azul Info | Reserva completada correctamente | No |
   | **Cancelado** | Rojo Peligro | Reserva cancelada por usuario | No |

4. Búsqueda y Filtros Funcionales
   Filtros por estado en "Mis Reservas" (Activas / Históricas / Todas)
   Búsqueda por nombre de zona en tiempo real
   Filtros por disponibilidad en "Parking Slots" (Todos / Disponibles / Reservados)
   Interfaz con botones segmentados (SegmentedButtons)
   Barra de búsqueda filtrable (SearchBar)

### Credenciales de Prueba

Usuario: test@ejemplo.com
Contraseña: 123456

O registre un nuevo usuario directamente en la app para pruebas.

Pasos para Probar las Funcionalidades

Paso 1: Instalar y ejecutar

```bash
npm install
npx expo start
# Escanear QR con Expo Go en Android/iOS
```

Paso 2: Autenticarse

1. Ingrese email y contraseña (credenciales arriba)
2. O regístrese con un nuevo usuario

Paso 3: Crear una reserva

1. Ir a "Parking" → "Zonas"
2. Seleccionar una zona (ej: Zona Centro)
3. Ver cupos disponibles (filtrados por disponibilidad si lo desea)
4. Hacer clic en "Reservar" en un cupo disponible
5. Seleccionar fecha y hora
6. Confirmar reserva

Paso 4: Verificar filter y búsqueda en "Mis Reservas"

1. Ir a "Reservas" (ícono del tab)
2. **Verá 3 tabs**:
   - **Activas**: Muestra reservas en estado "Reservado" e "En uso"
   - **Históricas**: Muestra reservas "Finalizadas" y "Canceladas"
   - **Todas**: Muestra todas las reservas
3. **Pruebe la búsqueda**: Escriba el nombre de una zona en la barra de búsqueda
4. Las reservas se filtran automáticamente

Paso 5: Cancelar una reserva

1. En la sección "Mis Reservas" → tab "Activas"
2. Seleccione una reserva en estado **"Reservado"**
3. Haga clic en "Cancelar Reserva"
4. Confirme en el diálogo de confirmación
5. La reserva pasará a estado "Cancelado"
6. El cupo volverá a estar disponible en la zona

Paso 6: Intentar cancelar reservas protegidas

1. Intente cancelar una reserva en estado "En uso" o "Finalizado"
2. Recibirá el mensaje: "Solo puedes cancelar reservas pendientes"
3. El botón de cancelación desaparece cuando no es permitido

Paso 7: Filtrar cupos en Parking Slots

1. Ir a "Parking" → Seleccionar una zona
2. **3 botones de filtro**:
   - **Todos**: Muestra todos los cupos
   - **Disponibles**: Muestra solo cupos sin reservar (verdes)
   - **Reservados**: Muestra cupos ya reservados (anaranjados)
3. Los cupos se actualizan automáticamente

Notas Técnicas

**Base de datos**: Firestore con colecciones `reservations` y `parkingZones/[zoneId]/slots`
**Estado global**: Redux Toolkit con persistencia en AsyncStorage
**Validaciones**: Server-side en Firestore + Client-side en React Native
**Colores**: Paleta de 15 colores predefinida en `src/constants.js`
**Componentes**: Reutilizables y sin dependencias externas más allá de React Native

Próximas Mejoras (Futura Entrega 3)
[ ] Notificaciones cuando una reserva expira
[ ] Historial de pagos y facturación
[ ] Valoración y comentarios de zonas
[ ] Mapas interactivos con ubicación de zonas
[ ] Extensión de reservas activas
