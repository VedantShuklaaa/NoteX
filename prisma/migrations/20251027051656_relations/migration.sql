-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "fetchDetails_accessedBy_idx" ON "fetchDetails"("accessedBy");

-- CreateIndex
CREATE INDEX "fetchDetails_imageId_idx" ON "fetchDetails"("imageId");

-- CreateIndex
CREATE INDEX "fetchDetails_accessedAt_idx" ON "fetchDetails"("accessedAt");

-- CreateIndex
CREATE INDEX "noteDetails_uploadedBy_idx" ON "noteDetails"("uploadedBy");

-- CreateIndex
CREATE INDEX "noteDetails_type_idx" ON "noteDetails"("type");

-- CreateIndex
CREATE INDEX "noteDetails_createdAt_idx" ON "noteDetails"("createdAt");
