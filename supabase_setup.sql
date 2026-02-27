-- Run this script in your Supabase SQL Editor

-- 1. Create the packages table
CREATE TABLE public.packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  operator TEXT NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  validity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_number TEXT NOT NULL,
  operator TEXT NOT NULL,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for packages
-- Anyone can read packages
CREATE POLICY "Packages are viewable by everyone" ON public.packages
  FOR SELECT USING (true);

-- Only authenticated users (admins) can insert/update/delete packages
CREATE POLICY "Packages are editable by authenticated users" ON public.packages
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Create Policies for orders
-- Anyone can insert an order (for the public checkout)
CREATE POLICY "Anyone can insert an order" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Anyone can read their own order by mobile number (handled in application logic, but we allow select for now)
CREATE POLICY "Anyone can view orders" ON public.orders
  FOR SELECT USING (true);

-- Only authenticated users (admins) can update/delete orders
CREATE POLICY "Orders are editable by authenticated users" ON public.orders
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Orders are deletable by authenticated users" ON public.orders
  FOR DELETE USING (auth.role() = 'authenticated');

-- 6. Insert some dummy packages for testing
INSERT INTO public.packages (operator, type, name, price, validity) VALUES
  ('Grameenphone', 'Internet', '1 GB Internet', 49, '3 Days'),
  ('Grameenphone', 'Internet', '5 GB Internet', 149, '7 Days'),
  ('Grameenphone', 'Minute', '100 Minutes', 64, '7 Days'),
  ('Grameenphone', 'Bundle', '2 GB + 50 Min', 99, '7 Days'),
  
  ('Robi/Airtel', 'Internet', '2 GB Internet', 54, '3 Days'),
  ('Robi/Airtel', 'Internet', '10 GB Internet', 199, '30 Days'),
  ('Robi/Airtel', 'Minute', '200 Minutes', 118, '30 Days'),
  ('Robi/Airtel', 'Bundle', '5 GB + 100 Min', 148, '7 Days'),
  
  ('Banglalink', 'Internet', '1.5 GB Internet', 45, '3 Days'),
  ('Banglalink', 'Internet', '8 GB Internet', 148, '7 Days'),
  ('Banglalink', 'Minute', '150 Minutes', 98, '30 Days'),
  ('Banglalink', 'Bundle', '3 GB + 75 Min', 119, '7 Days'),
  
  ('Teletalk', 'Internet', '2 GB Internet', 42, '3 Days'),
  ('Teletalk', 'Internet', '15 GB Internet', 249, '30 Days'),
  ('Teletalk', 'Minute', '300 Minutes', 145, '30 Days'),
  ('Teletalk', 'Bundle', '10 GB + 200 Min', 299, '30 Days');
