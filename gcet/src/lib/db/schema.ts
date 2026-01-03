import { pgTable, varchar, timestamp, text, integer, json, boolean, uuid, date, decimal, index } from "drizzle-orm/pg-core";

const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  employee_id: varchar("employee_id", { length: 20 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: text("password_hash").notNull(),
  role: varchar("role", { enum: ["employee", "hr", "admin"] }).notNull().default("employee"),
  first_name: varchar("first_name", { length: 100 }).notNull(),
  last_name: varchar("last_name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  job_title: varchar("job_title", { length: 100 }),
  department: varchar("department", { length: 100 }),
  manager_id: uuid("manager_id"),
  profile_picture_url: text("profile_picture_url"),
  is_active: boolean("is_active").default(true),
  email_verified_at: timestamp("email_verified_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  employeeIdIdx: index("users_employee_id_idx").on(table.employee_id),
}));

export const users = usersTable;

export const employee_documents = pgTable("employee_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  file_url: text("file_url").notNull(),
  file_type: varchar("file_type", { length: 50 }).notNull(),
  file_name: varchar("file_name", { length: 255 }).notNull(),
  uploaded_by: uuid("uploaded_by").references(() => users.id).notNull(),
  uploaded_at: timestamp("uploaded_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  date: date("date").notNull(),
  check_in: timestamp("check_in"),
  check_out: timestamp("check_out"),
  status: varchar("status", { enum: ["present", "absent", "half_day", "leave"] }).notNull().default("absent"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userDateIdx: index("attendance_user_date_idx").on(table.user_id, table.date),
}));

export const leaves = pgTable("leaves", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  leave_type: varchar("leave_type", { enum: ["paid", "sick", "unpaid"] }).notNull(),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  days_count: decimal("days_count", { precision: 5, scale: 2 }).notNull(),
  reason: text("reason"),
  status: varchar("status", { enum: ["pending", "approved", "rejected"] }).default("pending").notNull(),
  approver_id: uuid("approver_id").references(() => users.id),
  approver_comments: text("approver_comments"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userStatusIdx: index("leaves_user_status_idx").on(table.user_id, table.status),
  approverIdx: index("leaves_approver_idx").on(table.approver_id),
}));

export const salary_structures = pgTable("salary_structures", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  base_salary: decimal("base_salary", { precision: 10, scale: 2 }).notNull(),
  basic_percentage: decimal("basic_percentage", { precision: 5, scale: 2 }).default("50").notNull(),
  hra_percentage: decimal("hra_percentage", { precision: 5, scale: 2 }).default("50").notNull(),
  standard_allowance: decimal("standard_allowance", { precision: 10, scale: 2 }).default("4167").notNull(),
  performance_bonus_percentage: decimal("performance_bonus_percentage", { precision: 5, scale: 2 }).default("8.33").notNull(),
  lta_percentage: decimal("lta_percentage", { precision: 5, scale: 2 }).default("8.33").notNull(),
  pf_employee_rate: decimal("pf_employee_rate", { precision: 5, scale: 2 }).default("12").notNull(),
  pf_employer_rate: decimal("pf_employer_rate", { precision: 5, scale: 2 }).default("12").notNull(),
  professional_tax: decimal("professional_tax", { precision: 10, scale: 2 }).default("200").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const payrolls = pgTable("payrolls", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  pay_period_start: date("pay_period_start").notNull(),
  pay_period_end: date("pay_period_end").notNull(),
  gross_salary: decimal("gross_salary", { precision: 10, scale: 2 }).notNull(),
  total_deductions: decimal("total_deductions", { precision: 10, scale: 2 }).notNull(),
  net_salary: decimal("net_salary", { precision: 10, scale: 2 }).notNull(),
  payable_days: integer("payable_days").notNull(),
  payslip_url: text("payslip_url"),
  generated_by: uuid("generated_by").references(() => users.id).notNull(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  userPeriodIdx: index("payrolls_user_period_idx").on(table.user_id, table.pay_period_start),
}));

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: varchar("type", { enum: ["leave_status", "payroll_published", "approval_request", "attendance_alert", "system"] }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  payload: json("payload"),
  is_read: boolean("is_read").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  userReadIdx: index("notifications_user_read_idx").on(table.user_id, table.is_read),
  typeIdx: index("notifications_type_idx").on(table.type),
}));

export const audit_logs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(),
  details: json("details"),
  ip_address: varchar("ip_address", { length: 45 }),
  user_agent: text("user_agent"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  userActionIdx: index("audit_logs_user_action_idx").on(table.user_id, table.action),
  actionIdx: index("audit_logs_action_idx").on(table.action),
}));

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  expires: timestamp("expires").notNull(),
  session_token: varchar("session_token", { length: 255 }).notNull().unique(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  tokenIdx: index("sessions_token_idx").on(table.session_token),
  userExpiresIdx: index("sessions_user_expires_idx").on(table.user_id, table.expires),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type NewAttendance = typeof attendance.$inferInsert;
export type Leave = typeof leaves.$inferSelect;
export type NewLeave = typeof leaves.$inferInsert;
export type Payroll = typeof payrolls.$inferSelect;
export type NewPayroll = typeof payrolls.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type SalaryStructure = typeof salary_structures.$inferSelect;
export type NewSalaryStructure = typeof salary_structures.$inferInsert;
