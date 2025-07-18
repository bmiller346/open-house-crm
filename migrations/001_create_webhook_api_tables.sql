-- Migration: Add webhook and API key tables, update user schema
-- Created: 2024-01-15
-- Updated: 2024-07-17 - Added user schema updates for OAuth support

-- ===========================
-- USER SCHEMA UPDATES
-- ===========================

-- First, update the users table to support OAuth and new structure
-- Add new columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS googleId VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS googleAccessToken TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS googleRefreshToken TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS isEmailVerified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- Update existing users to have a name if they don't have one
UPDATE users 
SET name = SPLIT_PART(email, '@', 1)
WHERE name IS NULL OR name = '';

-- Make name column NOT NULL after updating existing records
ALTER TABLE users ALTER COLUMN name SET NOT NULL;

-- Add password column if it doesn't exist and make it nullable (for OAuth users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Update password column to be nullable (for OAuth users) - only if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password'
    ) THEN
        ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
    END IF;
END $$;

-- Create unique index on googleId
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(googleId) WHERE googleId IS NOT NULL;

-- Create user_workspaces junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_workspaces (
    user_id UUID NOT NULL,
    workspace_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, workspace_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Create indexes for user_workspaces
CREATE INDEX IF NOT EXISTS idx_user_workspaces_user_id ON user_workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workspaces_workspace_id ON user_workspaces(workspace_id);

-- Add workspace owner relationship if not exists
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS "ownerId" UUID;
ALTER TABLE workspaces ADD CONSTRAINT IF NOT EXISTS fk_workspace_owner 
    FOREIGN KEY ("ownerId") REFERENCES users(id) ON DELETE SET NULL;

-- Create default workspace for existing users who don't have one
INSERT INTO workspaces (id, name, slug, "ownerId", settings, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    COALESCE(u.name, SPLIT_PART(u.email, '@', 1)) || '''s Workspace',
    LOWER(REGEXP_REPLACE(COALESCE(u.name, SPLIT_PART(u.email, '@', 1)), '[^a-zA-Z0-9]', '-', 'g')),
    u.id,
    '{"timezone": "America/New_York", "dateFormat": "MM/DD/YYYY", "currency": "USD"}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_workspaces uw WHERE uw.user_id = u.id
);

-- Link users to their default workspaces
INSERT INTO user_workspaces (user_id, workspace_id, role)
SELECT u.id, w.id, 'owner'
FROM users u
JOIN workspaces w ON w."ownerId" = u.id
WHERE NOT EXISTS (
    SELECT 1 FROM user_workspaces uw 
    WHERE uw.user_id = u.id AND uw.workspace_id = w.id
);

-- ===========================
-- WEBHOOK AND API TABLES
-- ===========================

-- Create webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL DEFAULT '{}',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    secret VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    delivery_attempts INTEGER DEFAULT 0,
    failed_attempts INTEGER DEFAULT 0,
    last_delivery_at TIMESTAMP,
    last_success_at TIMESTAMP,
    last_failure_at TIMESTAMP,
    last_error TEXT,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_webhooks_workspace_id ON webhooks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(is_active);
CREATE INDEX IF NOT EXISTS idx_webhooks_events ON webhooks USING GIN(events);

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    url TEXT NOT NULL,
    method VARCHAR(10) DEFAULT 'POST',
    headers JSONB,
    request_headers JSONB,
    status_code INTEGER,
    response_body TEXT,
    response_headers JSONB,
    response_time INTEGER,
    delivered BOOLEAN DEFAULT false,
    error TEXT,
    attempt INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP,
    next_retry_at TIMESTAMP,
    replayed_from UUID,
    replayed_by UUID,
    replayed_at TIMESTAMP,
    original_event_id VARCHAR(255),
    signature VARCHAR(255),
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
    FOREIGN KEY (replayed_from) REFERENCES webhook_logs(id) ON DELETE SET NULL,
    FOREIGN KEY (replayed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for webhook logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_delivered ON webhook_logs(delivered);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_next_retry_at ON webhook_logs(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_replayed_from ON webhook_logs(replayed_from);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_original_event_id ON webhook_logs(original_event_id);

-- Create indexes for webhook secrets
CREATE INDEX IF NOT EXISTS idx_webhook_secrets_webhook_id ON webhook_secrets(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_secrets_active ON webhook_secrets(is_active);
CREATE INDEX IF NOT EXISTS idx_webhook_secrets_expires_at ON webhook_secrets(expires_at);

-- Create indexes for webhook audit log
CREATE INDEX IF NOT EXISTS idx_webhook_audit_log_webhook_id ON webhook_audit_log(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_audit_log_action ON webhook_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_webhook_audit_log_changed_by ON webhook_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS idx_webhook_audit_log_created_at ON webhook_audit_log(created_at);

-- Create indexes for webhook rate limits
CREATE INDEX IF NOT EXISTS idx_webhook_rate_limits_webhook_id ON webhook_rate_limits(webhook_id);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    key_hash VARCHAR(255) NOT NULL UNIQUE,
    key_prefix VARCHAR(20) NOT NULL,
    permissions TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    ip_whitelist TEXT[],
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for API keys
CREATE INDEX IF NOT EXISTS idx_api_keys_workspace_id ON api_keys(workspace_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);

-- Create api_key_usage_logs table for tracking API key usage
CREATE TABLE IF NOT EXISTS api_key_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    response_status INTEGER,
    response_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Create indexes for API key usage logs
CREATE INDEX IF NOT EXISTS idx_api_key_usage_logs_api_key_id ON api_key_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_logs_created_at ON api_key_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_logs_endpoint ON api_key_usage_logs(endpoint);

-- Create webhook_events table for tracking supported events
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sample_payload JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create webhook_secrets table for secret rotation
CREATE TABLE IF NOT EXISTS webhook_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL,
    secret_hash VARCHAR(255) NOT NULL,
    secret_prefix VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    rotated_by UUID,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
    FOREIGN KEY (rotated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create webhook_audit_log table for change tracking
CREATE TABLE IF NOT EXISTS webhook_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'activated', 'deactivated', 'secret_rotated'
    changed_by UUID NOT NULL,
    changes JSONB, -- Store what changed
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create webhook_rate_limits table
CREATE TABLE IF NOT EXISTS webhook_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL,
    requests_per_minute INTEGER DEFAULT 60,
    requests_per_hour INTEGER DEFAULT 1000,
    requests_per_day INTEGER DEFAULT 10000,
    burst_limit INTEGER DEFAULT 10,
    window_size INTEGER DEFAULT 60, -- seconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webhook_id) REFERENCES webhooks(id) ON DELETE CASCADE
);

-- Insert default webhook events
INSERT INTO webhook_events (event_type, description, sample_payload) VALUES
('contact.created', 'Triggered when a new contact is created', '{"event": "contact.created", "data": {"id": "contact_123", "first_name": "John", "last_name": "Doe", "email": "john@example.com"}}'),
('contact.updated', 'Triggered when a contact is updated', '{"event": "contact.updated", "data": {"id": "contact_123", "first_name": "John", "last_name": "Doe", "email": "john@example.com"}, "previous_data": {"email": "john.old@example.com"}}'),
('contact.deleted', 'Triggered when a contact is deleted', '{"event": "contact.deleted", "data": {"id": "contact_123", "deleted_at": "2024-01-15T10:00:00Z"}}'),
('transaction.created', 'Triggered when a new transaction is created', '{"event": "transaction.created", "data": {"id": "transaction_123", "contact_id": "contact_123", "amount": 450000, "type": "sale", "status": "pending"}}'),
('transaction.updated', 'Triggered when a transaction is updated', '{"event": "transaction.updated", "data": {"id": "transaction_123", "contact_id": "contact_123", "amount": 450000, "type": "sale", "status": "completed"}, "previous_data": {"status": "pending"}}'),
('transaction.deleted', 'Triggered when a transaction is deleted', '{"event": "transaction.deleted", "data": {"id": "transaction_123", "deleted_at": "2024-01-15T10:00:00Z"}}'),
('property.created', 'Triggered when a new property is created', '{"event": "property.created", "data": {"id": "property_123", "address": "123 Main St", "city": "Anytown", "state": "NY", "price": 450000}}'),
('property.updated', 'Triggered when a property is updated', '{"event": "property.updated", "data": {"id": "property_123", "address": "123 Main St", "city": "Anytown", "state": "NY", "price": 475000}, "previous_data": {"price": 450000}}'),
('property.deleted', 'Triggered when a property is deleted', '{"event": "property.deleted", "data": {"id": "property_123", "deleted_at": "2024-01-15T10:00:00Z"}}'),
('webhook.test', 'Test event for webhook verification', '{"event": "webhook.test", "message": "This is a test webhook event", "timestamp": "2024-01-15T10:00:00Z"}')
ON CONFLICT (event_type) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_events_updated_at
    BEFORE UPDATE ON webhook_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up old logs
CREATE OR REPLACE FUNCTION cleanup_old_webhook_logs()
RETURNS void AS $$
BEGIN
    -- Delete webhook logs older than 90 days
    DELETE FROM webhook_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
    
    -- Delete API key usage logs older than 90 days
    DELETE FROM api_key_usage_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Create function to update webhook statistics
CREATE OR REPLACE FUNCTION update_webhook_stats()
RETURNS void AS $$
BEGIN
    UPDATE webhooks SET
        delivery_attempts = (
            SELECT COUNT(*) FROM webhook_logs 
            WHERE webhook_logs.webhook_id = webhooks.id
        ),
        failed_attempts = (
            SELECT COUNT(*) FROM webhook_logs 
            WHERE webhook_logs.webhook_id = webhooks.id AND delivered = false
        ),
        last_delivery_at = (
            SELECT MAX(created_at) FROM webhook_logs 
            WHERE webhook_logs.webhook_id = webhooks.id
        ),
        last_success_at = (
            SELECT MAX(delivered_at) FROM webhook_logs 
            WHERE webhook_logs.webhook_id = webhooks.id AND delivered = true
        ),
        last_failure_at = (
            SELECT MAX(created_at) FROM webhook_logs 
            WHERE webhook_logs.webhook_id = webhooks.id AND delivered = false
        ),
        last_error = (
            SELECT error FROM webhook_logs 
            WHERE webhook_logs.webhook_id = webhooks.id AND delivered = false
            ORDER BY created_at DESC
            LIMIT 1
        );
END;
$$ LANGUAGE plpgsql;

-- Create function to update API key usage statistics
CREATE OR REPLACE FUNCTION update_api_key_usage()
RETURNS void AS $$
BEGIN
    UPDATE api_keys SET
        usage_count = (
            SELECT COUNT(*) FROM api_key_usage_logs 
            WHERE api_key_usage_logs.api_key_id = api_keys.id
        ),
        last_used_at = (
            SELECT MAX(created_at) FROM api_key_usage_logs 
            WHERE api_key_usage_logs.api_key_id = api_keys.id
        );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON webhooks TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_logs TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON api_key_usage_logs TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON webhook_events TO your_app_user;

-- Create materialized view for webhook analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS webhook_analytics AS
SELECT 
    w.id,
    w.name,
    w.url,
    w.workspace_id,
    w.is_active,
    w.created_at,
    COUNT(wl.id) as total_deliveries,
    COUNT(CASE WHEN wl.delivered = true THEN 1 END) as successful_deliveries,
    COUNT(CASE WHEN wl.delivered = false THEN 1 END) as failed_deliveries,
    CASE 
        WHEN COUNT(wl.id) > 0 THEN 
            ROUND((COUNT(CASE WHEN wl.delivered = true THEN 1 END)::numeric / COUNT(wl.id)::numeric) * 100, 2)
        ELSE 0 
    END as success_rate,
    AVG(wl.response_time) as avg_response_time,
    MAX(wl.delivered_at) as last_successful_delivery,
    MAX(wl.created_at) as last_delivery_attempt,
    CASE 
        WHEN COUNT(CASE WHEN wl.delivered = false AND wl.created_at > CURRENT_TIMESTAMP - INTERVAL '24 hours' THEN 1 END) >= 5 
        THEN false 
        ELSE true 
    END as is_healthy
FROM webhooks w
LEFT JOIN webhook_logs wl ON w.id = wl.webhook_id
GROUP BY w.id, w.name, w.url, w.workspace_id, w.is_active, w.created_at;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_webhook_analytics_workspace_id ON webhook_analytics(workspace_id);
CREATE INDEX IF NOT EXISTS idx_webhook_analytics_is_active ON webhook_analytics(is_active);

-- Create function to refresh webhook analytics
CREATE OR REPLACE FUNCTION refresh_webhook_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW webhook_analytics;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE webhooks IS 'Stores webhook configurations for external integrations';
COMMENT ON TABLE webhook_logs IS 'Stores webhook delivery logs and retry attempts';
COMMENT ON TABLE api_keys IS 'Stores API keys for external API access';
COMMENT ON TABLE api_key_usage_logs IS 'Stores API key usage logs for monitoring and analytics';
COMMENT ON TABLE webhook_events IS 'Stores supported webhook event types and their schemas';
COMMENT ON MATERIALIZED VIEW webhook_analytics IS 'Provides webhook statistics and health metrics';

-- Migration completed successfully
SELECT 'Webhook and API Key tables created successfully' as status;
