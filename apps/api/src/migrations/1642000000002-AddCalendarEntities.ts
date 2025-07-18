import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalendarEntities1642000000002 implements MigrationInterface {
  name = 'AddCalendarEntities1642000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if appointments table exists
    const appointmentsExists = await queryRunner.hasTable('appointments');
    if (!appointmentsExists) {
      await queryRunner.query(`
        CREATE TABLE "appointments" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "workspaceId" uuid NOT NULL,
          "title" character varying(200) NOT NULL,
          "description" text,
          "type" character varying NOT NULL CHECK ("type" IN ('viewing', 'meeting', 'call', 'inspection', 'signing', 'consultation')),
          "status" character varying NOT NULL DEFAULT 'scheduled' CHECK ("status" IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show')),
          "priority" character varying NOT NULL DEFAULT 'medium' CHECK ("priority" IN ('low', 'medium', 'high', 'urgent')),
          "startTime" TIMESTAMP NOT NULL,
          "endTime" TIMESTAMP NOT NULL,
          "timezone" character varying(100),
          "location" text,
          "meetingUrl" character varying(500),
          "contactId" uuid,
          "assignedToId" uuid NOT NULL,
          "propertyId" uuid,
          "attendees" jsonb,
          "reminders" jsonb,
          "metadata" jsonb,
          "isRecurring" boolean NOT NULL DEFAULT false,
          "recurringPattern" jsonb,
          "parentAppointmentId" uuid,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_appointments" PRIMARY KEY ("id")
        )
      `);
    }

    // Check if availability table exists
    const availabilityExists = await queryRunner.hasTable('availability');
    if (!availabilityExists) {
      await queryRunner.query(`
        CREATE TABLE "availability" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "workspaceId" uuid NOT NULL,
          "userId" uuid NOT NULL,
          "title" character varying(200),
          "type" character varying NOT NULL DEFAULT 'available' CHECK ("type" IN ('available', 'busy', 'tentative', 'out_of_office')),
          "startTime" TIMESTAMP NOT NULL,
          "endTime" TIMESTAMP NOT NULL,
          "timezone" character varying(100),
          "isRecurring" boolean NOT NULL DEFAULT false,
          "recurringPattern" character varying NOT NULL DEFAULT 'none' CHECK ("recurringPattern" IN ('none', 'daily', 'weekly', 'monthly')),
          "recurringSettings" jsonb,
          "notes" text,
          "metadata" jsonb,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_availability" PRIMARY KEY ("id")
        )
      `);
    }

    // Check if lead_scores table exists
    const leadScoresExists = await queryRunner.hasTable('lead_scores');
    if (!leadScoresExists) {
      await queryRunner.query(`
        CREATE TABLE "lead_scores" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "workspaceId" uuid NOT NULL,
          "contactId" uuid NOT NULL,
          "score" integer NOT NULL DEFAULT 0,
          "factors" jsonb,
          "insights" jsonb,
          "lastCalculated" TIMESTAMP NOT NULL DEFAULT now(),
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_lead_scores" PRIMARY KEY ("id")
        )
      `);
    }

    // Add foreign key constraints if they don't exist
    try {
      await queryRunner.query(`
        ALTER TABLE "appointments" 
        ADD CONSTRAINT "FK_appointments_contact" 
        FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE SET NULL
      `);
    } catch (error) {
      // Constraint might already exist
    }

    try {
      await queryRunner.query(`
        ALTER TABLE "appointments" 
        ADD CONSTRAINT "FK_appointments_assigned_to" 
        FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE CASCADE
      `);
    } catch (error) {
      // Constraint might already exist
    }

    try {
      await queryRunner.query(`
        ALTER TABLE "availability" 
        ADD CONSTRAINT "FK_availability_user" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      `);
    } catch (error) {
      // Constraint might already exist
    }

    try {
      await queryRunner.query(`
        ALTER TABLE "lead_scores" 
        ADD CONSTRAINT "FK_lead_scores_contact" 
        FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE
      `);
    } catch (error) {
      // Constraint might already exist
    }

    // Add indexes for better performance
    try {
      await queryRunner.query(`CREATE INDEX "IDX_appointments_workspace" ON "appointments" ("workspaceId")`);
      await queryRunner.query(`CREATE INDEX "IDX_appointments_assigned_to" ON "appointments" ("assignedToId")`);
      await queryRunner.query(`CREATE INDEX "IDX_appointments_start_time" ON "appointments" ("startTime")`);
      await queryRunner.query(`CREATE INDEX "IDX_appointments_type" ON "appointments" ("type")`);
      await queryRunner.query(`CREATE INDEX "IDX_appointments_status" ON "appointments" ("status")`);
      
      await queryRunner.query(`CREATE INDEX "IDX_availability_workspace" ON "availability" ("workspaceId")`);
      await queryRunner.query(`CREATE INDEX "IDX_availability_user" ON "availability" ("userId")`);
      await queryRunner.query(`CREATE INDEX "IDX_availability_start_time" ON "availability" ("startTime")`);
      
      await queryRunner.query(`CREATE INDEX "IDX_lead_scores_workspace" ON "lead_scores" ("workspaceId")`);
      await queryRunner.query(`CREATE INDEX "IDX_lead_scores_contact" ON "lead_scores" ("contactId")`);
      await queryRunner.query(`CREATE INDEX "IDX_lead_scores_score" ON "lead_scores" ("score")`);
    } catch (error) {
      // Indexes might already exist
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "lead_scores"`);
    await queryRunner.query(`DROP TABLE "availability"`);
    await queryRunner.query(`DROP TABLE "appointments"`);
  }
}
