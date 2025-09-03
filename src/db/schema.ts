import { 
  varchar, uuid, boolean, text, pgTable, date, pgEnum, timestamp, decimal, numeric, 
  jsonb, index 
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// Enums
export const statusEnum = pgEnum("status", ["ACTIVE", "INACTIVE"])
// Agrega un rol para los técnicos si quieres usarlo en el futuro
export const ROLE_ENUM = pgEnum("role", ["USER", "ADMIN", "OPERATOR", "AGENT", "SUPERADMIN", "TECHNICIAN"]); // <-- AÑADIR TECHNICIAN
export const ORDER_STATUS_ENUM = pgEnum("order_status", [
  "PREORDER",
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS", 
  "COMPLETED",
  "DELIVERED",
  "CANCELLED",
  "APROBADO",
  "NO_APROBADO",
  "PENDIENTE_AVISAR",
  "FACTURADO",
  "ENTREGA_GENERADA",
  "GARANTIA_APLICADA",
  "REPARANDO"
])
export const PAYMENT_STATUS_ENUM = pgEnum("payment_status", ["PENDING", "PARTIAL", "PAID", "CANCELLED"])
export const WARRANTY_PRIORITY_ENUM = pgEnum("warranty_priority", ["BAJA", "MEDIA", "ALTA"])
export const INSTANCE_ROLE_ENUM = pgEnum("instance_role", ["administracion", "ventas", "sales", "support", "billing"])
export const INSTANCE_STATUS_ENUM = pgEnum("instance_status", ["active", "inactive", "deleted"])

// Branches/Sucursales Table
export const branches = pgTable("branches", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

export const sucursales = pgTable("sucursales", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  header: text("header"),
  logo: text("logo"),
  bottom: text("bottom"),
  // WhatsApp Instance fields
  whatsappInstanceId: uuid("whatsapp_instance_id"),
  whatsappInstanceName: text("whatsapp_instance_name"),
  whatsappInstanceStatus: text("whatsapp_instance_status").default("disconnected"),
  whatsappLastConnection: timestamp("whatsapp_last_connection", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Users Table
export const users = pgTable("users", {
  id: uuid("id").notNull().primaryKey().defaultRandom().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: ROLE_ENUM("role").default("USER"),
  branchId: uuid("branch_id").references(() => branches.id),
  lastActivityDate: date("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
})

// Instances Table
export const instances = pgTable("instances", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  instanceId: text("instance_id").unique(),
  jwt: text("jwt"),
  status: INSTANCE_STATUS_ENUM("status").default("active").notNull(),
  role: INSTANCE_ROLE_ENUM("role").default("administracion").notNull(),
  wsUrl: text("ws_url"),
  botEnabled: boolean("bot_enabled").default(false),
  branchId: uuid("branch_id").references(() => branches.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
})

// User Instances relationship table
export const userInstances = pgTable("user_instances", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  instanceId: uuid("instance_id").references(() => instances.id, { onDelete: "cascade" }).notNull(),
  canManage: boolean("can_manage").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

// Zones Table
export const zones = pgTable("zones", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Cities Table
export const cities = pgTable("cities", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  zoneId: uuid("zone_id").references(() => zones.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Clients Table
export const clients = pgTable("clients", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  document: varchar("document", { length: 255 }),
  phone: varchar("phone"),
  phone2: varchar("phone2"),
  whatsapp: varchar("whatsapp"),
  email: varchar("email"),
  status: varchar("status", { length: 255 }).notNull(),
  address: text("address"),
  zoneId: uuid("zone_id").references(() => zones.id),
  cityId: uuid("city_id").references(() => cities.id),
  sucursalId: uuid("sucursal_id").references(() => sucursales.id),
  latitude: numeric("latitude", { precision: 11, scale: 8 }),
  longitude: numeric("longitude", { precision: 12, scale: 8 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Technicians Table
export const technicians = pgTable("technicians", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: text("phone"),
  password: text("password"), // <-- NUEVO: Para guardar la contraseña encriptada
  role: ROLE_ENUM("role").default("TECHNICIAN"), // <-- NUEVO: Rol específico
  is_active: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
});

// Brands Table
export const brands = pgTable("brands", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Appliance Types Table
export const applianceTypes = pgTable("appliance_types", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Client Appliances Table
export const clientAppliances = pgTable("client_appliances", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  brandId: uuid("brand_id").references(() => brands.id).notNull(),
  applianceTypeId: uuid("appliance_type_id").references(() => applianceTypes.id).notNull(),
  name: text("name").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Service Orders Table
export const serviceOrders = pgTable(
  "service_orders",
  {
    id: uuid("id").notNull().primaryKey().defaultRandom(),
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    // Add simple numeric order code
    orderCode: decimal("order_code", { precision: 10, scale: 0 }),
    clientId: uuid("client_id")
      .references(() => clients.id)
      .notNull(),
    reference: text("reference"),
    description: text("description"),
    diagnostics: text("diagnostics"),
    status: ORDER_STATUS_ENUM("status").default("PENDING").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).default("0"),
    paymentStatus: PAYMENT_STATUS_ENUM("payment_status").default("PENDING").notNull(),
    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
    receivedDate: timestamp("received_date", { withTimezone: true }).defaultNow(),
    completedDate: timestamp("completed_date", { withTimezone: true }),
    deliveredDate: timestamp("delivered_date", { withTimezone: true }),
    
    // Scheduling and follow-up dates
    fechaAgendado: timestamp("fecha_agendado", { withTimezone: true }),
    fechaCaptacion: timestamp("fecha_captacion", { withTimezone: true }),
    fechaSeguimiento: timestamp("fecha_seguimiento", { withTimezone: true }),
    fechaReparacion: timestamp("fecha_reparacion", { withTimezone: true }),

    // Warranty fields
    garantiaStartDate: timestamp("garantia_start_date", { withTimezone: true }),
    garantiaEndDate: timestamp("garantia_end_date", { withTimezone: true }),
    garantiaIlimitada: boolean("garantia_ilimitada").default(false),
    conceptoOrden: jsonb("concepto_orden"),
    
    // New warranty fields
    razonGarantia: text("razon_garantia"),
    garantiaPrioridad: WARRANTY_PRIORITY_ENUM("garantia_prioridad"),
    
    // Budget field
    presupuestoAmount: decimal("presupuesto_amount", { precision: 10, scale: 2 }),
    
    // New IVA field
    includeIVA: boolean("include_iva").default(false),
    
    // Rejection reason
    razonNoAprobado: text("razon_no_aprobado"),

    // Client WhatsApp notification toggle
    clientNotificationsEnabled: boolean("client_notifications_enabled").default(true),
    
    // Cancellation fields
    cancellationNotes: text("cancellation_notes"),
    rescheduledFromCancellation: boolean("rescheduled_from_cancellation").default(false),
    cancellationDate: timestamp("cancellation_date", { withTimezone: true }),
    cancellationType: varchar("cancellation_type", { length: 20 }),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    createdBy: uuid("created_by").references(() => users.id),
    updatedBy: uuid("updated_by").references(() => users.id),
  },
  (table) => ({
    warrantyIdx: index("idx_service_orders_warranty").on(
      table.garantiaEndDate,
      table.garantiaIlimitada
    ),
  })
)

// Service Order Appliances Table (Junction Table)
export const serviceOrderAppliances = pgTable("service_order_appliances", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  serviceOrderId: uuid("service_order_id")
    .references(() => serviceOrders.id)
    .notNull(),
  clientApplianceId: uuid("client_appliance_id")
    .references(() => clientAppliances.id)
    .notNull(),
  falla: text("falla"),
  solucion: text("solucion"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Technician Assignments Table
export const technicianAssignments = pgTable("technician_assignments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  serviceOrderId: uuid("service_order_id")
    .references(() => serviceOrders.id)
    .notNull(),
  technicianId: uuid("technician_id")
    .references(() => technicians.id)
    .notNull(),
  assignedDate: timestamp("assigned_date", { withTimezone: true }).defaultNow(),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Delivery Notes Table
export const deliveryNotes = pgTable("delivery_notes", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  serviceOrderId: uuid("service_order_id")
    .references(() => serviceOrders.id)
    .notNull(),
  noteNumber: varchar("note_number", { length: 50 }).notNull().unique(),
  deliveryDate: timestamp("delivery_date", { withTimezone: true }).defaultNow(),
  receivedBy: varchar("received_by", { length: 255 }),
  notes: text("notes"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  includeIVA: boolean("include_iva").default(false),
  // New field for document type
  type: varchar("type", { length: 20 }).default("NOTA"), // Can be "NOTA" or "PRESUPUESTO"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Payments Table
export const payments = pgTable("payments", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  serviceOrderId: uuid("service_order_id")
    .references(() => serviceOrders.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date", { withTimezone: true }).defaultNow(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  reference: varchar("reference", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  createdBy: uuid("created_by").references(() => users.id),
  updatedBy: uuid("updated_by").references(() => users.id),
})

// Add a new table for service order status history
export const serviceOrderStatusHistory = pgTable("service_order_status_history", {
  id: uuid("id").notNull().primaryKey().defaultRandom(),
  serviceOrderId: uuid("service_order_id")
    .references(() => serviceOrders.id)
    .notNull(),
  status: ORDER_STATUS_ENUM("status").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow(),
  notes: text("notes"),
  presupuestoAmount: decimal("presupuesto_amount", { precision: 10, scale: 2 }),
  createdBy: uuid("created_by").references(() => users.id),
})

// Relations
export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
  instances: many(instances),
}))

export const usersRelations = relations(users, ({ one, many }) => ({
  branch: one(branches, {
    fields: [users.branchId],
    references: [branches.id],
  }),
  userInstances: many(userInstances),
  clientsCreated: many(clients, { relationName: "clientsCreated" }),
  clientsUpdated: many(clients, { relationName: "clientsUpdated" }),
  techniciansCreated: many(technicians, { relationName: "techniciansCreated" }),
  techniciansUpdated: many(technicians, { relationName: "techniciansUpdated" }),
  brandsCreated: many(brands, { relationName: "brandsCreated" }),
  brandsUpdated: many(brands, { relationName: "brandsUpdated" }),
  applianceTypesCreated: many(applianceTypes, { relationName: "applianceTypesCreated" }),
  applianceTypesUpdated: many(applianceTypes, { relationName: "applianceTypesUpdated" }),
  clientAppliancesCreated: many(clientAppliances, { relationName: "clientAppliancesCreated" }),
  clientAppliancesUpdated: many(clientAppliances, { relationName: "clientAppliancesUpdated" }),
  serviceOrdersCreated: many(serviceOrders, { relationName: "serviceOrdersCreated" }),
  serviceOrdersUpdated: many(serviceOrders, { relationName: "serviceOrdersUpdated" }),
  technicianAssignmentsCreated: many(technicianAssignments, { relationName: "technicianAssignmentsCreated" }),
  technicianAssignmentsUpdated: many(technicianAssignments, { relationName: "technicianAssignmentsUpdated" }),
  deliveryNotesCreated: many(deliveryNotes, { relationName: "deliveryNotesCreated" }),
  deliveryNotesUpdated: many(deliveryNotes, { relationName: "deliveryNotesUpdated" }),
  paymentsCreated: many(payments, { relationName: "paymentsCreated" }),
  paymentsUpdated: many(payments, { relationName: "paymentsUpdated" }),
  zonesCreated: many(zones, { relationName: "zonesCreated" }),
  zonesUpdated: many(zones, { relationName: "zonesUpdated" }),
  citiesCreated: many(cities, { relationName: "citiesCreated" }),
  citiesUpdated: many(cities, { relationName: "citiesUpdated" }),
}))

export const instancesRelations = relations(instances, ({ one, many }) => ({
  branch: one(branches, {
    fields: [instances.branchId],
    references: [branches.id],
  }),
  userInstances: many(userInstances),
}))

export const userInstancesRelations = relations(userInstances, ({ one }) => ({
  user: one(users, {
    fields: [userInstances.userId],
    references: [users.id],
  }),
  instance: one(instances, {
    fields: [userInstances.instanceId],
    references: [instances.id],
  }),
}))

export const zonesRelations = relations(zones, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [zones.createdBy],
    references: [users.id],
    relationName: "zonesCreated",
  }),
  updatedByUser: one(users, {
    fields: [zones.updatedBy],
    references: [users.id],
    relationName: "zonesUpdated",
  }),
  cities: many(cities),
  clients: many(clients),
}))

export const citiesRelations = relations(cities, ({ one, many }) => ({
  zone: one(zones, {
    fields: [cities.zoneId],
    references: [zones.id],
  }),
  createdByUser: one(users, {
    fields: [cities.createdBy],
    references: [users.id],
    relationName: "citiesCreated",
  }),
  updatedByUser: one(users, {
    fields: [cities.updatedBy],
    references: [users.id],
    relationName: "citiesUpdated",
  }),
  clients: many(clients),
}))

export const sucursalesRelations = relations(sucursales, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [sucursales.createdBy],
    references: [users.id],
    relationName: "sucursalesCreated",
  }),
  updatedByUser: one(users, {
    fields: [sucursales.updatedBy],
    references: [users.id],
    relationName: "sucursalesUpdated",
  }),
  clients: many(clients),
}))

export const clientsRelations = relations(clients, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [clients.createdBy],
    references: [users.id],
    relationName: "clientsCreated",
  }),
  updatedByUser: one(users, {
    fields: [clients.updatedBy],
    references: [users.id],
    relationName: "clientsUpdated",
  }),
  zone: one(zones, {
    fields: [clients.zoneId],
    references: [zones.id],
  }),
  city: one(cities, {
    fields: [clients.cityId],
    references: [cities.id],
  }),
  sucursal: one(sucursales, {
    fields: [clients.sucursalId],
    references: [sucursales.id],
  }),
  serviceOrders: many(serviceOrders),
  appliances: many(clientAppliances),
}))

export const techniciansRelations = relations(technicians, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [technicians.createdBy],
    references: [users.id],
    relationName: "techniciansCreated",
  }),
  updatedByUser: one(users, {
    fields: [technicians.updatedBy],
    references: [users.id],
    relationName: "techniciansUpdated",
  }),
  assignments: many(technicianAssignments),
}))

