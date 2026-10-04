#!/usr/bin/env -S node
import type { Contract as End } from "../../snapshots/b57ea8c4127001ded51341604ccac878b23f5516a30341ad3c9a1f5c88c9328c/contract";
import endContract from "../../snapshots/b57ea8c4127001ded51341604ccac878b23f5516a30341ad3c9a1f5c88c9328c/contract.json" with { type: "json" };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from "@prisma/orm-postgres/migration";

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: "public" }),
      this.createTable({
        schema: "public",
        table: "applications",
        columns: [
          col("appliedAt", "date", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/date-string@1" },
          }),
          col("id", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("status", "text", {
            notNull: true,
            default: lit("PENDING"),
            codecRef: { codecId: "pg/text@1" },
          }),
          col("taskId", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("workerId", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
        ],
        constraints: [
          primaryKey(["id"]),
          checkExpression(
            "applications_status_check_904c6455",
            "\"status\" IN ('PENDING', 'ACCEPTED', 'REJECTED')",
          ),
        ],
      }),
      this.createTable({
        schema: "public",
        table: "notifications",
        columns: [
          col("createdAt", "date", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/date-string@1" },
          }),
          col("id", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("isRead", "bool", {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: "pg/bool@1" },
          }),
          col("message", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("title", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("type", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("userId", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
        ],
        constraints: [
          primaryKey(["id"]),
          checkExpression(
            "notifications_type_check_0fa89ccc",
            "\"type\" IN ('NEW_APPLICATION', 'APPLICATION_ACCEPTED', 'APPLICATION_REJECTED', 'TASK_COMPLETED')",
          ),
        ],
      }),
      this.createTable({
        schema: "public",
        table: "tasks",
        columns: [
          col("budget", "int4", { notNull: true, codecRef: { codecId: "pg/int4@1" } }),
          col("category", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("createdAt", "date", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/date-string@1" },
          }),
          col("description", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("id", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("latitude", "float8", { codecRef: { codecId: "pg/float8@1" } }),
          col("location", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("longitude", "float8", { codecRef: { codecId: "pg/float8@1" } }),
          col("posterId", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("scheduleDate", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("scheduleTime", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("status", "text", {
            notNull: true,
            default: lit("OPEN"),
            codecRef: { codecId: "pg/text@1" },
          }),
          col("title", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("updatedAt", "date", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/date-string@1" },
          }),
        ],
        constraints: [
          primaryKey(["id"]),
          checkExpression(
            "tasks_status_check_228d6925",
            "\"status\" IN ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')",
          ),
        ],
      }),
      this.createTable({
        schema: "public",
        table: "transactions",
        columns: [
          col("amount", "int4", { notNull: true, codecRef: { codecId: "pg/int4@1" } }),
          col("commissionAmount", "int4", {
            notNull: true,
            codecRef: { codecId: "pg/int4@1" },
          }),
          col("commissionRate", "float8", {
            notNull: true,
            codecRef: { codecId: "pg/float8@1" },
          }),
          col("createdAt", "date", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/date-string@1" },
          }),
          col("id", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("netAmount", "int4", { notNull: true, codecRef: { codecId: "pg/int4@1" } }),
          col("status", "text", {
            notNull: true,
            default: lit("PENDING"),
            codecRef: { codecId: "pg/text@1" },
          }),
          col("taskId", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
        ],
        constraints: [
          primaryKey(["id"]),
          checkExpression(
            "transactions_status_check_50d0035a",
            "\"status\" IN ('PENDING', 'PAID')",
          ),
        ],
      }),
      this.createTable({
        schema: "public",
        table: "users",
        columns: [
          col("createdAt", "date", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/date-string@1" },
          }),
          col("email", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("hashedPassword", "text", {
            notNull: true,
            codecRef: { codecId: "pg/text@1" },
          }),
          col("id", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("image", "text", { codecRef: { codecId: "pg/text@1" } }),
          col("name", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("role", "text", { notNull: true, codecRef: { codecId: "pg/text@1" } }),
          col("updatedAt", "date", {
            notNull: true,
            default: fn("now()"),
            codecRef: { codecId: "pg/date-string@1" },
          }),
        ],
        constraints: [
          primaryKey(["id"]),
          checkExpression(
            "users_role_check_14f8053b",
            "\"role\" IN ('POSTER', 'WORKER')",
          ),
        ],
      }),
      this.addUnique({
        schema: "public",
        table: "applications",
        constraint: "applications_taskId_workerId_key",
        columns: ["taskId", "workerId"],
      }),
      this.addUnique({
        schema: "public",
        table: "users",
        constraint: "users_email_key",
        columns: ["email"],
      }),
      this.createIndex({
        schema: "public",
        table: "applications",
        index: "applications_status_idx_e98638ab",
        columns: ["status"],
      }),
      this.createIndex({
        schema: "public",
        table: "applications",
        index: "applications_taskId_idx_4965c936",
        columns: ["taskId"],
      }),
      this.createIndex({
        schema: "public",
        table: "applications",
        index: "applications_workerId_idx_0b8f3a7c",
        columns: ["workerId"],
      }),
      this.createIndex({
        schema: "public",
        table: "notifications",
        index: "notifications_isRead_idx_a2737ae3",
        columns: ["isRead"],
      }),
      this.createIndex({
        schema: "public",
        table: "notifications",
        index: "notifications_userId_idx_a489d58a",
        columns: ["userId"],
      }),
      this.createIndex({
        schema: "public",
        table: "tasks",
        index: "tasks_category_idx_f2600f8e",
        columns: ["category"],
      }),
      this.createIndex({
        schema: "public",
        table: "tasks",
        index: "tasks_posterId_idx_981844b1",
        columns: ["posterId"],
      }),
      this.createIndex({
        schema: "public",
        table: "tasks",
        index: "tasks_status_idx_e98638ab",
        columns: ["status"],
      }),
      this.createIndex({
        schema: "public",
        table: "transactions",
        index: "transactions_status_idx_e98638ab",
        columns: ["status"],
      }),
      this.createIndex({
        schema: "public",
        table: "transactions",
        index: "transactions_taskId_idx_4965c936",
        columns: ["taskId"],
      }),
      this.addForeignKey({
        schema: "public",
        table: "applications",
        foreignKey: {
          name: "applications_taskId_fkey",
          columns: ["taskId"],
          references: { schema: "public", table: "tasks", columns: ["id"] },
          onDelete: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "applications",
        foreignKey: {
          name: "applications_workerId_fkey",
          columns: ["workerId"],
          references: { schema: "public", table: "users", columns: ["id"] },
          onDelete: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "notifications",
        foreignKey: {
          name: "notifications_userId_fkey",
          columns: ["userId"],
          references: { schema: "public", table: "users", columns: ["id"] },
          onDelete: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "tasks",
        foreignKey: {
          name: "tasks_posterId_fkey",
          columns: ["posterId"],
          references: { schema: "public", table: "users", columns: ["id"] },
          onDelete: "cascade",
        },
      }),
      this.addForeignKey({
        schema: "public",
        table: "transactions",
        foreignKey: {
          name: "transactions_taskId_fkey",
          columns: ["taskId"],
          references: { schema: "public", table: "tasks", columns: ["id"] },
          onDelete: "cascade",
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
