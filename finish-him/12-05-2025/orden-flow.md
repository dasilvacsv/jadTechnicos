
**Proceso de Estados de Orden**

1.  **Creación Inicial:**
    * El flujo comienza con la posibilidad de crear directamente una **Nueva Orden** o registrar un **Preorden**.
    * **Preorden:** Se utiliza para registrar información inicial (cliente, electrodoméstico, falla) sin una fecha de servicio definida.

2.  **Transición de Preorden a Orden:**
    * Desde el estado **Preorden**, al hacer clic y establecer una **Fecha Agenda**, el preorden se convierte en una **Orden (Fecha Agenda)**, indicando una cita o servicio programado.
    * Es posible volver de **Orden (Fecha Agenda)** a **Preorden (Razón No Orden)** si el servicio no se concreta en ese momento, registrando el motivo. Esta transición se guarda en el historial mostrando la secuencia de estados.

3.  **Asignación del Técnico:**
    * Tanto desde una **Orden (Fecha Agenda)** como directamente desde un **Preorden**, se puede asignar un técnico, llevando la orden al estado **Asignado a Tecnico**.

4.  **Presupuesto:**
    * Después de asignar el técnico, la orden pasa al estado **Presupuestado**. En este estado, se requiere **Ingresar Monto + Diagnóstico**.
    * Este paso genera un **Presupuesto**, que visualmente es similar a la Nota de Entrega pero con un encabezado diferente y posiblemente un switch para alternar entre ambos formatos. Se establecen los campos necesarios para crear este presupuesto.

5.  **Opciones Después del Presupuesto:**
    * Una vez generado el presupuesto, se presentan las siguientes opciones:
        * **Aprobado:**
            * Al seleccionar "Aprobado", la orden pasa al estado **Aprobado**.
            * En este estado, se debe **Establecer Fecha Reparación**.
            * Una vez establecida la fecha, la orden pasa automáticamente al estado **Reparando** en esa fecha específica.
        * **No Aprobado (Razón):**
            * Si el presupuesto no es aprobado, se debe especificar la **Razón** del rechazo (ej., "Costo elevado"). La orden permanece en el estado **No Aprobado (Razón)**.
            * Desde este estado, existe la opción de volver a **Aprobado** si la situación cambia (ej., el cliente reconsidera).
        * **Pendiente por Avisar (Fecha Seguimiento):**
            * Si se selecciona "Pendiente por Avisar", se debe establecer una **Fecha Seguimiento** para contactar al cliente posteriormente. La orden permanece en el estado **Pendiente por Avisar (Fecha Seguimiento)**.
            * Similar a "No Aprobado", desde este estado también existe la opción de pasar a **Aprobado**.

6.  **Reparación y Finalización:**
    * Una vez que la reparación en el estado **Reparando** se completa, la orden pasa al estado **Completado**.
    * En este estado, primero se debe **Establecer Garantía**, definiendo el período de cobertura.
    * Luego, se genera la **Nota de Entrega (Concepto Predeterminado)**. El sistema recupera el concepto que se haya configurado previamente para las notas de entrega, pero permite modificarlo. También se define si aplica IVA y el monto final de la entrega. Esta información se actualiza en la orden y se renderiza la Nota de Entrega para su visualización.

7.  **Activación de la Garantía:**
    * Finalmente, en el estado **Completado**, se muestra el botón de **Activar Garantía**. Al activarla, esta información se registra en la tabla de garantías por técnico, de forma similar a cómo se gestionaban la razón y la prioridad anteriormente.