export const brandsRelations = relations(brands, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [brands.createdBy],
    references: [users.id],
    relationName: "brandsCreated",
  }),
  updatedByUser: one(users, {
    fields: [brands.updatedBy],
    references: [users.id],
    relationName: "brandsUpdated",
  }),
  clientAppliances: many(clientAppliances),
}))

export const applianceTypesRelations = relations(applianceTypes, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [applianceTypes.createdBy],
    references: [users.id],
    relationName: "applianceTypesCreated",
  }),
  updatedByUser: one(users, {
    fields: [applianceTypes.updatedBy],
    references: [users.id],
    relationName: "applianceTypesUpdated",
  }),
  clientAppliances: many(clientAppliances),
}))

export const clientAppliancesRelations = relations(clientAppliances, ({ one, many }) => ({
  client: one(clients, {
    fields: [clientAppliances.clientId],
    references: [clients.id],
  }),
  brand: one(brands, {
    fields: [clientAppliances.brandId],
    references: [brands.id],
  }),
  applianceType: one(applianceTypes, {
    fields: [clientAppliances.applianceTypeId],
    references: [applianceTypes.id],
  }),
  createdByUser: one(users, {
    fields: [clientAppliances.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [clientAppliances.updatedBy],
    references: [users.id],
  }),
  serviceOrders: many(serviceOrderAppliances),
}))

export const serviceOrdersRelations = relations(serviceOrders, ({ one, many }) => ({
  client: one(clients, {
    fields: [serviceOrders.clientId],
    references: [clients.id],
  }),
  createdByUser: one(users, {
    fields: [serviceOrders.createdBy],
    references: [users.id],
    relationName: "serviceOrdersCreated",
  }),
  updatedByUser: one(users, {
    fields: [serviceOrders.updatedBy],
    references: [users.id],
    relationName: "serviceOrdersUpdated",
  }),
  technicianAssignments: many(technicianAssignments),
  deliveryNotes: many(deliveryNotes),
  payments: many(payments),
  appliances: many(serviceOrderAppliances),
  statusHistory: many(serviceOrderStatusHistory),
}))

export const technicianAssignmentsRelations = relations(technicianAssignments, ({ one }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [technicianAssignments.serviceOrderId],
    references: [serviceOrders.id],
  }),
  technician: one(technicians, {
    fields: [technicianAssignments.technicianId],
    references: [technicians.id],
  }),
  createdByUser: one(users, {
    fields: [technicianAssignments.createdBy],
    references: [users.id],
    relationName: "technicianAssignmentsCreated",
  }),
  updatedByUser: one(users, {
    fields: [technicianAssignments.updatedBy],
    references: [users.id],
    relationName: "technicianAssignmentsUpdated",
  }),
}))

