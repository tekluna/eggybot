-- CreateTable
CREATE TABLE "User" (
    "discord_id" TEXT NOT NULL PRIMARY KEY,
    "tictactoe_id" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_tictactoe_id_fkey" FOREIGN KEY ("tictactoe_id") REFERENCES "Tictactoe" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tictactoe" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "User_discord_id_key" ON "User"("discord_id");
