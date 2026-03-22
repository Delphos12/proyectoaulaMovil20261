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
4. Iniciar la app:
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
