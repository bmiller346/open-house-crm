import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class InitialSchema1672531200000 implements MigrationInterface {
    name = 'InitialSchema1672531200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "workspace",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "ownerId",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "settings",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        await queryRunner.createTable(
            new Table({
                name: "contact",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "workspaceId",
                        type: "uuid",
                        isNullable: false,
                    },
                    {
                        name: "name",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                        isNullable: false,
                    },
                ],
            }),
            true,
        );

        // Add indexes
        await queryRunner.createIndex(
            "contact",
            new TableIndex({
                name: "IDX_CONTACT_WORKSPACE_ID",
                columnNames: ["workspaceId"],
            }),
        );

        // Add foreign keys
        await queryRunner.createForeignKey(
            "contact",
            new TableForeignKey({
                columnNames: ["workspaceId"],
                referencedColumnNames: ["id"],
                referencedTableName: "workspace",
                onDelete: "CASCADE",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const foreignKey = (await queryRunner.getTable("contact"))?.foreignKeys.find(
            fk => fk.columnNames.indexOf("workspaceId") !== -1,
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey("contact", foreignKey);
        }

        // Drop indexes
        await queryRunner.dropIndex("contact", "IDX_CONTACT_WORKSPACE_ID");

        // Drop tables
        await queryRunner.dropTable("contact");
        await queryRunner.dropTable("workspace");
    }
}
