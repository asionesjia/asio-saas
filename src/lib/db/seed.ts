import { db } from './drizzle'
import {
  roles,
  teamMembers,
  teamMembersRolesConnections,
  teams,
  teamsMemberRoles,
  users,
  usersRolesConnections,
} from './schema'
import { hashPassword } from '@/lib/auth/session'

async function seed() {
  const email = 'test@test.com'
  const phone = '18888888888'
  const username = 'test'
  const password = 'test'
  const passwordHash = await hashPassword(password)

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        phone: phone,
        username: username,
        passwordHash: passwordHash,
      },
    ])
    .returning()

  console.log('Initial user created.')

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
    .returning()

  const user_roles = await db
    .insert(roles)
    .values([
      {
        name: 'public',
      },
      {
        name: 'admin',
      },
      {
        name: 'super-admin',
      },
    ])
    .returning()

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
  })

  const teams_member_roles = await db
    .insert(teamsMemberRoles)
    .values([
      {
        teamId: team.id,
        name: 'member',
      },
      {
        teamId: team.id,
        name: 'admin',
      },
      {
        teamId: team.id,
        name: 'super-admin',
      },
    ])
    .returning()

  await db.insert(usersRolesConnections).values([
    {
      userId: user.id,
      roleId: user_roles[0].id,
    },
    {
      userId: user.id,
      roleId: user_roles[1].id,
    },
    {
      userId: user.id,
      roleId: user_roles[2].id,
    },
  ])

  await db.insert(teamMembersRolesConnections).values([
    {
      userId: user.id,
      teamId: team.id,
      teamMemberRoleId: teams_member_roles[0].id,
    },
    {
      userId: user.id,
      teamId: team.id,
      teamMemberRoleId: teams_member_roles[1].id,
    },
    {
      userId: user.id,
      teamId: team.id,
      teamMemberRoleId: teams_member_roles[2].id,
    },
  ])
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error)
    process.exit(1)
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...')
    process.exit(0)
  })
