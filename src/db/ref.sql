
create table public.appointments (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  date date not null,
  time_slot text not null,
  technician text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint appointments_pkey primary key (id),
  constraint appointments_order_id_fkey foreign KEY (order_id) references service_orders (id)
) TABLESPACE pg_default;




create table public.brands (
  id uuid not null default gen_random_uuid (),
  name text not null,
  created_at timestamp with time zone not null default now(),
  constraint brands_pkey primary key (id)
) TABLESPACE pg_default;


create table public.service_labor (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  description text not null,
  hours numeric(5, 2) not null,
  rate numeric(10, 2) not null,
  created_at timestamp with time zone not null default now(),
  constraint service_labor_pkey primary key (id),
  constraint service_labor_order_id_fkey foreign KEY (order_id) references service_orders (id)
) TABLESPACE pg_default;

create table public.service_orders (
  id uuid not null default gen_random_uuid (),
  order_number text not null,
  client_id uuid not null,
  appliance_type uuid not null,
  brand_id uuid not null,
  model text null,
  serial_number text null,
  problem_description text not null,
  observations text null,
  service_type text not null,
  urgency text not null,
  status text not null default 'Pendiente'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint service_orders_pkey primary key (id),
  constraint service_orders_appliance_type_fkey foreign KEY (appliance_type) references appliance_types (id),
  constraint service_orders_brand_id_fkey foreign KEY (brand_id) references brands (id),
  constraint service_orders_client_id_fkey foreign KEY (client_id) references clients (id)
) TABLESPACE pg_default;

create trigger set_order_number BEFORE INSERT on service_orders for EACH row when (new.order_number is null)
execute FUNCTION generate_order_number ();

create table public.service_parts (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  description text not null,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  created_at timestamp with time zone not null default now(),
  constraint service_parts_pkey primary key (id),
  constraint service_parts_order_id_fkey foreign KEY (order_id) references service_orders (id)
) TABLESPACE pg_default;

