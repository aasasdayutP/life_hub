import { createSwaggerSpec } from "next-swagger-doc";

export function getApiDocs() {
  const productionUrl = process.env.NEXT_PUBLIC_PROD_URL;

  const servers = [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
    ...(productionUrl
      ? [
          {
            url: productionUrl,
            description: "Production",
          },
        ]
      : []),
  ];

  return createSwaggerSpec({
    apiFolder: "src/app/api",
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Life Hub API",
        version: "1.0.0",
        description: "REST API documentation for Life Hub",
      },
      servers,
      tags: [
        { name: "Auth", description: "Authentication and session endpoints" },
        { name: "Tasks", description: "To-do tasks endpoints" },
        { name: "Money", description: "Money endpoints" },
        { name: "Beer Memory", description: "Beer memory endpoints" },
        { name: "Agent", description: "Agent endpoints" },
        { name: "Users", description: "User endpoints" },
        { name: "Line", description: "LINE integration endpoints" },
        { name: "Admin", description: "Admin endpoints" },
      ],
      components: {
        schemas: {
          ApiError: {
            type: "object",
            required: ["success", "message"],
            properties: {
              success: {
                type: "boolean",
                enum: [false],
              },
              message: {
                type: "string",
              },
            },
          },
          AuthLoginUser: {
            type: "object",
            required: ["user_id", "user_uuid", "user_name", "email", "role_id"],
            properties: {
              user_id: { type: "integer", example: 1 },
              user_uuid: {
                type: "string",
                format: "uuid",
                example: "6f1f01b4-3a8b-49a1-b8e0-5d68001f6ef1",
              },
              user_name: { type: "string", example: "Captain" },
              email: {
                type: "string",
                format: "email",
                example: "captain@example.com",
              },
              role_id: { type: "integer", example: 1 },
            },
          },
          AuthRegisterUser: {
            type: "object",
            required: [
              "user_id",
              "user_uuid",
              "user_name",
              "email",
              "role_id",
              "created_at",
            ],
            properties: {
              user_id: { type: "integer", example: 1 },
              user_uuid: {
                type: "string",
                format: "uuid",
                example: "6f1f01b4-3a8b-49a1-b8e0-5d68001f6ef1",
              },
              user_name: { type: "string", example: "Captain" },
              email: {
                type: "string",
                format: "email",
                example: "captain@example.com",
              },
              role_id: { type: "integer", example: 1 },
              created_at: {
                type: "string",
                format: "date-time",
                example: "2026-08-04T03:00:00.000Z",
              },
            },
          },
          AuthMeUser: {
            type: "object",
            required: ["user_id", "user_uuid", "user_name", "email", "role"],
            properties: {
              user_id: { type: "integer", example: 1 },
              user_uuid: {
                type: "string",
                format: "uuid",
                example: "6f1f01b4-3a8b-49a1-b8e0-5d68001f6ef1",
              },
              user_name: { type: "string", example: "Captain" },
              email: {
                type: "string",
                format: "email",
                example: "captain@example.com",
              },
              role: { type: "string", example: "user" },
            },
          },
          JobStatusName: {
            type: "object",
            required: ["status_name"],
            properties: {
              status_name: { type: "string", example: "pending" },
            },
          },
          JobStatusFull: {
            type: "object",
            required: [
              "status_id",
              "status_name",
              "created_by",
              "updated_by",
              "deleted_by",
              "created_at",
              "updated_at",
              "deleted_at",
            ],
            properties: {
              status_id: { type: "integer", example: 1 },
              status_name: { type: "string", example: "pending" },
              created_by: { type: "integer", nullable: true, example: null },
              updated_by: { type: "integer", nullable: true, example: null },
              deleted_by: { type: "integer", nullable: true, example: null },
              created_at: {
                type: "string",
                format: "date-time",
                example: "2026-08-04T03:00:00.000Z",
              },
              updated_at: {
                type: "string",
                format: "date-time",
                example: "2026-08-04T03:00:00.000Z",
              },
              deleted_at: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: null,
              },
            },
          },
          JobListItem: {
            type: "object",
            required: [
              "job_id",
              "job_uuid",
              "job_name",
              "description",
              "due_date",
              "notify_at",
              "completed_at",
              "created_at",
              "job_status",
            ],
            properties: {
              job_id: { type: "integer", example: 1 },
              job_uuid: {
                type: "string",
                format: "uuid",
                example: "0a18e4ef-6ad2-4c41-bb3a-922c8265b576",
              },
              job_name: { type: "string", example: "Plan weekly tasks" },
              description: {
                type: "string",
                nullable: true,
                example: "Review priorities and schedule work.",
              },
              due_date: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: "2026-08-05T10:00:00.000Z",
              },
              notify_at: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: null,
              },
              completed_at: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: null,
              },
              created_at: {
                type: "string",
                format: "date-time",
                example: "2026-08-04T03:00:00.000Z",
              },
              job_status: {
                $ref: "#/components/schemas/JobStatusName",
              },
            },
          },
          JobFull: {
            type: "object",
            required: [
              "job_id",
              "job_uuid",
              "job_name",
              "description",
              "detail",
              "user_id",
              "status_id",
              "start_date",
              "due_date",
              "notify_at",
              "completed_at",
              "created_by",
              "updated_by",
              "deleted_by",
              "created_at",
              "updated_at",
              "deleted_at",
              "job_status",
            ],
            properties: {
              job_id: { type: "integer", example: 1 },
              job_uuid: {
                type: "string",
                format: "uuid",
                example: "0a18e4ef-6ad2-4c41-bb3a-922c8265b576",
              },
              job_name: { type: "string", example: "Plan weekly tasks" },
              description: {
                type: "string",
                nullable: true,
                example: "Review priorities and schedule work.",
              },
              detail: {
                type: "string",
                nullable: true,
                example: "Break work into focused blocks.",
              },
              user_id: { type: "integer", example: 1 },
              status_id: { type: "integer", example: 1 },
              start_date: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: null,
              },
              due_date: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: "2026-08-05T10:00:00.000Z",
              },
              notify_at: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: null,
              },
              completed_at: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: null,
              },
              created_by: { type: "integer", nullable: true, example: 1 },
              updated_by: { type: "integer", nullable: true, example: 1 },
              deleted_by: { type: "integer", nullable: true, example: null },
              created_at: {
                type: "string",
                format: "date-time",
                example: "2026-08-04T03:00:00.000Z",
              },
              updated_at: {
                type: "string",
                format: "date-time",
                example: "2026-08-04T03:00:00.000Z",
              },
              deleted_at: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: null,
              },
              job_status: {
                $ref: "#/components/schemas/JobStatusFull",
              },
            },
          },
        },
      },
    },
  });
}