export const deliveryNotesRelations = relations(deliveryNotes, ({ one }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [deliveryNotes.serviceOrderId],
    references: [serviceOrders.id],
  }),
  createdByUser: one(users, {
    fields: [deliveryNotes.createdBy],
    references: [users.id],
    relationName: "deliveryNotesCreated",
  }),
  updatedByUser: one(users, {
    fields: [deliveryNotes.updatedBy],
    references: [users.id],
    relationName: "deliveryNotesUpdated",
  }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [payments.serviceOrderId],
    references: [serviceOrders.id],
  }),
  createdByUser: one(users, {
    fields: [payments.createdBy],
    references: [users.id],
    relationName: "paymentsCreated",
  }),
  updatedByUser: one(users, {
    fields: [payments.updatedBy],
    references: [users.id],
    relationName: "paymentsUpdated",
  }),
}))

export const serviceOrderAppliancesRelations = relations(serviceOrderAppliances, ({ one }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [serviceOrderAppliances.serviceOrderId],
    references: [serviceOrders.id],
  }),
  clientAppliance: one(clientAppliances, {
    fields: [serviceOrderAppliances.clientApplianceId],
    references: [clientAppliances.id],
  }),
  createdByUser: one(users, {
    fields: [serviceOrderAppliances.createdBy],
    references: [users.id],
  }),
  updatedByUser: one(users, {
    fields: [serviceOrderAppliances.updatedBy],
    references: [users.id],
  }),
}))

export const serviceOrderStatusHistoryRelations = relations(serviceOrderStatusHistory, ({ one }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [serviceOrderStatusHistory.serviceOrderId],
    references: [serviceOrders.id],
  }),
  createdByUser: one(users, {
    fields: [serviceOrderStatusHistory.createdBy],
    references: [users.id],
  }),
}))