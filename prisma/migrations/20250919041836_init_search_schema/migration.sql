-- CreateTable
CREATE TABLE "public"."Search" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prompt" TEXT NOT NULL,
    "hashtags" TEXT[],
    "networks" TEXT[],
    "lang" TEXT,
    "maxResults" INTEGER,

    CONSTRAINT "Search_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Result" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "url" TEXT,
    "author" TEXT,
    "network" TEXT NOT NULL,
    "searchId" TEXT NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Result" ADD CONSTRAINT "Result_searchId_fkey" FOREIGN KEY ("searchId") REFERENCES "public"."Search"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
