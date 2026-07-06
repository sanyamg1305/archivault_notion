-- CreateTable
CREATE TABLE "passphrase_attempts" (
    "ip" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "firstAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),

    CONSTRAINT "passphrase_attempts_pkey" PRIMARY KEY ("ip")
);
