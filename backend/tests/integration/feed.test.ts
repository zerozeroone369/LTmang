import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';
import { signAccessToken } from '../../src/utils/jwt';
import { hashPassword } from '../../src/utils/password';

const app = createApp();
const fixtureKey = `feed-test-${Date.now()}`;
const academicLevels = ['CLASS', 'COURSE', 'MAJOR', 'FACULTY', 'SCHOOL'] as const;
type AcademicLevel = (typeof academicLevels)[number];
type AcademicIds = {
  schoolId: number;
  facultyId: number;
  majorId: number;
  courseId: number;
  classId: number;
};

describe('Smart News Feed Module API', () => {
  let userId: number;
  let otherUserId: number;
  let fixtureUserIds: number[];
  let token: string;
  let missingLevelTokens: Record<AcademicLevel, string>;
  let academicIds: AcademicIds;
  let otherAcademicIds: AcademicIds;

  async function createAcademicBranch(suffix: string): Promise<AcademicIds> {
    const school = await prisma.school.create({
      data: { code: `F${suffix}`, name: `Feed School ${suffix}` },
    });
    const faculty = await prisma.faculty.create({
      data: { schoolId: school.id, code: `F${suffix}`, name: `Feed Faculty ${suffix}` },
    });
    const major = await prisma.major.create({
      data: { facultyId: faculty.id, code: `F${suffix}`, name: `Feed Major ${suffix}` },
    });
    const course = await prisma.course.create({
      data: { schoolId: school.id, code: `F${suffix}`, name: `Feed Course ${suffix}` },
    });
    const classRoom = await prisma.class.create({
      data: {
        majorId: major.id,
        courseId: course.id,
        code: `F${suffix}`,
        name: `Feed Class ${suffix}`,
      },
    });
    return {
      schoolId: school.id,
      facultyId: faculty.id,
      majorId: major.id,
      courseId: course.id,
      classId: classRoom.id,
    };
  }

  async function createFeedUser(emailSuffix: string, ids: AcademicIds, omitLevel?: AcademicLevel) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: 'STUDENT' } });
    const user = await prisma.user.create({
      data: {
        email: `${fixtureKey}-${emailSuffix}@uniconnect.test`,
        fullName: `Feed ${emailSuffix}`,
        passwordHash: await hashPassword('Student@123456'),
        roleId: role.id,
        status: 'ACTIVE',
        schoolId: omitLevel === 'SCHOOL' ? null : ids.schoolId,
        facultyId: omitLevel === 'FACULTY' ? null : ids.facultyId,
        majorId: omitLevel === 'MAJOR' ? null : ids.majorId,
        courseId: omitLevel === 'COURSE' ? null : ids.courseId,
        classId: omitLevel === 'CLASS' ? null : ids.classId,
      },
    });
    return {
      id: user.id,
      token: signAccessToken(user.id, 'STUDENT').token,
    };
  }

  async function createPost(
    title: string,
    scope: AcademicLevel | 'PUBLIC',
    ids: AcademicIds,
    createdAt = new Date(),
  ) {
    return prisma.post.create({
      data: {
        authorId: userId,
        title,
        content: `${fixtureKey} ${title} content`,
        category: 'COMMUNITY',
        scope,
        ...ids,
        createdAt,
      },
    });
  }

  beforeAll(async () => {
    const role = await prisma.role.upsert({
      where: { name: 'STUDENT' },
      update: {},
      create: { name: 'STUDENT', description: 'Student' },
    });
    academicIds = await createAcademicBranch(`${Date.now()}A`);
    otherAcademicIds = await createAcademicBranch(`${Date.now()}B`);

    const mainUser = await createFeedUser('main', academicIds);
    const otherUser = await createFeedUser('other', otherAcademicIds);
    userId = mainUser.id;
    token = mainUser.token;
    otherUserId = otherUser.id;
    fixtureUserIds = [userId, otherUserId];

    missingLevelTokens = {} as Record<AcademicLevel, string>;
    for (const level of academicLevels) {
      const missingUser = await createFeedUser(
        `missing-${level.toLowerCase()}`,
        academicIds,
        level,
      );
      fixtureUserIds.push(missingUser.id);
      missingLevelTokens[level] = missingUser.token;
    }

    expect(role).toBeDefined();
  });

  beforeEach(async () => {
    await prisma.post.deleteMany({ where: { authorId: { in: fixtureUserIds } } });
    await prisma.campusPost.deleteMany({ where: { authorId: { in: fixtureUserIds } } });
    await prisma.userFeedPreference.upsert({
      where: { userId },
      create: { userId, categories: 'ALL', scope: 'CLASS' },
      update: { categories: 'ALL', scope: 'CLASS' },
    });
  });

  afterAll(async () => {
    if (fixtureUserIds?.length) {
      await prisma.post.deleteMany({ where: { authorId: { in: fixtureUserIds } } });
      await prisma.campusPost.deleteMany({ where: { authorId: { in: fixtureUserIds } } });
      await prisma.userFeedPreference.deleteMany({ where: { userId: { in: fixtureUserIds } } });
      await prisma.user.deleteMany({ where: { id: { in: fixtureUserIds } } });
    }
    if (academicIds && otherAcademicIds) {
      const classIds = [academicIds.classId, otherAcademicIds.classId];
      const courseIds = [academicIds.courseId, otherAcademicIds.courseId];
      const majorIds = [academicIds.majorId, otherAcademicIds.majorId];
      const facultyIds = [academicIds.facultyId, otherAcademicIds.facultyId];
      const schoolIds = [academicIds.schoolId, otherAcademicIds.schoolId];
      await prisma.class.deleteMany({ where: { id: { in: classIds } } });
      await prisma.course.deleteMany({ where: { id: { in: courseIds } } });
      await prisma.major.deleteMany({ where: { id: { in: majorIds } } });
      await prisma.faculty.deleteMany({ where: { id: { in: facultyIds } } });
      await prisma.school.deleteMany({ where: { id: { in: schoolIds } } });
    }
    await prisma.$disconnect();
  });

  it('GET /api/feed - yêu cầu đăng nhập', async () => {
    const response = await request(app).get('/api/feed');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/feed - công khai rõ Documents và Questions đang chờ chính sách truy cập', async () => {
    const response = await request(app)
      .get(`/api/feed?search=${encodeURIComponent(fixtureKey)}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.items).toEqual([]);
    expect(response.body.data.unavailableSources).toEqual([
      { sourceType: 'DOCUMENT', reason: 'ACCESS_POLICY_UNCONFIRMED' },
      { sourceType: 'QUESTION', reason: 'ACCESS_POLICY_UNCONFIRMED' },
    ]);
    expect(response.body.meta).toEqual({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    });
  });

  it('PUT /api/feed/preferences - tạo và cập nhật preference theo user đã xác thực', async () => {
    const firstResponse = await request(app)
      .put('/api/feed/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ categories: ['STUDY', 'ACTIVITY'], scope: 'FACULTY' });

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body.data.userId).toBe(userId);
    expect(firstResponse.body.data.categories).toEqual(['STUDY', 'ACTIVITY']);
    expect(firstResponse.body.data.scope).toBe('FACULTY');

    const secondResponse = await request(app)
      .put('/api/feed/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ categories: ['COMMUNITY'], scope: 'CLASS' });

    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.data.categories).toEqual(['COMMUNITY']);
    expect(secondResponse.body.data.scope).toBe('CLASS');

    const storedPreferences = await prisma.userFeedPreference.findMany({ where: { userId } });
    expect(storedPreferences).toHaveLength(1);
    expect(storedPreferences[0].categories).toBe('COMMUNITY');
    expect(storedPreferences[0].scope).toBe('CLASS');
  });

  it('PUT /api/feed/preferences - kiểm tra category và scope', async () => {
    const response = await request(app)
      .put('/api/feed/preferences')
      .set('Authorization', `Bearer ${token}`)
      .send({ categories: ['UNKNOWN'], scope: 'GLOBAL' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/feed - chỉ trả các scope học vụ khớp đúng ID của người xem', async () => {
    const levels = [
      ['CLASS', 'classId'],
      ['COURSE', 'courseId'],
      ['MAJOR', 'majorId'],
      ['FACULTY', 'facultyId'],
      ['SCHOOL', 'schoolId'],
    ] as const;

    for (const [level, idField] of levels) {
      await createPost(`${level} matched`, level, academicIds);
      await createPost(`${level} mismatched`, level, {
        ...academicIds,
        [idField]: otherAcademicIds[idField],
      });
    }

    const response = await request(app)
      .get(`/api/feed?category=COMMUNITY&search=${encodeURIComponent(fixtureKey)}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items.map((item: { title: string }) => item.title)).toEqual([
      'CLASS matched',
      'SCHOOL matched',
      'COURSE matched',
      'MAJOR matched',
      'FACULTY matched',
    ]);
    expect(response.body.meta.total).toBe(5);
  });

  it.each(academicLevels)(
    'GET /api/feed - không trả scope %s nếu user thiếu ID cấp đó',
    async (level) => {
      await createPost(`${level} scoped post`, level, academicIds);

      const response = await request(app)
        .get(`/api/feed?category=COMMUNITY&search=${encodeURIComponent(fixtureKey)}`)
        .set('Authorization', `Bearer ${missingLevelTokens[level]}`);

      expect(response.status).toBe(200);
      expect(
        response.body.data.items.some((item: { scopeLevel: string }) => item.scopeLevel === level),
      ).toBe(false);
    },
  );

  it('GET /api/feed - CampusPost là GLOBAL, chỉ hiển thị category phù hợp ở trạng thái PUBLISHED', async () => {
    await prisma.campusPost.createMany({
      data: [
        {
          authorId: userId,
          title: 'Published event',
          content: `${fixtureKey} Published event content`,
          category: 'EVENT',
          status: 'PUBLISHED',
        },
        {
          authorId: userId,
          title: 'Published scholarship',
          content: `${fixtureKey} Published scholarship content`,
          category: 'SCHOLARSHIP',
          status: 'PUBLISHED',
        },
        {
          authorId: userId,
          title: 'Hidden event',
          content: `${fixtureKey} Hidden event content`,
          category: 'EVENT',
          status: 'HIDDEN',
        },
        {
          authorId: userId,
          title: 'Draft club',
          content: `${fixtureKey} Draft club content`,
          category: 'CLUB',
          status: 'DRAFT',
        },
        {
          authorId: userId,
          title: 'Announcement',
          content: `${fixtureKey} Not part of the four feed groups`,
          category: 'ANNOUNCEMENT',
          status: 'PUBLISHED',
        },
      ],
    });

    const response = await request(app)
      .get(`/api/feed?search=${encodeURIComponent(fixtureKey)}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data.items.map((item: { title: string }) => item.title).sort()).toEqual([
      'Published event',
      'Published scholarship',
    ]);
    expect(
      response.body.data.items.every(
        (item: { scopeLevel: string }) => item.scopeLevel === 'GLOBAL',
      ),
    ).toBe(true);
  });

  it('GET /api/feed - ưu tiên CLASS rồi SCHOOL trước các scope khác và vẫn xét ghim, ngày, ID', async () => {
    const old = new Date('2024-01-01T00:00:00.000Z');
    const recent = new Date('2025-01-01T00:00:00.000Z');
    await createPost('Old class', 'CLASS', academicIds, old);
    await createPost('Recent course', 'COURSE', academicIds, recent);
    await createPost('Recent major', 'MAJOR', academicIds, recent);
    await createPost('Recent faculty', 'FACULTY', academicIds, recent);
    await createPost('Recent school', 'SCHOOL', academicIds, recent);
    await createPost('Recent public', 'PUBLIC', academicIds, recent);
    await prisma.campusPost.createMany({
      data: [
        {
          authorId: userId,
          title: 'Pinned campus',
          content: `${fixtureKey} Pinned global campus content`,
          category: 'EVENT',
          status: 'PUBLISHED',
          isPinned: true,
          createdAt: old,
        },
        {
          authorId: userId,
          title: 'Recent campus',
          content: `${fixtureKey} Recent global campus content`,
          category: 'EVENT',
          status: 'PUBLISHED',
          createdAt: recent,
        },
      ],
    });

    const response = await request(app)
      .get(`/api/feed?page=1&limit=20&search=${encodeURIComponent(fixtureKey)}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body.data.items.map((item: { title: string }) => item.title)).toEqual([
      'Old class',
      'Recent school',
      'Pinned campus',
      'Recent campus',
      'Recent public',
      'Recent course',
      'Recent major',
      'Recent faculty',
    ]);
  });

  it.each([
    ['CLASS', ['CLASS preferred', 'SCHOOL preferred', 'GLOBAL preferred']],
    ['SCHOOL', ['SCHOOL preferred', 'CLASS preferred', 'GLOBAL preferred']],
    ['GLOBAL', ['GLOBAL preferred', 'SCHOOL preferred', 'CLASS preferred']],
  ] as const)(
    'GET /api/feed - ưu tiên thứ tự scope khi lựa chọn %s mà không loại scope khác',
    async (scope, expectedTitles) => {
      await createPost('CLASS preferred', 'CLASS', academicIds);
      await createPost('SCHOOL preferred', 'SCHOOL', academicIds);
      await createPost('GLOBAL preferred', 'PUBLIC', academicIds);

      const response = await request(app)
        .get(`/api/feed?category=COMMUNITY&scope=${scope}&search=preferred`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.items.map((item: { title: string }) => item.title)).toEqual(
        expectedTitles,
      );
      expect(response.body.meta.total).toBe(3);
    },
  );

  it('GET /api/feed - scope query ghi đè preference và khi thiếu query dùng preference', async () => {
    await createPost('CLASS preference', 'CLASS', academicIds);
    await createPost('SCHOOL preference', 'SCHOOL', academicIds);
    await createPost('GLOBAL preference', 'PUBLIC', academicIds);
    await prisma.userFeedPreference.update({
      where: { userId },
      data: { scope: 'SCHOOL', categories: 'COMMUNITY' },
    });

    const queryOverride = await request(app)
      .get('/api/feed?scope=CLASS&search=preference')
      .set('Authorization', `Bearer ${token}`);
    const preferenceDefault = await request(app)
      .get('/api/feed?search=preference')
      .set('Authorization', `Bearer ${token}`);

    expect(queryOverride.body.data.items.map((item: { title: string }) => item.title)).toEqual([
      'CLASS preference',
      'SCHOOL preference',
      'GLOBAL preference',
    ]);
    expect(preferenceDefault.body.data.items.map((item: { title: string }) => item.title)).toEqual([
      'SCHOOL preference',
      'CLASS preference',
      'GLOBAL preference',
    ]);
  });

  it('GET /api/feed - dùng sourceId tăng dần khi mọi khóa sắp xếp trước bằng nhau', async () => {
    const sameCreatedAt = new Date('2025-06-15T12:00:00.000Z');
    const testPosts = await Promise.all([
      createPost('Source ID tie 1', 'CLASS', academicIds, sameCreatedAt),
      createPost('Source ID tie 2', 'CLASS', academicIds, sameCreatedAt),
      createPost('Source ID tie 3', 'CLASS', academicIds, sameCreatedAt),
    ]);
    const expectedIds = testPosts.map((post) => post.id).sort((left, right) => left - right);

    try {
      const pageOne = await request(app)
        .get(
          `/api/feed?page=1&limit=2&category=COMMUNITY&search=${encodeURIComponent('Source ID tie')}`,
        )
        .set('Authorization', `Bearer ${token}`);
      const pageTwo = await request(app)
        .get(
          `/api/feed?page=2&limit=2&category=COMMUNITY&search=${encodeURIComponent('Source ID tie')}`,
        )
        .set('Authorization', `Bearer ${token}`);

      expect(pageOne.status).toBe(200);
      expect(pageTwo.status).toBe(200);
      expect(pageOne.body.meta.total).toBe(3);
      expect(pageOne.body.meta.totalPages).toBe(2);
      expect(pageTwo.body.meta.total).toBe(3);
      expect(pageOne.body.data.items.map((item: { sourceId: number }) => item.sourceId)).toEqual(
        expectedIds.slice(0, 2),
      );
      expect(pageTwo.body.data.items.map((item: { sourceId: number }) => item.sourceId)).toEqual(
        expectedIds.slice(2),
      );
      expect(
        [...pageOne.body.data.items, ...pageTwo.body.data.items].map(
          (item: { sourceId: number }) => item.sourceId,
        ),
      ).toEqual(expectedIds);
    } finally {
      await prisma.post.deleteMany({ where: { id: { in: testPosts.map((post) => post.id) } } });
    }
  });

  it('GET /api/feed - phân trang các luồng tổng hợp không trùng, không thiếu và trả tổng chính xác', async () => {
    await createPost('Class page 1', 'CLASS', academicIds);
    await createPost('Class page 2', 'CLASS', academicIds);
    await createPost('Course page 1', 'COURSE', academicIds);
    await prisma.campusPost.create({
      data: {
        authorId: userId,
        title: 'Campus page 1',
        content: `${fixtureKey} Campus page 1 content`,
        category: 'EVENT',
        status: 'PUBLISHED',
      },
    });

    const pages = await Promise.all(
      [1, 2, 3].map((page) =>
        request(app)
          .get(`/api/feed?page=${page}&limit=2&search=${encodeURIComponent(fixtureKey)}`)
          .set('Authorization', `Bearer ${token}`),
      ),
    );
    const allItems = pages.flatMap((page) => page.body.data.items);
    const allIds = allItems.map((item: { id: string }) => item.id);

    expect(pages.every((page) => page.body.meta.total === 4)).toBe(true);
    expect(pages.every((page) => page.body.meta.totalPages === 2)).toBe(true);
    expect(allItems).toHaveLength(4);
    expect(new Set(allIds).size).toBe(4);
    expect(allItems.map((item: { title: string }) => item.title).sort()).toEqual(
      ['Class page 1', 'Class page 2', 'Course page 1', 'Campus page 1'].sort(),
    );

    const pageOne = await request(app)
      .get(`/api/feed?page=1&limit=3&search=${encodeURIComponent(fixtureKey)}`)
      .set('Authorization', `Bearer ${token}`);
    const pageTwo = await request(app)
      .get(`/api/feed?page=2&limit=3&search=${encodeURIComponent(fixtureKey)}`)
      .set('Authorization', `Bearer ${token}`);
    const combined = [...pageOne.body.data.items, ...pageTwo.body.data.items].map(
      (item: { id: string }) => item.id,
    );
    expect(new Set(combined).size).toBe(4);
    expect(combined).toHaveLength(4);
  });

  it('GET /api/feed - giữ bộ lọc category, scope, search và preference', async () => {
    await createPost('Class searchable', 'CLASS', academicIds);
    await createPost('School searchable', 'SCHOOL', academicIds);
    await prisma.campusPost.create({
      data: {
        authorId: userId,
        title: 'Matching event',
        content: `${fixtureKey} Matching event content`,
        category: 'EVENT',
        status: 'PUBLISHED',
      },
    });

    const categoryResponse = await request(app)
      .get(`/api/feed?category=ACTIVITY&search=${encodeURIComponent(fixtureKey)}`)
      .set('Authorization', `Bearer ${token}`);
    expect(categoryResponse.body.data.items.map((item: { title: string }) => item.title)).toEqual([
      'Matching event',
    ]);

    const scopeResponse = await request(app)
      .get(`/api/feed?scope=FACULTY&search=${encodeURIComponent(fixtureKey)}`)
      .set('Authorization', `Bearer ${token}`);
    expect(scopeResponse.body.data.items.map((item: { title: string }) => item.title)).toEqual([
      'Class searchable',
      'School searchable',
      'Matching event',
    ]);

    const searchResponse = await request(app)
      .get(`/api/feed?search=${encodeURIComponent(`${fixtureKey} Matching`)}`)
      .set('Authorization', `Bearer ${token}`);
    expect(searchResponse.body.data.items.map((item: { title: string }) => item.title)).toEqual([
      'Matching event',
    ]);

    await prisma.userFeedPreference.update({
      where: { userId },
      data: { categories: 'COMMUNITY', scope: 'SCHOOL' },
    });
    const preferenceResponse = await request(app)
      .get(`/api/feed?search=${encodeURIComponent(fixtureKey)}`)
      .set('Authorization', `Bearer ${token}`);
    expect(preferenceResponse.body.data.items.map((item: { title: string }) => item.title)).toEqual(
      ['School searchable', 'Class searchable'],
    );
  });
});
