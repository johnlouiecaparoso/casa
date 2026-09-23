-- Casa Hotel Supabase setup
-- Run this entire file in Supabase SQL Editor.
-- Authentication users are created by Supabase Auth. The trigger creates their profile.

create extension if not exists pgcrypto;

do $enum$ begin
  create type public.user_role as enum ('guest', 'customer', 'admin');
exception when duplicate_object then null; end $enum$;
do $enum$ begin
  create type public.room_status as enum ('available', 'occupied', 'reserved', 'cleaning', 'maintenance', 'out_of_service');
exception when duplicate_object then null; end $enum$;
do $enum$ begin
  create type public.booking_status as enum ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show');
exception when duplicate_object then null; end $enum$;
do $enum$ begin
  create type public.addon_pricing as enum ('per_booking', 'per_guest', 'per_night', 'per_unit');
exception when duplicate_object then null; end $enum$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text not null,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);
create table if not exists public.amenities (id text primary key, name text not null, icon text not null);
create table if not exists public.room_types (
  id text primary key, slug text unique not null, name text not null, tagline text not null, description text not null,
  base_rate numeric not null, weekend_rate numeric not null, holiday_rate numeric not null, max_guests int not null,
  size_sqm numeric not null, bed_type text not null, photos jsonb not null default '[]', amenity_ids jsonb not null default '[]',
  featured boolean not null default false, active boolean not null default true, cancellation_policy text not null, cancellation_hours int not null
);
create table if not exists public.rooms (
  id text primary key, room_type_id text not null references public.room_types(id), number text unique not null, floor int not null, status public.room_status not null default 'available'
);
create table if not exists public.addons (
  id text primary key, slug text unique not null, name text not null, description text not null, price numeric not null,
  pricing public.addon_pricing not null, image text not null, active boolean not null default true
);
create table if not exists public.packages (
  id text primary key, name text not null, description text not null, nights int not null, room_type_id text not null references public.room_types(id),
  included_addon_ids jsonb not null default '[]', price numeric not null, image text not null, active boolean not null default true
);
create table if not exists public.reviews (
  id text primary key, guest_name text not null, room_type_id text not null references public.room_types(id), rating int not null check (rating between 1 and 5),
  title text not null, body text not null, date date not null, approved boolean not null default false, photo text
);
create table if not exists public.bookings (
  id text primary key, reference text unique not null, room_type_id text not null references public.room_types(id), room_id text references public.rooms(id),
  check_in date not null, check_out date not null, guests int not null, status public.booking_status not null default 'pending',
  guest_name text not null, email text not null, phone text not null, special_requests text, arrival_time text, travel_purpose text,
  addons jsonb not null default '[]', nightly_total numeric not null, addons_total numeric not null, subtotal numeric not null, tax numeric not null, total numeric not null,
  created_at timestamptz not null default now(), cancelled_at timestamptz, cancellation_reason text, user_id uuid references public.profiles(id) on delete set null
);
create table if not exists public.hotel_settings (
  id text primary key default 'default', name text not null, tagline text not null, address text not null, phone text not null, email text not null, tax_rate numeric not null, social jsonb not null default '[]'
);
create table if not exists public.audit_logs (id text primary key, actor text not null, action text not null, target text not null, at timestamptz not null);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $function$
begin
  insert into public.profiles (id, name, email, role) values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), new.email, 'customer') on conflict (id) do update set email = excluded.email, name = coalesce(excluded.name, profiles.name);
  return new;
end;
$function$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.amenities enable row level security;
alter table public.room_types enable row level security;
alter table public.rooms enable row level security;
alter table public.addons enable row level security;
alter table public.packages enable row level security;
alter table public.reviews enable row level security;
alter table public.bookings enable row level security;
alter table public.hotel_settings enable row level security;
alter table public.audit_logs enable row level security;

