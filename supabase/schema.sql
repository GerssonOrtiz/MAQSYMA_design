-- Schema for MAQSYMA E-Commerce and Inventory Management in Supabase

-- 1. Tabla de Productos
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_label TEXT,
    subtitle TEXT,
    image TEXT NOT NULL,
    price_usd NUMERIC(10,2) NOT NULL CHECK (price_usd >= 0),
    price_pen NUMERIC(10,2) NOT NULL CHECK (price_pen >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    specs JSONB DEFAULT '{}'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Auditoría de Inventario
CREATE TABLE IF NOT EXISTS public.inventory_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'UPDATE_STOCK', 'UPDATE_PRICE', 'CREATE_PRODUCT', 'DELETE_PRODUCT', 'RESET_CATALOG'
    changed_by TEXT NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabla de Usuarios Administradores (con hash bcrypt)
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas:
-- Lectura pública para el catálogo de productos
CREATE POLICY "Public products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

-- Escrituras restringidas al Service Role (Backend Vercel Functions)
-- (El backend utiliza SUPABASE_SERVICE_ROLE_KEY para auditar y modificar inventario de forma segura)
