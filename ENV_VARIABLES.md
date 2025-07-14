# Variables de Entorno - Configuración de Procesamiento

## Variables Disponibles

### Frontend (Next.js)

```env
# Configuración de Procesamiento
NEXT_PUBLIC_PROCESSING_BATCH_SIZE=3
NEXT_PUBLIC_PROCESSING_MAX_RETRIES=3
NEXT_PUBLIC_PROCESSING_RETRY_DELAY=1000
NEXT_PUBLIC_PROCESSING_WORKER_URL=https://teleton-agente-cv-api-worker-processing-525254047375.us-central1.run.app

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Backend (Flask)

```env
# Configuración de Procesamiento
PROCESSING_BATCH_SIZE=3
PROCESSING_MAX_RETRIES=3
PROCESSING_RETRY_DELAY=1000
```

## Descripción de Variables

### `NEXT_PUBLIC_PROCESSING_BATCH_SIZE`
- **Descripción**: Número de CVs que se procesan por lote
- **Valor por defecto**: `3`
- **Rango recomendado**: `1-10`
- **Uso**: Controla cuántos CVs se envían en cada petición al worker

### `NEXT_PUBLIC_PROCESSING_MAX_RETRIES`
- **Descripción**: Número máximo de reintentos por lote
- **Valor por defecto**: `3`
- **Rango recomendado**: `1-5`
- **Uso**: Si un lote falla, se reintenta hasta este número de veces

### `NEXT_PUBLIC_PROCESSING_RETRY_DELAY`
- **Descripción**: Tiempo base de espera entre reintentos (en milisegundos)
- **Valor por defecto**: `1000`
- **Rango recomendado**: `500-3000`
- **Uso**: El tiempo real es exponencial: `delay * attempt_number`

### `NEXT_PUBLIC_PROCESSING_WORKER_URL`
- **Descripción**: URL del worker de procesamiento
- **Valor por defecto**: `https://teleton-agente-cv-api-worker-processing-525254047375.us-central1.run.app`
- **Uso**: Endpoint donde se envían los lotes para procesamiento

## Configuración Recomendada

### Desarrollo Local
```env
NEXT_PUBLIC_PROCESSING_BATCH_SIZE=3
NEXT_PUBLIC_PROCESSING_MAX_RETRIES=3
NEXT_PUBLIC_PROCESSING_RETRY_DELAY=1000
NEXT_PUBLIC_PROCESSING_WORKER_URL=http://localhost:8080
```

### Producción
```env
NEXT_PUBLIC_PROCESSING_BATCH_SIZE=5
NEXT_PUBLIC_PROCESSING_MAX_RETRIES=3
NEXT_PUBLIC_PROCESSING_RETRY_DELAY=1000
NEXT_PUBLIC_PROCESSING_WORKER_URL=https://teleton-agente-cv-api-worker-processing-525254047375.us-central1.run.app
```

## Cómo Aplicar Cambios

1. **Actualizar variables**: Modifica el archivo `.env.local`
2. **Reiniciar servidor**: `npm run dev` para desarrollo
3. **Verificar configuración**: Los valores se muestran en la UI de procesamiento

## Monitoreo

- Los valores actuales se muestran en la página de procesamiento
- El progreso se actualiza en tiempo real
- Los errores y reintentos se registran en la consola del navegador 