create policy "public reads reference data" on public.amenities for select using (true);
create policy "public reads active room types" on public.room_types for select using (active = true or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "public reads rooms" on public.rooms for select using (true);
create policy "public reads active addons" on public.addons for select using (active = true or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "public reads active packages" on public.packages for select using (active = true or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "public reads approved reviews" on public.reviews for select using (approved = true or auth.uid() is not null);
create policy "public reads settings" on public.hotel_settings for select using (true);
create policy "users read own profile" on public.profiles for select using (id = auth.uid());
create policy "users update own profile" on public.profiles for update using (id = auth.uid());
create policy "guests create bookings" on public.bookings for insert with check (user_id is null or user_id = auth.uid());
create policy "users read own bookings" on public.bookings for select using (user_id = auth.uid() or email = coalesce((select email from auth.users where id = auth.uid()), '') or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "users update own bookings" on public.bookings for update using (user_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "guests create reviews" on public.reviews for insert with check (true);
create policy "admins manage reviews" on public.reviews for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admins manage rooms" on public.rooms for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "admins read audit logs" on public.audit_logs for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Seed reference data. Re-running this section is safe.
insert into public.hotel_settings (id, name, tagline, address, phone, email, tax_rate, social) values
('default', 'Casa', 'Your quiet escape, close to home.', '14 Aguho Lane, Tagaytay Ridge, Cavite 4120, Philippines', '+63 917 555 0142', 'stay@casahotel.ph', 0.12, '[{"label":"Instagram","url":"https://instagram.com"},{"label":"Facebook","url":"https://facebook.com"},{"label":"Pinterest","url":"https://pinterest.com"}]'::jsonb)
on conflict (id) do update set name=excluded.name, tagline=excluded.tagline, address=excluded.address, phone=excluded.phone, email=excluded.email, tax_rate=excluded.tax_rate, social=excluded.social;

insert into public.amenities (id,name,icon) values
('am-wifi','Fast Wi-Fi','Wifi'),('am-tv','Smart TV','Tv'),('am-ac','Air Conditioning','Snowflake'),('am-balcony','Private Balcony','Trees'),('am-king','King Bed','BedDouble'),('am-coffee','Coffee & Tea Bar','Coffee'),('am-bath','Soaking Bathtub','Bath'),('am-pool','Private Pool','Waves'),('am-breakfast','Breakfast Included','Croissant'),('am-safe','In-room Safe','Lock'),('am-minibar','Mini Bar','Wine'),('am-workspace','Work Desk','Laptop'),('am-living','Living Area','Sofa'),('am-parking','Free Parking','Car'),('am-blackout','Blackout Curtains','Moon'),('am-toiletries','Artisan Toiletries','Sparkles')
on conflict (id) do update set name=excluded.name, icon=excluded.icon;

insert into public.room_types (id,slug,name,tagline,description,base_rate,weekend_rate,holiday_rate,max_guests,size_sqm,bed_type,photos,amenity_ids,featured,active,cancellation_policy,cancellation_hours) values
('rt-deluxe-king','deluxe-king','Deluxe King','A serene retreat for two','Our signature room pairs a plush king bed with a private balcony overlooking the ridge.',4500,4800,5500,2,32,'King bed','["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=800&fit=crop&auto=format","https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&h=800&fit=crop&auto=format"]','["am-king","am-balcony","am-wifi","am-tv","am-ac","am-coffee","am-safe","am-toiletries"]',true,true,'Free cancellation until 48 hours before check-in.',48),
('rt-family-suite','family-suite','Family Suite','Room to gather, space to rest','A generous suite with two beds and a sunlit living area.',6800,7300,8200,4,48,'King + Queen bed','["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=800&fit=crop&auto=format"]','["am-living","am-balcony","am-wifi","am-tv","am-ac","am-coffee","am-minibar","am-safe","am-workspace"]',true,true,'Free cancellation until 72 hours before check-in.',72),
('rt-pool-villa','pool-villa','Pool Villa','Your own private water’s edge','A standalone villa with a private plunge pool, deep soaking tub, and breakfast served to your terrace.',9500,10500,12000,4,72,'King bed','["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&h=800&fit=crop&auto=format"]','["am-pool","am-bath","am-breakfast","am-king","am-balcony","am-wifi","am-tv","am-ac","am-minibar","am-toiletries"]',true,true,'Free cancellation until 7 days before check-in.',168),
('rt-garden-queen','garden-queen','Garden Queen','Wake up to the garden','An intimate ground-floor room opening onto Casa’s pocket garden.',3400,3700,4200,2,26,'Queen bed','["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=800&fit=crop&auto=format"]','["am-wifi","am-tv","am-ac","am-coffee","am-safe","am-parking"]',false,true,'Free cancellation until 48 hours before check-in.',48)
on conflict (id) do update set name=excluded.name, base_rate=excluded.base_rate, weekend_rate=excluded.weekend_rate, holiday_rate=excluded.holiday_rate, photos=excluded.photos, amenity_ids=excluded.amenity_ids;

insert into public.rooms (id,room_type_id,number,floor,status) values
('r-101','rt-deluxe-king','101',1,'available'),('r-102','rt-deluxe-king','102',1,'occupied'),('r-103','rt-deluxe-king','103',1,'maintenance'),('r-104','rt-deluxe-king','104',1,'available'),('r-201','rt-family-suite','201',2,'available'),('r-202','rt-family-suite','202',2,'reserved'),('r-203','rt-family-suite','203',2,'available'),('v-01','rt-pool-villa','V1',1,'available'),('v-02','rt-pool-villa','V2',1,'cleaning'),('v-03','rt-pool-villa','V3',1,'available'),('g-01','rt-garden-queen','G1',1,'available'),('g-02','rt-garden-queen','G2',1,'available'),('g-03','rt-garden-queen','G3',1,'out_of_service')
on conflict (id) do update set status=excluded.status;

insert into public.addons (id,slug,name,description,price,pricing,image,active) values
('ad-breakfast','breakfast','Casa Breakfast','Chef’s daily spread — tropical fruit, fresh pandesal, brewed Benguet coffee.',500,'per_guest','https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&h=600&fit=crop&auto=format',true),
('ad-transfer','airport-transfer','Airport Transfer','Private air-conditioned transfer to and from the airport.',1200,'per_booking','https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&h=600&fit=crop&auto=format',true),
('ad-spa','couples-spa','Couples Spa Ritual','90-minute side-by-side hilot massage with local coconut oil.',2500,'per_booking','https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop&auto=format',true),
('ad-setup','romantic-setup','Romantic Room Setup','Rose petals, candles, and a chilled bottle of sparkling wine on arrival.',1500,'per_booking','https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&h=600&fit=crop&auto=format',true),
('ad-checkout','late-checkout','Late Checkout','Linger until 3pm — no rush to leave your escape.',800,'per_booking','https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&h=600&fit=crop&auto=format',true),
('ad-dinner','dinner-for-two','Dinner for Two','A four-course set dinner on the terrace under the stars.',2200,'per_booking','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&auto=format',true)
on conflict (id) do update set name=excluded.name, price=excluded.price, active=true;

insert into public.packages (id,name,description,nights,room_type_id,included_addon_ids,price,image,active) values
('pk-weekend','Weekend Escape','Two unhurried nights with breakfast for two and a late checkout.',2,'rt-deluxe-king','["ad-breakfast","ad-checkout"]',10800,'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=900&h=700&fit=crop&auto=format',true),
('pk-romantic','Romantic Getaway','One night with a romantic room setup, dinner for two, and breakfast.',1,'rt-pool-villa','["ad-setup","ad-dinner","ad-breakfast"]',14500,'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=900&h=700&fit=crop&auto=format',true),
('pk-family','Family Long Weekend','Three nights in the Family Suite with breakfast for four and airport transfers.',3,'rt-family-suite','["ad-breakfast","ad-transfer"]',22900,'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=900&h=700&fit=crop&auto=format',true)
on conflict (id) do update set name=excluded.name, price=excluded.price, active=true;

insert into public.reviews (id,guest_name,room_type_id,rating,title,body,date,approved,photo) values
('rv-1','Mika R.','rt-deluxe-king',5,'Exactly the reset we needed','The balcony at sunrise, the coffee bar, the quiet.', '2026-09-02',true,null),
('rv-2','Paolo & Jen','rt-pool-villa',5,'The villa is worth every peso','Private pool, breakfast on the terrace, complete privacy. Best anniversary we’ve had.', '2026-08-21',true,'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600&h=400&fit=crop&auto=format'),
('rv-3','The Santos Family','rt-family-suite',4,'Great for the kids','Loads of space and the staff were so warm with our little ones.', '2026-08-10',true,null),
('rv-4','Aldous T.','rt-garden-queen',5,'Solo trip, fully recharged','Simple, spotless, and the garden view in the morning is genuinely lovely.', '2026-07-28',true,null),
('rv-5','Carmen V.','rt-deluxe-king',5,'Thoughtful in every detail','From the toiletries to the turndown, everything felt considered.', '2026-07-15',true,null),
('rv-6','Anonymous','rt-family-suite',2,'AC was noisy','Room was nice but the aircon kept us up.', '2026-09-14',false,null)
on conflict (id) do nothing;

insert into public.audit_logs (id,actor,action,target,at) values
('al-1','admin@casahotel.ph','Confirmed booking','CASA-00124','2026-09-20T09:12:00Z'),
('al-2','admin@casahotel.ph','Set room 103 to Maintenance','Room 103','2026-09-21T14:40:00Z'),
('al-3','admin@casahotel.ph','Approved review','rv-5','2026-09-22T08:05:00Z'),
('al-4','system','Guest booking created','CASA-00126','2026-09-23T07:30:00Z')
on conflict (id) do nothing;

insert into public.bookings (id,reference,room_type_id,room_id,check_in,check_out,guests,status,guest_name,email,phone,addons,nightly_total,addons_total,subtotal,tax,total,created_at) values
('bk-1','CASA-00118','rt-deluxe-king','r-102','2026-09-22','2026-09-25',2,'checked_in','Liza Manalo','liza@example.com','+63 917 000 1111','[{"addonId":"ad-breakfast","quantity":2}]',14100,3000,17100,2052,19152,'2026-09-13T00:00:00Z'),
('bk-2','CASA-00121','rt-family-suite','r-202','2026-09-23','2026-09-26',4,'confirmed','The Reyes Family','reyes@example.com','+63 918 222 3333','[{"addonId":"ad-breakfast","quantity":4},{"addonId":"ad-transfer","quantity":1}]',21900,7200,29100,3492,32592,'2026-09-17T00:00:00Z'),
('bk-3','CASA-00124','rt-pool-villa','v-02','2026-09-28','2026-09-30',2,'confirmed','Demo Guest','demo@casahotel.ph','+63 917 555 0142','[{"addonId":"ad-setup","quantity":1},{"addonId":"ad-dinner","quantity":1}]',21000,3700,24700,2964,27664,'2026-09-20T00:00:00Z'),
('bk-4','CASA-00109','rt-deluxe-king','r-101','2026-09-03','2026-09-05',2,'checked_out','Demo Guest','demo@casahotel.ph','+63 917 555 0142','[{"addonId":"ad-breakfast","quantity":2}]',9000,2000,11000,1320,12320,'2026-08-24T00:00:00Z'),
('bk-5','CASA-00126','rt-garden-queen','g-01','2026-09-24','2026-09-25',1,'pending','Migs Cruz','migs@example.com','+63 919 444 5555','[]',3400,0,3400,408,3808,'2026-09-23T00:00:00Z')
on conflict (id) do nothing;

-- Optional admin promotion: create a user in Authentication first, then run:
-- update public.profiles set role = 'admin' where email = 'your-admin-email@example.com';
