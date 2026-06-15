-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL,
    "personalInfo" JSONB,
    "targetWeight" REAL,
    "assignedDietitianId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_assignedDietitianId_fkey" FOREIGN KEY ("assignedDietitianId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MealPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "images" JSONB NOT NULL,
    "dietitianFeedback" TEXT NOT NULL DEFAULT 'PENDING',
    "dietitianComment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MealPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Story_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CheckUp" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dietitianId" TEXT NOT NULL,
    "actualWeight" REAL NOT NULL,
    "fatPercentage" REAL,
    "reportImageUrl" TEXT,
    "nextAppointmentDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CheckUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CheckUp_dietitianId_fkey" FOREIGN KEY ("dietitianId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DietPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "dietitianId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contentUrl" TEXT,
    "contentText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DietPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DietPlan_dietitianId_fkey" FOREIGN KEY ("dietitianId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MealPost_userId_createdAt_idx" ON "MealPost"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Story_userId_expiresAt_idx" ON "Story"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "CheckUp_userId_nextAppointmentDate_idx" ON "CheckUp"("userId", "nextAppointmentDate");

-- CreateIndex
CREATE INDEX "DietPlan_userId_createdAt_idx" ON "DietPlan"("userId", "createdAt");
