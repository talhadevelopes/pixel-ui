import { pgTable, json, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable("users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    credits: integer("credits").default(5),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const projectTable = pgTable("projects", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    projectId: varchar("projectId").notNull().unique(), // Make it UNIQUE
    createdBy: varchar("createdBy").notNull().references(() => userTable.email),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const frameTable = pgTable("frames", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    frameId: varchar("frameId").notNull(),
    projectId: varchar("projectId").notNull().references(() => projectTable.projectId), // Keep it as varchar
    createdAt: timestamp("created_at").defaultNow(),
});

export const chatTable = pgTable("chats", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    chatMessage: json("chatMessage"),
    createdBy: varchar("createdBy").notNull().references(() => userTable.email),
    createdAt: timestamp("created_at").defaultNow(),
});