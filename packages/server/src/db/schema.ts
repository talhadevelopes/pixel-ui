import { pgTable, json, text, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import crypto from "crypto";

export const userTable = pgTable("users", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    credits: integer("credits").default(3), // Current available credits
    
    // NEW SUBSCRIPTION COLUMNS
    tier: varchar("tier").default("free"), // 'free' | 'pro' | 'premium'
    dailyCreditsLimit: integer("daily_credits_limit").default(3),
    lastCreditReset: timestamp("last_credit_reset").defaultNow(),
    subscriptionId: varchar("subscription_id"), // Razorpay subscription ID
    subscriptionStatus: varchar("subscription_status").default("inactive"), // 'active' | 'cancelled' | 'expired' | 'inactive'
    subscriptionEndDate: timestamp("subscription_end_date"),
    
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const tempRegistrationTable = pgTable("temp_register", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    otpCode: varchar("otp_code").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
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
    designCode: text(),
    projectId: varchar("projectId").notNull().references(() => projectTable.projectId), // Keep it as varchar
    createdAt: timestamp("created_at").defaultNow(),
});

export const chatTable = pgTable("chats", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    chatMessage: json("chatMessage"),
    frameId: varchar().references(() => frameTable.frameId),
    createdBy: varchar("createdBy").notNull().references(() => userTable.email),
    createdAt: timestamp("created_at").defaultNow(),
});

export const subscriptionHistoryTable = pgTable("subscription_history", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull().references(() => userTable.id),
    tier: varchar("tier").notNull(), // 'pro' | 'premium'
    razorpaySubscriptionId: varchar("razorpay_subscription_id").notNull().unique(),
    razorpayPaymentId: varchar("razorpay_payment_id"),
    razorpaySignature: varchar("razorpay_signature"),
    status: varchar("status").default("created"), // 'created' | 'active' | 'cancelled' | 'expired'
    amount: integer("amount").notNull(), // in paise (9900 for ₹99)
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});