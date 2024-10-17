import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  username: varchar('username', { length: 50 }).unique(),
  email: varchar('email', { length: 100 }).unique(),
  phone: varchar('phone', { length: 15 }).unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
})

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
})

export const teamsMemberRoles = pgTable('teams_member_roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
})

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
})

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
})

export const usersRolesConnections = pgTable('users_roles_connections', {
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id),
})

export const teamMembersRolesConnections = pgTable('team_members_roles_connections', {
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamMemberRoleId: integer('team_member_role_id')
    .notNull()
    .references(() => teamsMemberRoles.id),
})

export const invitationsRolesConnections = pgTable('invitations_roles_connections', {
  team: integer('team_id')
    .notNull()
    .references(() => teams.id),
  invitationsId: integer('invitations_id')
    .notNull()
    .references(() => invitations.id),
  teamsMemberRoleId: integer('team_member_role_id')
    .notNull()
    .references(() => teamsMemberRoles.id),
})

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  teamsMemberRoles: many(teamsMemberRoles),
  teamMembersRolesConnections: many(teamMembersRolesConnections),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}))

export const usersRelations = relations(users, ({ many }) => ({
  userRolesConnections: many(usersRolesConnections),
  teamMembers: many(teamMembers),
  teamMembersRolesConnections: many(teamMembersRolesConnections),
  invitationsSent: many(invitations),
}))

export const rolesRelations = relations(roles, ({ many }) => ({
  userRolesConnections: many(usersRolesConnections),
}))

export const teamMembersRelations = relations(teamMembers, ({ one, many }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
  teamMembersRolesConnections: many(teamMembersRolesConnections),
}))

export const teamsMemberRolesRelations = relations(teamsMemberRoles, ({ one, many }) => ({
  team: one(teams, {
    fields: [teamsMemberRoles.teamId],
    references: [teams.id],
  }),
  teamMembersRolesConnections: many(teamMembersRolesConnections),
  invitationsRolesConnections: many(invitationsRolesConnections),
}))

export const userRolesConnectionsRelations = relations(usersRolesConnections, ({ one }) => ({
  user: one(users, {
    fields: [usersRolesConnections.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [usersRolesConnections.roleId],
    references: [roles.id],
  }),
}))

export const teamMembersRolesConnectionsRelations = relations(
  teamMembersRolesConnections,
  ({ one }) => ({
    user: one(users, {
      fields: [teamMembersRolesConnections.userId],
      references: [users.id],
    }),
    team: one(teams, {
      fields: [teamMembersRolesConnections.teamId],
      references: [teams.id],
    }),
    teamMemberRole: one(teamsMemberRoles, {
      fields: [teamMembersRolesConnections.teamMemberRoleId],
      references: [teamsMemberRoles.id],
    }),
  }),
)

export const invitationsRolesConnectionRelations = relations(
  invitationsRolesConnections,
  ({ one }) => ({
    invitation: one(invitations, {
      fields: [invitationsRolesConnections.invitationsId],
      references: [invitations.id],
    }),
    team: one(teams, {
      fields: [invitationsRolesConnections.team],
      references: [teams.id],
    }),
    teamsMemberRole: one(teamsMemberRoles, {
      fields: [invitationsRolesConnections.teamsMemberRoleId],
      references: [teamsMemberRoles.id],
    }),
  }),
)

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}))

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Role = typeof roles.$inferInsert
export type UserRoleConnection = typeof usersRolesConnections.$inferInsert
export type Team = typeof teams.$inferSelect
export type NewTeam = typeof teams.$inferInsert
export type TeamMember = typeof teamMembers.$inferSelect
export type TeamMemberRolesConnection = typeof teamMembersRolesConnections.$inferSelect
export type NewTeamMember = typeof teamMembers.$inferInsert
export type ActivityLog = typeof activityLogs.$inferSelect
export type NewActivityLog = typeof activityLogs.$inferInsert
export type Invitation = typeof invitations.$inferSelect
export type NewInvitation = typeof invitations.$inferInsert
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email' | 'username' | 'phone'> & {
      userRolesConnections: (UserRoleConnection & {
        role: Pick<Role, 'id' | 'name'>
      })[]
    }
  })[]
}
export type UserDetails = User & {
  teamMembers: (TeamMember & {
    team: Team
  })[]
  userRolesConnections: (UserRoleConnection & {})[]
  teamMembersRolesConnections: (TeamMemberRolesConnection & {})[]
}

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  CREATE_ROLE = 'CREATE_ROLE',
  CREATE_TEAM_MEMBERS_ROLE = 'CREATE_TEAM_MEMBERS_ROLE',
  DELETE_ROLE = 'DELETE_ROLE',
  DELETE_TEAM_MEMBERS_ROLE = 'DELETE_TEAM_MEMBERS_ROLE',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
