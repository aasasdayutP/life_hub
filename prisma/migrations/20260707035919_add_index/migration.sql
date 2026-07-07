-- CreateIndex
CREATE INDEX "idx_jobs_user_deleted" ON "jobs"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_jobs_user_due" ON "jobs"("user_id", "due_date");

-- CreateIndex
CREATE INDEX "idx_jobs_uuid_user_deleted" ON "jobs"("job_uuid", "user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_jobs_status" ON "jobs"("status_id");

-- CreateIndex
CREATE INDEX "idx_sessions_token_hash" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "idx_sessions_user_deleted" ON "sessions"("user_id", "deleted_at");
