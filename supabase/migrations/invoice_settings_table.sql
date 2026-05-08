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
CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_global ON invoice_settings (is_global) WHERE is_global = true;

-- Grant table access to Supabase roles (REQUIRED when creating via SQL)
GRANT ALL ON TABLE invoice_settings TO anon;
GRANT ALL ON TABLE invoice_settings TO authenticated;

-- Setup Row Level Security (RLS)
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

-- Simple policy: owner or global access
CREATE POLICY "owner_or_global_access"
    ON invoice_settings FOR ALL
    USING (
        is_global = true
        OR auth.uid() = user_id
    )
    WITH CHECK (
        auth.uid() = user_id
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
