-- Create Promo Codes Table
CREATE TABLE promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    target_plan TEXT NOT NULL CHECK (target_plan IN ('pro', 'enterprise')),
    max_uses INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for promo_codes (Only admins can manage, others can only read through the RPC function)
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin can manage promo codes"
    ON promo_codes FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@workhub.io');

-- Create a table to track used codes per user to prevent duplicate use
CREATE TABLE used_promo_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    promo_code_id UUID REFERENCES promo_codes(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, promo_code_id)
);

ALTER TABLE used_promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super Admin can manage used codes"
    ON used_promo_codes FOR ALL
    USING (auth.jwt() ->> 'email' = 'admin@workhub.io');


-- Secure RPC Function to Redeem a Promo Code
CREATE OR REPLACE FUNCTION redeem_promo_code(promo_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs as the database owner to bypass RLS for this specific operation
AS $$
DECLARE
    v_user_id UUID;
    v_code_record RECORD;
    v_already_used BOOLEAN;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
    END IF;

    -- Find the code
    SELECT * INTO v_code_record FROM promo_codes WHERE code = promo_code;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid promo code');
    END IF;

    -- Check expiry
    IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < now() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Promo code expired');
    END IF;

    -- Check max uses
    IF v_code_record.current_uses >= v_code_record.max_uses THEN
        RETURN jsonb_build_object('success', false, 'message', 'Promo code reached its maximum uses');
    END IF;

    -- Check if user already used this exact code
    SELECT EXISTS(SELECT 1 FROM used_promo_codes WHERE user_id = v_user_id AND promo_code_id = v_code_record.id) INTO v_already_used;
    IF v_already_used THEN
        RETURN jsonb_build_object('success', false, 'message', 'You have already used this promo code');
    END IF;

    -- Upgrade the user (Update their metadata)
    -- This relies on Supabase Auth's user_metadata
    UPDATE auth.users 
    SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('plan', v_code_record.target_plan)
    WHERE id = v_user_id;

    -- Record the usage
    INSERT INTO used_promo_codes (user_id, promo_code_id) VALUES (v_user_id, v_code_record.id);

    -- Increment usage counter
    UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = v_code_record.id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Successfully upgraded to ' || v_code_record.target_plan,
        'new_plan', v_code_record.target_plan
    );
END;
$$;
