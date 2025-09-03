- On Nota de entrega put a switch to set as presupuesto that will just change the Text from nota de Entrega to Presupuesto
- On desassigned tecnico set a dialog of confirmation so people dont miss do it (X)
- Set the new param just as there is the fechaSeguimiento, called fechaReparacion (X)
- Set that u can disable whatsapp for a Client with a switch, notifications enabled / disabled and it will send messages to client when needed (X)
- Set Logos, in this case Create the switch condition that if user.sucursal.name is == Multiservice == render multiservice.png, do the same for servicool, serviautorizado and it will change the logo that renders on the nota de entrega based on user sucursal, is easy
- Make date that shows on Garantía be in spanish because it says May and so on, so make it say months in spanish
- Make multiEquipo possible, just add a switch where u can select multiple appliances and set them with appliance | falla for each one, and this creates the order with those service_appliances when multiEquipo enabled
- Garantías By tecnico, make that it just shows when is not 0, dont render empty ones (X)
- make a QR Code for each order that will just go to NEXT_PUBLIC_BASE_URL/ordenes/id so we can print the qr, and make it with a button to send qr via whatsapp with order Link.
- When preorder, instead of entregado , cancelado, set turn to order and set fecha de agenda





order-flow:
- The flow of order will now be like this:
It can come first as preorder or Order, when preorder u turn into an order clicking and setting fechaAgenda, u can get back to preorder, setting reasonNoOrder idk so it will show in history preorder order preorder (reason),  or assign tecnico after, then after assign tecnico goes the part that now says facturado make it say presupuestado and this part will ask for Amount + diagnostico, and set the things asked in facturado part so it cna make the presupuesto, that is the same of nota de entrega but just change the top for presupuesto with the switch, then after this we have the options part, we have the budget and diagnostic set and we can go to the next state that will go aprobado, in this case we will have to set the fechaReparacion and set as status reparando when that date set, no aprobado will just stay like that and we will have to set reason in this case we can say, this kid is broke lmfao and it will give option to go as aprobado, and pendiente por avisar  we will add fechaSeguimiento as it does the same as no aprobado can be set to aprobado, and we already defined what aprobado does, then after status reparando, we will put completado, first we will stablish garantia time, that will do what entrega does, this will fetch the concepto we setted up for nota de entrega, and we could modfiy it but it will set that as default, as well as it has iva or no, and the amount of entrega, then this will update that data and now render the data of entrega, then after this it will show the button of Activar Garantía as it was doing with reason and priority and of course that will show on the table of garantias byTEcnico