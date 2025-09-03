**Proceso de Estados de Orden (Organizado):**

1.  **Creación de la Orden:**
    * El usuario crea una nueva orden.
    * Opcionalmente, marca un switch de "Preorden".
    * Si es "Preorden", se carga la información del cliente, electrodoméstico y falla.
    * Al crear la orden, el estado inicial es **Orden Recibida**.

2.  **Asignación al Técnico:**
    * La orden pasa al estado **Asignado a Tecnico (Pendiente por reporte)**.
    * En el frontend, este estado se mostrará como "Asignado a Técnico" con "(Pendiente por reporte)" en un tamaño de fuente más pequeño.

3.  **Acciones del Técnico (a través de un botón):**
    * Desde el estado "Asignado a Tecnico", un botón desplegará tres opciones:
        * **Aprobado:**
            * Al seleccionar "Aprobado", se solicitará al técnico que ingrese el monto del presupuesto.
            * El monto ingresado se guardará en la base de datos en el campo `presupuestoAmount`.
            * La orden pasa al estado **Aprobado (Ingresar Monto)**.
        * **No Aprobado:**
            * Al seleccionar "No Aprobado", se creará un pago pendiente de revisión.
            * El monto del presupuesto de revision se establecerá por defecto en 5.
            * La orden pasa al estado **No Aprobado (Pago Pendiente de Revision, Monto por Defecto: 5)**.
        * **Pendiente por Avisar:**
            * Al seleccionar "Pendiente por Avisar", se podrá ingresar el `presupuestoAmount`, pero la orden quedará en un estado de espera.
            * La orden pasa al estado **Pendiente por Avisar (significa que el cliente ya se presupuestó pero está reuniendo el dinero ejemplo)**.

4.  **Facturación:**
    * Desde los estados "Aprobado", "No Aprobado" o "Pendiente por Avisar", la orden puede pasar al estado **Facturado (Confirmar/Actualizar Monto, Ingresar Concepto, Establecer Garantía)**.
    * Al pasar a "Facturado":
        * Se confirmará el monto del presupuesto (con la opción de actualizarlo).
        * Se solicitará ingresar el "Concepto de la Orden". Este campo (`conceptoOrden`) debe ser de tipo JSONB para almacenar información estructurada, por ejemplo:
            ```json
            {
              "Header": "Reparacion de Secadora",
              "Text": "- Reparacion de Motor",

            }
            ```
        * Se solicitará establecer la garantía, incluyendo:
            * Fecha de Inicio.
            * Fecha de Fin, que se calculará automáticamente al seleccionar una duración (ej., 1 mes, 3 meses).

5.  **Generación de la Orden de Entrega:**
    * Una vez que se confirma el monto, se ingresa el concepto y se establece la garantía en el estado "Facturado", se genera la **Orden de Entrega Generada**.
    * La información del `presupuestoAmount` y el `conceptoOrden` se mostrará en la orden de entrega.

**Consideraciones para el Frontend:**

* Los nombres de los estados que se muestran al usuario pueden ser diferentes a los nombres técnicos internos (render as). Esto permitirá una mayor flexibilidad para cambiar la terminología en el frontend sin afectar la lógica del backend.
* El botón de acciones en el estado "Asignado a Tecnico" debe presentar claramente las tres opciones: "Aprobado", "No Aprobado" y "Pendiente por Avisar".
* Al seleccionar "Aprobado", un campo para ingresar el monto del presupuesto debe aparecer inmediatamente.
* Al pasar al estado "Facturado", los campos para confirmar/actualizar el monto, ingresar el concepto (con un área de texto grande) y establecer la garantía (con selección de fecha de inicio y duración) deben ser claramente visibles y fáciles de usar.