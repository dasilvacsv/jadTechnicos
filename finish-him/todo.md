## 2. Electrodomésticos
- Handle multiple electrodomesticos flow will be pretty much like osuna one, where Clientes/Electrodomesticos will have a table to put the electrodomesticos if u see beneficiarios from osuna is pretty much the same, make electrodomesticos simpler, just choose brand type, optional serial and number and it will add to table

## 3. Órdenes
- we need to do what i did on Estado-orden.md, see also estado-orden.png for diagram
- We need a direct way to set diagnostico and the things we set when we edit
- tener una parte donde se pueda ver el monto presupuestado y poder cambiarlo
- Make it possible to add more electrodomesticos and like when is more than one u will put like this: Select electrodomestico assigned, set item, falla just as my system of adminpro does (see ref.png), this when registering the order
- SetGarantia function(this is inside of estado-orden.md too) : 
  - Set months (auto calculates end date)
  - Unlimited option (db fields, endDate = null, garantia_ilimitada = true) (Admin only feature)
- Print guarantee Time on nota de entrega 
- When clicking on nota de entrega part, set concepto with unlimited space field (conceptoEntrega) (this featuer is stated on estado-orden.md)
- ConceptoOrden format:
  - Header (subrayado)
  - Text with namespace support
  - JSON-B storage

## 5. Garantías
- Section called ordenes/garantias done
- Fields: garantia start, garantia end, order, render the ones expired etc done

## 7. UI/UX
- Render on page the createdBy and updatedby

*** If u want to have more fun, just go and finish the ones u would like to do on full-todo.md ***