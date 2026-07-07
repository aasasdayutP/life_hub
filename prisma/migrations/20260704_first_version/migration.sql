-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "job_status" (
    "status_id" SERIAL NOT NULL,
    "status_name" VARCHAR(20) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "job_status_pkey" PRIMARY KEY ("status_id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "job_id" SERIAL NOT NULL,
    "job_uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "job_name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "detail" TEXT,
    "user_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ(6),
    "due_date" TIMESTAMPTZ(6),
    "notify_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("job_id")
);

-- CreateTable
CREATE TABLE "line_accounts" (
    "line_account_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "line_user_id" VARCHAR(255) NOT NULL,
    "display_name" VARCHAR(255),
    "linked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "line_accounts_pkey" PRIMARY KEY ("line_account_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(20) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "session_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "user_uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "deleted_by" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_status_status_name_key" ON "job_status"("status_name");

-- CreateIndex
CREATE UNIQUE INDEX "line_accounts_line_user_id_key" ON "line_accounts"("line_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "fk_jobs_status" FOREIGN KEY ("status_id") REFERENCES "job_status"("status_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "fk_jobs_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "line_accounts" ADD CONSTRAINT "fk_line_accounts_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "fk_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "fk_users_role" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

