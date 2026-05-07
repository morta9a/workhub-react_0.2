-- Drop the table if it already exists to recreate with new structure
DROP TABLE IF EXISTS invoice_settings CASCADE;

-- Create Invoice Settings Table with advanced permissions support
CREATE TABLE invoice_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Made nullable for global templates
    company_id UUID, -- For enterprise companies
    is_global BOOLEAN DEFAULT FALSE, -- Identifies the Super Admin template
    layout JSONB DEFAULT '{}'::jsonb,
    custom_text JSONB DEFAULT '{}'::jsonb,
    hidden_fields JSONB DEFAULT '[]'::jsonb,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure only one global setting can exist (optional constraint)
    CONSTRAINT unique_user_settings UNIQUE (user_id)
);

-- Ensure only one row can have is_global = true
CREATE UNIQUE INDEX idx_only_one_global ON invoice_settings (is_global) WHERE is_global = true;

-- Setup Row Level Security (RLS)
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Everyone can view the global settings
CREATE POLICY "Everyone can view global settings"
    ON invoice_settings FOR SELECT
    USING (is_global = true);

-- 2. Users can view their own settings
CREATE POLICY "Users can view their own invoice settings"
    ON invoice_settings FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Users in a company can view their company settings
CREATE POLICY "Users can view company settings"
    ON invoice_settings FOR SELECT
    USING (company_id IS NOT NULL AND auth.uid() IN (
        -- Assuming a users table or metadata mapping exists. 
        -- In our case, we will handle this mostly at the app level, but this prevents random access.
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'company_id' = company_id::text
    ));

-- 4. Super Admin can update the global settings (Checking email in jwt)
CREATE POLICY "Super Admin can insert global settings"
    ON invoice_settings FOR INSERT
    WITH CHECK (
        (is_global = true AND auth.jwt() ->> 'email' = 'admin@workhub.io')
        OR
        (is_global = false AND auth.uid() = user_id)
    );

CREATE POLICY "Super Admin can update global settings"
    ON invoice_settings FOR UPDATE
    USING (
        (is_global = true AND auth.jwt() ->> 'email' = 'admin@workhub.io')
        OR
        (is_global = false AND auth.uid() = user_id)
    );

-- Create a trigger to automatically update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_invoice_settings_mod_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoice_settings_mod_time ON invoice_settings;
CREATE TRIGGER update_invoice_settings_mod_time
    BEFORE UPDATE ON invoice_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_settings_mod_time();
