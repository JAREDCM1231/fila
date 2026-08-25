# Explorador Interactivo de Queue (Cola)

## Descripción

Proyecto web interactivo y educativo que funciona como un simulador visual para explicar el funcionamiento de la estructura de datos **Queue (Cola)**. Permite a los estudiantes aprender el concepto de FIFO (First In, First Out) experimentando directamente con una cola animada.

## Estructura de datos

**Queue — FIFO (First In, First Out)**

Una Queue es una estructura de datos donde el primer elemento en ser agregado es el primero en ser eliminado. Se implementa utilizando un Array de JavaScript con los métodos `push()` para enqueue y `shift()` para dequeue.

## Objetivo

Que el estudiante pueda comprender y explicar el funcionamiento de una Queue, incluyendo su principio FIFO, sus operaciones principales (enqueue, dequeue, peek), su complejidad temporal, y sus aplicaciones en el mundo real, después de interactuar con el simulador.

## Funcionalidades

- **Agregar elementos** a la cola (Enqueue) con animación de entrada
- **Eliminar el primer elemento** de la cola (Dequeue) con animación de salida
- **Reiniciar** la cola al estado inicial (A, B, C, D)
- **Modo automático** que demuestra el ciclo completo FIFO paso a paso
- **Estadísticas en tiempo real**: elementos en cola, próximo en salir, total agregados, total eliminados
- **Reto interactivo** para practicar la comprensión de FIFO
- **Comparación visual** entre FIFO (Queue) y LIFO (Stack)
- **Ejemplos del mundo real** con rotación de aplicaciones
- **Mascota tortuga** con mensajes contextuales de aprendizaje
- **Explicación teórica** de la estructura, sus operaciones y su analogía
- **Análisis de rendimiento** con tabla de complejidad Big O
- **Código base** de la implementación visible en la página
- **Diseño responsive** adaptado a móviles, tablets y escritorio

## Tecnologías

- HTML5
- CSS3
- JavaScript (vanilla, sin frameworks ni dependencias externas)

## Cómo ejecutar localmente

1. Descargar o clonar el repositorio.
2. Abrir la carpeta del proyecto.
3. Abrir el archivo `index.html` en cualquier navegador web moderno.
4. Usar el simulador interactivo desde la sección "Simulador".

También se puede abrir con Visual Studio Code usando la extensão **Live Server** para una mejor experiencia de desarrollo.

## Cómo utilizar el simulador

1. Navega a la sección **Simulador** usando el menú lateral.
2. Haz clic en **➕ Agregar elemento** para agregar una letra a la cola.
3. Observa cómo el nuevo elemento aparece por la derecha (entrada).
4. Haz clic en **➖ Eliminar primero** para sacar el elemento del frente (salida).
5. Usa **🔄 Reiniciar** para volver al estado inicial con A, B, C, D.
6. Prueba el **▶️ Modo automático** para ver una demostración completa de FIFO.
7. Resuelve el **Reto** para practicar tu comprensión del orden FIFO.

## Estructura del proyecto

```text
fila/
├── index.html
├── style.css
├── script.js
├── README.md
├── .gitignore
└── assets/
    └── favicon.svg
```

## Autor

**[Nombre del estudiante]**
