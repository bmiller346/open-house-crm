import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebhookTables1642000000000 implements MigrationInterface {
  name = 'CreateWebhookTables1642000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create webhook_secrets table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "webhook_secrets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "webhook_id" uuid NOT NULL,
        "secret" varchar(255) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "expires_at" timestamp,
        "created_by" uuid NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_secrets" PRIMARY KEY ("id")
      )
    `);

    // Create webhook_events table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "webhook_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "webhook_id" uuid NOT NULL,
        "event_type" varchar(100) NOT NULL,
        "payload" jsonb NOT NULL,
        "status" varchar(50) NOT NULL,
        "retry_count" integer NOT NULL DEFAULT 0,
        "next_retry_at" timestamp,
        "processed_at" timestamp,
        "error" text,
        "created_at" timestamp NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_events" PRIMARY KEY ("id")
      )
    `);

    // Add indexes for webhook_secrets
    await queryRunner.query(`CREATE INDEX "IDX_webhook_secrets_webhook_id" ON "webhook_secrets" ("webhook_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_webhook_secrets_is_active" ON "webhook_secrets" ("is_active")`);

    // Add indexes for webhook_events
    await queryRunner.query(`CREATE INDEX "IDX_webhook_events_webhook_id" ON "webhook_events" ("webhook_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_webhook_events_event_type" ON "webhook_events" ("event_type")`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "webhook_secrets" 
      ADD CONSTRAINT "FK_webhook_secrets_webhook_id" 
      FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "webhook_events" 
      ADD CONSTRAINT "FK_webhook_events_webhook_id" 
      FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE
    `);

    // Enhance existing webhook_logs table with replay functionality
    await queryRunner.query(`
      ALTER TABLE "webhook_logs" 
      ADD COLUMN IF NOT EXISTS "replay_id" uuid,
      ADD COLUMN IF NOT EXISTS "is_replay" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "original_log_id" uuid,
      ADD COLUMN IF NOT EXISTS "replay_reason" text
    `);

    // Add index for replay functionality
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_webhook_logs_replay_id" ON "webhook_logs" ("replay_id")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_webhook_logs_is_replay" ON "webhook_logs" ("is_replay")`);

    // Enhance existing api_keys table
    await queryRunner.query(`
      ALTER TABLE "api_keys" 
      ADD COLUMN IF NOT EXISTS "rate_limit" integer DEFAULT 100,
      ADD COLUMN IF NOT EXISTS "rate_limit_window" integer DEFAULT 3600000,
      ADD COLUMN IF NOT EXISTS "usage_count" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "last_used_ip" varchar(45)
    `);

    // Create webhook analytics materialized view
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS webhook_analytics AS
      SELECT 
        w.id as webhook_id,
        w.url,
        w.workspace_id,
        COUNT(wl.id) as total_deliveries,
        COUNT(CASE WHEN wl.success = true THEN 1 END) as successful_deliveries,
        COUNT(CASE WHEN wl.success = false THEN 1 END) as failed_deliveries,
        ROUND(
          (COUNT(CASE WHEN wl.success = true THEN 1 END)::decimal / 
           NULLIF(COUNT(wl.id), 0)) * 100, 2
        ) as success_rate,
        AVG(wl.response_time) as avg_response_time,
        MAX(wl.created_at) as last_delivery_at
      FROM webhooks w
      LEFT JOIN webhook_logs wl ON w.id = wl.webhook_id
      WHERE wl.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY w.id, w.url, w.workspace_id;
    `);

    // Create index on materialized view
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_webhook_analytics_webhook_id" ON webhook_analytics ("webhook_id")`);

    // Create refresh function for analytics
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION refresh_webhook_analytics()
      RETURNS void AS $$
      BEGIN
        REFRESH MATERIALIZED VIEW CONCURRENTLY webhook_analytics;
      END;
      $$ LANGUAGE plpgsql;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop materialized view and function
    await queryRunner.query(`DROP FUNCTION IF EXISTS refresh_webhook_analytics()`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS webhook_analytics`);

    // Remove added columns from webhook_logs
    await queryRunner.query(`
      ALTER TABLE "webhook_logs" 
      DROP COLUMN IF EXISTS "replay_id",
      DROP COLUMN IF EXISTS "is_replay",
      DROP COLUMN IF EXISTS "original_log_id",
      DROP COLUMN IF EXISTS "replay_reason"
    `);

    // Remove added columns from api_keys
    await queryRunner.query(`
      ALTER TABLE "api_keys" 
      DROP COLUMN IF EXISTS "rate_limit",
      DROP COLUMN IF EXISTS "rate_limit_window",
      DROP COLUMN IF EXISTS "usage_count",
      DROP COLUMN IF EXISTS "last_used_ip"
    `);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "webhook_events" DROP CONSTRAINT IF EXISTS "FK_webhook_events_webhook_id"`);
    await queryRunner.query(`ALTER TABLE "webhook_secrets" DROP CONSTRAINT IF EXISTS "FK_webhook_secrets_webhook_id"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "webhook_events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "webhook_secrets"`);
  }
}
