import { createServer, Server as HttpServer } from 'http';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { io as createSocketClient, Socket } from 'socket.io-client';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { closeSocket, initializeSocket } from '../../src/realtime/socket';
import { sendNotification } from '../../src/modules/notifications/notifications.service';
import { signAccessToken } from '../../src/utils/jwt';

const app = createApp();
const fixtureKey = `notification-test-${Date.now()}`;
let ownerId: number;
let otherUserId: number;
let adminId: number;
let campusPostId: number | undefined;
let ownerToken: string;
let ownerJti: string;
let otherToken: string;
let adminToken: string;
let server: HttpServer;
let socketUrl: string;

async function createUser(email: string, roleName: 'STUDENT' | 'ADMIN') {
  const role = await prisma.role.upsert({
    where: { name: roleName },
    update: {},
    create: { name: roleName, description: roleName },
  });
  const user = await prisma.user.create({
    data: {
      email: `${fixtureKey}-${email}@uniconnect.test`,
      fullName: email,
      passwordHash: 'integration-test',
      roleId: role.id,
      status: 'ACTIVE',
    },
  });
  return { id: user.id, ...signAccessToken(user.id, roleName) };
}

describe('Notification Module API and Socket.IO', () => {
  beforeAll(async () => {
    const owner = await createUser('owner', 'STUDENT');
    const other = await createUser('other', 'STUDENT');
    const admin = await createUser('admin', 'ADMIN');
    ownerId = owner.id;
    ownerToken = owner.token;
    ownerJti = owner.jti;
    otherUserId = other.id;
    otherToken = other.token;
    adminId = admin.id;
    adminToken = admin.token;

    server = createServer(app);
    initializeSocket(server);
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, () => {
        const address = server.address();
        if (!address || typeof address === 'string') {
          reject(new Error('Could not determine Socket.IO test server address'));
          return;
        }
        socketUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await closeSocket();
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { userId: { in: [ownerId, otherUserId, adminId] } },
          ...(campusPostId ? [{ referenceType: 'CAMPUS_POST', referenceId: campusPostId }] : []),
        ],
      },
    });
    await prisma.adminLog.deleteMany({ where: { adminId } });
    await prisma.campusPost.deleteMany({ where: { authorId: adminId } });
    await prisma.comment.deleteMany({ where: { authorId: { in: [ownerId, otherUserId] } } });
    await prisma.post.deleteMany({ where: { authorId: { in: [ownerId, otherUserId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, otherUserId, adminId] } } });
  });

  it('persists notifications, lists unread count, and marks only the owner notification read', async () => {
    const notification = await sendNotification(ownerId, 'new_answer', {
      title: 'Câu hỏi có câu trả lời mới',
      message: fixtureKey,
      referenceType: 'QUESTION',
      referenceId: 101,
    });
    await sendNotification(ownerId, 'join_request', {
      title: 'Yêu cầu tham gia nhóm',
      message: fixtureKey,
    });

    const listResponse = await request(app)
      .get('/api/notifications?page=1&limit=1')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.notifications).toHaveLength(1);
    expect(listResponse.body.data.unreadCount).toBe(2);
    expect(listResponse.body.meta.total).toBe(2);
    expect(listResponse.body.meta.totalPages).toBe(2);

    const otherUserList = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${otherToken}`);
    expect(otherUserList.status).toBe(200);
    expect(otherUserList.body.data.notifications).toHaveLength(0);
    expect(otherUserList.body.data.unreadCount).toBe(0);

    const markReadResponse = await request(app)
      .put(`/api/notifications/${notification.id}/read`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(markReadResponse.status).toBe(200);
    expect(markReadResponse.body.data.isRead).toBe(true);

    const ownerCheck = await request(app)
      .put(`/api/notifications/${notification.id}/read`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(ownerCheck.status).toBe(404);

    const unreadResponse = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(unreadResponse.body.data.unreadCount).toBe(1);
  });

  it('requires authentication for notification routes and validates IDs', async () => {
    const unauthenticated = await request(app).get('/api/notifications');
    const unauthenticatedReadAll = await request(app).put('/api/notifications/read-all');
    const invalidId = await request(app)
      .put('/api/notifications/abc/read')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(unauthenticated.status).toBe(401);
    expect(unauthenticatedReadAll.status).toBe(401);
    expect(invalidId.status).toBe(400);
  });

  it('marks all notifications read only for the authenticated user', async () => {
    await prisma.notification.updateMany({
      where: { userId: { in: [ownerId, otherUserId] } },
      data: { isRead: true },
    });
    await sendNotification(ownerId, 'new_comment', {
      title: 'First unread',
      message: fixtureKey,
    });
    await sendNotification(ownerId, 'campus_post', {
      title: 'Second unread',
      message: fixtureKey,
    });
    await sendNotification(otherUserId, 'new_comment', {
      title: 'Other user unread',
      message: fixtureKey,
    });

    const response = await request(app)
      .put('/api/notifications/read-all')
      .set('Authorization', `Bearer ${ownerToken}`);
    const ownerList = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${ownerToken}`);
    const otherList = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${otherToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.updatedCount).toBe(2);
    expect(ownerList.body.data.unreadCount).toBe(0);
    expect(
      ownerList.body.data.notifications.every((item: { isRead: boolean }) => item.isRead),
    ).toBe(true);
    expect(otherList.body.data.unreadCount).toBe(1);
    expect(otherList.body.data.notifications[0].isRead).toBe(false);
  });

  it('notifies a post author when another user comments', async () => {
    const post = await prisma.post.create({
      data: {
        authorId: ownerId,
        title: fixtureKey,
        content: fixtureKey,
        category: 'COMMUNITY',
        scope: 'PUBLIC',
        status: 'ACTIVE',
      },
    });

    const response = await request(app)
      .post(`/api/posts/${post.id}/comments`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ content: `${fixtureKey} comment` });

    expect(response.status).toBe(201);
    const notification = await prisma.notification.findFirst({
      where: { userId: ownerId, type: 'new_comment', referenceId: post.id },
    });
    expect(notification?.message).toContain(`${fixtureKey} comment`);
  });

  it('sends campus post notifications to active users through the shared helper', async () => {
    const response = await request(app)
      .post('/api/admin/campus')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `${fixtureKey} campus`,
        content: `${fixtureKey} published campus announcement`,
        category: 'ANNOUNCEMENT',
      });

    expect(response.status).toBe(201);
    campusPostId = response.body.data.id as number;
    const notification = await prisma.notification.findFirst({
      where: {
        userId: ownerId,
        type: 'campus_post',
        referenceId: campusPostId,
      },
    });
    expect(notification?.message).toBe(`${fixtureKey} campus`);
  });

  it('authenticates Socket.IO connections with a valid JWT and rejects invalid tokens', async () => {
    const client: Socket = createSocketClient(socketUrl, {
      auth: { token: ownerToken },
      reconnection: false,
    });

    try {
      await new Promise<void>((resolve, reject) => {
        client.once('connect', resolve);
        client.once('connect_error', reject);
      });

      const receivedNotification = new Promise<{ type: string; userId: number }>((resolve) => {
        client.once('notification', resolve);
      });
      const receivedNamedEvent = new Promise<{ type: string; userId: number }>((resolve) => {
        client.once('new_comment', resolve);
      });
      await sendNotification(ownerId, 'new_comment', {
        title: 'Realtime test',
        message: fixtureKey,
      });
      const [received, namedEvent] = await Promise.all([receivedNotification, receivedNamedEvent]);
      expect(received.type).toBe('new_comment');
      expect(received.userId).toBe(ownerId);
      expect(namedEvent.id).toBe(received.id);
    } finally {
      client.disconnect();
    }

    const invalidClient = createSocketClient(socketUrl, {
      auth: { token: 'invalid-token' },
      reconnection: false,
    });
    try {
      const error = await new Promise<Error>((resolve) => {
        invalidClient.once('connect_error', resolve);
      });
      expect(error.message).toBe('Unauthorized');
    } finally {
      invalidClient.disconnect();
    }

    await prisma.revokedToken.create({
      data: {
        jti: ownerJti,
        userId: ownerId,
        expiresAt: new Date(Date.now() + 60_000),
      },
    });
    const revokedClient = createSocketClient(socketUrl, {
      auth: { token: ownerToken },
      reconnection: false,
    });
    try {
      const error = await new Promise<Error>((resolve) => {
        revokedClient.once('connect_error', resolve);
      });
      expect(error.message).toBe('Unauthorized');
    } finally {
      revokedClient.disconnect();
      await prisma.revokedToken.deleteMany({ where: { jti: ownerJti } });
    }
  });
});
