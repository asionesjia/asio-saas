import { desc, eq } from 'drizzle-orm'
import { db } from './drizzle'
import { activityLogs, teamMembers, teams, users } from './schema'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/session'

export async function getUser() {
  const sessionCookie = (await cookies()).get('session')
  if (!sessionCookie || !sessionCookie.value) {
    return null
  }

  const sessionData = await verifyToken(sessionCookie.value)
  if (!sessionData || !sessionData.user || typeof sessionData.user.id !== 'number') {
    return null
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null
  }

  try {
    const user_details = await db.query.users.findFirst({
      where: (users, { eq, isNull, and }) =>
        and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)), // 查询 users 表的条件
      with: {
        teamMembers: {
          with: {
            team: true,
          },
        },
        userRolesConnections: true,
        teamMembersRolesConnections: true,
      },
    })
    if (user_details) return user_details
    return null
  } catch (e) {
    return null
  }
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1)

  return result.length > 0 ? result[0] : null
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null
    stripeProductId: string | null
    planName: string | null
    subscriptionStatus: string
  },
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId))
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1)

  return result[0]
}

export async function getActivityLogs() {
  const user = await getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  return db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10)
}

export async function getTeamForUser(userId: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      userRolesConnections: {
        with: {
          role: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
      teamMembers: {
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                      username: true,
                      phone: true,
                    },
                    with: {
                      userRolesConnections: {
                        with: {
                          role: {
                            columns: {
                              id: true,
                              name: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  return result?.teamMembers[0]?.team || null
}
